import { NextResponse } from "next/server";
import { getServerAuthUser } from "@/lib/auth/serverAuth";

export const dynamic = "force-dynamic";

/**
 * /api/auth/nav-state
 * Server-authoritative endpoint to determine navigation links.
 * Dictates whether the "Admin Panel" or "Staff Desk" link should be shown,
 * ensuring /admin is never advertised publicly to visitors or standard clients.
 */
export async function GET() {
  try {
    const auth = await getServerAuthUser();

    if (!auth.isAuthenticated) {
      return NextResponse.json({
        isAuthenticated: false,
        isOwner: false,
        hasAdminAccess: false,
        adminUrl: null,
        label: null,
      });
    }

    // Platform Owner
    if (auth.isOwner) {
      return NextResponse.json({
        isAuthenticated: true,
        isOwner: true,
        hasAdminAccess: true,
        adminUrl: "/admin/bookings",
        label: "Admin Panel",
      });
    }

    // Staff with admin section permissions
    const hasPricing = auth.permissions.includes("pricing");
    const hasAnalytics = auth.permissions.includes("analytics");
    const hasStaff = auth.permissions.includes("staff");

    if (hasPricing || hasAnalytics || hasStaff) {
      const adminUrl = hasPricing
        ? "/admin/pricing"
        : hasAnalytics
        ? "/admin/analytics"
        : "/admin/staff";

      return NextResponse.json({
        isAuthenticated: true,
        isOwner: false,
        hasAdminAccess: true,
        adminUrl,
        label: "Staff Desk",
      });
    }

    // Staff with operator/dashboard permissions
    if (auth.permissions.length > 0 || auth.role === "ASTROLOGER") {
      return NextResponse.json({
        isAuthenticated: true,
        isOwner: false,
        hasAdminAccess: true,
        adminUrl: "/dashboard",
        label: "Operator Desk",
      });
    }

    // Standard Client - no admin access
    return NextResponse.json({
      isAuthenticated: true,
      isOwner: false,
      hasAdminAccess: false,
      adminUrl: null,
      label: null,
    });
  } catch (err: any) {
    return NextResponse.json({
      isAuthenticated: false,
      isOwner: false,
      hasAdminAccess: false,
      adminUrl: null,
      label: null,
    });
  }
}
