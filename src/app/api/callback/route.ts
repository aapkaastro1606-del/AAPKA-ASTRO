import { NextRequest, NextResponse } from "next/server";
import { sanitizeString } from "@/lib/security/inputSanitizer";
import { prisma } from "@/lib/db/prisma";
import { getServerAuthUser } from "@/lib/auth/serverAuth";

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

    // Persist callback lead directly to Neon PostgreSQL database
    let sessionId: string = `CB-${Math.floor(100000 + Math.random() * 900000)}`;

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

        const session = await prisma.session.create({
          data: {
            bookingId: sessionId,
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
            bookingStatus: "PENDING_PAYMENT",
            status: "WAITING",
            ratePerMin: 0,
            totalCost: 0,
          },
        });
        sessionId = session.bookingId || session.id;
      }
    } catch (dbErr) {
      console.error("Failed to persist callback lead to database:", dbErr);
      return NextResponse.json(
        { success: false, message: "Failed to record callback request in database." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Callback request confirmed! Our Acharya team will reach out via WhatsApp/Phone.",
      record: {
        id: sessionId,
        clientName: cleanName,
        phone: cleanPhone,
        topic: cleanTopic,
        preferredSlot: cleanSlot,
        requestedAt: new Date().toISOString(),
        status: "WAITING",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to process callback request" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const auth = await getServerAuthUser();
  if (!auth.isAuthenticated || !auth.isOwner) {
    return NextResponse.json(
      { success: false, message: "Forbidden: Owner access required." },
      { status: 403 }
    );
  }

  try {
    if (prisma && prisma.session) {
      const dbCallbacks = await prisma.session.findMany({
        where: { paymentStatus: "CALLBACK_REQUEST" },
        orderBy: { createdAt: "desc" },
      });
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
    return NextResponse.json({ success: true, requests: [] });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e.message || "Could not query callbacks" },
      { status: 500 }
    );
  }
}
