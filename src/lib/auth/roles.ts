/**
 * Role-Based Access Control (RBAC) Definitions & Primitives
 *
 * Aapka Astro operates on a four-tier role taxonomy:
 * 1. CLIENT: Standard registered seeker/user (read public tools, consult, pay, wallet, account).
 * 2. ASTROLOGER: Verified practitioner/operator (cockpit, presence, live queue, customer intake, chart calculation).
 * 3. ADMIN: Platform administrator (operational controls, pricing management, analytics intelligence).
 * 4. OWNER: Platform Owner (the client himself; holds absolute unrestricted access to all sections and staff management).
 */

export type UserRole = "CLIENT" | "ASTROLOGER" | "ADMIN" | "OWNER";

/**
 * Returns true if the given role qualifies for platform Owner status.
 */
export function isOwnerRole(role: string | null | undefined): boolean {
  if (!role) return false;
  return role.trim().toUpperCase() === "OWNER";
}

/**
 * Returns true if the given role possesses full platform administrative privilege.
 * OWNER possesses a strict superset of ADMIN privileges.
 */
export function isAdminRole(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalized = role.trim().toUpperCase();
  return normalized === "ADMIN" || normalized === "OWNER";
}

/**
 * Returns true if the given role qualifies for astrologer/operator privilege.
 * Admin and Owner possess a strict superset of Astrologer privileges.
 */
export function isAstrologerRole(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalized = role.trim().toUpperCase();
  return (
    normalized === "ASTROLOGER" ||
    normalized === "ADMIN" ||
    normalized === "OWNER"
  );
}

import {
  isOwnerEmail,
  StaffSection,
  StaffGrant,
  AccessLevel,
} from "./staffPermissions";

export type RouteAccessResult =
  | { allowed: true }
  | { allowed: false; redirectUrl: string; reason: string; statusCode?: number };

/**
 * Pure evaluation function for route-level RBAC.
 * Used identically in Middleware, Server Layouts, and Automated Test Suites.
 *
 * Enforces the One Permission Policy:
 * 1. Bookings and payment verification: Owner Yes, Staff No, Client Own bookings only
 * 2. Payment settings, pricing, leads, team, diagnostics, legal pages: Owner Yes, Staff No, Client No
 * 3. Blog, reels, knowledge entries, site content: Owner Yes, Staff Yes if granted, Client No
 * 4. My account, my bookings, my Kundli: Owner Yes, Staff Yes, Client Own data only
 */
export function evaluateRouteAccess(
  pathname: string,
  role: UserRole | null,
  isAuthenticated: boolean,
  permissions?: (string | StaffGrant)[],
  email?: string | null,
  requiredLevel: AccessLevel = "VIEW"
): RouteAccessResult {
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAdminRoute = pathname.startsWith("/admin");
  const isAstrologerRoute = pathname.startsWith("/astrologer");
  const isAccountRoute = pathname.startsWith("/account");

  // Non-restricted public routes
  if (!isDashboardRoute && !isAdminRoute && !isAstrologerRoute && !isAccountRoute) {
    return { allowed: true };
  }

  // Account requires authentication
  if (isAccountRoute) {
    if (!isAuthenticated) {
      return {
        allowed: false,
        redirectUrl: `/login?redirect_url=${encodeURIComponent(pathname)}`,
        reason: "Authentication required to access account",
      };
    }
    return { allowed: true };
  }

  const isOwner = isOwnerRole(role) || isOwnerEmail(email);

  const perms: string[] = [];
  const grants: StaffGrant[] = [];

  if (Array.isArray(permissions)) {
    for (const item of permissions) {
      if (typeof item === "string") {
        perms.push(item);
      } else if (item && typeof item === "object" && "section" in item) {
        perms.push(item.section);
        grants.push(item as StaffGrant);
      }
    }
  }

  const hasAnyStaffPerm = perms.length > 0;

  function hasSectionPerm(section: StaffSection, level: AccessLevel = "VIEW"): boolean {
    if (isOwner) return true;
    if (grants.length > 0) {
      const grant = grants.find((g) => g.section === section);
      if (!grant) return false;
      if (level === "VIEW") return true;
      return grant.accessLevel === "MANAGE";
    }
    return perms.includes(section);
  }

  // Area 1: Bookings and payment verification queue (/admin/bookings) — Strictly Owner Only
  if (pathname.startsWith("/admin/bookings")) {
    if (!isAuthenticated) {
      return {
        allowed: false,
        redirectUrl: `/login?redirect_url=${encodeURIComponent(pathname)}`,
        reason: "Authentication required to access bookings queue",
      };
    }
    if (!isOwner) {
      return {
        allowed: false,
        redirectUrl: isAstrologerRole(role) || hasAnyStaffPerm ? "/dashboard" : "/account",
        reason: "Bookings and payment verification is strictly restricted to the Platform Owner",
      };
    }
    return { allowed: true };
  }

  // Team & Staff access management console: strictly requires Owner
  if (pathname.startsWith("/admin/team") || pathname.startsWith("/admin/staff")) {
    if (!isAuthenticated) {
      return {
        allowed: false,
        redirectUrl: `/login?redirect_url=${encodeURIComponent(pathname)}`,
        reason: "Authentication required to access team access management",
      };
    }
    if (!isOwner) {
      return {
        allowed: false,
        redirectUrl:
          isAstrologerRole(role) || hasAnyStaffPerm
            ? "/dashboard"
            : "/account",
        reason: "Platform Owner privilege strictly required for team access management",
      };
    }
    return { allowed: true };
  }

  // Area 2: Payment settings, pricing, leads, diagnostics, audit, analytics — Strictly Owner Only
  // (allows legacy ADMIN role when unencumbered by scoped staff grants)
  if (
    pathname.startsWith("/admin/pricing") ||
    pathname.startsWith("/admin/payment-settings") ||
    pathname.startsWith("/admin/leads") ||
    pathname.startsWith("/admin/diagnostics") ||
    pathname.startsWith("/admin/audit") ||
    pathname.startsWith("/admin/analytics")
  ) {
    if (!isAuthenticated) {
      return {
        allowed: false,
        redirectUrl: `/login?redirect_url=${encodeURIComponent(pathname)}`,
        reason: "Authentication required to access owner management console",
      };
    }
    if (!isOwner && !(isAdminRole(role) && !hasAnyStaffPerm)) {
      return {
        allowed: false,
        redirectUrl:
          isAstrologerRole(role) || hasAnyStaffPerm
            ? "/dashboard"
            : "/account",
        reason: "Platform Owner privilege strictly required for this management console",
      };
    }
    return { allowed: true };
  }

  // Area 3: Content Studio, Media Library, Knowledge Base under /admin
  if (pathname.startsWith("/admin/content") || pathname.startsWith("/admin/media")) {
    if (!isAuthenticated) {
      return {
        allowed: false,
        redirectUrl: `/login?redirect_url=${encodeURIComponent(pathname)}`,
        reason: "Authentication required to access content studio",
      };
    }
    if (!isOwner && !hasSectionPerm("content", requiredLevel)) {
      return {
        allowed: false,
        redirectUrl: isAstrologerRole(role) || hasAnyStaffPerm ? "/dashboard" : "/account",
        reason: `Staff member lacks content permission (${requiredLevel} required)`,
      };
    }
    return { allowed: true };
  }

  if (pathname.startsWith("/admin/knowledge")) {
    if (!isAuthenticated) {
      return {
        allowed: false,
        redirectUrl: `/login?redirect_url=${encodeURIComponent(pathname)}`,
        reason: "Authentication required to access knowledge base",
      };
    }
    if (!isOwner && !hasSectionPerm("knowledge", requiredLevel) && !hasSectionPerm("content", requiredLevel)) {
      return {
        allowed: false,
        redirectUrl: isAstrologerRole(role) || hasAnyStaffPerm ? "/dashboard" : "/account",
        reason: `Staff member lacks knowledge permission (${requiredLevel} required)`,
      };
    }
    return { allowed: true };
  }

  // General Admin hub (/admin)
  if (isAdminRoute) {
    if (!isAuthenticated) {
      return {
        allowed: false,
        redirectUrl: `/login?redirect_url=${encodeURIComponent(pathname)}`,
        reason: "Authentication required to access admin intelligence",
      };
    }
    const hasAdminPerm =
      isOwner ||
      (isAdminRole(role) && !hasAnyStaffPerm) ||
      hasSectionPerm("content", "VIEW") ||
      hasSectionPerm("knowledge", "VIEW");

    if (!hasAdminPerm) {
      return {
        allowed: false,
        redirectUrl:
          isAstrologerRole(role) || hasAnyStaffPerm
            ? "/dashboard"
            : "/account",
        reason: "Strict section permission required for admin dashboard",
      };
    }
    return { allowed: true };
  }

  // Operator Cockpit & Dashboard routes (/dashboard and /astrologer)
  if (isDashboardRoute || isAstrologerRoute) {
    if (!isAuthenticated) {
      return {
        allowed: false,
        redirectUrl: `/login?redirect_url=${encodeURIComponent(pathname)}`,
        reason: "Authentication required to access operator cockpit",
      };
    }

    // A client with no staff permissions must be denied from the cockpit entirely
    if (!isOwner && !hasAnyStaffPerm && !isAstrologerRole(role)) {
      return {
        allowed: false,
        redirectUrl: "/account",
        reason: "Client role denied access to operator cockpit",
      };
    }

    // Section-level checks for every specific dashboard subroute
    if (!isOwner) {
      if (pathname.startsWith("/dashboard/blog") && !hasSectionPerm("blog", requiredLevel)) {
        return {
          allowed: false,
          redirectUrl: "/dashboard",
          reason: `Staff member lacks blog permission (${requiredLevel} required)`,
        };
      }
      if (pathname.startsWith("/dashboard/reels") && !hasSectionPerm("reels", requiredLevel)) {
        return {
          allowed: false,
          redirectUrl: "/dashboard",
          reason: `Staff member lacks reels permission (${requiredLevel} required)`,
        };
      }
      if (pathname.startsWith("/dashboard/clients") && !hasSectionPerm("clients", requiredLevel) && !isAstrologerRole(role)) {
        return {
          allowed: false,
          redirectUrl: "/dashboard",
          reason: `Staff member lacks clients permission (${requiredLevel} required)`,
        };
      }
      if (pathname.startsWith("/dashboard/earnings") && !hasSectionPerm("earnings", requiredLevel) && !isAstrologerRole(role)) {
        return {
          allowed: false,
          redirectUrl: "/dashboard",
          reason: `Staff member lacks earnings permission (${requiredLevel} required)`,
        };
      }
    }

    return { allowed: true };
  }

  return { allowed: true };
}
