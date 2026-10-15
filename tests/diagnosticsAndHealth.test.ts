import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { GET as healthHandler } from "@/app/api/health/route";
import { GET as diagnosticsHandler } from "@/app/api/admin/diagnostics/route";
import { NextRequest } from "next/server";

describe("System Health & Diagnostics Audit Suite", () => {
  test("GET /api/health returns database connectivity status without sensitive leaks", async () => {
    const res = await healthHandler();
    assert.ok(res.status === 200 || res.status === 503);
    const body = await res.json();

    assert.ok(body.status === "healthy" || body.status === "unhealthy");
    assert.ok(body.database === "connected" || body.database === "disconnected");
    assert.ok(typeof body.latencyMs === "number");
    assert.ok(typeof body.timestamp === "string");

    // Zero secret leakage in public health
    assert.strictEqual((body as any).env, undefined);
    assert.strictEqual((body as any).keys, undefined);
    assert.strictEqual((body as any).databaseUrl, undefined);
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
        email: "anmol@aapkaastro.com",
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
