/**
 * Neon PostgreSQL Connection Verification Script
 *
 * Verifies that DATABASE_URL is configured to use Neon's pooled endpoint
 * (via PgBouncer with -pooler) and tests live connectivity.
 */

import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Auto-load .env.local or .env if present
function loadEnv() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

const { assertStagingEnvironment } = require("./guard");
assertStagingEnvironment("verify-neon-connection.ts");

async function main() {
  console.log("\n=======================================================");
  console.log("AAPKA ASTRO - NEON DATABASE CONFIGURATION AUDIT");
  console.log("=======================================================\n");

  const databaseUrl = process.env.DATABASE_URL || "";
  const directUrl = process.env.DIRECT_URL || "";

  if (!databaseUrl) {
    console.error("❌ ERROR: DATABASE_URL is not set in environment.");
    process.exit(1);
  }

  // Parse connection URL
  let parsedDbUrl: URL;
  try {
    parsedDbUrl = new URL(databaseUrl.replace("postgresql://", "http://"));
  } catch (err: any) {
    console.error("❌ ERROR: DATABASE_URL is malformed:", err.message);
    process.exit(1);
  }

  const hostname = parsedDbUrl.hostname;
  const isNeon = hostname.includes("neon.tech");
  const isPooled = hostname.includes("-pooler.");

  console.log(`📡 Hostname: ${hostname}`);
  console.log(`🗄️ Database: ${parsedDbUrl.pathname.replace("/", "")}`);
  console.log(`🟢 Provider: ${isNeon ? "Neon (neon.tech)" : "Custom / Localhost"}`);

  if (isNeon) {
    if (isPooled) {
      console.log("✅ POOLING: Using Neon PgBouncer pooled connection (-pooler). Optimal for Vercel Serverless!");
    } else {
      console.warn("⚠️ WARNING: Hostname does NOT include '-pooler'.");
      console.warn("   For Vercel serverless deployments, you should use the pooled connection string");
      console.warn("   to prevent Postgres connection exhaustion under concurrent traffic.");
    }
  }

  if (directUrl) {
    console.log("✅ DIRECT_URL: Configured for Prisma CLI migrations.");
  } else {
    console.log("ℹ️ DIRECT_URL: Not explicitly set (Prisma will fall back to DATABASE_URL).");
  }

  console.log("\nTesting live database connectivity...");
  const prisma = new PrismaClient();

  try {
    const result: any = await prisma.$queryRawUnsafe("SELECT version() as ver, NOW() as current_time;");
    console.log("✅ SUCCESS: Database connected successfully!");
    console.log(`   Version: ${result[0]?.ver?.slice(0, 50)}...`);
    console.log(`   Server Time: ${result[0]?.current_time}`);
  } catch (err: any) {
    console.warn("⚠️ NOTICE: Live database query did not succeed with current credentials.");
    console.warn(`   Reason: ${err.message}`);
    console.warn("   Note: If you have not yet pasted your live Neon connection string into .env.local,");
    console.warn("   please follow the steps in AUDIT_REPORT.md Section 9.\n");
  } finally {
    await prisma.$disconnect();
  }
}

main();
