"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminHelpPanel } from "@/components/admin/AdminHelpPanel";
import { DataStateView, parseFetchError, DataStateError } from "@/components/admin/DataStateView";
import { useUser, useSession } from "@clerk/nextjs";
import {
  Database,
  Key,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Server,
  Webhook,
  ArrowLeft,
  Users,
  Globe,
  Cookie,
  Bot,
  Sparkles,
} from "lucide-react";
import { DiagnosticsData } from "@/app/api/admin/diagnostics/route";

const OWNER_EMAIL = "aapkaastro1606@gmail.com";

export default function DiagnosticsClient() {
  const { user, isLoaded: isUserLoaded, isSignedIn } = useUser();
  const { session } = useSession();

  const [data, setData] = useState<DiagnosticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<DataStateError | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const userEmail =
    user?.primaryEmailAddress?.emailAddress?.toLowerCase() ||
    user?.emailAddresses?.[0]?.emailAddress?.toLowerCase() ||
    null;

  const isOwner = userEmail === OWNER_EMAIL.toLowerCase();

  const fetchDiagnostics = async () => {
    try {
      setRefreshing(true);
      setError(null);
      setFetchError(null);

      const res = await fetch("/api/admin/diagnostics");
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const err = parseFetchError(res, errData);
        setFetchError(err);
        setError(err.message || "Failed to load diagnostics.");
        return;
      }

      const json = await res.json();
      if (json.success && json.diagnostics) {
        setData(json.diagnostics);
        setFetchError(null);
      } else {
        const err = parseFetchError(res, json);
        setFetchError(err);
        setError(err.message || "Failed to retrieve diagnostics.");
      }
    } catch (err: any) {
      setFetchError({ status: 500, message: "Could not load. Retry." });
      setError("Could not load. Retry.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isUserLoaded) {
      fetchDiagnostics();
    }
  }, [isUserLoaded, session]);

  if (!isUserLoaded) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] py-16 px-4 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-[#7B2D26] animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-[#3B2A1E]">Loading authentication status...</p>
        </div>
      </div>
    );
  }

  // If user is loaded and signed in, but is NOT the platform Owner
  if (isSignedIn && !isOwner) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl border border-red-200 p-8 text-center shadow-sm">
          <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-900 font-temple">Access Forbidden</h2>
          <p className="text-xs text-[#6E5545] mt-2">
            You are signed in as <strong className="font-mono text-red-700">{userEmail}</strong>.
            This diagnostic console is strictly restricted to the platform Owner (<code className="font-mono">{OWNER_EMAIL}</code>).
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl bg-[#7B2D26] px-4 py-2 text-xs font-bold text-white hover:bg-[#64221C]"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If user is not signed in at all
  if (!isSignedIn && !data) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#E8D8C3] p-8 text-center shadow-sm">
          <ShieldCheck className="h-12 w-12 text-[#7B2D26] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#7B2D26] font-temple">Owner Sign-In Required</h2>
          <p className="text-xs text-[#6E5545] mt-2">
            Please sign in as <strong className="font-mono text-[#7B2D26]">{OWNER_EMAIL}</strong> to probe live system diagnostics.
          </p>
          <div className="mt-6">
            <Link
              href="/login?redirect_url=/admin/diagnostics"
              className="inline-block rounded-xl bg-[#7B2D26] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#64221C]"
            >
              Sign In to Continue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] py-8 px-4 sm:px-6 lg:px-8 font-body">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8D8C3] pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#7B2D26] hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Admin Home</span>
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
              Runtime probe of Clerk publishable key mode, server-side auth recognition, host, cookies, and database state.
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

        {/* How-To Help Panel for Non-Technical Owner */}
        <AdminHelpPanel
          title="How to read system diagnostics & health checks"
          steps={[
            {
              title: "What does this page do?",
              description: "This probes live database connection, Clerk authentication, Resend email status, AI latency, and background cron health.",
            },
            {
              title: "Green checkmarks",
              description: "All green indicators mean your live system is running normally with zero failures.",
            },
            {
              title: "Owner Only Protection",
              description: "This screen is strictly restricted to aapkaastro1606@gmail.com and cannot be viewed by staff or visitors.",
            },
          ]}
          tip="Click 'Re-Probe System' at any time to run a live diagnostic audit against all backend providers."
          defaultExpanded={false}
        />

        {/* Loading / Error States */}
        {loading && (
          <div className="rounded-2xl border border-[#E8D8C3] bg-[#FAF5EE] p-12 text-center">
            <RefreshCw className="h-8 w-8 text-[#7B2D26] animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-[#3B2A1E]">Probing live server authentication &amp; database...</p>
            <p className="text-xs text-[#7D6B5D] mt-1">Testing direct connection to Neon PostgreSQL and evaluating Clerk runtime headers</p>
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

        <DataStateView
          loading={loading}
          error={fetchError}
          isEmpty={!data}
          onRetry={fetchDiagnostics}
          loadingMessage="Probing live system diagnostics..."
          emptyView={null}
        >
        {data && (
          <div className="space-y-6">
            {/* Critical Status Alert if Clerk is in Test mode on a non-localhost host */}
            {data.clerk.keyMode === "TEST" && data.serverAuth.hostType !== "localhost" && (
              <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-5 flex items-start gap-4 shadow-sm">
                <AlertTriangle className="h-6 w-6 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-sm font-black uppercase tracking-wider text-amber-900">
                    Clerk production not configured
                  </h3>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    The live domain (<strong className="font-mono">{data.serverAuth.host}</strong>) is executing with a Clerk <strong>TEST/DEVELOPMENT</strong> publishable key (<code className="font-mono">{data.clerk.publishableKeyPrefix}</code>).
                    Development keys issue cross-site session cookies from <code className="font-mono">accounts.dev</code>, which modern browsers block on live domains, causing server-side <code className="font-mono">auth()</code> to return null while client-side says signed in.
                  </p>
                  <p className="text-xs font-bold text-amber-900 mt-2">
                    Action required: Switch Clerk to Production mode in the Clerk Dashboard, obtain <code className="font-mono">pk_live_...</code> and <code className="font-mono">sk_live_...</code>, configure CNAME DNS records for <code className="font-mono">clerk.aapkaastro.com</code>, and update Vercel environment variables.
                  </p>
                </div>
              </div>
            )}

            {/* Top Cards: Clerk Key Mode, Server Auth Recognition, Database Reachability, UPI & Storage Safety, AI Assistant Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {/* Card 1: Clerk Publishable Key Mode */}
              <div
                className={`rounded-2xl border p-5 shadow-xs ${
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
                    {data.clerk.keyMode}
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
                    <span className="text-[#6E5545]">CLERK_SECRET_KEY:</span>
                    <strong className={data.clerk.secretKeyConfigured ? "text-emerald-700" : "text-red-700"}>
                      {data.clerk.secretKeyConfigured ? "Present (true)" : "Missing (false)"}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6E5545]">CLERK_WEBHOOK_SECRET:</span>
                    <strong className={data.clerk.webhookSecretConfigured ? "text-emerald-700" : "text-red-700"}>
                      {data.clerk.webhookSecretConfigured ? "Present (true)" : "Missing (false)"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Card 2: Server auth() Session Recognition */}
              <div
                className={`rounded-2xl border p-5 shadow-xs ${
                  data.serverAuth.recognized
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-red-200 bg-red-50/50"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-[#7B2D26]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#3B2A1E]">
                      Server auth() Session
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      data.serverAuth.recognized
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {data.serverAuth.recognized ? "Recognized" : "Not Recognized"}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-[#3B2A1E]">
                  <div className="flex justify-between">
                    <span className="text-[#6E5545]">Server userId:</span>
                    <code className="font-mono text-[11px] font-bold">
                      {data.serverAuth.userId || "null"}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6E5545]">Host:</span>
                    <span className="font-mono text-[11px] font-bold truncate max-w-[150px]">
                      {data.serverAuth.host} ({data.serverAuth.hostType})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6E5545]">User DB Row:</span>
                    <strong className={data.database.currentUserHasDbRow ? "text-emerald-700" : "text-amber-700"}>
                      {data.database.currentUserHasDbRow ? "Found (true)" : "None (false)"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Card 3: Database Connectivity */}
              <div
                className={`rounded-2xl border p-5 shadow-xs ${
                  data.database.reachable
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-red-300 bg-red-50/60"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Database className={`h-5 w-5 ${data.database.reachable ? "text-emerald-700" : "text-red-700"}`} />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#3B2A1E]">
                      Neon PostgreSQL
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      data.database.reachable ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {data.database.reachable ? "Connected" : "Disconnected"}
                  </span>
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
                    <span className="text-[#6E5545]">Total Users:</span>
                    <strong className="font-mono text-[#7B2D26]">{data.database.totalUserCount}</strong>
                  </div>
                </div>
              </div>

              {/* Card 4: UPI Routing & Storage Safety */}
              <div
                className={`rounded-2xl border p-5 shadow-xs ${
                  data.payment?.upiConfigured
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-amber-300 bg-amber-50/60"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-[#7B2D26]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#3B2A1E]">
                      UPI &amp; Storage Safety
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      data.payment?.upiConfigured ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {data.payment?.upiConfigured ? "Active" : "Unset"}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-[#3B2A1E]">
                  <div className="flex justify-between">
                    <span className="text-[#6E5545]">Payee:</span>
                    <strong className="truncate max-w-[140px]">{data.payment?.payeeName || "Aapka Astro"}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6E5545]">Masked UPI:</span>
                    <code className="font-mono text-[11px] font-bold text-[#7B2D26]">
                      {data.payment?.maskedUpiId || "None"}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6E5545]">Expiry:</span>
                    <span>{data.payment?.unpaidExpiryDays ?? 3} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6E5545]">Storage:</span>
                    <span className="font-mono text-[11px] uppercase font-bold text-[#6E5545]">
                      {data.payment?.storageProvider || "mock"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 5: AI Chatbot Provider & Circuit Breaker Status */}
              <div
                className={`rounded-2xl border p-5 shadow-xs ${
                  data.chatbot?.status === "HEALTHY"
                    ? "border-emerald-200 bg-emerald-50/50"
                    : data.chatbot?.status === "DEGRADED"
                    ? "border-amber-300 bg-amber-50/60"
                    : data.chatbot?.status === "ERROR"
                    ? "border-red-300 bg-red-50/60"
                    : "border-gray-200 bg-gray-50/50"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-[#7B2D26]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#3B2A1E]">
                      AI Assistant
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      data.chatbot?.status === "HEALTHY"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : data.chatbot?.status === "DEGRADED"
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : data.chatbot?.status === "ERROR"
                        ? "bg-red-100 text-red-800 border border-red-300"
                        : "bg-gray-100 text-gray-800 border border-gray-300"
                    }`}
                  >
                    {data.chatbot?.status || "UNKNOWN"}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-[#3B2A1E]">
                  <div className="flex justify-between">
                    <span className="text-[#6E5545]">Provider:</span>
                    <strong className="font-mono text-[11px] uppercase">{data.chatbot?.provider || "mock"}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6E5545]">Model:</span>
                    <code className="font-mono text-[10px] font-bold text-[#7B2D26] truncate max-w-[120px]">
                      {data.chatbot?.model || "Unset"}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6E5545]">Failures:</span>
                    <span className={data.chatbot?.consecutiveFailures ? "text-amber-700 font-bold" : "text-emerald-700 font-bold"}>
                      {data.chatbot?.consecutiveFailures ?? 0} consecutive
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6E5545]">Circuit Breaker:</span>
                    <span className={data.chatbot?.circuitBreakerTripped ? "text-red-700 font-bold" : "text-emerald-700"}>
                      {data.chatbot?.circuitBreakerTripped ? "TRIPPED (Hidden)" : "Armed (Active)"}
                    </span>
                  </div>
                  {data.chatbot?.lastError && (
                    <div className="pt-1 border-t border-amber-200/60 text-[10px] text-red-700 truncate" title={data.chatbot.lastError.message}>
                      ⚠️ {data.chatbot.lastError.type}: {data.chatbot.lastError.message.slice(0, 45)}...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cookies Received Audit */}
            <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <Cookie className="h-5 w-5 text-[#C1662F]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#3B2A1E]">
                  Server Request Cookies Received ({data.serverAuth.cookieNames.length})
                </h4>
              </div>
              <p className="text-xs text-[#6E5545] mb-3">
                Cookie names received by Next.js server components and route handlers (values are omitted for security):
              </p>
              {data.serverAuth.cookieNames.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {data.serverAuth.cookieNames.map((c) => (
                    <span
                      key={c}
                      className="font-mono text-xs bg-[#FAF5EE] border border-[#E8D8C3] px-2.5 py-1 rounded-md text-[#3B2A1E]"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 font-mono">
                  No cookies received on request. Cross-site cookies may be partitioned or blocked by the browser.
                </div>
              )}
            </div>

            {/* Satellite Configuration Audit */}
            <div
              className={`rounded-2xl border p-5 shadow-xs ${
                data.satelliteConfig.anySatelliteVariableSet
                  ? "border-amber-300 bg-amber-50/50"
                  : "border-emerald-200 bg-emerald-50/30"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-[#7B2D26]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#3B2A1E]">
                    Satellite Domain Configuration Audit
                  </h4>
                </div>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    data.satelliteConfig.anySatelliteVariableSet
                      ? "bg-amber-200 text-amber-900 border border-amber-300"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {data.satelliteConfig.anySatelliteVariableSet ? "Satellite Variables Active" : "Clean (No Satellite)"}
                </span>
              </div>
              <p className="text-xs text-[#6E5545] mb-3">
                Aapka Astro uses its own dedicated Clerk application. Satellite mode is unsupported on Clerk free plan and causes domain redirect conflicts.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white/80 p-3 rounded-xl border border-[#E8D8C3]">
                  <span className="text-[#6E5545] block">NEXT_PUBLIC_CLERK_IS_SATELLITE:</span>
                  <code className="font-mono font-bold text-[#3B2A1E]">
                    {data.satelliteConfig.isSatelliteSet ? String(data.satelliteConfig.satelliteValue) : "Unset (false)"}
                  </code>
                </div>
                <div className="bg-white/80 p-3 rounded-xl border border-[#E8D8C3]">
                  <span className="text-[#6E5545] block">NEXT_PUBLIC_CLERK_DOMAIN:</span>
                  <code className="font-mono font-bold text-[#3B2A1E]">
                    {data.satelliteConfig.isDomainSet ? String(data.satelliteConfig.domainValue) : "Unset (false)"}
                  </code>
                </div>
              </div>
            </div>

            {/* Last 5 Sign-ups & Last Webhook */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Last 5 Sign-ups Table */}
              <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#E8D8C3] pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#7B2D26]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#3B2A1E]">
                      Last 5 Sign-ups in Neon Database
                    </h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#7B2D26]">
                    Total: {data.database.totalUserCount}
                  </span>
                </div>

                <div className="divide-y divide-[#E8D8C3]/50">
                  {data.database.lastFiveSignups.length > 0 ? (
                    data.database.lastFiveSignups.map((u) => (
                      <div key={u.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-mono font-bold text-[#3B2A1E]">{u.emailMasked}</div>
                          <div className="text-[10px] text-[#7D6B5D]">
                            {new Date(u.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-block rounded px-2 py-0.5 text-[10px] font-bold bg-[#FAF5EE] text-[#7B2D26] border border-[#E8D8C3]">
                            {u.role}
                          </span>
                          <div className="text-[10px] text-[#7D6B5D] mt-0.5">
                            {u.hasClerkId ? "Clerk ID linked" : "No Clerk ID"}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-[#7D6B5D] py-4 text-center">No sign-ups found in database.</div>
                  )}
                </div>
              </div>

              {/* Last Clerk Webhook Received */}
              <div className="rounded-2xl border border-[#E8D8C3] bg-[#FAF5EE] p-5 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center gap-2 border-b border-[#E8D8C3] pb-3 mb-3">
                    <Webhook className="h-4 w-4 text-[#7B2D26]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#3B2A1E]">
                      Last Clerk Webhook Received
                    </h4>
                  </div>

                  {data.lastWebhookReceived ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#6E5545]">Event Type:</span>
                        <code className="font-mono font-bold text-[#7B2D26]">{data.lastWebhookReceived.eventType}</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6E5545]">Status:</span>
                        <strong className="text-emerald-700">{data.lastWebhookReceived.status}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6E5545]">Received At:</span>
                        <span className="font-mono text-[#3B2A1E]">
                          {new Date(data.lastWebhookReceived.timestamp).toLocaleString("en-IN")}
                        </span>
                      </div>
                      {data.lastWebhookReceived.error && (
                        <div className="mt-2 p-2 bg-red-100 rounded text-red-800 font-mono text-[11px]">
                          {data.lastWebhookReceived.error}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-[#7D6B5D] py-6 text-center">
                      No webhooks received. Endpoint: <code className="font-mono">/api/webhooks/clerk</code>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#E8D8C3]/60 text-[11px] text-[#6E5545]">
                  Webhook Secret:{" "}
                  <strong className={data.clerk.webhookSecretConfigured ? "text-emerald-700" : "text-red-700"}>
                    {data.clerk.webhookSecretConfigured ? "Configured in Environment" : "Missing"}
                  </strong>
                </div>
              </div>
            </div>

            {/* Required Environment Variables Checklist */}
            <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 shadow-xs">
              <div className="border-b border-[#E8D8C3] pb-3 mb-4">
                <h3 className="text-base font-bold text-[#7B2D26] font-temple">
                  Environment Variables Checklist (Boolean Presence Only)
                </h3>
                <p className="text-xs text-[#6E5545] mt-0.5">
                  Verification of runtime configuration. Secrets are strictly omitted.
                </p>
              </div>

              <div className="divide-y divide-[#E8D8C3]/60">
                {data.envChecklist.map((item) => (
                  <div key={item.key} className="py-2.5 flex items-center justify-between gap-4">
                    <div>
                      <code className="font-mono text-xs font-bold text-[#3B2A1E]">{item.key}</code>
                      <p className="text-[11px] text-[#7D6B5D]">{item.description}</p>
                    </div>

                    <div className="shrink-0">
                      {item.isSet ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                          <CheckCircle2 className="h-3.5 w-3.5" /> true
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800 border border-red-200">
                          <XCircle className="h-3.5 w-3.5" /> false
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        </DataStateView>
      </div>
    </div>
  );
}
