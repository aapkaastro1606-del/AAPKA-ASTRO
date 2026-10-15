import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth/serverAuth";
import { prisma } from "@/lib/db/prisma";
import { ClerkWebhookTracker } from "@/lib/auth/clerkWebhookTracker";

export const dynamic = "force-dynamic";

export interface DiagnosticsData {
  timestamp: string;
  database: {
    reachable: boolean;
    latencyMs: number;
    databaseName: string | null;
    version: string | null;
    host: string | null;
    error?: string;
  };
  migrations: {
    tableExists: boolean;
    appliedCount: number;
    error?: string;
  };
  tables: Record<string, number | { error: string }>;
  clerk: {
    keyMode: "LIVE" | "TEST" | "MISSING";
    publishableKeyConfigured: boolean;
    publishableKeyPrefix: string;
    secretKeyConfigured: boolean;
    secretKeyPrefix: string;
    webhookSecretConfigured: boolean;
    webhookSecretPrefix: string;
  };
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
}

export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req);

  // Strictly gate to platform Owner
  if (!auth.isAuthenticated || (!auth.isOwner && auth.role !== "OWNER")) {
    return NextResponse.json(
      {
        success: false,
        message: "Forbidden: Platform Owner privilege required for System Diagnostics.",
      },
      { status: 403 }
    );
  }

  const startTime = Date.now();
  let dbReachable = false;
  let latencyMs = 0;
  let dbName: string | null = null;
  let dbVersion: string | null = null;
  let dbHost: string | null = null;
  let dbError: string | undefined;

  // 1. Database Reachability Ping
  try {
    const rawPing = await prisma.$queryRaw<any[]>`SELECT current_database(), version();`;
    latencyMs = Date.now() - startTime;
    dbReachable = true;
    if (rawPing && rawPing[0]) {
      dbName = rawPing[0].current_database || null;
      dbVersion = rawPing[0].version ? String(rawPing[0].version).split(" on ")[0] : null;
    }

    const dbUrl = process.env.DATABASE_URL || "";
    const atMatch = dbUrl.match(/@([^:\/?#]+)/);
    if (atMatch) {
      dbHost = atMatch[1];
    }
  } catch (err: any) {
    latencyMs = Date.now() - startTime;
    dbError = err?.message || "Connection failed";
  }

  // 2. Applied Migrations Count
  let migrationTableExists = false;
  let appliedCount = 0;
  let migrationError: string | undefined;

  if (dbReachable) {
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
        ? 'Prisma migrations table "_prisma_migrations" does not exist. Migrations have never been applied via `prisma migrate deploy`.'
        : err?.message;
    }
  }

  // 3. Row Counts for Key Tables
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

  if (dbReachable) {
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
  } else {
    for (const t of keyTables) {
      tableCounts[t] = { error: "Database unreachable" };
    }
  }

  // 4. Clerk Key Mode Analysis (Prefix only, NEVER print secrets)
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
  const skPrefix = sk ? `${sk.slice(0, 10)}...` : "NOT_CONFIGURED";
  const whPrefix = wh ? `${wh.slice(0, 8)}...` : "NOT_CONFIGURED";

  // 5. Environment Variables Checklist (Boolean true/false only)
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
    {
      key: "CRON_SECRET",
      required: false,
      isSet: Boolean(process.env.CRON_SECRET),
      description: "Secret token authorizing automated Vercel Cron jobs",
    },
    {
      key: "JWT_SECRET",
      required: false,
      isSet: Boolean(process.env.JWT_SECRET),
      description: "JWT signing secret for session tokens",
    },
  ];

  const payload: DiagnosticsData = {
    timestamp: new Date().toISOString(),
    database: {
      reachable: dbReachable,
      latencyMs,
      databaseName: dbName,
      version: dbVersion,
      host: dbHost,
      error: dbError,
    },
    migrations: {
      tableExists: migrationTableExists,
      appliedCount,
      error: migrationError,
    },
    tables: tableCounts,
    clerk: {
      keyMode: clerkKeyMode,
      publishableKeyConfigured: Boolean(pk),
      publishableKeyPrefix: pkPrefix,
      secretKeyConfigured: Boolean(sk),
      secretKeyPrefix: skPrefix,
      webhookSecretConfigured: Boolean(wh),
      webhookSecretPrefix: whPrefix,
    },
    lastWebhookReceived: await ClerkWebhookTracker.getLastWebhook(),
    envChecklist,
  };

  return NextResponse.json({
    success: true,
    diagnostics: payload,
  });
}
