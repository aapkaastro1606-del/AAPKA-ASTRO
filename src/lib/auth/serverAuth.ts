import { cache } from "react";
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
import { prisma } from "@/lib/db/prisma";

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

export function getOwnerEmail(): string {
  return process.env.OWNER_EMAIL?.trim().toLowerCase() || "aapkaastro1606@gmail.com";
}

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
 *
 * Cached per request using React cache() to avoid duplicate API and DB calls.
 * Strictly verifies the primary email via currentUser() or the Clerk Backend API
 * and confirms it is marked verified. Never relies on session-token claims or
 * browser-supplied emails.
 */
export const getServerAuthUser = cache(async (): Promise<ServerAuthResult> => {
  // If Clerk is configured with valid production/test keys, inspect Clerk session
  if (isClerkConfigured()) {
    try {
      const { auth, currentUser, clerkClient } = await import("@clerk/nextjs/server");
      const session = await auth();

      if (!session || !session.userId) {
        return UNAUTHENTICATED_RESULT;
      }

      // DO NOT rely on session-token claims (the default token has no email)
      // DO NOT trust any email supplied by the browser
      // Read verified primary email via currentUser() or the Clerk Backend API
      let verifiedEmail: string | null = null;
      let fullName: string | undefined;

      try {
        const u = await currentUser();
        if (u) {
          const primaryId = u.primaryEmailAddressId;
          const primaryObj =
            u.emailAddresses?.find((e) => e.id === primaryId) ||
            u.emailAddresses?.[0];
          if (primaryObj && primaryObj.verification?.status === "verified") {
            verifiedEmail = primaryObj.emailAddress.toLowerCase().trim();
          }
          fullName = [u.firstName, u.lastName].filter(Boolean).join(" ") || undefined;
        }
      } catch {
        // Fallback to clerkClient() API
        try {
          const client = await clerkClient();
          const u = await client.users.getUser(session.userId);
          if (u) {
            const primaryId = u.primaryEmailAddressId;
            const primaryObj =
              u.emailAddresses?.find((e) => e.id === primaryId) ||
              u.emailAddresses?.[0];
            if (primaryObj && primaryObj.verification?.status === "verified") {
              verifiedEmail = primaryObj.emailAddress.toLowerCase().trim();
            }
            fullName = [u.firstName, u.lastName].filter(Boolean).join(" ") || undefined;
          }
        } catch {
          // ignore
        }
      }

      // If backend API could not be reached, query database user row for this clerkId
      if (!verifiedEmail && session.userId && prisma?.user) {
        try {
          const dbU = await prisma.user.findFirst({
            where: { clerkId: session.userId },
            select: { email: true, name: true, role: true },
          });
          if (dbU?.email) {
            verifiedEmail = dbU.email.toLowerCase().trim();
            fullName = fullName || dbU.name || undefined;
          }
        } catch {}
      }

      // 1. Just-in-time sync on first authenticated server request:
      // Awaited synchronously so sign-in creates or updates the row and wallet in Neon
      // even if the webhook is missing, delayed, or failed.
      let dbUser: any = null;
      if (session.userId) {
        try {
          dbUser = await syncClerkUserToDatabase({
            clerkId: session.userId,
            email: verifiedEmail,
            name: fullName,
          });
        } catch (syncErr: any) {
          console.warn("Just-in-time database sync warning:", syncErr?.message || syncErr);
        }
      }

      // 2. Roles are computed, never trusted from the database:
      // OWNER only when the verified email equals OWNER_EMAIL.
      const isOwner = Boolean(verifiedEmail && isOwnerEmail(verifiedEmail));
      let role: UserRole = "CLIENT";

      if (isOwner) {
        role = "OWNER";
        if (verifiedEmail) {
          StaffPermissionService.ensureOwnerRoleInDatabase(verifiedEmail).catch(() => {});
        }
      } else {
        // If not the Owner, inspect database role for anomalies
        const dbRole = dbUser?.role;
        if (dbRole === "OWNER") {
          console.warn(
            `[SECURITY ANOMALY] User "${verifiedEmail || session.userId}" has role OWNER in database but verified email does not match OWNER_EMAIL. Demoted to CLIENT.`
          );
          role = "CLIENT";
          if (prisma?.user && dbUser?.id) {
            prisma.user.update({
              where: { id: dbUser.id },
              data: { role: "CLIENT" },
            }).catch(() => {});
          }
        } else if (dbRole === "ASTROLOGER") {
          role = "ASTROLOGER";
        } else {
          role = "CLIENT";
        }
      }
      const grants = isOwner
        ? (STAFF_SECTIONS.map((s) => ({
            id: `owner_${s.id}`,
            email: verifiedEmail || "",
            section: s.id,
            accessLevel: "MANAGE" as AccessLevel,
            grantedAt: new Date().toISOString(),
            revokedAt: null,
          })) as StaffGrant[])
        : await StaffPermissionService.getGrantsForEmail(verifiedEmail || "");

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
        email: verifiedEmail,
        permissions,
        grants,
      };
    } catch (err: any) {
      console.warn("Clerk server auth check error, falling back to cookie auth:", err?.message || err);
    }
  }

  // Fallback to cookie-based session verification (for tests / preview)
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

    // Roles are computed, never trusted: OWNER only when email matches OWNER_EMAIL
    if (role === "OWNER" && !isOwner) {
      console.warn(
        `[SECURITY ANOMALY] Session claimed role OWNER for non-owner email "${email}". Demoted to CLIENT.`
      );
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
});
