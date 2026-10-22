import { NextRequest, NextResponse } from "next/server";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import { isOwnerEmail } from "@/lib/auth/staffPermissions";
import { KundliLeadService } from "@/lib/services/kundliLeadService";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/leads
 * Owner-Only endpoint to fetch, search, filter, and paginate Kundli Leads.
 * Area 2: Payment settings, pricing, leads, team, diagnostics, legal pages (Owner: Yes, Staff: No, Client: No).
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
      {
        success: false,
        message: error.message || "Failed to fetch leads.",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/leads
 * GDPR / DPDP Article 12 Right to Erasure implementation.
 * Strictly gated to Platform Owner.
 */
export async function DELETE(req: NextRequest) {
  try {
    const auth = await getServerAuthUser();

    if (!auth.isAuthenticated || !isOwnerEmail(auth.email)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Owner privilege required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id") || searchParams.get("leadId");
    let reason: string | undefined;

    if (!id) {
      try {
        const body = await req.json();
        id = body?.leadId || body?.id;
        reason = body?.reason;
      } catch {
        // No JSON body provided
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing lead ID." },
        { status: 400 }
      );
    }

    const deleted = await KundliLeadService.deleteLead(
      id,
      auth.email || "Owner",
      reason || `IP: ${req.headers.get("x-forwarded-for") || "unknown"}`
    );

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Lead not found or already deleted." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Kundli lead permanently erased under DPDP Right to Erasure.",
    });
  } catch (error: any) {
    console.error("[API /api/admin/leads] Error deleting lead:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete lead." },
      { status: 500 }
    );
  }
}
