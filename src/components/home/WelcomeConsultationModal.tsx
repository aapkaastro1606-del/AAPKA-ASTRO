"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, ArrowRight } from "lucide-react";
import { DiyaIcon } from "@/components/ui/DiyaIcon";
import { PLACEHOLDER_ASTROLOGER, ADMIN_CONFIGURABLE_PRICING, FIRST_CONSULTATION_OFFER, isNavratriPromoActive } from "@/config/placeholderContent";
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
    if (isNavratriPromoActive(AdminStore.getPricing().navratriPromo)) {
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

      // Schedule display for first visit in this session
      const timer = setTimeout(() => {
        if (
          !isRouteExcludedFromWelcomeModal(pathname) &&
          !isUserInActiveSessionOrConsultation(isAuthenticated, pathname)
        ) {
          setIsOpen(true);
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
      data-testid="welcome-consultation-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3B2A1E]/75 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
    >
      {/* Backdrop overlay dismiss - clicking dismisses without blocking */}
      <div
        className="fixed inset-0 cursor-pointer"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Compact Single-Screen Modal Card in Aapka Astro's Temple Brand System */}
      <div
        data-testid="welcome-modal-card"
        className="relative w-full max-w-md overflow-hidden rounded-2xl border-2 border-[#E8D8C3] bg-[#FFFDF9] text-[#3B2A1E] font-body shadow-2xl z-10 transition-all transform animate-in zoom-in-95 duration-200"
      >
        {/* Top Decorative Border Accent in Brand Maroon & Gold */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#7B2D26] via-[#E8A33D] to-[#7B2D26]" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-3.5 top-3.5 z-20 rounded-full bg-[#FBF3E7]/90 backdrop-blur-xs p-1.5 text-[#6E5545] hover:bg-[#E8D8C3] hover:text-[#7B2D26] transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#7B2D26] cursor-pointer shadow-xs"
          aria-label="Close welcome offer modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Ambient Warm Golden Aura Glow in Background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 h-44 w-72 rounded-full bg-gradient-to-b from-[#E8A33D]/25 via-[#E8A33D]/10 to-transparent blur-2xl"
        />

        <div className="relative px-6 py-6 sm:px-8 sm:py-7 text-center space-y-3.5">
          {/* 1. Small Logo / Brand Mark with Golden Ornamental Flankers */}
          <div className="flex items-center justify-center gap-2">
            <span className="h-px w-6 bg-gradient-to-r from-transparent to-[#E8A33D]" aria-hidden="true" />
            <div className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E8A33D]/60 bg-gradient-to-r from-[#FBF3E7] via-[#FFFDF9] to-[#FBF3E7] px-3.5 py-1 text-[11px] font-bold text-[#7B2D26] shadow-xs">
              <img src="/images/logo-icon.png" alt="Aapka Astro" className="h-4 w-4 object-contain" />
              <span className="font-temple tracking-widest uppercase">Aapka Astro</span>
            </div>
            <span className="h-px w-6 bg-gradient-to-l from-transparent to-[#E8A33D]" aria-hidden="true" />
          </div>

          {/* Acharya Niraj Kumar Visual Portrait Anchor & Auspicious Emblem */}
          <div className="relative mx-auto flex items-center justify-center pt-1">
            <div className="relative h-18 w-18 rounded-full p-0.5 bg-gradient-to-tr from-[#7B2D26] via-[#E8A33D] to-[#7B2D26] shadow-md">
              <div className="relative h-full w-full rounded-full overflow-hidden border-2 border-[#FFFDF9] bg-[#FBF3E7]">
                <img
                  src={PLACEHOLDER_ASTROLOGER.avatarUrl}
                  alt={PLACEHOLDER_ASTROLOGER.displayName}
                  className="h-full w-full object-cover object-top"
                />
              </div>
            </div>
            {/* Auspicious Diya Accent Tag */}
            <div
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#7B2D26] to-[#96372E] border border-[#E8A33D] shadow-sm"
              title="Auspicious Guidance"
            >
              <DiyaIcon size={13} className="text-[#E8A33D]" />
            </div>
          </div>

          {/* 2. Headline */}
          <h2
            id="welcome-modal-title"
            data-testid="welcome-modal-title"
            className="font-temple text-xl sm:text-2xl font-black text-[#7B2D26] tracking-tight leading-snug drop-shadow-xs"
          >
            50% Off Your First Consultation
          </h2>

          {/* 3. One Short Line of Subtext (One Sentence) */}
          <p className="text-xs sm:text-sm text-[#3B2A1E]/90 font-body leading-relaxed max-w-sm mx-auto">
            Consult 1-on-1 with {PLACEHOLDER_ASTROLOGER.displayName} via private chat, call, or video for Flat {ADMIN_CONFIGURABLE_PRICING.chat.currency}{ADMIN_CONFIGURABLE_PRICING.chat.effectiveFirstTimeRate} (Regular ₹2,100).
          </p>

          {/* 4. Single Small Line of Trust Phrase (Not a Boxed Section) */}
          <p
            data-testid="welcome-modal-trust-line"
            className="text-xs font-semibold text-[#6E5545] font-body tracking-wide"
          >
            20+ years · Certified Jyotish Acharya
          </p>

          {/* 5. One Primary CTA Button with Radiant Temple Styling */}
          <div className="pt-1.5">
            <Link
              href={`/consult?offer=${FIRST_CONSULTATION_OFFER.code}`}
              onClick={handleDismiss}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#7B2D26] via-[#8D342C] to-[#7B2D26] hover:from-[#6B241E] hover:to-[#6B241E] py-3.5 px-5 text-sm font-bold text-[#FFFDF9] shadow-md hover:shadow-xl border border-[#E8A33D]/60 transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-[#7B2D26] focus:ring-offset-2 cursor-pointer"
            >
              {/* Shimmer sweep effect */}
              <span
                aria-hidden="true"
                className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent"
              />
              <span className="relative z-10 tracking-wide">Claim 50% Off &amp; Start Consultation</span>
              <ArrowRight className="relative z-10 h-4 w-4 text-[#E8A33D] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* 6. One Small Dismiss Link Below the Button */}
          <div className="pt-0.5">
            <button
              type="button"
              onClick={handleDismiss}
              className="text-xs text-[#6E5545] hover:text-[#7B2D26] underline underline-offset-4 font-medium transition-colors cursor-pointer"
            >
              No thanks, continue browsing
            </button>
          </div>

          {/* 7. Small Cross-Link to Viar.in as the Very Last Line in Small Subdued Text */}
          <p
            data-testid="welcome-modal-viar-link"
            className="pt-1.5 text-[11px] text-[#6E5545]/80 font-body border-t border-[#E8D8C3]/60"
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
      </div>
    </div>
  );
}
