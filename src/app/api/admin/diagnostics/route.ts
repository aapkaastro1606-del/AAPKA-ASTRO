import { NextRequest, NextResponse } from "next/server";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import { prisma } from "@/lib/db/prisma";
import { ClerkWebhookTracker } from "@/lib/auth/clerkWebhookTracker";
import { PlatformSettingsService, maskUpiId } from "@/lib/services/platformSettingsService";
import { ChatbotHealthTracker, ChatbotDiagnostics } from "@/lib/assistant/chatbotHealthTracker";

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
  payment: {
    payeeName: string;
    maskedUpiId: string;
    upiConfigured: boolean;
    unpaidExpiryDays: number;
    storageProvider: string;
  };
  chatbot: ChatbotDiagnostics;
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
 * Authenticated exclusively via getServerAuthUser().
 */
export async function GET(req: NextRequest) {
  const auth = await getServerAuthUser();

  if (!auth.isAuthenticated || !auth.isOwner) {
    return NextResponse.json(
      {
        success: false,
        message: "Forbidden: Platform Owner privilege required (aapkaastro1606@gmail.com).",
      },
      { status: 403 }
    );
  }

  // 1. Audit Clerk Configuration
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";
  const sk = process.env.CLERK_SECRET_KEY || "";
  const wh = process.env.CLERK_WEBHOOK_SECRET || "";

  let clerkKeyMode: "LIVE" | "TEST" | "MISSING" = "MISSING";
  if (pk.startsWith("pk_live_")) {
    clerkKeyMode = "LIVE";
  } else if (pk.startsWith("pk_test_")) {
    clerkKeyMode = "TEST";
  }

  const pkPrefix = pk ? `${pk.slice(0, 12)}...` : "NOT_SET";

  // 2. Audit Server Auth Recognition
  const cookieNames = req.cookies.getAll().map((c) => c.name);
  const host = req.headers.get("host") || "unknown";

  let hostType: "apex" | "www" | "localhost" | "other" = "other";
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    hostType = "localhost";
  } else if (host === "aapkaastro.com") {
    hostType = "apex";
  } else if (host === "www.aapkaastro.com") {
    hostType = "www";
  }

  // 3. Audit Database Connectivity & User Sync Status
  let dbReachable = false;
  let latencyMs = -1;
  let dbName: string | null = null;
  let currentUserHasDbRow = false;
  let totalUserCount = 0;
  let lastFiveSignups: Array<{
    id: string;
    emailMasked: string;
    role: string;
    hasClerkId: boolean;
    createdAt: string;
  }> = [];
  let dbError: string | undefined;

  const startTime = Date.now();
  try {
    const rawPing: Array<{ current_database: string }> =
      await prisma.$queryRaw`SELECT current_database()`;
    latencyMs = Date.now() - startTime;
    dbReachable = true;
    if (rawPing && rawPing[0]) {
      dbName = rawPing[0].current_database || null;
    }

    totalUserCount = await prisma.user.count();

    if (auth.userId || auth.email) {
      const userRow = await prisma.user.findFirst({
        where: {
          OR: [
            ...(auth.userId ? [{ id: auth.userId }] : []),
            ...(auth.clerkId ? [{ clerkId: auth.clerkId }] : []),
            ...(auth.email ? [{ email: { equals: auth.email, mode: "insensitive" as const } }] : []),
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
      id: `${u.id.slice(0, 8)}...`,
      emailMasked: maskEmail(u.email),
      role: u.role,
      hasClerkId: Boolean(u.clerkId),
      createdAt: u.createdAt.toISOString(),
    }));
  } catch (err: any) {
    dbError = err?.message || String(err);
  }

  // 4. Audit Prisma Migrations
  let migrationsTableExists = false;
  let appliedCount = 0;
  let migrationsError: string | undefined;

  try {
    const migrations: Array<{ id: string }> =
      await prisma.$queryRaw`SELECT id FROM "_prisma_migrations" WHERE finished_at IS NOT NULL`;
    migrationsTableExists = true;
    appliedCount = migrations.length;
  } catch (err: any) {
    migrationsError = err?.message || String(err);
  }

  // 5. Table Counts Audit
  const tables: Record<string, number | { error: string }> = {};
  const tableCheckers: Array<{ name: string; fn: () => Promise<number> }> = [
    { name: "users", fn: () => prisma.user.count() },
    { name: "wallets", fn: () => prisma.wallet.count() },
    { name: "sessions", fn: () => prisma.session.count() },
    { name: "session_messages", fn: () => prisma.sessionMessage.count() },
    { name: "wallet_transactions", fn: () => prisma.walletTransaction.count() },
    { name: "content_entries", fn: () => prisma.contentEntry.count() },
    { name: "reviews", fn: () => prisma.review.count() },
    { name: "blog_posts", fn: () => prisma.blogPost.count() },
    { name: "coupons", fn: () => prisma.coupon.count() },
    { name: "kundli_records", fn: () => prisma.kundliRecord.count() },
    { name: "instagram_media", fn: () => prisma.instagramMedia.count() },
    { name: "media_assets", fn: () => prisma.mediaAsset.count() },
    { name: "audit_logs", fn: () => prisma.auditLog.count() },
    { name: "platform_settings", fn: () => prisma.platformSetting.count() },
    { name: "kundli_leads", fn: () => prisma.kundliLead.count() },
    { name: "staff_permissions", fn: () => prisma.staffPermission.count() },
    { name: "knowledge_entries", fn: () => prisma.knowledgeEntry.count() },
    { name: "unanswered_questions", fn: () => prisma.unansweredQuestion.count() },
  ];

  await Promise.all(
    tableCheckers.map(async ({ name, fn }) => {
      try {
        tables[name] = await fn();
      } catch (err: any) {
        tables[name] = { error: err?.message || "Failed to count" };
      }
    })
  );

  // 6. Last Webhook Received
  const lastWebhook = await ClerkWebhookTracker.getLastWebhook();

  // 7. Satellite Domain Configuration Audit
  const satelliteVal = process.env.NEXT_PUBLIC_CLERK_SATELLITE || null;
  const domainVal = process.env.NEXT_PUBLIC_CLERK_DOMAIN || null;
  const anySatellite = Boolean(
    satelliteVal ||
      domainVal ||
      process.env.CLERK_SATELLITE ||
      process.env.CLERK_DOMAIN
  );

  // 8. Env Checklist
  const envChecklist = [
    {
      key: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
      required: true,
      isSet: Boolean(pk),
      description: "Clerk Client Key (pk_live_... for production)",
    },
    {
      key: "CLERK_SECRET_KEY",
      required: true,
      isSet: Boolean(sk),
      description: "Clerk Server Secret Key",
    },
    {
      key: "CLERK_WEBHOOK_SECRET",
      required: true,
      isSet: Boolean(wh),
      description: "Svix webhook signing secret",
    },
    {
      key: "DATABASE_URL",
      required: true,
      isSet: Boolean(process.env.DATABASE_URL),
      description: "Pooled PostgreSQL connection string",
    },
    {
      key: "DIRECT_URL",
      required: false,
      isSet: Boolean(process.env.DIRECT_URL),
      description: "Direct non-pooled connection for migrations",
    },
    {
      key: "OWNER_EMAIL",
      required: true,
      isSet: Boolean(process.env.OWNER_EMAIL),
      description: "Platform owner email (aapkaastro1606@gmail.com)",
    },
    {
      key: "UPSTASH_REDIS_REST_URL",
      required: false,
      isSet: Boolean(process.env.UPSTASH_REDIS_REST_URL),
      description: "Serverless Redis queue and cache URL",
    },
    {
      key: "UPSTASH_REDIS_REST_TOKEN",
      required: false,
      isSet: Boolean(process.env.UPSTASH_REDIS_REST_TOKEN),
      description: "Serverless Redis queue auth token",
    },
  ];

  // 9. Payment Settings & Storage Audit
  let paymentDiagnostics = {
    payeeName: "Aapka Astro",
    maskedUpiId: "9311215564@***",
    upiConfigured: false,
    unpaidExpiryDays: 2,
    storageProvider: "local",
  };

  try {
    const paymentSettings = await PlatformSettingsService.getPaymentSettings();
    paymentDiagnostics = {
      payeeName: paymentSettings.payeeName || "Aapka Astro",
      maskedUpiId: maskUpiId(paymentSettings.upiId),
      upiConfigured: Boolean(paymentSettings.upiId && paymentSettings.whatsappConfirmed),
      unpaidExpiryDays: paymentSettings.unpaidExpiryDays || 2,
      storageProvider: process.env.STORAGE_PROVIDER || "unconfigured",
    };
  } catch {
    // Non-blocking fallback
  }

  // 10. AI Chatbot Health & Breaker Status
  const chatbotDiagnostics = ChatbotHealthTracker.getDiagnostics();

  const responseData: DiagnosticsData = {
    timestamp: new Date().toISOString(),
    clerk: {
      keyMode: clerkKeyMode,
      publishableKeyConfigured: Boolean(pk),
      publishableKeyPrefix: pkPrefix,
      secretKeyConfigured: Boolean(sk),
      webhookSecretConfigured: Boolean(wh),
    },
    serverAuth: {
      recognized: Boolean(auth.isAuthenticated),
      userId: auth.userId ? `${auth.userId.slice(0, 8)}...` : null,
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
      ...(dbError ? { error: dbError } : {}),
    },
    migrations: {
      tableExists: migrationsTableExists,
      appliedCount,
      ...(migrationsError ? { error: migrationsError } : {}),
    },
    tables,
    lastWebhookReceived: lastWebhook,
    envChecklist,
    satelliteConfig: {
      isSatelliteSet: Boolean(satelliteVal),
      satelliteValue: satelliteVal,
      isDomainSet: Boolean(domainVal),
      domainValue: domainVal,
      anySatelliteVariableSet: anySatellite,
    },
    payment: paymentDiagnostics,
    chatbot: chatbotDiagnostics,
  };

  return NextResponse.json({
    success: true,
    diagnostics: responseData,
  });
}
