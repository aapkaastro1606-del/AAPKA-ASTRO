import { NextRequest, NextResponse } from "next/server";
import { InstagramSyncService } from "@/lib/services/instagramSyncService";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  // 1. Strict CRON_SECRET verification
  const authHeader = req.headers.get("authorization");
  const querySecret = req.nextUrl.searchParams.get("secret");
  const cronSecret = process.env.CRON_SECRET;

  const isAuthorized =
    Boolean(cronSecret) &&
    (authHeader === `Bearer ${cronSecret}` || querySecret === cronSecret);

  if (!isAuthorized) {
    console.warn(`[CRON /api/cron/instagram-sync] Unauthorized invocation attempt from IP: ${req.headers.get("x-forwarded-for") || "unknown"}`);
    return NextResponse.json(
      { success: false, message: "Unauthorized cron execution: CRON_SECRET required." },
      { status: 401 }
    );
  }

  try {
    const result = await InstagramSyncService.syncMedia();

    console.info(`[CRON Instagram Sync Success]: Synced ${result.syncedCount} items at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
      message: `Successfully synchronized ${result.syncedCount} Instagram media items. Panchang graphic detected: ${result.panchangFound}`,
    });
  } catch (err: any) {
    console.error("[Cron Instagram Sync Error - Preserving Existing Media]:", err);
    // On failure, preserve and keep serving previous day's data gracefully
    return NextResponse.json(
      {
        success: true,
        fallbackActive: true,
        message: "Instagram sync failed; continuing to serve previous media entries.",
        error: err?.message || "Sync exception",
      },
      { status: 200 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
