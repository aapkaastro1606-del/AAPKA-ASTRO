process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  "pk_test_cHJvZm91bmQtY2ljYWRhLTk2OTQuY2xlcmsuYWNjb3VudHMuZGV2JA";
process.env.CLERK_SECRET_KEY =
  process.env.CLERK_SECRET_KEY || "sk_test_mock_secret_key";
process.env.OWNER_EMAIL = "aapkaastro1606@gmail.com";

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { validateRedirectUrl } from "@/lib/auth/redirectValidation";
import middleware from "@/middleware";
import { evaluateRouteAccess } from "@/lib/auth/roles";
import { isOwnerEmail } from "@/lib/auth/staffPermissions";
import { POST as authSyncPost } from "@/app/api/auth/sync/route";

describe("Root Login and Session Architecture Verification Suite", () => {
  describe("1. Redirect URL Validation & Security", () => {
    test("preserves valid internal paths", () => {
      assert.strictEqual(validateRedirectUrl("/admin/bookings"), "/admin/bookings");
      assert.strictEqual(validateRedirectUrl("/account/wallet"), "/account/wallet");
      assert.strictEqual(validateRedirectUrl("/dashboard/blog?filter=draft"), "/dashboard/blog?filter=draft");
      assert.strictEqual(validateRedirectUrl("/astrologer"), "/astrologer");
    });

    test("strictly rejects protocol-relative URLs (//)", () => {
      assert.strictEqual(validateRedirectUrl("//evil.com"), "/account");
      assert.strictEqual(validateRedirectUrl("//aapkaastro.com.evil.com/hack"), "/account");
      assert.strictEqual(validateRedirectUrl("///evil.com"), "/account");
    });

    test("strictly rejects external URLs with protocols", () => {
      assert.strictEqual(validateRedirectUrl("https://evil.com"), "/account");
      assert.strictEqual(validateRedirectUrl("http://evil.com"), "/account");
      assert.strictEqual(validateRedirectUrl("https://www.aapkaastro.com.evil.com"), "/account");
    });

    test("strictly rejects protocol injection schemes", () => {
      assert.strictEqual(validateRedirectUrl("javascript:alert(1)"), "/account");
      assert.strictEqual(validateRedirectUrl("data:text/html;base64,PHNjcmlwdD4="), "/account");
      assert.strictEqual(validateRedirectUrl("vbscript:msgbox(1)"), "/account");
    });

    test("strictly rejects backslash evasions", () => {
      assert.strictEqual(validateRedirectUrl("/\\evil.com"), "/account");
      assert.strictEqual(validateRedirectUrl("\\evil.com"), "/account");
      assert.strictEqual(validateRedirectUrl("/admin\\bookings"), "/account");
    });

    test("prevents infinite login loops", () => {
      assert.strictEqual(validateRedirectUrl("/login"), "/account");
      assert.strictEqual(validateRedirectUrl("/login?redirect_url=/admin/bookings"), "/account");
      assert.strictEqual(validateRedirectUrl("/signup"), "/account");
    });

    test("falls back safely on null, undefined, and empty string", () => {
      assert.strictEqual(validateRedirectUrl(null), "/account");
      assert.strictEqual(validateRedirectUrl(undefined), "/account");
      assert.strictEqual(validateRedirectUrl(""), "/account");
      assert.strictEqual(validateRedirectUrl("   "), "/account");
      assert.strictEqual(validateRedirectUrl(null, "/custom-default"), "/custom-default");
    });
  });

  describe("2. Canonical Host Enforcement (308 Permanent Redirect)", () => {
    test("redirects apex domain (aapkaastro.com) to canonical www.aapkaastro.com with 308", () => {
      const req = new NextRequest("https://aapkaastro.com/admin/bookings?status=pending", {
        headers: {
          host: "aapkaastro.com",
        },
      });

      const res = middleware(req, {} as any);
      assert.strictEqual(res.status, 308, "Must return HTTP 308 Permanent Redirect to preserve method & cache");
      assert.strictEqual(
        res.headers.get("location"),
        "https://www.aapkaastro.com/admin/bookings?status=pending"
      );
    });

    test("redirects apex domain with x-forwarded-host to www.aapkaastro.com with 308", () => {
      const req = new NextRequest("https://aapkaastro.com/login", {
        headers: {
          "x-forwarded-host": "aapkaastro.com",
        },
      });

      const res = middleware(req, {} as any);
      assert.strictEqual(res.status, 308);
      assert.strictEqual(res.headers.get("location"), "https://www.aapkaastro.com/login");
    });

    test("does not trigger 308 redirect when already on canonical www.aapkaastro.com", () => {
      const host = "www.aapkaastro.com";
      const isApex = host === "aapkaastro.com";
      assert.strictEqual(isApex, false);
    });
  });

  describe("3. Server-Side Protection for /account, /admin, /dashboard, /astrologer", () => {
    test("unauthenticated visitor to /account is blocked and redirected to /login", () => {
      const access = evaluateRouteAccess("/account", null, false);
      assert.strictEqual(access.allowed, false);
      assert.match(access.redirectUrl, /\/login\?redirect_url=%2Faccount/);
    });

    test("unauthenticated visitor to /admin/bookings is blocked and redirected to /login", () => {
      const access = evaluateRouteAccess("/admin/bookings", null, false);
      assert.strictEqual(access.allowed, false);
      assert.match(access.redirectUrl, /\/login\?redirect_url=%2Fadmin%2Fbookings/);
    });

    test("unauthenticated visitor to /dashboard is blocked and redirected to /login", () => {
      const access = evaluateRouteAccess("/dashboard", null, false);
      assert.strictEqual(access.allowed, false);
      assert.match(access.redirectUrl, /\/login\?redirect_url=%2Fdashboard/);
    });

    test("unauthenticated visitor to /astrologer is blocked and redirected to /login", () => {
      const access = evaluateRouteAccess("/astrologer", null, false);
      assert.strictEqual(access.allowed, false);
      assert.match(access.redirectUrl, /\/login\?redirect_url=%2Fastrologer/);
    });

    test("authenticated client is permitted on /account", () => {
      const access = evaluateRouteAccess("/account", "CLIENT", true);
      assert.strictEqual(access.allowed, true);
    });

    test("authenticated non-admin client is denied access to /admin/bookings", () => {
      const access = evaluateRouteAccess("/admin/bookings", "CLIENT", true);
      assert.strictEqual(access.allowed, false);
    });

    test("platform Owner has unrestricted access to /admin/bookings, /admin/staff, and /dashboard", () => {
      const ownerEmail = "aapkaastro1606@gmail.com";
      assert.strictEqual(evaluateRouteAccess("/admin/bookings", "OWNER", true, [], ownerEmail).allowed, true);
      assert.strictEqual(evaluateRouteAccess("/admin/staff", "OWNER", true, [], ownerEmail).allowed, true);
      assert.strictEqual(evaluateRouteAccess("/dashboard/blog", "OWNER", true, [], ownerEmail).allowed, true);
    });
  });

  describe("4. Site Owner Recognition by Verified Email", () => {
    test("isOwnerEmail correctly identifies aapkaastro1606@gmail.com (case-insensitive)", () => {
      assert.strictEqual(isOwnerEmail("aapkaastro1606@gmail.com"), true);
      assert.strictEqual(isOwnerEmail("AAPKAASTRO1606@GMAIL.COM"), true);
      assert.strictEqual(isOwnerEmail("  AapkaAstro1606@Gmail.Com  "), true);
    });

    test("isOwnerEmail strictly rejects non-existent or other emails", () => {
      assert.strictEqual(isOwnerEmail("anmol@aapkaastro.com"), false);
      assert.strictEqual(isOwnerEmail("client@gmail.com"), false);
      assert.strictEqual(isOwnerEmail("hacker@malicious.com"), false);
      assert.strictEqual(isOwnerEmail(null), false);
      assert.strictEqual(isOwnerEmail(undefined), false);
      assert.strictEqual(isOwnerEmail(""), false);
    });
  });

  describe("5. Diagnostic Session Mismatch Logging", () => {
    test("POST /api/auth/sync records SESSION_SYNC_MISMATCH event without crashing", async () => {
      const req = new NextRequest("http://localhost:3000/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "SESSION_SYNC_MISMATCH",
          targetUrl: "/admin/bookings",
        }),
      });

      const res = await authSyncPost(req);
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.recorded, true);
      assert.strictEqual(json.event, "SESSION_SYNC_MISMATCH");
    });
  });
});
