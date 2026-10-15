import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth/serverAuth";
import { isOwnerEmail } from "@/lib/auth/staffPermissions";
import { KundliLeadService } from "@/lib/services/kundliLeadService";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/leads/export
 * Owner-Only CSV export for free Kundli leads.
 * Automatically audit-logs the export event with actor email and timestamp.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req);

    if (!auth.isAuthenticated || !isOwnerEmail(auth.email)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Owner privilege required." },
        { status: 403 }
      );
    }

    const csvContent = await KundliLeadService.exportLeadsCsv(
      auth.email || "owner@aapkaastro.com"
    );

    const filename = `aapka-astro-kundli-leads-${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error: any) {
    console.error("[API /api/admin/leads/export] CSV Export Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to generate CSV export." },
      { status: 500 }
    );
  }
}
