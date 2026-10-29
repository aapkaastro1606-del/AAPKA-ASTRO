import { NextRequest, NextResponse } from "next/server";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import { isOwnerEmail } from "@/lib/auth/staffPermissions";
import { LiveTvSettingsService } from "@/lib/services/liveTvSettingsService";
import { checkAdminRateLimit } from "@/lib/admin/rateLimitAndValidation";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/live-tv
 * Owner-only endpoint to inspect TV broadcast settings, status, and reconfirmation metrics.
 */
export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateLimit = checkAdminRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    const auth = await getServerAuthUser();
    if (!auth.isAuthenticated || !isOwnerEmail(auth.email)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Owner privilege required." },
        { status: 403 }
      );
    }

    const settings = await LiveTvSettingsService.getSettings();
    const status = await LiveTvSettingsService.getStatus();

    return NextResponse.json({
      success: true,
      settings,
      status,
    });
  } catch (error: any) {
    console.error("GET /api/admin/live-tv error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load TV settings." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/live-tv
 * Owner-only endpoint to update TV broadcast settings or reconfirm on-air status.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateLimit = checkAdminRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    const auth = await getServerAuthUser();
    if (!auth.isAuthenticated || !isOwnerEmail(auth.email)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Owner privilege required." },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Check for monthly reconfirmation action
    if (body.action === "reconfirm") {
      const updated = await LiveTvSettingsService.reconfirm(auth.email || "owner@aapkaastro.com");
      const status = await LiveTvSettingsService.getStatus();
      return NextResponse.json({
        success: true,
        message: "Successfully reconfirmed Kaal Ki Chaal is active on air.",
        settings: updated,
        status,
      });
    }

    const updated = await LiveTvSettingsService.updateSettings(
      body,
      auth.email || "owner@aapkaastro.com"
    );
    const status = await LiveTvSettingsService.getStatus();

    return NextResponse.json({
      success: true,
      message: "TV broadcast settings updated successfully.",
      settings: updated,
      status,
    });
  } catch (error: any) {
    console.error("POST /api/admin/live-tv error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update TV settings." },
      { status: 500 }
    );
  }
}
