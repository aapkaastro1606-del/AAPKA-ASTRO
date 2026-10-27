import { PlatformSettingsService } from "@/lib/services/platformSettingsService";

export interface LiveSiteData {
  flatFirstConsultationFee: number;
  flatStandardFee: number;
  discountPercentage: number;
  vaastuPromoFee: number;
  vaastuStandardFee: number;
  vaastuDiscountPercentage: number;
  kundliPdfFee: number;
  upiId: string;
  payeeName: string;
  whatsappNumber: string;
  promoCode: string;
  activePromoHeadline?: string;
  timestamp: string;
}

/**
 * Reads live pricing, promotions, and contact info at request time directly from
 * PlatformSettingsService (Neon PostgreSQL).
 * Answers NEVER drift from the site because prices come from here, not static text.
 */
export async function fetchLiveSiteData(): Promise<LiveSiteData> {
  const [pricing, payment] = await Promise.all([
    PlatformSettingsService.getPricing().catch(() => ({
      flatStandardFee: 2100,
      flatFirstConsultationFee: 1051,
      discountPercentage: 50,
      vaastuStandardFee: 25000,
      vaastuPromoFee: 15000,
      vaastuDiscountPercentage: 40,
      kundliPdfFee: 501,
      navratriPromo: null,
    })),
    PlatformSettingsService.getPaymentSettings().catch(() => ({
      upiId: "9310709233m@pnb",
      payeeName: "AAPKA ASTRO",
      whatsappNumber: "+91 93112 15564",
    })),
  ]);

  const navratriActive =
    pricing.navratriPromo?.enabled &&
    Date.now() >= new Date(pricing.navratriPromo.startDate).getTime() &&
    Date.now() <= new Date(pricing.navratriPromo.endDate).getTime();

  return {
    flatFirstConsultationFee: pricing.flatFirstConsultationFee ?? 1051,
    flatStandardFee: pricing.flatStandardFee ?? 2100,
    discountPercentage: pricing.discountPercentage ?? 50,
    vaastuPromoFee: pricing.vaastuPromoFee ?? 15000,
    vaastuStandardFee: pricing.vaastuStandardFee ?? 25000,
    vaastuDiscountPercentage: pricing.vaastuDiscountPercentage ?? 40,
    kundliPdfFee: pricing.kundliPdfFee ?? 501,
    upiId: payment.upiId || "9310709233m@pnb",
    payeeName: payment.payeeName || "AAPKA ASTRO",
    whatsappNumber: payment.whatsappNumber || "+91 93112 15564",
    promoCode: "FIRST1051",
    activePromoHeadline: navratriActive ? pricing.navratriPromo?.headline : undefined,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Formats live site data into an authoritative text snippet for prompt injection.
 */
export function formatLiveSiteDataSnippet(data: LiveSiteData): string {
  return `[LIVE VERIFIED SITE DATA — READ AT REQUEST TIME — SINGLE SOURCE OF TRUTH]
• 1-on-1 Vedic Astro Consultation:
  - First-Booking Offer: Flat ₹${data.flatFirstConsultationFee}/- (${data.discountPercentage}% discount off regular ₹${data.flatStandardFee} with promo code ${data.promoCode})
  - Standard Fee: ₹${data.flatStandardFee}/-
• Devta Vaastu 16-Zone Energy Consultation:
  - Current Offer Fee: Flat ₹${data.vaastuPromoFee}/- (Save ₹${data.vaastuStandardFee - data.vaastuPromoFee} off regular ₹${data.vaastuStandardFee})
  - Standard Fee: ₹${data.vaastuStandardFee}/-
• Kundli Full PDF Report: Flat ₹${data.kundliPdfFee}/- one-time
• Free Online Tools: Janam Kundli, Kundli Milan (36 Guna), Daily Panchang, Tomorrow Panchang, Daily Rashifal (all ₹0 / 100% Free)
• Active Promotion: ${data.activePromoHeadline || "50% Off First Consultation (FIRST1051)"}
• Payment Method: Direct UPI to ${data.upiId} (Payee: ${data.payeeName}) via Google Pay, PhonePe, Paytm, BHIM. ZERO wallet coins or top-ups.
• WhatsApp Contact: ${data.whatsappNumber} (https://wa.me/919311215564)
• Office Sanctum: Spectrum@Metro Phase 1, Sector 75, Noida, U.P. 201301`;
}
