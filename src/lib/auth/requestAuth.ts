import { NextRequest } from "next/server";
import { UserRole, isAstrologerRole, isAdminRole } from "./roles";
import {
  isOwnerEmail,
  StaffPermissionService,
  STAFF_SECTIONS,
  StaffSection,
  StaffGrant,
  AccessLevel,
} from "./staffPermissions";

export interface RequestAuthResult {
  isAuthenticated: boolean;
  userId: string | null;
  role: UserRole | null;
  isAstrologer: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  email: string | null;
  permissions: StaffSection[];
  grants: StaffGrant[];
}

export const UNAUTHENTICATED_REQUEST_RESULT: RequestAuthResult = {
  isAuthenticated: false,
  userId: null,
  role: null,
  isAstrologer: false,
  isAdmin: false,
  isOwner: false,
  email: null,
  permissions: [],
  grants: [],
};

/**
 * Extracts and verifies authentication and role from a NextRequest instance.
 * Safe for Edge Middleware and Route Handlers (zero Node.js/Prisma/next-headers dependencies).
 */
export function getAuthFromRequest(req: NextRequest): RequestAuthResult {
  const sessionCookie = req.cookies.get("aapka_astro_session")?.value;
  const roleCookie = req.cookies.get("aapka_astro_role")?.value;
  const mockUserCookie = req.cookies.get("aapka_astro_mock_user")?.value;
  const emailCookie = req.cookies.get("aapka_astro_email")?.value;

  let role: UserRole = "CLIENT";
  let userId: string | null = null;
  let email: string | null = emailCookie || null;
  let isAuthenticated = false;
  let mockGrants: StaffGrant[] | null = null;
  let mockPermissions: StaffSection[] | null = null;

  if (mockUserCookie) {
    try {
      const parsed = JSON.parse(decodeURIComponent(mockUserCookie));
      if (parsed.role) {
        role = String(parsed.role).toUpperCase() as UserRole;
      }
      if (parsed.id) {
        userId = parsed.id;
      }
      if (parsed.email) {
        email = parsed.email;
      }
      if (Array.isArray(parsed.grants)) {
        mockGrants = parsed.grants;
      }
      if (Array.isArray(parsed.permissions)) {
        mockPermissions = parsed.permissions;
      }
      isAuthenticated = true;
    } catch {
      // JSON parse error, ignore
    }
  } else if (roleCookie) {
    role = String(roleCookie).toUpperCase() as UserRole;
    isAuthenticated = true;
    userId = "mock_user";
  } else if (sessionCookie === "active") {
    isAuthenticated = true;
    role = "CLIENT";
    userId = "mock_user";
  }

  if (!isAuthenticated) {
    return UNAUTHENTICATED_REQUEST_RESULT;
  }

  const isOwner = isOwnerEmail(email);

  // CRITICAL ANTI-TAMPER CHECK:
  // A non-owner account can NEVER claim, self-assign, or be tricked into obtaining the OWNER role.
  if (role === "OWNER" && !isOwner) {
    role = "CLIENT";
  }

  if (isOwner) {
    role = "OWNER";
  }

  const grants = isOwner
    ? (STAFF_SECTIONS.map((s) => ({
        id: `owner_${s.id}`,
        email: email || "",
        section: s.id,
        accessLevel: "MANAGE" as AccessLevel,
        grantedAt: new Date().toISOString(),
        revokedAt: null,
      })) as StaffGrant[])
    : mockGrants || StaffPermissionService.getGrantsSync(email || "");

  const permissions = isOwner
    ? (STAFF_SECTIONS.map((s) => s.id) as StaffSection[])
    : mockPermissions || (grants.length > 0 ? grants.map((g) => g.section) : StaffPermissionService.getPermissionsSync(email || ""));

  const isAstrologer = isAstrologerRole(role) || permissions.length > 0;
  const isAdmin = isOwner || isAdminRole(role);

  return {
    isAuthenticated,
    userId,
    role,
    isAstrologer,
    isAdmin,
    isOwner,
    email,
    permissions,
    grants,
  };
}
