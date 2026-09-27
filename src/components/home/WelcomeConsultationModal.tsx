"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Sparkles, CheckCircle2, ShieldCheck, ArrowRight, Star, Clock, Award } from "lucide-react";
import { DiyaIcon } from "@/components/ui/DiyaIcon";
import { PLACEHOLDER_ASTROLOGER, ADMIN_CONFIGURABLE_PRICING, FIRST_CONSULTATION_OFFER } from "@/config/placeholderContent";
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

interface WelcomeConsultationModalProps {
  /** Optional delay in milliseconds before displaying the modal on first visit. Default: 2000ms */
  delayMs?: number;
  /** Force open for preview/testing purposes */
  forceOpen?: boolean;
}

export function WelcomeConsultationModal({
  delayMs = 2000,
  forceOpen = false,
}: WelcomeConsultationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [, setPricingVersion] = useState(0);
  const pathname = usePathname();
  const { isAuthenticated } = useCurrentUserRole();

  // Keep modal per-minute rates synchronized with live AdminStore / ADMIN_CONFIGURABLE_PRICING updates
  useEffect(() => {
    const handlePricingUpdated = () => setPricingVersion((v) => v + 1);
    window.addEventListener("astro_pricing_updated", handlePricingUpdated);
    return () => window.removeEventListener("astro_pricing_updated", handlePricingUpdated);
  }, []);

  useEffect(() => {
    setMounted(true);

    if (forceOpen) {
      setIsOpen(true);
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
    // IMPORTANT: Do NOT block on `isAuthLoading` (window.Clerk.loaded), because Clerk's
    // third-party scripts can remain in `status: "loading"` on slow connections — the exact
    // same hydration issue fixed in Navbar's <Show when="signed-out">. And do NOT call
    // `setIsOpen(false)` when `isSeenInSession` is true, or else any effect re-run after
    // opening would immediately close the newly opened modal!
    try {
      const isSeenInSession = sessionStorage.getItem(WELCOME_MODAL_SESSION_KEY);
      if (isSeenInSession) {
        return;
      }

      // Schedule display for first visit in this session
      const timer = setTimeout(() => {
        // Double-check conditions before opening
        if (
          !isRouteExcludedFromWelcomeModal(pathname) &&
          !isUserInActiveSessionOrConsultation(isAuthenticated, pathname)
        ) {
          setIsOpen(true);
          // Mark as shown in this session so it does not reappear on page navigations
          try {
            sessionStorage.setItem(WELCOME_MODAL_SESSION_KEY, "true");
            document.cookie = `${WELCOME_MODAL_COOKIE_NAME}=1; path=/; SameSite=Lax`;
          } catch {
            // Ignore storage errors
          }
        }
      }, delayMs);

      return () => clearTimeout(timer);
    } catch {
      // sessionStorage not available or blocked
    }
  }, [delayMs, forceOpen, pathname, isAuthenticated]);

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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-[#3B2A1E]/75 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
    >
      {/* Backdrop overlay dismiss - clicking dismisses without blocking */}
      <div
        className="fixed inset-0 cursor-pointer"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Modal Dialog Card - Designed using Aapka Astro's Temple Brand System */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border-2 border-[#E8D8C3] bg-[#FFFDF9] text-[#3B2A1E] font-body shadow-2xl z-10 my-auto transition-all transform animate-in zoom-in-95 duration-200">
        {/* Top Decorative Border Accent in Brand Maroon & Gold */}
        <div className="h-2 w-full bg-gradient-to-r from-[#7B2D26] via-[#E8A33D] to-[#7B2D26]" />

        {/* Close Button (Dismissible) */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-3.5 top-4.5 z-20 rounded-full bg-[#FBF3E7] p-1.5 text-[#6E5545] hover:bg-[#E8D8C3] hover:text-[#7B2D26] transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#7B2D26] cursor-pointer"
          aria-label="Close welcome offer modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-5 sm:p-6 space-y-4 sm:space-y-5">
          {/* Header Badge & Title */}
          <div className="text-center space-y-1.5 pt-1">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E8A33D]/60 bg-[#FBF3E7] px-3 py-1 text-xs font-bold text-[#7B2D26] shadow-2xs">
              <DiyaIcon size={13} />
              <span className="tracking-wide uppercase font-body font-semibold">First-Visit Welcome Privilege</span>
              <Sparkles className="h-3 w-3 text-[#E8A33D]" />
            </div>

            {/* Strict Client Offer Headline: 50% Off Your First Consultation (NEVER "Free") */}
            <h2
              id="welcome-modal-title"
              className="font-temple text-2xl sm:text-3xl font-extrabold text-[#7B2D26] tracking-tight leading-tight"
            >
              50% Off Your First Consultation
            </h2>
            <p className="text-xs sm:text-sm text-[#6E5545] font-medium font-body">
              Direct 1-on-1 Guidance with {PLACEHOLDER_ASTROLOGER.displayName}
            </p>
          </div>

          {/* Simulated Chat Preview with Acharya Niraj Kumar (3-bubble fresh exchange) */}
          <div className="rounded-2xl border border-[#E8D8C3] bg-[#FBF3E7] p-3 sm:p-4 space-y-3 shadow-inner">
            {/* Practitioner Status Bar */}
            <div className="flex items-center justify-between border-b border-[#E8D8C3]/80 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-[#E8A33D]">
                  <Image
                    src={PLACEHOLDER_ASTROLOGER.avatarUrl}
                    alt={PLACEHOLDER_ASTROLOGER.displayName}
                    fill
                    sizes="40px"
                    className="object-cover object-top"
                  />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#6B8E5A] ring-2 ring-[#FFFDF9]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-temple text-xs sm:text-sm font-bold text-[#3B2A1E]">
                      {PLACEHOLDER_ASTROLOGER.displayName}
                    </span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#E8A33D] fill-[#E8A33D]/20 shrink-0" />
                  </div>
                  <p className="text-[11px] text-[#6E5545] font-body">
                    Baidyanath Dham Lineage • 20+ Yrs Experience
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-1 rounded-full bg-[#EDF3EB] px-2 py-0.5 text-[10px] font-bold text-[#6B8E5A] border border-[#6B8E5A]/30">
                <span className="h-1.5 w-1.5 rounded-full bg-[#6B8E5A] animate-pulse" />
                <span>Available Now</span>
              </div>
            </div>

            {/* Chat Messages Preview (Realistic, Fresh 3-Message Q&A Exchange) */}
            <div className="space-y-2 text-xs font-body">
              {/* Bubble 1: Seeker Consultation Query */}
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-[#7B2D26] px-3.5 py-2 text-[#FFFDF9] shadow-xs">
                  <p className="leading-relaxed">
                    Pranam Acharya Ji. I am experiencing prolonged career stagnation. Should I switch jobs or focus on business in 2026?
                  </p>
                  <span className="mt-0.5 block text-right text-[10px] text-[#FBF3E7]/70">
                    10:24 AM
                  </span>
                </div>
              </div>

              {/* Bubble 2: Acharya Niraj Kumar Vedic Insight */}
              <div className="flex justify-start">
                <div className="max-w-[88%] rounded-2xl rounded-tl-xs bg-[#FFFDF9] border border-[#E8D8C3] px-3.5 py-2 text-[#3B2A1E] shadow-xs">
                  <p className="leading-relaxed">
                    Namaskar! Your 10th lord and Saturn transit indicate a crucial karmic turning point. Let us analyze your D1 &amp; D9 charts together to time your breakthrough window.
                  </p>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-[#6E5545]">
                    <span className="font-semibold text-[#7B2D26]">Verified Vedic Scholar</span>
                    <span>10:25 AM</span>
                  </div>
                </div>
              </div>

              {/* Bubble 3: Seeker Confirmation */}
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-tr-xs bg-[#7B2D26] px-3.5 py-1.5 text-[#FFFDF9] shadow-xs">
                  <p className="leading-relaxed text-[11px]">
                    Understood Acharya Ji. Ready with my exact birth time and Kundli details.
                  </p>
                  <span className="mt-0.5 block text-right text-[9px] text-[#FBF3E7]/70">
                    10:25 AM
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Consultation Topics */}
            <div className="pt-1 flex flex-wrap gap-1.5 text-[10px] font-medium text-[#7B2D26] font-body">
              <span className="rounded-md bg-[#FFFDF9] border border-[#E8D8C3] px-2 py-0.5">
                💼 Career &amp; Job
              </span>
              <span className="rounded-md bg-[#FFFDF9] border border-[#E8D8C3] px-2 py-0.5">
                💍 Kundli Milan
              </span>
              <span className="rounded-md bg-[#FFFDF9] border border-[#E8D8C3] px-2 py-0.5">
                💰 Wealth &amp; Business
              </span>
              <span className="rounded-md bg-[#FFFDF9] border border-[#E8D8C3] px-2 py-0.5">
                🏡 Devta Vastu
              </span>
            </div>
          </div>

          {/* Authentic Solo Practitioner Trust Metrics & Qualitative Community Line */}
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-2 rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] p-2.5 text-center">
              <div className="space-y-0.5">
                <div className="flex items-center justify-center text-[#E8A33D]">
                  <Clock className="h-3.5 w-3.5" />
                </div>
                <div className="font-temple text-xs sm:text-sm font-bold text-[#7B2D26]">20+ Yrs</div>
                <div className="text-[9px] text-[#6E5545] uppercase tracking-wider font-body">Vedic Mastery</div>
              </div>
              <div className="space-y-0.5 border-l border-[#E8D8C3]">
                <div className="flex items-center justify-center text-[#E8A33D]">
                  <Award className="h-3.5 w-3.5" />
                </div>
                <div className="font-temple text-xs sm:text-sm font-bold text-[#7B2D26]">BVB Scholar</div>
                <div className="text-[9px] text-[#6E5545] uppercase tracking-wider font-body">Jyotish Acharya</div>
              </div>
              <div className="space-y-0.5 border-l border-[#E8D8C3]">
                <div className="flex items-center justify-center text-[#E8A33D]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                <div className="font-temple text-xs sm:text-sm font-bold text-[#7B2D26]">100% Solo</div>
                <div className="text-[9px] text-[#6E5545] uppercase tracking-wider font-body">Direct Access</div>
              </div>
              <div className="space-y-0.5 border-l border-[#E8D8C3]">
                <div className="flex items-center justify-center text-[#E8A33D]">
                  <Star className="h-3.5 w-3.5 fill-[#E8A33D]" />
                </div>
                <div className="font-temple text-xs sm:text-sm font-bold text-[#7B2D26]">Private</div>
                <div className="text-[9px] text-[#6E5545] uppercase tracking-wider font-body">Confidential</div>
              </div>
            </div>

            {/* Qualitative Trust Line (Clearly marked pending client confirmation) */}
            <div className="rounded-lg bg-[#FBF3E7]/80 border border-[#E8D8C3] px-3 py-1.5 text-center">
              <p className="text-[11px] font-semibold text-[#7B2D26] font-body">
                Trusted by a growing community across India &amp; abroad
              </p>
              <p className="text-[9px] text-[#6E5545]/70 italic mt-0.5 font-body">
                *Exact seeker count and metrics pending client confirmation
              </p>
            </div>
          </div>

          {/* Transparent 50% Off First-Time Pricing (Pulled Live from ADMIN_CONFIGURABLE_PRICING) */}
          <div className="rounded-xl bg-[#FBF3E7] p-3 border border-[#E8D8C3] space-y-1.5 text-xs font-body">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#7B2D26] text-[11px] uppercase tracking-wider">
                First-Session Rates ({FIRST_CONSULTATION_OFFER.discountPercentage}% Off)
              </span>
              <span className="rounded-md bg-[#7B2D26]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#7B2D26]">
                Code: {FIRST_CONSULTATION_OFFER.code}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#E8D8C3]/80 text-[11px] font-medium text-[#3B2A1E] text-center">
              <div>
                Chat:{" "}
                <span className="font-bold text-[#7B2D26]">
                  {ADMIN_CONFIGURABLE_PRICING.chat.currency}{ADMIN_CONFIGURABLE_PRICING.chat.effectiveFirstTimeRate}/{ADMIN_CONFIGURABLE_PRICING.chat.unit}
                </span>{" "}
                <span className="line-through text-[#6E5545]/70 text-[10px]">
                  {ADMIN_CONFIGURABLE_PRICING.chat.currency}{ADMIN_CONFIGURABLE_PRICING.chat.ratePerMinute}
                </span>
              </div>
              <div className="border-l border-[#E8D8C3] pl-1.5">
                Call:{" "}
                <span className="font-bold text-[#7B2D26]">
                  {ADMIN_CONFIGURABLE_PRICING.voice.currency}{ADMIN_CONFIGURABLE_PRICING.voice.effectiveFirstTimeRate}/{ADMIN_CONFIGURABLE_PRICING.voice.unit}
                </span>{" "}
                <span className="line-through text-[#6E5545]/70 text-[10px]">
                  {ADMIN_CONFIGURABLE_PRICING.voice.currency}{ADMIN_CONFIGURABLE_PRICING.voice.ratePerMinute}
                </span>
              </div>
              <div className="border-l border-[#E8D8C3] pl-1.5">
                Video:{" "}
                <span className="font-bold text-[#7B2D26]">
                  {ADMIN_CONFIGURABLE_PRICING.video.currency}{ADMIN_CONFIGURABLE_PRICING.video.effectiveFirstTimeRate}/{ADMIN_CONFIGURABLE_PRICING.video.unit}
                </span>{" "}
                <span className="line-through text-[#6E5545]/70 text-[10px]">
                  {ADMIN_CONFIGURABLE_PRICING.video.currency}{ADMIN_CONFIGURABLE_PRICING.video.ratePerMinute}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons in Temple Brand Colors */}
          <div className="space-y-2 pt-1 font-body">
            <Link
              href={`/consult?offer=${FIRST_CONSULTATION_OFFER.code}`}
              onClick={handleDismiss}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#7B2D26] hover:bg-[#64221C] py-3.5 px-6 font-bold text-[#FFFDF9] shadow-md hover:shadow-lg border border-[#E8A33D]/40 transition-all focus:outline-hidden focus:ring-2 focus:ring-[#7B2D26] focus:ring-offset-2 cursor-pointer"
            >
              <span>Claim 50% Off &amp; Start Consultation</span>
              <ArrowRight className="h-4 w-4 text-[#E8A33D]" />
            </Link>

            <div className="text-center">
              <button
                type="button"
                onClick={handleDismiss}
                className="text-xs text-[#6E5545] hover:text-[#7B2D26] underline underline-offset-4 font-medium transition-colors cursor-pointer"
              >
                No thanks, continue browsing
              </button>
            </div>
          </div>

          {/* Subordinate Secondary Education Line & Footer Guarantee */}
          <div className="border-t border-[#E8D8C3]/80 pt-2.5 space-y-1.5 text-center font-body">
            <p className="text-[11px] text-[#6E5545]">
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
            <div className="flex items-center justify-center gap-1 text-[10px] text-[#6E5545]/80">
              <ShieldCheck className="h-3 w-3 text-[#6B8E5A]" />
              <span>Promo code {FIRST_CONSULTATION_OFFER.code} auto-applied • Authentic Vedic Ephemeris</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
