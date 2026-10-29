"use client";

import React, { useState, useEffect, useCallback, useId } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  Tv,
  MessageCircle,
  ArrowRight,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Globe,
} from "lucide-react";
import { useCurrentUserRole } from "@/lib/auth/roleContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  DEFAULT_LIVE_TV_SETTINGS,
  LiveTvBroadcastSettings,
  evaluateLiveTvStatus,
  LiveTvEvaluationResult,
  buildLiveTvWhatsAppUrl,
} from "@/config/liveTvBroadcastConfig";
import {
  isRouteExcludedFromWelcomeModal,
  isUserInActiveSessionOrConsultation,
} from "@/components/home/WelcomeConsultationModal";

export const LIVE_TV_MODAL_STORAGE_KEY = "aapka_live_tv_modal_dismissed";
export const LIVE_TV_MODAL_SESSION_KEY = "aapka_live_tv_modal_session_seen";
export const LIVE_TV_MODAL_COOKIE_NAME = "aapka_live_tv_seen";
export const LIVE_TV_MODAL_ACTIVE_KEY = "aapka_live_tv_modal_active";

/** Shared key ensuring strictly one popup per visit across the site */
export const POPUP_VISIT_CLAIMED_KEY = "aapka_popup_visit_claimed";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

interface LiveTvBroadcastModalProps {
  /** Optional delay before appearing on initial load. Default: 1000ms */
  delayMs?: number;
  /** Force open for preview/testing purposes */
  forceOpen?: boolean;
  /** Optional initial settings override */
  initialSettings?: LiveTvBroadcastSettings;
  /** Optional mock date for deterministic testing */
  mockDate?: Date | string;
}

export function LiveTvBroadcastModal({
  delayMs = 1000,
  forceOpen = false,
  initialSettings,
  mockDate,
}: LiveTvBroadcastModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<LiveTvBroadcastSettings>(
    initialSettings || DEFAULT_LIVE_TV_SETTINGS
  );
  const [evaluation, setEvaluation] = useState<LiveTvEvaluationResult>(() =>
    evaluateLiveTvStatus(initialSettings || DEFAULT_LIVE_TV_SETTINGS, mockDate)
  );

  const { language } = useLanguage();
  const [modalLang, setModalLang] = useState<"en" | "hi">(
    language === "hi" ? "hi" : "en"
  );
  const pathname = usePathname();
  const { isAuthenticated } = useCurrentUserRole();
  const titleId = useId();

  // Sync language if site language changes
  useEffect(() => {
    setModalLang(language === "hi" ? "hi" : "en");
  }, [language]);

  // Fetch verified settings from API on client mount
  useEffect(() => {
    let isCancelled = false;
    async function loadSettings() {
      try {
        const res = await fetch("/api/live-tv");
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && data.success && data.settings) {
            setSettings(data.settings);
            setEvaluation(evaluateLiveTvStatus(data.settings, mockDate));
          }
        }
      } catch {
        // Fall back to defaults
      }
    }
    loadSettings();
    return () => {
      isCancelled = true;
    };
  }, [mockDate]);

  useEffect(() => {
    setMounted(true);

    if (forceOpen) {
      setIsOpen(true);
      try {
        sessionStorage.setItem(LIVE_TV_MODAL_ACTIVE_KEY, "true");
        sessionStorage.setItem(POPUP_VISIT_CLAIMED_KEY, "live_tv");
      } catch {
        // Storage unavailable
      }
      return;
    }

    // 1. Suppress on excluded operational routes
    if (isRouteExcludedFromWelcomeModal(pathname)) {
      setIsOpen(false);
      return;
    }

    // 2. Suppress if authenticated or mid-consultation
    if (isUserInActiveSessionOrConsultation(isAuthenticated, pathname)) {
      setIsOpen(false);
      return;
    }

    // 3. Suppress if programme has ended or status is not visible
    const currentEval = evaluateLiveTvStatus(settings, mockDate);
    if (!currentEval.isVisible) {
      setIsOpen(false);
      return;
    }

    // 4. Check 7-day dismissal memory
    try {
      const dismissedTs = localStorage.getItem(LIVE_TV_MODAL_STORAGE_KEY);
      if (dismissedTs) {
        const ts = parseInt(dismissedTs, 10);
        if (!isNaN(ts) && Date.now() - ts < SEVEN_DAYS_MS) {
          return; // Suppressed within 7-day dismissal window
        }
      }

      // 5. Check if already seen in current session or another popup already claimed this visit
      const isSeenInSession = sessionStorage.getItem(LIVE_TV_MODAL_SESSION_KEY);
      const isVisitClaimed = sessionStorage.getItem(POPUP_VISIT_CLAIMED_KEY);
      if (isSeenInSession || isVisitClaimed) {
        return;
      }

      // Priority 1: Trigger after initial delay and claim visit slot
      const timer = setTimeout(() => {
        if (
          !isRouteExcludedFromWelcomeModal(pathname) &&
          !isUserInActiveSessionOrConsultation(isAuthenticated, pathname)
        ) {
          setIsOpen(true);
          try {
            sessionStorage.setItem(LIVE_TV_MODAL_SESSION_KEY, "true");
            sessionStorage.setItem(LIVE_TV_MODAL_ACTIVE_KEY, "true");
            sessionStorage.setItem(POPUP_VISIT_CLAIMED_KEY, "live_tv");
            document.cookie = `${LIVE_TV_MODAL_COOKIE_NAME}=1; path=/; SameSite=Lax`;
          } catch {
            // Storage unavailable
          }
        }
      }, delayMs);

      return () => clearTimeout(timer);
    } catch {
      // Storage unavailable
    }
  }, [delayMs, forceOpen, pathname, isAuthenticated, settings, mockDate]);

  const handleDismiss = useCallback(() => {
    setIsOpen(false);
    try {
      localStorage.setItem(LIVE_TV_MODAL_STORAGE_KEY, String(Date.now()));
      sessionStorage.setItem(LIVE_TV_MODAL_SESSION_KEY, "true");
      sessionStorage.setItem(LIVE_TV_MODAL_ACTIVE_KEY, "false");
      document.cookie = `${LIVE_TV_MODAL_COOKIE_NAME}=1; path=/; SameSite=Lax`;
      window.dispatchEvent(new CustomEvent("astro_live_tv_dismissed"));
    } catch {
      // Storage unavailable
    }
  }, []);

  // Keyboard Escape handler
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

  if (!mounted || !isOpen || !evaluation.isVisible) return null;

  const isHindi = modalLang === "hi";
  const texts = settings.texts;
  const whatsappUrl = buildLiveTvWhatsAppUrl(settings);
  const statusLabel = isHindi ? evaluation.labelHi : evaluation.labelEn;
  const programmeTitle = isHindi
    ? settings.programmeName.hi
    : settings.programmeName.en;
  const astrologerTitle = isHindi
    ? settings.astrologerName.hi
    : settings.astrologerName.en;
  const roleText = isHindi ? settings.role.hi : settings.role.en;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={handleDismiss}
      data-testid="live-tv-broadcast-modal"
    >
      <div
        className="relative w-full max-w-[520px] max-h-[92vh] flex flex-col bg-[#FFFDF9] rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-[#E8D8C3] ring-1 ring-[#7B2D26]/20 overflow-hidden transform animate-in zoom-in-95 duration-200 text-[#3B2A1E]"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Header Strip with Status & Language Switcher */}
        <div className="shrink-0 bg-gradient-to-r from-[#7B2D26] via-[#64221C] to-[#7B2D26] px-4 py-3 sm:px-5 flex items-center justify-between text-[#FBF3E7] border-b border-[#E8A33D]/40">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide border shadow-xs ${
                evaluation.status === "LIVE_NOW"
                  ? "bg-red-600 border-red-300 text-white animate-pulse"
                  : "bg-[#4A140F] border-[#E8A33D]/50 text-[#E8A33D]"
              }`}
            >
              {evaluation.status === "LIVE_NOW" && (
                <span className="h-2 w-2 rounded-full bg-white animate-ping" />
              )}
              <Tv className="w-3.5 h-3.5" />
              <span>{statusLabel}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <div className="inline-flex rounded-lg border border-[#E8A33D]/40 bg-[#4A140F]/80 p-0.5 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setModalLang("en")}
                className={`px-2 py-0.5 rounded-md transition-colors ${
                  !isHindi ? "bg-[#E8A33D] text-[#3B2A1E]" : "text-[#FBF3E7]/80 hover:text-white"
                }`}
                aria-label="Switch to English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setModalLang("hi")}
                className={`px-2 py-0.5 rounded-md transition-colors ${
                  isHindi ? "bg-[#E8A33D] text-[#3B2A1E]" : "text-[#FBF3E7]/80 hover:text-white"
                }`}
                aria-label="Switch to Hindi"
              >
                हिन्दी
              </button>
            </div>

            {/* Accessible Dismiss Button */}
            <button
              type="button"
              onClick={handleDismiss}
              aria-label={isHindi ? "बंद करें" : "Close Live Times broadcast announcement"}
              className="p-1 rounded-full text-[#FBF3E7]/80 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E8A33D]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 space-y-4">
          {/* Programme & Channel Identity */}
          <div className="text-center space-y-1.5 border-b border-[#E8D8C3] pb-3.5">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#C1662F]">
              <Sparkles className="w-3.5 h-3.5 text-[#E8A33D]" />
              <span>
                {roleText}: {astrologerTitle}
              </span>
            </div>

            <h2
              id={titleId}
              className="font-temple text-xl sm:text-2xl font-bold text-[#7B2D26] leading-snug"
            >
              {isHindi ? texts.heading.hi : texts.heading.en}
            </h2>

            {/* Channel Representation: Text-only by default unless logo approved */}
            <div className="pt-1 flex items-center justify-center gap-2">
              {settings.channelLogoApproved && settings.channelLogoUrl ? (
                <Image
                  src={settings.channelLogoUrl}
                  alt={settings.channelName}
                  width={110}
                  height={32}
                  className="h-8 object-contain"
                />
              ) : (
                <span className="font-serif text-sm font-black tracking-wider text-[#3B2A1E] px-3 py-1 rounded-lg bg-[#FAF3EA] border border-[#E8D8C3]">
                  {settings.channelName}
                </span>
              )}
              <span className="text-xs text-[#6E5545] font-medium">
                • {isHindi ? "सातों दिन, सुबह 8:00 से 8:30 बजे (IST)" : "Daily 8:00 to 8:30 AM IST (7 Days)"}
              </span>
            </div>
          </div>

          {/* Editorial Body */}
          <p className="text-xs sm:text-sm text-[#5C4532] leading-relaxed font-body">
            {isHindi ? texts.body.hi : texts.body.en}
          </p>

          {/* How to Ask Box */}
          <div className="rounded-2xl border border-[#E8A33D] bg-gradient-to-br from-[#FFFDF9] via-[#FAF3EA] to-[#FBF3E7] p-3.5 sm:p-4 space-y-2 shadow-xs">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#7B2D26]">
              <MessageCircle className="w-4 h-4 text-[#25D366] fill-[#25D366]" />
              <span>{isHindi ? "प्रश्न कैसे भेजें (निःशुल्क)" : "How to Ask a Question (Free)"}</span>
            </div>
            <p className="text-xs text-[#6E5545] leading-relaxed">
              {isHindi ? texts.howToAsk.hi : texts.howToAsk.en}
            </p>
          </div>

          {/* Direct WhatsApp Action Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white bg-[#25D366] hover:bg-[#20BA5C] active:bg-[#1B9B4D] shadow-md transition-all text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
          >
            <MessageCircle className="w-4 h-4 fill-current shrink-0" />
            <span>
              {isHindi
                ? "WhatsApp पर #KaalKiChaal लिखकर प्रश्न भेजें"
                : "Send Question on WhatsApp (#KaalKiChaal)"}
            </span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </a>

          {/* Consent Statement & Privacy Policy Link */}
          <div className="rounded-xl bg-[#FAF5EE] border border-[#E8D8C3] p-3 text-[11px] text-[#6E5545] leading-relaxed space-y-1">
            <div className="flex items-start gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#6B8E5A] shrink-0 mt-0.5" />
              <span>{isHindi ? texts.consent.hi : texts.consent.en}</span>
            </div>
            <div className="pl-5 pt-0.5">
              <Link
                href="/privacy-policy"
                onClick={handleDismiss}
                className="font-semibold text-[#7B2D26] hover:underline"
              >
                {isHindi ? "गोपनीयता नीति पढ़ें →" : "Read Privacy Policy & Broadcast Terms →"}
              </Link>
            </div>
          </div>

          {/* Where to Watch Text */}
          <div className="text-[11px] text-[#6E5545] text-center border-t border-[#E8D8C3] pt-2.5">
            <p>{isHindi ? texts.whereToWatch.hi : texts.whereToWatch.en}</p>
          </div>

          {/* Optional Proof Clip Link */}
          {settings.proofClipsUrl ? (
            <div className="text-center pt-1">
              <a
                href={settings.proofClipsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#7B2D26] hover:underline inline-flex items-center gap-1"
              >
                <span>{isHindi ? "कार्यक्रम के क्लिप देखें" : "Watch clips of the programme"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : null}

          {/* Footer General Disclaimer & Secondary Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-[#E8D8C3] pt-3 text-[11px] text-[#6E5545]">
            <Link
              href="/consult"
              onClick={handleDismiss}
              className="text-[#7B2D26] hover:underline font-bold"
            >
              {isHindi
                ? "निजी 1-ऑन-1 परामर्श बुक करें"
                : "Book Private 1-on-1 Consultation Instead"}
            </Link>

            <button
              type="button"
              onClick={handleDismiss}
              className="text-[#6E5545] hover:text-[#3B2A1E] underline text-[11px]"
            >
              {isHindi ? "वेबसाइट पर जारी रखें" : "Continue browsing"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
