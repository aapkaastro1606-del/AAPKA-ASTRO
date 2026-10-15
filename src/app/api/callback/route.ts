import { NextRequest, NextResponse } from "next/server";
import { ClientAccountStore } from "@/lib/store/clientAccountStore";
import { sanitizeString } from "@/lib/security/inputSanitizer";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientName, phone, topic, preferredSlot } = body;

    if (!clientName || !phone) {
      return NextResponse.json(
        { success: false, message: "Client name and contact information are required." },
        { status: 400 }
      );
    }

    const cleanName = sanitizeString(clientName);
    const cleanPhone = sanitizeString(phone);
    const cleanTopic = sanitizeString(topic || "General Astrological Guidance");
    const cleanSlot = sanitizeString(preferredSlot || "Anytime today");

    // 1. In-memory record
    const record = ClientAccountStore.requestCallback({
      clientName: cleanName,
      phone: cleanPhone,
      topic: cleanTopic,
      preferredSlot: cleanSlot,
    });

    // 2. Persist directly to Neon PostgreSQL database
    try {
      if (prisma && prisma.session) {
        // Find or create seeker user
        let user = await prisma.user.findFirst({ where: { phone: cleanPhone } });
        if (!user) {
          user = await prisma.user.create({
            data: {
              identifier: cleanPhone,
              name: cleanName,
              phone: cleanPhone,
              role: "CLIENT",
              walletBalance: 0,
            },
          });
        }

        await prisma.session.create({
          data: {
            bookingId: `CB-${Math.floor(100000 + Math.random() * 900000)}`,
            type: "VOICE",
            clientId: user.id,
            userName: cleanName,
            userPhone: cleanPhone,
            concern: cleanTopic,
            preferredSlot: cleanSlot,
            productType: "callback",
            format: "Voice Call",
            paymentMethod: "UPI_QR",
            paymentStatus: "CALLBACK_REQUEST",
            status: "WAITING",
            ratePerMin: 0,
            totalCost: 0,
          },
        });
      }
    } catch (dbErr) {
      console.error("Failed to persist callback lead to database:", dbErr);
    }

    return NextResponse.json({
      success: true,
      message:
        "Callback request registered with Acharya Ji's sanctum. We will notify you via WhatsApp/Email as soon as he is online.",
      data: record,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to submit callback request." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    if (prisma && prisma.session) {
      const dbCallbacks = await prisma.session.findMany({
        where: { paymentStatus: "CALLBACK_REQUEST" },
        orderBy: { createdAt: "desc" },
      });
      if (dbCallbacks.length > 0) {
        return NextResponse.json({
          success: true,
          requests: dbCallbacks.map((c) => ({
            id: c.id,
            clientName: c.userName || "Seeker",
            phone: c.userPhone || "",
            topic: c.concern || "",
            preferredSlot: c.preferredSlot || "",
            requestedAt: c.createdAt.toISOString(),
            status: c.status,
          })),
        });
      }
    }
  } catch (e) {
    console.warn("Could not query DB callbacks, using memory store:", e);
  }

  const requests = ClientAccountStore.getCallbackRequests();
  return NextResponse.json({ success: true, requests });
}
