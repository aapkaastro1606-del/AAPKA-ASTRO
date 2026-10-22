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

    // Active booking if any (open states: PENDING_PAYMENT, PAYMENT_CLAIMED, CONFIRMED, SCHEDULED)
    const activeSession = sessions.find((s) =>
      ["PENDING_PAYMENT", "PAYMENT_CLAIMED", "CONFIRMED", "SCHEDULED"].includes(s.bookingStatus)
    );

    const confirmedAstroCount = sessions.filter(
      (s) => s.productType === "astro" && ["CONFIRMED", "SCHEDULED", "COMPLETED"].includes(s.bookingStatus)
    ).length;
    const isEligibleForFirstTimeDiscount = confirmedAstroCount === 0;

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
      isEligibleForFirstTimeDiscount,
      kundlis: savedKundlis.map((k) => {
        const chartData = (typeof k.chartDataJson === "object" && k.chartDataJson !== null ? k.chartDataJson : {}) as Record<string, any>;
        return {
          id: k.id,
          name: k.name || "Kundli",
          relation: k.relation || "Self",
          dateOfBirth: k.dob ? k.dob.toISOString() : "",
          dob: k.dob ? k.dob.toISOString() : "",
          timeOfBirth: k.timeOfBirth,
          placeOfBirth: k.placeOfBirth,
          gender: k.gender || "Male",
          rashi: chartData.rashi || chartData.moon_sign || null,
          nakshatra: chartData.nakshatra || null,
          lagna: chartData.lagna || chartData.ascendant || null,
          createdAt: k.createdAt.toISOString(),
        };
      }),
      consultations: sessions.map((s) => ({
        id: s.id,
        bookingId: s.bookingId || s.id,
        productName:
          s.productType === "vaastu"
            ? "Vaastu Shastra Consultation"
            : s.productType === "kundli_pdf"
            ? "Janam Kundli Full PDF Dossier"
            : "Vedic Astrology Consultation",
        format: s.format,
        durationMinutes: 30,
        amountPaid: s.lockedAmount || s.totalCost,
        status: s.bookingStatus,
        bookingStatus: s.bookingStatus,
        paymentStatus: s.paymentStatus,
        preferredDay: s.preferredDay,
        preferredTimeWindow: s.preferredTimeWindow,
        scheduledSlot: s.scheduledSlot || null,
        meetingLink: s.meetingLink,
        rejectionReason: s.rejectionReason,
        createdAt: s.createdAt.toISOString(),
      })),
      activeBooking: activeSession
        ? {
            id: activeSession.id,
            bookingId: activeSession.bookingId || activeSession.id,
            productName:
              activeSession.productType === "vaastu"
                ? "Vaastu Shastra Consultation"
                : activeSession.productType === "kundli_pdf"
                ? "Janam Kundli Full PDF Dossier"
                : "Vedic Astrology Consultation",
            format: activeSession.format,
            clientName: activeSession.userName || dbUser?.name || "Seeker",
            amountPaid: activeSession.lockedAmount || activeSession.totalCost,
            amount: activeSession.lockedAmount || activeSession.totalCost,
            bookingStatus: activeSession.bookingStatus,
            status: activeSession.bookingStatus,
            paymentStatus: activeSession.paymentStatus,
            preferredDay: activeSession.preferredDay,
            preferredTimeWindow: activeSession.preferredTimeWindow,
            scheduledSlot: activeSession.scheduledSlot,
            meetingLink: activeSession.meetingLink,
            rejectionReason: activeSession.rejectionReason,
            bookedAt: activeSession.createdAt.toISOString(),
            createdAt: activeSession.createdAt.toISOString(),
          }
        : null,
    });
  } catch (error: any) {
    console.error("Failed to load account data from database:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to load account data.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/account/data
 * Creates a saved Kundli record in PostgreSQL for the authenticated user.
 */
export async function POST(req: NextRequest) {
  const auth = await getServerAuthUser();

  if (!auth.isAuthenticated || !auth.userId) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Please sign in." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { name, relation = "Self", birthDate, birthTime, birthPlace, gender = "Male", lagna, rashi, nakshatra } = body;

    if (!name || !birthDate || !birthTime || !birthPlace) {
      return NextResponse.json(
        { success: false, message: "Name, birthDate, birthTime, and birthPlace are required." },
        { status: 400 }
      );
    }

    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: auth.userId }, { clerkId: auth.userId }],
      },
    });

    const targetUserId = dbUser ? dbUser.id : auth.userId;

    const record = await prisma.kundliRecord.create({
      data: {
        userId: targetUserId,
        name: name.trim(),
        relation,
        gender,
        dob: new Date(birthDate),
        timeOfBirth: birthTime,
        placeOfBirth: birthPlace,
        chartDataJson: {
          lagna: lagna || "Aries (Mesha)",
          rashi: rashi || "Leo (Simha)",
          nakshatra: nakshatra || "Magha",
        },
        isFreeChart: false,
      },
    });

    return NextResponse.json({
      success: true,
      kundli: {
        id: record.id,
        name: record.name,
        relation: record.relation,
        birthDate: record.dob.toISOString().split("T")[0],
        birthTime: record.timeOfBirth,
        birthPlace: record.placeOfBirth,
        gender: record.gender,
        lagna: (record.chartDataJson as any)?.lagna || "",
        rashi: (record.chartDataJson as any)?.rashi || "",
        nakshatra: (record.chartDataJson as any)?.nakshatra || "",
        createdAt: record.createdAt.toISOString(),
      },
    });
  } catch (err: any) {
    console.error("Failed to save Kundli:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to save Kundli record." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/account/data?id=...
 * Deletes a saved Kundli record owned by the authenticated user.
 */
export async function DELETE(req: NextRequest) {
  const auth = await getServerAuthUser();

  if (!auth.isAuthenticated || !auth.userId) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Please sign in." },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Kundli ID is required." },
        { status: 400 }
      );
    }

    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: auth.userId }, { clerkId: auth.userId }],
      },
    });

    const candidateUserIds = [auth.userId, ...(dbUser ? [dbUser.id] : [])];

    // Ensure user owns this Kundli before deleting
    const existing = await prisma.kundliRecord.findFirst({
      where: {
        id,
        userId: { in: candidateUserIds },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Record not found or unauthorized." },
        { status: 404 }
      );
    }

    await prisma.kundliRecord.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Kundli removed." });
  } catch (err: any) {
    console.error("Failed to delete Kundli:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to delete Kundli record." },
      { status: 500 }
    );
  }
}
