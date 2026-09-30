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
  Calendar,
  Flame,
  Gift,
  FileText,
} from "lucide-react";
import {
  DEFAULT_NAVRATRI_PROMO_CONFIG,
  NavratriPromoConfig,
  isNavratriPromoActive,
} from "@/config/placeholderContent";

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

  const promo = pricing.navratriPromo || DEFAULT_NAVRATRI_PROMO_CONFIG;
  const isPromoActive = isNavratriPromoActive(promo);

  const updatePromo = (updates: Partial<NavratriPromoConfig>) => {
    setPricing((prev) => ({
      ...prev,
      navratriPromo: {
        ...(prev.navratriPromo || DEFAULT_NAVRATRI_PROMO_CONFIG),
        ...updates,
      },
    }));
  };

  const getPromoStatus = () => {
    if (!promo.enabled) {
      return { label: "DISABLED", color: "bg-stone-100 text-stone-700 border-stone-300" };
    }
    if (isPromoActive) {
      return { label: "ACTIVE NOW (PRIORITY POPUP)", color: "bg-emerald-100 text-emerald-800 border-emerald-300" };
    }
    try {
      const now = new Date().getTime();
      const [sy, sm, sd] = promo.startDate.split("-").map(Number);
      const start = new Date(sy, sm - 1, sd, 0, 0, 0, 0).getTime();
      const [ey, em, ed] = promo.endDate.split("-").map(Number);
      const end = new Date(ey, em - 1, ed, 23, 59, 59, 999).getTime();
      if (now < start) {
        return { label: "SCHEDULED", color: "bg-amber-100 text-amber-800 border-amber-300" };
      }
      if (now > end) {
        return { label: "EXPIRED", color: "bg-rose-100 text-rose-800 border-rose-300" };
      }
    } catch {
      // fallback
    }
    return { label: "INACTIVE", color: "bg-stone-100 text-stone-700 border-stone-300" };
  };

  const promoStatus = getPromoStatus();

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

          {/* PRODUCT 3: KUNDLI FULL PDF REPORT */}
          <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8D8C3] pb-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-[#E8A33D]/15 text-[#7B2D26] flex items-center justify-center font-bold">
                  <FileText className="h-5 w-5 text-[#E8A33D]" />
                </div>
                <div>
                  <h3 className="font-temple text-lg font-bold text-[#7B2D26]">
                    Product 3: Kundli Full PDF Report
                  </h3>
                  <p className="text-xs text-[#6E5545]">
                    Detailed Vedic Kundli dossier download. (Free online chart generation remains 100% complimentary).
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#6B8E5A] bg-[#6B8E5A]/10 border border-[#6B8E5A]/25 px-3 py-1 rounded-full w-fit">
                DIGITAL PRODUCT
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6E5545] mb-1.5">
                  PDF Download Unlock Fee (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#6E5545]">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="100"
                    max="5000"
                    step="1"
                    disabled={!canManage}
                    value={pricing.kundliPdfFee ?? 501}
                    onChange={(e) =>
                      setPricing({ ...pricing, kundliPdfFee: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] py-2.5 pl-8 pr-3 font-mono text-base font-bold text-[#7B2D26] focus:outline-none focus:ring-2 focus:ring-[#7B2D26] disabled:opacity-60"
                  />
                </div>
                <span className="mt-2 block text-[10px] text-[#6E5545]">
                  Instant unlocked PDF generation upon successful Razorpay payment.
                </span>
              </div>

              <div className="rounded-2xl border border-dashed border-[#E8D8C3] bg-[#FAF5EE] p-4 flex flex-col justify-center text-xs text-[#6E5545] space-y-2">
                <div className="flex items-center gap-2 text-stone-800 font-bold">
                  <CheckCircle2 className="h-4 w-4 text-[#6B8E5A]" />
                  <span>Free Online Tool Unchanged</span>
                </div>
                <p className="text-[11px] leading-relaxed text-[#6E5545]">
                  Visitors can generate, view, and analyze basic birth charts, planetary positions, and lagna details online for ₹0. The ₹{pricing.kundliPdfFee ?? 501} fee strictly applies to the high-res printable PDF dossier export.
                </p>
              </div>
            </div>
          </div>

          {/* FESTIVE CAMPAIGNS & SEASONAL OFFERS: NAVRATRI PROMOTION */}
          <div className="rounded-3xl border-2 border-[#E8A33D]/60 bg-[#FFFDF9] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8D8C3] pb-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-[#E8A33D]/20 text-[#7B2D26] flex items-center justify-center font-bold">
                  <Flame className="h-5 w-5 text-[#E8A33D]" />
                </div>
                <div>
                  <h3 className="font-temple text-lg font-bold text-[#7B2D26]">
                    Festive Campaign: Navratri Rudraksh Promotion
                  </h3>
                  <p className="text-xs text-[#6E5545]">
                    Configure the active promotional window for the abhimantrit Rudraksh gift popup.
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${promoStatus.color}`}>
                {promoStatus.label}
              </span>
            </div>

            {/* Campaign Priority Explanation */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-amber-950">
                <Sparkles className="h-4 w-4 text-[#E8A33D]" />
                Visitor Priority Behavior:
              </p>
              <p className="text-amber-800">
                When active, this promotional popup takes priority over the standard 50%-off welcome popup on visitors&apos; first visit. Once the promotional window ends or is toggled off, the platform automatically reverts to the standard welcome popup without code changes or redeployments.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Campaign Toggle */}
              <div className="rounded-2xl border border-[#E8D8C3] bg-[#FBF3E7] p-5 flex flex-col justify-between">
                <div>
                  <label className="block text-xs font-bold text-[#7B2D26] mb-1">
                    Campaign Status
                  </label>
                  <p className="text-[11px] text-[#6E5545]">
                    Enable or temporarily pause the Navratri promo popup across all visitor pages.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="navratriPromoEnabled"
                    disabled={!canManage}
                    checked={promo.enabled}
                    onChange={(e) => updatePromo({ enabled: e.target.checked })}
                    className="h-5 w-5 rounded border-[#E8D8C3] text-[#7B2D26] focus:ring-[#7B2D26] cursor-pointer"
                  />
                  <label htmlFor="navratriPromoEnabled" className="text-xs font-bold text-[#3B2A1E] cursor-pointer">
                    {promo.enabled ? "Campaign Enabled" : "Campaign Disabled"}
                  </label>
                </div>
              </div>

              {/* Start Date */}
              <div className="rounded-2xl border border-[#E8D8C3] bg-[#FBF3E7] p-5">
                <div className="flex items-center justify-between text-xs font-bold text-[#7B2D26] mb-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Start Date
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E8A33D]/20 text-[#7B2D26]">00:00 IST</span>
                </div>
                <label className="block text-[11px] text-[#6E5545] mb-1">
                  Festive campaign start
                </label>
                <input
                  type="date"
                  disabled={!canManage}
                  value={promo.startDate}
                  onChange={(e) => updatePromo({ startDate: e.target.value })}
                  className="w-full rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] py-2 px-3 font-mono text-xs font-bold text-[#3B2A1E] focus:outline-none focus:ring-2 focus:ring-[#7B2D26] disabled:opacity-60"
                />
                <span className="mt-2 block text-[10px] text-[#6E5545]">
                  Popup begins displaying on this date
                </span>
              </div>

              {/* End Date */}
              <div className="rounded-2xl border border-[#E8D8C3] bg-[#FBF3E7] p-5">
                <div className="flex items-center justify-between text-xs font-bold text-[#7B2D26] mb-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> End Date
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E8A33D]/20 text-[#7B2D26]">23:59 IST</span>
                </div>
                <label className="block text-[11px] text-[#6E5545] mb-1">
                  Festive campaign end
                </label>
                <input
                  type="date"
                  disabled={!canManage}
                  value={promo.endDate}
                  onChange={(e) => updatePromo({ endDate: e.target.value })}
                  className="w-full rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] py-2 px-3 font-mono text-xs font-bold text-[#3B2A1E] focus:outline-none focus:ring-2 focus:ring-[#7B2D26] disabled:opacity-60"
                />
                <span className="mt-2 block text-[10px] text-[#6E5545]">
                  Automatically reverts to standard popup after
                </span>
              </div>
            </div>

            {/* Applicability and Copy Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Product Applicability */}
              <div className="rounded-2xl border border-[#E8D8C3] bg-[#FBF3E7] p-5">
                <label className="block text-xs font-bold text-[#7B2D26] mb-1">
                  Offer Applies To Consultations:
                </label>
                <p className="text-[11px] text-[#6E5545] mb-3">
                  Specify whether the free abhimantrit Rudraksh gift applies to Astro, Vaastu, or both.
                </p>
                <select
                  disabled={!canManage}
                  value={promo.appliesTo || "both"}
                  onChange={(e) =>
                    updatePromo({
                      appliesTo: e.target.value as "both" | "astro" | "vaastu",
                      applicabilityNote:
                        e.target.value === "both"
                          ? "Limited period offer — valid on all booked consultations (applies to both Vedic Astro Consultation and Vaastu Consultation)."
                          : e.target.value === "astro"
                          ? "Limited period offer — valid on booked Vedic Astro Consultations."
                          : "Limited period offer — valid on booked Vaastu Consultations.",
                    })
                  }
                  className="w-full rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] py-2 px-3 text-xs font-bold text-[#3B2A1E] focus:outline-none focus:ring-2 focus:ring-[#7B2D26] disabled:opacity-60 cursor-pointer"
                >
                  <option value="both">Both Vedic Astro &amp; Vaastu Consultations (Default)</option>
                  <option value="astro">Vedic Astro Consultation Only</option>
                  <option value="vaastu">Vaastu Consultation Only</option>
                </select>
              </div>

              {/* Promo Headline */}
              <div className="rounded-2xl border border-[#E8D8C3] bg-[#FBF3E7] p-5">
                <label className="block text-xs font-bold text-[#7B2D26] mb-1">
                  Popup Headline (Verbatim Offer Copy)
                </label>
                <p className="text-[11px] text-[#6E5545] mb-2">
                  Client-approved verbatim marketing text shown prominently on modal.
                </p>
                <input
                  type="text"
                  disabled={!canManage}
                  value={promo.headline}
                  onChange={(e) => updatePromo({ headline: e.target.value })}
                  className="w-full rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] py-2 px-3 text-xs font-medium text-[#3B2A1E] focus:outline-none focus:ring-2 focus:ring-[#7B2D26] disabled:opacity-60"
                />
              </div>
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
