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
                Admin Intelligence
              </div>
              <h1 className="font-temple text-2xl sm:text-3xl font-bold text-[#7B2D26]">
                Platform Traffic, Conversion &amp; Revenue Analytics
              </h1>
              <p className="text-xs sm:text-sm text-[#6E5545] mt-1">
                Live performance telemetry tracking seeker acquisition, consultation funnel velocity, and platform margins.
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

        {/* How-To Help Panel */}
        <AdminHelpPanel
          title="How to understand your website traffic and bookings"
          steps={[
            {
              title: "Seekers & Leads",
              description: "Tracks real visitors who save birth details for Kundli generation or complete intake forms.",
            },
            {
              title: "Consultation Conversion",
              description: "Tracks how many seekers complete payments and attend their scheduled readings with Acharya Ji.",
            },
          ]}
          tip="All telemetry is cookieless and privacy-first. Personal identity is never shared or tracked."
          defaultExpanded={false}
        />

        {/* High-level KPIs */}
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

        {/* Funnel & Breakdown */}
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
