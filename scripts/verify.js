/**
 * ==============================================================================
 * AAPKA ASTRO — RELEASE SAFETY VERIFICATION SUITE (npm run verify)
 * ==============================================================================
 * Pipeline Stages:
 * 1. LINT: eslint src/
 * 2. TYPECHECK: tsc --noEmit
 * 3. UNIT & INTEGRATION TESTS: tsx --env-file=.env.test --test tests (all test suites)
 * 4. NEXT.JS PRODUCTION BUILD: next build
 * 5. LIVE SMOKE TESTS (against next start):
 *    - Key pages return 200 (/, /about, /services, /consult, /contact, /sitemap.xml, /robots.txt)
 *    - Legal pages return 200 (/privacy-policy, /terms, /disclaimer, /pricing-policy, /refund-policy)
 *    - /admin redirects when unauthenticated
 *    - /api/health is healthy
 * ==============================================================================
 */

const { spawn, execSync } = require("child_process");

const SMOKE_PORT = 3099;
const BASE_URL = `http://127.0.0.1:${SMOKE_PORT}`;

function step(title) {
  console.log("\n================================================================================");
  console.log(`▶ STAGE: ${title}`);
  console.log("================================================================================");
}

function runCommand(command, name) {
  step(name);
  try {
    execSync(command, { stdio: "inherit", env: process.env });
    console.log(`✅ [${name}] Passed successfully.`);
  } catch (err) {
    console.error(`❌ [${name}] FAILED with exit code: ${err.status}`);
    process.exit(err.status || 1);
  }
}

async function waitServerReady(url, maxRetries = 40, delayMs = 1000) {
  for (let i = 1; i <= maxRetries; i++) {
    try {
      const res = await fetch(`${url}/api/health`);
      if (res.status === 200) {
        console.log(`✅ Next.js server is up and responding on ${url} (attempt ${i})`);
        return true;
      }
    } catch {
      // Server not ready yet
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error(`Server failed to start on ${url} within ${(maxRetries * delayMs) / 1000}s`);
}

async function runSmokeTests() {
  step("5. Smoke Tests Against Built App (next start)");

  console.log(`Spawning Next.js production server on port ${SMOKE_PORT}...`);
  const nextBin = require.resolve("next/dist/bin/next");
  const serverProcess = spawn(
    process.execPath,
    [nextBin, "start", "-p", String(SMOKE_PORT)],
    {
      stdio: "pipe",
      env: {
        ...process.env,
        PORT: String(SMOKE_PORT),
        IS_STAGING_ENVIRONMENT: "true",
      },
    }
  );

  let serverOutput = "";
  serverProcess.stdout.on("data", (d) => {
    serverOutput += d.toString();
  });
  serverProcess.stderr.on("data", (d) => {
    serverOutput += d.toString();
  });

  const cleanup = () => {
    console.log("[Smoke Tests] Terminating background server process...");
    try {
      if (process.platform === "win32") {
        execSync(`taskkill /pid ${serverProcess.pid} /T /F`, { stdio: "ignore" });
      } else {
        serverProcess.kill("SIGTERM");
      }
    } catch {
      // ignore kill errors
    }
  };

  try {
    await waitServerReady(BASE_URL);

    const pagesToTest = [
      { path: "/", desc: "Homepage" },
      { path: "/about", desc: "About Us" },
      { path: "/services", desc: "Services Directory" },
      { path: "/consult", desc: "Consultation Booking Desk" },
      { path: "/contact", desc: "Contact Page" },
      { path: "/privacy-policy", desc: "Privacy Policy" },
      { path: "/terms", desc: "Terms & Conditions" },
      { path: "/disclaimer", desc: "Astrological Disclaimer" },
      { path: "/pricing-policy", desc: "Pricing Policy" },
      { path: "/refund-policy", desc: "Refund Policy" },
      { path: "/sitemap.xml", desc: "XML Sitemap" },
      { path: "/robots.txt", desc: "Robots.txt" },
    ];

    let failures = 0;

    // 1. Verify Key Pages return HTTP 200
    for (const page of pagesToTest) {
      const url = `${BASE_URL}${page.path}`;
      try {
        const res = await fetch(url);
        if (res.status === 200) {
          console.log(`  ✔ [200 OK] ${page.path} (${page.desc})`);
        } else {
          console.error(`  ❌ [FAIL] ${page.path} returned HTTP ${res.status} (expected 200)`);
          failures++;
        }
      } catch (err) {
        console.error(`  ❌ [ERROR] ${page.path} request error:`, err?.message || err);
        failures++;
      }
    }

    // 2. Verify /admin redirects when logged out
    try {
      const adminRes = await fetch(`${BASE_URL}/admin`, { redirect: "manual" });
      const status = adminRes.status;
      const location = adminRes.headers.get("location") || "";
      const isRedirect = (status >= 300 && status <= 308) || status === 401;

      if (isRedirect && (location.includes("/login") || status === 401)) {
        console.log(`  ✔ [REDIRECT] /admin redirects when unauthenticated (Status: ${status}, Location: ${location || "N/A"})`);
      } else {
        console.error(`  ❌ [FAIL] /admin did NOT redirect to login! Status: ${status}, Location: ${location}`);
        failures++;
      }
    } catch (err) {
      console.error(`  ❌ [ERROR] /admin redirect check error:`, err?.message || err);
      failures++;
    }

    // 3. Verify /api/health is healthy
    try {
      const healthRes = await fetch(`${BASE_URL}/api/health`);
      if (healthRes.status === 200) {
        const healthJson = await healthRes.json();
        if (healthJson.status === "healthy") {
          console.log(`  ✔ [HEALTHY] /api/health reports status: "healthy" (Commit: ${healthJson.commitSha}, Env: ${healthJson.environment})`);
        } else {
          console.error(`  ❌ [FAIL] /api/health status is NOT healthy:`, healthJson);
          failures++;
        }
      } else {
        console.error(`  ❌ [FAIL] /api/health returned HTTP ${healthRes.status}`);
        failures++;
      }
    } catch (err) {
      console.error(`  ❌ [ERROR] /api/health check error:`, err?.message || err);
      failures++;
    }

    cleanup();

    if (failures > 0) {
      console.error(`\n❌ [Smoke Tests FAILED] ${failures} smoke test(s) failed.`);
      process.exit(1);
    }

    console.log("\n✅ [Smoke Tests PASSED] All key pages, admin auth redirect, and public health verified!");
  } catch (err) {
    cleanup();
    console.error(`\n❌ [Smoke Tests EXCEPTION]`, err?.message || err);
    if (serverOutput) {
      console.error("\nServer output log:\n" + serverOutput.slice(-1000));
    }
    process.exit(1);
  }
}

async function main() {
  console.log("\n================================================================================");
  console.log("   AAPKA ASTRO — COMPLETE RELEASE SAFETY VERIFICATION PIPELINE");
  console.log("================================================================================");

  // Stage 1: Lint
  runCommand("npx eslint src/ --max-warnings=1000", "1. ESLint Static Code Analysis");

  // Stage 2: Typecheck
  runCommand("npx tsc --noEmit", "2. TypeScript Compiler Typechecking");

  // Stage 3: Unit & Integration Tests
  const fs = require("fs");
  const testCmd = fs.existsSync(".env.test")
    ? "npx tsx --env-file=.env.test --test tests/**/*.test.ts"
    : "npx tsx --test tests/**/*.test.ts";
  runCommand(testCmd, "3. Automated Test Suites");

  // Stage 4: Next.js Production Build
  runCommand("npx next build", "4. Next.js Production Build (next build)");

  // Stage 5: Live Smoke Tests
  await runSmokeTests();

  console.log("\n================================================================================");
  console.log("🎉 ALL RELEASE SAFETY CHECKS PASSED — READY FOR PRODUCTION DEPLOYMENT!");
  console.log("================================================================================\n");
}

main().catch((err) => {
  console.error("Fatal error during release verification:", err);
  process.exit(1);
});
