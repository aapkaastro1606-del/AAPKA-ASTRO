import { NextRequest, NextResponse } from "next/server";
import { resolveRequestAuth } from "@/lib/auth/serverAuth";
import {
  StaffPermissionService,
  STAFF_SECTIONS,
  StaffSection,
  AccessLevel,
  isOwnerEmail,
} from "@/lib/auth/staffPermissions";

/**
 * GET /api/admin/team
 * Returns:
 * 1. Current staff members with their granted sections & access levels (VIEW / MANAGE)
 * 2. Audit logs pulling from grantedByUserId, grantedAt, and revokedAt
 * Strictly Owner-only. Rejects anyone else (including staff with MANAGE access to other sections).
 */
export async function GET(req: NextRequest) {
  const auth = await resolveRequestAuth(req);

  // Strictly gate to platform Owner
  if (!auth.isAuthenticated || !auth.isOwner) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Forbidden: Platform Owner privilege strictly required for team access management.",
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
      availableSections: STAFF_SECTIONS.filter((s) => s.id !== "staff"),
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
 * Invites a staff member by email and/or grants a new section+access-level.
 * Body: { email: string, section: StaffSection, accessLevel?: "VIEW" | "MANAGE" }
 * Strictly Owner-only.
 */
export async function POST(req: NextRequest) {
  const auth = await resolveRequestAuth(req);

  if (!auth.isAuthenticated || !auth.isOwner) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Forbidden: Platform Owner privilege strictly required to invite staff or grant access.",
      },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { email, section, accessLevel = "MANAGE" } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
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
          message: "The platform Owner already possesses unconditional access to all sections.",
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

    // Gated sections: 'staff' cannot be delegated to non-owners
    if (section === "staff") {
      return NextResponse.json(
        { success: false, message: "The staff administration console cannot be delegated." },
        { status: 400 }
      );
    }

    const validSectionIds = STAFF_SECTIONS.map((s) => s.id);
    if (!validSectionIds.includes(section as StaffSection)) {
      return NextResponse.json(
        { success: false, message: `Invalid section '${section}'.` },
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
      message: `Granted ${validLevel} access for ${section} to ${normalizedEmail}. If not yet registered, they will immediately inherit this upon signing up via Clerk.`,
      grant,
      staff: updatedStaff,
      auditLogs: updatedAuditLogs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to grant team access." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/team
 * Revokes a specific grant or all access for a staff member.
 * Body or Query: { grantId?: string, email?: string, section?: string }
 * Strictly Owner-only. Sets revokedAt and revokedByUserId.
 */
export async function DELETE(req: NextRequest) {
  const auth = await resolveRequestAuth(req);

  if (!auth.isAuthenticated || !auth.isOwner) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Forbidden: Platform Owner privilege strictly required to revoke team access.",
      },
      { status: 403 }
    );
  }

  try {
    let grantId = req.nextUrl.searchParams.get("grantId");
    let email = req.nextUrl.searchParams.get("email");
    let section = req.nextUrl.searchParams.get("section");

    if (!grantId && !email) {
      const body = await req.json().catch(() => ({}));
      grantId = body.grantId;
      email = body.email;
      section = body.section;
    }

    const actorId = auth.userId || auth.email || "Owner";

    if (email && isOwnerEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Cannot revoke permissions for the platform Owner account." },
        { status: 400 }
      );
    }

    if (grantId) {
      await StaffPermissionService.revokeGrant(grantId, actorId);
    } else if (email && section) {
      await StaffPermissionService.revokeGrantBySection(email, section as StaffSection, actorId);
    } else if (email) {
      await StaffPermissionService.revokeStaff(email, actorId);
    } else {
      return NextResponse.json(
        { success: false, message: "Either grantId or email is required to revoke access." },
        { status: 400 }
      );
    }

    const updatedStaff = await StaffPermissionService.listStaffMembers();
    const updatedAuditLogs = await StaffPermissionService.listAuditLogs();

    return NextResponse.json({
      success: true,
      message: "Access successfully revoked and recorded in audit log.",
      staff: updatedStaff,
      auditLogs: updatedAuditLogs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to revoke team access." },
      { status: 500 }
    );
  }
}
