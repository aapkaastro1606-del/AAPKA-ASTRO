import { NextRequest, NextResponse } from "next/server";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import {
  StaffPermissionService,
  STAFF_SECTIONS,
  StaffSection,
  isOwnerEmail,
} from "@/lib/auth/staffPermissions";

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
      availableSections: STAFF_SECTIONS,
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
        message: "Forbidden: Platform Owner privilege required to configure staff permissions.",
      },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { email, sections } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Valid employee email is required." },
        { status: 400 }
      );
    }

    if (!Array.isArray(sections)) {
      return NextResponse.json(
        { success: false, message: "Sections must be provided as an array." },
        { status: 400 }
      );
    }

    // Filter valid section IDs
    const validSectionIds = STAFF_SECTIONS.map((s) => s.id);
    const sanitizedSections = sections.filter((s: string) =>
      validSectionIds.includes(s as StaffSection)
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
 * Revokes all staff permissions for a given email.
 * Body: { email: string } or Query: ?email=...
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
    let email = req.nextUrl.searchParams.get("email");
    if (!email) {
      const body = await req.json().catch(() => ({}));
      email = body.email;
    }

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required to revoke permissions." },
        { status: 400 }
      );
    }

    if (isOwnerEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Cannot revoke permissions for the platform Owner account." },
        { status: 400 }
      );
    }

    await StaffPermissionService.revokeStaff(email);
    const updatedStaff = await StaffPermissionService.listStaffMembers();

    return NextResponse.json({
      success: true,
      message: `Permissions successfully revoked for ${email}`,
      staff: updatedStaff,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to revoke staff permissions" },
      { status: 500 }
    );
  }
}
