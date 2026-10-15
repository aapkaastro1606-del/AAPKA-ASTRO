import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { evaluateRouteAccess } from "../src/lib/auth/roles";
import {
  StaffPermissionService,
  hasSectionAccess,
  hasSectionPermission,
  STAFF_SECTIONS,
} from "../src/lib/auth/staffPermissions";
import { NextRequest } from "next/server";
import {
  GET as teamGet,
  POST as teamPost,
  DELETE as teamDelete,
} from "../src/app/api/admin/team/route";

describe("Team Access Management - Server-Side Owner-Only Route Access", () => {
  test("unauthenticated visitor requesting /admin/team is redirected to /login", () => {
    const access = evaluateRouteAccess("/admin/team", null, false);
    assert.strictEqual(access.allowed, false);
    if (!access.allowed) {
      assert.match(access.redirectUrl, /^\/login\?redirect_url=%2Fadmin%2Fteam/);
    }
  });

  test("regular client requesting /admin/team is rejected and redirected to /account", () => {
    const access = evaluateRouteAccess(
      "/admin/team",
      "CLIENT",
      true,
      [],
      "seeker@gmail.com"
    );
    assert.strictEqual(access.allowed, false);
    if (!access.allowed) {
      assert.strictEqual(access.redirectUrl, "/account");
    }
  });

  test("staff member with MANAGE access to other sections is strictly rejected from /admin/team", () => {
    // Employee with MANAGE access on blog, reels, and pricing
    const access = evaluateRouteAccess(
      "/admin/team",
      "CLIENT",
      true,
      ["blog", "reels", "pricing"],
      "content_lead@aapkaastro.com"
    );
    assert.strictEqual(access.allowed, false);
    if (!access.allowed) {
      assert.strictEqual(access.redirectUrl, "/dashboard");
      assert.match(access.reason, /Owner privilege strictly required/i);
    }
  });

  test("admin role without owner email is rejected from /admin/team", () => {
    const access = evaluateRouteAccess(
      "/admin/team",
      "ADMIN",
      true,
      ["*"],
      "generaladmin@vendor.com"
    );
    assert.strictEqual(access.allowed, false);
    if (!access.allowed) {
      assert.strictEqual(access.redirectUrl, "/dashboard");
      assert.match(access.reason, /Owner privilege strictly required/i);
    }
  });

  test("platform Owner has unrestricted access to /admin/team", () => {
    const access = evaluateRouteAccess(
      "/admin/team",
      "OWNER",
      true,
      [],
      "aapkaastro1606@gmail.com"
    );
    assert.strictEqual(access.allowed, true);
  });
});

describe("Team Access Management - Section & Access Level Logic (VIEW vs MANAGE)", () => {
  test("hasSectionAccess correctly evaluates VIEW and MANAGE access levels", () => {
    const staffUser = {
      email: "writer@aapkaastro.com",
      role: "CLIENT",
      grants: [
        { section: "blog" as const, accessLevel: "MANAGE" as const },
        { section: "reels" as const, accessLevel: "VIEW" as const },
      ],
    };

    // Blog has MANAGE: satisfies both VIEW and MANAGE
    assert.strictEqual(hasSectionAccess(staffUser, "blog", "VIEW"), true);
    assert.strictEqual(hasSectionAccess(staffUser, "blog", "MANAGE"), true);

    // Reels has VIEW only: satisfies VIEW, but NOT MANAGE
    assert.strictEqual(hasSectionAccess(staffUser, "reels", "VIEW"), true);
    assert.strictEqual(hasSectionAccess(staffUser, "reels", "MANAGE"), false);

    // Pricing has no grant: fails both
    assert.strictEqual(hasSectionAccess(staffUser, "pricing", "VIEW"), false);
    assert.strictEqual(hasSectionAccess(staffUser, "pricing", "MANAGE"), false);
  });

  test("Owner unconditionally passes all section and access-level checks", () => {
    const ownerUser = {
      email: "aapkaastro1606@gmail.com",
      role: "OWNER",
    };

    for (const sec of STAFF_SECTIONS) {
      assert.strictEqual(hasSectionAccess(ownerUser, sec.id, "MANAGE"), true);
      assert.strictEqual(hasSectionAccess(ownerUser, sec.id, "VIEW"), true);
    }
  });
});

describe("Team Access Management - Service CRUD & Audit Log Engine", () => {
  const testStaffEmail = "analyst_new@aapkaastro.com";

  test("Owner can invite staff member by granting a section with access level", async () => {
    const grant = await StaffPermissionService.grantSection(
      testStaffEmail,
      "analytics",
      "VIEW",
      "usr_owner_001",
      "Platform Owner"
    );

    assert.ok(grant);
    assert.strictEqual(grant.email, testStaffEmail);
    assert.strictEqual(grant.section, "analytics");
    assert.strictEqual(grant.accessLevel, "VIEW");
    assert.strictEqual(grant.grantedByUserId, "usr_owner_001");
    assert.strictEqual(grant.revokedAt, null);
    assert.ok(grant.grantedAt);

    const activeSections = await StaffPermissionService.getPermissionsForEmail(testStaffEmail);
    assert.ok(activeSections.includes("analytics"));
  });

  test("Owner can grant a second section with MANAGE access level", async () => {
    const grant = await StaffPermissionService.grantSection(
      testStaffEmail,
      "blog",
      "MANAGE",
      "usr_owner_001",
      "Platform Owner"
    );

    assert.ok(grant);
    assert.strictEqual(grant.section, "blog");
    assert.strictEqual(grant.accessLevel, "MANAGE");

    const grants = await StaffPermissionService.getGrantsForEmail(testStaffEmail);
    assert.strictEqual(grants.length, 2);
  });

  test("Owner can revoke an existing grant, marking revokedAt", async () => {
    const grantsBefore = await StaffPermissionService.getGrantsForEmail(testStaffEmail);
    const blogGrant = grantsBefore.find((g) => g.section === "blog");
    assert.ok(blogGrant);

    const success = await StaffPermissionService.revokeGrant(blogGrant.id, "usr_owner_001");
    assert.strictEqual(success, true);

    // Blog should no longer be in active permissions
    const activeSections = await StaffPermissionService.getPermissionsForEmail(testStaffEmail);
    assert.strictEqual(activeSections.includes("blog"), false);
    assert.strictEqual(activeSections.includes("analytics"), true);
  });

  test("Audit log records who granted what, to whom, and when (pulling from grantedByUserId/grantedAt/revokedAt)", async () => {
    const logs = await StaffPermissionService.listAuditLogs();
    assert.ok(Array.isArray(logs));
    assert.ok(logs.length > 0);

    // Find the grant log for testStaffEmail
    const grantLog = logs.find(
      (l) => l.targetEmail === testStaffEmail && l.action === "GRANTED" && l.section === "analytics"
    );
    assert.ok(grantLog, "Grant log for analytics must exist");
    assert.strictEqual(grantLog.grantedByUserId, "usr_owner_001");
    assert.strictEqual(grantLog.accessLevel, "VIEW");
    assert.ok(grantLog.grantedAt);

    // Find the revoke log for testStaffEmail (blog)
    const revokeLog = logs.find(
      (l) => l.targetEmail === testStaffEmail && l.action === "REVOKED" && l.section === "blog"
    );
    assert.ok(revokeLog, "Revocation log for blog must exist");
    assert.ok(revokeLog.revokedAt);
    assert.strictEqual(revokeLog.revokedByUserId, "usr_owner_001");
  });
});

describe("Team Access Management - API Endpoint Security (/api/admin/team)", () => {
  test("GET /api/admin/team returns 403 Forbidden for staff with MANAGE access to other sections", async () => {
    // Mock user with MANAGE on blog & pricing, but not Owner
    const nonOwnerStaff = {
      id: "usr_staff_888",
      email: "manager@aapkaastro.com",
      role: "CLIENT",
      permissions: ["blog", "pricing"],
    };

    const req = new NextRequest("http://localhost:3000/api/admin/team", {
      headers: {
        cookie: `aapka_astro_mock_user=${encodeURIComponent(JSON.stringify(nonOwnerStaff))}`,
      },
    });

    const res = await teamGet(req);
    assert.strictEqual(res.status, 403);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.message, /Forbidden.*Owner/i);
  });

  test("GET /api/admin/team returns 200 OK with staff and audit logs for Owner", async () => {
    const ownerUser = {
      id: "usr_owner_001",
      email: "aapkaastro1606@gmail.com",
      role: "OWNER",
    };

    const req = new NextRequest("http://localhost:3000/api/admin/team", {
      headers: {
        cookie: `aapka_astro_mock_user=${encodeURIComponent(JSON.stringify(ownerUser))}`,
      },
    });

    const res = await teamGet(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.staff));
    assert.ok(Array.isArray(data.auditLogs));
    assert.ok(Array.isArray(data.availableSections));
  });

  test("POST /api/admin/team allows Owner to invite a staff member with access level", async () => {
    const ownerUser = {
      id: "usr_owner_001",
      email: "aapkaastro1606@gmail.com",
      role: "OWNER",
    };

    const req = new NextRequest("http://localhost:3000/api/admin/team", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: `aapka_astro_mock_user=${encodeURIComponent(JSON.stringify(ownerUser))}`,
      },
      body: JSON.stringify({
        email: "curator_new@aapkaastro.com",
        section: "reels",
        accessLevel: "MANAGE",
      }),
    });

    const res = await teamPost(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.match(data.message, /Granted MANAGE access for reels/i);
  });

  test("DELETE /api/admin/team allows Owner to revoke access", async () => {
    const ownerUser = {
      id: "usr_owner_001",
      email: "aapkaastro1606@gmail.com",
      role: "OWNER",
    };

    const req = new NextRequest(
      "http://localhost:3000/api/admin/team?email=curator_new%40aapkaastro.com&section=reels",
      {
        method: "DELETE",
        headers: {
          cookie: `aapka_astro_mock_user=${encodeURIComponent(JSON.stringify(ownerUser))}`,
        },
      }
    );

    const res = await teamDelete(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
  });
});
