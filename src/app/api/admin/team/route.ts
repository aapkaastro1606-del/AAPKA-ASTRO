import { NextRequest, NextResponse } from "next/server";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import {
  StaffPermissionService,
  isOwnerEmail,
  AccessLevel,
} from "@/lib/auth/staffPermissions";
import {
  STAFF_GRANTABLE_SECTIONS,
  isGrantableStaffSection,
  StaffSection,
} from "@/lib/auth/permissionPolicy";

/**
 * GET /api/admin/team
 * Returns the roster of team members, their active section grants,
 * and the complete audit trail of grants and revocations.
 * Strictly gated to the Platform Owner.
 */
export async function GET(req: NextRequest) {
  const auth = await getServerAuthUser();

  if (!auth.isAuthenticated || (!auth.isOwner && auth.role !== "OWNER")) {
    return NextResponse.json(
      {
        success: false,
        message: "Forbidden: Platform Owner privilege required to view team permissions.",
      },
      { status: 403 }
    );
  }

  try {
    const staff = await StaffPermissionService.listStaffMembers();
    const auditLogs = await StaffPermissionService.listAuditLogs();

    return NextResponse.json({
      success: true,
      staff,
      auditLogs,
      availableSections: STAFF_GRANTABLE_SECTIONS,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load team data." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/team
 * Grants a new section permission or updates access level for a team member.
 * Strictly gated to the Platform Owner.
 * Body: { email: string, section: StaffSection, accessLevel?: "VIEW" | "MANAGE" }
 */
export async function POST(req: NextRequest) {
  const auth = await getServerAuthUser();

  if (!auth.isAuthenticated || (!auth.isOwner && auth.role !== "OWNER")) {
    return NextResponse.json(
      {
        success: false,
        message: "Forbidden: Platform Owner privilege required to grant team permissions.",
      },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { email, section, accessLevel } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, message: "Valid employee email is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (isOwnerEmail(normalizedEmail)) {
      return NextResponse.json(
        {
          success: false,
          message: "The platform owner holds permanent unrestricted access and cannot receive individual scoped grants.",
        },
        { status: 400 }
      );
    }

    if (!section || typeof section !== "string") {
      return NextResponse.json(
        { success: false, message: "Valid section identifier is required." },
        { status: 400 }
      );
    }

    // Owner-only sections (bookings, pricing, staff, leads, analytics) cannot be delegated
    if (!isGrantableStaffSection(section)) {
      return NextResponse.json(
        {
          success: false,
          message: `Section '${section}' is strictly reserved for the Platform Owner and cannot be assigned to staff.`,
        },
        { status: 400 }
      );
    }

    const validLevel: AccessLevel = accessLevel === "VIEW" ? "VIEW" : "MANAGE";
    const actorId = auth.userId || auth.email || "Owner";
    const actorLabel = auth.email || "Platform Owner";

    const grant = await StaffPermissionService.grantSection(
      normalizedEmail,
      section as StaffSection,
      validLevel,
      actorId,
      actorLabel
    );

    const updatedStaff = await StaffPermissionService.listStaffMembers();
    const updatedAuditLogs = await StaffPermissionService.listAuditLogs();

    return NextResponse.json({
      success: true,
      message: `Granted ${validLevel} access for ${section} to ${normalizedEmail}.`,
      grant,
      staff: updatedStaff,
      auditLogs: updatedAuditLogs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to grant section permission." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/team
 * Revokes a team member's access.
 * If ?grantId=... is provided, revokes that specific section grant.
 * If ?email=... is provided, revokes all grants for that user.
 * Strictly gated to the Platform Owner.
 */
export async function DELETE(req: NextRequest) {
  const auth = await getServerAuthUser();

  if (!auth.isAuthenticated || (!auth.isOwner && auth.role !== "OWNER")) {
    return NextResponse.json(
      {
        success: false,
        message: "Forbidden: Platform Owner privilege required to revoke team permissions.",
      },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const grantId = searchParams.get("grantId");
    const email = searchParams.get("email");
    const section = searchParams.get("section");

    const actorId = auth.userId || auth.email || "Owner";

    if (grantId) {
      await StaffPermissionService.revokeGrant(grantId, actorId);
      const updatedStaff = await StaffPermissionService.listStaffMembers();
      const updatedAuditLogs = await StaffPermissionService.listAuditLogs();
      return NextResponse.json({
        success: true,
        message: `Grant '${grantId}' has been revoked.`,
        staff: updatedStaff,
        auditLogs: updatedAuditLogs,
      });
    }

    if (email && section) {
      await StaffPermissionService.revokeGrantBySection(email, section as StaffSection, actorId);
      const updatedStaff = await StaffPermissionService.listStaffMembers();
      const updatedAuditLogs = await StaffPermissionService.listAuditLogs();
      return NextResponse.json({
        success: true,
        message: `Section '${section}' revoked for ${email}.`,
        staff: updatedStaff,
        auditLogs: updatedAuditLogs,
      });
    }

    if (email) {
      if (isOwnerEmail(email)) {
        return NextResponse.json(
          { success: false, message: "Cannot revoke permissions for the platform owner." },
          { status: 400 }
        );
      }

      await StaffPermissionService.revokeAll(email, actorId);
      const updatedStaff = await StaffPermissionService.listStaffMembers();
      const updatedAuditLogs = await StaffPermissionService.listAuditLogs();
      return NextResponse.json({
        success: true,
        message: `All access revoked for ${email}.`,
        staff: updatedStaff,
        auditLogs: updatedAuditLogs,
      });
    }

    return NextResponse.json(
      { success: false, message: "Either 'grantId' or 'email' parameter is required." },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to revoke permission." },
      { status: 500 }
    );
  }
}
