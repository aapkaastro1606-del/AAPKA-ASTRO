import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth/serverAuth";
import { isOwnerEmail } from "@/lib/auth/staffPermissions";
import { BookingWorkflowService } from "@/lib/services/bookingWorkflowService";

export const dynamic = "force-dynamic";

/**
 * GET/POST /api/cron/storage-retention
 * 90-day privacy retention cleanup job for payment screenshots.
 * Deletes images older than 90 days from private storage (R2/S3) and nulls references in database.
 * Protected by CRON_SECRET Bearer header or platform Owner session.
 */
async function handleRetention(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const bearerSecret = authHeader.replace(/^Bearer\s+/i, "").trim();
    const isCronAuthorized =
      Boolean(process.env.CRON_SECRET) && bearerSecret === process.env.CRON_SECRET;

    const auth = getAuthFromRequest(req);
    const isOwnerAuthorized = auth.isAuthenticated && isOwnerEmail(auth.email);

    if (!isCronAuthorized && !isOwnerAuthorized) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized: Valid CRON_SECRET or platform Owner session required.",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const customDays = parseInt(searchParams.get("days") || "90", 10);
    const retentionDays = isNaN(customDays) || customDays <= 0 ? 90 : customDays;

    const result = await BookingWorkflowService.cleanExpiredPaymentScreenshots(retentionDays);

    return NextResponse.json({
      success: true,
      message: `Successfully executed ${retentionDays}-day storage retention job.`,
      purgedCount: result.count,
      deletedKeys: result.deletedKeys,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Storage retention job error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to execute storage retention job." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return handleRetention(req);
}

export async function POST(req: NextRequest) {
  return handleRetention(req);
}
