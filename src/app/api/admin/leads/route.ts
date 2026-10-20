import { NextRequest, NextResponse } from "next/server";
import { getOwnerEmail, resolveRequestAuth } from "@/lib/auth/serverAuth";
import { isOwnerEmail } from "@/lib/auth/staffPermissions";
import { KundliLeadService } from "@/lib/services/kundliLeadService";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/leads
 * Owner-Only Leads query endpoint.
 * Supports search, date range filters, and pagination.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await resolveRequestAuth(req);

    if (!auth.isAuthenticated || !isOwnerEmail(auth.email)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Owner privilege required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const page = Number(searchParams.get("page")) || 1;
    const pageSize = Number(searchParams.get("pageSize")) || 25;

    const result = await KundliLeadService.getLeads({
      search,
      startDate,
      endDate,
      page,
      pageSize,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("[API /api/admin/leads] Error fetching leads:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch leads." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/leads
 * Owner-Only delete-on-request endpoint.
 * Exercises seeker's Right to Erasure / withdrawal of consent under DPDP/GDPR.
 * Logs action and previous state in PostgreSQL AuditLog.
 */
export async function DELETE(req: NextRequest) {
  try {
    const auth = await resolveRequestAuth(req);

    if (!auth.isAuthenticated || !isOwnerEmail(auth.email)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Owner privilege required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { leadId, reason } = body;

    if (!leadId) {
      return NextResponse.json(
        { success: false, message: "Lead ID is required." },
        { status: 400 }
      );
    }

    const result = await KundliLeadService.deleteLead(
      leadId,
      auth.email || getOwnerEmail(),
      reason
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[API /api/admin/leads] Error deleting lead:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete lead." },
      { status: 500 }
    );
  }
}
