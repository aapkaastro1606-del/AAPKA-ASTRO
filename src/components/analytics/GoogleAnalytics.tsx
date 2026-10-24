"use client";

import React, { useEffect, useState, useCallback } from "react";
import Script from "next/script";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Cookie, X, Check } from "lucide-react";
import {
  CONSENT_STORAGE_KEY,
  ConsentStatus,
  getCookieConsent,
  isRouteExcluded,
  isStaffOrOwnerUser,
} from "@/lib/analytics/trackEvent";
import { sanitizeUrl } from "@/lib/analytics/piiSanitizer";
import { useLanguage } from "@/context/LanguageContext";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleAnalytics() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const [consent, setConsent] = useState<ConsentStatus>("undecided");
  const [showBanner, setShowBanner] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Initialize consent state and banner visibility
  useEffect(() => {
    const current = getCookieConsent();
    setConsent(current);

    if (current === "undecided") {
      // Don't show immediately on sensitive admin/dashboard routes
      if (!isRouteExcluded(pathname)) {
        setShowBanner(true);
      }
    } else if (current === "granted" && GA_ID) {
      setScriptLoaded(true);
    }

    // Listen for manual preference trigger (e.g. from Cookie Notice page)
    const handleReopen = () => {
      setShowBanner(true);
    };

    window.addEventListener("aapka:open-cookie-preferences", handleReopen);
    return () => {
      window.removeEventListener("aapka:open-cookie-preferences", handleReopen);
    };
  }, [pathname]);

  // Handle user granting consent
  const handleAccept = useCallback(() => {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, "granted");
    } catch {}

    setConsent("granted");
    setShowBanner(false);

    // Update Google Consent Mode v2
    const w = window as any;
    if (typeof w.gtag === "function") {
      w.gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
    }

    if (GA_ID) {
      setScriptLoaded(true);
    }
  }, []);

  // Handle user rejecting consent (Strictly NO analytics cookies, NO requests)
  const handleReject = useCallback(() => {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, "denied");
    } catch {}

    setConsent("denied");
    setShowBanner(false);

    // Update Google Consent Mode v2 to denied
    const w = window as any;
    if (typeof w.gtag === "function") {
      w.gtag("consent", "update", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
    }
  }, []);

  // Track page views on route changes when consent is granted
  useEffect(() => {
    if (consent !== "granted" || !GA_ID) return;
    if (isRouteExcluded(pathname) || isStaffOrOwnerUser()) return;

    const w = window as any;
    if (typeof w.gtag === "function") {
      w.gtag("event", "page_view", {
        page_path: sanitizeUrl(pathname),
        page_location: sanitizeUrl(window.location.href),
      });
    }
  }, [pathname, consent]);

  // If GA_ID is not configured, don't show GA banner or inject scripts
  const isGaConfigured = Boolean(GA_ID && GA_ID.trim().length > 0);

  return (
    <>
      {/* 1. Google Consent Mode v2 Bootstrap (Runs immediately with everything DENIED by default) */}
      <Script
        id="google-consent-mode-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            
            // Everything denied by default (Consent Mode v2)
            gtag('consent', 'default', {
              'analytics_storage': 'denied',
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'wait_for_update': 500
            });
            
            // Check stored preference
            try {
              var storedConsent = localStorage.getItem('${CONSENT_STORAGE_KEY}');
              if (storedConsent === 'granted') {
                gtag('consent', 'update', {
                  'analytics_storage': 'granted'
                });
              }
            } catch(e) {}
          `,
        }}
      />

      {/* 2. Load Google Analytics 4 Script ONLY if GA_ID exists AND user has granted consent */}
      {isGaConfigured && scriptLoaded && consent === "granted" && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script
            id="google-analytics-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  anonymize_ip: true,
                  send_page_view: false // We handle pageviews manually to scrub PII and exclude routes
                });
              `,
            }}
          />
        </>
      )}

      {/* 3. Cookie Consent Banner (English and Hindi, equally prominent Accept and Reject buttons) */}
      {isGaConfigured && showBanner && !isRouteExcluded(pathname) && (
        <aside
          role="dialog"
          aria-label="Cookie consent banner"
          className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-4 sm:p-5 shadow-2xl text-[#3B2A1E] animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-[#7B2D26]/10 p-2 text-[#7B2D26] shrink-0">
              <Cookie className="h-5 w-5" />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-temple text-sm font-bold text-[#7B2D26] flex items-center gap-1.5">
                  <span>Privacy &amp; Analytics Consent</span>
                  <span className="text-[10px] text-[#6E5545] font-sans font-normal">
                    (कुकी सहमति)
                  </span>
                </h3>
              </div>

              {/* Bilingual concise copy */}
              <p className="text-xs text-[#6E5545] leading-relaxed">
                {language === "hi" ? (
                  <>
                    हम डिफ़ॉल्ट रूप से कुकी-रहित मेट्रिक्स का उपयोग करते हैं। आपकी अनुमति से, Google Analytics हमें विज़िटर अनुभव को समझने में मदद करता है। हम कभी भी आपके व्यक्तिगत विवरण, फ़ोन नंबर या जन्म कुंडली को ट्रैक नहीं करते हैं।
                  </>
                ) : (
                  <>
                    We use cookieless performance metrics by default. With your consent, Google Analytics helps us understand site traffic. We strictly never track personal names, phone numbers, UTRs, or birth charts.
                  </>
                )}
              </p>

              <div className="text-[11px] text-[#6E5545] flex items-center gap-2 pt-0.5">
                <Link
                  href="/privacy-policy"
                  className="underline hover:text-[#7B2D26] font-medium"
                >
                  Privacy Policy
                </Link>
                <span>&bull;</span>
                <Link
                  href="/cookie-policy"
                  className="underline hover:text-[#7B2D26] font-medium"
                >
                  Cookie Notice
                </Link>
              </div>

              {/* Equally Prominent Accept and Reject Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleReject}
                  className="w-full py-2.5 px-3 rounded-xl border-2 border-[#7B2D26] bg-[#FFFDF9] hover:bg-[#FBF3E7] text-[#7B2D26] font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>{language === "hi" ? "अस्वीकार करें" : "Reject"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleAccept}
                  className="w-full py-2.5 px-3 rounded-xl border-2 border-[#7B2D26] bg-[#7B2D26] hover:bg-[#64221C] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>{language === "hi" ? "स्वीकार करें" : "Accept"}</span>
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
