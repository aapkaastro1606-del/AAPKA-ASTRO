import { NextRequest, NextResponse } from "next/server";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import {
  StaffPermissionService,
  isOwnerEmail,
} from "@/lib/auth/staffPermissions";
import {
  STAFF_GRANTABLE_SECTIONS,
  isGrantableStaffSection,
  StaffSection,
} from "@/lib/auth/permissionPolicy";

/**
 * GET /api/admin/staff
 * Lists all staff members and their section permissions.
 * Strictly gated to platform Owner.
 */
export async function GET(req: NextRequest) {
  const auth = await getServerAuthUser();

  // Strictly gate to Owner
  if (!auth.isAuthenticated || (!auth.isOwner && auth.role !== "OWNER")) {
    return NextResponse.json(
      {
        success: false,
        message: "Forbidden: Platform Owner privilege required to manage staff permissions.",
      },
      { status: 403 }
    );
  }

  try {
    const staff = await StaffPermissionService.listStaffMembers();
    return NextResponse.json({
      success: true,
      staff,
      availableSections: STAFF_GRANTABLE_SECTIONS,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to list staff permissions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/staff
 * Sets or updates per-section permissions for an employee email.
 * Body: { email: string, sections: StaffSection[] }
 */
export async function POST(req: NextRequest) {
  const auth = await getServerAuthUser();

  if (!auth.isAuthenticated || (!auth.isOwner && auth.role !== "OWNER")) {
    return NextResponse.json(
      {
        success: false,
        message: "Forbidden: Platform Owner privilege required to manage staff permissions.",
      },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { email, sections } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, message: "Valid employee email is required." },
        { status: 400 }
      );
    }

    if (isOwnerEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "The platform owner has permanent, unrestricted access and cannot be assigned scoped permissions.",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(sections)) {
      return NextResponse.json(
        { success: false, message: "Sections must be provided as an array." },
        { status: 400 }
      );
    }

    // Strictly forbid assigning owner-only sections to staff (e.g. bookings, pricing, leads, staff)
    const invalidRequested = sections.filter((s: string) => !isGrantableStaffSection(s));
    if (invalidRequested.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot assign owner-only sections to staff: ${invalidRequested.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const sanitizedSections = sections.filter((s: string) =>
      isGrantableStaffSection(s)
    ) as StaffSection[];

    await StaffPermissionService.setPermissions(
      email,
      sanitizedSections,
      auth.email || "Owner"
    );

    const updatedStaff = await StaffPermissionService.listStaffMembers();

    return NextResponse.json({
      success: true,
      message: `Permissions updated successfully for ${email}`,
      staff: updatedStaff,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update staff permissions" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/staff
 * Revokes all section permissions for a staff member.
 * Query param: ?email=...
 */
export async function DELETE(req: NextRequest) {
  const auth = await getServerAuthUser();

  if (!auth.isAuthenticated || (!auth.isOwner && auth.role !== "OWNER")) {
    return NextResponse.json(
      {
        success: false,
        message: "Forbidden: Platform Owner privilege required to revoke staff permissions.",
      },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Target employee email is required as query param." },
        { status: 400 }
      );
    }

    if (isOwnerEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot revoke permissions for the platform owner.",
        },
        { status: 400 }
      );
    }

    await StaffPermissionService.revokeAll(email, auth.email || "Owner");

    const updatedStaff = await StaffPermissionService.listStaffMembers();

    return NextResponse.json({
      success: true,
      message: `All permissions revoked successfully for ${email}`,
      staff: updatedStaff,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to revoke staff permissions" },
      { status: 500 }
    );
  }
}
