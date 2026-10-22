import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  UserRole,
  isAstrologerRole,
  isAdminRole,
  isOwnerRole,
  evaluateRouteAccess,
} from "../src/lib/auth/roles";
import { isOwnerEmail } from "../src/lib/auth/staffPermissions";
import { getAuthFromRequest, getServerAuthUser, __setTestAuthUser } from "../src/lib/auth/serverAuth";
import { NextRequest } from "next/server";
import { POST as presencePost } from "../src/app/api/astrologer/presence/route";
import { GET as staffGet } from "../src/app/api/admin/staff/route";

describe("Role-Based Access Control (RBAC) - Layer 1: UI Visibility Primitives", () => {
  test("anonymous visitor cannot qualify for astrologer or admin privilege", () => {
    assert.strictEqual(isAstrologerRole(null), false);
    assert.strictEqual(isAstrologerRole(undefined), false);
    assert.strictEqual(isAdminRole(null), false);
    assert.strictEqual(isAdminRole(undefined), false);
  });

  test("client role ('CLIENT') is strictly forbidden from operator/astrologer privilege", () => {
    const role: UserRole = "CLIENT";
    assert.strictEqual(isAstrologerRole(role), false);
    assert.strictEqual(isAdminRole(role), false);
  });

  test("astrologer role ('ASTROLOGER') qualifies for operator privilege but not platform admin", () => {
    const role: UserRole = "ASTROLOGER";
    assert.strictEqual(isAstrologerRole(role), true);
    assert.strictEqual(isAdminRole(role), false);
  });

  test("admin role ('ADMIN') possesses both operator and platform admin privilege", () => {
    const role: UserRole = "ADMIN";
    assert.strictEqual(isAstrologerRole(role), true);
    assert.strictEqual(isAdminRole(role), true);
    assert.strictEqual(isOwnerRole(role), false);
  });

  test("owner role ('OWNER') possesses all operator, admin, and owner privileges", () => {
    const role: UserRole = "OWNER";
    assert.strictEqual(isOwnerRole(role), true);
    assert.strictEqual(isAdminRole(role), true);
    assert.strictEqual(isAstrologerRole(role), true);
  });

  test("case insensitivity and whitespace resilience in role evaluation", () => {
    assert.strictEqual(isAstrologerRole("astrologer" as any), true);
    assert.strictEqual(isAstrologerRole("admin" as any), true);
    assert.strictEqual(isAstrologerRole("client" as any), false);
    assert.strictEqual(isAdminRole("admin" as any), true);
    assert.strictEqual(isAdminRole("astrologer" as any), false);
    assert.strictEqual(isOwnerRole("owner" as any), true);
    assert.strictEqual(isOwnerRole("  OWNER  " as any), true);
    assert.strictEqual(isOwnerRole("admin" as any), false);
  });
});

describe("Role-Based Access Control (RBAC) - Layer 2: Route-Level & Server-Side Enforcement", () => {
  test("unauthenticated visitor requesting /dashboard is redirected to /login", () => {
    const access = evaluateRouteAccess("/dashboard", null, false);
    assert.strictEqual(access.allowed, false);
    if (!access.allowed) {
      assert.match(access.redirectUrl, /^\/login\?redirect_url=%2Fdashboard/);
    }
  });

  test("unauthenticated visitor requesting /dashboard/* subroutes is redirected to /login", () => {
    const access = evaluateRouteAccess("/dashboard/clients", null, false);
    assert.strictEqual(access.allowed, false);
    if (!access.allowed) {
      assert.match(access.redirectUrl, /^\/login\?redirect_url=%2Fdashboard%2Fclients/);
    }
  });

  test("unauthenticated visitor requesting /admin/* is redirected to /login", () => {
    const access = evaluateRouteAccess("/admin/analytics", null, false);
    assert.strictEqual(access.allowed, false);
    if (!access.allowed) {
      assert.match(access.redirectUrl, /^\/login\?redirect_url=%2Fadmin%2Fanalytics/);
    }
  });

  test("unauthenticated visitor requesting /astrologer cockpit is redirected to /login", () => {
    const access = evaluateRouteAccess("/astrologer", null, false);
    assert.strictEqual(access.allowed, false);
    if (!access.allowed) {
      assert.match(access.redirectUrl, /^\/login\?redirect_url=%2Fastrologer/);
    }
  });

  test("client account accessing /dashboard is rejected and redirected to /account", () => {
    const access = evaluateRouteAccess("/dashboard", "CLIENT", true);
    assert.strictEqual(access.allowed, false);
    if (!access.allowed) {
      assert.strictEqual(access.redirectUrl, "/account");
      assert.match(access.reason, /denied/i);
    }
  });

  test("client account accessing /dashboard subpages is rejected and redirected to /account", () => {
    const access = evaluateRouteAccess("/dashboard/earnings", "CLIENT", true);
    assert.strictEqual(access.allowed, false);
    if (!access.allowed) {
      assert.strictEqual(access.redirectUrl, "/account");
    }
  });

  test("client account accessing /admin routes is rejected and redirected to /account", () => {
    const access = evaluateRouteAccess("/admin/pricing", "CLIENT", true);
    assert.strictEqual(access.allowed, false);
    if (!access.allowed) {
      assert.strictEqual(access.redirectUrl, "/account");
    }
  });

  test("client account accessing /astrologer is rejected and redirected to /account", () => {
    const access = evaluateRouteAccess("/astrologer", "CLIENT", true);
    assert.strictEqual(access.allowed, false);
    if (!access.allowed) {
      assert.strictEqual(access.redirectUrl, "/account");
    }
  });

  test("astrologer account accessing /admin is redirected to /dashboard", () => {
    const access = evaluateRouteAccess("/admin/analytics", "ASTROLOGER", true);
    assert.strictEqual(access.allowed, false);
    if (!access.allowed) {
      assert.strictEqual(access.redirectUrl, "/dashboard");
    }
  });

  test("astrologer account accessing /dashboard and /astrologer is allowed", () => {
    const accessDash = evaluateRouteAccess("/dashboard", "ASTROLOGER", true);
    assert.strictEqual(accessDash.allowed, true);

    const accessSub = evaluateRouteAccess("/dashboard/clients", "ASTROLOGER", true);
    assert.strictEqual(accessSub.allowed, true);

    const accessAstro = evaluateRouteAccess("/astrologer", "ASTROLOGER", true);
    assert.strictEqual(accessAstro.allowed, true);
  });

  test("admin account has unrestricted access across both /dashboard and /admin", () => {
    const accessAdmin = evaluateRouteAccess("/admin/pricing", "ADMIN", true);
    assert.strictEqual(accessAdmin.allowed, true);

    const accessDash = evaluateRouteAccess("/dashboard", "ADMIN", true);
    assert.strictEqual(accessDash.allowed, true);
  });

  test("public routes remain accessible to all unauthenticated visitors", () => {
    assert.strictEqual(evaluateRouteAccess("/", null, false).allowed, true);
    assert.strictEqual(evaluateRouteAccess("/kundli", null, false).allowed, true);
    assert.strictEqual(evaluateRouteAccess("/panchang", null, false).allowed, true);
    assert.strictEqual(evaluateRouteAccess("/horoscope", null, false).allowed, true);
    assert.strictEqual(evaluateRouteAccess("/love-calculator", null, false).allowed, true);
  });
});

describe("Role-Based Access Control (RBAC) - Request & Cookie Extraction", () => {
  test("getAuthFromRequest handles unauthenticated requests without session cookies", () => {
    const req = new NextRequest("http://localhost:3000/dashboard");
    const auth = getAuthFromRequest(req);
    assert.strictEqual(auth.isAuthenticated, false);
    assert.strictEqual(auth.isAstrologer, false);
    assert.strictEqual(auth.isAdmin, false);
    assert.strictEqual(auth.role, null);
  });

  test("getAuthFromRequest rejects client session cookie and denies mock cookies", () => {
    const req = new NextRequest("http://localhost:3000/dashboard", {
      headers: {
        cookie: "aapka_astro_session=active; aapka_astro_role=CLIENT",
      },
    });
    const auth = getAuthFromRequest(req);
    assert.strictEqual(auth.isAuthenticated, false);
    assert.strictEqual(auth.role, null);
  });

  test("getAuthFromRequest rejects astrologer session cookie", () => {
    const req = new NextRequest("http://localhost:3000/dashboard", {
      headers: {
        cookie: "aapka_astro_session=active; aapka_astro_role=ASTROLOGER",
      },
    });
    const auth = getAuthFromRequest(req);
    assert.strictEqual(auth.isAuthenticated, false);
    assert.strictEqual(auth.role, null);
  });

  test("getAuthFromRequest strictly rejects mock user JSON cookie", () => {
    const mockUser = {
      id: "usr_mock_123",
      name: "Aarav",
      email: "seeker@aapkaastro.com",
      role: "CLIENT",
    };
    const req = new NextRequest("http://localhost:3000/dashboard", {
      headers: {
        cookie: `aapka_astro_mock_user=${encodeURIComponent(JSON.stringify(mockUser))}`,
      },
    });
    const auth = getAuthFromRequest(req);
    assert.strictEqual(auth.isAuthenticated, false);
    assert.strictEqual(auth.userId, null);
    assert.strictEqual(auth.role, null);
  });
});

describe("Role-Based Access Control (RBAC) - API Endpoint Role Gating", () => {
  test("POST /api/astrologer/presence returns 403 Forbidden for unauthenticated request", async () => {
    __setTestAuthUser(null);
    const req = new NextRequest("http://localhost:3000/api/astrologer/presence", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ status: "OFFLINE" }),
    });

    const res = await presencePost(req);
    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.match(body.message, /Forbidden/i);
  });

  test("POST /api/astrologer/presence returns 403 Forbidden for client account", async () => {
    __setTestAuthUser({ isAuthenticated: true, role: "CLIENT", isAstrologer: false, isAdmin: false });
    const req = new NextRequest("http://localhost:3000/api/astrologer/presence", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: "aapka_astro_session=active; aapka_astro_role=CLIENT",
      },
      body: JSON.stringify({ status: "OFFLINE" }),
    });

    const res = await presencePost(req);
    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    __setTestAuthUser(null);
  });

  test("POST /api/astrologer/presence permits astrologer role", async () => {
    __setTestAuthUser({ isAuthenticated: true, role: "ASTROLOGER", isAstrologer: true, isAdmin: false });
    const req = new NextRequest("http://localhost:3000/api/astrologer/presence", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ status: "AVAILABLE", statusMessage: "Live & Ready" }),
    });

    const res = await presencePost(req);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.presence.status, "AVAILABLE");
    __setTestAuthUser(null);
  });
});

describe("Role-Based Access Control (RBAC) - Anti-Tamper & Owner Role Protection", () => {
  test("non-owner account attempting to pass aapka_astro_role=OWNER cookie is strictly unauthenticated", () => {
    const req = new NextRequest("http://localhost:3000/dashboard", {
      headers: {
        cookie: "aapka_astro_session=active; aapka_astro_role=OWNER; aapka_astro_email=attacker@malicious.com",
      },
    });

    const auth = getAuthFromRequest(req);
    assert.strictEqual(auth.isAuthenticated, false);
    assert.strictEqual(auth.role, null);
    assert.strictEqual(auth.isOwner, false);
    assert.strictEqual(auth.isAdmin, false);
    assert.strictEqual(auth.isAstrologer, false);
  });

  test("non-owner passing mock user cookie with role='OWNER' is strictly unauthenticated", () => {
    const forgedMockUser = {
      id: "usr_attacker_666",
      name: "Attacker",
      email: "attacker@gmail.com",
      role: "OWNER",
    };

    const req = new NextRequest("http://localhost:3000/dashboard", {
      headers: {
        cookie: `aapka_astro_mock_user=${encodeURIComponent(JSON.stringify(forgedMockUser))}`,
      },
    });

    const auth = getAuthFromRequest(req);
    assert.strictEqual(auth.isAuthenticated, false);
    assert.strictEqual(auth.role, null);
    assert.strictEqual(auth.isOwner, false);
    assert.strictEqual(auth.isAdmin, false);
    assert.strictEqual(auth.isAstrologer, false);
  });

  test("unauthenticated or email-less user claiming OWNER is strictly unauthenticated", () => {
    const req = new NextRequest("http://localhost:3000/dashboard", {
      headers: {
        cookie: "aapka_astro_session=active; aapka_astro_role=OWNER",
      },
    });

    const auth = getAuthFromRequest(req);
    assert.strictEqual(auth.isAuthenticated, false);
    assert.strictEqual(auth.role, null);
    assert.strictEqual(auth.isOwner, false);
  });

  test("authenticated user with OWNER_EMAIL is recognized as OWNER with isOwner=true", async () => {
    __setTestAuthUser({
      isAuthenticated: true,
      userId: "usr_owner_real",
      role: "OWNER",
      isOwner: true,
      isAdmin: true,
      isAstrologer: true,
      email: "aapkaastro1606@gmail.com",
      permissions: ["bookings", "leads", "content", "pricing"],
    });

    const auth = await getServerAuthUser();
    assert.strictEqual(auth.isAuthenticated, true);
    assert.strictEqual(auth.role, "OWNER");
    assert.strictEqual(auth.isOwner, true);
    assert.strictEqual(auth.isAdmin, true);
    assert.strictEqual(auth.isAstrologer, true);
    assert.ok(auth.permissions.length > 0);
    __setTestAuthUser(null);
  });

  test("non-owner attempting to access /api/admin/staff with forged OWNER cookie receives 403 Forbidden", async () => {
    __setTestAuthUser(null);
    const req = new NextRequest("http://localhost:3000/api/admin/staff", {
      headers: {
        cookie: "aapka_astro_session=active; aapka_astro_role=OWNER; aapka_astro_email=attacker@malicious.com",
      },
    });

    const res = await staffGet(req);
    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.match(body.message, /Forbidden.*Owner/i);
  });

  test("admin role without owner email is denied access to /admin/staff in route evaluation", () => {
    const routeAccess = evaluateRouteAccess(
      "/admin/staff",
      "ADMIN",
      true,
      [],
      "generaladmin@vendor.com"
    );
    assert.strictEqual(routeAccess.allowed, false);
    if (!routeAccess.allowed) {
      assert.strictEqual(routeAccess.redirectUrl, "/dashboard");
      assert.match(routeAccess.reason, /Owner privilege strictly required/i);
    }
  });

  test("owner account has unrestricted route access across /admin/staff, /admin/pricing, /dashboard, and /account", () => {
    const routes = [
      "/admin/staff",
      "/admin/pricing",
      "/admin/analytics",
      "/dashboard",
      "/dashboard/blog",
      "/dashboard/reels",
      "/dashboard/clients",
      "/dashboard/earnings",
      "/astrologer",
      "/account",
    ];

    for (const route of routes) {
      const access = evaluateRouteAccess(
        route,
        "OWNER",
        true,
        [],
        "aapkaastro1606@gmail.com"
      );
      assert.strictEqual(access.allowed, true, `Owner must have access to ${route}`);
    }
  });
});

