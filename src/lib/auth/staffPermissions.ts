import { prisma } from "@/lib/db/prisma";

export type StaffSection =
  | "blog"
  | "reels"
  | "clients"
  | "earnings"
  | "consultations"
  | "pricing"
  | "analytics"
  | "staff";

export type AccessLevel = "VIEW" | "MANAGE";

export interface StaffGrant {
  id: string;
  email: string;
  section: StaffSection;
  accessLevel: AccessLevel;
  grantedByUserId?: string | null;
  grantedBy?: string | null;
  grantedAt: string;
  revokedAt?: string | null;
  revokedByUserId?: string | null;
}

export interface StaffAuditLog {
  id: string;
  action: "GRANTED" | "REVOKED";
  targetEmail: string;
  section: StaffSection;
  accessLevel: AccessLevel;
  grantedByUserId?: string | null;
  grantedBy?: string | null;
  grantedAt: string;
  revokedAt?: string | null;
  revokedByUserId?: string | null;
  timestamp: string;
}

export interface StaffSectionMeta {
  id: StaffSection;
  name: string;
  path: string;
  description: string;
  ownerOnly?: boolean;
}

export const STAFF_SECTIONS: readonly StaffSectionMeta[] = [
  {
    id: "blog",
    name: "Blog Post Manager",
    path: "/dashboard/blog",
    description: "Create, edit, draft, and publish astrology articles & SEO content.",
  },
  {
    id: "reels",
    name: "Instagram Reel Curation",
    path: "/dashboard/reels",
    description: "Curate, pin, hide, and sync reels from @aapkaastrologer feed.",
  },
  {
    id: "clients",
    name: "Client Intake Profiles",
    path: "/dashboard/clients",
    description: "View seeker birth details, consultation history, and remedy notes.",
  },
  {
    id: "earnings",
    name: "Revenue & Earnings",
    path: "/dashboard/earnings",
    description: "View consultations delivered, earnings breakdown, and settled revenue.",
  },
  {
    id: "consultations",
    name: "Live Operator Cockpit",
    path: "/dashboard",
    description: "Manage live waiting queue, accept incoming calls, and run session workbench.",
  },
  {
    id: "pricing",
    name: "Pricing & Coupons",
    path: "/admin/pricing",
    description: "Configure flat-fee consultation products, festive promotions, and promotional pricing.",
  },
  {
    id: "analytics",
    name: "Platform Intelligence",
    path: "/admin/analytics",
    description: "View conversion funnels, traffic sources, and consultation volume metrics.",
  },
  {
    id: "staff",
    name: "Staff Permissions",
    path: "/admin/staff",
    description: "Assign or revoke per-section access for site employees (Owner Only).",
    ownerOnly: true,
  },
];

/**
 * Parses and returns the list of designated Owner email addresses.
 * The client's account is identified by OWNER_EMAIL in environment variables.
 */
export function getOwnerEmails(): string[] {
  const envVal =
    process.env.OWNER_EMAIL ||
    process.env.NEXT_PUBLIC_OWNER_EMAIL ||
    "anmol@aapkaastro.com,acharya@aapkaastro.com";

  return envVal
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Returns true if the provided email belongs to the site's Owner.
 * The Owner possesses complete, unrestricted administrative privilege across all sections.
 */
export function isOwnerEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const owners = getOwnerEmails();
  return owners.includes(normalized);
}

/**
 * Evaluates whether a user holds authorization to access a specific admin/operator section.
 */
export function hasSectionPermission(
  user: {
    email?: string | null;
    role?: string | null;
    permissions?: string[];
  } | null | undefined,
  section: StaffSection
): boolean {
  if (!user) return false;

  const role = (user.role || "").toUpperCase();
  const isOwner = role === "OWNER" || isOwnerEmail(user.email);

  // 1. Platform Owner always has unrestricted access to all sections and is never subject to section restrictions
  if (isOwner) {
    return true;
  }

  // 2. The 'staff' management console is strictly restricted to platform Owner
  if (section === "staff") {
    return false;
  }

  // 3. Global ADMIN role has access to all platform operations
  if (role === "ADMIN") {
    return true;
  }

  const perms = user.permissions || [];

  // 4. Wildcard permission
  if (perms.includes("*")) {
    return true;
  }

  // 5. Explicit section permission granted in database
  if (perms.includes(section)) {
    return true;
  }

  // 6. Astrologer role has consultation operator privilege by default
  if (section === "consultations" && role === "ASTROLOGER") {
    return true;
  }

  return false;
}

/**
 * Evaluates whether a user holds authorization for a specific section AND access level (VIEW vs MANAGE).
 * A MANAGE grant satisfies both VIEW and MANAGE requirements.
 */
export function hasSectionAccess(
  user: {
    email?: string | null;
    role?: string | null;
    permissions?: string[];
    grants?: { section: StaffSection; accessLevel: AccessLevel }[];
  } | null | undefined,
  section: StaffSection,
  requiredLevel: AccessLevel = "VIEW"
): boolean {
  if (!user) return false;

  const role = (user.role || "").toUpperCase();
  const isOwner = role === "OWNER" || isOwnerEmail(user.email);

  if (isOwner) return true;
  if (section === "staff") return false; // Strictly Owner-only
  if (role === "ADMIN") return true;

  if (user.grants && user.grants.length > 0) {
    const matching = user.grants.find(
      (g) => g.section === section || (g.section as string) === "*"
    );
    if (matching) {
      if (requiredLevel === "VIEW") return true;
      return matching.accessLevel === "MANAGE";
    }
  }

  const perms = user.permissions || [];
  if (perms.includes("*") || perms.includes(section)) return true;
  if (section === "consultations" && role === "ASTROLOGER") return true;
  return false;
}

export interface StaffMemberRecord {
  email: string;
  name?: string;
  userId?: string | null;
  sections: StaffSection[];
  grants: StaffGrant[];
  isOwner: boolean;
  updatedAt: string;
}

// In-memory grant store for development preview / test resilience
const memoryGrants: StaffGrant[] = [
  {
    id: "grant_mem_1",
    email: "editor@aapkaastro.com",
    section: "blog",
    accessLevel: "MANAGE",
    grantedByUserId: "usr_owner_001",
    grantedBy: "Owner",
    grantedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    revokedAt: null,
  },
  {
    id: "grant_mem_2",
    email: "curator@aapkaastro.com",
    section: "reels",
    accessLevel: "VIEW",
    grantedByUserId: "usr_owner_001",
    grantedBy: "Owner",
    grantedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    revokedAt: null,
  },
  {
    id: "grant_mem_3",
    email: "intern@aapkaastro.com",
    section: "earnings",
    accessLevel: "VIEW",
    grantedByUserId: "usr_owner_001",
    grantedBy: "Owner",
    grantedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    revokedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    revokedByUserId: "usr_owner_001",
  },
];

let isDbReachable = true;

/**
 * Service to manage per-site staff permissions stored in PostgreSQL.
 * Does not require paid Clerk Organizations features.
 */
export class StaffPermissionService {
  /**
   * Synchronous helper for request/middleware execution when DB is not awaited.
   */
  static getPermissionsSync(email: string): StaffSection[] {
    if (!email) return [];
    const normalized = email.trim().toLowerCase();
    if (isOwnerEmail(normalized)) {
      return STAFF_SECTIONS.map((s) => s.id);
    }
    const activeGrants = memoryGrants.filter(
      (g) => g.email.toLowerCase() === normalized && !g.revokedAt
    );
    return activeGrants.map((g) => g.section);
  }

  /**
   * Synchronous helper to get active grants with access levels from memory / fallback.
   */
  static getGrantsSync(email: string): StaffGrant[] {
    if (!email) return [];
    const normalized = email.trim().toLowerCase();
    if (isOwnerEmail(normalized)) {
      return STAFF_SECTIONS.map((s) => ({
        id: `grant_owner_${s.id}`,
        email: normalized,
        section: s.id,
        accessLevel: "MANAGE" as AccessLevel,
        grantedBy: "Platform Owner",
        grantedByUserId: "owner",
        grantedAt: new Date().toISOString(),
        revokedAt: null,
      }));
    }
    return memoryGrants.filter(
      (g) => g.email.toLowerCase() === normalized && !g.revokedAt
    );
  }

  /**
   * Retrieves all active granted sections for a specific user email.
   */
  static async getPermissionsForEmail(email: string): Promise<StaffSection[]> {
    if (!email) return [];
    const normalized = email.trim().toLowerCase();

    // Owner has all sections
    if (isOwnerEmail(normalized)) {
      return STAFF_SECTIONS.map((s) => s.id);
    }

    if (isDbReachable) {
      try {
        if (prisma && (prisma as any).staffPermission) {
          const rows = await prisma.staffPermission.findMany({
            where: { email: normalized, revokedAt: null },
            select: { section: true },
          });

          if (rows && rows.length > 0) {
            return rows.map((r: any) => r.section as StaffSection);
          }
        }
      } catch {
        isDbReachable = false;
      }
    }

    const activeGrants = memoryGrants.filter(
      (g) => g.email.toLowerCase() === normalized && !g.revokedAt
    );
    return activeGrants.map((g) => g.section);
  }

  /**
   * Retrieves all active grants with access levels for an email.
   */
  static async getGrantsForEmail(email: string): Promise<StaffGrant[]> {
    if (!email) return [];
    const normalized = email.trim().toLowerCase();

    if (isOwnerEmail(normalized)) {
      return STAFF_SECTIONS.map((s) => ({
        id: `grant_owner_${s.id}`,
        email: normalized,
        section: s.id,
        accessLevel: "MANAGE" as AccessLevel,
        grantedBy: "Platform Owner",
        grantedByUserId: "owner",
        grantedAt: new Date().toISOString(),
        revokedAt: null,
      }));
    }

    if (isDbReachable) {
      try {
        if (prisma && (prisma as any).staffPermission) {
          const rows = await prisma.staffPermission.findMany({
            where: { email: normalized, revokedAt: null },
            orderBy: { createdAt: "desc" },
          });

          if (rows && rows.length > 0) {
            return rows.map((r: any) => ({
              id: r.id,
              email: r.email,
              section: r.section as StaffSection,
              accessLevel: (r.accessLevel || "MANAGE") as AccessLevel,
              grantedByUserId: r.grantedByUserId,
              grantedBy: r.grantedBy,
              grantedAt: r.grantedAt ? r.grantedAt.toISOString() : r.createdAt.toISOString(),
              revokedAt: r.revokedAt ? r.revokedAt.toISOString() : null,
              revokedByUserId: r.revokedByUserId,
            }));
          }
        }
      } catch {
        isDbReachable = false;
      }
    }

    return memoryGrants.filter(
      (g) => g.email.toLowerCase() === normalized && !g.revokedAt
    );
  }

  /**
   * Lists all staff members and their active grants/sections for this site.
   */
  static async listStaffMembers(): Promise<StaffMemberRecord[]> {
    const staffMap = new Map<string, { email: string; grants: StaffGrant[]; updatedAt: string }>();

    // Load from database if available
    if (isDbReachable) {
      try {
        if (prisma && (prisma as any).staffPermission) {
          const rows = await prisma.staffPermission.findMany({
            where: { revokedAt: null },
            orderBy: { createdAt: "desc" },
          });

          for (const row of rows) {
            const email = row.email.toLowerCase();
            if (!staffMap.has(email)) {
              staffMap.set(email, {
                email,
                grants: [],
                updatedAt: row.updatedAt ? row.updatedAt.toISOString() : new Date().toISOString(),
              });
            }
            staffMap.get(email)!.grants.push({
              id: row.id,
              email,
              section: row.section as StaffSection,
              accessLevel: (row.accessLevel || "MANAGE") as AccessLevel,
              grantedByUserId: row.grantedByUserId,
              grantedBy: row.grantedBy,
              grantedAt: row.grantedAt ? row.grantedAt.toISOString() : row.createdAt.toISOString(),
              revokedAt: null,
            });
          }
        }
      } catch {
        isDbReachable = false;
      }
    }

    // Merge in-memory active grants
    for (const grant of memoryGrants.filter((g) => !g.revokedAt)) {
      const email = grant.email.toLowerCase();
      if (!staffMap.has(email)) {
        staffMap.set(email, {
          email,
          grants: [grant],
          updatedAt: grant.grantedAt,
        });
      } else {
        const existing = staffMap.get(email)!;
        if (!existing.grants.some((g) => g.section === grant.section)) {
          existing.grants.push(grant);
        }
      }
    }

    // Include configured owners
    const owners = getOwnerEmails();
    for (const owner of owners) {
      const ownerGrants: StaffGrant[] = STAFF_SECTIONS.map((s) => ({
        id: `owner_${s.id}`,
        email: owner,
        section: s.id,
        accessLevel: "MANAGE",
        grantedBy: "Platform Owner",
        grantedByUserId: "owner",
        grantedAt: new Date().toISOString(),
        revokedAt: null,
      }));
      staffMap.set(owner, {
        email: owner,
        grants: ownerGrants,
        updatedAt: new Date().toISOString(),
      });
    }

    const result: StaffMemberRecord[] = [];
    for (const [email, record] of staffMap.entries()) {
      result.push({
        email,
        grants: record.grants,
        sections: record.grants.map((g) => g.section),
        isOwner: isOwnerEmail(email),
        updatedAt: record.updatedAt,
      });
    }

    return result;
  }

  /**
   * Returns a chronological audit list of all grants and revocations,
   * pulling directly from grantedByUserId, grantedAt, and revokedAt fields.
   */
  static async listAuditLogs(): Promise<StaffAuditLog[]> {
    const logs: StaffAuditLog[] = [];

    if (isDbReachable) {
      try {
        if (prisma && (prisma as any).staffPermission) {
          const rows = await prisma.staffPermission.findMany({
            orderBy: { createdAt: "desc" },
          });

          for (const row of rows) {
            // Log for the grant
            logs.push({
              id: `${row.id}_grant`,
              action: "GRANTED",
              targetEmail: row.email,
              section: row.section as StaffSection,
              accessLevel: (row.accessLevel || "MANAGE") as AccessLevel,
              grantedByUserId: row.grantedByUserId,
              grantedBy: row.grantedBy,
              grantedAt: row.grantedAt ? row.grantedAt.toISOString() : row.createdAt.toISOString(),
              revokedAt: row.revokedAt ? row.revokedAt.toISOString() : null,
              revokedByUserId: row.revokedByUserId,
              timestamp: row.grantedAt ? row.grantedAt.toISOString() : row.createdAt.toISOString(),
            });

            // If revoked, log revocation entry
            if (row.revokedAt) {
              logs.push({
                id: `${row.id}_revoke`,
                action: "REVOKED",
                targetEmail: row.email,
                section: row.section as StaffSection,
                accessLevel: (row.accessLevel || "MANAGE") as AccessLevel,
                grantedByUserId: row.grantedByUserId,
                grantedBy: row.grantedBy,
                grantedAt: row.grantedAt ? row.grantedAt.toISOString() : row.createdAt.toISOString(),
                revokedAt: row.revokedAt.toISOString(),
                revokedByUserId: row.revokedByUserId,
                timestamp: row.revokedAt.toISOString(),
              });
            }
          }
        }
      } catch {
        isDbReachable = false;
      }
    }

    // Merge in-memory grants for audit
    for (const g of memoryGrants) {
      if (!logs.some((l) => l.id.startsWith(g.id))) {
        logs.push({
          id: `${g.id}_grant`,
          action: "GRANTED",
          targetEmail: g.email,
          section: g.section,
          accessLevel: g.accessLevel,
          grantedByUserId: g.grantedByUserId,
          grantedBy: g.grantedBy,
          grantedAt: g.grantedAt,
          revokedAt: g.revokedAt,
          revokedByUserId: g.revokedByUserId,
          timestamp: g.grantedAt,
        });

        if (g.revokedAt) {
          logs.push({
            id: `${g.id}_revoke`,
            action: "REVOKED",
            targetEmail: g.email,
            section: g.section,
            accessLevel: g.accessLevel,
            grantedByUserId: g.grantedByUserId,
            grantedBy: g.grantedBy,
            grantedAt: g.grantedAt,
            revokedAt: g.revokedAt,
            revokedByUserId: g.revokedByUserId,
            timestamp: g.revokedAt,
          });
        }
      }
    }

    // Sort by timestamp descending
    return logs.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Grants a single section + access-level to a staff member email.
   * Can be used to invite a new staff member or grant a new section to existing staff.
   */
  static async grantSection(
    email: string,
    section: StaffSection,
    accessLevel: AccessLevel = "MANAGE",
    grantedByUserId?: string,
    grantedBy: string = "Owner"
  ): Promise<StaffGrant | null> {
    if (!email || !section) return null;
    const normalized = email.trim().toLowerCase();

    if (isOwnerEmail(normalized)) {
      return null; // Owner already has full unrestricted access
    }

    const grantId = `grant_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const grantedAt = new Date().toISOString();

    const newGrant: StaffGrant = {
      id: grantId,
      email: normalized,
      section,
      accessLevel,
      grantedByUserId: grantedByUserId || "Owner",
      grantedBy,
      grantedAt,
      revokedAt: null,
    };

    // Update in-memory: revoke any existing active grant for this section and push new
    const existingIdx = memoryGrants.findIndex(
      (g) => g.email.toLowerCase() === normalized && g.section === section && !g.revokedAt
    );
    if (existingIdx >= 0) {
      memoryGrants[existingIdx].revokedAt = grantedAt;
      memoryGrants[existingIdx].revokedByUserId = grantedByUserId;
    }
    memoryGrants.push(newGrant);

    if (isDbReachable) {
      try {
        if (prisma && (prisma as any).staffPermission) {
          const user = await prisma.user.findUnique({
            where: { email: normalized },
          });

          // Soft-revoke any existing active grant for this section
          await prisma.staffPermission.updateMany({
            where: { email: normalized, section, revokedAt: null },
            data: { revokedAt: new Date(), revokedByUserId: grantedByUserId || null },
          });

          const created = await prisma.staffPermission.create({
            data: {
              email: normalized,
              section,
              accessLevel: accessLevel as any,
              userId: user ? user.id : null,
              grantedByUserId,
              grantedBy,
              grantedAt: new Date(),
              revokedAt: null,
            },
          });

          // Elevate user's role to ASTROLOGER/staff if currently CLIENT
          if (user && user.role === "CLIENT") {
            await prisma.user.update({
              where: { id: user.id },
              data: { role: "ASTROLOGER" },
            });
          }

          newGrant.id = created.id;
        }
      } catch {
        isDbReachable = false;
      }
    }

    return newGrant;
  }

  /**
   * Revokes an existing grant by its unique ID.
   */
  static async revokeGrant(grantId: string, revokedByUserId?: string): Promise<boolean> {
    if (!grantId) return false;
    const revokedAt = new Date().toISOString();

    // In-memory update
    const memGrant = memoryGrants.find((g) => g.id === grantId && !g.revokedAt);
    if (memGrant) {
      memGrant.revokedAt = revokedAt;
      memGrant.revokedByUserId = revokedByUserId;
    }

    if (isDbReachable) {
      try {
        if (prisma && (prisma as any).staffPermission) {
          await prisma.staffPermission.update({
            where: { id: grantId },
            data: { revokedAt: new Date(), revokedByUserId },
          });
        }
      } catch {
        isDbReachable = false;
      }
    }

    return true;
  }

  /**
   * Revokes a specific section grant for an email.
   */
  static async revokeGrantBySection(
    email: string,
    section: StaffSection,
    revokedByUserId?: string
  ): Promise<boolean> {
    if (!email || !section) return false;
    const normalized = email.trim().toLowerCase();
    if (isOwnerEmail(normalized)) return false;

    const revokedAt = new Date().toISOString();

    // In-memory update
    for (const g of memoryGrants) {
      if (g.email.toLowerCase() === normalized && g.section === section && !g.revokedAt) {
        g.revokedAt = revokedAt;
        g.revokedByUserId = revokedByUserId;
      }
    }

    if (isDbReachable) {
      try {
        if (prisma && (prisma as any).staffPermission) {
          await prisma.staffPermission.updateMany({
            where: { email: normalized, section, revokedAt: null },
            data: { revokedAt: new Date(), revokedByUserId },
          });
        }
      } catch {
        isDbReachable = false;
      }
    }

    return true;
  }

  /**
   * Automatically assigns and persists the OWNER role to the user's database record
   * upon sign-up or first login if their authenticated email matches OWNER_EMAIL.
   */
  static async ensureOwnerRoleInDatabase(email: string): Promise<boolean> {
    if (!email || !isOwnerEmail(email)) return false;
    const normalized = email.trim().toLowerCase();

    if (isDbReachable) {
      try {
        if (prisma && (prisma as any).user) {
          const user = await prisma.user.findUnique({
            where: { email: normalized },
            select: { id: true, role: true },
          });

          if (user && user.role !== ("OWNER" as any)) {
            await prisma.user.update({
              where: { id: user.id },
              data: { role: "OWNER" as any },
            });
          }
          return true;
        }
      } catch {
        isDbReachable = false;
      }
    }
    return true;
  }

  /**
   * Sets or updates bulk per-section permissions for a staff member.
   * Backward-compatible with existing /admin/staff endpoints.
   */
  static async setPermissions(
    email: string,
    sections: StaffSection[],
    grantedBy: string = "Owner",
    grantedByUserId?: string
  ): Promise<boolean> {
    if (!email) return false;
    const normalized = email.trim().toLowerCase();

    if (isOwnerEmail(normalized)) {
      return true;
    }

    // In-memory update: revoke existing active grants not in `sections`
    const now = new Date().toISOString();
    for (const g of memoryGrants) {
      if (g.email.toLowerCase() === normalized && !g.revokedAt) {
        if (!sections.includes(g.section)) {
          g.revokedAt = now;
          g.revokedByUserId = grantedByUserId;
        }
      }
    }

    // Grant new sections
    for (const sec of sections) {
      const existing = memoryGrants.find(
        (g) => g.email.toLowerCase() === normalized && g.section === sec && !g.revokedAt
      );
      if (!existing) {
        memoryGrants.push({
          id: `grant_mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          email: normalized,
          section: sec,
          accessLevel: "MANAGE",
          grantedByUserId,
          grantedBy,
          grantedAt: now,
          revokedAt: null,
        });
      }
    }

    // Database update
    if (isDbReachable) {
      try {
        if (prisma && (prisma as any).staffPermission) {
          const user = await prisma.user.findUnique({
            where: { email: normalized },
          });

          // Soft-revoke existing grants not in `sections`
          await prisma.staffPermission.updateMany({
            where: {
              email: normalized,
              revokedAt: null,
              section: { notIn: sections },
            },
            data: { revokedAt: new Date(), revokedByUserId: grantedByUserId || null },
          });

          // Add any new sections
          for (const sec of sections) {
            const existing = await prisma.staffPermission.findFirst({
              where: { email: normalized, section: sec, revokedAt: null },
            });

            if (!existing) {
              await prisma.staffPermission.create({
                data: {
                  email: normalized,
                  section: sec,
                  accessLevel: "MANAGE" as any,
                  userId: user ? user.id : null,
                  grantedByUserId,
                  grantedBy,
                  grantedAt: new Date(),
                  revokedAt: null,
                },
              });
            }
          }

          if (user && user.role === "CLIENT" && sections.length > 0) {
            await prisma.user.update({
              where: { id: user.id },
              data: { role: "ASTROLOGER" },
            });
          }
        }
      } catch {
        isDbReachable = false;
      }
    }

    return true;
  }

  /**
   * Revokes all active staff permissions for a given email.
   */
  static async revokeStaff(email: string, revokedByUserId?: string): Promise<boolean> {
    if (!email) return false;
    const normalized = email.trim().toLowerCase();

    if (isOwnerEmail(normalized)) {
      return false; // Cannot revoke owner
    }

    const now = new Date().toISOString();

    // Mark in-memory revoked
    let found = false;
    for (const g of memoryGrants) {
      if (g.email.toLowerCase() === normalized && !g.revokedAt) {
        g.revokedAt = now;
        g.revokedByUserId = revokedByUserId;
        found = true;
      }
    }

    if (isDbReachable) {
      try {
        if (prisma && (prisma as any).staffPermission) {
          await prisma.staffPermission.updateMany({
            where: { email: normalized, revokedAt: null },
            data: { revokedAt: new Date(), revokedByUserId },
          });
        }
      } catch {
        isDbReachable = false;
      }
    }

    return found || true;
  }
}
