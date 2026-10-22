import { NextRequest, NextResponse } from "next/server";
import { hasStaffSectionAccess, getServerAuthUser } from "@/lib/auth/serverAuth";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await getServerAuthUser();

  if (!auth.isAuthenticated) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const isAuthorized =
    auth.isOwner ||
    auth.role === "ASTROLOGER" ||
    hasStaffSectionAccess(auth, "clients", "VIEW");

  if (!isAuthorized) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  try {
    // 1. Fetch sessions
    const sessions = await prisma.session.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // 2. Fetch free & saved kundli leads
    const kundliRecords = await prisma.kundliRecord.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    // 3. Format unified clients list
    const clientsMap = new Map<string, any>();

    // Process sessions first
    for (const s of sessions) {
      const phone = s.userPhone || s.client?.phone || "";
      const name = s.userName || s.client?.name || "Seeker";
      const key = phone || s.clientId || s.id;

      if (!clientsMap.has(key)) {
        clientsMap.set(key, {
          id: s.id,
          name,
          phone: phone || "No Phone Provided",
          email: s.userEmail || s.client?.email || "",
          type: "CONSULTATION",
          totalSessions: 1,
          totalSpend: s.paymentStatus === "CONFIRMED" || s.paymentStatus === "COMPLETED" ? `₹${s.totalCost}` : "Pending Verification",
          lastConsulted: new Date(s.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          primaryConcern: s.concern || (s.productType === "vaastu" ? "Vaastu Shastra Consultation" : "Vedic Astrology Consultation"),
          format: s.format,
          paymentStatus: s.paymentStatus,
          bookingId: s.bookingId,
          meetingLink: s.meetingLink,
          preferredSlot: s.preferredSlot,
          notes: s.notes || (s.paymentScreenshotUrl ? "Payment screenshot uploaded via WhatsApp" : ""),
        });
      } else {
        const existing = clientsMap.get(key);
        existing.totalSessions += 1;
      }
    }

    // Process Kundli leads
    for (const k of kundliRecords) {
      const phone = k.phone || "";
      const key = phone || `kundli-${k.id}`;

      if (!clientsMap.has(key)) {
        let lagna = "";
        let rashi = "";
        try {
          const chart = k.chartDataJson as any;
          lagna = chart?.ascendant?.rashiName || "";
          rashi = chart?.moonSign || "";
        } catch {}

        clientsMap.set(key, {
          id: `kundli-${k.id}`,
          name: k.name,
          phone: phone || "Free Kundli Seeker",
          email: k.email || "",
          type: "FREE_KUNDLI_LEAD",
          totalSessions: 0,
          totalSpend: "Free Kundli Lead",
          lastConsulted: new Date(k.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          lagna,
          rashi,
          primaryConcern: `Free Janam Kundli generated for ${k.placeOfBirth}`,
          notes: `DOB: ${new Date(k.dob).toLocaleDateString("en-IN")} ${k.timeOfBirth}. Birth Place: ${k.placeOfBirth}`,
        });
      }
    }

    const clientList = Array.from(clientsMap.values());

    return NextResponse.json({
      success: true,
      clients: clientList,
      totalCount: clientList.length,
    });
  } catch (error: any) {
    console.error("Failed to load clients & leads:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load CRM data" },
      { status: 500 }
    );
  }
}
