import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { evaluateRouteAccess } from "../src/lib/auth/roles";
import { hasSectionAccess, StaffGrant } from "../src/lib/auth/staffPermissions";
import { hasStaffSectionAccess, __setTestAuthUser } from "../src/lib/auth/serverAuth";
import {
  GET as blogGet,
  POST as blogPost,
  DELETE as blogDelete,
} from "../src/app/api/dashboard/blog/route";
import {
  GET as pricingGet,
  POST as pricingPost,
} from "../src/app/api/admin/pricing/route";
import {
  GET as reelsGet,
  POST as reelsPost,
} from "../src/app/api/dashboard/reels/route";

describe("Strict Section-Level Route Enforcement (Automated Verification Suite)", () => {
  const staffBlogManage = {
    id: "usr_staff_blog_manage",
    email: "blog_lead@aapkaastro.com",
    role: "CLIENT" as const,
    grants: [
      { section: "blog" as const, accessLevel: "MANAGE" as const },
    ] as StaffGrant[],
  };

  const ownerUser = {
    id: "usr_owner_official",
    email: "aapkaastro1606@gmail.com",
    role: "OWNER" as const,
    grants: [] as StaffGrant[],
  };

  const staffBlogView = {
    id: "usr_staff_blog_view",
    email: "blog_reviewer@aapkaastro.com",
    role: "CLIENT" as const,
    grants: [
      { section: "blog" as const, accessLevel: "VIEW" as const },
    ] as StaffGrant[],
  };

  test("1. Staff account with only blog:MANAGE can access /dashboard/blog", () => {
    const access = evaluateRouteAccess(
      "/dashboard/blog",
      staffBlogManage.role,
      true,
      staffBlogManage.grants,
      staffBlogManage.email,
      "VIEW"
    );
    assert.strictEqual(access.allowed, true);

    const hasManage = hasSectionAccess(staffBlogManage, "blog", "MANAGE");
    assert.strictEqual(hasManage, true);
  });

  test("2. Staff account with only blog:MANAGE is strictly rejected from every other admin and dashboard section", () => {
    const restrictedRoutes = [
      { path: "/dashboard/reels", section: "reels" },
      { path: "/dashboard/clients", section: "clients" },
      { path: "/dashboard/earnings", section: "earnings" },
      { path: "/admin/pricing", section: "pricing" },
      { path: "/admin/analytics", section: "analytics" },
      { path: "/admin/team", section: "team (Owner-only)" },
      { path: "/admin/staff", section: "staff (Owner-only)" },
    ];

    for (const { path, section } of restrictedRoutes) {
      const access = evaluateRouteAccess(
        path,
        staffBlogManage.role,
        true,
        staffBlogManage.grants,
        staffBlogManage.email
      );

      assert.strictEqual(
        access.allowed,
        false,
        `Staff with only blog:MANAGE must be blocked from accessing ${path} (${section})`
      );

      if (!access.allowed) {
        assert.strictEqual(
          access.redirectUrl,
          "/dashboard",
          `Blocked staff should be gracefully redirected to /dashboard from ${path}`
        );
      }
    }
  });

  test("3. Platform Owner can access every single section and action unconditionally", () => {
    const allAdminAndDashboardRoutes = [
      "/dashboard",
      "/dashboard/blog",
      "/dashboard/reels",
      "/dashboard/clients",
      "/dashboard/earnings",
      "/dashboard/session/live-sess-001",
      "/admin",
      "/admin/pricing",
      "/admin/analytics",
      "/admin/team",
      "/admin/staff",
    ];

    for (const path of allAdminAndDashboardRoutes) {
      const access = evaluateRouteAccess(
        path,
        ownerUser.role,
        true,
        ownerUser.grants,
        ownerUser.email,
        "MANAGE"
      );

      assert.strictEqual(
        access.allowed,
        true,
        `Owner must have unconditional access to ${path}`
      );
    }
  });

  test("4. Staff account with blog:VIEW can view /dashboard/blog but is rejected from MANAGE access", () => {
    // 4a. Route access at VIEW level: Allowed
    const viewAccess = evaluateRouteAccess(
      "/dashboard/blog",
      staffBlogView.role,
      true,
      staffBlogView.grants,
      staffBlogView.email,
      "VIEW"
    );
    assert.strictEqual(viewAccess.allowed, true);

    // 4b. Action access at MANAGE level: Rejected
    const manageAccess = evaluateRouteAccess(
      "/dashboard/blog",
      staffBlogView.role,
      true,
      staffBlogView.grants,
      staffBlogView.email,
      "MANAGE"
    );
    assert.strictEqual(manageAccess.allowed, false);
    if (!manageAccess.allowed) {
      assert.strictEqual(manageAccess.redirectUrl, "/dashboard");
    }

    assert.strictEqual(hasSectionAccess(staffBlogView, "blog", "VIEW"), true);
    assert.strictEqual(hasSectionAccess(staffBlogView, "blog", "MANAGE"), false);
  });
});

describe("Server-Side API Enforcement for VIEW vs MANAGE Operations", () => {
  const staffBlogView = {
    id: "usr_staff_blog_view",
    email: "blog_reviewer@aapkaastro.com",
    role: "CLIENT",
    permissions: ["blog"],
    grants: [{ section: "blog", accessLevel: "VIEW" }],
  };

  const staffBlogManage = {
    id: "usr_staff_blog_manage",
    email: "blog_lead@aapkaastro.com",
    role: "CLIENT",
    permissions: ["blog"],
    grants: [{ section: "blog", accessLevel: "MANAGE" }],
  };

  const ownerUser = {
    id: "usr_owner_001",
    email: "aapkaastro1606@gmail.com",
    role: "OWNER",
    permissions: ["blog", "reels", "clients", "earnings", "pricing", "analytics", "staff"],
    grants: [],
  };

  test("GET /api/dashboard/blog succeeds (200 OK) for staff with blog:VIEW", async () => {
    __setTestAuthUser(staffBlogView);
    const req = new NextRequest("http://localhost:3000/api/dashboard/blog", {
      headers: {
        cookie: `aapka_astro_mock_user=${encodeURIComponent(JSON.stringify(staffBlogView))}`,
      },
    });

    const res = await blogGet(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.posts));
  });

  test("POST /api/dashboard/blog rejects (403 Forbidden) for staff with only blog:VIEW", async () => {
    __setTestAuthUser(staffBlogView);
    const req = new NextRequest("http://localhost:3000/api/dashboard/blog", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: `aapka_astro_mock_user=${encodeURIComponent(JSON.stringify(staffBlogView))}`,
      },
      body: JSON.stringify({
        title: "Malicious or Unauthorized Treatise",
        content: "Trying to author without MANAGE permissions",
      }),
    });

    const res = await blogPost(req);
    assert.strictEqual(res.status, 403);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.message, /Forbidden.*MANAGE access required/i);
  });

  test("DELETE /api/dashboard/blog rejects (403 Forbidden) for staff with only blog:VIEW", async () => {
    __setTestAuthUser(staffBlogView);
    const req = new NextRequest("http://localhost:3000/api/dashboard/blog?id=blog-1", {
      method: "DELETE",
      headers: {
        cookie: `aapka_astro_mock_user=${encodeURIComponent(JSON.stringify(staffBlogView))}`,
      },
    });

    const res = await blogDelete(req);
    assert.strictEqual(res.status, 403);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.message, /Forbidden.*MANAGE access required/i);
  });

  test("POST /api/dashboard/blog succeeds (200 OK) for staff with blog:MANAGE", async () => {
    __setTestAuthUser(staffBlogManage);
    const req = new NextRequest("http://localhost:3000/api/dashboard/blog", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: `aapka_astro_mock_user=${encodeURIComponent(JSON.stringify(staffBlogManage))}`,
      },
      body: JSON.stringify({
        title: "Ketu in the 8th House: Esoteric Revelations",
        content: "Detailed analysis of occult transits and Moksha triggers.",
        category: "Vedic Astrology",
      }),
    });

    const res = await blogPost(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.post.title, "Ketu in the 8th House: Esoteric Revelations");
  });

  test("POST /api/dashboard/blog succeeds (200 OK) for platform Owner", async () => {
    __setTestAuthUser({ isAuthenticated: true, isOwner: true, role: "OWNER", email: "aapkaastro1606@gmail.com" });
    const req = new NextRequest("http://localhost:3000/api/dashboard/blog", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: `aapka_astro_mock_user=${encodeURIComponent(JSON.stringify(ownerUser))}`,
      },
      body: JSON.stringify({
        title: "Owner Treatise: Navamsha Chart Decoded",
        content: "Deep dive into D9 divisional chart harmonics.",
        category: "Vedic Astrology",
      }),
    });

    const res = await blogPost(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
  });
});

describe("Server-Side API Enforcement for Pricing and Reels Sections", () => {
  const staffPricingView = {
    id: "usr_staff_pricing_view",
    email: "finance_viewer@aapkaastro.com",
    role: "CLIENT",
    permissions: ["pricing"],
    grants: [{ section: "pricing", accessLevel: "VIEW" }],
  };

  const staffReelsView = {
    id: "usr_staff_reels_view",
    email: "video_viewer@aapkaastro.com",
    role: "CLIENT",
    permissions: ["reels"],
    grants: [{ section: "reels", accessLevel: "VIEW" }],
  };

  const ownerUser = {
    id: "usr_owner_official",
    email: "aapkaastro1606@gmail.com",
    role: "OWNER",
    permissions: ["pricing", "bookings", "staff"],
    grants: [],
  };

  test("GET /api/admin/pricing rejects (403 Forbidden) non-owner staff as pricing is strictly Owner-only", async () => {
    __setTestAuthUser(staffPricingView);
    const req = new NextRequest("http://localhost:3000/api/admin/pricing", {
      headers: {
        cookie: `aapka_astro_mock_user=${encodeURIComponent(JSON.stringify(staffPricingView))}`,
      },
    });

    const res = await pricingGet(req);
    assert.strictEqual(res.status, 403);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.message, /Owner/i);
  });

  test("POST /api/admin/pricing rejects (403 Forbidden) non-owner staff as pricing is strictly Owner-only", async () => {
    __setTestAuthUser(staffPricingView);
    const req = new NextRequest("http://localhost:3000/api/admin/pricing", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: `aapka_astro_mock_user=${encodeURIComponent(JSON.stringify(staffPricingView))}`,
      },
      body: JSON.stringify({ chatRate: 99 }),
    });

    const res = await pricingPost(req);
    assert.strictEqual(res.status, 403);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.message, /Owner/i);
  });

  test("GET & POST /api/admin/pricing succeeds (200 OK) for platform Owner", async () => {
    __setTestAuthUser({ isAuthenticated: true, isOwner: true, role: "OWNER", email: "aapkaastro1606@gmail.com" });
    const reqGet = new NextRequest("http://localhost:3000/api/admin/pricing", {
      headers: {
        cookie: `aapka_astro_mock_user=${encodeURIComponent(JSON.stringify(ownerUser))}`,
      },
    });
    const resGet = await pricingGet(reqGet);
    assert.strictEqual(resGet.status, 200);

    const reqPost = new NextRequest("http://localhost:3000/api/admin/pricing", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: `aapka_astro_mock_user=${encodeURIComponent(JSON.stringify(ownerUser))}`,
      },
      body: JSON.stringify({ chatRate: 25, callRate: 35, videoRate: 50 }),
    });
    const resPost = await pricingPost(reqPost);
    assert.strictEqual(resPost.status, 200);
  });

  test("GET /api/dashboard/reels allows staff with reels:VIEW", async () => {
    __setTestAuthUser(staffReelsView);
    const req = new NextRequest("http://localhost:3000/api/dashboard/reels", {
      headers: {
        cookie: `aapka_astro_mock_user=${encodeURIComponent(JSON.stringify(staffReelsView))}`,
      },
    });

    const res = await reelsGet(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.reels));
  });

  test("POST /api/dashboard/reels rejects (403 Forbidden) staff with only reels:VIEW", async () => {
    __setTestAuthUser(staffReelsView);
    const req = new NextRequest("http://localhost:3000/api/dashboard/reels", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: `aapka_astro_mock_user=${encodeURIComponent(JSON.stringify(staffReelsView))}`,
      },
      body: JSON.stringify({ action: "togglePin", reelId: "reel-1" }),
    });

    const res = await reelsPost(req);
    assert.strictEqual(res.status, 403);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.message, /MANAGE access required/i);
  });
});
