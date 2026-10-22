import { NextRequest, NextResponse } from "next/server";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import { prisma } from "@/lib/db/prisma";
import { PlatformSettingsService } from "@/lib/services/platformSettingsService";

export const dynamic = "force-dynamic";

/**
 * GET /api/booking/status?bookingId=...
 * Retrieves current booking status, schedule, meeting link, and intake summary.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get("bookingId");

    if (bookingId) {
      const booking = await prisma.session.findUnique({
        where: { bookingId },
        include: { client: { select: { name: true, email: true, phone: true } } },
      });

      if (!booking) {
        return NextResponse.json(
          { success: false, message: "Booking not found." },
          { status: 404 }
        );
      }

      const paymentSettings = await PlatformSettingsService.getPaymentSettings();

      return NextResponse.json({
        success: true,
        booking: {
          id: booking.id,
          bookingId: booking.bookingId,
          userName: booking.userName,
          userPhone: booking.userPhone,
          userEmail: booking.userEmail,
          productType: booking.productType,
          format: booking.format,
          concern: booking.concern,
          amount: booking.lockedAmount || booking.totalCost,
          isFirstTimeAstro: booking.isFirstTimeAstro,
          bookingStatus: booking.bookingStatus,
          paymentStatus: booking.paymentStatus,
          utr: booking.utr,
          preferredDay: booking.preferredDay,
          preferredTimeWindow: booking.preferredTimeWindow,
          scheduledSlot: booking.scheduledSlot,
          meetingLink: booking.meetingLink,
          rejectionReason: booking.rejectionReason,
          intakeDetails: booking.intakeDetails,
          hasScreenshot: Boolean(booking.paymentScreenshotUrl),
          createdAt: booking.createdAt,
          expiresAt: booking.expiresAt,
        },
        paymentSettings,
        storageUploadEnabled: Boolean(
          process.env.STORAGE_PROVIDER && ["r2", "s3"].includes(process.env.STORAGE_PROVIDER.toLowerCase())
        ),
      });
    }

    // Resolve user via Clerk server session, cookie auth, or query param fallback
    let userIdentifier: string | null = null;
    let userEmailAddress: string | null = null;

    try {
      const clerkAuth = await getServerAuthUser();
      if (clerkAuth.isAuthenticated && clerkAuth.userId) {
        userIdentifier = clerkAuth.userId;
        userEmailAddress = clerkAuth.email;
      }
    } catch {
      // ignore
    }

    // Unauthenticated query string overrides are strictly disabled for privacy

    if (!userIdentifier && !userEmailAddress) {
      return NextResponse.json(
        { success: false, message: "Authentication required to fetch user bookings." },
        { status: 401 }
      );
    }

    // Match database user by ID, Clerk ID, or Email
    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          ...(userIdentifier ? [{ id: userIdentifier }, { clerkId: userIdentifier }] : []),
          ...(userEmailAddress ? [{ email: userEmailAddress }] : []),
        ],
      },
    });

    const candidateClientIds = [
      ...(userIdentifier ? [userIdentifier] : []),
      ...(dbUser ? [dbUser.id] : []),
    ];

    const latestBooking = await prisma.session.findFirst({
      where: {
        OR: [
          { clientId: { in: candidateClientIds } },
          ...(userEmailAddress ? [{ userEmail: userEmailAddress }] : []),
          ...(dbUser?.email ? [{ userEmail: dbUser.email }] : []),
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    const paymentSettings = await PlatformSettingsService.getPaymentSettings();

    return NextResponse.json({
      success: true,
      booking: latestBooking
        ? {
            id: latestBooking.id,
            bookingId: latestBooking.bookingId,
            userName: latestBooking.userName,
            userPhone: latestBooking.userPhone,
            userEmail: latestBooking.userEmail,
            productType: latestBooking.productType,
            format: latestBooking.format,
            concern: latestBooking.concern,
            amount: latestBooking.lockedAmount || latestBooking.totalCost,
            isFirstTimeAstro: latestBooking.isFirstTimeAstro,
            bookingStatus: latestBooking.bookingStatus,
            paymentStatus: latestBooking.paymentStatus,
            utr: latestBooking.utr,
            preferredDay: latestBooking.preferredDay,
            preferredTimeWindow: latestBooking.preferredTimeWindow,
            scheduledSlot: latestBooking.scheduledSlot,
            meetingLink: latestBooking.meetingLink,
            rejectionReason: latestBooking.rejectionReason,
            intakeDetails: latestBooking.intakeDetails,
            hasScreenshot: Boolean(latestBooking.paymentScreenshotUrl),
            createdAt: latestBooking.createdAt,
            expiresAt: latestBooking.expiresAt,
          }
        : null,
      paymentSettings,
      storageUploadEnabled: Boolean(
        process.env.STORAGE_PROVIDER && ["r2", "s3"].includes(process.env.STORAGE_PROVIDER.toLowerCase())
      ),
    });
  } catch (error: any) {
    console.error("Booking status fetch error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load booking status." },
      { status: 500 }
    );
  }
}
