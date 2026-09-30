"use client";

import React from "react";
import Link from "next/link";
import { AdminStore } from "@/lib/store/adminStore";
import {
  TrendingUp,
  ArrowLeft,
  Users,
  Clock,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";

export default function AnalyticsManagerClient() {
  const analytics = AdminStore.getAnalytics();

  return (
    <div className="bg-[#FBF3E7] text-[#3B2A1E] min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Navigation & Header */}
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7B2D26] hover:underline mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center justify-between">
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
          </div>
        </div>

        {/* High-level KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E5545]">
              Active Seekers Today
            </span>
            <div className="mt-1 font-mono text-2xl font-black text-[#7B2D26]">
              {analytics.activeUsersToday}
            </div>
            <span className="text-[10px] text-[#6B8E5A] font-semibold mt-1 flex items-center gap-0.5">
              <ArrowUpRight className="h-3 w-3" />
              +14% vs last Monday
            </span>
          </div>

          <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E5545]">
              Consultation Conversion Rate
            </span>
            <div className="mt-1 font-mono text-2xl font-black text-[#7B2D26]">
              {analytics.conversionRate}%
            </div>
            <span className="text-[10px] text-[#6E5545] mt-1 block">
              Visitors &rarr; Paid Session
            </span>
          </div>

          <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E5545]">
              Total Consultation Minutes
            </span>
            <div className="mt-1 font-mono text-2xl font-black text-[#7B2D26]">
              {analytics.totalConsultationMinutes.toLocaleString("en-IN")}
            </div>
            <span className="text-[10px] text-[#C1662F] font-semibold mt-1 block">
              Across Chat, Audio &amp; Video
            </span>
          </div>

          <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E5545]">
              Total Consultations Booked
            </span>
            <div className="mt-1 font-mono text-2xl font-black text-[#7B2D26]">
              {analytics.totalRecharges.toLocaleString("en-IN")}
            </div>
            <span className="text-[10px] text-[#6B8E5A] font-semibold mt-1 block">
              Via Razorpay Orders API
            </span>
          </div>
        </div>

        {/* Funnel & Traffic Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Traffic Channels */}
          <div className="lg:col-span-6 rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm">
            <h3 className="font-temple text-lg font-bold text-[#7B2D26] mb-4">
              Acquisition Traffic Channels
            </h3>
            <div className="space-y-4">
              {analytics.trafficSources.map((src, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-[#3B2A1E]">
                    <span>{src.source}</span>
                    <span>{src.percentage}%</span>
                  </div>
                  <div className="w-full bg-[#FBF3E7] rounded-full h-3 overflow-hidden border border-[#E8D8C3]">
                    <div
                      className={`h-full rounded-full ${
                        i === 0 ? "bg-[#7B2D26]" : i === 1 ? "bg-[#E8A33D]" : i === 2 ? "bg-[#C1662F]" : "bg-[#6B8E5A]"
                      }`}
                      style={{ width: `${src.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="lg:col-span-6 rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm">
            <h3 className="font-temple text-lg font-bold text-[#7B2D26] mb-4">
              Seeker Conversion Funnel (30 Days)
            </h3>
            <div className="space-y-4 text-xs">
              <div className="rounded-2xl border border-[#E8D8C3] bg-[#FBF3E7] p-4 flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#7B2D26] block">Step 1: Unique Visitors</span>
                  <span className="text-[#6E5545]">Homepage, Blog &amp; Panchang</span>
                </div>
                <span className="font-mono text-base font-black text-[#7B2D26]">24,800</span>
              </div>

              <div className="rounded-2xl border border-[#E8D8C3] bg-[#FBF3E7] p-4 flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#7B2D26] block">Step 2: Free Kundli Calculated</span>
                  <span className="text-[#6E5545]">High-intent birth coordinates entered</span>
                </div>
                <span className="font-mono text-base font-black text-[#7B2D26]">8,950 (36%)</span>
              </div>

              <div className="rounded-2xl border border-[#E8D8C3] bg-[#FBF3E7] p-4 flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#7B2D26] block">Step 3: Account Signups (Clerk SSO)</span>
                  <span className="text-[#6E5545]">Google OAuth &amp; Email verification completed</span>
                </div>
                <span className="font-mono text-base font-black text-[#7B2D26]">4,560 (18.4%)</span>
              </div>

              <div className="rounded-2xl border border-[#6B8E5A]/40 bg-[#F4F9F2] p-4 flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#2A4720] block">Step 4: Paid Consultation Session</span>
                  <span className="text-[#4F6D40]">One-time booking checkout &amp; 1-on-1 session</span>
                </div>
                <span className="font-mono text-base font-black text-[#2A4720]">1,290 (28.3%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
