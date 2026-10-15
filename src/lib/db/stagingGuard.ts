/**
 * Staging Database Safety Guard
 *
 * Strict policy: No test, seed, or verification script may touch the production database.
 * Every script must run against the designated Neon staging branch (ep-summer-grass-b4twg911...).
 */

export const STAGING_HOST_ALLOWLIST: readonly string[] = [
  "ep-summer-grass-b4twg911.c-6.us-east-2.aws.neon.tech",
  "ep-summer-grass-b4twg911-pooler.c-6.us-east-2.aws.neon.tech",
  "ep-restless-night-b4vnazf4.c-6.us-east-2.aws.neon.tech", // pre-cleanup backup
  "ep-restless-night-b4vnazf4-pooler.c-6.us-east-2.aws.neon.tech",
  "localhost",
  "127.0.0.1",
];

export const PRODUCTION_HOST_KEYWORDS: readonly string[] = [
  "ep-restless-wildflower-b4r94suj",
];

export function getDatabaseHost(connectionString?: string): string | null {
  const url = connectionString || process.env.DATABASE_URL;
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.host;
  } catch {
    return null;
  }
}

export function isStagingDatabase(connectionString?: string): boolean {
  const host = getDatabaseHost(connectionString);
  if (!host) return false;

  for (const prodKey of PRODUCTION_HOST_KEYWORDS) {
    if (host.includes(prodKey)) {
      return false;
    }
  }

  return STAGING_HOST_ALLOWLIST.some((allowed) => host === allowed || host.includes(allowed));
}

export function enforceStagingDatabase(scriptName: string = "Script") {
  const isStagingEnv = process.env.IS_STAGING_ENVIRONMENT === "true";
  const host = getDatabaseHost();

  const isExplicitOverride =
    process.argv.includes("--allow-production") ||
    process.env.ALLOW_PRODUCTION_OVERRIDE === "true";

  if (isExplicitOverride) {
    console.warn(`[WARNING] Database safety guard overridden for ${scriptName} with --allow-production.`);
    return;
  }

  if (!isStagingEnv && !isStagingDatabase()) {
    throw new Error(
      `[DATABASE SAFETY VIOLATION] Refusing to run ${scriptName} against host "${host || "UNKNOWN"}". ` +
        `Tests, seeds, and verification scripts are STRICTLY FORBIDDEN from touching the production database. ` +
        `Use the Neon staging branch (ep-summer-grass-b4twg911) with IS_STAGING_ENVIRONMENT=true or .env.test.`
    );
  }
}
