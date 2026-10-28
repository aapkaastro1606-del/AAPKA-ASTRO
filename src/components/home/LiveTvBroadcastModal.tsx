"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  Tv,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Radio,
  Clock,
  CheckCircle2,
  Share2,
} from "lucide-react";
import { useCurrentUserRole } from "@/lib/auth/roleContext";
import {
  isRouteExcludedFromWelcomeModal,
  isUserInActiveSessionOrConsultation,
} from "@/components/home/WelcomeConsultationModal";

export const LIVE_TV_MODAL_STORAGE_KEY = "aapka_live_tv_modal_dismissed";
export const LIVE_TV_MODAL_SESSION_KEY = "aapka_live_tv_modal_session_seen";
export const LIVE_TV_MODAL_COOKIE_NAME = "aapka_live_tv_seen";
export const LIVE_TV_MODAL_ACTIVE_KEY = "aapka_live_tv_modal_active";

interface LiveTvBroadcastModalProps {
  /** Delay in milliseconds before opening immediately on website load. Default: 1000ms */
  delayMs?: number;
  /** Force open for preview/testing purposes */
  forceOpen?: boolean;
}

export function LiveTvBroadcastModal({
  delayMs = 1000,
  forceOpen = false,
}: LiveTvBroadcastModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated } = useCurrentUserRole();

  useEffect(() => {
    setMounted(true);

    if (forceOpen) {
      setIsOpen(true);
      try {
        sessionStorage.setItem(LIVE_TV_MODAL_ACTIVE_KEY, "true");
      } catch {
        // Ignore storage error
      }
      return;
    }

    // 1. Suppress on excluded operational routes (/admin/*, /dashboard/*, /consult*, /account*, etc.)
    if (isRouteExcludedFromWelcomeModal(pathname)) {
      setIsOpen(false);
      return;
    }

    // 2. Suppress if authenticated or mid-consultation
    if (isUserInActiveSessionOrConsultation(isAuthenticated, pathname)) {
      setIsOpen(false);
      return;
    }

    // 3. Check if already seen in current session
    try {
      const isSeenInSession = sessionStorage.getItem(LIVE_TV_MODAL_SESSION_KEY);
      if (isSeenInSession) {
        return;
      }

      // Trigger immediately after initial mount
      const timer = setTimeout(() => {
        if (
          !isRouteExcludedFromWelcomeModal(pathname) &&
          !isUserInActiveSessionOrConsultation(isAuthenticated, pathname)
        ) {
          setIsOpen(true);
          try {
            sessionStorage.setItem(LIVE_TV_MODAL_SESSION_KEY, "true");
            sessionStorage.setItem(LIVE_TV_MODAL_ACTIVE_KEY, "true");
            document.cookie = `${LIVE_TV_MODAL_COOKIE_NAME}=1; path=/; SameSite=Lax`;
          } catch {
            // Ignore storage errors
          }
        }
      }, delayMs);

      return () => clearTimeout(timer);
    } catch {
      // Storage unavailable
    }
  }, [delayMs, forceOpen, pathname, isAuthenticated]);

  const handleDismiss = useCallback(() => {
    setIsOpen(false);
    try {
      localStorage.setItem(LIVE_TV_MODAL_STORAGE_KEY, "true");
      sessionStorage.setItem(LIVE_TV_MODAL_SESSION_KEY, "true");
      sessionStorage.setItem(LIVE_TV_MODAL_ACTIVE_KEY, "false");
      document.cookie = `${LIVE_TV_MODAL_COOKIE_NAME}=1; path=/; SameSite=Lax`;
      window.dispatchEvent(new CustomEvent("astro_live_tv_dismissed"));
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismiss();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleDismiss]);

  if (!mounted || !isOpen) return null;

  const whatsappQuestionUrl = `https://wa.me/919311215564?text=${encodeURIComponent(
    "Namaste Acharya Ji, I watch your live show on Live Times News Channel (Daily 8:00 AM). I would like to ask my question live on TV:\n\nName:\nDate of Birth (DOB):\nTime of Birth (TOB):\nPlace of Birth (POB):\nMy Question/Query:"
  )}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tv-broadcast-title"
      onClick={handleDismiss}
    >
      <div
        className="relative w-full max-w-lg bg-gradient-to-b from-[#FFFDF9] via-[#FAF4EA] to-[#F5EAD9] rounded-2xl shadow-2xl border-2 border-[#E8A33D] ring-1 ring-[#E8A33D]/40 overflow-hidden transform animate-in zoom-in-95 duration-200 text-[#3B2A1E]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold & Crimson National Broadcast Header */}
        <div className="relative bg-gradient-to-r from-[#4A140F] via-[#7B2D26] to-[#4A140F] px-4 py-2.5 sm:px-5 sm:py-3 flex items-center justify-between border-b border-[#E8A33D]/50 text-[#FBF3E7]">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-red-600 text-white shadow-md ring-2 ring-red-400/50">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              LIVE ON NATIONAL TV
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#E8A33D] font-bold tracking-wide uppercase">
              <Tv className="w-3.5 h-3.5 text-[#E8A33D]" />
              Television Broadcast
            </span>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Close television broadcast announcement"
            className="p-1 rounded-full text-[#FBF3E7]/80 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E8A33D]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="p-4 sm:p-5 space-y-3.5">
          {/* Authentic Television Studio Mockup / Live Broadcast Frame */}
          <div className="relative rounded-2xl p-2.5 sm:p-3 bg-gradient-to-b from-[#1E0B08] via-[#2D100C] to-[#1E0B08] border-2 border-[#E8A33D]/80 shadow-2xl overflow-hidden">
            {/* Ambient TV glow */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-20 bg-[#E8A33D]/20 blur-2xl pointer-events-none"></div>

            {/* TV Screen Content Area */}
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-[#140604] via-[#240B07] to-[#140604] border border-[#E8A33D]/40 p-3 sm:p-4">
              {/* Studio Upper Header Strip */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-white">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                  <span className="text-[10px] font-black tracking-widest text-red-400 uppercase">
                    ON AIR • TELEVISION STUDIO
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-[#E8A33D] font-mono tracking-wider">
                  <Clock className="w-3 h-3 text-[#E8A33D]" />
                  <span>DAILY 8:00 AM IST</span>
                </div>
              </div>

              {/* Main TV Anchor & Channel Showcase Row */}
              <div className="flex items-center justify-between gap-3 sm:gap-4 py-1">
                {/* Official Live Times Channel Badge */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-b from-black/80 to-[#2A0C08] rounded-xl p-1.5 border-2 border-[#E8A33D] shadow-xl flex items-center justify-center group">
                    <Image
                      src="/images/live-times-logo.png"
                      alt="Live Times News Channel"
                      width={90}
                      height={90}
                      className="w-full h-full object-contain rounded"
                      priority
                    />
                    <div className="absolute -bottom-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full shadow-md border border-white/30">
                      NEWS
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#E8A33D] mt-2.5 tracking-wider uppercase drop-shadow">
                    LIVE TIMES
                  </span>
                  <span className="text-[9px] font-semibold text-stone-300">National News Channel</span>
                </div>

                {/* Broadcast Beam / Radio Wave Graphic */}
                <div className="flex flex-col items-center justify-center px-1 text-center">
                  <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#E8A33D]/10 border border-[#E8A33D]/40 text-[#E8A33D] mb-1">
                    <Radio className="w-5 h-5 animate-pulse text-[#E8A33D]" />
                    <span className="absolute inset-0 rounded-full border border-[#E8A33D]/30 animate-ping"></span>
                  </div>
                  <span className="text-[9px] font-bold text-red-300 uppercase tracking-widest bg-red-950/80 px-2 py-0.5 rounded border border-red-500/40">
                    LIVE DAILY
                  </span>
                  <span className="text-[9px] font-bold text-[#E8A33D] mt-1 font-mono">
                    8:00 AM
                  </span>
                </div>

                {/* Acharya Niraj Kumar Celebrated Portrait */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl p-1 bg-gradient-to-tr from-[#E8A33D] via-[#FFF3D6] to-[#E8A33D] shadow-xl">
                    <div className="relative w-full h-full rounded-lg overflow-hidden border border-[#7B2D26]">
                      <Image
                        src="/images/acharya-yellow.jpg"
                        alt="Acharya Niraj Kumar"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                        priority
                      />
                    </div>
                    {/* Certified / Featured Icon */}
                    <div className="absolute -bottom-1.5 -right-1.5 bg-[#E8A33D] text-[#3B2A1E] p-1 rounded-full shadow-md border border-white">
                      <Sparkles className="w-3.5 h-3.5 fill-[#3B2A1E]" />
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#FBF3E7] mt-2 tracking-wide drop-shadow">
                    Acharya Niraj
                  </span>
                  <span className="text-[9px] font-semibold text-[#E8A33D]">Vedic Astrologer</span>
                </div>
              </div>

              {/* Lower-Third News Chyron */}
              <div className="mt-3 pt-2 border-t border-white/10">
                <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-800 text-white rounded-lg px-2.5 py-1 flex items-center justify-between text-[10px] sm:text-[11px] font-bold shadow-inner">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                    <span className="uppercase tracking-wider">LIVE TELECAST:</span>
                    <span className="text-amber-200">Kundli Analysis &amp; Daily Rashiphal</span>
                  </div>
                  <span className="hidden sm:inline font-mono text-[10px] text-white/90">
                    8:00 AM IST
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Authority Headline */}
          <div className="text-center space-y-1">
            <h2
              id="tv-broadcast-title"
              className="text-base sm:text-xl font-bold font-temple text-[#7B2D26] tracking-wide leading-tight uppercase"
            >
              WATCH ACHARYA NIRAJ LIVE DAILY ON TELEVISION
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-[#8C3A32]">
              अपने पसंदीदा न्यूज़ चैनल <span className="font-bold underline text-[#7B2D26]">Live Times</span> पर रोज़ाना सुबह 8 बजे देखिए लाइव!
            </p>
          </div>

          {/* Quick Schedule & Network Trust Strip */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FFFDF9] border border-[#E8D8C3] shadow-sm">
              <div className="p-1.5 rounded-lg bg-[#FAF3EA] text-[#7B2D26]">
                <Tv className="w-4 h-4 text-[#7B2D26]" />
              </div>
              <div className="leading-tight">
                <span className="block text-[10px] text-[#7B2D26]/80 font-bold uppercase">Channel</span>
                <span className="font-black text-[#3B2A1E]">Live Times News</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FFFDF9] border border-[#E8D8C3] shadow-sm">
              <div className="p-1.5 rounded-lg bg-red-50 text-red-600">
                <Clock className="w-4 h-4 text-red-600" />
              </div>
              <div className="leading-tight">
                <span className="block text-[10px] text-red-700 font-bold uppercase">Live Broadcast</span>
                <span className="font-black text-red-700">Daily at 8:00 AM</span>
              </div>
            </div>
          </div>

          {/* Live Viewer Question Highlight Box (Eagerness Driver) */}
          <div className="bg-gradient-to-r from-[#FFF8E7] via-[#FFF3D6] to-[#FFF8E7] border-2 border-[#E8A33D] rounded-xl p-3 sm:p-3.5 text-center shadow-md space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black text-[#7B2D26]">
              <MessageCircle className="w-4 h-4 text-[#25D366] fill-[#25D366]" />
              <span>Ask Your Question &amp; Kundli Query LIVE on News Channel</span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#5C4532] leading-relaxed">
              Want Acharya Niraj Kumar to answer your career, marriage, or Kundli question live on TV? Send your birth details on WhatsApp now to be selected for tomorrow&apos;s morning broadcast!
            </p>
          </div>

          {/* High-Attention Vibrant WhatsApp CTA */}
          <a
            href={whatsappQuestionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full group relative flex flex-col items-center justify-center py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-[#25D366] via-[#20BA5C] to-[#17A34F] hover:from-[#20BA5C] hover:to-[#128C40] shadow-xl shadow-[#25D366]/30 hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 overflow-hidden"
          >
            {/* Subtle animated light gleam across the button */}
            <span className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-700 ease-out"></span>

            <div className="flex items-center gap-2 text-sm sm:text-base font-black tracking-wide">
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Message on WhatsApp to Ask Live on TV</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-normal text-white/90">
              Send your DOB, Time, Place of Birth &amp; question for the 8:00 AM show
            </span>
          </a>

          {/* DTH & Cable Availability Trust Bar */}
          <div className="text-center pt-0.5">
            <p className="text-[10px] text-[#7B2D26]/80 font-medium">
              📺 Available on Tata Play, Airtel DTH, Dish TV, D2H &amp; all local cable networks across India
            </p>
          </div>

          {/* Footer Secondary Options */}
          <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-2 text-center text-xs border-t border-[#E8D8C3]/60 pt-2">
            <Link
              href="/consult"
              onClick={handleDismiss}
              className="text-[#7B2D26] hover:text-[#5E1E18] font-bold hover:underline inline-flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E8A33D]" />
              Book Private 1-on-1 Consultation Instead
            </Link>

            <button
              type="button"
              onClick={handleDismiss}
              className="text-[#7B2D26]/70 hover:text-[#7B2D26] text-xs underline focus:outline-none font-medium"
            >
              No thanks, continue browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
