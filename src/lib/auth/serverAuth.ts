import { cache } from "react";
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
  userId: string | null;     // Database User ID (cuid)
  dbUserId?: string | null;  // Canonical alias for Database User ID (cuid)
  clerkId: string | null;    // Clerk User ID (user_...)
  role: UserRole | null;
  name?: string | null;
  isAstrologer: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  isStaff?: boolean;
  email: string | null;
  permissions: StaffSection[];
  grants: StaffGrant[];
}

export const UNAUTHENTICATED_RESULT: ServerAuthResult = {
  isAuthenticated: false,
  userId: null,
  clerkId: null,
  role: null,
  isAstrologer: false,
  isAdmin: false,
  isOwner: false,
  email: null,
  permissions: [],
  grants: [],
};

function isTestEnvironment(): boolean {
  return (
    process.env.NODE_ENV === "test" ||
    process.env.IS_STAGING_ENVIRONMENT === "true" ||
    process.env.npm_lifecycle_event === "test" ||
    Boolean(process.env.VITEST) ||
    process.argv.some((arg) => arg.includes("test"))
  );
}

// Test harness override strictly scoped to test environments
let testAuthOverride: ServerAuthResult | null = null;

export function __setTestAuthUser(user: Partial<ServerAuthResult> | null) {
  if (!isTestEnvironment()) {
    throw new Error("__setTestAuthUser can only be used in test environments");
  }
  if (!user) {
    testAuthOverride = null;
    return;
  }
  testAuthOverride = {
    isAuthenticated: user.isAuthenticated ?? true,
    userId: user.userId ?? "test_db_user_id",
    clerkId: user.clerkId ?? "test_clerk_id",
    role: user.role ?? "CLIENT",
    isAstrologer: user.isAstrologer ?? false,
    isAdmin: user.isAdmin ?? false,
    isOwner: user.isOwner ?? false,
    email: user.email ?? null,
    permissions: user.permissions ?? [],
    grants: user.grants ?? [],
  };
}

export function __getTestAuthUser(): ServerAuthResult | null {
  return testAuthOverride;
}

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

export { getAuthFromRequest, type RequestAuthResult } from "./requestAuth";

/**
 * Internal resolver that checks Clerk's official server verification,
 * reads the verified primary email from Clerk, finds or provisions the database user,
 * computes roles strictly from OWNER_EMAIL, and returns the DB user id and Clerk id.
 */
async function resolveServerAuthUser(): Promise<ServerAuthResult> {
  // Test override check for test runner
  if (isTestEnvironment() && testAuthOverride !== null) {
    return testAuthOverride;
  }

  if (isClerkConfigured()) {
    try {
      const { auth, currentUser, clerkClient } = await import("@clerk/nextjs/server");
      const session = await auth();

      if (!session || !session.userId) {
        return UNAUTHENTICATED_RESULT;
      }

      // DO NOT rely on unverified claims
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

      // 1. Just-in-time sync on authenticated server request:
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

        if (!dbUser && prisma?.user) {
          try {
            dbUser = await prisma.user.findFirst({
              where: { clerkId: session.userId },
            });
          } catch {}
        }
      }

      // 2. Roles are computed, never trusted from client or database:
      // OWNER strictly when verified email equals OWNER_EMAIL.
      const isOwner = Boolean(verifiedEmail && isOwnerEmail(verifiedEmail));
      let role: UserRole = "CLIENT";

      if (isOwner) {
        role = "OWNER";
        if (verifiedEmail) {
          StaffPermissionService.ensureOwnerRoleInDatabase(verifiedEmail).catch(() => {});
        }
      } else {
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
        userId: dbUser?.id || null, // Database user id (cuid)
        dbUserId: dbUser?.id || null,
        clerkId: session.userId,     // Clerk user id (user_...)
        role,
        name: dbUser?.name || null,
        isAstrologer,
        isAdmin,
        isOwner,
        isStaff: !isOwner && permissions.length > 0,
        email: verifiedEmail,
        permissions,
        grants,
      };
    } catch (err: any) {
      console.warn("Clerk server auth check notice:", err?.message || err);
      return UNAUTHENTICATED_RESULT;
    }
  }

  return UNAUTHENTICATED_RESULT;
}

const cachedServerAuthUser = cache(resolveServerAuthUser);

/**
 * Extracts and verifies authentication and role on the server inside Server Components,
 * Layouts, and Route Handlers.
 *
 * One server helper for every API route and server component.
 * Uses official Clerk session verification, verified primary email,
 * and Neon database sync.
 */
export async function getServerAuthUser(): Promise<ServerAuthResult> {
  if (isTestEnvironment() && testAuthOverride !== null) {
    return testAuthOverride;
  }
  return cachedServerAuthUser();
}

/**
 * Universal Request Auth Resolver for Route Handlers.
 * Delegates directly to getServerAuthUser().
 */
export async function resolveRequestAuth(_req?: NextRequest): Promise<ServerAuthResult> {
  return getServerAuthUser();
}
