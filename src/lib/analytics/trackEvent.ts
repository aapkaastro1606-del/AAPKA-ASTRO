"use client";

import { sanitizeEventParams, sanitizeUrl } from "./piiSanitizer";

export const CONSENT_STORAGE_KEY = "aapka_cookie_consent";

export type ConsentStatus = "granted" | "denied" | "undecided";

/**
 * Routes that must NEVER be tracked by analytics.
 */
export const EXCLUDED_ROUTE_PREFIXES = [
  "/admin",
  "/dashboard",
  "/instructor",
  "/account",
];

/**
 * Checks whether the current path is in the excluded routes list.
 */
export function isRouteExcluded(pathname?: string): boolean {
  if (!pathname && typeof window !== "undefined") {
    pathname = window.location.pathname;
  }
  if (!pathname) return false;

  const normalized = pathname.toLowerCase();
  return EXCLUDED_ROUTE_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`)
  );
}

/**
 * Checks whether the current user is an Owner or Staff member who should not be tracked.
 */
export function isStaffOrOwnerUser(userEmail?: string | null, userRole?: string | null): boolean {
  if (userEmail && userEmail.toLowerCase() === "aapkaastro1606@gmail.com") {
    return true;
  }
  if (userRole) {
    const roleUpper = userRole.toUpperCase();
    if (["OWNER", "STAFF", "ADMIN", "ASTROLOGER", "INSTRUCTOR"].includes(roleUpper)) {
      return true;
    }
  }
  // Check client-side cached indicator if available
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("aapka_user_role");
      if (cached && ["OWNER", "STAFF", "ADMIN", "ASTROLOGER", "INSTRUCTOR"].includes(cached.toUpperCase())) {
        return true;
      }
    } catch {}
  }
  return false;
}

/**
 * Returns current cookie consent status ('granted' | 'denied' | 'undecided').
 */
export function getCookieConsent(): ConsentStatus {
  if (typeof window === "undefined") return "undecided";
  try {
    const val = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (val === "granted" || val === "denied") {
      return val;
    }
  } catch {}
  return "undecided";
}

/**
 * Dispatches an event to Google Analytics (gtag) with strict privacy checks:
 * 1. Verifies user has granted analytics consent
 * 2. Verifies current path is not excluded (/admin, /dashboard, /instructor, /account)
 * 3. Verifies user is not an Owner or Staff member
 * 4. Strips all PII (email, phone, UTR, name, booking ID) from parameters
 */
export function trackEvent(eventName: string, params?: Record<string, any>): boolean {
  if (typeof window === "undefined") return false;

  // 1. Consent Gate: If not granted, zero analytics requests
  if (getCookieConsent() !== "granted") {
    return false;
  }

  // 2. Route Exclusions: Do not track /admin, /dashboard, /instructor, /account
  if (isRouteExcluded()) {
    return false;
  }

  // 3. User Exclusions: Do not track Owner or Staff
  if (isStaffOrOwnerUser()) {
    return false;
  }

  // 4. Ensure gtag is loaded
  const w = window as any;
  if (typeof w.gtag !== "function") {
    return false;
  }

  // 5. Deeply sanitize parameters (no names, phones, emails, UTRs, or booking IDs)
  const safeParams = sanitizeEventParams(params || {});
  safeParams.page_location = sanitizeUrl(window.location.href);
  safeParams.page_path = sanitizeUrl(window.location.pathname);

  try {
    w.gtag("event", eventName, safeParams);
    return true;
  } catch (err) {
    console.warn("[Analytics] Event dispatch failed:", err);
    return false;
  }
}

/* ==============================================================================
 * Master Event Helpers (documented in docs/ANALYTICS.md)
 * ============================================================================== */

/**
 * Click on WhatsApp button or link
 */
export function trackWhatsAppClick(placement: string = "unknown") {
  return trackEvent("click_whatsapp", {
    placement: sanitizeEventParams({ val: placement }).val,
    channel: "whatsapp",
  });
}

/**
 * Click on telephone / call link
 */
export function trackCallClick(placement: string = "unknown") {
  return trackEvent("click_call", {
    placement: sanitizeEventParams({ val: placement }).val,
    channel: "phone",
  });
}

/**
 * Chatbot assistant widget opened by visitor
 */
export function trackChatbotOpened() {
  return trackEvent("chatbot_opened", {
    interface: "floating_assistant",
  });
}

/**
 * Language switched between English and Hindi
 */
export function trackLanguageSwitched(targetLang: "en" | "hi") {
  return trackEvent("language_switched", {
    target_lang: targetLang,
  });
}

/**
 * Contact form submitted (strictly no PII passed)
 */
export function trackContactFormSent(topic: string = "general") {
  return trackEvent("contact_form_sent", {
    topic: sanitizeEventParams({ topic }).topic,
  });
}

/**
 * Course or educational page viewed
 */
export function trackCoursePageViewed(courseTitle: string = "general") {
  return trackEvent("course_page_viewed", {
    course_title: sanitizeEventParams({ courseTitle }).courseTitle,
  });
}

/**
 * Aapka Astro: Free Kundli horoscope generated
 */
export function trackFreeKundliGenerated(hasDasha: boolean = true) {
  return trackEvent("free_kundli_generated", {
    calculation_engine: "vedic_ephemeris",
    has_dasha: hasDasha,
  });
}

/**
 * Aapka Astro: Consultation booking started (modal opened or format picked)
 */
export function trackBookingStarted(productType: "astro" | "vaastu", format: string = "STANDARD") {
  return trackEvent("booking_started", {
    product_type: productType,
    format: sanitizeEventParams({ format }).format,
  });
}

/**
 * Aapka Astro: Payment claimed (UTR submitted). Strictly NO UTR passed.
 */
export function trackPaymentClaimed(
  productType: "astro" | "vaastu" | "kundli_pdf",
  amount: number
) {
  return trackEvent("payment_claimed", {
    product_type: productType,
    amount: Number(amount) || 0,
    currency: "INR",
  });
}

/**
 * Viar compatibility: Enrolment started
 */
export function trackEnrolmentStarted(courseId: string = "general") {
  return trackEvent("enrolment_started", {
    course_id: sanitizeEventParams({ courseId }).courseId,
  });
}

/**
 * DOW compatibility: Enquiry via WhatsApp or Phone
 */
export function trackEnquiry(channel: "whatsapp" | "call") {
  if (channel === "whatsapp") {
    return trackEvent("enquiry_whatsapp", { channel: "whatsapp" });
  } else {
    return trackEvent("enquiry_call", { channel: "call" });
  }
}
