const { execSync } = require("child_process");

console.log("================================================================================");
console.log("AAPKA ASTRO PRODUCTION BUILD PIPELINE");
console.log("================================================================================");

// 1. Ensure DIRECT_URL fallback if only DATABASE_URL is configured in Vercel
if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
  console.log("[Build] DIRECT_URL not set. Falling back DIRECT_URL to DATABASE_URL for Prisma.");
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

// 2. Ensure Prisma client is generated
try {
  console.log("[Build] Generating Prisma Client...");
  execSync("npx prisma generate", { stdio: "inherit", env: process.env });
  console.log("[Build] Prisma Client generation complete.");
} catch (err) {
  console.warn("[Build] Warning: prisma generate encountered an issue:", err.message);
}

// 3. Run Prisma Migrations if database URL is available
if (process.env.DATABASE_URL) {
  console.log("[Build] Deploying Prisma Migrations to PostgreSQL...");
  try {
    execSync("npx prisma migrate deploy", { stdio: "inherit", env: process.env });
    console.log("[Build] Prisma migrations deployed successfully.");
  } catch (err) {
    console.error("[Build] Prisma migrate deploy encountered an error:", err.message);
    console.warn("[Build] Continuing to Next.js build (migrations may already be deployed).");
  }
} else {
  console.warn("[Build] DATABASE_URL not set in build environment. Skipping database migrations during static build.");
}

// 4. Run Next.js Production Build
console.log("[Build] Starting Next.js production build (next build)...");
try {
  execSync("npx next build", { stdio: "inherit", env: process.env });
  console.log("[Build] Next.js production build succeeded!");
} catch (err) {
  console.error("[Build] Next.js build failed:", err.message);
  process.exit(1);
}
