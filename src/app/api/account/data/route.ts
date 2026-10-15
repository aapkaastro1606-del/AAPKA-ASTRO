import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth/serverAuth";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/account/data
 * Fetches the authenticated user's database records:
 * - Profile and wallet balance
 * - Saved Janam Kundli charts from prisma.kundliRecord
 * - Consultation sessions and active booking from prisma.session
 * - Reviews submitted by the user from prisma.review
 */
export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req);

  if (!auth.isAuthenticated || !auth.userId) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Please sign in." },
      { status: 401 }
    );
  }

  try {
    // 1. User profile and wallet
    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: auth.userId },
          { clerkId: auth.userId },
        ],
      },
      include: { wallet: true },
    });

    // 2. Saved Kundlis for user
    const savedKundlis = await prisma.kundliRecord.findMany({
      where: {
        OR: [
          { userId: auth.userId },
          ...(dbUser ? [{ userId: dbUser.id }] : []),
          ...(dbUser?.phone ? [{ phone: dbUser.phone }] : []),
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    // 3. Consultation Sessions for user
    const sessions = await prisma.session.findMany({
      where: {
        OR: [
          { clientId: auth.userId },
          ...(dbUser ? [{ clientId: dbUser.id }] : []),
          ...(dbUser?.phone ? [{ userPhone: dbUser.phone }] : []),
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    // 4. Reviews submitted by user
    const reviews = await prisma.review.findMany({
      where: {
        OR: [
          { userId: auth.userId },
          ...(dbUser ? [{ userId: dbUser.id }] : []),
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    // Identify active booking (any session in WAITING or CONFIRMED state)
    const activeSession = sessions.find(
      (s) => s.paymentStatus === "AWAITING_VERIFICATION" || s.paymentStatus === "CONFIRMED" || s.status === "WAITING"
    );

    return NextResponse.json({
      success: true,
      profile: {
        id: dbUser?.id || auth.userId,
        name: dbUser?.name || "Seeker",
        email: dbUser?.email || auth.email || "",
        phone: dbUser?.phone || "",
        walletBalance: dbUser?.walletBalance || 0,
        role: dbUser?.role || auth.role || "CLIENT",
      },
      savedKundlis: savedKundlis.map((k) => ({
        id: k.id,
        name: k.name,
        relation: k.relation || "Self",
        birthDate: k.dob.toISOString().split("T")[0],
        birthTime: k.timeOfBirth,
        birthPlace: k.placeOfBirth,
        gender: k.gender,
        createdAt: k.createdAt.toISOString().split("T")[0],
      })),
      consultations: sessions.map((s) => ({
        id: s.id,
        bookingId: s.bookingId || s.id,
        service: s.productType === "vaastu" ? "Vaastu Shastra Consultation" : "Vedic Astrology Consultation",
        format: s.format,
        concern: s.concern,
        totalCost: s.totalCost,
        paymentStatus: s.paymentStatus,
        status: s.status,
        date: s.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        meetingLink: s.meetingLink,
      })),
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        service: r.service,
        date: r.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
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
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load account data." },
      { status: 500 }
    );
  }
}
