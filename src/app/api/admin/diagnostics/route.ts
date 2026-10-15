import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth/serverAuth";
import { prisma } from "@/lib/db/prisma";
import { ClerkWebhookTracker } from "@/lib/auth/clerkWebhookTracker";
import { isOwnerEmail } from "@/lib/auth/staffPermissions";

export const dynamic = "force-dynamic";

export interface DiagnosticsData {
  timestamp: string;
  clerk: {
    keyMode: "LIVE" | "TEST" | "MISSING";
    publishableKeyConfigured: boolean;
    publishableKeyPrefix: string;
    secretKeyConfigured: boolean;
    webhookSecretConfigured: boolean;
  };
  serverAuth: {
    recognized: boolean;
    userId: string | null;
    cookieNames: string[];
    host: string;
    hostType: "apex" | "www" | "localhost" | "other";
  };
  database: {
    reachable: boolean;
    latencyMs: number;
    databaseName: string | null;
    currentUserHasDbRow: boolean;
    totalUserCount: number;
    lastFiveSignups: Array<{
      id: string;
      emailMasked: string;
      role: string;
      hasClerkId: boolean;
      createdAt: string;
    }>;
    error?: string;
  };
  migrations: {
    tableExists: boolean;
    appliedCount: number;
    error?: string;
  };
  tables: Record<string, number | { error: string }>;
  lastWebhookReceived: {
    timestamp: string;
    eventType: string;
    status: string;
    error?: string;
  } | null;
  envChecklist: Array<{
    key: string;
    required: boolean;
    isSet: boolean;
    description: string;
  }>;
  satelliteConfig: {
    isSatelliteSet: boolean;
    satelliteValue: string | null;
    isDomainSet: boolean;
    domainValue: string | null;
    anySatelliteVariableSet: boolean;
  };
}

function maskEmail(email: string | null | undefined): string {
  if (!email) return "anonymous";
  const parts = email.split("@");
  if (parts.length !== 2) return "***";
  const [local, domain] = parts;
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

/**
 * Owner-Only System Diagnostics Endpoint
 * Audits Clerk publishable key mode, server session recognition, cookies, host,
 * database connectivity, user sync status, last 5 sign-ups (masked), and satellite config.
 */
export async function GET(req: NextRequest) {
  // 1. Check server-side auth first
  let serverAuthSession: { userId: string | null } | null = null;
  try {
    const { auth } = await import("@clerk/nextjs/server");
    serverAuthSession = await auth();
  } catch {
    // Clerk server auth error or unconfigured
  }

  const cookieAuth = getAuthFromRequest(req);

  // 2. Extract Bearer token if provided by client SDK
  let clientEmailFromBearer: string | null = null;
  let clientUserIdFromBearer: string | null = null;
  const authHeader = req.headers.get("authorization") || "";
  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    try {
      const parts = token.split(".");
      if (parts.length >= 2) {
        const payloadJson = Buffer.from(parts[1], "base64url").toString("utf8");
        const claims = JSON.parse(payloadJson);
        clientUserIdFromBearer = claims.sub || null;
        clientEmailFromBearer = claims.email || claims.primary_email || null;
      }
    } catch {
      // Invalid JWT format
    }
  }

  // 3. Determine if caller is Owner
  const isServerOwner = Boolean(
    (serverAuthSession?.userId && cookieAuth.isOwner) ||
    cookieAuth.role === "OWNER" ||
    (cookieAuth.email && isOwnerEmail(cookieAuth.email))
  );

  const isBearerOwner = Boolean(
    clientEmailFromBearer && isOwnerEmail(clientEmailFromBearer)
  );

  if (!isServerOwner && !isBearerOwner) {
    return NextResponse.json(
      {
        success: false,
        message: "Forbidden: Platform Owner privilege required (aapkaastro1606@gmail.com).",
      },
      { status: 403 }
    );
  }

  // 4. Host Classification (apex vs www vs localhost)
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    req.nextUrl.host ||
    "localhost";

  let hostType: "apex" | "www" | "localhost" | "other" = "other";
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    hostType = "localhost";
  } else if (host.startsWith("www.")) {
    hostType = "www";
  } else if (host.includes("aapkaastro.com")) {
    hostType = "apex";
  }

  // 5. Cookie Names Received (names only, NEVER values)
  const cookieNames = req.cookies.getAll().map((c) => c.name);

  // 6. Clerk Publishable Key Mode Analysis (prefix only, NEVER secrets)
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";
  const sk = process.env.CLERK_SECRET_KEY || "";
  const wh = process.env.CLERK_WEBHOOK_SECRET || "";

  let clerkKeyMode: "LIVE" | "TEST" | "MISSING" = "MISSING";
  if (pk.startsWith("pk_live_")) {
    clerkKeyMode = "LIVE";
  } else if (pk.startsWith("pk_test_")) {
    clerkKeyMode = "TEST";
  }

  const pkPrefix = pk ? `${pk.slice(0, 10)}...` : "NOT_CONFIGURED";

  // 7. Database Checks
  const startTime = Date.now();
  let dbReachable = false;
  let latencyMs = 0;
  let dbName: string | null = null;
  let dbError: string | undefined;
  let totalUserCount = 0;
  let currentUserHasDbRow = false;
  let lastFiveSignups: DiagnosticsData["database"]["lastFiveSignups"] = [];

  // Migrations & Table row counts
  let migrationTableExists = false;
  let appliedCount = 0;
  let migrationError: string | undefined;
  const keyTables = [
    "users",
    "wallets",
    "wallet_transactions",
    "sessions",
    "session_messages",
    "reviews",
    "kundli_records",
    "blog_posts",
    "instagram_media",
    "panchang_entries",
    "coupons",
    "staff_permissions",
    "clerk_webhook_events",
    "platform_settings",
  ];
  const tableCounts: Record<string, number | { error: string }> = {};

  try {
    const rawPing = await prisma.$queryRaw<any[]>`SELECT current_database();`;
    latencyMs = Date.now() - startTime;
    dbReachable = true;
    if (rawPing && rawPing[0]) {
      dbName = rawPing[0].current_database || null;
    }

    totalUserCount = await prisma.user.count();

    const activeUserId = serverAuthSession?.userId || clientUserIdFromBearer;
    const activeEmail = cookieAuth.email || clientEmailFromBearer;

    if (activeUserId || activeEmail) {
      const userRow = await prisma.user.findFirst({
        where: {
          OR: [
            ...(activeUserId ? [{ clerkId: activeUserId }] : []),
            ...(activeEmail ? [{ email: { equals: activeEmail, mode: "insensitive" as const } }] : []),
          ],
        },
        select: { id: true },
      });
      currentUserHasDbRow = Boolean(userRow);
    }

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        clerkId: true,
        createdAt: true,
      },
    });

    lastFiveSignups = recentUsers.map((u) => ({
      id: u.id,
      emailMasked: maskEmail(u.email),
      role: String(u.role),
      hasClerkId: Boolean(u.clerkId),
      createdAt: u.createdAt.toISOString(),
    }));

    // Migrations count
    try {
      const migs = await prisma.$queryRaw<any[]>`
        SELECT id, migration_name, finished_at FROM "_prisma_migrations" ORDER BY started_at ASC;
      `;
      migrationTableExists = true;
      appliedCount = migs.length;
    } catch (err: any) {
      migrationTableExists = false;
      appliedCount = 0;
      migrationError = err?.message?.includes("does not exist")
        ? 'Prisma migrations table "_prisma_migrations" does not exist.'
        : err?.message;
    }

    // Key table counts
    for (const t of keyTables) {
      try {
        const countRes = await prisma.$queryRawUnsafe<any[]>(
          `SELECT count(*)::int as count FROM "${t}";`
        );
        tableCounts[t] = countRes[0]?.count ?? 0;
      } catch (err: any) {
        tableCounts[t] = { error: err?.message || "Query failed" };
      }
    }
  } catch (err: any) {
    latencyMs = Date.now() - startTime;
    dbError = "Database query failed";
    for (const t of keyTables) {
      tableCounts[t] = { error: "Database unreachable" };
    }
  }

  // 8. Last Clerk Webhook Received
  const lastWebhook = await ClerkWebhookTracker.getLastWebhook();

  // 9. Required Environment Variables Checklist (Boolean true/false only)
  const envChecklist = [
    {
      key: "DATABASE_URL",
      required: true,
      isSet: Boolean(process.env.DATABASE_URL),
      description: "Neon PostgreSQL connection string (pooler / pgbouncer URL)",
    },
    {
      key: "DIRECT_URL",
      required: true,
      isSet: Boolean(process.env.DIRECT_URL),
      description: "Neon PostgreSQL direct connection string (required for migrations / CLI)",
    },
    {
      key: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
      required: true,
      isSet: Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY),
      description: "Client-side Clerk publishable key",
    },
    {
      key: "CLERK_SECRET_KEY",
      required: true,
      isSet: Boolean(process.env.CLERK_SECRET_KEY),
      description: "Server-side Clerk secret key for backend authentication",
    },
    {
      key: "CLERK_WEBHOOK_SECRET",
      required: true,
      isSet: Boolean(process.env.CLERK_WEBHOOK_SECRET),
      description: "Svix webhook signing secret from Clerk Dashboard for user sync",
    },
    {
      key: "OWNER_EMAIL",
      required: true,
      isSet: Boolean(process.env.OWNER_EMAIL || process.env.NEXT_PUBLIC_OWNER_EMAIL),
      description: "Designated Owner email addresses for administrative privilege",
    },
  ];

  // 10. Satellite Variables Audit
  const isSatelliteSet = Boolean(process.env.NEXT_PUBLIC_CLERK_IS_SATELLITE);
  const isDomainSet = Boolean(process.env.NEXT_PUBLIC_CLERK_DOMAIN);
  const satelliteConfig = {
    isSatelliteSet,
    satelliteValue: process.env.NEXT_PUBLIC_CLERK_IS_SATELLITE || null,
    isDomainSet,
    domainValue: process.env.NEXT_PUBLIC_CLERK_DOMAIN || null,
    anySatelliteVariableSet: isSatelliteSet || isDomainSet,
  };

  const payload: DiagnosticsData = {
    timestamp: new Date().toISOString(),
    clerk: {
      keyMode: clerkKeyMode,
      publishableKeyConfigured: Boolean(pk),
      publishableKeyPrefix: pkPrefix,
      secretKeyConfigured: Boolean(sk),
      webhookSecretConfigured: Boolean(wh),
    },
    serverAuth: {
      recognized: Boolean(serverAuthSession?.userId),
      userId: serverAuthSession?.userId ? `${serverAuthSession.userId.slice(0, 8)}...` : null,
      cookieNames,
      host,
      hostType,
    },
    database: {
      reachable: dbReachable,
      latencyMs,
      databaseName: dbName,
      currentUserHasDbRow,
      totalUserCount,
      lastFiveSignups,
      error: dbError,
    },
    migrations: {
      tableExists: migrationTableExists,
      appliedCount,
      error: migrationError,
    },
    tables: tableCounts,
    lastWebhookReceived: lastWebhook,
    envChecklist,
    satelliteConfig,
  };

  return NextResponse.json({
    success: true,
    diagnostics: payload,
  });
}
