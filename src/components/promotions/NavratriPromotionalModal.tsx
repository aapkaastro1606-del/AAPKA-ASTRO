"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Flame } from "lucide-react";
import {
  isNavratriPromoActive,
  DEFAULT_NAVRATRI_PROMO_CONFIG,
  NavratriPromoConfig,
} from "@/config/placeholderContent";
import { AdminStore } from "@/lib/store/adminStore";
import { useCurrentUserRole } from "@/lib/auth/roleContext";
import {
  isRouteExcludedFromWelcomeModal,
  isUserInActiveSessionOrConsultation,
} from "@/components/home/WelcomeConsultationModal";

export const NAVRATRI_PROMO_STORAGE_KEY = "aapka_navratri_promo_dismissed";
export const NAVRATRI_PROMO_SESSION_KEY = "aapka_navratri_promo_session_seen";
export const NAVRATRI_PROMO_COOKIE_NAME = "aapka_navratri_promo_seen";

interface NavratriPromotionalModalProps {
  /** Optional delay in milliseconds before displaying the modal on first visit. Default: 1800ms */
  delayMs?: number;
  /** Force open for preview/testing purposes */
  forceOpen?: boolean;
  /** Optional reference date for simulating calendar dates in tests */
  referenceDate?: Date;
}

export function NavratriPromotionalModal({
  delayMs = 1800,
  forceOpen = false,
  referenceDate,
}: NavratriPromotionalModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [promoConfig, setPromoConfig] = useState<NavratriPromoConfig>(() => {
    return AdminStore.getPricing().navratriPromo || DEFAULT_NAVRATRI_PROMO_CONFIG;
  });
  const pathname = usePathname();
  const { isAuthenticated } = useCurrentUserRole();

  // Listen for admin pricing / promo updates in real-time
  useEffect(() => {
    const handlePromoUpdated = () => {
      const current = AdminStore.getPricing().navratriPromo || DEFAULT_NAVRATRI_PROMO_CONFIG;
      setPromoConfig({ ...current });
    };
    window.addEventListener("astro_promo_updated", handlePromoUpdated);
    window.addEventListener("astro_pricing_updated", handlePromoUpdated);
    return () => {
      window.removeEventListener("astro_promo_updated", handlePromoUpdated);
      window.removeEventListener("astro_pricing_updated", handlePromoUpdated);
    };
  }, []);

  useEffect(() => {
    setMounted(true);

    if (forceOpen) {
      setIsOpen(true);
      return;
    }

    // 1. Promotional Window Check: Must be currently enabled and within active date window
    if (!isNavratriPromoActive(promoConfig, referenceDate)) {
      setIsOpen(false);
      return;
    }

    // 2. Route Check: Suppress on operating consoles & active booking flow
    if (isRouteExcludedFromWelcomeModal(pathname)) {
      setIsOpen(false);
      return;
    }

    // 3. Active Session / Mid-Consultation Check: Suppress if seeker is logged in or mid-session
    if (isUserInActiveSessionOrConsultation(isAuthenticated, pathname)) {
      setIsOpen(false);
      return;
    }

    // 4. Visitor Session Check: Show once per visitor per browser session
    try {
      const isSeenInSession = sessionStorage.getItem(NAVRATRI_PROMO_SESSION_KEY);
      if (isSeenInSession) {
        return;
      }

      const timer = setTimeout(() => {
        if (
          isNavratriPromoActive(promoConfig, referenceDate) &&
          !isRouteExcludedFromWelcomeModal(pathname) &&
          !isUserInActiveSessionOrConsultation(isAuthenticated, pathname)
        ) {
          setIsOpen(true);
          try {
            sessionStorage.setItem(NAVRATRI_PROMO_SESSION_KEY, "true");
            document.cookie = `${NAVRATRI_PROMO_COOKIE_NAME}=1; path=/; SameSite=Lax`;
          } catch {
            // Ignore storage restrictions
          }
        }
      }, delayMs);

      return () => clearTimeout(timer);
    } catch {
      // Storage access blocked or restricted
    }
  }, [delayMs, forceOpen, pathname, isAuthenticated, promoConfig, referenceDate]);

  const handleDismiss = useCallback(() => {
    setIsOpen(false);
    try {
      localStorage.setItem(NAVRATRI_PROMO_STORAGE_KEY, "true");
      sessionStorage.setItem(NAVRATRI_PROMO_SESSION_KEY, "true");
      document.cookie = `${NAVRATRI_PROMO_COOKIE_NAME}=1; path=/; SameSite=Lax`;
    } catch {
      // Ignore storage restrictions
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

  // If not mounted or closed, return null so layout is completely unblocked
  if (!mounted || !isOpen) return null;

  const headline = promoConfig.headline || DEFAULT_NAVRATRI_PROMO_CONFIG.headline;
  const subheadline = promoConfig.subheadline || DEFAULT_NAVRATRI_PROMO_CONFIG.subheadline;
  const blessingDescription =
    promoConfig.blessingDescription || DEFAULT_NAVRATRI_PROMO_CONFIG.blessingDescription;
  const applicabilityNote =
    promoConfig.applicabilityNote || DEFAULT_NAVRATRI_PROMO_CONFIG.applicabilityNote;
  const ctaText = promoConfig.ctaText || DEFAULT_NAVRATRI_PROMO_CONFIG.ctaText;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="navratri-promo-title"
      data-testid="navratri-promo-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3B2A1E]/80 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
    >
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 cursor-pointer"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        data-testid="navratri-promo-card"
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border-2 border-[#E8A33D] bg-[#FFFDF9] text-[#3B2A1E] font-body shadow-2xl z-10 transition-all transform animate-in zoom-in-95 duration-200"
      >
        {/* Top Decorative Border in Brand Maroon & Gold */}
        <div className="h-2 w-full bg-gradient-to-r from-[#7B2D26] via-[#E8A33D] to-[#7B2D26]" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-3.5 top-3.5 z-20 rounded-full bg-[#FBF3E7]/90 backdrop-blur-xs p-1.5 text-[#6E5545] hover:bg-[#E8D8C3] hover:text-[#7B2D26] transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#7B2D26] cursor-pointer shadow-xs"
          aria-label="Close festive offer popup"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Ambient Warm Golden Aura Glow in Background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 h-52 w-80 rounded-full bg-gradient-to-b from-[#E8A33D]/30 via-[#E8A33D]/10 to-transparent blur-2xl"
        />

        <div className="relative px-6 py-6 sm:px-8 sm:py-7 text-center space-y-4">
          {/* Festive Badge with Golden Flankers */}
          <div className="flex items-center justify-center gap-2">
            <span className="h-px w-5 bg-gradient-to-r from-transparent to-[#E8A33D]" aria-hidden="true" />
            <div className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E8A33D]/70 bg-gradient-to-r from-[#FBF3E7] via-[#FFFDF9] to-[#FBF3E7] px-4 py-1.5 text-[11px] font-bold text-[#7B2D26] shadow-xs">
              <Flame className="h-3.5 w-3.5 text-[#E8A33D] fill-[#E8A33D]" />
              <span className="font-temple tracking-wider uppercase">
                Navratri Mahotsav • Sacred Festive Gift
              </span>
              <Sparkles className="h-3.5 w-3.5 text-[#E8A33D]" />
            </div>
            <span className="h-px w-5 bg-gradient-to-l from-transparent to-[#E8A33D]" aria-hidden="true" />
          </div>

          {/* Sacred Rudraksh Visual Anchor with Glowing Double Ring & Diya accents */}
          <div className="relative mx-auto flex items-center justify-center">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#7B2D26] via-[#96372E] to-[#E8A33D] text-[#FFFDF9] shadow-lg border-2 border-[#E8A33D]/70 ring-4 ring-[#E8A33D]/20">
              <div className="absolute inset-1 rounded-full border border-[#E8A33D]/40 border-dashed" />
              <span className="font-temple text-3xl font-black tracking-wider text-[#FFFDF9] drop-shadow-sm">
                ॐ
              </span>
            </div>
            {/* Auspicious Consecrated Tag */}
            <div className="absolute -bottom-2 inline-flex items-center gap-1 rounded-full bg-[#7B2D26] px-2.5 py-0.5 text-[10px] font-bold text-[#E8A33D] border border-[#E8A33D] shadow-xs">
              <ShieldCheck className="h-3 w-3 text-[#E8A33D]" />
              <span>Abhimantrit</span>
            </div>
          </div>

          {/* Headline - verbatim per client prompt */}
          <h2
            id="navratri-promo-title"
            data-testid="navratri-promo-title"
            className="font-temple text-xl sm:text-2xl font-black text-[#7B2D26] tracking-tight leading-snug px-1 drop-shadow-xs pt-1"
          >
            {headline}
          </h2>

          {/* Subheadline & Festive Description */}
          <div className="space-y-1.5 max-w-md mx-auto">
            <p className="text-xs font-bold text-[#96372E] uppercase tracking-wide">
              {subheadline}
            </p>
            <p className="text-xs sm:text-sm text-[#3B2A1E]/90 leading-relaxed font-body">
              {blessingDescription}
            </p>
          </div>

          {/* Applicability Card */}
          <div
            data-testid="navratri-promo-applicability"
            className="rounded-xl border border-[#E8A33D]/50 bg-[#FBF3E7]/90 p-4 text-left text-xs text-[#3B2A1E] space-y-2.5 shadow-xs"
          >
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#6B8E5A] shrink-0 mt-0.5" />
              <p className="font-bold text-[#7B2D26] leading-tight">
                {applicabilityNote}
              </p>
            </div>
            <ul className="text-[11px] text-[#6E5545] space-y-1.5 pl-6 list-disc">
              <li>
                <strong>Vedic Astro Consultation:</strong> ₹1,051 first-time rate (₹2,100 standard).
              </li>
              <li>
                <strong>Vaastu Consultation:</strong> ₹15,000 standing promotional fee (₹25,000 regular).
              </li>
              <li>
                Rudraksh is sanctified in seeker&apos;s name and dispatched following your session.
              </li>
            </ul>
          </div>

          {/* Primary CTA with Shimmer & Radiant Gradient */}
          <div className="pt-1.5">
            <Link
              href="/consult"
              data-testid="navratri-promo-cta"
              onClick={handleDismiss}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#7B2D26] via-[#8D342C] to-[#7B2D26] hover:from-[#6B241E] hover:to-[#6B241E] py-3.5 px-6 text-sm font-bold text-[#FFFDF9] shadow-md hover:shadow-xl border border-[#E8A33D]/60 transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-[#7B2D26] focus:ring-offset-2 cursor-pointer"
            >
              {/* Shimmer sweep effect */}
              <span
                aria-hidden="true"
                className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent"
              />
              <span className="relative z-10 tracking-wide">{ctaText}</span>
              <ArrowRight className="relative z-10 h-4 w-4 text-[#E8A33D] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Dismiss Action */}
          <div className="pt-0.5">
            <button
              type="button"
              onClick={handleDismiss}
              className="text-xs text-[#6E5545] hover:text-[#7B2D26] underline underline-offset-4 font-medium transition-colors cursor-pointer"
            >
              Maybe later, continue browsing
            </button>
          </div>

          {/* Credential Reassurance */}
          <p className="pt-1 text-[11px] text-[#6E5545]/80 font-body border-t border-[#E8D8C3]/60">
            Conducted by Acharya Niraj Kumar · 20+ Years Lineage · 15,000+ Consultations
          </p>
        </div>
      </div>
    </div>
  );
}
