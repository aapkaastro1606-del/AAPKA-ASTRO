import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { checkAdminRateLimit, parseAndValidateJsonBody } from "../src/lib/admin/rateLimitAndValidation";
import { revalidateAffectedContent, CONTENT_CACHE_TAGS } from "../src/lib/content/revalidation";
import { hasStaffSectionAccess, ServerAuthResult } from "../src/lib/auth/serverAuth";
import { isOwnerEmail } from "../src/lib/auth/staffPermissions";
import { GET as pricingGet, POST as pricingPost } from "../src/app/api/admin/pricing/route";
import { GET as paymentGet, POST as paymentPost } from "../src/app/api/admin/payment-settings/route";
import { GET as auditGet } from "../src/app/api/admin/audit/route";

describe("Publishing & Safety Verification Suite", () => {
  const ownerAuth: ServerAuthResult = {
    isAuthenticated: true,
    userId: "usr_owner_official",
    role: "OWNER",
    isAstrologer: false,
    isAdmin: true,
    isOwner: true,
    email: "aapkaastro1606@gmail.com",
    permissions: ["pricing", "bookings", "staff", "content", "leads", "audit"],
    grants: [],
  };

  const staffAuth: ServerAuthResult = {
    isAuthenticated: true,
    userId: "usr_staff_restricted",
    role: "CLIENT",
    isAstrologer: false,
    isAdmin: false,
    isOwner: false,
    email: "editor@aapkaastro.com",
    permissions: ["content"],
    grants: [
      {
        id: "g1",
        email: "editor@aapkaastro.com",
        section: "content",
        accessLevel: "MANAGE",
        grantedAt: new Date().toISOString(),
        revokedAt: null,
      },
    ],
  };

  describe("1. Selective Cache Tag Revalidation (Zero Redeploy Needed)", () => {
    it("returns correct cache tags and route paths for FAQs updates", () => {
      const res = revalidateAffectedContent("faqs", "faq-1");
      assert.ok(res.tags.includes(CONTENT_CACHE_TAGS.ALL_CONTENT));
      assert.ok(res.tags.includes(CONTENT_CACHE_TAGS.COLLECTION("faqs")));
      assert.ok(res.tags.includes(CONTENT_CACHE_TAGS.ENTRY("faqs", "faq-1")));
      assert.ok(res.paths.includes("/"));
      assert.ok(res.paths.includes("/consult"));
    });

    it("returns correct cache tags and route paths for Pricing updates", () => {
      const res = revalidateAffectedContent("pricing");
      assert.ok(res.tags.includes(CONTENT_CACHE_TAGS.PRICING));
      assert.ok(res.paths.includes("/consult"));
      assert.ok(res.paths.includes("/pricing-policy"));
    });

    it("returns correct cache tags and route paths for Legal page updates", () => {
      const res = revalidateAffectedContent("legal");
      assert.ok(res.tags.includes(CONTENT_CACHE_TAGS.LEGAL));
      assert.ok(res.paths.includes("/terms"));
      assert.ok(res.paths.includes("/privacy-policy"));
      assert.ok(res.paths.includes("/refund-policy"));
      assert.ok(res.paths.includes("/disclaimer"));
    });

    it("returns correct cache tags and route paths for Contact and Social updates", () => {
      const res = revalidateAffectedContent("contact");
      assert.ok(res.paths.includes("/contact"));
      assert.ok(res.paths.includes("/consult"));
    });
  });

  describe("2. Server-Side Rate Limiting & Fail-Closed Protection", () => {
    it("allows requests under the rate limit threshold", () => {
      const testIp = `192.168.1.${Math.floor(Math.random() * 200 + 10)}`;
      const result = checkAdminRateLimit(testIp, 10, 60_000);
      assert.equal(result.allowed, true);
      assert.equal(result.remaining, 9);
    });

    it("fails closed (blocks) when sliding window limit is exceeded", () => {
      const testIp = `10.0.0.${Math.floor(Math.random() * 200 + 10)}`;
      const maxRequests = 3;

      for (let i = 0; i < maxRequests; i++) {
        const res = checkAdminRateLimit(testIp, maxRequests, 60_000);
        assert.equal(res.allowed, true);
      }

      // Next request must be blocked
      const blockedRes = checkAdminRateLimit(testIp, maxRequests, 60_000);
      assert.equal(blockedRes.allowed, false);
      assert.equal(blockedRes.remaining, 0);
      assert.ok(blockedRes.resetMs > 0);
    });
  });

  describe("3. Payload Size Ceiling Enforcement (2 MB DOS Prevention)", () => {
    it("accepts JSON payload within size boundary", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/content", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "test", data: "ok" }),
      });

      const parsed = await parseAndValidateJsonBody(req, { maxBodyBytes: 1024 * 1024 });
      assert.equal(parsed.success, true);
      assert.equal(parsed.data.action, "test");
    });

    it("rejects oversized payload via Content-Length header with 413 Payload Too Large", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/content", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": "3000000", // > 2MB
        },
        body: JSON.stringify({ action: "overflow" }),
      });

      const parsed = await parseAndValidateJsonBody(req, { maxBodyBytes: 2 * 1024 * 1024 });
      assert.equal(parsed.success, false);
      assert.equal(parsed.status, 413);
      assert.match(parsed.error, /Payload size.*exceeds/i);
    });

    it("rejects malformed JSON payload with 400 Bad Request", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/content", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{ malformed: json, ",
      });

      const parsed = await parseAndValidateJsonBody(req, { maxBodyBytes: 1024 * 1024 });
      assert.equal(parsed.success, false);
      assert.equal(parsed.status, 400);
      assert.match(parsed.error, /Malformed JSON payload/i);
    });
  });

  describe("4. Role-Based Access: Owner-Only Sections (Pricing, Payments, Legal, Audit)", () => {
    it("strictly verifies Owner identity for aapkaastro1606@gmail.com", () => {
      assert.equal(isOwnerEmail("aapkaastro1606@gmail.com"), true);
      assert.equal(isOwnerEmail("AAPKAASTRO1606@GMAIL.COM"), true);
      assert.equal(isOwnerEmail("staff@aapkaastro.com"), false);
      assert.equal(isOwnerEmail("client@gmail.com"), false);
    });

    it("grants Owner full access to all sections", () => {
      assert.equal(hasStaffSectionAccess(ownerAuth, "pricing", "MANAGE"), true);
      assert.equal(hasStaffSectionAccess(ownerAuth, "staff", "MANAGE"), true);
      assert.equal(hasStaffSectionAccess(ownerAuth, "bookings", "MANAGE"), true);
      assert.equal(hasStaffSectionAccess(ownerAuth, "leads", "MANAGE"), true);
      assert.equal(hasStaffSectionAccess(ownerAuth, "content", "MANAGE"), true);
    });

    it("strictly rejects non-owner staff from pricing:VIEW and pricing:MANAGE", () => {
      assert.equal(hasStaffSectionAccess(staffAuth, "pricing", "VIEW"), false);
      assert.equal(hasStaffSectionAccess(staffAuth, "pricing", "MANAGE"), false);
    });

    it("strictly rejects non-owner staff from staff permissions:VIEW and MANAGE", () => {
      assert.equal(hasStaffSectionAccess(staffAuth, "staff", "VIEW"), false);
      assert.equal(hasStaffSectionAccess(staffAuth, "staff", "MANAGE"), false);
    });

    it("strictly rejects non-owner staff from UPI verification queue (bookings)", () => {
      assert.equal(hasStaffSectionAccess(staffAuth, "bookings", "VIEW"), false);
      assert.equal(hasStaffSectionAccess(staffAuth, "bookings", "MANAGE"), false);
    });

    it("POST /api/admin/pricing rejects non-owner staff with 403 Forbidden", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/pricing", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: `aapka_astro_mock_user=${encodeURIComponent(JSON.stringify(staffAuth))}`,
        },
        body: JSON.stringify({ chatRate: 100 }),
      });

      const res = await pricingPost(req);
      assert.equal(res.status, 403);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.match(json.message, /Owner/i);
    });

    it("POST /api/admin/payment-settings rejects non-owner staff with 403 Forbidden", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/payment-settings", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: `aapka_astro_mock_user=${encodeURIComponent(JSON.stringify(staffAuth))}`,
        },
        body: JSON.stringify({ upiId: "malicious@okaxis" }),
      });

      const res = await paymentPost(req);
      assert.equal(res.status, 403);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.match(json.message, /Owner/i);
    });

    it("GET /api/admin/audit rejects non-owner staff with 403 Forbidden", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/audit", {
        headers: {
          cookie: `aapka_astro_mock_user=${encodeURIComponent(JSON.stringify(staffAuth))}`,
        },
      });

      const res = await auditGet(req);
      assert.equal(res.status, 403);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.match(json.message, /Owner/i);
    });

    it("GET /api/admin/audit allows platform Owner with 200 OK", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/audit?limit=5", {
        headers: {
          cookie: `aapka_astro_mock_user=${encodeURIComponent(JSON.stringify(ownerAuth))}`,
        },
      });

      const res = await auditGet(req);
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.ok(Array.isArray(json.logs));
    });
  });
});
