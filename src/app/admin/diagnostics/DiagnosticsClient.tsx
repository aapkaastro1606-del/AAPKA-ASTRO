"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Database,
  Server,
  Key,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Activity,
  Layers,
  Webhook,
  ArrowLeft,
} from "lucide-react";
import { DiagnosticsData } from "@/app/api/admin/diagnostics/route";

export default function DiagnosticsClient() {
  const [data, setData] = useState<DiagnosticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDiagnostics = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const res = await fetch("/api/admin/diagnostics");
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("Access forbidden. Owner privilege required.");
        }
        throw new Error(`Diagnostics probe failed with status ${res.status}`);
      }
      const json = await res.json();
      if (json.success && json.diagnostics) {
        setData(json.diagnostics);
      } else {
        throw new Error(json.message || "Failed to retrieve diagnostics.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load diagnostics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFDF9] py-8 px-4 sm:px-6 lg:px-8 font-body">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8D8C3] pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/admin/staff"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#7B2D26] hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Admin Console</span>
              </Link>
              <span className="text-[#C1662F]">&bull;</span>
              <span className="rounded-full bg-[#7B2D26] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#FFFDF9] font-temple">
                Owner Only
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#7B2D26] font-temple">
              System Diagnostics &amp; Live Environment Audit
            </h1>
            <p className="text-xs sm:text-sm text-[#6E5545] mt-1">
              Real-time audit of Neon PostgreSQL database connectivity, migration state, table row counts, and Clerk credentials.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDiagnostics}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl bg-[#7B2D26] hover:bg-[#64221C] px-4 py-2.5 text-xs font-bold text-[#FFFDF9] shadow-sm transition-all cursor-pointer disabled:opacity-75"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-[#E8A33D] ${refreshing ? "animate-spin" : ""}`} />
              <span>{refreshing ? "Probing..." : "Re-Probe System"}</span>
            </button>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="rounded-2xl border border-[#E8D8C3] bg-[#FAF5EE] p-12 text-center">
            <RefreshCw className="h-8 w-8 text-[#7B2D26] animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-[#3B2A1E]">Probing live database &amp; environment configuration...</p>
            <p className="text-xs text-[#7D6B5D] mt-1">Testing direct connection to Neon PostgreSQL and querying table schemas</p>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-6 flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-red-900">Diagnostics Probe Error</h3>
              <p className="text-xs text-red-700 mt-1">{error}</p>
              <button
                onClick={fetchDiagnostics}
                className="mt-3 text-xs font-bold text-red-800 underline cursor-pointer"
              >
                Retry Probe
              </button>
            </div>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* Top Stat Cards: DB, Migrations, Clerk Key Mode */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Database Reachability */}
              <div
                className={`rounded-2xl border p-5 transition-all shadow-xs ${
                  data.database.reachable
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-red-300 bg-red-50/60"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Database className={`h-5 w-5 ${data.database.reachable ? "text-emerald-700" : "text-red-700"}`} />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#3B2A1E]">
                      Database Reachable
                    </span>
                  </div>
                  {data.database.reachable ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                      <CheckCircle2 className="h-3 w-3" /> Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-800">
                      <XCircle className="h-3 w-3" /> Disconnected
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-[#3B2A1E]">
                  <div className="flex justify-between">
                    <span className="text-[#6E5545]">Database:</span>
                    <strong className="font-mono">{data.database.databaseName || "Unknown"}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6E5545]">Ping Latency:</span>
                    <strong className="font-mono">{data.database.latencyMs} ms</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6E5545]">Neon Host:</span>
                    <span className="font-mono text-[11px] truncate max-w-[180px]">
                      {data.database.host || "Direct"}
                    </span>
                  </div>
                </div>

                {data.database.error && (
                  <div className="mt-3 rounded-lg bg-red-100/80 p-2 text-[11px] text-red-800 font-mono">
                    {data.database.error}
                  </div>
                )}
              </div>

              {/* Card 2: Migrations Status */}
              <div
                className={`rounded-2xl border p-5 transition-all shadow-xs ${
                  data.migrations.tableExists && data.migrations.appliedCount > 0
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-amber-300 bg-amber-50/60"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-[#C1662F]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#3B2A1E]">
                      Applied Migrations
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      data.migrations.tableExists && data.migrations.appliedCount > 0
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-900 border border-amber-300"
                    }`}
                  >
                    {data.migrations.appliedCount} Applied
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-[#3B2A1E]">
                  <div className="flex justify-between">
                    <span className="text-[#6E5545]">_prisma_migrations Table:</span>
                    <strong className="font-bold">
                      {data.migrations.tableExists ? "Found" : "MISSING"}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6E5545]">Vercel Deploy Status:</span>
                    <span className="text-[11px] text-[#7B2D26] font-semibold">
                      next build only (no migrate deploy)
                    </span>
                  </div>
                </div>

                {data.migrations.error && (
                  <div className="mt-2.5 rounded-lg bg-amber-100/90 border border-amber-200 p-2 text-[11px] text-amber-900 leading-snug">
                    <span className="font-bold">Notice:</span> {data.migrations.error}
                  </div>
                )}
              </div>

              {/* Card 3: Clerk Credentials Mode */}
              <div
                className={`rounded-2xl border p-5 transition-all shadow-xs ${
                  data.clerk.keyMode === "LIVE"
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-amber-300 bg-amber-50/60"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-[#7B2D26]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#3B2A1E]">
                      Clerk Key Mode
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase ${
                      data.clerk.keyMode === "LIVE"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-amber-200 text-amber-900 border border-amber-400"
                    }`}
                  >
                    {data.clerk.keyMode} MODE
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-[#3B2A1E]">
                  <div className="flex justify-between">
                    <span className="text-[#6E5545]">Publishable Key:</span>
                    <code className="font-mono text-[11px] font-bold text-[#7B2D26]">
                      {data.clerk.publishableKeyPrefix}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6E5545]">Secret Key:</span>
                    <code className="font-mono text-[11px] font-bold text-[#7B2D26]">
                      {data.clerk.secretKeyPrefix}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6E5545]">Webhook Secret:</span>
                    <code className="font-mono text-[11px] font-bold text-[#7B2D26]">
                      {data.clerk.webhookSecretPrefix}
                    </code>
                  </div>
                </div>

                {data.clerk.keyMode === "TEST" && (
                  <div className="mt-2.5 rounded-lg bg-amber-100/90 border border-amber-200 p-2 text-[11px] text-amber-900 leading-snug">
                    <span className="font-bold">Action Needed:</span> Production live keys (<code>pk_live_...</code> / <code>sk_live_...</code>) must be configured in Vercel.
                  </div>
                )}
              </div>
            </div>

            {/* Last Webhook Received Banner */}
            <div className="rounded-2xl border border-[#E8D8C3] bg-[#FAF5EE] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#7B2D26] flex items-center justify-center text-[#E8A33D] shrink-0">
                  <Webhook className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#3B2A1E]">
                    Last Clerk Webhook Received
                  </h4>
                  <p className="text-xs text-[#6E5545] mt-0.5">
                    {data.lastWebhookReceived ? (
                      <>
                        Event: <strong className="font-mono text-[#7B2D26]">{data.lastWebhookReceived.eventType}</strong> &bull; Status:{" "}
                        <strong className="text-emerald-700">{data.lastWebhookReceived.status}</strong> &bull; Received:{" "}
                        {new Date(data.lastWebhookReceived.timestamp).toLocaleString("en-IN")}
                      </>
                    ) : (
                      "No incoming webhook events received in this server lifecycle. Webhook endpoint: /api/webhooks/clerk"
                    )}
                  </p>
                </div>
              </div>

              {!data.clerk.webhookSecretConfigured && (
                <span className="rounded-lg bg-red-100 border border-red-200 px-3 py-1.5 text-[11px] font-bold text-red-800 shrink-0">
                  CLERK_WEBHOOK_SECRET Unset
                </span>
              )}
            </div>

            {/* Key Database Tables Row Counts */}
            <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#E8D8C3] pb-4 mb-5">
                <div>
                  <h3 className="text-base font-bold text-[#7B2D26] font-temple">
                    Key Database Tables — Live Neon Row Counts
                  </h3>
                  <p className="text-xs text-[#6E5545] mt-0.5">
                    Rows actually present in PostgreSQL public schema. Data with 0 rows lives in browser memory or localStorage.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#7D6B5D] bg-[#FAF5EE] px-3 py-1 rounded-full border border-[#E8D8C3]">
                  {Object.keys(data.tables).length} Monitored Tables
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {Object.entries(data.tables).map(([table, count]) => {
                  const isCount = typeof count === "number";
                  const isZero = isCount && count === 0;
                  return (
                    <div
                      key={table}
                      className={`rounded-xl border p-3.5 transition-all ${
                        isZero
                          ? "border-amber-200 bg-amber-50/30"
                          : isCount && count > 0
                          ? "border-emerald-200 bg-emerald-50/20"
                          : "border-red-200 bg-red-50/30"
                      }`}
                    >
                      <div className="text-[11px] font-mono text-[#6E5545] font-semibold truncate mb-1">
                        {table}
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span
                          className={`font-temple text-xl font-black ${
                            isZero
                              ? "text-amber-800"
                              : isCount && count > 0
                              ? "text-[#7B2D26]"
                              : "text-red-700"
                          }`}
                        >
                          {isCount ? count.toLocaleString("en-IN") : "Error"}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isZero
                              ? "bg-amber-100 text-amber-800"
                              : isCount && count > 0
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {isZero ? "0 rows" : isCount ? "Active" : "Failed"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Required Environment Variables Checklist */}
            <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 shadow-xs">
              <div className="border-b border-[#E8D8C3] pb-4 mb-4">
                <h3 className="text-base font-bold text-[#7B2D26] font-temple">
                  Environment Variables Checklist
                </h3>
                <p className="text-xs text-[#6E5545] mt-0.5">
                  Verification of mandatory deployment variables. Secret values are masked for security.
                </p>
              </div>

              <div className="divide-y divide-[#E8D8C3]/60">
                {data.envChecklist.map((item) => (
                  <div key={item.key} className="py-3 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-xs font-bold text-[#3B2A1E]">{item.key}</code>
                        {item.required && (
                          <span className="text-[9px] uppercase font-bold text-red-700 bg-red-100 px-1.5 py-0.2 rounded">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#7D6B5D]">{item.description}</p>
                    </div>

                    <div className="shrink-0">
                      {item.isSet ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Configured
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-800 border border-red-200">
                          <XCircle className="h-3.5 w-3.5" /> Missing
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
