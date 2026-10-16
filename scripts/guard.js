/**
 * ==============================================================================
 * AAPKA ASTRO — SCRIPT & DATABASE EXECUTION SAFETY GUARD
 * ==============================================================================
 * STRICT ENVIRONMENT ENFORCEMENT CONTRACT:
 * 1. Every execution of maintenance, diagnostic, or migration scripts in /scripts
 *    strictly requires an explicit staging flag (ALLOW_STAGING_SCRIPTS="true"
 *    or IS_STAGING_ENVIRONMENT="true" or --staging CLI flag).
 * 2. If DATABASE_URL is set, the host MUST be on the verified staging allowlist:
 *    - "ep-summer-grass-b4twg911" (Neon staging compute branch)
 *    - "localhost" / "127.0.0.1" (local isolated test database)
 * 3. Execution against the production database ("ep-restless-wildflower-b4r94suj")
 *    or any non-allowlisted host is unconditionally blocked with exit code 1.
 * 4. Destructive commands ("prisma db push", "prisma migrate reset") are forbidden
 *    against anything but verified staging databases.
 * ==============================================================================
 */

const STAGING_ALLOWLIST = [
  "ep-summer-grass-b4twg911",
  "ep-summer-grass-b4twg911-pooler",
  "localhost",
  "127.0.0.1",
];

const PRODUCTION_BLOCKLIST = [
  "ep-restless-wildflower-b4r94suj",
  "ep-restless-wildflower-b4r94suj-pooler",
];

function extractDbHost(connectionString) {
  if (!connectionString) return null;
  try {
    const match = connectionString.match(/@([^/:?]+)/);
    return match ? match[1].toLowerCase() : null;
  } catch {
    return null;
  }
}

function assertStagingEnvironment(scriptName = "Script") {
  // 1. Check explicit staging flag
  const isStagingFlagExplicit =
    process.env.ALLOW_STAGING_SCRIPTS === "true" ||
    process.env.IS_STAGING_ENVIRONMENT === "true" ||
    process.env.STAGING === "true" ||
    process.argv.includes("--staging");

  if (!isStagingFlagExplicit) {
    console.error("\n================================================================================");
    console.error(`🚨 [FATAL SCRIPT GUARD] Execution Blocked: ${scriptName}`);
    console.error("================================================================================");
    console.error("Refusing to run script without an explicit staging environment flag.");
    console.error("To execute scripts safely, you MUST set:");
    console.error('  ALLOW_STAGING_SCRIPTS="true" or IS_STAGING_ENVIRONMENT="true"');
    console.error("or pass the '--staging' flag in command line.");
    console.error("Never run exploratory, diagnostic, or cleanup scripts against production!");
    console.error("================================================================================\n");
    process.exit(1);
  }

  // 2. Check Database host if configured
  const dbUrl = process.env.DATABASE_URL || process.env.DIRECT_URL;
  if (dbUrl) {
    const host = extractDbHost(dbUrl);
    if (!host) {
      console.error(`🚨 [FATAL DATABASE GUARD] Could not parse database host from connection string.`);
      process.exit(1);
    }

    // Check production blocklist
    const isExplicitProd = PRODUCTION_BLOCKLIST.some((blocked) => host.includes(blocked));
    if (isExplicitProd) {
      console.error("\n================================================================================");
      console.error(`🚨 [CRITICAL DATABASE GUARD] PRODUCTION DATABASE TARGET DETECTED!`);
      console.error("================================================================================");
      console.error(`Detected Host: ${host}`);
      console.error(`Target: AAPKA ASTRO PRODUCTION DATABASE (ep-restless-wildflower-b4r94suj)`);
      console.error("Running scripts, resets, or exploratory tools against production is STRICTLY FORBIDDEN.");
      console.error("================================================================================\n");
      process.exit(1);
    }

    // Check staging allowlist
    const isAllowlisted = STAGING_ALLOWLIST.some((allowed) => host.includes(allowed));
    if (!isAllowlisted) {
      console.error("\n================================================================================");
      console.error(`🚨 [FATAL DATABASE GUARD] Database Host Not On Staging Allowlist!`);
      console.error("================================================================================");
      console.error(`Detected Host: ${host}`);
      console.error(`Allowed Hosts: ${STAGING_ALLOWLIST.join(", ")}`);
      console.error("Aborting script execution to prevent unintended database mutations.");
      console.error("================================================================================\n");
      process.exit(1);
    }
  }

  return true;
}

// Auto-run guard if invoked directly from CLI (e.g. "node scripts/guard.js")
if (require.main === module) {
  assertStagingEnvironment("Direct CLI Guard Check");
  console.log("✅ [Script Guard] Environment verified: explicit staging flag set and database host allowlisted.");
}

module.exports = {
  assertStagingEnvironment,
  STAGING_ALLOWLIST,
  PRODUCTION_BLOCKLIST,
};
