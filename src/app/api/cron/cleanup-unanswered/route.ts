import { NextRequest, NextResponse } from "next/server";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import { isOwnerEmail } from "@/lib/auth/staffPermissions";
import { cleanupExpiredUnansweredQuestions } from "@/lib/assistant/retriever";

export const dynamic = "force-dynamic";

/**
 * GET/POST /api/cron/cleanup-unanswered
 * 30-day retention purge job for logged unanswered assistant questions.
 * Removes all query records older than 30 days to enforce user privacy and minimize database bloat.
 * Protected by CRON_SECRET Bearer header or platform Owner session.
 */
async function handleCleanup(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const bearerSecret = authHeader.replace(/^Bearer\s+/i, "").trim();
    const isCronAuthorized =
      Boolean(process.env.CRON_SECRET) && bearerSecret === process.env.CRON_SECRET;

    const auth = await getServerAuthUser();
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

    const purgedCount = await cleanupExpiredUnansweredQuestions();

    return NextResponse.json({
      success: true,
      message: "Successfully executed 30-day unanswered questions retention cleanup.",
      purgedCount,
      retentionDays: 30,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Unanswered questions retention cleanup error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to execute unanswered questions retention cleanup.",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return handleCleanup(req);
}

export async function POST(req: NextRequest) {
  return handleCleanup(req);
}
