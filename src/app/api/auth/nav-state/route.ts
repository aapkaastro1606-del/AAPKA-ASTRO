import { NextResponse } from "next/server";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

/**
 * /api/auth/nav-state
 * Server-authoritative endpoint to determine navigation links.
 * Dictates whether the "Admin Panel" or "Staff Desk" link should be shown,
 * ensuring /admin is never advertised publicly to visitors or standard clients.
 * Also reports first-time discount eligibility so repeat clients see standard pricing.
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
        isEligibleForFirstTimeDiscount: true,
      });
    }

    let isEligibleForFirstTimeDiscount = true;
    try {
      if (prisma && (auth.userId || auth.email)) {
        const cleanEmail = auth.email?.trim().toLowerCase();
        const confirmedCount = await prisma.session.count({
          where: {
            productType: "astro",
            bookingStatus: { in: ["CONFIRMED", "SCHEDULED", "COMPLETED"] },
            OR: [
              ...(auth.userId ? [{ clientId: auth.userId }] : []),
              ...(auth.dbUserId ? [{ clientId: auth.dbUserId }] : []),
              ...(cleanEmail ? [{ userEmail: cleanEmail }] : []),
            ],
          },
        });
        isEligibleForFirstTimeDiscount = confirmedCount === 0;
      }
    } catch {
      isEligibleForFirstTimeDiscount = true;
    }

    // Platform Owner
    if (auth.isOwner) {
      return NextResponse.json({
        isAuthenticated: true,
        isOwner: true,
        hasAdminAccess: true,
        adminUrl: "/admin",
        label: "Admin Panel",
        isEligibleForFirstTimeDiscount,
      });
    }

    // Staff with admin section permissions
    if (auth.permissions.length > 0) {
      return NextResponse.json({
        isAuthenticated: true,
        isOwner: false,
        hasAdminAccess: true,
        adminUrl: "/admin",
        label: "Admin Panel",
        isEligibleForFirstTimeDiscount,
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
        isEligibleForFirstTimeDiscount,
      });
    }

    // Standard Client - no admin access
    return NextResponse.json({
      isAuthenticated: true,
      isOwner: false,
      hasAdminAccess: false,
      adminUrl: null,
      label: null,
      isEligibleForFirstTimeDiscount,
    });
  } catch (err: any) {
    return NextResponse.json({
      isAuthenticated: false,
      isOwner: false,
      hasAdminAccess: false,
      adminUrl: null,
      label: null,
      isEligibleForFirstTimeDiscount: true,
    });
  }
}
