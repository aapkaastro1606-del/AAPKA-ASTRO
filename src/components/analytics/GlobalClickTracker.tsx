"use client";

import { useEffect } from "react";
import { trackWhatsAppClick, trackCallClick, isRouteExcluded, isStaffOrOwnerUser } from "@/lib/analytics/trackEvent";

/**
 * Global click delegator that automatically tracks WhatsApp and Call clicks
 * across all pages without intrusive manual bindings on every anchor tag.
 */
export function GlobalClickTracker() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Find closest anchor tag
      const target = (e.target as HTMLElement)?.closest?.("a") as HTMLAnchorElement | null;
      if (!target || !target.href) return;

      // Exclude admin/staff
      if (isRouteExcluded(window.location.pathname) || isStaffOrOwnerUser()) {
        return;
      }

      const href = target.href.toLowerCase();

      // Check WhatsApp links
      if (href.startsWith("https://wa.me") || href.includes("whatsapp.com") || href.startsWith("whatsapp://")) {
        // Derive placement context from data attribute or parent container
        const placement =
          target.getAttribute("data-analytics-placement") ||
          target.closest("[data-section]")?.getAttribute("data-section") ||
          (target.closest("header") ? "header" : "") ||
          (target.closest("footer") ? "footer" : "") ||
          (target.closest("nav") ? "nav" : "") ||
          "body";

        trackWhatsAppClick(placement);
      }

      // Check Phone Call links
      if (href.startsWith("tel:")) {
        const placement =
          target.getAttribute("data-analytics-placement") ||
          target.closest("[data-section]")?.getAttribute("data-section") ||
          (target.closest("header") ? "header" : "") ||
          (target.closest("footer") ? "footer" : "") ||
          "body";

        trackCallClick(placement);
      }
    };

    document.addEventListener("click", handleClick, { passive: true });
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return null;
}
