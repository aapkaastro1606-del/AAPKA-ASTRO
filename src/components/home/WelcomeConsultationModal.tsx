"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, ArrowRight, Sparkles, ShieldCheck, Check } from "lucide-react";
import { DiyaIcon } from "@/components/ui/DiyaIcon";
import { PLACEHOLDER_ASTROLOGER, ADMIN_CONFIGURABLE_PRICING, FIRST_CONSULTATION_OFFER, isNavratriPromoActive, NavratriPromoConfig } from "@/config/placeholderContent";
import { AdminStore } from "@/lib/store/adminStore";
import { useCurrentUserRole } from "@/lib/auth/roleContext";

export const WELCOME_MODAL_STORAGE_KEY = "aapka_welcome_modal_dismissed";
export const WELCOME_MODAL_SESSION_KEY = "aapka_welcome_modal_session_seen";
export const WELCOME_MODAL_COOKIE_NAME = "aapka_welcome_seen";

/**
 * Checks whether a route is excluded from showing the welcome modal.
 * The modal is a visitor-acquisition tool and should NOT appear on:
 * - /dashboard/* (astrologer / staff operating console)
 * - /admin/* (owner / administrative consoles)
 * - /astrologer/* (astrologer portal)
 * - /account/* (logged-in seeker portal)
 * - /consult* (active consultation booking/room flow)
 */
export function isRouteExcludedFromWelcomeModal(pathname: string | null): boolean {
  if (!pathname) return false;
  const normalized = pathname.toLowerCase();
  return (
    normalized.startsWith("/dashboard") ||
    normalized.startsWith("/admin") ||
    normalized.startsWith("/astrologer") ||
    normalized.startsWith("/account") ||
    normalized.startsWith("/consult") ||
    normalized.startsWith("/login") ||
    normalized.startsWith("/signup") ||
    normalized.startsWith("/sso-callback")
  );
}

/**
 * Parses a document.cookie string to determine if an active, authenticated
 * Clerk session exists.
 *
 * NOTE: Clerk sets `__client_uat=0` (and `__client_uat_<hash>=0`) for ALL
 * unauthenticated / logged-out visitors. Checking `.includes("__client_uat")`
 * without inspecting its value falsely treats `__client_uat=0` as an active
 * login and suppresses the welcome modal for every visitor.
 */
export function hasActiveClerkSessionCookie(cookieStr: string): boolean {
  if (!cookieStr) return false;
  const cookies = cookieStr.split(";").map((c) => c.trim());

  for (const cookie of cookies) {
    const eqIndex = cookie.indexOf("=");
    if (eqIndex === -1) continue;
    const name = cookie.slice(0, eqIndex).trim();
    const value = cookie.slice(eqIndex + 1).trim();

    // Non-empty __session (or suffixed __session_*) JWT token
    if ((name === "__session" || name.startsWith("__session_")) && value.length > 0) {
      return true;
    }

    // __client_uat (or suffixed __client_uat_*) is "0" when logged out,
    // and a positive Unix timestamp (e.g. "1790427692") when logged in.
    if (name === "__client_uat" || name.startsWith("__client_uat_")) {
      const timestamp = Number(value);
      if (value !== "0" && !Number.isNaN(timestamp) && timestamp > 0) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Checks whether user has an active session or is mid-consultation.
 */
export function isUserInActiveSessionOrConsultation(
  isAuthenticated: boolean,
  pathname: string | null
): boolean {
  // If user is authenticated with an active session
  if (isAuthenticated) return true;

  // If path is an active consultation session workbench or room
  if (pathname && (pathname.includes("/session/") || pathname.startsWith("/consult"))) {
    return true;
  }

  // Check client-side storage / cookies if available in browser
  if (typeof window !== "undefined") {
    try {
      // Mid-consultation active session tokens
      if (
        sessionStorage.getItem("aapka_active_session_id") ||
        sessionStorage.getItem("active_consultation_id") ||
        localStorage.getItem("aapka_active_session_id")
      ) {
        return true;
      }

      // Active Clerk auth session cookies (must verify __client_uat > 0, not "0")
      if (hasActiveClerkSessionCookie(document.cookie)) {
        return true;
      }
    } catch {
      // Storage access blocked or restricted
    }
  }

  return false;
}

/**
 * Evaluates whether WelcomeConsultationModal should display
 * based on calendar referenceDate, promotion config, route, authentication, and visitor session.
 */
export function shouldShowWelcomeModal({
  referenceDate = new Date(),
  promoConfig = AdminStore.getPricing().navratriPromo,
  pathname = "/",
  isAuthenticated = false,
  isSeenInSession = false,
}: {
  referenceDate?: Date;
  promoConfig?: Partial<NavratriPromoConfig> | null;
  pathname?: string | null;
  isAuthenticated?: boolean;
  isSeenInSession?: boolean;
} = {}): boolean {
  // If Navratri promo is active at referenceDate, welcome modal MUST yield
  if (isNavratriPromoActive(promoConfig, referenceDate)) {
    return false;
  }
  // Suppress on excluded routes
  if (isRouteExcludedFromWelcomeModal(pathname)) {
    return false;
  }
  // Suppress if active user session or booking flow
  if (isUserInActiveSessionOrConsultation(isAuthenticated, pathname)) {
    return false;
  }
  // Suppress if already seen in current session
  if (isSeenInSession) {
    return false;
  }
  return true;
}

/**
 * Evaluates whether NavratriPromotionalModal should display
 * based on calendar referenceDate, promotion config, route, authentication, and visitor session.
 */
export function shouldShowNavratriModal({
  referenceDate = new Date(),
  promoConfig = AdminStore.getPricing().navratriPromo,
  pathname = "/",
  isAuthenticated = false,
  isSeenInSession = false,
}: {
  referenceDate?: Date;
  promoConfig?: Partial<NavratriPromoConfig> | null;
  pathname?: string | null;
  isAuthenticated?: boolean;
  isSeenInSession?: boolean;
} = {}): boolean {
  // Must be active at referenceDate
  if (!isNavratriPromoActive(promoConfig, referenceDate)) {
    return false;
  }
  // Suppress on excluded routes
  if (isRouteExcludedFromWelcomeModal(pathname)) {
    return false;
  }
  // Suppress if active user session or booking flow
  if (isUserInActiveSessionOrConsultation(isAuthenticated, pathname)) {
    return false;
  }
  // Suppress if already seen in current session
  if (isSeenInSession) {
    return false;
  }
  return true;
}

interface WelcomeConsultationModalProps {
  /** Optional delay in milliseconds before displaying the modal on first visit. Default: 90000ms (90 seconds / 1 min 30 sec) */
  delayMs?: number;
  /** Force open for preview/testing purposes */
  forceOpen?: boolean;
  /** Optional reference date for simulating calendar dates in tests */
  referenceDate?: Date;
}

export function WelcomeConsultationModal({
  delayMs = 90000,
  forceOpen = false,
  referenceDate,
}: WelcomeConsultationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [, setPricingVersion] = useState(0);
  const pathname = usePathname();
  const { isAuthenticated } = useCurrentUserRole();

  // Keep modal rate synchronized with live AdminStore / ADMIN_CONFIGURABLE_PRICING updates
  useEffect(() => {
    const handlePricingUpdated = () => setPricingVersion((v) => v + 1);
    window.addEventListener("astro_pricing_updated", handlePricingUpdated);
    window.addEventListener("astro_promo_updated", handlePricingUpdated);
    return () => {
      window.removeEventListener("astro_pricing_updated", handlePricingUpdated);
      window.removeEventListener("astro_promo_updated", handlePricingUpdated);
    };
  }, []);

  useEffect(() => {
    setMounted(true);

    if (forceOpen) {
      setIsOpen(true);
      return;
    }

    // 0. Promotional Priority Check: If Navratri festive promotion is active, it takes priority as first-visit popup
    if (isNavratriPromoActive(AdminStore.getPricing().navratriPromo, referenceDate)) {
      setIsOpen(false);
      return;
    }

    // 1. Route Check: Suppress on /dashboard/*, /admin/*, /astrologer/*, /account/*, /consult*, /login*, /signup*
    if (isRouteExcludedFromWelcomeModal(pathname)) {
      setIsOpen(false);
      return;
    }

    // 2. Active Session / Mid-Consultation Check: Suppress if user is logged in or mid-consultation
    if (isUserInActiveSessionOrConsultation(isAuthenticated, pathname)) {
      setIsOpen(false);
      return;
    }

    // 3. Visitor Session Check: Show once per visitor per browser session.
    try {
      const isSeenInSession = sessionStorage.getItem(WELCOME_MODAL_SESSION_KEY);
      if (isSeenInSession) {
        return;
      }

      const triggerWelcomeModal = () => {
        if (
          !isNavratriPromoActive(AdminStore.getPricing().navratriPromo, referenceDate) &&
          !isRouteExcludedFromWelcomeModal(pathname) &&
          !isUserInActiveSessionOrConsultation(isAuthenticated, pathname)
        ) {
          // If the immediate Live TV broadcast modal is currently active, wait until user dismisses it
          if (
            typeof window !== "undefined" &&
            sessionStorage.getItem("aapka_live_tv_modal_active") === "true"
          ) {
            const onTvDismissed = () => {
              window.removeEventListener("astro_live_tv_dismissed", onTvDismissed);
              triggerWelcomeModal();
            };
            window.addEventListener("astro_live_tv_dismissed", onTvDismissed);
            return;
          }

          setIsOpen(true);
          try {
            sessionStorage.setItem(WELCOME_MODAL_SESSION_KEY, "true");
            document.cookie = `${WELCOME_MODAL_COOKIE_NAME}=1; path=/; SameSite=Lax`;
          } catch {
            // Ignore storage errors
          }
        }
      };

      // Schedule display after delayMs (default 90 seconds / 1min 30sec)
      const timer = setTimeout(triggerWelcomeModal, delayMs);

      return () => clearTimeout(timer);
    } catch {
      // sessionStorage not available or blocked
    }
  }, [delayMs, forceOpen, pathname, isAuthenticated, referenceDate]);

  const handleDismiss = useCallback(() => {
    setIsOpen(false);
    try {
      localStorage.setItem(WELCOME_MODAL_STORAGE_KEY, "true");
      sessionStorage.setItem(WELCOME_MODAL_SESSION_KEY, "true");
      document.cookie = `${WELCOME_MODAL_COOKIE_NAME}=1; path=/; SameSite=Lax`;
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Handle escape key
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

  // If not mounted or closed, return null so rest of the page is completely unblocked
  if (!mounted || !isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
      data-testid="welcome-consultation-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3B2A1E]/75 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
    >
      {/* Backdrop overlay dismiss - clicking dismisses without blocking */}
      <div
        className="fixed inset-0 cursor-pointer"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Modal Card in Aapka Astro's Temple Brand System with 2-Column Creative Composition */}
      <div
        data-testid="welcome-modal-card"
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border-2 border-[#E8A33D]/60 bg-[#FFFDF9] text-[#3B2A1E] font-body shadow-2xl z-10 transition-all transform animate-in zoom-in-95 duration-200"
      >
        {/* Top Decorative Border Accent in Brand Maroon & Gold */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#7B2D26] via-[#E8A33D] to-[#7B2D26]" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-3.5 top-3.5 z-30 rounded-full bg-[#FBF3E7]/90 backdrop-blur-xs p-1.5 text-[#6E5545] hover:bg-[#E8D8C3] hover:text-[#7B2D26] transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#7B2D26] cursor-pointer shadow-xs"
          aria-label="Close welcome offer modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Ambient Warm Golden Aura Glow in Background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 h-52 w-96 rounded-full bg-gradient-to-b from-[#E8A33D]/25 via-[#E8A33D]/10 to-transparent blur-3xl"
        />

        <div className="grid grid-cols-1 md:grid-cols-12 relative z-10">
          {/* Left Column: Offer Details & Value Proposition */}
          <div className="md:col-span-7 p-6 sm:p-7 text-center md:text-left flex flex-col justify-between space-y-3.5">
            {/* 1. Small Logo / Brand Mark with Golden Ornamental Flankers */}
            <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
              <div className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#E8A33D]/60 bg-gradient-to-r from-[#FBF3E7] via-[#FFFDF9] to-[#FBF3E7] px-3 py-1 text-[11px] font-bold text-[#7B2D26] shadow-xs">
                <img src="/images/logo-icon.png" alt="Aapka Astro" className="h-4 w-4 object-contain" />
                <span className="font-temple tracking-widest uppercase">Aapka Astro</span>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#7B2D26]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#7B2D26]">
                <Sparkles className="h-3 w-3 text-[#E8A33D]" />
                Limited Period Offer
              </span>
            </div>

            {/* 2. Headline & Subtext */}
            <div>
              <h2
                id="welcome-modal-title"
                data-testid="welcome-modal-title"
                className="font-temple text-2xl sm:text-3xl font-black text-[#7B2D26] tracking-tight leading-tight drop-shadow-xs"
              >
                50% Off Your First Consultation
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-[#3B2A1E] font-medium leading-relaxed">
                Start your spiritual journey with a massive <strong className="text-[#7B2D26] font-bold">50% discount</strong> on your very first 1-on-1 session with Acharya Niraj Kumar.
              </p>
            </div>

            {/* 3. High-Impact Price Drop Comparison Voucher */}
            <div className="rounded-xl border-2 border-[#E8A33D] bg-gradient-to-br from-[#FFFDF9] via-[#FBF3E7] to-[#FFFDF9] p-3.5 sm:p-4 text-[#3B2A1E] shadow-md relative overflow-hidden">
              {/* Voucher Header Tag */}
              <div className="flex items-center justify-between border-b border-[#E8D8C3] pb-2 mb-2.5">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#7B2D26] font-temple">
                  <Sparkles className="h-3 w-3 text-[#E8A33D]" />
                  Special First Consultation Offer
                </span>
                <span className="rounded-full bg-[#7B2D26] px-2.5 py-0.5 text-[10px] font-black text-[#E8A33D] uppercase tracking-wider shadow-xs">
                  Flat 50% Off
                </span>
              </div>

              {/* Side-by-side dramatic price slashed comparison */}
              <div className="grid grid-cols-2 gap-2.5 items-center">
                {/* Regular Price (Priority Slashed Anchor Price) */}
                <div className="rounded-lg border-2 border-red-200 bg-red-50/70 p-2.5 text-center relative">
                  <span className="rounded-xs bg-[#7B2D26] px-1.5 py-0.5 text-[8px] font-black uppercase text-[#FFFDF9] tracking-wider absolute top-1 right-1">
                    50% OFF
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7B2D26] block font-body">
                    Regular Base Price
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-red-700 line-through decoration-red-600 decoration-4 font-temple block mt-0.5">
                    ₹2,100
                  </span>
                  <span className="text-[9px] text-[#7B2D26] font-bold block">
                    Original Price
                  </span>
                </div>

                {/* First-Time Seeker Special Discounted Price */}
                <div className="rounded-lg border-2 border-[#E8A33D] bg-gradient-to-br from-[#7B2D26] to-[#5D1F1A] p-2.5 text-[#FFFDF9] text-center shadow-md">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#E8A33D] block font-body">
                    Discounted Price
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-[#FFFDF9] font-temple tracking-tight block">
                    {ADMIN_CONFIGURABLE_PRICING.chat.currency}{ADMIN_CONFIGURABLE_PRICING.chat.effectiveFirstTimeRate}
                  </span>
                  <span className="text-[10px] font-bold text-[#E8A33D] font-body block">
                    You Save ₹1,049
                  </span>
                </div>
              </div>

              {/* Inclusions */}
              <div className="mt-2.5 pt-2 border-t border-[#E8D8C3] flex items-center justify-between text-[11px] text-[#6E5545] font-medium">
                <span className="inline-flex items-center gap-1">
                  <Check className="h-3 w-3 text-emerald-600 font-bold" />
                  WhatsApp / Google Meet
                </span>
                <span className="inline-flex items-center gap-1">
                  <Check className="h-3 w-3 text-emerald-600 font-bold" />
                  Full Kundli &amp; Dasha Analysis
                </span>
              </div>

              {/* Descriptive Subtext (Must keep exact text for tests) */}
              <p className="text-[11px] text-[#6E5545] font-body mt-2 leading-relaxed text-center md:text-left">
                Regular base fee ₹2,100 heavily discounted by 50% down to ₹1,051. Consult 1-on-1 with {PLACEHOLDER_ASTROLOGER.displayName} via private chat, call, or video for Flat {ADMIN_CONFIGURABLE_PRICING.chat.currency}{ADMIN_CONFIGURABLE_PRICING.chat.effectiveFirstTimeRate} (Regular ₹2,100).
              </p>
            </div>

            {/* 4. Single Small Line of Trust Phrase */}
            <p
              data-testid="welcome-modal-trust-line"
              className="text-xs font-semibold text-[#6E5545] font-body tracking-wide text-center md:text-left flex items-center justify-center md:justify-start gap-2"
            >
              <ShieldCheck className="h-4 w-4 text-[#E8A33D] shrink-0" />
              <span>20+ years · Certified Jyotish Acharya</span>
              <span className="text-[#E8A33D]">•</span>
              <span className="text-[#7B2D26] font-bold">Limited Period Offer</span>
            </p>

            {/* 5. One Primary CTA Button with Radiant Temple Styling */}
            <div className="pt-0.5">
              <Link
                href={`/consult?offer=${FIRST_CONSULTATION_OFFER.code}`}
                onClick={handleDismiss}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#7B2D26] via-[#8D342C] to-[#7B2D26] hover:from-[#6B241E] hover:to-[#6B241E] py-3.5 px-5 text-sm font-bold text-[#FFFDF9] shadow-lg hover:shadow-xl border border-[#E8A33D]/80 transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-[#7B2D26] focus:ring-offset-2 cursor-pointer"
              >
                {/* Shimmer sweep effect */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
                <span className="relative z-10 tracking-wide font-temple">Claim 50% Off &amp; Start Consultation</span>
                <ArrowRight className="relative z-10 h-4 w-4 text-[#E8A33D] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* 6. One Small Dismiss Link Below the Button */}
            <div className="text-center md:text-left pt-0.5">
              <button
                type="button"
                onClick={handleDismiss}
                className="text-xs text-[#6E5545] hover:text-[#7B2D26] underline underline-offset-4 font-medium transition-colors cursor-pointer"
              >
                No thanks, continue browsing
              </button>
            </div>

            {/* 7. Small Cross-Link to Viar.in as the Very Last Line */}
            <p
              data-testid="welcome-modal-viar-link"
              className="pt-1.5 text-[11px] text-[#6E5545]/80 font-body border-t border-[#E8D8C3]/60 text-center md:text-left"
            >
              Curious about learning astrology yourself?{" "}
              <a
                href="https://viar.in"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#7B2D26] hover:text-[#64221C] underline decoration-[#E8A33D] underline-offset-2 transition-colors"
              >
                Explore courses at Viar.in →
              </a>
            </p>
          </div>

          {/* Right Column: High-Prestige Consecrated Portrait Composition */}
          <div className="md:col-span-5 relative flex flex-col items-center justify-center p-6 sm:p-7 bg-gradient-to-b from-[#7B2D26] via-[#64221C] to-[#451510] text-[#FFFDF9] border-t md:border-t-0 md:border-l border-[#E8A33D]/40 overflow-hidden">
            {/* Sacred Golden Mandala & Radiance Glow */}
            <div
              aria-hidden="true"
              className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-[#E8A33D]/20 blur-2xl pointer-events-none"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-[#E8A33D]/15 blur-2xl pointer-events-none"
            />

            {/* Celestial Zodiac Wheel SVG Background Element */}
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20"
            >
              <svg
                viewBox="0 0 200 200"
                className="w-80 h-80 text-[#E8A33D] animate-[spin_60s_linear_infinite]"
              >
                <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="100" cy="100" r="78" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 3" />
                <circle cx="100" cy="100" r="62" fill="none" stroke="currentColor" strokeWidth="1" />
                <circle cx="100" cy="100" r="44" fill="none" stroke="currentColor" strokeWidth="0.8" />
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                  <line
                    key={deg}
                    x1="100"
                    y1="10"
                    x2="100"
                    y2="38"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    transform={`rotate(${deg} 100 100)`}
                  />
                ))}
                <circle cx="100" cy="100" r="4" fill="#E8A33D" />
              </svg>
            </div>

            {/* Golden Frame with Portrait of Acharya Niraj Kumar in Yellow Vedic Attire */}
            <div className="relative z-10 flex flex-col items-center w-full my-auto">
              {/* Floating Massive 50% OFF Badge */}
              <div className="relative mb-3.5">
                {/* 50% OFF Floating Stamp Badge */}
                <div
                  className="absolute -top-3 -right-3 z-30 flex h-14 w-14 flex-col items-center justify-center rounded-full bg-gradient-to-br from-[#E8A33D] via-[#F4BE6C] to-[#C1662F] text-[#3B2A1E] font-black shadow-2xl border-2 border-[#FFFDF9] transform rotate-12 ring-2 ring-[#7B2D26]"
                  title="50% Off First Consultation"
                >
                  <span className="text-[13px] font-black leading-none font-temple">50%</span>
                  <span className="text-[8px] font-black uppercase tracking-tight leading-none">OFF</span>
                </div>

                {/* Main Image Container */}
                <div className="relative h-44 w-44 sm:h-48 sm:w-48 rounded-2xl p-1 bg-gradient-to-tr from-[#E8A33D] via-[#FFFDF9] to-[#E8A33D] shadow-2xl ring-4 ring-[#E8A33D]/30">
                  <div className="relative h-full w-full rounded-xl overflow-hidden border-2 border-[#7B2D26] bg-[#2A1D15]">
                    <img
                      src="/images/acharya-yellow.jpg"
                      alt="Acharya Niraj Kumar"
                      className="h-full w-full object-cover object-center"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/50 via-black/20 to-transparent pointer-events-none" />
                  </div>

                  {/* Auspicious Consecrated Diya Badge */}
                  <div
                    className="absolute -bottom-2 -left-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#7B2D26] to-[#96372E] border-2 border-[#E8A33D] shadow-lg"
                    title="Vedic Guidance &amp; Consecrated Wisdom"
                  >
                    <DiyaIcon size={16} className="text-[#E8A33D]" />
                  </div>
                </div>
              </div>

              {/* Credentials & Lineage Pill */}
              <div className="text-center w-full space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFDF9] text-[#7B2D26] shadow-md border border-[#E8A33D]">
                  <span className="font-temple text-xs font-black tracking-wider uppercase">
                    Acharya Niraj Kumar
                  </span>
                </div>
                <p className="mt-1 text-xs font-bold text-[#E8A33D] font-body tracking-wide">
                  Vastu Expert &amp; Jyotish Acharya
                </p>
                <p className="text-[11px] text-[#FBF3E7]/80 font-body">
                  Baidyanath Dham Heritage
                </p>

                {/* Trust Tag */}
                <div className="pt-2">
                  <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8A33D]/40 bg-black/25 px-3 py-1.5 text-[11px] font-semibold text-[#FBF3E7] shadow-inner">
                    <Sparkles className="h-3.5 w-3.5 text-[#E8A33D] shrink-0" />
                    <span>1-on-1 Direct Consultation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
