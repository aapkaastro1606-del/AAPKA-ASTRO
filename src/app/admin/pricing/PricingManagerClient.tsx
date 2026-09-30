"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AdminStore, PricingSettings } from "@/lib/store/adminStore";
import {
  DollarSign,
  ArrowLeft,
  Save,
  CheckCircle2,
  Percent,
  Sliders,
  PhoneCall,
  Video,
  MessageSquare,
  Lock,
  AlertCircle,
} from "lucide-react";

interface PricingManagerClientProps {
  canManage: boolean;
}

export default function PricingManagerClient({ canManage }: PricingManagerClientProps) {
  const [pricing, setPricing] = useState<PricingSettings>(() => AdminStore.getPricing());
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) {
      alert("Permission Denied: MANAGE access required to modify platform pricing.");
      return;
    }

    try {
      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pricing),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message || "Failed to save pricing.");
        return;
      }
      AdminStore.updatePricing(pricing);
      setSaved(true);
      setErrorMsg(null);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      AdminStore.updatePricing(pricing);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="bg-[#FBF3E7] text-[#3B2A1E] min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
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
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-[#7B2D26] px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                  Admin Settings
                </span>
                {!canManage && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 text-[10px] font-bold">
                    <Lock className="h-3 w-3" />
                    View-Only Mode
                  </span>
                )}
              </div>
              <h1 className="font-temple text-2xl sm:text-3xl font-bold text-[#7B2D26]">
                Consultation Pricing &amp; Discount Rules
              </h1>
              <p className="text-xs sm:text-sm text-[#6E5545] mt-1">
                Update live per-minute consultation rates, intro discounts, and minimum recharge limits in real-time.
              </p>
            </div>
          </div>
        </div>

        {/* View-Only Alert Banner */}
        {!canManage && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-4 text-xs text-amber-900 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Staff Read-Only View Active</p>
              <p className="mt-0.5 text-amber-800">
                You have active <strong>VIEW</strong> permissions for platform pricing. Modifying rates, discounts, or wallet recharge limits requires <strong>MANAGE</strong> access granted by the Platform Owner.
              </p>
            </div>
          </div>
        )}

        {saved && (
          <div className="rounded-2xl border border-[#6B8E5A]/40 bg-[#F4F9F2] p-4 text-xs font-bold text-[#2A4720] flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#6B8E5A]" />
            <span>
              Rates updated successfully! All platform banners, booking meters, and timers now reflect new pricing.
            </span>
          </div>
        )}

        {errorMsg && (
          <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-xs font-bold text-rose-900">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Flat-Fee Pay-Per-Booking Consultation Rates */}
          <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-8 shadow-sm space-y-6">
            <h3 className="font-temple text-lg font-bold text-[#7B2D26] flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-[#C1662F]" />
              <span>Flat-Fee Consultation Pricing (Pay-Per-Booking)</span>
            </h3>
            <p className="text-xs text-[#6E5545] font-body">
              Configure the primary flat fees shown sitewide for 1-on-1 personal consultations with Acharya Niraj Kumar.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* First Consultation Promotional Fee */}
              <div className="rounded-2xl border border-[#E8A33D]/60 bg-[#FAF1E4] p-5">
                <div className="flex items-center justify-between text-xs font-bold text-[#7B2D26] mb-2">
                  <span>First Consultation Promotional Fee</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#7B2D26] text-white">50% PROMO</span>
                </div>
                <label className="block text-[11px] text-[#6E5545] mb-1">
                  Payable amount for first-time booking (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#7B2D26]">₹</span>
                  <input
                    type="number"
                    min={100}
                    max={10000}
                    disabled={!canManage}
                    value={pricing.flatFirstConsultationFee ?? 1051}
                    onChange={(e) =>
                      setPricing({ ...pricing, flatFirstConsultationFee: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] py-2.5 pl-8 pr-3 font-mono text-base font-bold text-[#7B2D26] focus:outline-none focus:ring-2 focus:ring-[#7B2D26] disabled:opacity-60"
                  />
                </div>
                <span className="mt-2 block text-[10px] text-[#6E5545]">
                  Published promotional creative rate: Flat ₹1,051/-
                </span>
              </div>

              {/* Standard Consultation Fee */}
              <div className="rounded-2xl border border-[#E8D8C3] bg-[#FBF3E7] p-5">
                <div className="flex items-center justify-between text-xs font-bold text-[#7B2D26] mb-2">
                  <span>Standard Consultation Fee</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6B8E5A]/20 text-[#2A4720]">REGULAR</span>
                </div>
                <label className="block text-[11px] text-[#6E5545] mb-1">
                  Standard session rate (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#7B2D26]">₹</span>
                  <input
                    type="number"
                    min={500}
                    max={20000}
                    disabled={!canManage}
                    value={pricing.flatStandardFee ?? 2100}
                    onChange={(e) =>
                      setPricing({ ...pricing, flatStandardFee: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] py-2.5 pl-8 pr-3 font-mono text-base font-bold text-[#7B2D26] focus:outline-none focus:ring-2 focus:ring-[#7B2D26] disabled:opacity-60"
                  />
                </div>
                <span className="mt-2 block text-[10px] text-[#6E5545]">
                  Published regular rate: Flat ₹2,100/-
                </span>
              </div>
            </div>
          </div>

          {/* Per-minute Rates Box */}
          <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-8 shadow-sm space-y-6">
            <h3 className="font-temple text-lg font-bold text-[#7B2D26] flex items-center gap-2">
              <Sliders className="h-5 w-5 text-[#C1662F]" />
              <span>Base Consultation Rates (Per Minute - Secondary / Legacy)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Chat Rate */}
              <div className="rounded-2xl border border-[#E8D8C3] bg-[#FBF3E7] p-5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#7B2D26] mb-3">
                  <MessageSquare className="h-4 w-4 text-[#C1662F]" />
                  <span>Live Chat</span>
                </div>
                <label className="block text-[11px] text-[#6E5545] mb-1">
                  Rate per minute (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#7B2D26]">
                    ₹
                  </span>
                  <input
                    type="number"
                    min={5}
                    max={200}
                    disabled={!canManage}
                    value={pricing.chatRate}
                    onChange={(e) =>
                      setPricing({ ...pricing, chatRate: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] py-2.5 pl-8 pr-3 font-mono text-base font-bold text-[#7B2D26] focus:outline-none focus:ring-2 focus:ring-[#7B2D26] disabled:opacity-60"
                  />
                </div>
                <span className="mt-2 block text-[10px] text-[#6E5545]">
                  With {pricing.discountPercentage}% off: ₹{(pricing.chatRate * (1 - pricing.discountPercentage / 100)).toFixed(1)}/min
                </span>
              </div>

              {/* Voice Rate */}
              <div className="rounded-2xl border border-[#E8D8C3] bg-[#FBF3E7] p-5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#7B2D26] mb-3">
                  <PhoneCall className="h-4 w-4 text-[#6B8E5A]" />
                  <span>Voice Call</span>
                </div>
                <label className="block text-[11px] text-[#6E5545] mb-1">
                  Rate per minute (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#7B2D26]">
                    ₹
                  </span>
                  <input
                    type="number"
                    min={5}
                    max={250}
                    disabled={!canManage}
                    value={pricing.voiceRate}
                    onChange={(e) =>
                      setPricing({ ...pricing, voiceRate: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] py-2.5 pl-8 pr-3 font-mono text-base font-bold text-[#7B2D26] focus:outline-none focus:ring-2 focus:ring-[#7B2D26] disabled:opacity-60"
                  />
                </div>
                <span className="mt-2 block text-[10px] text-[#6E5545]">
                  With {pricing.discountPercentage}% off: ₹{(pricing.voiceRate * (1 - pricing.discountPercentage / 100)).toFixed(1)}/min
                </span>
              </div>

              {/* Video Rate */}
              <div className="rounded-2xl border border-[#E8D8C3] bg-[#FBF3E7] p-5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#7B2D26] mb-3">
                  <Video className="h-4 w-4 text-[#E8A33D]" />
                  <span>Video Call</span>
                </div>
                <label className="block text-[11px] text-[#6E5545] mb-1">
                  Rate per minute (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#7B2D26]">
                    ₹
                  </span>
                  <input
                    type="number"
                    min={5}
                    max={300}
                    disabled={!canManage}
                    value={pricing.videoRate}
                    onChange={(e) =>
                      setPricing({ ...pricing, videoRate: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] py-2.5 pl-8 pr-3 font-mono text-base font-bold text-[#7B2D26] focus:outline-none focus:ring-2 focus:ring-[#7B2D26] disabled:opacity-60"
                  />
                </div>
                <span className="mt-2 block text-[10px] text-[#6E5545]">
                  With {pricing.discountPercentage}% off: ₹{(pricing.videoRate * (1 - pricing.discountPercentage / 100)).toFixed(1)}/min
                </span>
              </div>
            </div>
          </div>

          {/* Promotional Rules */}
          <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-8 shadow-sm space-y-6">
            <h3 className="font-temple text-lg font-bold text-[#7B2D26] flex items-center gap-2">
              <Percent className="h-5 w-5 text-[#E8A33D]" />
              <span>Promotional &amp; Wallet Thresholds</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div>
                <label className="block font-bold text-[#3B2A1E] mb-1">
                  First Consultation Discount (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={90}
                  disabled={!canManage}
                  value={pricing.discountPercentage}
                  onChange={(e) =>
                    setPricing({ ...pricing, discountPercentage: Number(e.target.value) })
                  }
                  className="w-full rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] p-3 font-mono text-sm font-bold text-[#7B2D26] focus:outline-none focus:ring-2 focus:ring-[#7B2D26] disabled:opacity-60"
                />
                <span className="text-[11px] text-[#6E5545] mt-1 block">
                  Automatically applied once per verified client account.
                </span>
              </div>

              <div>
                <label className="block font-bold text-[#3B2A1E] mb-1">
                  Minimum Wallet Recharge (₹)
                </label>
                <input
                  type="number"
                  min={50}
                  disabled={!canManage}
                  value={pricing.minimumRechargeAmount}
                  onChange={(e) =>
                    setPricing({ ...pricing, minimumRechargeAmount: Number(e.target.value) })
                  }
                  className="w-full rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] p-3 font-mono text-sm font-bold text-[#7B2D26] focus:outline-none focus:ring-2 focus:ring-[#7B2D26] disabled:opacity-60"
                />
                <span className="text-[11px] text-[#6E5545] mt-1 block">
                  Prevents sub-optimal payment gateway transaction charges.
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            {canManage ? (
              <button
                type="submit"
                className="rounded-xl bg-[#7B2D26] px-8 py-3 text-xs sm:text-sm font-bold text-[#FBF3E7] hover:bg-[#96372E] transition-all shadow-md flex items-center gap-2"
              >
                <Save className="h-4 w-4 text-[#E8A33D]" />
                <span>Save &amp; Apply Pricing Rules</span>
              </button>
            ) : (
              <div className="rounded-xl bg-[#E8D8C3]/50 px-6 py-3 text-xs font-bold text-[#6E5545] border border-[#E8D8C3] flex items-center gap-2 cursor-not-allowed">
                <Lock className="h-4 w-4 text-[#6E5545]" />
                <span>MANAGE Permission Required to Update Pricing</span>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
