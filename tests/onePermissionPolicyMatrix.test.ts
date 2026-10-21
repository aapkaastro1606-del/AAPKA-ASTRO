import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { __setTestAuthUser, ServerAuthResult } from "@/lib/auth/serverAuth";
import {
  canAccessRoute,
  canAccessApiRoute,
  getVisibleSidebarSections,
  STAFF_GRANTABLE_SECTIONS,
  isGrantableStaffSection,
  MASTER_SECTIONS,
} from "@/lib/auth/permissionPolicy";

// API Handlers under test
import { GET as bookingsGet } from "@/app/api/admin/bookings/route";
import { GET as pricingGet } from "@/app/api/admin/pricing/route";
import { GET as paymentSettingsGet } from "@/app/api/admin/payment-settings/route";
import { GET as leadsGet } from "@/app/api/admin/leads/route";
import { GET as teamGet, POST as teamPost } from "@/app/api/admin/team/route";
import { GET as staffGet, POST as staffPost } from "@/app/api/admin/staff/route";
import { GET as diagnosticsGet } from "@/app/api/admin/diagnostics/route";
import { GET as auditGet } from "@/app/api/admin/audit/route";
import { GET as contentGet, POST as contentPost } from "@/app/api/admin/content/route";
import { GET as blogGet, POST as blogPost } from "@/app/api/dashboard/blog/route";
import { GET as reelsGet, POST as reelsPost } from "@/app/api/dashboard/reels/route";
import { GET as accountDataGet } from "@/app/api/account/data/route";
import { GET as bookingStatusGet } from "@/app/api/booking/status/route";
import { NextRequest } from "next/server";

describe("ONE PERMISSION POLICY — Full Persona by Route Matrix", () => {
  beforeEach(() => {
    __setTestAuthUser(null);
  });

  // --------------------------------------------------------------------------
  // Catalog & Grantable Invariants
  // --------------------------------------------------------------------------
  test("Policy catalog strictly marks bookings and operational consoles as owner-only", () => {
    const bookingsMeta = MASTER_SECTIONS.find((s) => s.id === "bookings");
    assert.ok(bookingsMeta);
    assert.strictEqual(bookingsMeta.ownerOnly, true);
    assert.strictEqual(bookingsMeta.area, "BOOKINGS_AND_PAYMENTS");

    // Bookings MUST NOT be in STAFF_GRANTABLE_SECTIONS
    assert.strictEqual(isGrantableStaffSection("bookings"), false);
    assert.strictEqual(isGrantableStaffSection("pricing"), false);
    assert.strictEqual(isGrantableStaffSection("staff"), false);
    assert.strictEqual(isGrantableStaffSection("leads"), false);
    assert.strictEqual(isGrantableStaffSection("analytics"), false);

    // Blog, reels, content, knowledge MUST be grantable
    assert.strictEqual(isGrantableStaffSection("blog"), true);
    assert.strictEqual(isGrantableStaffSection("reels"), true);
    assert.strictEqual(isGrantableStaffSection("content"), true);
    assert.strictEqual(isGrantableStaffSection("knowledge"), true);
  });

  // --------------------------------------------------------------------------
  // PERSONA 1: Logged-out Visitor (Unauthenticated)
  // --------------------------------------------------------------------------
  describe("Persona 1: Logged-out Visitor", () => {
    beforeEach(() => {
      __setTestAuthUser(null);
    });

    test("Page routes: Restricted pages signal redirectToLogin without redirect loops", () => {
      const routes = [
        "/admin",
        "/admin/bookings",
        "/admin/pricing",
        "/admin/leads",
        "/admin/team",
        "/admin/staff",
        "/admin/diagnostics",
        "/admin/content",
        "/dashboard",
        "/dashboard/blog",
        "/dashboard/reels",
        "/account",
      ];

      for (const route of routes) {
        const decision = canAccessRoute(null, route);
        assert.strictEqual(decision.allowed, false, `Route ${route} must be denied`);
        assert.strictEqual(decision.redirectToLogin, true, `Route ${route} must flag redirectToLogin`);
        assert.ok(decision.returnUrl.startsWith("/login?redirect_url="), `Route ${route} returnUrl`);
      }
    });

    test("APIs: Denies 401 across admin and dashboard endpoints", async () => {
      const endpoints: [string, (req: NextRequest) => Promise<Response>][] = [
        ["http://localhost:3000/api/admin/bookings", bookingsGet],
        ["http://localhost:3000/api/admin/pricing", pricingGet],
        ["http://localhost:3000/api/admin/payment-settings", paymentSettingsGet],
        ["http://localhost:3000/api/admin/leads", leadsGet],
        ["http://localhost:3000/api/admin/team", teamGet],
        ["http://localhost:3000/api/admin/staff", staffGet],
        ["http://localhost:3000/api/admin/diagnostics", diagnosticsGet],
        ["http://localhost:3000/api/admin/audit", auditGet],
        ["http://localhost:3000/api/dashboard/blog", blogGet],
        ["http://localhost:3000/api/dashboard/reels", reelsGet],
      ];

      for (const [url, handler] of endpoints) {
        const req = new NextRequest(url);
        const res = await handler(req);
        assert.ok(res.status === 401 || res.status === 403, `Expected 401/403 for ${url}, got ${res.status}`);
      }
    });

    test("Sidebar: Returns completely empty for logged-out visitor", () => {
      const items = getVisibleSidebarSections(null);
      assert.strictEqual(items.length, 0);
    });
  });

  // --------------------------------------------------------------------------
  // PERSONA 2: Authenticated Client (Seeker)
  // --------------------------------------------------------------------------
  describe("Persona 2: Authenticated Client", () => {
    const clientAuth: ServerAuthResult = {
      isAuthenticated: true,
      userId: "usr_client_001",
      clerkId: "clerk_client_001",
      email: "seeker@gmail.com",
      role: "CLIENT",
      isAstrologer: false,
      isAdmin: false,
      isOwner: false,
      permissions: [],
      grants: [],
    };

    beforeEach(() => {
      __setTestAuthUser(clientAuth);
    });

    test("Area 4: Permitted to personal account pages with own data", () => {
      const accountDecision = canAccessRoute(clientAuth, "/account");
      assert.strictEqual(accountDecision.allowed, true);

      const consultDecision = canAccessRoute(clientAuth, "/account/consult");
      assert.strictEqual(consultDecision.allowed, true);

      const kundliDecision = canAccessRoute(clientAuth, "/account/kundli");
      assert.strictEqual(kundliDecision.allowed, true);
    });

    test("Area 1, 2, 3: Strictly forbidden from Admin and Dashboard pages with link back (No redirect loop)", () => {
      const restrictedPages = [
        "/admin",
        "/admin/bookings",
        "/admin/pricing",
        "/admin/leads",
        "/admin/team",
        "/admin/staff",
        "/admin/diagnostics",
        "/admin/content",
        "/dashboard",
        "/dashboard/blog",
        "/dashboard/reels",
      ];

      for (const page of restrictedPages) {
        const decision = canAccessRoute(clientAuth, page);
        assert.strictEqual(decision.allowed, false, `Client must be denied from ${page}`);
        assert.strictEqual(decision.isForbidden, true);
        assert.strictEqual(decision.returnUrl, "/account", `Client must have a link back to /account`);
        assert.strictEqual(decision.returnLabel, "Go to My Account");
        assert.ok(decision.reason?.includes("don't have access"), `Expected clear access denied message`);
      }
    });

    test("APIs: Strictly rejected (403 Forbidden) on all admin and dashboard routes", async () => {
      const endpoints: [string, (req: NextRequest) => Promise<Response>][] = [
        ["http://localhost:3000/api/admin/bookings", bookingsGet],
        ["http://localhost:3000/api/admin/pricing", pricingGet],
        ["http://localhost:3000/api/admin/payment-settings", paymentSettingsGet],
        ["http://localhost:3000/api/admin/leads", leadsGet],
        ["http://localhost:3000/api/admin/team", teamGet],
        ["http://localhost:3000/api/admin/staff", staffGet],
        ["http://localhost:3000/api/admin/diagnostics", diagnosticsGet],
        ["http://localhost:3000/api/admin/audit", auditGet],
        ["http://localhost:3000/api/dashboard/blog", blogGet],
        ["http://localhost:3000/api/dashboard/reels", reelsGet],
      ];

      for (const [url, handler] of endpoints) {
        const req = new NextRequest(url);
        const res = await handler(req);
        assert.strictEqual(res.status, 403, `Client must get 403 on ${url}`);
      }
    });

    test("Sidebar: Shows zero administrative or staff items for client", () => {
      const sidebarItems = getVisibleSidebarSections(clientAuth);
      assert.strictEqual(sidebarItems.length, 0);
    });
  });

  // --------------------------------------------------------------------------
  // PERSONA 3: Scoped Staff Member (Granted only Area 3: Blog)
  // --------------------------------------------------------------------------
  describe("Persona 3: Scoped Staff Member (Blog Only)", () => {
    const staffBlogAuth: ServerAuthResult = {
      isAuthenticated: true,
      userId: "usr_staff_blog_001",
      clerkId: "clerk_staff_blog_001",
      email: "writer@aapkaastro.com",
      role: "STAFF",
      isAstrologer: false,
      isAdmin: false,
      isOwner: false,
      permissions: ["blog"],
      grants: [
        {
          id: "grant_blog_01",
          email: "writer@aapkaastro.com",
          section: "blog",
          accessLevel: "MANAGE",
          grantedAt: new Date().toISOString(),
        },
      ],
    };

    beforeEach(() => {
      __setTestAuthUser(staffBlogAuth);
    });

    test("Area 3 (Blog): Allowed into /dashboard/blog page and APIs", async () => {
      const pageDecision = canAccessRoute(staffBlogAuth, "/dashboard/blog");
      assert.strictEqual(pageDecision.allowed, true);

      const apiGetRes = await blogGet(new NextRequest("http://localhost:3000/api/dashboard/blog"));
      assert.strictEqual(apiGetRes.status, 200);
    });

    test("Area 1 (Bookings & UPI): Strictly blocked (No access, clear page guard, 403 API)", async () => {
      // Page Guard
      const decision = canAccessRoute(staffBlogAuth, "/admin/bookings");
      assert.strictEqual(decision.allowed, false);
      assert.strictEqual(decision.isForbidden, true);
      assert.match(decision.reason || "", /don't have access.*Platform Owner/i);
      assert.strictEqual(decision.returnUrl, "/dashboard/blog");

      // API Guard
      const apiRes = await bookingsGet(new NextRequest("http://localhost:3000/api/admin/bookings"));
      assert.strictEqual(apiRes.status, 403);
    });

    test("Area 2 (Pricing, Leads, Team, Staff, Diagnostics): Strictly blocked", async () => {
      const ownerOnlyPages = [
        "/admin/pricing",
        "/admin/payment-settings",
        "/admin/leads",
        "/admin/team",
        "/admin/staff",
        "/admin/diagnostics",
        "/admin/audit",
        "/admin/analytics",
      ];

      for (const page of ownerOnlyPages) {
        const decision = canAccessRoute(staffBlogAuth, page);
        assert.strictEqual(decision.allowed, false, `Staff must be denied from ${page}`);
        assert.strictEqual(decision.isForbidden, true);
        assert.strictEqual(decision.returnUrl, "/dashboard/blog");
      }

      // API checks
      const pricingRes = await pricingGet(new NextRequest("http://localhost:3000/api/admin/pricing"));
      assert.strictEqual(pricingRes.status, 403);

      const leadsRes = await leadsGet(new NextRequest("http://localhost:3000/api/admin/leads"));
      assert.strictEqual(leadsRes.status, 403);

      const teamRes = await teamGet(new NextRequest("http://localhost:3000/api/admin/team"));
      assert.strictEqual(teamRes.status, 403);

      const diagRes = await diagnosticsGet(new NextRequest("http://localhost:3000/api/admin/diagnostics"));
      assert.strictEqual(diagRes.status, 403);
    });

    test("Area 3 Ungranted Sections (Reels, Content Studio): Blocked", async () => {
      const reelsDecision = canAccessRoute(staffBlogAuth, "/dashboard/reels");
      assert.strictEqual(reelsDecision.allowed, false);
      assert.strictEqual(reelsDecision.returnUrl, "/dashboard/blog");

      const contentDecision = canAccessRoute(staffBlogAuth, "/admin/content");
      assert.strictEqual(contentDecision.allowed, false);

      const reelsRes = await reelsGet(new NextRequest("http://localhost:3000/api/dashboard/reels"));
      assert.strictEqual(reelsRes.status, 403);
    });

    test("Sidebar: Shows ONLY 'blog' and excludes all owner-only sections", () => {
      const sidebarItems = getVisibleSidebarSections(staffBlogAuth);
      assert.strictEqual(sidebarItems.length, 1);
      assert.strictEqual(sidebarItems[0].id, "blog");
      assert.strictEqual(sidebarItems[0].path, "/dashboard/blog");

      const sectionIds = sidebarItems.map((i) => i.id);
      assert.ok(!sectionIds.includes("bookings"), "Sidebar must NOT include bookings");
      assert.ok(!sectionIds.includes("pricing"), "Sidebar must NOT include pricing");
      assert.ok(!sectionIds.includes("leads"), "Sidebar must NOT include leads");
      assert.ok(!sectionIds.includes("staff"), "Sidebar must NOT include staff");
    });
  });

  // --------------------------------------------------------------------------
  // PERSONA 3B: Scoped Staff Member (Granted Area 3: Content Studio)
  // --------------------------------------------------------------------------
  describe("Persona 3B: Scoped Staff Member (Content Only)", () => {
    const staffContentAuth: ServerAuthResult = {
      isAuthenticated: true,
      userId: "usr_staff_content_001",
      clerkId: "clerk_staff_content_001",
      email: "content@aapkaastro.com",
      role: "STAFF",
      isAstrologer: false,
      isAdmin: false,
      isOwner: false,
      permissions: ["content"],
      grants: [
        {
          id: "grant_content_01",
          email: "content@aapkaastro.com",
          section: "content",
          accessLevel: "MANAGE",
          grantedAt: new Date().toISOString(),
        },
      ],
    };

    beforeEach(() => {
      __setTestAuthUser(staffContentAuth);
    });

    test("Allowed into Content Studio (/admin/content) and Media Library (/admin/media)", () => {
      const contentDecision = canAccessRoute(staffContentAuth, "/admin/content");
      assert.strictEqual(contentDecision.allowed, true);

      const mediaDecision = canAccessRoute(staffContentAuth, "/admin/media");
      assert.strictEqual(mediaDecision.allowed, true);
    });

    test("Legal pages tab (/admin/content?tab=legal) is strictly denied to staff", () => {
      const legalDecision = canAccessRoute(staffContentAuth, "/admin/content", { tab: "legal" });
      assert.strictEqual(legalDecision.allowed, false);
      assert.strictEqual(legalDecision.isForbidden, true);
      assert.match(legalDecision.reason || "", /Legal policies.*Platform Owner/i);
    });

    test("Sidebar: Shows ONLY 'content' and excludes all owner-only sections", () => {
      const sidebarItems = getVisibleSidebarSections(staffContentAuth);
      assert.strictEqual(sidebarItems.length, 1);
      assert.strictEqual(sidebarItems[0].id, "content");
      assert.strictEqual(sidebarItems[0].path, "/admin/content");
    });
  });

  // --------------------------------------------------------------------------
  // PERSONA 4: Platform Owner
  // --------------------------------------------------------------------------
  describe("Persona 4: Platform Owner", () => {
    const ownerAuth: ServerAuthResult = {
      isAuthenticated: true,
      userId: "usr_owner_prime",
      clerkId: "clerk_owner_prime",
      email: "aapkaastro1606@gmail.com",
      role: "OWNER",
      isAstrologer: true,
      isAdmin: true,
      isOwner: true,
      permissions: MASTER_SECTIONS.map((s) => s.id),
      grants: MASTER_SECTIONS.map((s) => ({
        id: `grant_owner_${s.id}`,
        email: "aapkaastro1606@gmail.com",
        section: s.id,
        accessLevel: "MANAGE",
        grantedAt: new Date().toISOString(),
      })),
    };

    beforeEach(() => {
      __setTestAuthUser(ownerAuth);
    });

    test("Full access across all 4 areas (pages & APIs)", async () => {
      const allPages = [
        "/admin",
        "/admin/bookings",
        "/admin/pricing",
        "/admin/payment-settings",
        "/admin/leads",
        "/admin/team",
        "/admin/staff",
        "/admin/diagnostics",
        "/admin/audit",
        "/admin/analytics",
        "/admin/content",
        "/admin/media",
        "/admin/knowledge",
        "/dashboard",
        "/dashboard/blog",
        "/dashboard/reels",
        "/account",
      ];

      for (const page of allPages) {
        const decision = canAccessRoute(ownerAuth, page);
        assert.strictEqual(decision.allowed, true, `Owner must have full access to ${page}`);
      }

      // Legal pages tab
      const legalDecision = canAccessRoute(ownerAuth, "/admin/content", { tab: "legal" });
      assert.strictEqual(legalDecision.allowed, true);

      // APIs
      const bookingsRes = await bookingsGet(new NextRequest("http://localhost:3000/api/admin/bookings"));
      assert.strictEqual(bookingsRes.status, 200);

      const pricingRes = await pricingGet(new NextRequest("http://localhost:3000/api/admin/pricing"));
      assert.strictEqual(pricingRes.status, 200);

      const teamRes = await teamGet(new NextRequest("http://localhost:3000/api/admin/team"));
      assert.strictEqual(teamRes.status, 200);

      const diagRes = await diagnosticsGet(new NextRequest("http://localhost:3000/api/admin/diagnostics"));
      assert.strictEqual(diagRes.status, 200);
    });

    test("Owner sidebar contains all administrative, management, and editorial sections", () => {
      const sidebarItems = getVisibleSidebarSections(ownerAuth);
      assert.strictEqual(sidebarItems.length, MASTER_SECTIONS.length);

      const sectionIds = sidebarItems.map((i) => i.id);
      assert.ok(sectionIds.includes("bookings"));
      assert.ok(sectionIds.includes("pricing"));
      assert.ok(sectionIds.includes("leads"));
      assert.ok(sectionIds.includes("staff"));
      assert.ok(sectionIds.includes("blog"));
      assert.ok(sectionIds.includes("reels"));
      assert.ok(sectionIds.includes("content"));
      assert.ok(sectionIds.includes("knowledge"));
    });

    test("Refuses assigning owner-only sections (bookings, pricing) via team/staff APIs", async () => {
      // Attempting to grant 'bookings' to staff
      const teamReq = new NextRequest("http://localhost:3000/api/admin/team", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: "helper@aapkaastro.com", section: "bookings" }),
      });
      const teamRes = await teamPost(teamReq);
      assert.strictEqual(teamRes.status, 400);
      const teamBody = await teamRes.json();
      assert.match(teamBody.message, /reserved for the Platform Owner/i);

      // Attempting to assign 'pricing' via staff bulk API
      const staffReq = new NextRequest("http://localhost:3000/api/admin/staff", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: "helper@aapkaastro.com", sections: ["blog", "pricing"] }),
      });
      const staffRes = await staffPost(staffReq);
      assert.strictEqual(staffRes.status, 400);
      const staffBody = await staffRes.json();
      assert.match(staffBody.message, /Cannot assign owner-only sections to staff/i);
    });
  });
});
