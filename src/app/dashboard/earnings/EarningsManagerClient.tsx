"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AdminStore } from "@/lib/store/adminStore";
import {
  DollarSign,
  TrendingUp,
  ArrowLeft,
  Calendar,
  CreditCard,
  Lock,
} from "lucide-react";

interface EarningsManagerClientProps {
  canManage: boolean;
}

export default function EarningsManagerClient({ canManage }: EarningsManagerClientProps) {
  const analytics = AdminStore.getAnalytics();
  const [timeframe, setTimeframe] = useState<"day" | "week" | "month">("month");

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
            <span>Back to Operator Cockpit</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-temple text-2xl sm:text-3xl font-bold text-[#7B2D26]">
                  Consultation Revenue &amp; Earnings
                </span>
                {!canManage && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 text-[11px] font-bold">
                    <Lock className="h-3 w-3" />
                    View-Only Mode
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-[#6E5545]">
                Transparent revenue ledger broken down by time period, consultation modality, and direct client booking checkout.
              </p>
            </div>

            {canManage ? (
              <button
                type="button"
                onClick={() => alert("Payout request of ₹64,200 submitted to your linked HDFC Bank Account. Turnaround: 24-48 hours.")}
                className="inline-flex items-center gap-2 rounded-xl bg-[#6B8E5A] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#58754a] transition-all shadow-sm shrink-0"
              >
                <CreditCard className="h-4 w-4" />
                <span>Request Bank Payout</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 rounded-xl bg-[#E8D8C3]/50 px-4 py-2 text-xs font-bold text-[#6E5545] border border-[#E8D8C3] cursor-not-allowed">
                <Lock className="h-4 w-4 text-[#6E5545]" />
                <span>Payout Requests Require MANAGE Access</span>
              </div>
            )}
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E5545]">
              Today&apos;s Revenue
            </span>
            <div className="mt-1 font-mono text-2xl font-black text-[#7B2D26]">
              ₹14,200
            </div>
            <span className="text-[10px] text-[#6B8E5A] font-semibold mt-1 block">
              +18% vs yesterday
            </span>
          </div>

          <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E5545]">
              This Week
            </span>
            <div className="mt-1 font-mono text-2xl font-black text-[#7B2D26]">
              ₹48,900
            </div>
            <span className="text-[10px] text-[#6B8E5A] font-semibold mt-1 block">
              34 sessions completed
            </span>
          </div>

          <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E5545]">
              This Month (Sep 2026)
            </span>
            <div className="mt-1 font-mono text-2xl font-black text-[#7B2D26]">
              ₹{analytics.monthlyRevenue.toLocaleString("en-IN")}
            </div>
            <span className="text-[10px] text-[#C1662F] font-semibold mt-1 block">
              Available for Payout
            </span>
          </div>

          <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E5545]">
              Lifetime Revenue
            </span>
            <div className="mt-1 font-mono text-2xl font-black text-[#7B2D26]">
              ₹{analytics.totalRevenue.toLocaleString("en-IN")}
            </div>
            <span className="text-[10px] text-[#6E5545] mt-1 block">
              {analytics.totalConsultationMinutes.toLocaleString("en-IN")} consultation mins
            </span>
          </div>
        </div>

        {/* Breakdown by Modality */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Modality Split */}
          <div className="lg:col-span-6 rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm">
            <h3 className="font-temple text-lg font-bold text-[#7B2D26] mb-4">
              Revenue by Consultation Modality
            </h3>
            <div className="space-y-4">
              {analytics.consultationBreakdown.map((item, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-[#3B2A1E]">
                    <span>{item.type}</span>
                    <span>{item.percentage}% ({item.count} sessions)</span>
                  </div>
                  <div className="w-full bg-[#FBF3E7] rounded-full h-3 overflow-hidden border border-[#E8D8C3]">
                    <div
                      className={`h-full rounded-full ${
                        i === 0 ? "bg-[#7B2D26]" : i === 1 ? "bg-[#C1662F]" : "bg-[#E8A33D]"
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Daily Trends Table */}
          <div className="lg:col-span-6 rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm">
            <h3 className="font-temple text-lg font-bold text-[#7B2D26] mb-4">
              Recent 7-Day Performance
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#E8D8C3] text-[#6E5545]">
                    <th className="pb-2 font-bold">Day</th>
                    <th className="pb-2 font-bold">Consultation Minutes</th>
                    <th className="pb-2 font-bold text-right">Gross Earnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8D8C3]">
                  {analytics.dailyTrends.map((trend, idx) => (
                    <tr key={idx} className="hover:bg-[#FBF3E7]/50">
                      <td className="py-2.5 font-bold text-[#7B2D26]">{trend.day}</td>
                      <td className="py-2.5 text-[#3B2A1E]">{trend.minutes} mins</td>
                      <td className="py-2.5 font-mono font-bold text-right text-[#7B2D26]">
                        ₹{trend.revenue.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
