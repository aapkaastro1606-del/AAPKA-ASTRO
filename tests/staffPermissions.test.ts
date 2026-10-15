import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  isOwnerEmail,
  hasSectionPermission,
  StaffPermissionService,
  STAFF_SECTIONS,
  StaffSection,
} from "../src/lib/auth/staffPermissions";
import { evaluateRouteAccess } from "../src/lib/auth/roles";
import { NextRequest } from "next/server";
import {
  GET as staffGet,
  POST as staffPost,
  DELETE as staffDelete,
} from "../src/app/api/admin/staff/route";

describe("Site Owner Recognition Engine", () => {
  test("isOwnerEmail correctly identifies configured owner emails (case-insensitive)", () => {
    assert.strictEqual(isOwnerEmail("aapkaastro1606@gmail.com"), true);
    assert.strictEqual(isOwnerEmail("AAPKAASTRO1606@GMAIL.COM"), true);
  });

  test("isOwnerEmail returns false for non-owner accounts and falsy values", () => {
    assert.strictEqual(isOwnerEmail("editor@aapkaastro.com"), false);
    assert.strictEqual(isOwnerEmail("seeker@gmail.com"), false);
    assert.strictEqual(isOwnerEmail("hacker@malicious.com"), false);
    assert.strictEqual(isOwnerEmail(null), false);
    assert.strictEqual(isOwnerEmail(undefined), false);
    assert.strictEqual(isOwnerEmail(""), false);
  });
});

describe("Per-Section Staff Permissions Evaluation", () => {
  test("Owner account has unrestricted access to all sections including 'staff'", () => {
    const ownerUser = {
      email: "aapkaastro1606@gmail.com",
      role: "ADMIN",
      permissions: [],
    };

    for (const sec of STAFF_SECTIONS) {
      assert.strictEqual(
        hasSectionPermission(ownerUser, sec.id),
        true,
        `Owner must have access to ${sec.id}`
      );
    }
  });

  test("Regular seeker (CLIENT with no permissions) has access to NO staff sections", () => {
    const clientUser = {
      email: "seeker@gmail.com",
      role: "CLIENT",
      permissions: [],
    };

    for (const sec of STAFF_SECTIONS) {
      assert.strictEqual(
        hasSectionPermission(clientUser, sec.id),
        false,
        `Client must NOT have access to ${sec.id}`
      );
    }
  });

  test("Staff member with scoped 'blog' permission can only access blog", () => {
    const blogEditor = {
      email: "writer@aapkaastro.com",
      role: "CLIENT",
      permissions: ["blog" as StaffSection],
    };

    assert.strictEqual(hasSectionPermission(blogEditor, "blog"), true);
    assert.strictEqual(hasSectionPermission(blogEditor, "reels"), false);
    assert.strictEqual(hasSectionPermission(blogEditor, "clients"), false);
    assert.strictEqual(hasSectionPermission(blogEditor, "earnings"), false);
    assert.strictEqual(hasSectionPermission(blogEditor, "pricing"), false);
    assert.strictEqual(hasSectionPermission(blogEditor, "staff"), false);
  });

  test("Staff member with 'reels' permission can only access reels curation", () => {
    const reelCurator = {
      email: "curator@aapkaastro.com",
      role: "CLIENT",
      permissions: ["reels" as StaffSection],
    };

    assert.strictEqual(hasSectionPermission(reelCurator, "reels"), true);
    assert.strictEqual(hasSectionPermission(reelCurator, "blog"), false);
    assert.strictEqual(hasSectionPermission(reelCurator, "staff"), false);
  });

  test("The 'staff' management console cannot be accessed by non-owner even if role is ADMIN without owner email", () => {
    const regularAdmin = {
      email: "thirdpartyadmin@vendor.com",
      role: "ADMIN",
      permissions: ["*"],
    };

    // 'staff' is strictly Owner-only
    assert.strictEqual(hasSectionPermission(regularAdmin, "staff"), false);
    // But other sections are accessible
    assert.strictEqual(hasSectionPermission(regularAdmin, "blog"), true);
    assert.strictEqual(hasSectionPermission(regularAdmin, "pricing"), true);
  });
});

describe("Route-Level Access Control for Scoped Staff", () => {
  test("Employee with 'blog' permission is allowed into /dashboard/blog", () => {
    const access = evaluateRouteAccess(
      "/dashboard/blog",
      "CLIENT",
      true,
      ["blog"],
      "writer@aapkaastro.com"
    );
    assert.strictEqual(access.allowed, true);
  });

  test("Employee with only 'blog' permission is blocked from /dashboard/reels and redirected to /dashboard", () => {
    const access = evaluateRouteAccess(
      "/dashboard/reels",
      "CLIENT",
      true,
      ["blog"],
      "writer@aapkaastro.com"
    );
    assert.strictEqual(access.allowed, false);
    if (!access.allowed) {
      assert.strictEqual(access.redirectUrl, "/dashboard");
      assert.match(access.reason, /reels permission/i);
    }
  });

  test("Employee with 'blog' permission can access base /dashboard hub", () => {
    const access = evaluateRouteAccess(
      "/dashboard",
      "CLIENT",
      true,
      ["blog"],
      "writer@aapkaastro.com"
    );
    assert.strictEqual(access.allowed, true);
  });

  test("Employee with 'pricing' permission can access /admin/pricing", () => {
    const access = evaluateRouteAccess(
      "/admin/pricing",
      "CLIENT",
      true,
      ["pricing"],
      "manager@aapkaastro.com"
    );
    assert.strictEqual(access.allowed, true);
  });

  test("Employee with 'pricing' permission is blocked from /admin/staff", () => {
    const access = evaluateRouteAccess(
      "/admin/staff",
      "CLIENT",
      true,
      ["pricing"],
      "manager@aapkaastro.com"
    );
    assert.strictEqual(access.allowed, false);
    if (!access.allowed) {
      assert.strictEqual(access.redirectUrl, "/dashboard");
      assert.match(access.reason, /Owner privilege strictly required/i);
    }
  });

  test("Owner account has full access to /admin/staff", () => {
    const access = evaluateRouteAccess(
      "/admin/staff",
      "ADMIN",
      true,
      STAFF_SECTIONS.map((s) => s.id),
      "aapkaastro1606@gmail.com"
    );
    assert.strictEqual(access.allowed, true);
  });
});

describe("StaffPermissionService Lifecycle (CRUD & Memory Fallback)", () => {
  const testStaffEmail = "marketing_intern@aapkaastro.com";

  test("setting permissions for staff email grants targeted sections", async () => {
    const success = await StaffPermissionService.setPermissions(
      testStaffEmail,
      ["blog", "reels"],
      "Owner"
    );
    assert.strictEqual(success, true);

    const perms = await StaffPermissionService.getPermissionsForEmail(testStaffEmail);
    assert.ok(perms.includes("blog"));
    assert.ok(perms.includes("reels"));
    assert.strictEqual(perms.includes("earnings"), false);
  });

  test("updating permissions replaces previous section grants", async () => {
    await StaffPermissionService.setPermissions(
      testStaffEmail,
      ["reels"],
      "Owner"
    );

    const perms = await StaffPermissionService.getPermissionsForEmail(testStaffEmail);
    assert.ok(perms.includes("reels"));
    assert.strictEqual(perms.includes("blog"), false);
  });

  test("revoking permissions clears all section grants", async () => {
    const revoked = await StaffPermissionService.revokeStaff(testStaffEmail);
    assert.strictEqual(revoked, true);

    const perms = await StaffPermissionService.getPermissionsForEmail(testStaffEmail);
    assert.strictEqual(perms.length, 0);
  });

  test("cannot revoke platform Owner account", async () => {
    const revoked = await StaffPermissionService.revokeStaff("aapkaastro1606@gmail.com");
    assert.strictEqual(revoked, false);
  });
});

describe("Staff Permissions Admin API (/api/admin/staff)", () => {
  test("GET /api/admin/staff returns 403 Forbidden for non-owner / client", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/staff", {
      headers: {
        cookie: "aapka_astro_session=active; aapka_astro_role=CLIENT",
      },
    });

    const res = await staffGet(req);
    assert.strictEqual(res.status, 403);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.message, /Owner privilege required/i);
  });

  test("GET /api/admin/staff returns 200 OK for Owner", async () => {
    const mockOwnerUser = {
      id: "usr_owner_001",
      email: "aapkaastro1606@gmail.com",
      role: "ADMIN",
    };

    const req = new NextRequest("http://localhost:3000/api/admin/staff", {
      headers: {
        cookie: `aapka_astro_mock_user=${encodeURIComponent(JSON.stringify(mockOwnerUser))}`,
      },
    });

    const res = await staffGet(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.staff));
    assert.ok(Array.isArray(data.availableSections));
  });

  test("POST /api/admin/staff returns 403 for unauthorized caller", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/staff", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: "aapka_astro_session=active; aapka_astro_role=CLIENT",
      },
      body: JSON.stringify({ email: "temp@aapkaastro.com", sections: ["blog"] }),
    });

    const res = await staffPost(req);
    assert.strictEqual(res.status, 403);
  });

  test("POST /api/admin/staff allows Owner to assign sections", async () => {
    const mockOwnerUser = {
      id: "usr_owner_001",
      email: "aapkaastro1606@gmail.com",
      role: "ADMIN",
    };

    const req = new NextRequest("http://localhost:3000/api/admin/staff", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: `aapka_astro_mock_user=${encodeURIComponent(JSON.stringify(mockOwnerUser))}`,
      },
      body: JSON.stringify({
        email: "content_lead@aapkaastro.com",
        sections: ["blog", "reels"],
      }),
    });

    const res = await staffPost(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
  });

  test("DELETE /api/admin/staff allows Owner to revoke permissions", async () => {
    const mockOwnerUser = {
      id: "usr_owner_001",
      email: "aapkaastro1606@gmail.com",
      role: "ADMIN",
    };

    const req = new NextRequest(
      "http://localhost:3000/api/admin/staff?email=content_lead%40aapkaastro.com",
      {
        method: "DELETE",
        headers: {
          cookie: `aapka_astro_mock_user=${encodeURIComponent(JSON.stringify(mockOwnerUser))}`,
        },
      }
    );

    const res = await staffDelete(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
  });
});
