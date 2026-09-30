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
  Lock,
  AlertCircle,
  ShieldCheck,
  Tag,
  Compass,
  Sparkles,
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

  const astroSavings = (pricing.flatStandardFee ?? 2100) - (pricing.flatFirstConsultationFee ?? 1051);
  const vaastuSavings = (pricing.vaastuStandardFee ?? 25000) - (pricing.vaastuPromoFee ?? 15000);

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
                Consultation Products &amp; Pricing Panel
              </h1>
              <p className="text-xs sm:text-sm text-[#6E5545] mt-1">
                Configure live flat-fee consultation products (Astro and Vaastu) and promotional rules in real-time. No per-minute charges.
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
                You have active <strong>VIEW</strong> permissions for platform pricing. Modifying flat rates or promotional discounts requires <strong>MANAGE</strong> access granted by the Platform Owner.
              </p>
            </div>
          </div>
        )}

        {saved && (
          <div className="rounded-2xl border border-[#6B8E5A]/40 bg-[#F4F9F2] p-4 text-xs font-bold text-[#2A4720] flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#6B8E5A]" />
            <span>
              Pricing rules updated successfully! All platform banners, booking checkout, and modals now reflect new pricing.
            </span>
          </div>
        )}

        {errorMsg && (
          <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-xs font-bold text-rose-900">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PRODUCT 1: Astro Consultation */}
          <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-7 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#E8D8C3] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7B2D26] text-white">
                  <Sparkles className="h-5 w-5 text-[#E8A33D]" />
                </div>
                <div>
                  <h3 className="font-temple text-lg font-bold text-[#7B2D26]">
                    Product 1: Astro Consultation (Pay-Per-Booking)
                  </h3>
                  <p className="text-xs text-[#6E5545]">
                    Personal Vedic birth chart reading covering career, marriage, health, and remedies.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#7B2D26]/10 text-[#7B2D26] border border-[#7B2D26]/20">
                First-Time Gated
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* First Consultation Promotional Fee */}
              <div className="rounded-2xl border border-[#E8A33D]/60 bg-[#FAF1E4] p-5">
                <div className="flex items-center justify-between text-xs font-bold text-[#7B2D26] mb-2">
                  <span>First Consultation Promotional Fee</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#7B2D26] text-white">50% PROMO</span>
                </div>
                <label className="block text-[11px] text-[#6E5545] mb-1">
                  Payable amount for first-time seekers (₹)
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
                  Confirmed promotional creative rate: Flat ₹1,051/- (Savings: ₹{astroSavings.toLocaleString("en-IN")})
                </span>
              </div>

              {/* Standard Consultation Fee */}
              <div className="rounded-2xl border border-[#E8D8C3] bg-[#FBF3E7] p-5">
                <div className="flex items-center justify-between text-xs font-bold text-[#7B2D26] mb-2">
                  <span>Standard Consultation Fee</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6B8E5A]/20 text-[#2A4720]">REGULAR</span>
                </div>
                <label className="block text-[11px] text-[#6E5545] mb-1">
                  Standard session rate for returning seekers (₹)
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
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
                <span className="text-[10px] text-[#6E5545] mt-1 block">
                  Automatically applied once per verified client account on first booking.
                </span>
              </div>

              <div>
                <label className="block font-bold text-[#3B2A1E] mb-1">
                  Astro First-Time Coupon Code
                </label>
                <div className="flex items-center rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] p-3">
                  <Tag className="h-4 w-4 text-[#C1662F] mr-2 shrink-0" />
                  <span className="font-mono text-sm font-bold text-[#7B2D26]">FIRST1051</span>
                  <span className="ml-auto text-[10px] font-bold text-[#6B8E5A] bg-[#6B8E5A]/15 px-2 py-0.5 rounded-full">
                    ACTIVE
                  </span>
                </div>
                <span className="text-[10px] text-[#6E5545] mt-1 block">
                  Verified across promotional creatives and welcome popups.
                </span>
              </div>
            </div>
          </div>

          {/* PRODUCT 2: Vaastu Consultation */}
          <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-7 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#E8D8C3] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6B8E5A] text-white">
                  <Compass className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-temple text-lg font-bold text-[#7B2D26]">
                    Product 2: Vaastu Consultation (Pay-Per-Booking)
                  </h3>
                  <p className="text-xs text-[#6E5545]">
                    Comprehensive Devta Vaastu analysis of residential, commercial, or industrial properties sans demolition.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#6B8E5A]/15 text-[#2A4720] border border-[#6B8E5A]/30">
                Open To Everyone
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Vaastu Standing Promotional Fee */}
              <div className="rounded-2xl border border-[#6B8E5A]/50 bg-[#F4F9F2] p-5">
                <div className="flex items-center justify-between text-xs font-bold text-[#2A4720] mb-2">
                  <span>Standing Promotional Fee</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6B8E5A] text-white">₹10,000 OFF</span>
                </div>
                <label className="block text-[11px] text-[#6E5545] mb-1">
                  Payable amount for all clients (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#2A4720]">₹</span>
                  <input
                    type="number"
                    min={1000}
                    max={100000}
                    disabled={!canManage}
                    value={pricing.vaastuPromoFee ?? 15000}
                    onChange={(e) =>
                      setPricing({ ...pricing, vaastuPromoFee: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] py-2.5 pl-8 pr-3 font-mono text-base font-bold text-[#2A4720] focus:outline-none focus:ring-2 focus:ring-[#6B8E5A] disabled:opacity-60"
                  />
                </div>
                <span className="mt-2 block text-[10px] text-[#6E5545]">
                  Current standing price for all seekers: Flat ₹15,000/- (Savings: ₹{vaastuSavings.toLocaleString("en-IN")})
                </span>
              </div>

              {/* Vaastu Standard Fee */}
              <div className="rounded-2xl border border-[#E8D8C3] bg-[#FBF3E7] p-5">
                <div className="flex items-center justify-between text-xs font-bold text-[#7B2D26] mb-2">
                  <span>Standard Consultation Fee</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6B8E5A]/20 text-[#2A4720]">REGULAR</span>
                </div>
                <label className="block text-[11px] text-[#6E5545] mb-1">
                  Standard published fee (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#7B2D26]">₹</span>
                  <input
                    type="number"
                    min={5000}
                    max={150000}
                    disabled={!canManage}
                    value={pricing.vaastuStandardFee ?? 25000}
                    onChange={(e) =>
                      setPricing({ ...pricing, vaastuStandardFee: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] py-2.5 pl-8 pr-3 font-mono text-base font-bold text-[#7B2D26] focus:outline-none focus:ring-2 focus:ring-[#7B2D26] disabled:opacity-60"
                  />
                </div>
                <span className="mt-2 block text-[10px] text-[#6E5545]">
                  Published regular rate: Flat ₹25,000/-
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-[#E8D8C3] bg-[#FAF5EE] p-4 text-xs text-[#6E5545] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-[#6B8E5A]" />
                <span>
                  Vaastu standing promotional offer code: <strong>VAASTU15K</strong> (Flat ₹10,000 off applied automatically)
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#6B8E5A] bg-[#6B8E5A]/15 px-2 py-0.5 rounded-full">
                UNRESTRICTED
              </span>
            </div>
          </div>

          <div className="flex justify-end">
            {canManage ? (
              <button
                type="submit"
                className="rounded-xl bg-[#7B2D26] px-8 py-3 text-xs sm:text-sm font-bold text-[#FBF3E7] hover:bg-[#96372E] transition-all shadow-md flex items-center gap-2 cursor-pointer"
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
