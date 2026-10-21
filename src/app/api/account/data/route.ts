import { NextRequest, NextResponse } from "next/server";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/account/data
 * Personal seeker account data endpoint (Area 4: My account, my bookings, my Kundli).
 * Gated to authenticated user. Returns only their own data.
 */
export async function GET(req: NextRequest) {
  const auth = await getServerAuthUser();

  if (!auth.isAuthenticated) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Please sign in." },
      { status: 401 }
    );
  }

  try {
    const uid = auth.userId || "";

    // 1. User profile and wallet
    const dbUser = uid
      ? await prisma.user.findFirst({
          where: {
            OR: [{ id: uid }, { clerkId: uid }],
          },
        })
      : null;

    // 2. Saved Kundlis for user
    const savedKundlis = await prisma.kundliRecord.findMany({
      where: {
        OR: [
          ...(uid ? [{ userId: uid }] : []),
          ...(dbUser?.id ? [{ userId: dbUser.id }] : []),
          ...(dbUser?.phone ? [{ phone: dbUser.phone }] : []),
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    // 3. Consultation Sessions for user
    const sessions = await prisma.session.findMany({
      where: {
        OR: [
          ...(uid ? [{ clientId: uid }] : []),
          ...(dbUser?.id ? [{ clientId: dbUser.id }] : []),
          ...(auth.email ? [{ userEmail: auth.email }] : []),
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    // Active booking if any
    const activeSession = sessions.find(
      (s) => s.bookingStatus === "CONFIRMED" || s.bookingStatus === "PAYMENT_CLAIMED"
    );

    const userPayload = {
      id: dbUser?.id || auth.userId || "user_unknown",
      email: dbUser?.email || auth.email || "",
      name: dbUser?.name || (auth.email ? auth.email.split("@")[0] : "Seeker"),
      phone: dbUser?.phone || null,
      role: dbUser?.role || auth.role || "CLIENT",
      walletBalance: dbUser?.walletBalance || 0,
      createdAt: dbUser?.createdAt ? dbUser.createdAt.toISOString() : new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      user: userPayload,
      profile: userPayload,
      kundlis: savedKundlis.map((k) => {
        const chartData = (typeof k.chartDataJson === "object" && k.chartDataJson !== null ? k.chartDataJson : {}) as Record<string, any>;
        return {
          id: k.id,
          name: k.name || "Kundli",
          dateOfBirth: k.dob ? k.dob.toISOString() : "",
          dob: k.dob ? k.dob.toISOString() : "",
          timeOfBirth: k.timeOfBirth,
          placeOfBirth: k.placeOfBirth,
          rashi: chartData.rashi || chartData.moon_sign || null,
          nakshatra: chartData.nakshatra || null,
          lagna: chartData.lagna || chartData.ascendant || null,
          createdAt: k.createdAt.toISOString(),
        };
      }),
      consultations: sessions.map((s) => ({
        id: s.id,
        bookingId: s.bookingId || s.id,
        productName: s.productType === "vaastu" ? "Vaastu Shastra Consultation" : "Vedic Astrology Consultation",
        format: s.format,
        durationMinutes: 30,
        amountPaid: s.totalCost,
        status: s.bookingStatus,
        paymentStatus: s.paymentStatus,
        preferredDay: s.preferredDay,
        preferredTimeWindow: s.preferredTimeWindow,
        scheduledSlot: s.scheduledSlot || null,
        meetingLink: s.meetingLink,
        createdAt: s.createdAt.toISOString(),
      })),
      activeBooking: activeSession
        ? {
            bookingId: activeSession.bookingId || activeSession.id,
            productName: activeSession.productType === "vaastu" ? "Vaastu Shastra Consultation" : "Vedic Astrology Consultation",
            format: activeSession.format,
            clientName: activeSession.userName || dbUser?.name || "Seeker",
            amountPaid: activeSession.totalCost,
            status: activeSession.paymentStatus === "AWAITING_VERIFICATION" ? "AWAITING_VERIFICATION" : "CONFIRMED",
            bookedAt: activeSession.createdAt.toISOString(),
            meetingLink: activeSession.meetingLink,
          }
        : null,
    });
  } catch (error: any) {
    console.error("Failed to load account data from database:", error);
    // Graceful fallback when database is offline or degraded
    const fallbackUser = {
      id: auth.userId || "user_offline",
      email: auth.email || "",
      name: auth.email ? auth.email.split("@")[0] : "Seeker",
      role: auth.role || "CLIENT",
      walletBalance: 0,
      createdAt: new Date().toISOString(),
    };
    return NextResponse.json({
      success: true,
      user: fallbackUser,
      profile: fallbackUser,
      kundlis: [],
      consultations: [],
      activeBooking: null,
      databaseStatus: "degraded",
    });
  }
}
