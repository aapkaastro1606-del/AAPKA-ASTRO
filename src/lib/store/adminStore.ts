import { ADMIN_CONFIGURABLE_PRICING, PricingTier, FLAT_CONSULTATION_PRICING, FIRST_CONSULTATION_OFFER } from "@/config/placeholderContent";

export interface PricingSettings {
  flatStandardFee: number;
  flatFirstConsultationFee: number;
  discountPercentage: number;
  chatRate?: number;
  voiceRate?: number;
  videoRate?: number;
  minimumRechargeAmount?: number;
  firstTimeFreeMinutes?: number;
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
  discountPercentage: 50,
  chatRate: 15,
  voiceRate: 20,
  videoRate: 25,
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
      ADMIN_CONFIGURABLE_PRICING.chat.standardFee = updates.flatStandardFee;
      ADMIN_CONFIGURABLE_PRICING.voice.standardFee = updates.flatStandardFee;
      ADMIN_CONFIGURABLE_PRICING.video.standardFee = updates.flatStandardFee;
    }
    if (updates.flatFirstConsultationFee !== undefined) {
      FLAT_CONSULTATION_PRICING.firstConsultationFee = updates.flatFirstConsultationFee;
      FIRST_CONSULTATION_OFFER.promotionalFee = updates.flatFirstConsultationFee;
      ADMIN_CONFIGURABLE_PRICING.chat.flatFee = updates.flatFirstConsultationFee;
      ADMIN_CONFIGURABLE_PRICING.voice.flatFee = updates.flatFirstConsultationFee;
      ADMIN_CONFIGURABLE_PRICING.video.flatFee = updates.flatFirstConsultationFee;
      ADMIN_CONFIGURABLE_PRICING.chat.effectiveFirstTimeRate = updates.flatFirstConsultationFee;
      ADMIN_CONFIGURABLE_PRICING.voice.effectiveFirstTimeRate = updates.flatFirstConsultationFee;
      ADMIN_CONFIGURABLE_PRICING.video.effectiveFirstTimeRate = updates.flatFirstConsultationFee;
    }
    if (updates.discountPercentage !== undefined) {
      ADMIN_CONFIGURABLE_PRICING.chat.discountPercentage = updates.discountPercentage;
      ADMIN_CONFIGURABLE_PRICING.voice.discountPercentage = updates.discountPercentage;
      ADMIN_CONFIGURABLE_PRICING.video.discountPercentage = updates.discountPercentage;
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("astro_pricing_updated"));
    }
  },

  getAnalytics: (): PlatformAnalytics => ({ ...memoryAnalytics }),
};
