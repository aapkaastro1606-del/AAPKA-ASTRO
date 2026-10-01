"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AstrologerStateStore } from "@/lib/store/astrologerStore";
import { ClientAccountStore } from "@/lib/store/clientAccountStore";
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
} from "lucide-react";

export default function ClientAccountDashboard() {
  const { user, isLoaded } = useUser();
  const [wallet, setWallet] = useState(0);
  const [activeBooking, setActiveBooking] = useState<any>(() => ClientAccountStore.getActiveBooking());
  const profile = ClientAccountStore.getProfile();
  const savedKundlis = ClientAccountStore.getSavedKundlis();
  const consultations = ClientAccountStore.getConsultationHistory();
  const astrologerStatus = AstrologerStateStore.getStatus();

  const displayName =
    user?.fullName ||
    user?.firstName ||
    (user as any)?.username ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "Seeker";
  const displayEmail = user?.primaryEmailAddress?.emailAddress || profile.email;
  const userInitial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    setWallet(AstrologerStateStore.getWalletBalance());
    const sync = () => {
      setWallet(AstrologerStateStore.getWalletBalance());
      setActiveBooking(ClientAccountStore.getActiveBooking());
    };
    window.addEventListener("astro_state_changed", sync);
    window.addEventListener("aapka_booking_updated", sync);

    if (isLoaded && user) {
      fetch("/api/auth/sync")
        .then((r) => r.json())
        .then((data) => {
          if (data?.user?.walletBalance !== undefined) {
            setWallet(data.user.walletBalance);
            AstrologerStateStore.setWalletBalance(data.user.walletBalance);
          }
        })
        .catch(() => {});
    }

    return () => {
      window.removeEventListener("astro_state_changed", sync);
      window.removeEventListener("aapka_booking_updated", sync);
    };
  }, [isLoaded, user]);

  return (
    <div className="bg-[#FBF3E7] text-[#3B2A1E] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
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
                <span className="rounded-full bg-[#6B8E5A]/15 border border-[#6B8E5A]/30 px-2.5 py-0.5 text-[10px] font-bold text-[#2A4720] flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Verified Seeker
                </span>
              </div>
              <p className="text-xs text-[#6E5545] mt-1">
                {displayEmail} {(user as any)?.createdAt ? `• Member since ${new Date((user as any).createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}` : profile.joinedDate ? `• Member since ${profile.joinedDate}` : ""}
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
                <div className="font-mono text-xl font-black text-[#7B2D26]">
                  Flat ₹1,051/-
                </div>
                <span className="text-[9px] text-[#6B8E5A] font-semibold block">
                  50% Off First Session (Reg. ₹2,100)
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
                <div className="font-mono text-xl font-black text-[#7B2D26]">
                  Flat ₹15,000/-
                </div>
                <span className="text-[9px] text-[#6B8E5A] font-semibold block">
                  ₹10,000 Off (Reg. ₹25,000)
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

        {/* Pending Active Consultation Banner */}
        {activeBooking && activeBooking.status === "CONFIRMED" && (
          <div className="rounded-3xl border-2 border-[#7B2D26] bg-[#FFFDF9] p-6 sm:p-7 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FAF1E4] text-[#7B2D26] border border-[#E8D8C3] shrink-0">
                  <Clock className="h-7 w-7 text-[#C1662F] animate-spin" />
                </div>
                <div>
                  <span className="rounded-full bg-[#6B8E5A]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#2A4720] border border-[#6B8E5A]/30 font-temple">
                    BOOKING CONFIRMED &bull; PAYMENT RECEIVED
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold font-temple text-[#7B2D26] mt-1">
                    Consultation booked: {activeBooking.productName || (activeBooking.productId === "vaastu" ? "Vaastu Consultation" : "Astro Consultation")}, session pending
                  </h2>
                  <p className="text-xs text-[#6E5545] mt-1 font-body">
                    Format: <strong>{activeBooking.format}</strong> &bull; Amount Paid: <strong>Flat ₹{activeBooking.amountPaid.toLocaleString("en-IN")}</strong> &bull; Astrologer status: <span className="font-bold text-[#6B8E5A]">{astrologerStatus}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Link
                  href="/consult"
                  className="flex-1 sm:flex-none rounded-xl bg-[#7B2D26] px-5 py-3 text-xs font-bold text-[#FFFDF9] hover:bg-[#64221C] transition-all shadow-md text-center flex items-center justify-center gap-1.5"
                >
                  <span>Open Consultation Room</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
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
                      href="/kundli"
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
                  href="/kundli"
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
