import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth/serverAuth";
import { prisma } from "@/lib/db/prisma";
import { PlatformSettingsService } from "@/lib/services/platformSettingsService";

export const dynamic = "force-dynamic";

/**
 * GET /api/booking/status?bookingId=...
 * Retrieves current booking status, schedule, meeting link, and intake summary.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req);
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
          createdAt: booking.createdAt,
          expiresAt: booking.expiresAt,
        },
        paymentSettings,
      });
    }

    // Otherwise, return latest active booking for authenticated user
    if (!auth.isAuthenticated || !auth.userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required to fetch user bookings." },
        { status: 401 }
      );
    }

    const latestBooking = await prisma.session.findFirst({
      where: {
        OR: [
          { clientId: auth.userId },
          { userEmail: auth.email || "" },
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
            createdAt: latestBooking.createdAt,
            expiresAt: latestBooking.expiresAt,
          }
        : null,
      paymentSettings,
    });
  } catch (error: any) {
    console.error("Booking status fetch error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load booking status." },
      { status: 500 }
    );
  }
}
