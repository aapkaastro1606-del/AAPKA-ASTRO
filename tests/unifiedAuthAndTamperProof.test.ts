import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import {
  getServerAuthUser,
  __setTestAuthUser,
  hasStaffSectionAccess,
  ServerAuthResult,
} from "../src/lib/auth/serverAuth";
import { GET as bookingsGet } from "../src/app/api/admin/bookings/route";
import { GET as leadsGet } from "../src/app/api/admin/leads/route";
import { GET as paymentSettingsGet } from "../src/app/api/admin/payment-settings/route";
import { GET as pricingGet } from "../src/app/api/admin/pricing/route";
import { GET as staffGet } from "../src/app/api/admin/staff/route";
import { GET as teamGet } from "../src/app/api/admin/team/route";
import { GET as diagnosticsGet } from "../src/app/api/admin/diagnostics/route";
import { GET as contentAdminGet } from "../src/app/api/admin/content/route";
import { GET as auditGet } from "../src/app/api/admin/audit/route";
import { GET as blogGet } from "../src/app/api/dashboard/blog/route";
import { GET as reelsGet } from "../src/app/api/dashboard/reels/route";
import { GET as accountDataGet } from "../src/app/api/account/data/route";
import { POST as bookingCreatePost } from "../src/app/api/booking/create/route";

describe("Unified Identity & Authorization — Tamper-Proof & Persona Verification", () => {
  beforeEach(() => {
    process.env.OWNER_EMAIL = "aapkaastro1606@gmail.com";
    __setTestAuthUser(null);
  });

  afterEach(() => {
    __setTestAuthUser(null);
  });

  // ----------------------------------------------------------------------------
  // PERSONA 1: LOGGED OUT & FORGED CREDENTIAL TAMPERING
  // ----------------------------------------------------------------------------
  describe("Persona 1: Logged Out & Forged Mock/Bearer Credentials", () => {
    it("strictly rejects forged aapka_astro_session and role=OWNER cookies on admin routes", async () => {
      __setTestAuthUser(null);

      const forgedCookieReq = new NextRequest("http://localhost:3000/api/admin/bookings", {
        headers: {
          cookie: "aapka_astro_session=active; aapka_astro_role=OWNER; aapka_astro_email=aapkaastro1606@gmail.com",
        },
      });

      const res = await bookingsGet(forgedCookieReq);
      assert.equal(res.status, 403, "Forged mock cookie must not authenticate as Owner");
      const data = await res.json();
      assert.equal(data.success, false);
    });

    it("strictly rejects forged aapka_astro_mock_user cookie claiming Owner on leads", async () => {
      __setTestAuthUser(null);

      const forgedMockUser = {
        id: "usr_hacker_007",
        email: "aapkaastro1606@gmail.com",
        role: "OWNER",
      };

      const req = new NextRequest("http://localhost:3000/api/admin/leads", {
        headers: {
          cookie: `aapka_astro_mock_user=${encodeURIComponent(JSON.stringify(forgedMockUser))}`,
        },
      });

      const res = await leadsGet(req);
      assert.equal(res.status, 403, "Forged mock user cookie must be rejected with 403");
      const data = await res.json();
      assert.equal(data.success, false);
    });

    it("strictly rejects handmade unsigned JWTs (alg: none) in Authorization Bearer header", async () => {
      __setTestAuthUser(null);

      // Alg: none unsigned JWT payload claiming Owner identity
      const unsignedJwt = "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c3JfaGFja2VyIiwiZW1haWwiOiJhYXBrYWFzdHJvMTYwNkBnbWFpbC5jb20iLCJyb2xlIjoiT1dORVIifQ.";

      const req = new NextRequest("http://localhost:3000/api/admin/pricing", {
        headers: {
          authorization: `Bearer ${unsignedJwt}`,
        },
      });

      const res = await pricingGet(req);
      assert.ok([401, 403].includes(res.status), "Unsigned JWT Bearer must be rejected with 401 or 403");
    });

    it("strictly rejects handmade signed JWT with bogus secret", async () => {
      __setTestAuthUser(null);

      // Bogus signed JWT
      const bogusToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfaGFja2VyIiwiZW1haWwiOiJhYXBrYWFzdHJvMTYwNkBnbWFpbC5jb20ifQ.dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";

      const req = new NextRequest("http://localhost:3000/api/admin/payment-settings", {
        headers: {
          authorization: `Bearer ${bogusToken}`,
        },
      });

      const res = await paymentSettingsGet(req);
      assert.ok([401, 403].includes(res.status), "Bogus JWT Bearer must be rejected");
    });

    it("refuses logged-out requests across all admin endpoints", async () => {
      __setTestAuthUser(null);

      const endpoints = [
        { name: "bookings", fn: bookingsGet, url: "http://localhost:3000/api/admin/bookings" },
        { name: "leads", fn: leadsGet, url: "http://localhost:3000/api/admin/leads" },
        { name: "payment-settings", fn: paymentSettingsGet, url: "http://localhost:3000/api/admin/payment-settings" },
        { name: "pricing", fn: pricingGet, url: "http://localhost:3000/api/admin/pricing" },
        { name: "staff", fn: staffGet, url: "http://localhost:3000/api/admin/staff" },
        { name: "team", fn: teamGet, url: "http://localhost:3000/api/admin/team" },
        { name: "diagnostics", fn: diagnosticsGet, url: "http://localhost:3000/api/admin/diagnostics" },
        { name: "content", fn: contentAdminGet, url: "http://localhost:3000/api/admin/content" },
        { name: "audit", fn: auditGet, url: "http://localhost:3000/api/admin/audit" },
        { name: "blog", fn: blogGet, url: "http://localhost:3000/api/dashboard/blog" },
        { name: "reels", fn: reelsGet, url: "http://localhost:3000/api/dashboard/reels" },
      ];

      for (const endpoint of endpoints) {
        const req = new NextRequest(endpoint.url);
        const res = await endpoint.fn(req);
        assert.ok(
          [401, 403].includes(res.status),
          `Logged out request to ${endpoint.name} must be refused with 401 or 403 (got ${res.status})`
        );
      }
    });

    it("refuses logged-out requests to user account and booking APIs", async () => {
      __setTestAuthUser(null);

      const accountReq = new NextRequest("http://localhost:3000/api/account/data");
      const accountRes = await accountDataGet(accountReq);
      assert.equal(accountRes.status, 401, "Logged out user must receive 401 on /api/account/data");

      const bookingReq = new NextRequest("http://localhost:3000/api/booking/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ clientName: "Anonymous", clientPhone: "+919999988888" }),
      });
      const bookingRes = await bookingCreatePost(bookingReq);
      assert.equal(bookingRes.status, 401, "Logged out user must receive 401 on /api/booking/create");
    });
  });

  // ----------------------------------------------------------------------------
  // PERSONA 2: CLIENT
  // ----------------------------------------------------------------------------
  describe("Persona 2: Standard Client Account", () => {
    const clientUser: ServerAuthResult = {
      isAuthenticated: true,
      userId: "cuid_client_db_123",
      clerkId: "user_clerk_client_456",
      role: "CLIENT",
      isAstrologer: false,
      isAdmin: false,
      isOwner: false,
      email: "seeker@gmail.com",
      permissions: [],
      grants: [],
    };

    it("allows client to fetch their own account data", async () => {
      __setTestAuthUser(clientUser);

      const req = new NextRequest("http://localhost:3000/api/account/data");
      const res = await accountDataGet(req);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(data.profile);
    });

    it("strictly blocks client account from all admin and operator sections", async () => {
      __setTestAuthUser(clientUser);

      const restrictedEndpoints = [
        { name: "bookings", fn: bookingsGet, url: "http://localhost:3000/api/admin/bookings" },
        { name: "leads", fn: leadsGet, url: "http://localhost:3000/api/admin/leads" },
        { name: "pricing", fn: pricingGet, url: "http://localhost:3000/api/admin/pricing" },
        { name: "payment-settings", fn: paymentSettingsGet, url: "http://localhost:3000/api/admin/payment-settings" },
        { name: "staff", fn: staffGet, url: "http://localhost:3000/api/admin/staff" },
        { name: "team", fn: teamGet, url: "http://localhost:3000/api/admin/team" },
        { name: "diagnostics", fn: diagnosticsGet, url: "http://localhost:3000/api/admin/diagnostics" },
        { name: "blog", fn: blogGet, url: "http://localhost:3000/api/dashboard/blog" },
      ];

      for (const endpoint of restrictedEndpoints) {
        const req = new NextRequest(endpoint.url);
        const res = await endpoint.fn(req);
        assert.equal(
          res.status,
          403,
          `Client account must receive 403 on ${endpoint.name} (got ${res.status})`
        );
      }
    });
  });

  // ----------------------------------------------------------------------------
  // PERSONA 3: STAFF WITH ONE SECTION (e.g. Content)
  // ----------------------------------------------------------------------------
  describe("Persona 3: Staff Member With Single Section Permission", () => {
    const staffContentOnly: ServerAuthResult = {
      isAuthenticated: true,
      userId: "cuid_staff_content_1",
      clerkId: "user_staff_clerk_1",
      role: "CLIENT",
      isAstrologer: false,
      isAdmin: false,
      isOwner: false,
      email: "content_specialist@aapkaastro.com",
      permissions: ["content"],
      grants: [
        {
          id: "grant_content_manage",
          email: "content_specialist@aapkaastro.com",
          section: "content",
          accessLevel: "MANAGE",
          grantedAt: new Date().toISOString(),
          revokedAt: null,
        },
      ],
    };

    it("allows staff member to access their granted section (content)", async () => {
      __setTestAuthUser(staffContentOnly);

      const req = new NextRequest("http://localhost:3000/api/admin/content");
      const res = await contentAdminGet(req);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(data.content);
    });

    it("strictly blocks staff member from accessing non-granted sections", async () => {
      __setTestAuthUser(staffContentOnly);

      // Verify fail-closed on pricing
      const pricingReq = new NextRequest("http://localhost:3000/api/admin/pricing");
      const pricingRes = await pricingGet(pricingReq);
      assert.equal(pricingRes.status, 403, "Content staff must receive 403 on pricing");

      // Verify fail-closed on bookings
      const bookingsReq = new NextRequest("http://localhost:3000/api/admin/bookings");
      const bookingsRes = await bookingsGet(bookingsReq);
      assert.equal(bookingsRes.status, 403, "Content staff must receive 403 on bookings");

      // Verify fail-closed on leads
      const leadsReq = new NextRequest("http://localhost:3000/api/admin/leads");
      const leadsRes = await leadsGet(leadsReq);
      assert.equal(leadsRes.status, 403, "Content staff must receive 403 on leads");

      // Verify fail-closed on staff permissions
      const staffReq = new NextRequest("http://localhost:3000/api/admin/staff");
      const staffRes = await staffGet(staffReq);
      assert.equal(staffRes.status, 403, "Content staff must receive 403 on staff management");

      // Verify fail-closed on diagnostics
      const diagReq = new NextRequest("http://localhost:3000/api/admin/diagnostics");
      const diagRes = await diagnosticsGet(diagReq);
      assert.equal(diagRes.status, 403, "Content staff must receive 403 on diagnostics");
    });
  });

  // ----------------------------------------------------------------------------
  // PERSONA 4: OWNER (Verified Primary Email === OWNER_EMAIL)
  // ----------------------------------------------------------------------------
  describe("Persona 4: Platform Owner", () => {
    const ownerUser: ServerAuthResult = {
      isAuthenticated: true,
      userId: "cuid_owner_db_001",
      clerkId: "user_clerk_owner_999",
      role: "OWNER",
      isAstrologer: true,
      isAdmin: true,
      isOwner: true,
      email: "aapkaastro1606@gmail.com",
      permissions: ["bookings", "leads", "content", "pricing", "staff", "team", "media", "blog", "reels"],
      grants: [
        {
          id: "grant_owner_all",
          email: "aapkaastro1606@gmail.com",
          section: "pricing",
          accessLevel: "MANAGE",
          grantedAt: new Date().toISOString(),
          revokedAt: null,
        },
      ],
    };

    it("returns database userId (cuid) separate from clerkId", async () => {
      __setTestAuthUser(ownerUser);

      const auth = await getServerAuthUser();
      assert.equal(auth.isAuthenticated, true);
      assert.equal(auth.isOwner, true);
      assert.equal(auth.role, "OWNER");
      assert.equal(auth.userId, "cuid_owner_db_001", "userId must be database cuid for foreign-key safety");
      assert.equal(auth.clerkId, "user_clerk_owner_999", "clerkId must be preserved separately");
    });

    it("allows Owner to access all admin endpoints unconditionally", async () => {
      __setTestAuthUser(ownerUser);

      const ownerEndpoints = [
        { name: "bookings", fn: bookingsGet, url: "http://localhost:3000/api/admin/bookings" },
        { name: "leads", fn: leadsGet, url: "http://localhost:3000/api/admin/leads" },
        { name: "payment-settings", fn: paymentSettingsGet, url: "http://localhost:3000/api/admin/payment-settings" },
        { name: "pricing", fn: pricingGet, url: "http://localhost:3000/api/admin/pricing" },
        { name: "staff", fn: staffGet, url: "http://localhost:3000/api/admin/staff" },
        { name: "team", fn: teamGet, url: "http://localhost:3000/api/admin/team" },
        { name: "diagnostics", fn: diagnosticsGet, url: "http://localhost:3000/api/admin/diagnostics" },
        { name: "content", fn: contentAdminGet, url: "http://localhost:3000/api/admin/content" },
        { name: "audit", fn: auditGet, url: "http://localhost:3000/api/admin/audit" },
      ];

      for (const endpoint of ownerEndpoints) {
        const req = new NextRequest(endpoint.url);
        const res = await endpoint.fn(req);
        assert.equal(
          res.status,
          200,
          `Owner must receive 200 OK on ${endpoint.name} (got ${res.status})`
        );
      }
    });
  });
});
