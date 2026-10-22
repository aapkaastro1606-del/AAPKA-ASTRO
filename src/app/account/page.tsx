"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PLACEHOLDER_ASTROLOGER } from "@/config/placeholderContent";
import { MandalaDivider } from "@/components/ui/MandalaDivider";
import { DiyaIcon } from "@/components/ui/DiyaIcon";
import { useUser } from "@/components/auth/ClerkAuthWrapper";
import {
  User,
  PhoneCall,
  Sparkles,
  FileText,
  Clock,
  PlusCircle,
  Gem,
  ArrowRight,
  ShieldCheck,
  Star,
  CheckCircle2,
  Gift,
  MessageCircle,
  Video,
  Calendar,
} from "lucide-react";

export default function ClientAccountDashboard() {
  const { user, isLoaded } = useUser();
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [savedKundlis, setSavedKundlis] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const astrologerStatus = "AVAILABLE";

  const displayName =
    user?.fullName ||
    user?.firstName ||
    (user as any)?.username ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "Seeker";
  const displayEmail = user?.primaryEmailAddress?.emailAddress || "";
  const isOwner =
    displayEmail?.toLowerCase() ===
    (process.env.NEXT_PUBLIC_OWNER_EMAIL?.toLowerCase() || "aapkaastro1606@gmail.com");
  const userInitial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    if (isLoaded && !user) {
      window.location.replace("/login?redirect_url=/account");
    }
  }, [isLoaded, user]);

  useEffect(() => {
    const sync = async () => {
      try {
        const res = await fetch("/api/account/data");
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            setLoadError("Your session expired or you don't have access. Sign in again.");
          } else {
            setLoadError("Could not load account data. Please retry.");
          }
          return;
        }
        const data = await res.json();
        if (data.success) {
          setActiveBooking(data.activeBooking || null);
          setSavedKundlis(data.kundlis || []);
          setConsultations(data.consultations || []);
          setLoadError(null);
        }
      } catch {
        setLoadError("Could not load account data. Please retry.");
      }
    };
    sync();
    window.addEventListener("astro_state_changed", sync);
    window.addEventListener("aapka_booking_updated", sync);

    if (isLoaded && user) {
      fetch("/api/auth/sync").catch(() => {});
    }

    return () => {
      window.removeEventListener("astro_state_changed", sync);
      window.removeEventListener("aapka_booking_updated", sync);
    };
  }, [isLoaded, user]);

  return (
    <div className="bg-[#FBF3E7] text-[#3B2A1E] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {loadError && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-xs text-red-700 flex items-center justify-between gap-3">
            <span>{loadError}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("astro_state_changed"));
                }}
                className="font-bold underline hover:no-underline cursor-pointer"
              >
                Retry
              </button>
              <span>•</span>
              <Link
                href="/login?redirect_url=/account"
                className="font-bold underline hover:no-underline"
              >
                Sign In Again
              </Link>
            </div>
          </div>
        )}
        {/* Top Profile Banner */}
        <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7B2D26] text-[#E8A33D] font-temple text-2xl font-bold shadow-md">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={displayName}
                  className="h-16 w-16 rounded-2xl object-cover"
                />
              ) : (
                userInitial
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-temple text-2xl font-bold text-[#7B2D26]">
                  Namaste, {displayName}
                </h1>
                {isOwner ? (
                  <span className="rounded-full bg-[#E8A33D]/25 border border-[#E8A33D] px-2.5 py-0.5 text-[10px] font-bold text-[#7B2D26] flex items-center gap-1 shadow-xs">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#C1662F]" />
                    Platform Owner &amp; Acharya
                  </span>
                ) : (
                  <span className="rounded-full bg-[#6B8E5A]/15 border border-[#6B8E5A]/30 px-2.5 py-0.5 text-[10px] font-bold text-[#2A4720] flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    Verified Seeker
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6E5545] mt-1">
                {displayEmail} {(user as any)?.createdAt ? `• Member since ${new Date((user as any).createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}` : ""}
              </p>
            </div>
          </div>

          {/* Pay-Per-Booking Consultation Quick Cards */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            {/* Astro Consultation */}
            <div className="flex items-center gap-3 bg-[#FBF3E7] p-3.5 rounded-2xl border border-[#E8D8C3] w-full sm:w-auto justify-between sm:justify-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E5545] block">
                  Astro Consultation
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs font-black text-red-700 line-through decoration-red-600">Reg. ₹2,100</span>
                  <span className="font-mono text-lg font-black text-[#7B2D26]">Now ₹1,051/-</span>
                </div>
                <span className="text-[9px] text-[#6B8E5A] font-bold block">
                  50% Off First Booking
                </span>
              </div>
              <Link
                href="/consult?product=astro&offer=FIRST1051"
                className="rounded-xl bg-[#7B2D26] px-3.5 py-2 text-xs font-bold text-[#FFFDF9] hover:bg-[#64221C] transition-all shadow-sm shrink-0"
              >
                Book
              </Link>
            </div>

            {/* Vaastu Consultation */}
            <div className="flex items-center gap-3 bg-[#FBF3E7] p-3.5 rounded-2xl border border-[#E8D8C3] w-full sm:w-auto justify-between sm:justify-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E5545] block">
                  Vaastu Consultation
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs font-black text-red-700 line-through decoration-red-600">Reg. ₹25,000</span>
                  <span className="font-mono text-lg font-black text-[#7B2D26]">Now ₹15,000/-</span>
                </div>
                <span className="text-[9px] text-[#6B8E5A] font-bold block">
                  Flat ₹10,000 Savings
                </span>
              </div>
              <Link
                href="/consult?product=vaastu"
                className="rounded-xl bg-[#6B8E5A] px-3.5 py-2 text-xs font-bold text-[#FFFDF9] hover:bg-[#587749] transition-all shadow-sm shrink-0"
              >
                Book
              </Link>
            </div>
          </div>
        </div>

        {/* Owner Sanctum Desk & Admin Console Banner */}
        {isOwner && (
          <div className="rounded-3xl border-2 border-[#E8A33D] bg-gradient-to-r from-[#FFFDF9] via-[#FDF6EA] to-[#FFFDF9] p-6 sm:p-7 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8D8C3] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#7B2D26] text-[#E8A33D] shadow-sm">
                  <DiyaIcon size={24} />
                </div>
                <div>
                  <h2 className="font-temple text-xl font-bold text-[#7B2D26]">
                    Owner &amp; Astrologer Administration Desk
                  </h2>
                  <p className="text-xs text-[#6E5545] mt-0.5">
                    Welcome Acharya Ji. Access your verification queue, leads, and platform controls.
                  </p>
                </div>
              </div>
              <Link
                href="/admin/bookings"
                className="inline-flex items-center gap-2 rounded-xl bg-[#7B2D26] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#64221C] transition-all shrink-0"
              >
                <ShieldCheck className="h-4 w-4 text-[#E8A33D]" />
                <span>Open Verification Queue &rarr;</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              <Link
                href="/admin/bookings"
                className="p-4 rounded-2xl border border-[#E8D8C3] bg-white hover:border-[#7B2D26] hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#7B2D26] group-hover:underline">UPI Bookings Queue</span>
                  <ShieldCheck className="h-4 w-4 text-[#C1662F]" />
                </div>
                <p className="text-[11px] text-[#6E5545] mt-1.5 leading-relaxed">
                  Verify bank credit, approve claims &amp; schedule Google Meet / WhatsApp slots.
                </p>
              </Link>

              <Link
                href="/admin/leads"
                className="p-4 rounded-2xl border border-[#E8D8C3] bg-white hover:border-[#7B2D26] hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#7B2D26] group-hover:underline">Kundli Leads</span>
                  <FileText className="h-4 w-4 text-[#6B8E5A]" />
                </div>
                <p className="text-[11px] text-[#6E5545] mt-1.5 leading-relaxed">
                  View free Kundli generation leads with consent &amp; export to CSV.
                </p>
              </Link>

              <Link
                href="/admin/pricing"
                className="p-4 rounded-2xl border border-[#E8D8C3] bg-white hover:border-[#7B2D26] hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#7B2D26] group-hover:underline">Pricing &amp; Rates</span>
                  <Gem className="h-4 w-4 text-[#E8A33D]" />
                </div>
                <p className="text-[11px] text-[#6E5545] mt-1.5 leading-relaxed">
                  Manage flat-fee consultation products, festive promotions &amp; UPI settings.
                </p>
              </Link>

              <Link
                href="/admin/diagnostics"
                className="p-4 rounded-2xl border border-[#E8D8C3] bg-white hover:border-[#7B2D26] hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#7B2D26] group-hover:underline">System Health</span>
                  <Sparkles className="h-4 w-4 text-purple-600" />
                </div>
                <p className="text-[11px] text-[#6E5545] mt-1.5 leading-relaxed">
                  Monitor Neon PostgreSQL latency, migrations &amp; webhook activity.
                </p>
              </Link>
            </div>
          </div>
        )}

        {/* Active Consultation Status Banner */}
        {activeBooking && (
          <div className="rounded-3xl border-2 border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-7 shadow-lg">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 pb-5 border-b border-[#E8D8C3]">
              <div className="flex items-start sm:items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FAF1E4] text-[#7B2D26] border border-[#E8D8C3] shrink-0">
                  <Clock className="h-7 w-7 text-[#C1662F] animate-spin" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#7B2D26] bg-[#FBF3E7] px-2 py-0.5 rounded border border-[#E8D8C3]">
                      {activeBooking.bookingId}
                    </span>
                    <span className="rounded-full bg-[#6B8E5A]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#2A4720] border border-[#6B8E5A]/30 font-temple">
                      {(activeBooking.bookingStatus || activeBooking.status) === "SCHEDULED"
                        ? "SESSION SCHEDULED"
                        : (activeBooking.bookingStatus || activeBooking.status) === "PAYMENT_CLAIMED"
                        ? "NEEDS VERIFICATION"
                        : (activeBooking.bookingStatus || activeBooking.status) === "PENDING_PAYMENT"
                        ? "AWAITING PAYMENT"
                        : (activeBooking.bookingStatus || activeBooking.status) === "COMPLETED"
                        ? "COMPLETED"
                        : "CONFIRMED"}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold font-temple text-[#7B2D26] mt-1">
                    {activeBooking.productName || (activeBooking.productType === "vaastu" || activeBooking.productId === "vaastu" ? "Vaastu Consultation" : activeBooking.productType === "kundli_pdf" ? "Janam Kundli PDF Dossier" : "Astro Consultation")}
                  </h2>
                  <p className="text-xs text-[#6E5545] mt-0.5 font-body">
                    Format: <strong>{activeBooking.format || "WhatsApp call"}</strong> &bull; Locked Amount: <strong>Flat ₹{(activeBooking.lockedAmount || activeBooking.amount || activeBooking.amountPaid || 1051).toLocaleString("en-IN")}</strong>
                    {activeBooking.scheduledSlot && (
                      <span className="ml-2 font-bold text-emerald-800">&bull; Slot: {activeBooking.scheduledSlot}</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
                {activeBooking.meetingLink && activeBooking.meetingLink.startsWith("http") ? (
                  <a
                    href={activeBooking.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-emerald-700 hover:bg-emerald-800 px-4 py-2.5 text-xs font-bold text-white transition-all shadow-md text-center flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Video className="h-4 w-4" />
                    <span>Join Google Meet</span>
                  </a>
                ) : (
                  <a
                    href={`https://wa.me/919311215564?text=${encodeURIComponent(`Pranam Acharya Ji, I am coordinating my consultation (Booking Ref: ${activeBooking.bookingId}). Please let me know when we can connect.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-[#25D366] hover:bg-[#20ba5a] px-4 py-2.5 text-xs font-bold text-white transition-all shadow-md text-center flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Message on WhatsApp (+91 93112 15564)</span>
                  </a>
                )}

                <Link
                  href="/account/consult"
                  className="rounded-xl border border-[#E8D8C3] bg-[#FAF5EE] hover:bg-[#E8D8C3] px-4 py-2.5 text-xs font-bold text-[#3B2A1E] transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <span>View Status</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Stepper summary */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="flex items-center gap-2 p-2 rounded-xl border border-[#B8DCB0] bg-[#F4F9F2] text-[#2A4720] font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#6B8E5A] shrink-0" />
                <span>1. Initiated</span>
              </div>
              <div className={`flex items-center gap-2 p-2 rounded-xl border font-semibold ${
                ["PAYMENT_CLAIMED", "CONFIRMED", "SCHEDULED", "COMPLETED"].includes(activeBooking.bookingStatus || activeBooking.status)
                  ? "border-[#B8DCB0] bg-[#F4F9F2] text-[#2A4720]"
                  : "border-[#E8D8C3] bg-[#FAF5EE] text-[#6E5545]"
              }`}>
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span>2. Bank Verified</span>
              </div>
              <div className={`flex items-center gap-2 p-2 rounded-xl border font-semibold ${
                ["SCHEDULED", "COMPLETED"].includes(activeBooking.bookingStatus || activeBooking.status)
                  ? "border-[#B8DCB0] bg-[#F4F9F2] text-[#2A4720]"
                  : "border-[#E8D8C3] bg-[#FAF5EE] text-[#6E5545]"
              }`}>
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>3. Scheduled</span>
              </div>
              <div className={`flex items-center gap-2 p-2 rounded-xl border font-semibold ${
                (activeBooking.bookingStatus || activeBooking.status) === "COMPLETED"
                  ? "border-[#B8DCB0] bg-[#F4F9F2] text-[#2A4720]"
                  : "border-[#E8D8C3] bg-[#FAF5EE] text-[#6E5545] opacity-75"
              }`}>
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                <span>4. Completed</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/account/consult"
            className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 shadow-sm hover:border-[#7B2D26] hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7B2D26]/10 text-[#7B2D26]">
                <PhoneCall className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#6B8E5A]">
                <span className="h-2 w-2 rounded-full bg-[#6B8E5A] animate-pulse" />
                <span>{astrologerStatus}</span>
              </div>
            </div>
            <div>
              <h3 className="font-temple text-sm font-bold text-[#7B2D26] group-hover:text-[#C1662F]">
                Start Consultation
              </h3>
              <p className="text-[11px] text-[#6E5545] mt-0.5">WhatsApp, Meet or Chat</p>
            </div>
          </Link>

          <Link
            href="/account/kundli"
            className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 shadow-sm hover:border-[#7B2D26] hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C1662F]/10 text-[#C1662F]">
                <FileText className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-bold text-[#7B2D26]">
                {savedKundlis.length} Charts
              </span>
            </div>
            <div>
              <h3 className="font-temple text-sm font-bold text-[#7B2D26] group-hover:text-[#C1662F]">
                Saved Kundlis
              </h3>
              <p className="text-[11px] text-[#6E5545] mt-0.5">Manage family profiles</p>
            </div>
          </Link>

          <Link
            href="/account/history"
            className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 shadow-sm hover:border-[#7B2D26] hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8A33D]/15 text-[#C1662F]">
                <Clock className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-bold text-[#7B2D26]">
                {consultations.length} Sessions
              </span>
            </div>
            <div>
              <h3 className="font-temple text-sm font-bold text-[#7B2D26] group-hover:text-[#C1662F]">
                Remedies &amp; History
              </h3>
              <p className="text-[11px] text-[#6E5545] mt-0.5">Session summaries</p>
            </div>
          </Link>

          <Link
            href="/account/reviews"
            className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 shadow-sm hover:border-[#7B2D26] hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7B2D26]/10 text-[#E8A33D]">
                <Star className="h-5 w-5 fill-[#E8A33D]" />
              </div>
              <span className="text-[10px] font-bold text-[#6B8E5A]">Rate Session</span>
            </div>
            <div>
              <h3 className="font-temple text-sm font-bold text-[#7B2D26] group-hover:text-[#C1662F]">
                Submit Review
              </h3>
              <p className="text-[11px] text-[#6E5545] mt-0.5">Share your experience</p>
            </div>
          </Link>
        </div>

        {/* Referral Promo Banner */}
        <div className="mb-8 rounded-2xl border border-[#E8A33D] bg-gradient-to-r from-[#FFFDF9] via-[#FAF1E4] to-[#FFFDF9] p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#7B2D26] text-[#E8A33D] shrink-0">
              <Gift className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-temple text-sm sm:text-base font-bold text-[#7B2D26]">
                Share Aapka Astro &amp; Gift ₹1,051 Promotional Consultation
              </h4>
              <p className="text-xs text-[#6E5545] mt-0.5">
                Invite friends and family to consult Acharya Ji with 50% off (Flat ₹1,051/- instead of ₹2,100).
              </p>
            </div>
          </div>
          <Link
            href="/account/referral"
            className="shrink-0 rounded-xl bg-[#7B2D26] px-5 py-2.5 text-xs font-bold text-[#FBF3E7] hover:bg-[#64221C] transition-all shadow-xs flex items-center gap-1.5"
          >
            <span>Share Offer</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Two Columns: Saved Kundlis Quick Card + Recent Consultation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Saved Kundlis */}
          <div className="lg:col-span-6 rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-temple text-xl font-bold text-[#7B2D26]">
                Your Saved Janam Kundlis
              </h3>
              <Link
                href="/account/kundli"
                className="text-xs font-bold text-[#C1662F] hover:underline"
              >
                View All ({savedKundlis.length}) &rarr;
              </Link>
            </div>

            {savedKundlis.length > 0 ? (
              <div className="space-y-3">
                {savedKundlis.slice(0, 2).map((knd) => (
                  <div
                    key={knd.id}
                    className="rounded-2xl border border-[#E8D8C3] bg-[#FBF3E7] p-4 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-temple text-sm font-bold text-[#7B2D26]">
                        {knd.name}
                      </h4>
                      <p className="text-[11px] text-[#6E5545]">
                        {knd.birthDate} • {knd.birthPlace}
                      </p>
                      <div className="mt-1 flex gap-2 text-[10px] font-semibold text-[#7B2D26]">
                        <span>Lagna: {knd.lagna}</span>
                        <span>•</span>
                        <span>Rashi: {knd.rashi}</span>
                      </div>
                    </div>

                    <Link
                      href="/kundli-generator"
                      className="rounded-lg bg-[#FFFDF9] border border-[#E8D8C3] px-3 py-1.5 text-xs font-bold text-[#7B2D26] hover:bg-[#7B2D26] hover:text-white transition-all shadow-sm"
                    >
                      Open Chart
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#E8D8C3] bg-[#FBF3E7]/50 p-6 text-center space-y-2">
                <p className="text-xs text-[#6E5545]">No saved Janam Kundlis found yet.</p>
                <Link
                  href="/kundli-generator"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#7B2D26] px-4 py-2 text-xs font-bold text-[#FBF3E7] hover:bg-[#64221C] transition-all shadow-sm"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#E8A33D]" />
                  <span>Calculate &amp; Save Free Kundli</span>
                </Link>
              </div>
            )}
          </div>

          {/* Recent Consultation Notes & Remedies */}
          <div className="lg:col-span-6 rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-temple text-xl font-bold text-[#7B2D26]">
                Recent Astrological Remedy
              </h3>
              <Link
                href="/account/history"
                className="text-xs font-bold text-[#C1662F] hover:underline"
              >
                Full History &rarr;
              </Link>
            </div>

            {consultations.length > 0 ? (
              <div className="rounded-2xl border border-[#E8A33D]/30 bg-[#FBF3E7] p-5">
                <div className="flex items-center justify-between text-xs text-[#6E5545] mb-2">
                  <span>{consultations[0].date} • {consultations[0].mode}</span>
                  <span className="font-bold text-[#7B2D26]">{consultations[0].id}</span>
                </div>
                <h4 className="font-temple text-sm font-bold text-[#7B2D26]">
                  {consultations[0].topic}
                </h4>
                <div className="mt-3 rounded-xl bg-[#FFFDF9] p-3 border border-[#E8D8C3] text-xs text-[#3B2A1E]">
                  <strong className="text-[#C1662F] block mb-1">Prescribed Vedic Remedy:</strong>
                  {consultations[0].remedy}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#E8D8C3] bg-[#FBF3E7]/50 p-6 text-center space-y-2">
                <p className="text-xs text-[#6E5545]">No consultation records or prescribed remedies yet.</p>
                <Link
                  href="/consult"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#E8A33D] px-4 py-2 text-xs font-bold text-[#3B2A1E] hover:bg-[#F6CF86] transition-all shadow-sm"
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                  <span>Consult Acharya Ji (50% Off First Session)</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
