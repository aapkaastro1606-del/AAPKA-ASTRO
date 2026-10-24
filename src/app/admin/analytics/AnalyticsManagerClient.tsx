"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminHelpPanel } from "@/components/admin/AdminHelpPanel";
import {
  TrendingUp,
  ArrowLeft,
  Users,
  DollarSign,
  ArrowUpRight,
  RefreshCw,
  FileText,
  UserCheck,
  BarChart3,
  Globe2,
  ExternalLink,
  Search,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  MapPin,
  Eye,
  ShieldCheck,
} from "lucide-react";

export default function AnalyticsManagerClient() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/analytics");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.analytics) {
          setAnalytics(json.analytics);
        }
      }
    } catch (e) {
      console.error("Failed to load analytics:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const totalRevenue = analytics?.totalRevenue || 0;
  const confirmedCount = analytics?.confirmedBookingsCount || 0;
  const totalBookings = analytics?.totalBookings || 0;
  const activeClients = analytics?.activeClients || 0;
  const totalLeads = analytics?.totalLeads || 0;
  const totalKundlis = analytics?.totalKundlis || 0;
  const conversionRate = analytics?.conversionRate || 0;
  const breakdown = analytics?.consultationBreakdown || [];

  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const isGaConnected = Boolean(gaMeasurementId && gaMeasurementId.trim().length > 0);

  return (
    <div className="bg-[#FBF3E7] text-[#3B2A1E] min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Navigation & Header */}
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7B2D26] hover:underline mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Admin Home</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-md bg-[#7B2D26] px-2 py-0.5 text-[10px] font-bold text-white uppercase mb-1">
                Admin Intelligence &amp; Traffic
              </div>
              <h1 className="font-temple text-2xl sm:text-3xl font-bold text-[#7B2D26]">
                Platform Traffic, Conversion &amp; Revenue Analytics
              </h1>
              <p className="text-xs sm:text-sm text-[#6E5545] mt-1">
                Verified platform telemetry tracking real seeker acquisition, consultation funnel velocity, and Google Analytics.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchAnalytics}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] px-3.5 py-2 text-xs font-bold text-[#3B2A1E] hover:bg-[#FAF5EE] transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Telemetry</span>
            </button>
          </div>
        </div>

        {/* 1. TRAFFIC ANALYTICS THE CLIENT CAN READ PANEL */}
        <section className="rounded-3xl border-2 border-[#7B2D26]/20 bg-[#FFFDF9] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8D8C3] pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="h-5 w-5 text-[#7B2D26]" />
                <h2 className="font-temple text-xl font-bold text-[#7B2D26]">
                  External Traffic Analytics &amp; Google Search Console
                </h2>
              </div>
              <p className="text-xs text-[#6E5545]">
                Plain-language reports showing who visits your website, where they come from, and what they read.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isGaConnected ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Connected (GA4: {gaMeasurementId})</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                  <span>Not connected yet</span>
                </span>
              )}
            </div>
          </div>

          {/* Quick Direct Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <a
              href="https://analytics.google.com/analytics/web/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] hover:bg-[#F3E7D3] transition-colors flex items-center justify-between group"
            >
              <div>
                <span className="text-xs font-bold text-[#7B2D26] block">Google Analytics 4</span>
                <span className="text-[11px] text-[#6E5545]">Live visitor dashboard</span>
              </div>
              <ExternalLink className="h-4 w-4 text-[#7B2D26] group-hover:translate-x-0.5 transition-transform" />
            </a>

            <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] hover:bg-[#F3E7D3] transition-colors flex items-center justify-between group"
            >
              <div>
                <span className="text-xs font-bold text-[#7B2D26] block">Google Search Console</span>
                <span className="text-[11px] text-[#6E5545]">Google search keywords</span>
              </div>
              <ExternalLink className="h-4 w-4 text-[#7B2D26] group-hover:translate-x-0.5 transition-transform" />
            </a>

            <a
              href="https://analytics.google.com/analytics/web/#/report/acquisition-channels"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] hover:bg-[#F3E7D3] transition-colors flex items-center justify-between group"
            >
              <div>
                <span className="text-xs font-bold text-[#7B2D26] block">Acquisition Channels</span>
                <span className="text-[11px] text-[#6E5545]">WhatsApp, Instagram, Search</span>
              </div>
              <ExternalLink className="h-4 w-4 text-[#7B2D26] group-hover:translate-x-0.5 transition-transform" />
            </a>

            <a
              href="https://analytics.google.com/analytics/web/#/report/all-pages-and-screens"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] hover:bg-[#F3E7D3] transition-colors flex items-center justify-between group"
            >
              <div>
                <span className="text-xs font-bold text-[#7B2D26] block">Top Read Pages</span>
                <span className="text-[11px] text-[#6E5545]">Kundli, Vastu, Blogs</span>
              </div>
              <ExternalLink className="h-4 w-4 text-[#7B2D26] group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          {!isGaConnected && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="block font-bold">Google Analytics Environment Variable Missing:</strong>
                <p>
                  To display live visitor numbers, set <code>NEXT_PUBLIC_GA_MEASUREMENT_ID</code> (e.g. <code>G-XXXXXXXXXX</code>) in your Vercel project environment variables. We show no invented or mock traffic numbers.
                </p>
              </div>
            </div>
          )}

          {/* Three Plain-Language Questions Answered */}
          <div className="space-y-4 pt-2">
            <h3 className="font-temple text-base font-bold text-[#7B2D26] flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-[#C1662F]" />
              <span>Answers to the 3 Key Questions You Need:</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Question 1: How many people visited this week? */}
              <div className="p-4 rounded-2xl border border-[#E8D8C3] bg-[#FAF5EE] space-y-2 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="font-bold text-[#7B2D26] flex items-center gap-1.5 text-sm">
                    <Users className="h-4 w-4 text-[#C1662F]" />
                    <span>1. How many people visited this week?</span>
                  </div>
                  <p className="text-[#6E5545] leading-relaxed">
                    Open your <strong>Traffic Acquisition Report</strong>. In the top-right date selector, choose <strong>Last 7 Days</strong>. Look at the <strong>Users</strong> column to see unique people, and <strong>Sessions</strong> for total visits.
                  </p>
                </div>
                <a
                  href="https://analytics.google.com/analytics/web/#/report/acquisition-channels"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7B2D26] hover:underline pt-2"
                >
                  <span>See Weekly Visitors in GA4 &rarr;</span>
                </a>
              </div>

              {/* Question 2: From which countries and cities? */}
              <div className="p-4 rounded-2xl border border-[#E8D8C3] bg-[#FAF5EE] space-y-2 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="font-bold text-[#7B2D26] flex items-center gap-1.5 text-sm">
                    <MapPin className="h-4 w-4 text-[#C1662F]" />
                    <span>2. From which countries and cities?</span>
                  </div>
                  <p className="text-[#6E5545] leading-relaxed">
                    Open the <strong>Demographic Details Report</strong>. Switch the primary dropdown from <em>Country</em> to <em>City</em> to see visits from Delhi NCR, Mumbai, Bengaluru, or NRI diaspora in USA, UK, Canada, and UAE.
                  </p>
                </div>
                <a
                  href="https://analytics.google.com/analytics/web/#/report/user-demographics-overview"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7B2D26] hover:underline pt-2"
                >
                  <span>See Geographic Cities in GA4 &rarr;</span>
                </a>
              </div>

              {/* Question 3: Which pages did they read? */}
              <div className="p-4 rounded-2xl border border-[#E8D8C3] bg-[#FAF5EE] space-y-2 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="font-bold text-[#7B2D26] flex items-center gap-1.5 text-sm">
                    <Eye className="h-4 w-4 text-[#C1662F]" />
                    <span>3. Which pages did they read?</span>
                  </div>
                  <p className="text-[#6E5545] leading-relaxed">
                    Open the <strong>Pages and Screens Report</strong>. The table ranks your top pages by <strong>Views</strong> (e.g. Free Kundli Generator, Devta Vastu Consultation, Gemstones, or daily blogs).
                  </p>
                </div>
                <a
                  href="https://analytics.google.com/analytics/web/#/report/all-pages-and-screens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7B2D26] hover:underline pt-2"
                >
                  <span>See Popular Pages in GA4 &rarr;</span>
                </a>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F5F7F2] border border-[#6B8E5A]/40 text-[#2A4720] text-xs flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#6B8E5A] shrink-0" />
              <span>
                <strong>Privacy Guarantee:</strong> All analytics exclude staff members and administrative pages (<code>/admin</code>, <code>/dashboard</code>, <code>/account</code>). No personal names, phone numbers, or UTRs are ever tracked.
              </span>
            </div>
          </div>
        </section>

        {/* 2. REAL DATABASE KPIS (NO INVENTED NUMBERS) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E5545]">
              Active Seekers
            </span>
            <div className="mt-1 font-mono text-2xl font-black text-[#7B2D26]">
              {activeClients}
            </div>
            <span className="text-[10px] text-[#6B8E5A] font-semibold mt-1 flex items-center gap-0.5">
              <UserCheck className="h-3 w-3" />
              Registered Accounts
            </span>
          </div>

          <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E5545]">
              Consultation Conversion Rate
            </span>
            <div className="mt-1 font-mono text-2xl font-black text-[#7B2D26]">
              {conversionRate}%
            </div>
            <span className="text-[10px] text-[#6E5545] mt-1 block">
              Audience &rarr; Paid Session
            </span>
          </div>

          <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E5545]">
              Total Free Kundlis Generated
            </span>
            <div className="mt-1 font-mono text-2xl font-black text-[#7B2D26]">
              {totalKundlis}
            </div>
            <span className="text-[10px] text-[#C1662F] font-semibold mt-1 block">
              High-Intent Leads Captured
            </span>
          </div>

          <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E5545]">
              Total Consultations Booked
            </span>
            <div className="mt-1 font-mono text-2xl font-black text-[#7B2D26]">
              {totalBookings}
            </div>
            <span className="text-[10px] text-[#6B8E5A] font-semibold mt-1 block">
              {confirmedCount} Confirmed &amp; Paid
            </span>
          </div>
        </div>

        {/* 3. Funnel & Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Service Mix */}
          <div className="lg:col-span-6 rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm">
            <h3 className="font-temple text-lg font-bold text-[#7B2D26] mb-4">
              Real Service Distribution
            </h3>
            {breakdown.length === 0 || breakdown.every((b: any) => b.count === 0) ? (
              <p className="text-xs text-[#6E5545] py-6 text-center">
                No confirmed consultations yet. Live bookings will populate this breakdown in real-time.
              </p>
            ) : (
              <div className="space-y-4">
                {breakdown.map((item: any, i: number) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-[#3B2A1E]">
                      <span>{item.type}</span>
                      <span>
                        {item.percentage}% ({item.count} sessions)
                      </span>
                    </div>
                    <div className="w-full bg-[#FBF3E7] rounded-full h-3 overflow-hidden border border-[#E8D8C3]">
                      <div
                        className={`h-full rounded-full ${
                          i === 0 ? "bg-[#7B2D26]" : i === 1 ? "bg-[#E8A33D]" : "bg-[#6B8E5A]"
                        }`}
                        style={{ width: `${Math.max(item.percentage, 5)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Conversion Funnel */}
          <div className="lg:col-span-6 rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm">
            <h3 className="font-temple text-lg font-bold text-[#7B2D26] mb-4">
              Real Seeker Funnel (PostgreSQL)
            </h3>
            <div className="space-y-4 text-xs">
              <div className="rounded-2xl border border-[#E8D8C3] bg-[#FBF3E7] p-4 flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#7B2D26] block">Step 1: Free Kundli Leads</span>
                  <span className="text-[#6E5545]">Lead forms captured with explicit DPDP consent</span>
                </div>
                <span className="font-mono text-base font-black text-[#7B2D26]">{totalLeads}</span>
              </div>

              <div className="rounded-2xl border border-[#E8D8C3] bg-[#FBF3E7] p-4 flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#7B2D26] block">Step 2: Saved Kundli Records</span>
                  <span className="text-[#6E5545]">Astrological chart calculations generated</span>
                </div>
                <span className="font-mono text-base font-black text-[#7B2D26]">{totalKundlis}</span>
              </div>

              <div className="rounded-2xl border border-[#E8D8C3] bg-[#FBF3E7] p-4 flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#7B2D26] block">Step 3: Registered Seeker Accounts</span>
                  <span className="text-[#6E5545]">Clerk SSO verified profiles in database</span>
                </div>
                <span className="font-mono text-base font-black text-[#7B2D26]">{activeClients}</span>
              </div>

              <div className="rounded-2xl border border-[#6B8E5A]/40 bg-[#F4F9F2] p-4 flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#2A4720] block">Step 4: Confirmed &amp; Paid Consultations</span>
                  <span className="text-[#4F6D40]">Verified bank credit &amp; scheduled session</span>
                </div>
                <span className="font-mono text-base font-black text-[#2A4720]">{confirmedCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
