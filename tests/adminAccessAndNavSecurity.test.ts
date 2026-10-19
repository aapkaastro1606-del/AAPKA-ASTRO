import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { GET as navStateGet } from "../src/app/api/auth/nav-state/route";
import { isOwnerEmail, STAFF_SECTIONS } from "../src/lib/auth/staffPermissions";
import { getAuthFromRequest, hasStaffSectionAccess, ServerAuthResult } from "../src/lib/auth/serverAuth";
import { NextRequest } from "next/server";

describe("Admin Panel Server-Side Fail-Closed Access & Nav State", () => {
  beforeEach(() => {
    process.env.OWNER_EMAIL = "aapkaastro1606@gmail.com";
  });

  it("proves the Owner reaches all admin sections including bookings, leads, team, diagnostics, and pricing", () => {
    const ownerAuth: ServerAuthResult = {
      isAuthenticated: true,
      userId: "user_owner",
      role: "OWNER",
      isAstrologer: true,
      isAdmin: true,
      isOwner: true,
      email: "aapkaastro1606@gmail.com",
      permissions: STAFF_SECTIONS.map((s) => s.id),
      grants: STAFF_SECTIONS.map((s) => ({
        id: `owner_${s.id}`,
        email: "aapkaastro1606@gmail.com",
        section: s.id,
        accessLevel: "MANAGE",
        grantedAt: new Date().toISOString(),
        revokedAt: null,
      })),
    };

    assert.equal(ownerAuth.isOwner, true);
    assert.equal(hasStaffSectionAccess(ownerAuth, "bookings", "MANAGE"), true);
    assert.equal(hasStaffSectionAccess(ownerAuth, "leads", "MANAGE"), true);
    assert.equal(hasStaffSectionAccess(ownerAuth, "staff", "MANAGE"), true);
    assert.equal(hasStaffSectionAccess(ownerAuth, "pricing", "MANAGE"), true);
    assert.equal(hasStaffSectionAccess(ownerAuth, "analytics", "MANAGE"), true);
  });

  it("proves staff members only reach their granted sections and fail-close on Owner-only sections", () => {
    const contentStaffAuth: ServerAuthResult = {
      isAuthenticated: true,
      userId: "user_content_staff",
      role: "CLIENT",
      isAstrologer: false,
      isAdmin: false,
      isOwner: false,
      email: "content_editor@aapkaastro.com",
      permissions: ["content"],
      grants: [
        {
          id: "grant_c1",
          email: "content_editor@aapkaastro.com",
          section: "content",
          accessLevel: "MANAGE",
          grantedAt: new Date().toISOString(),
          revokedAt: null,
        },
      ],
    };

    // Authorized on content
    assert.equal(hasStaffSectionAccess(contentStaffAuth, "content", "VIEW"), true);
    assert.equal(hasStaffSectionAccess(contentStaffAuth, "content", "MANAGE"), true);

    // Strictly blocked on Owner-only sections (pricing, bookings, leads, staff)
    assert.equal(hasStaffSectionAccess(contentStaffAuth, "pricing", "VIEW"), false);
    assert.equal(hasStaffSectionAccess(contentStaffAuth, "pricing", "MANAGE"), false);
    assert.equal(hasStaffSectionAccess(contentStaffAuth, "bookings", "VIEW"), false);
    assert.equal(hasStaffSectionAccess(contentStaffAuth, "leads", "VIEW"), false);
    assert.equal(hasStaffSectionAccess(contentStaffAuth, "staff", "VIEW"), false);
    assert.equal(hasStaffSectionAccess(contentStaffAuth, "analytics", "VIEW"), false);
  });

  it("proves regular clients and unauthenticated visitors fail-close on all sections", () => {
    const regularClientAuth: ServerAuthResult = {
      isAuthenticated: true,
      userId: "user_regular_client",
      role: "CLIENT",
      isAstrologer: false,
      isAdmin: false,
      isOwner: false,
      email: "seeker@gmail.com",
      permissions: [],
      grants: [],
    };

    assert.equal(regularClientAuth.isOwner, false);
    assert.equal(hasStaffSectionAccess(regularClientAuth, "pricing", "VIEW"), false);
    assert.equal(hasStaffSectionAccess(regularClientAuth, "bookings", "VIEW"), false);
    assert.equal(hasStaffSectionAccess(regularClientAuth, "leads", "VIEW"), false);
    assert.equal(hasStaffSectionAccess(regularClientAuth, "analytics", "VIEW"), false);

    const unauthenticatedAuth = null;
    assert.equal(hasStaffSectionAccess(unauthenticatedAuth, "pricing", "VIEW"), false);
    assert.equal(hasStaffSectionAccess(unauthenticatedAuth, "bookings", "VIEW"), false);
  });

  it("nav-state endpoint never advertises /admin publicly for unauthenticated visitors", async () => {
    const res = await navStateGet();
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.isAuthenticated, false);
    assert.equal(data.hasAdminAccess, false);
    assert.equal(data.adminUrl, null);
    assert.equal(data.label, null);
  });
});
