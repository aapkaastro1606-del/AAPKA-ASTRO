import { NextRequest, NextResponse } from "next/server";
import { getServerAuthUser, hasStaffSectionAccess } from "@/lib/auth/serverAuth";
import { isOwnerEmail } from "@/lib/auth/staffPermissions";
import { AnalyticsService } from "@/lib/services/analyticsService";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/analytics
 * Returns authentic, real-time platform revenue and performance telemetry.
 * Strictly restricted to Platform Owner or staff with 'analytics' VIEW permission.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await getServerAuthUser();

    if (!auth.isAuthenticated) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const isAuthorized =
      auth.isOwner ||
      isOwnerEmail(auth.email) ||
      hasStaffSectionAccess(auth, "analytics", "VIEW");

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Owner or Analytics permission required." },
        { status: 403 }
      );
    }

    const analytics = await AnalyticsService.getRealAnalytics();
    return NextResponse.json({ success: true, analytics });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to load analytics" },
      { status: 500 }
    );
  }
}
