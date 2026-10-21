import { NextRequest, NextResponse } from "next/server";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import { isOwnerEmail } from "@/lib/auth/staffPermissions";
import { prisma } from "@/lib/db/prisma";
import { BookingWorkflowService } from "@/lib/services/bookingWorkflowService";
import { AuditLogService } from "@/lib/services/auditLogService";
import { storageProvider } from "@/lib/providers/storage";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/bookings
 * Owner Verification Queue — lists bookings filtered by status with all intake metadata,
 * UTRs, first-time status, and audit trails.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await getServerAuthUser();

    if (!auth.isAuthenticated || !isOwnerEmail(auth.email)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Owner privilege required." },
        { status: 403 }
      );
    }

    // Auto-expire overdue unpaid bookings
    await BookingWorkflowService.expireUnpaidBookings();

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status") || "ALL";
    const search = searchParams.get("search")?.trim() || "";

    const whereClause: any = {};

    if (statusFilter !== "ALL") {
      whereClause.bookingStatus = statusFilter;
    }

    if (search) {
      whereClause.OR = [
        { bookingId: { contains: search, mode: "insensitive" } },
        { userName: { contains: search, mode: "insensitive" } },
        { userPhone: { contains: search } },
        { userEmail: { contains: search, mode: "insensitive" } },
        { utr: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch counts across key status tabs
    const [
      totalCount,
      claimedCount,
      pendingCount,
      confirmedCount,
      scheduledCount,
      completedCount,
      rejectedCount,
    ] = await Promise.all([
      prisma.session.count(),
      prisma.session.count({ where: { bookingStatus: "PAYMENT_CLAIMED" } }),
      prisma.session.count({ where: { bookingStatus: "PENDING_PAYMENT" } }),
      prisma.session.count({ where: { bookingStatus: "CONFIRMED" } }),
      prisma.session.count({ where: { bookingStatus: "SCHEDULED" } }),
      prisma.session.count({ where: { bookingStatus: "COMPLETED" } }),
      prisma.session.count({ where: { bookingStatus: "REJECTED" } }),
    ]);

    const bookings = await prisma.session.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const recentLogs = await AuditLogService.getRecentLogs(20);

    return NextResponse.json({
      success: true,
      counts: {
        ALL: totalCount,
        PAYMENT_CLAIMED: claimedCount,
        PENDING_PAYMENT: pendingCount,
        CONFIRMED: confirmedCount,
        SCHEDULED: scheduledCount,
        COMPLETED: completedCount,
        REJECTED: rejectedCount,
      },
      bookings: await Promise.all(
        bookings.map(async (b) => {
          let signedScreenshotUrl: string | null = null;
          if (b.paymentScreenshotUrl) {
            try {
              signedScreenshotUrl = await storageProvider.getSignedDownloadUrl(b.paymentScreenshotUrl, 900);
            } catch (e) {
              console.warn(`Failed to generate signed screenshot URL for ${b.bookingId}:`, e);
            }
          }

          return {
            id: b.id,
            bookingId: b.bookingId,
            clientId: b.clientId,
            userName: b.userName,
            userPhone: b.userPhone,
            userEmail: b.userEmail,
            productType: b.productType,
            format: b.format,
            concern: b.concern,
            amount: b.lockedAmount || b.totalCost,
            isFirstTimeAstro: b.isFirstTimeAstro,
            bookingStatus: b.bookingStatus,
            paymentStatus: b.paymentStatus,
            bankCreditConfirmed: b.bankCreditConfirmed,
            utr: b.utr,
            paymentScreenshotUrl: signedScreenshotUrl,
            preferredDay: b.preferredDay,
            preferredTimeWindow: b.preferredTimeWindow,
            scheduledSlot: b.scheduledSlot,
            meetingLink: b.meetingLink,
            approvedAt: b.approvedAt,
            approvedBy: b.approvedBy,
            rejectionReason: b.rejectionReason,
            refundedAt: b.refundedAt,
            refundNotes: b.refundNotes,
            intakeDetails: b.intakeDetails,
            emailStatus: (b.intakeDetails as any)?.emailStatus || (b.notes?.includes("[EMAIL_FAILED]") ? "FAILED" : null),
            emailError: (b.intakeDetails as any)?.emailError || null,
            createdAt: b.createdAt,
            expiresAt: b.expiresAt,
          };
        })
      ),
      recentLogs,
    });
  } catch (error: any) {
    console.error("Owner bookings queue error:", error);
    return NextResponse.json({
      success: true,
      counts: {
        ALL: 0,
        PAYMENT_CLAIMED: 0,
        PENDING_PAYMENT: 0,
        CONFIRMED: 0,
        SCHEDULED: 0,
        COMPLETED: 0,
        REJECTED: 0,
      },
      bookings: [],
      recentLogs: [],
      databaseStatus: "degraded",
    });
  }
}

/**
 * POST /api/admin/bookings
 * Owner Verification Queue Actions:
 * - action === "approve": Confirm bank credit and approve payment
 * - action === "schedule": Set confirmed time slot and meeting link
 * - action === "complete": Mark consultation completed
 * - action === "reject": Reject with mandatory reason
 * - action === "refund": Mark refunded with notes
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await getServerAuthUser();

    if (!auth.isAuthenticated || !isOwnerEmail(auth.email)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Owner privilege required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, bookingId, bankCreditConfirmed, scheduledSlot, meetingLink, reason, notes } = body;

    if (!bookingId || !action) {
      return NextResponse.json(
        { success: false, message: "bookingId and action are required." },
        { status: 400 }
      );
    }

    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
    const userAgent = req.headers.get("user-agent");
    const actorEmail = auth.email!;
    const actorId = auth.userId || undefined;

    switch (action) {
      case "approve": {
        const result = await BookingWorkflowService.approveBooking({
          bookingId,
          actorEmail,
          actorId,
          bankCreditConfirmed: Boolean(bankCreditConfirmed),
          ipAddress,
          userAgent,
        });
        return NextResponse.json(result);
      }

      case "schedule": {
        const result = await BookingWorkflowService.scheduleBooking({
          bookingId,
          scheduledSlot,
          meetingLink,
          actorEmail,
          actorId,
          ipAddress,
          userAgent,
        });
        return NextResponse.json(result);
      }

      case "complete": {
        const result = await BookingWorkflowService.completeBooking({
          bookingId,
          actorEmail,
          actorId,
          ipAddress,
          userAgent,
        });
        return NextResponse.json(result);
      }

      case "reject": {
        const result = await BookingWorkflowService.rejectBooking({
          bookingId,
          reason,
          actorEmail,
          actorId,
          ipAddress,
          userAgent,
        });
        return NextResponse.json(result);
      }

      case "refund": {
        const result = await BookingWorkflowService.refundBooking({
          bookingId,
          notes,
          actorEmail,
          actorId,
          ipAddress,
          userAgent,
        });
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json(
          { success: false, message: `Unknown action: "${action}"` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("Owner queue action error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to execute booking action." },
      { status: 400 }
    );
  }
}
