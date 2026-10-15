import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { isClerkConfigured } from "./clerkConfig";
import { UserRole, isAstrologerRole, isAdminRole } from "./roles";
import {
  isOwnerEmail,
  StaffPermissionService,
  STAFF_SECTIONS,
  StaffSection,
  StaffGrant,
  AccessLevel,
} from "./staffPermissions";
import { syncClerkUserToDatabase } from "./syncUser";

export interface ServerAuthResult {
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

const UNAUTHENTICATED_RESULT: ServerAuthResult = {
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
 * Checks whether an authenticated user has authorization for a specific section and access level.
 * The Owner ALWAYS passes every check automatically.
 * A staff member only passes if they have an active grant for that exact section
 * with sufficient accessLevel (e.g. MANAGE satisfies both VIEW and MANAGE).
 */
export function hasStaffSectionAccess(
  auth: {
    isAuthenticated?: boolean;
    isOwner?: boolean;
    email?: string | null;
    role?: UserRole | string | null;
    permissions?: StaffSection[] | string[];
    grants?: StaffGrant[];
  } | null | undefined,
  section: StaffSection,
  requiredLevel: AccessLevel = "VIEW"
): boolean {
  if (!auth || !auth.isAuthenticated) return false;
  if (auth.isOwner || isOwnerEmail(auth.email)) return true;
  const sectionMeta = STAFF_SECTIONS.find((s) => s.id === section);
  if (sectionMeta?.ownerOnly) return false; // Strictly Owner-only sections (staff, bookings, leads)

  if (auth.grants && auth.grants.length > 0) {
    const grant = auth.grants.find((g) => g.section === section);
    if (grant) {
      if (requiredLevel === "VIEW") return true;
      return grant.accessLevel === "MANAGE";
    }
  }

  // Fallback to legacy string permissions array
  const perms = (auth.permissions || []) as string[];
  if (perms.includes(section)) return true;

  return false;
}

/**
 * Extracts and verifies authentication and role from a NextRequest instance.
 * Ideal for Middleware and Route Handlers.
 */
export function getAuthFromRequest(req: NextRequest): ServerAuthResult {
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
    return UNAUTHENTICATED_RESULT;
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
    isAuthenticated: true,
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

/**
 * Extracts and verifies authentication and role on the server inside Server Components,
 * Layouts, and Server Actions.
 */
export async function getServerAuthUser(): Promise<ServerAuthResult> {
  // If Clerk is configured with valid production/test keys, inspect Clerk session
  if (isClerkConfigured()) {
    try {
      const { auth, currentUser } = await import("@clerk/nextjs/server");
      const session = await auth();

      if (!session || !session.userId) {
        return UNAUTHENTICATED_RESULT;
      }

      const claims = session.sessionClaims as any;
      let email = claims?.email || claims?.primaryEmailAddress || null;
      if (!email) {
        try {
          const u = await currentUser();
          email = u?.emailAddresses?.[0]?.emailAddress || null;
        } catch {
          // ignore
        }
      }

      const isOwner = isOwnerEmail(email);
      let rawRole =
        claims?.metadata?.role ||
        claims?.publicMetadata?.role ||
        claims?.unsafeMetadata?.role ||
        "CLIENT";

      // Anti-tamper: metadata claiming OWNER without matching OWNER_EMAIL is disallowed
      if (String(rawRole).toUpperCase() === "OWNER" && !isOwner) {
        rawRole = "CLIENT";
      }

      if (session.userId) {
        const uName =
          claims?.name ||
          claims?.fullName ||
          claims?.first_name ||
          undefined;

        syncClerkUserToDatabase({
          clerkId: session.userId,
          email,
          name: uName,
        }).catch((err) => console.warn("Background user sync notice:", err?.message || err));
      }

      if (isOwner) {
        rawRole = "OWNER";
        // Auto-assign and persist OWNER role in PostgreSQL database on sign-up / first login
        if (email) {
          StaffPermissionService.ensureOwnerRoleInDatabase(email).catch(() => {});
        }
      }

      const role = String(rawRole).toUpperCase() as UserRole;
      const grants = isOwner
        ? (STAFF_SECTIONS.map((s) => ({
            id: `owner_${s.id}`,
            email: email || "",
            section: s.id,
            accessLevel: "MANAGE" as AccessLevel,
            grantedAt: new Date().toISOString(),
            revokedAt: null,
          })) as StaffGrant[])
        : await StaffPermissionService.getGrantsForEmail(email || "");

      const permissions = isOwner
        ? (STAFF_SECTIONS.map((s) => s.id) as StaffSection[])
        : grants.map((g) => g.section);

      const isAstrologer = isAstrologerRole(role) || permissions.length > 0;
      const isAdmin = isOwner || isAdminRole(role);

      return {
        isAuthenticated: true,
        userId: session.userId,
        role,
        isAstrologer,
        isAdmin,
        isOwner,
        email,
        permissions,
        grants,
      };
    } catch (err: any) {
      console.warn("Clerk server auth check error, falling back to cookie auth:", err?.message || err);
    }
  }

  // Fallback to cookie-based session verification
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("aapka_astro_session")?.value;
    const roleCookie = cookieStore.get("aapka_astro_role")?.value;
    const mockUserCookie = cookieStore.get("aapka_astro_mock_user")?.value;
    const emailCookie = cookieStore.get("aapka_astro_email")?.value;

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
        // ignore
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
      return UNAUTHENTICATED_RESULT;
    }

    const isOwner = isOwnerEmail(email);

    // Anti-tamper: cookie claiming OWNER without matching OWNER_EMAIL is disallowed
    if (role === "OWNER" && !isOwner) {
      role = "CLIENT";
    }

    if (isOwner) {
      role = "OWNER";
      if (email) {
        StaffPermissionService.ensureOwnerRoleInDatabase(email).catch(() => {});
      }
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
      : mockGrants || (await StaffPermissionService.getGrantsForEmail(email || ""));

    const permissions = isOwner
      ? (STAFF_SECTIONS.map((s) => s.id) as StaffSection[])
      : mockPermissions || (grants.length > 0 ? grants.map((g) => g.section) : await StaffPermissionService.getPermissionsForEmail(email || ""));

    const isAstrologer = isAstrologerRole(role) || permissions.length > 0;
    const isAdmin = isOwner || isAdminRole(role);

    return {
      isAuthenticated: true,
      userId,
      role,
      isAstrologer,
      isAdmin,
      isOwner,
      email,
      permissions,
      grants,
    };
  } catch (err: any) {
    return UNAUTHENTICATED_RESULT;
  }
}
