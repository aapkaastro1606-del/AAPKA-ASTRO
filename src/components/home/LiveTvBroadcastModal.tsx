"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Tv, MessageCircle, ArrowRight, Sparkles, Radio, Calendar, Clock, Video } from "lucide-react";
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
  /** Delay in milliseconds before opening immediately on website load. Default: 1200ms */
  delayMs?: number;
  /** Force open for preview/testing purposes */
  forceOpen?: boolean;
}

export function LiveTvBroadcastModal({
  delayMs = 1200,
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

    // 1. Suppress on excluded routes (/admin/*, /dashboard/*, /consult*, /account*, etc.)
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

      // Trigger immediately after small mount delay
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tv-broadcast-title"
      onClick={handleDismiss}
    >
      <div
        className="relative w-full max-w-xl bg-gradient-to-b from-[#FFFDF9] via-[#FAF3EA] to-[#F5EAD9] rounded-2xl shadow-2xl border-2 border-[#E8A33D]/70 overflow-hidden transform animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold & Maroon National Broadcast Bar */}
        <div className="relative bg-gradient-to-r from-[#4A140F] via-[#7B2D26] to-[#4A140F] px-4 py-3 sm:px-6 flex items-center justify-between border-b border-[#E8A33D]/40 text-[#FBF3E7]">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider bg-red-600 text-white shadow-sm ring-2 ring-red-400/50">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              LIVE ON NATIONAL TV
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-[#E8A33D] font-medium tracking-wide">
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
        <div className="p-4 sm:p-6 space-y-4">
          {/* Channel Logo & Acharya Niraj Feature Showcase */}
          <div className="relative bg-gradient-to-r from-[#3B120E] via-[#5A1C16] to-[#3B120E] rounded-xl p-3 sm:p-4 text-white border border-[#E8A33D]/50 shadow-inner">
            <div className="flex flex-row items-center justify-around gap-2 sm:gap-4">
              {/* Channel TV Screen Box */}
              <div className="flex flex-col items-center text-center">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-black/40 rounded-lg p-1.5 border border-[#E8A33D]/60 flex items-center justify-center shadow-lg">
                  <Image
                    src="/images/live-times-logo.png"
                    alt="Live Times News Channel Logo"
                    width={96}
                    height={96}
                    className="w-full h-full object-contain rounded"
                    priority
                  />
                  <span className="absolute -bottom-2 bg-red-600 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded text-white shadow">
                    NEWS CHANNEL
                  </span>
                </div>
                <span className="text-[11px] font-bold text-[#E8A33D] mt-2 tracking-wide uppercase">
                  LIVE TIMES
                </span>
                <span className="text-[9px] text-[#FBF3E7]/70">National Television</span>
              </div>

              {/* Broadcast Antenna / On-Air Connector */}
              <div className="flex flex-col items-center justify-center px-1">
                <div className="flex items-center gap-1 text-[#E8A33D] animate-pulse">
                  <Radio className="w-5 h-5" />
                </div>
                <div className="h-8 w-px bg-gradient-to-b from-[#E8A33D] via-red-500 to-transparent my-1"></div>
                <span className="text-[10px] font-bold text-red-300 uppercase tracking-widest bg-red-950/60 px-2 py-0.5 rounded border border-red-500/30">
                  DAILY 8 AM
                </span>
              </div>

              {/* Acharya Niraj Portrait Box */}
              <div className="flex flex-col items-center text-center">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-0.5 bg-gradient-to-tr from-[#E8A33D] via-white to-[#E8A33D] shadow-lg">
                  <Image
                    src="/images/Acharya_Niraj_Kumar.jpg"
                    alt="Acharya Niraj Kumar"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover rounded-full"
                    priority
                  />
                  <div className="absolute -bottom-1 -right-1 bg-[#E8A33D] text-[#3B2A1E] p-1 rounded-full shadow">
                    <Sparkles className="w-3 h-3" />
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#FBF3E7] mt-2 tracking-wide">
                  Acharya Niraj
                </span>
                <span className="text-[9px] text-[#E8A33D]">Vedic Astrologer</span>
              </div>
            </div>
          </div>

          {/* Authority Headline */}
          <div className="text-center space-y-1">
            <h2
              id="tv-broadcast-title"
              className="text-lg sm:text-2xl font-bold font-temple text-[#7B2D26] leading-snug"
            >
              WATCH ACHARYA NIRAJ LIVE DAILY ON TELEVISION
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-[#8C3A32]">
              अपने पसंदीदा न्यूज़ चैनल <span className="font-bold underline text-[#7B2D26]">Live Times</span> पर रोज़ाना सुबह 8 बजे देखिए लाइव!
            </p>
          </div>

          {/* Broadcast Timing & Details Banner */}
          <div className="bg-[#FFFDF9] border border-[#E8D8C3] rounded-xl p-3 sm:p-3.5 space-y-2 shadow-sm">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-[#FAF3EA] border border-[#E8D8C3]/50">
                <Tv className="w-4 h-4 text-[#7B2D26] flex-shrink-0" />
                <div>
                  <span className="block text-[10px] text-[#7B2D26]/70 uppercase font-semibold">Channel</span>
                  <span className="font-bold text-[#3B2A1E]">Live Times News</span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-[#FAF3EA] border border-[#E8D8C3]/50">
                <Clock className="w-4 h-4 text-red-600 flex-shrink-0" />
                <div>
                  <span className="block text-[10px] text-[#7B2D26]/70 uppercase font-semibold">Live Broadcast</span>
                  <span className="font-bold text-red-700">Daily at 8:00 AM</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] sm:text-xs text-[#5C4532] leading-relaxed text-center pt-1">
              Watch Acharya Niraj Kumar live every morning as he provides authentic Vedic predictions, Janam Kundli analysis, and practical astrological remedies on national television.
            </p>
          </div>

          {/* Highlighted WhatsApp Interaction Section (Ask Question Live on TV) */}
          <div className="space-y-2.5">
            <div className="bg-gradient-to-r from-[#FFF8E7] via-[#FFF3D6] to-[#FFF8E7] border border-[#E8A33D] rounded-xl p-3 text-center">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7B2D26] mb-1">
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                <span>Ask Your Question & Kundli Query LIVE on News Channel</span>
              </div>
              <p className="text-[11px] text-[#5C4532] leading-tight">
                Send your birth details and query directly to Acharya Ji on WhatsApp to be featured and answered live on air during the show.
              </p>
            </div>

            {/* Big Attention WhatsApp CTA */}
            <a
              href={whatsappQuestionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full group flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-[#25D366] to-[#1EBE5D] hover:from-[#20BA5C] hover:to-[#17A34F] shadow-lg shadow-[#25D366]/25 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Message on WhatsApp to Ask Live on TV</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          {/* Footer Secondary Options */}
          <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-2 text-center text-xs">
            <Link
              href="/consult"
              onClick={handleDismiss}
              className="text-[#7B2D26] hover:text-[#5E1E18] font-bold hover:underline inline-flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-[#E8A33D]" />
              Book Private 1-on-1 Consultation
            </Link>

            <button
              type="button"
              onClick={handleDismiss}
              className="text-[#7B2D26]/70 hover:text-[#7B2D26] text-xs underline focus:outline-none"
            >
              No thanks, continue browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
