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
  const isStagingEnv =
    process.env.IS_STAGING_ENVIRONMENT === "true" ||
    process.env.ALLOW_STAGING_SCRIPTS === "true" ||
    process.env.STAGING === "true" ||
    process.argv.includes("--staging");

  const host = getDatabaseHost();

  if (!isStagingEnv) {
    throw new Error(
      `[SCRIPT SAFETY VIOLATION] Refusing to run ${scriptName}: Explicit staging flag is missing. ` +
        `Set IS_STAGING_ENVIRONMENT="true" or ALLOW_STAGING_SCRIPTS="true" or pass --staging.`
    );
  }

  if (!isStagingDatabase()) {
    throw new Error(
      `[DATABASE SAFETY VIOLATION] Refusing to run ${scriptName} against host "${host || "UNKNOWN"}". ` +
        `Scripts, seeds, and verification tools are STRICTLY FORBIDDEN from touching the production database. ` +
        `Target must be an allowlisted Neon staging branch (ep-summer-grass-b4twg911) or localhost.`
    );
  }
}
