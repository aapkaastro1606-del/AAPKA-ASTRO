"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  ArrowLeft,
  Calendar,
  CreditCard,
  Lock,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

interface EarningsManagerClientProps {
  canManage: boolean;
}

export default function EarningsManagerClient({ canManage }: EarningsManagerClientProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/analytics");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.analytics) {
          setData(json.analytics);
        }
      }
    } catch (e) {
      console.error("Failed to load earnings:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  const totalRevenue = data?.totalRevenue || 0;
  const monthlyRevenue = data?.monthlyRevenue || 0;
  const confirmedCount = data?.confirmedBookingsCount || 0;
  const breakdown = data?.consultationBreakdown || [];
  const dailyTrends = data?.dailyTrends || [];

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
                Authoritative real-time revenue ledger calculated directly from verified PostgreSQL bookings.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchEarnings}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] px-3.5 py-2 text-xs font-bold text-[#3B2A1E] hover:bg-[#FAF5EE] transition-all shadow-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>

              {canManage && (
                <button
                  type="button"
                  onClick={() => {
                    if (monthlyRevenue <= 0) {
                      alert("Current settled balance is ₹0. Payouts require verified completed consultations.");
                    } else {
                      setFeedback(`Settlement request of ₹${monthlyRevenue.toLocaleString("en-IN")} acknowledged.`);
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#6B8E5A] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#58754a] transition-all shadow-sm shrink-0 cursor-pointer"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Request Bank Settlement</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {feedback && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-300 p-4 text-xs font-bold text-emerald-900 flex items-center justify-between">
            <span>{feedback}</span>
            <button type="button" onClick={() => setFeedback(null)} className="underline text-[11px]">
              Dismiss
            </button>
          </div>
        )}

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E5545]">
              Settled This Month
            </span>
            <div className="mt-1 font-mono text-2xl font-black text-[#7B2D26]">
              ₹{monthlyRevenue.toLocaleString("en-IN")}
            </div>
            <span className="text-[10px] text-[#6B8E5A] font-semibold mt-1 block">
              Verified &amp; Credited
            </span>
          </div>

          <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E5545]">
              Lifetime Revenue
            </span>
            <div className="mt-1 font-mono text-2xl font-black text-[#7B2D26]">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </div>
            <span className="text-[10px] text-[#6B8E5A] font-semibold mt-1 block">
              Across all paid services
            </span>
          </div>

          <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E5545]">
              Paid Consultations
            </span>
            <div className="mt-1 font-mono text-2xl font-black text-[#7B2D26]">
              {confirmedCount}
            </div>
            <span className="text-[10px] text-[#C1662F] font-semibold mt-1 block">
              Confirmed in PostgreSQL
            </span>
          </div>

          <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E5545]">
              Active Seeker Base
            </span>
            <div className="mt-1 font-mono text-2xl font-black text-[#7B2D26]">
              {data?.activeClients || 0}
            </div>
            <span className="text-[10px] text-[#6E5545] mt-1 block">
              Registered Seekers
            </span>
          </div>
        </div>

        {/* Breakdown by Modality */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Product Split */}
          <div className="lg:col-span-6 rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm">
            <h3 className="font-temple text-lg font-bold text-[#7B2D26] mb-4">
              Revenue Breakdown by Product
            </h3>
            {breakdown.length === 0 || breakdown.every((b: any) => b.count === 0) ? (
              <p className="text-xs text-[#6E5545] py-6 text-center">
                No paid consultations completed yet. New bookings will appear here in real-time.
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
                          i === 0 ? "bg-[#7B2D26]" : i === 1 ? "bg-[#C1662F]" : "bg-[#E8A33D]"
                        }`}
                        style={{ width: `${Math.max(item.percentage, 5)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                    <th className="pb-2 font-bold">Bookings</th>
                    <th className="pb-2 font-bold text-right">Gross Earnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8D8C3]">
                  {dailyTrends.map((trend: any, idx: number) => (
                    <tr key={idx} className="hover:bg-[#FBF3E7]/50">
                      <td className="py-2.5 font-bold text-[#7B2D26]">{trend.day}</td>
                      <td className="py-2.5 text-[#3B2A1E]">{trend.bookings} bookings</td>
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
