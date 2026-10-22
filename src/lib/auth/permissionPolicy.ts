/**
 * ============================================================================
 * ONE PERMISSION POLICY — AAPKA ASTRO CANONICAL ACCESS CONTROL MODULE
 * ============================================================================
 *
 * This module is the single source of truth for permission policy across:
 * - Page guards (Server Components in /admin and /dashboard)
 * - Admin Layout & Dashboard Layout
 * - Admin Sidebar & navigation menus
 * - API route handlers (/api/admin/* and /api/dashboard/*)
 *
 * ----------------------------------------------------------------------------
 * FOUR CANONICAL AREAS MATRIX:
 * ----------------------------------------------------------------------------
 * 1. Bookings and payment verification:
 *    - Owner: Yes
 *    - Staff: No
 *    - Client: Own bookings only (via client account pages/APIs)
 *
 * 2. Payment settings, pricing, leads, team, diagnostics, legal pages:
 *    - Owner: Yes
 *    - Staff: No
 *    - Client: No
 *
 * 3. Blog, reels, knowledge entries, site content:
 *    - Owner: Yes
 *    - Staff: Yes (only if granted that specific section)
 *    - Client: No
 *
 * 4. My account, my bookings, my Kundli:
 *    - Owner: Yes
 *    - Staff: Yes
 *    - Client: Own data only
 * ============================================================================
 */

import { ServerAuthResult } from "./serverAuth";

export type PolicyArea =
  | "BOOKINGS_AND_PAYMENTS"
  | "OWNER_ONLY_MANAGEMENT"
  | "CONTENT_AND_EDITORIAL"
  | "USER_ACCOUNT_AND_PERSONAL";

export type StaffSection =
  | "blog"
  | "reels"
  | "clients"
  | "earnings"
  | "consultations"
  | "pricing"
  | "analytics"
  | "staff"
  | "bookings"
  | "leads"
  | "content"
  | "knowledge";

export type AccessLevel = "VIEW" | "MANAGE";

export interface StaffSectionMeta {
  id: StaffSection;
  name: string;
  path: string;
  description: string;
  area: PolicyArea;
  ownerOnly: boolean;
}

/**
 * Master catalog of sections with canonical Area classifications and Owner-only enforcement.
 * Note: 'bookings', 'pricing', 'staff', 'leads', 'analytics' are strictly owner-only.
 * Staff members CANNOT be assigned owner-only sections.
 */
export const MASTER_SECTIONS: readonly StaffSectionMeta[] = [
  // Area 1: Bookings and payment verification (Owner: Yes, Staff: No, Client: Own bookings only)
  {
    id: "bookings",
    name: "UPI Verification Queue",
    path: "/admin/bookings",
    description: "Verify direct UPI bank receipts, approve/reject bookings, and schedule consultation links (Owner Only).",
    area: "BOOKINGS_AND_PAYMENTS",
    ownerOnly: true,
  },

  // Area 2: Payment settings, pricing, leads, team, diagnostics, legal pages (Owner: Yes, Staff: No, Client: No)
  {
    id: "pricing",
    name: "Pricing & Coupons",
    path: "/admin/pricing",
    description: "Configure flat-fee consultation products, festive promotions, and promotional pricing (Owner Only).",
    area: "OWNER_ONLY_MANAGEMENT",
    ownerOnly: true,
  },
  {
    id: "staff",
    name: "Staff Permissions",
    path: "/admin/staff",
    description: "Assign or revoke per-section access for site employees (Owner Only).",
    area: "OWNER_ONLY_MANAGEMENT",
    ownerOnly: true,
  },
  {
    id: "leads",
    name: "Kundli Leads",
    path: "/admin/leads",
    description: "Manage seekers who generated free Kundlis with consent, filter leads, and export to CSV (Owner Only).",
    area: "OWNER_ONLY_MANAGEMENT",
    ownerOnly: true,
  },
  {
    id: "analytics",
    name: "Platform Intelligence",
    path: "/admin/analytics",
    description: "View conversion funnels, traffic sources, and consultation volume metrics (Owner Only).",
    area: "OWNER_ONLY_MANAGEMENT",
    ownerOnly: true,
  },

  // Area 3: Blog, reels, knowledge entries, site content (Owner: Yes, Staff: Yes if granted, Client: No)
  {
    id: "blog",
    name: "Blog Post Manager",
    path: "/dashboard/blog",
    description: "Create, edit, draft, and publish astrology articles & SEO content.",
    area: "CONTENT_AND_EDITORIAL",
    ownerOnly: false,
  },
  {
    id: "reels",
    name: "Instagram Reel Curation",
    path: "/dashboard/reels",
    description: "Curate, pin, hide, and sync reels from @aapkaastrologer feed.",
    area: "CONTENT_AND_EDITORIAL",
    ownerOnly: false,
  },
  {
    id: "content",
    name: "Content Studio",
    path: "/admin/content",
    description: "Edit FAQs, contact details, social links, hero announcements, and seeker testimonials without coding.",
    area: "CONTENT_AND_EDITORIAL",
    ownerOnly: false,
  },
  {
    id: "knowledge",
    name: "Chatbot Knowledge Base",
    path: "/admin/knowledge",
    description: "Manage AI Chatbot knowledge entries, resolved answers, and FAQs.",
    area: "CONTENT_AND_EDITORIAL",
    ownerOnly: false,
  },
  {
    id: "clients",
    name: "Client Intake Profiles",
    path: "/dashboard/clients",
    description: "View seeker birth details, consultation history, and remedy notes.",
    area: "CONTENT_AND_EDITORIAL",
    ownerOnly: false,
  },
  {
    id: "earnings",
    name: "Revenue & Earnings",
    path: "/dashboard/earnings",
    description: "View consultations delivered, earnings breakdown, and settled revenue.",
    area: "CONTENT_AND_EDITORIAL",
    ownerOnly: false,
  },
  {
    id: "consultations",
    name: "Live Operator Cockpit",
    path: "/dashboard",
    description: "Manage live waiting queue, accept incoming calls, and run session workbench.",
    area: "CONTENT_AND_EDITORIAL",
    ownerOnly: false,
  },
];

/**
 * Re-export of STAFF_SECTIONS for backward compatibility across the codebase.
 */
export const STAFF_SECTIONS = MASTER_SECTIONS;

/**
 * List of sections that can be granted to staff members.
 * Strictly excludes Owner-only sections (bookings, pricing, staff, leads, analytics, etc.).
 */
export const STAFF_GRANTABLE_SECTIONS: readonly StaffSectionMeta[] = MASTER_SECTIONS.filter(
  (s) => !s.ownerOnly
);

/**
 * Checks whether a given section ID is grantable to staff.
 */
export function isGrantableStaffSection(sectionId: string): boolean {
  return STAFF_GRANTABLE_SECTIONS.some((s) => s.id === sectionId);
}

/**
 * Sidebar Navigation Item definition
 */
export interface SidebarItem {
  id: string;
  name: string;
  path: string;
  area: PolicyArea;
  ownerOnly: boolean;
  badge?: string;
}

/**
 * Evaluates whether an authenticated user has access to a specific Policy Area.
 */
export function canAccessPolicyArea(
  area: PolicyArea,
  auth: ServerAuthResult | null | undefined
): boolean {
  if (!auth || !auth.isAuthenticated) return false;
  if (auth.isOwner) return true;

  switch (area) {
    case "BOOKINGS_AND_PAYMENTS":
      // Staff: No. Only Owner can access admin bookings & verification.
      return false;

    case "OWNER_ONLY_MANAGEMENT":
      // Staff: No. Only Owner can access pricing, payment settings, leads, team, diagnostics, legal.
      return false;

    case "CONTENT_AND_EDITORIAL":
      // Staff: Yes, only if granted at least one section in this area.
      return (
        Array.isArray(auth.permissions) &&
        auth.permissions.some((p) => {
          const section = MASTER_SECTIONS.find((s) => s.id === p);
          return section && section.area === "CONTENT_AND_EDITORIAL";
        })
      );

    case "USER_ACCOUNT_AND_PERSONAL":
      // Owner: Yes, Staff: Yes, Client: Yes (all authenticated users have access to personal area)
      return true;

    default:
      return false;
  }
}

/**
 * Evaluates whether an authenticated user has access to a specific section.
 */
export function canAccessSection(
  auth: ServerAuthResult | null | undefined,
  sectionId: string,
  level: AccessLevel = "VIEW"
): boolean {
  if (!auth || !auth.isAuthenticated) return false;
  if (auth.isOwner) return true;

  const sectionMeta = MASTER_SECTIONS.find((s) => s.id === sectionId);
  if (!sectionMeta) {
    // If not found in master catalog, default to fail-closed
    return false;
  }

  // Owner-only sections are strictly denied to all non-owners
  if (sectionMeta.ownerOnly) {
    return false;
  }

  // Area 1 & 2 are strictly denied to staff
  if (sectionMeta.area === "BOOKINGS_AND_PAYMENTS" || sectionMeta.area === "OWNER_ONLY_MANAGEMENT") {
    return false;
  }

  // Check grants for the specific section
  if (auth.grants && auth.grants.length > 0) {
    const grant = auth.grants.find((g) => g.section === sectionId);
    if (!grant) return false;
    if (level === "VIEW") return true;
    return grant.accessLevel === "MANAGE";
  }

  // Fallback to string permissions array
  return Array.isArray(auth.permissions) && auth.permissions.includes(sectionId as StaffSection);
}

export interface RouteAccessDecision {
  allowed: boolean;
  reason?: string;
  isForbidden?: boolean;
  redirectToLogin?: boolean;
  returnUrl: string;
  returnLabel: string;
  sectionTitle?: string;
}

/**
 * Evaluates whether a user can access a specific web page route.
 * Returns a decision with structured details for rendering the Access Denied page
 * without ever falling into a redirect loop.
 */
export function canAccessRoute(
  auth: ServerAuthResult | null | undefined,
  pathname: string,
  searchParams?: Record<string, string> | null
): RouteAccessDecision {
  const normPath = pathname.toLowerCase();

  // Public routes (homepage, about, panchang, horoscope, kundli free calculation, legal views)
  const isPublic =
    normPath === "/" ||
    normPath.startsWith("/about") ||
    normPath.startsWith("/panchang") ||
    normPath.startsWith("/horoscope") ||
    normPath.startsWith("/kundli") ||
    normPath.startsWith("/terms") ||
    normPath.startsWith("/privacy") ||
    normPath.startsWith("/refund") ||
    normPath.startsWith("/disclaimer") ||
    normPath.startsWith("/pricing") ||
    normPath.startsWith("/contact") ||
    normPath.startsWith("/reviews") ||
    normPath.startsWith("/reels") ||
    normPath.startsWith("/blog");

  const isAdmin = normPath.startsWith("/admin");
  const isDashboard = normPath.startsWith("/dashboard");
  const isAccount = normPath.startsWith("/account");

  // Determine return link fallback based on user's identity
  const getFallbackReturn = () => {
    if (!auth || !auth.isAuthenticated) {
      return { returnUrl: "/", returnLabel: "Return to Homepage" };
    }
    if (auth.isOwner) {
      return { returnUrl: "/admin", returnLabel: "Return to Admin Control Centre" };
    }
    if (auth.permissions && auth.permissions.length > 0) {
      // Find the first section they have access to
      const firstSection = MASTER_SECTIONS.find((s) => auth.permissions.includes(s.id));
      if (firstSection) {
        return { returnUrl: firstSection.path, returnLabel: `Return to ${firstSection.name}` };
      }
      return { returnUrl: "/dashboard", returnLabel: "Return to Dashboard" };
    }
    return { returnUrl: "/account", returnLabel: "Return to My Account" };
  };

  const fallback = getFallbackReturn();

  // 1. Unauthenticated checks for restricted routes
  if ((isAdmin || isDashboard || isAccount) && (!auth || !auth.isAuthenticated)) {
    return {
      allowed: false,
      redirectToLogin: true,
      reason: "Authentication required to access this page.",
      returnUrl: `/login?redirect_url=${encodeURIComponent(pathname)}`,
      returnLabel: "Go to Login",
    };
  }

  // If public route, allow
  if (!isAdmin && !isDashboard && !isAccount) {
    return {
      allowed: true,
      returnUrl: fallback.returnUrl,
      returnLabel: fallback.returnLabel,
    };
  }

  // 2. Personal Account Area (/account/*)
  if (isAccount) {
    // All authenticated users can access /account
    return {
      allowed: true,
      returnUrl: fallback.returnUrl,
      returnLabel: fallback.returnLabel,
    };
  }

  // 3. Platform Owner has unrestricted access to everything
  if (auth?.isOwner) {
    return {
      allowed: true,
      returnUrl: "/admin",
      returnLabel: "Return to Admin Control Centre",
    };
  }

  // 4. Clients without any staff permissions are forbidden from /admin and /dashboard
  const hasStaffPerms = Boolean(auth?.permissions && auth.permissions.length > 0);
  if (!hasStaffPerms && auth?.role !== "ASTROLOGER") {
    return {
      allowed: false,
      isForbidden: true,
      sectionTitle: isAdmin ? "Administration Control Centre" : "Operator Cockpit",
      reason: "You don't have access to this section. Administrative areas are restricted to authorized team members.",
      returnUrl: "/account",
      returnLabel: "Go to My Account",
    };
  }

  // 5. Area 1: Bookings and payment verification (/admin/bookings) — Owner Only
  if (normPath.startsWith("/admin/bookings")) {
    return {
      allowed: false,
      isForbidden: true,
      sectionTitle: "Bookings & UPI Verification",
      reason: "You don't have access to this section. Payment verification and booking approval is strictly reserved for the Platform Owner.",
      returnUrl: fallback.returnUrl,
      returnLabel: fallback.returnLabel,
    };
  }

  // 6. Area 2: Owner-Only Management pages
  // - Payment settings: /admin/payment-settings
  // - Pricing: /admin/pricing
  // - Leads: /admin/leads
  // - Team & Staff: /admin/team, /admin/staff
  // - Diagnostics: /admin/diagnostics
  // - Audit: /admin/audit
  // - Analytics: /admin/analytics
  if (
    normPath.startsWith("/admin/pricing") ||
    normPath.startsWith("/admin/payment-settings") ||
    normPath.startsWith("/admin/leads") ||
    normPath.startsWith("/admin/team") ||
    normPath.startsWith("/admin/staff") ||
    normPath.startsWith("/admin/diagnostics") ||
    normPath.startsWith("/admin/audit") ||
    normPath.startsWith("/admin/analytics")
  ) {
    const titles: Record<string, string> = {
      "/admin/pricing": "Pricing & Coupons",
      "/admin/payment-settings": "Payment Settings",
      "/admin/leads": "Kundli Leads",
      "/admin/team": "Team Management",
      "/admin/staff": "Staff Permissions",
      "/admin/diagnostics": "System Diagnostics",
      "/admin/audit": "Audit Trail",
      "/admin/analytics": "Platform Intelligence",
    };
    const matchedKey = Object.keys(titles).find((k) => normPath.startsWith(k));
    return {
      allowed: false,
      isForbidden: true,
      sectionTitle: matchedKey ? titles[matchedKey] : "Restricted Section",
      reason: "You don't have access to this section. This management screen is strictly reserved for the Platform Owner.",
      returnUrl: fallback.returnUrl,
      returnLabel: fallback.returnLabel,
    };
  }

  // Legal pages tab under /admin/content?tab=legal is owner only
  if (normPath.startsWith("/admin/content") && searchParams?.tab === "legal") {
    return {
      allowed: false,
      isForbidden: true,
      sectionTitle: "Legal Pages Editor",
      reason: "You don't have access to this section. Legal policies and compliance editing is strictly reserved for the Platform Owner.",
      returnUrl: "/admin/content",
      returnLabel: "Back to Content Studio",
    };
  }

  // 7. Area 3: Content and Editorial (Staff granted that section: blog, reels, knowledge, content)
  if (normPath.startsWith("/dashboard/blog")) {
    const allowed = canAccessSection(auth, "blog", "VIEW");
    return {
      allowed,
      isForbidden: !allowed,
      sectionTitle: "Blog Post Manager",
      reason: allowed
        ? undefined
        : "You don't have access to this section. Your account requires the 'blog' permission.",
      returnUrl: fallback.returnUrl,
      returnLabel: fallback.returnLabel,
    };
  }

  if (normPath.startsWith("/dashboard/reels")) {
    const allowed = canAccessSection(auth, "reels", "VIEW");
    return {
      allowed,
      isForbidden: !allowed,
      sectionTitle: "Instagram Reel Curation",
      reason: allowed
        ? undefined
        : "You don't have access to this section. Your account requires the 'reels' permission.",
      returnUrl: fallback.returnUrl,
      returnLabel: fallback.returnLabel,
    };
  }

  if (normPath.startsWith("/admin/knowledge")) {
    const allowed = canAccessSection(auth, "knowledge", "VIEW") || canAccessSection(auth, "content", "VIEW");
    return {
      allowed,
      isForbidden: !allowed,
      sectionTitle: "Chatbot Knowledge Base",
      reason: allowed
        ? undefined
        : "You don't have access to this section. Your account requires the 'knowledge' permission.",
      returnUrl: fallback.returnUrl,
      returnLabel: fallback.returnLabel,
    };
  }

  if (normPath.startsWith("/admin/content") || normPath.startsWith("/admin/media")) {
    const allowed = canAccessSection(auth, "content", "VIEW");
    return {
      allowed,
      isForbidden: !allowed,
      sectionTitle: normPath.startsWith("/admin/media") ? "Media Library" : "Content Studio",
      reason: allowed
        ? undefined
        : "You don't have access to this section. Your account requires the 'content' permission.",
      returnUrl: fallback.returnUrl,
      returnLabel: fallback.returnLabel,
    };
  }

  if (normPath.startsWith("/dashboard/clients")) {
    const allowed = canAccessSection(auth, "clients", "VIEW") || auth?.role === "ASTROLOGER";
    return {
      allowed,
      isForbidden: !allowed,
      sectionTitle: "Client Intake Profiles",
      reason: allowed
        ? undefined
        : "You don't have access to this section. Your account requires the 'clients' permission.",
      returnUrl: fallback.returnUrl,
      returnLabel: fallback.returnLabel,
    };
  }

  if (normPath.startsWith("/dashboard/earnings")) {
    const allowed = canAccessSection(auth, "earnings", "VIEW") || auth?.role === "ASTROLOGER";
    return {
      allowed,
      isForbidden: !allowed,
      sectionTitle: "Revenue & Earnings",
      reason: allowed
        ? undefined
        : "You don't have access to this section. Your account requires the 'earnings' permission.",
      returnUrl: fallback.returnUrl,
      returnLabel: fallback.returnLabel,
    };
  }

  // Base /admin hub check
  if (normPath === "/admin" || normPath === "/admin/") {
    // Owner or staff with content/knowledge permissions can view admin hub
    const hasAdminSection =
      canAccessSection(auth, "content", "VIEW") || canAccessSection(auth, "knowledge", "VIEW");
    const allowed = Boolean(auth?.isOwner || hasAdminSection);
    return {
      allowed,
      isForbidden: !allowed,
      sectionTitle: "Admin Control Centre",
      reason: allowed
        ? undefined
        : "You don't have access to this section. You do not have permissions for any admin section.",
      returnUrl: fallback.returnUrl,
      returnLabel: fallback.returnLabel,
    };
  }

  // Base /dashboard hub check
  if (normPath === "/dashboard" || normPath === "/dashboard/") {
    const allowed = Boolean(
      auth?.isOwner ||
        hasStaffPerms ||
        auth?.role === "ASTROLOGER"
    );
    return {
      allowed,
      isForbidden: !allowed,
      sectionTitle: "Operator Cockpit",
      reason: allowed
        ? undefined
        : "You don't have access to this section.",
      returnUrl: fallback.returnUrl,
      returnLabel: fallback.returnLabel,
    };
  }

  // Default fail-safe
  return {
    allowed: Boolean(auth?.isOwner),
    isForbidden: !auth?.isOwner,
    sectionTitle: "Restricted Section",
    reason: "You don't have access to this section.",
    returnUrl: fallback.returnUrl,
    returnLabel: fallback.returnLabel,
  };
}

/**
 * Evaluates access to API routes based on the One Permission Policy.
 */
export function canAccessApiRoute(
  auth: ServerAuthResult | null | undefined,
  pathname: string,
  method: string = "GET"
): { allowed: boolean; status: 200 | 401 | 403; message?: string } {
  const normPath = pathname.toLowerCase();
  const isManage = method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE";

  if (!auth || !auth.isAuthenticated) {
    return { allowed: false, status: 401, message: "Unauthorized: Authentication required." };
  }

  if (auth.isOwner) {
    return { allowed: true, status: 200 };
  }

  // Area 1: Bookings and payment verification API
  if (normPath.startsWith("/api/admin/bookings") || normPath.startsWith("/api/booking/claim")) {
    return {
      allowed: false,
      status: 403,
      message: "Forbidden: Bookings queue and UPI verification is strictly reserved for the Platform Owner.",
    };
  }

  // Area 2: Payment settings, pricing, leads, team, diagnostics, legal pages APIs
  if (
    normPath.startsWith("/api/admin/pricing") ||
    normPath.startsWith("/api/admin/payment-settings") ||
    normPath.startsWith("/api/admin/leads") ||
    normPath.startsWith("/api/admin/team") ||
    normPath.startsWith("/api/admin/staff") ||
    normPath.startsWith("/api/admin/diagnostics") ||
    normPath.startsWith("/api/admin/audit")
  ) {
    return {
      allowed: false,
      status: 403,
      message: "Forbidden: This operational setting is strictly reserved for the Platform Owner.",
    };
  }

  // Area 3: Blog, reels, knowledge, site content
    if (normPath.startsWith("/api/admin/analytics")) {
    const requiredLevel = isManage ? "MANAGE" : "VIEW";
    if (canAccessSection(auth, "analytics", requiredLevel)) {
      return { allowed: true, status: 200 };
    }
    return {
      allowed: false,
      status: 403,
      message: "Forbidden: Analytics permission required.",
    };
  }

  if (normPath.startsWith("/api/dashboard/blog")) {
    const requiredLevel = isManage ? "MANAGE" : "VIEW";
    if (canAccessSection(auth, "blog", requiredLevel)) {
      return { allowed: true, status: 200 };
    }
    return {
      allowed: false,
      status: 403,
      message: `Forbidden: '${requiredLevel}' permission for 'blog' is required.`,
    };
  }

  if (normPath.startsWith("/api/dashboard/reels")) {
    const requiredLevel = isManage ? "MANAGE" : "VIEW";
    if (canAccessSection(auth, "reels", requiredLevel)) {
      return { allowed: true, status: 200 };
    }
    return {
      allowed: false,
      status: 403,
      message: `Forbidden: '${requiredLevel}' permission for 'reels' is required.`,
    };
  }

  if (normPath.startsWith("/api/admin/content") || normPath.startsWith("/api/admin/media")) {
    const requiredLevel = isManage ? "MANAGE" : "VIEW";
    if (canAccessSection(auth, "content", requiredLevel)) {
      return { allowed: true, status: 200 };
    }
    return {
      allowed: false,
      status: 403,
      message: `Forbidden: '${requiredLevel}' permission for 'content' is required.`,
    };
  }

  if (normPath.startsWith("/api/dashboard/clients")) {
    if (canAccessSection(auth, "clients", "VIEW") || auth.role === "ASTROLOGER") {
      return { allowed: true, status: 200 };
    }
    return { allowed: false, status: 403, message: "Forbidden: Clients access required." };
  }

  // Area 4: Personal account data
  if (normPath.startsWith("/api/account/data") || normPath.startsWith("/api/booking/status")) {
    return { allowed: true, status: 200 };
  }

  return { allowed: false, status: 403, message: "Forbidden: Access denied by permission policy." };
}

/**
 * Returns the exact list of navigation items the user is authorized to see in the sidebar.
 * - Owner: sees all administrative and content sections.
 * - Staff: sees ONLY the sections they have an active grant for in Area 3.
 *   Owner-only sections (bookings, pricing, leads, team, diagnostics, etc.) are strictly excluded.
 * - Client: receives an empty list for admin navigation.
 */
export function getVisibleSidebarSections(
  auth: ServerAuthResult | null | undefined
): SidebarItem[] {
  if (!auth || !auth.isAuthenticated) {
    return [];
  }

  if (auth.isOwner) {
    return MASTER_SECTIONS.map((section) => ({
      id: section.id,
      name: section.name,
      path: section.path,
      area: section.area,
      ownerOnly: section.ownerOnly,
    }));
  }

  // For non-owner staff, filter strictly by granted sections in Area 3 (CONTENT_AND_EDITORIAL)
  if (!Array.isArray(auth.permissions) || auth.permissions.length === 0) {
    return [];
  }

  return MASTER_SECTIONS.filter((section) => {
    // Owner-only sections are never shown to staff
    if (section.ownerOnly) return false;
    // Check if staff has grant for this section
    return auth.permissions.includes(section.id);
  }).map((section) => ({
    id: section.id,
    name: section.name,
    path: section.path,
    area: section.area,
    ownerOnly: false,
  }));
}
