import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { GET as healthHandler } from "@/app/api/health/route";
import { GET as diagnosticsHandler } from "@/app/api/admin/diagnostics/route";
import { NextRequest } from "next/server";

describe("System Health & Diagnostics Audit Suite", () => {
  test("GET /api/health (shallow) returns status, commitSha, and environment with zero database wakeups", async () => {
    const req = new NextRequest("http://localhost:3000/api/health");
    const res = await healthHandler(req);
    assert.strictEqual(res.status, 200);
    const body = await res.json();

    assert.strictEqual(body.status, "healthy");
    assert.ok(typeof body.commitSha === "string");
    assert.ok(typeof body.environment === "string");
    assert.ok(typeof body.timestamp === "string");

    // Shallow health MUST NOT expose or connect to database to preserve free Neon compute hours
    assert.strictEqual(body.database, undefined);
    assert.strictEqual(body.latencyMs, undefined);
    assert.strictEqual(body.providers, undefined);
  });

  test("GET /api/health?deep=1 rejects unauthenticated callers with 401 Unauthorized", async () => {
    const req = new NextRequest("http://localhost:3000/api/health?deep=1");
    const res = await healthHandler(req);
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.status, "unauthorized");
    assert.match(body.error, /Unauthorized.*cron secret.*Owner/i);
  });

  test("GET /api/health?deep=1 allows authorized cron secret and returns database connectivity and providers", async () => {
    process.env.CRON_SECRET = process.env.CRON_SECRET || "test_cron_secret_123";
    const req = new NextRequest("http://localhost:3000/api/health?deep=1", {
      headers: {
        authorization: `Bearer ${process.env.CRON_SECRET}`,
      },
    });

    const res = await healthHandler(req);
    assert.ok(res.status === 200 || res.status === 503);
    const body = await res.json();

    assert.ok(body.status === "healthy" || body.status === "degraded");
    assert.ok(body.database === "connected" || body.database === "disconnected");
    assert.ok(typeof body.latencyMs === "number");
    assert.ok(typeof body.migrationCount === "number");
    assert.ok(body.providers);
    assert.ok(body.providers.payment);
    assert.ok(body.providers.chatbot);
    assert.strictEqual(typeof body.providers.email, "boolean");
  });

  test("GET /api/health?deep=1 allows platform Owner session", async () => {
    const ownerCookie = encodeURIComponent(
      JSON.stringify({
        role: "OWNER",
        email: "aapkaastro1606@gmail.com",
      })
    );

    const req = new NextRequest("http://localhost:3000/api/health?deep=1", {
      headers: {
        cookie: `aapka_astro_mock_user=${ownerCookie}`,
      },
    });

    const res = await healthHandler(req);
    assert.ok(res.status === 200 || res.status === 503);
    const body = await res.json();
    assert.ok(body.status === "healthy" || body.status === "degraded");
    assert.ok(body.database === "connected" || body.database === "disconnected");
  });

  test("GET /api/admin/diagnostics rejects unauthenticated callers with 403 Forbidden", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/diagnostics");
    const res = await diagnosticsHandler(req);
    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.match(body.message, /Forbidden.*Owner/i);
  });

  test("GET /api/admin/diagnostics allows platform Owner and returns complete diagnostic metrics", async () => {
    const ownerCookie = encodeURIComponent(
      JSON.stringify({
        role: "OWNER",
        email: "aapkaastro1606@gmail.com",
      })
    );

    const req = new NextRequest("http://localhost:3000/api/admin/diagnostics", {
      headers: {
        cookie: `aapka_astro_mock_user=${ownerCookie}`,
      },
    });

    const res = await diagnosticsHandler(req);
    assert.strictEqual(res.status, 200);
    const body = await res.json();

    assert.strictEqual(body.success, true);
    assert.ok(body.diagnostics);
    assert.ok(body.diagnostics.database);
    assert.ok(typeof body.diagnostics.database.reachable === "boolean");
    assert.ok(body.diagnostics.migrations);
    assert.ok(typeof body.diagnostics.migrations.appliedCount === "number");
    assert.ok(body.diagnostics.tables);
    assert.ok(body.diagnostics.clerk);
    assert.ok(["LIVE", "TEST", "MISSING"].includes(body.diagnostics.clerk.keyMode));
    assert.ok(Array.isArray(body.diagnostics.envChecklist));

    // Ensure secrets are never exposed in envChecklist
    for (const item of body.diagnostics.envChecklist) {
      assert.strictEqual(typeof item.isSet, "boolean");
      assert.strictEqual((item as any).value, undefined);
    }
  });
});
