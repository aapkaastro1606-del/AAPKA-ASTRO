import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import { isOwnerEmail } from "@/lib/auth/staffPermissions";

export const dynamic = "force-dynamic";

function getCommitSha(): string {
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA;
  if (process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA) return process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;
  if (process.env.GIT_COMMIT_SHA) return process.env.GIT_COMMIT_SHA;
  try {
    const { execSync } = require("child_process");
    return execSync("git rev-parse --short HEAD", { stdio: ["pipe", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return "unknown";
  }
}

/**
 * Health Check Endpoint
 * - Shallow (default): No database access. Returns status, commit SHA, environment.
 *   Reason: Uptime monitors ping every 5 minutes and must not keep Neon database awake.
 * - Deep (?deep=1): Database ping, migration count, and provider status.
 *   Protected by CRON_SECRET or Owner session.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const isDeep = url.searchParams.get("deep") === "1";
  const commitSha = getCommitSha();
  const environment = process.env.NODE_ENV || "production";
  const timestamp = new Date().toISOString();

  // 1. SHALLOW HEALTH CHECK (Default)
  // Zero database calls to preserve Neon free compute allowance
  if (!isDeep) {
    return NextResponse.json(
      {
        status: "healthy",
        commitSha,
        environment,
        timestamp,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }

  // 2. DEEP HEALTH CHECK (?deep=1)
  // Protected by CRON_SECRET or Owner session
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization") || "";
  const headerSecret = req.headers.get("x-cron-secret") || "";
  const querySecret = url.searchParams.get("secret") || "";

  const hasValidCronSecret = Boolean(
    cronSecret &&
      (authHeader === `Bearer ${cronSecret}` ||
        headerSecret === cronSecret ||
        querySecret === cronSecret)
  );

  let isOwner = false;
  if (!hasValidCronSecret) {
    try {
      const serverUser = await getServerAuthUser();
      if (serverUser.isOwner || (serverUser.email && isOwnerEmail(serverUser.email))) {
        isOwner = true;
      }
    } catch {
      // ignore
    }
  }

  if (!hasValidCronSecret && !isOwner) {
    return NextResponse.json(
      {
        status: "unauthorized",
        error: "Unauthorized: Deep health check requires cron secret or Owner authentication.",
        timestamp,
      },
      {
        status: 401,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }

  // 3. EXECUTE DEEP DIAGNOSTIC PROBE
  const startTime = Date.now();
  let dbStatus = "disconnected";
  let latencyMs = 0;
  let migrationCount = 0;

  try {
    if (process.env.DATABASE_URL) {
      await prisma.$queryRaw`SELECT 1`;
      latencyMs = Date.now() - startTime;
      dbStatus = "connected";

      try {
        const migs = await prisma.$queryRaw<any[]>`
          SELECT count(*)::int as count FROM "_prisma_migrations" WHERE finished_at IS NOT NULL;
        `;
        migrationCount = migs[0]?.count ?? 0;
      } catch {
        migrationCount = 0;
      }
    }
  } catch {
    latencyMs = Date.now() - startTime;
    dbStatus = "disconnected";
  }

  const providers = {
    payment: process.env.PAYMENT_PROVIDER || "upi",
    storage: process.env.STORAGE_PROVIDER || "mock",
    calling: process.env.CALL_PROVIDER || "mock",
    chatbot: {
      provider: process.env.CHATBOT_PROVIDER || "mock",
      model: process.env.CHATBOT_MODEL || "unconfigured",
      keyConfigured: Boolean(process.env.CHATBOT_API_KEY && process.env.CHATBOT_API_KEY.trim().length > 0),
    },
    email: Boolean(
      process.env.RESEND_API_KEY &&
        !process.env.RESEND_API_KEY.startsWith("re_placeholder") &&
        process.env.RESEND_API_KEY.trim().length > 0
    ),
  };

  const isHealthy = dbStatus === "connected";

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "degraded",
      database: dbStatus,
      latencyMs,
      migrationCount,
      providers,
      commitSha,
      environment,
      timestamp,
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
