import { ADMIN_CONFIGURABLE_PRICING, PricingTier, FLAT_CONSULTATION_PRICING, FIRST_CONSULTATION_OFFER } from "@/config/placeholderContent";

export interface PricingSettings {
  flatStandardFee: number;
  flatFirstConsultationFee: number;
  chatRate: number;
  voiceRate: number;
  videoRate: number;
  discountPercentage: number;
  minimumRechargeAmount: number;
  firstTimeFreeMinutes: number;
}

export interface PlatformAnalytics {
  totalRevenue: number;
  monthlyRevenue: number;
  totalConsultationMinutes: number;
  activeUsersToday: number;
  conversionRate: number;
  totalRecharges: number;
  trafficSources: { source: string; percentage: number }[];
  consultationBreakdown: { type: string; count: number; percentage: number }[];
  dailyTrends: { day: string; revenue: number; minutes: number }[];
}

let memoryPricing: PricingSettings = {
  flatStandardFee: FLAT_CONSULTATION_PRICING.standardFee,
  flatFirstConsultationFee: FLAT_CONSULTATION_PRICING.firstConsultationFee,
  chatRate: ADMIN_CONFIGURABLE_PRICING.chat.ratePerMinute,
  voiceRate: ADMIN_CONFIGURABLE_PRICING.voice.ratePerMinute,
  videoRate: ADMIN_CONFIGURABLE_PRICING.video.ratePerMinute,
  discountPercentage: 50,
  minimumRechargeAmount: 100,
  firstTimeFreeMinutes: 0,
};

let memoryAnalytics: PlatformAnalytics = {
  totalRevenue: 284500,
  monthlyRevenue: 64200,
  totalConsultationMinutes: 14850,
  activeUsersToday: 428,
  conversionRate: 18.4,
  totalRecharges: 1290,
  trafficSources: [
    { source: "Organic Search / Google", percentage: 44 },
    { source: "Instagram Reels & Profile", percentage: 32 },
    { source: "Direct / Word of Mouth", percentage: 16 },
    { source: "Referral / WhatsApp", percentage: 8 },
  ],
  consultationBreakdown: [
    { type: "Audio Call", count: 480, percentage: 45 },
    { type: "Live Chat", count: 370, percentage: 35 },
    { type: "Video Call", count: 210, percentage: 20 },
  ],
  dailyTrends: [
    { day: "Mon", revenue: 8400, minutes: 420 },
    { day: "Tue", revenue: 9200, minutes: 480 },
    { day: "Wed", revenue: 11500, minutes: 590 },
    { day: "Thu", revenue: 14200, minutes: 710 },
    { day: "Fri", revenue: 12800, minutes: 640 },
    { day: "Sat", revenue: 18900, minutes: 980 },
    { day: "Sun", revenue: 21400, minutes: 1120 },
  ],
};

export const AdminStore = {
  getPricing: (): PricingSettings => ({ ...memoryPricing }),

  updatePricing: (updates: Partial<PricingSettings>) => {
    memoryPricing = { ...memoryPricing, ...updates };
    // Synchronize with global config object
    if (updates.flatStandardFee !== undefined) {
      FLAT_CONSULTATION_PRICING.standardFee = updates.flatStandardFee;
      FIRST_CONSULTATION_OFFER.standardFee = updates.flatStandardFee;
    }
    if (updates.flatFirstConsultationFee !== undefined) {
      FLAT_CONSULTATION_PRICING.firstConsultationFee = updates.flatFirstConsultationFee;
      FIRST_CONSULTATION_OFFER.promotionalFee = updates.flatFirstConsultationFee;
    }
    if (updates.chatRate !== undefined) ADMIN_CONFIGURABLE_PRICING.chat.ratePerMinute = updates.chatRate;
    if (updates.voiceRate !== undefined) ADMIN_CONFIGURABLE_PRICING.voice.ratePerMinute = updates.voiceRate;
    if (updates.videoRate !== undefined) ADMIN_CONFIGURABLE_PRICING.video.ratePerMinute = updates.videoRate;
    if (updates.discountPercentage !== undefined) {
      ADMIN_CONFIGURABLE_PRICING.chat.discountPercentage = updates.discountPercentage;
      ADMIN_CONFIGURABLE_PRICING.voice.discountPercentage = updates.discountPercentage;
      ADMIN_CONFIGURABLE_PRICING.video.discountPercentage = updates.discountPercentage;
    }
    const discountFactor = 1 - memoryPricing.discountPercentage / 100;
    ADMIN_CONFIGURABLE_PRICING.chat.effectiveFirstTimeRate = Number(
      (ADMIN_CONFIGURABLE_PRICING.chat.ratePerMinute * discountFactor).toFixed(2)
    );
    ADMIN_CONFIGURABLE_PRICING.voice.effectiveFirstTimeRate = Number(
      (ADMIN_CONFIGURABLE_PRICING.voice.ratePerMinute * discountFactor).toFixed(2)
    );
    ADMIN_CONFIGURABLE_PRICING.video.effectiveFirstTimeRate = Number(
      (ADMIN_CONFIGURABLE_PRICING.video.ratePerMinute * discountFactor).toFixed(2)
    );
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("astro_pricing_updated"));
    }
  },

  getAnalytics: (): PlatformAnalytics => ({ ...memoryAnalytics }),
};
