import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { assertStagingEnvironment, STAGING_ALLOWLIST, PRODUCTION_BLOCKLIST } from "../scripts/guard.js";

describe("Script & Database Execution Safety Guard Suite", () => {
  const originalEnv = { ...process.env };

  test("refuses execution when explicit staging flag is missing", () => {
    delete process.env.ALLOW_STAGING_SCRIPTS;
    delete process.env.IS_STAGING_ENVIRONMENT;
    delete process.env.STAGING;

    let processExitCalled = false;
    let exitCode = 0;
    const originalExit = process.exit;
    process.exit = ((code?: number) => {
      processExitCalled = true;
      exitCode = code || 0;
      throw new Error(`process.exit(${code}) called`);
    }) as any;

    try {
      assert.throws(
        () => assertStagingEnvironment("unit-test-missing-flag"),
        /process\.exit\(1\) called/
      );
      assert.strictEqual(processExitCalled, true);
      assert.strictEqual(exitCode, 1);
    } finally {
      process.exit = originalExit;
      process.env = { ...originalEnv };
    }
  });

  test("strictly blocks execution against production database (ep-restless-wildflower-b4r94suj)", () => {
    process.env.ALLOW_STAGING_SCRIPTS = "true";
    process.env.DATABASE_URL =
      "postgresql://user:pass@ep-restless-wildflower-b4r94suj-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require";

    let processExitCalled = false;
    let exitCode = 0;
    const originalExit = process.exit;
    process.exit = ((code?: number) => {
      processExitCalled = true;
      exitCode = code || 0;
      throw new Error(`process.exit(${code}) called`);
    }) as any;

    try {
      assert.throws(
        () => assertStagingEnvironment("unit-test-prod-db"),
        /process\.exit\(1\) called/
      );
      assert.strictEqual(processExitCalled, true);
      assert.strictEqual(exitCode, 1);
    } finally {
      process.exit = originalExit;
      process.env = { ...originalEnv };
    }
  });

  test("strictly blocks execution when database host is unallowlisted", () => {
    process.env.ALLOW_STAGING_SCRIPTS = "true";
    process.env.DATABASE_URL =
      "postgresql://user:pass@unknown-untrusted-host.aws.neon.tech/neondb?sslmode=require";

    let processExitCalled = false;
    let exitCode = 0;
    const originalExit = process.exit;
    process.exit = ((code?: number) => {
      processExitCalled = true;
      exitCode = code || 0;
      throw new Error(`process.exit(${code}) called`);
    }) as any;

    try {
      assert.throws(
        () => assertStagingEnvironment("unit-test-untrusted-host"),
        /process\.exit\(1\) called/
      );
      assert.strictEqual(processExitCalled, true);
      assert.strictEqual(exitCode, 1);
    } finally {
      process.exit = originalExit;
      process.env = { ...originalEnv };
    }
  });

  test("permits execution when staging flag is explicit and database host is allowlisted", () => {
    process.env.ALLOW_STAGING_SCRIPTS = "true";
    process.env.DATABASE_URL =
      "postgresql://user:pass@ep-summer-grass-b4twg911-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require";

    let passed = false;
    try {
      passed = assertStagingEnvironment("unit-test-valid-staging");
      assert.strictEqual(passed, true);
    } finally {
      process.env = { ...originalEnv };
    }
  });

  test("allowlist and blocklist configurations contain expected identifiers", () => {
    assert.ok(STAGING_ALLOWLIST.includes("ep-summer-grass-b4twg911"));
    assert.ok(STAGING_ALLOWLIST.includes("localhost"));
    assert.ok(PRODUCTION_BLOCKLIST.includes("ep-restless-wildflower-b4r94suj"));
  });
});
