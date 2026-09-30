import { prisma } from "@/lib/db/prisma";
import {
  CONSULTATION_PRODUCTS,
  FLAT_CONSULTATION_PRICING,
  FIRST_CONSULTATION_OFFER,
} from "@/config/placeholderContent";

export interface ConsultationRateCalculation {
  userId: string;
  productId: "astro" | "vaastu";
  productName: string;
  consultationType: string;
  baseFee: number;
  effectiveFee: number;
  baseRatePerMin: number;
  effectiveRatePerMin: number;
  isFirstConsultation: boolean;
  firstTimeOnlyGated: boolean;
  discountPercentage: number;
  discountAmount: number;
  discountReason: string;
}

/**
 * Server-side determination of user consultation fee for both consultation products:
 * 1. Astro Consultation: Standard ₹2,100, First-time ₹1,051 (confirmed server-side per user ID, one-time only).
 * 2. Vaastu Consultation: Flat ₹15,000 (discounted from ₹25,000) — standing price for everyone, NOT gated by first-time check.
 */
export async function calculateUserConsultationRate(
  userId: string,
  productId: "astro" | "vaastu" = "astro",
  type: string = "voice"
): Promise<ConsultationRateCalculation> {
  // Product 2: Vaastu Consultation (Standing price for everyone)
  if (productId === "vaastu") {
    const vaastuConfig = CONSULTATION_PRODUCTS.vaastu;
    const baseFee = vaastuConfig.standardPrice; // ₹25,000
    const effectiveFee = vaastuConfig.promoPrice; // ₹15,000
    const discountAmount = baseFee - effectiveFee; // ₹10,000
    const discountPercentage = Math.round((discountAmount / baseFee) * 100); // 40%

    return {
      userId,
      productId: "vaastu",
      productName: vaastuConfig.name,
      consultationType: type,
      baseFee,
      effectiveFee,
      baseRatePerMin: 0,
      effectiveRatePerMin: 0,
      isFirstConsultation: false, // Not relevant for Vaastu, no gate
      firstTimeOnlyGated: false,
      discountPercentage,
      discountAmount,
      discountReason: "Vaastu Consultation Standing Offer: Flat ₹15,000/- (Regular ₹25,000 - Open to all clients)",
    };
  }

  // Product 1: Astro Consultation (First-time clients: Flat ₹1,051; Returning clients: Flat ₹2,100)
  const astroConfig = CONSULTATION_PRODUCTS.astro;
  const standardFee = astroConfig.standardPrice; // ₹2,100
  const promoFee = astroConfig.promoPrice; // ₹1,051

  let isFirstConsultation = true;

  try {
    if (userId && userId !== "guest") {
      const priorSessionCount = await prisma.session.count({
        where: {
          clientId: userId,
          status: "COMPLETED",
        },
      });

      isFirstConsultation = priorSessionCount === 0;
    }
  } catch {
    // If DB is offline or mock in preview, default to first consultation promo
    isFirstConsultation = true;
  }

  const effectiveFee = isFirstConsultation ? promoFee : standardFee;
  const discountAmount = isFirstConsultation ? standardFee - promoFee : 0;
  const discountPercentage = isFirstConsultation ? FIRST_CONSULTATION_OFFER.discountPercentage : 0;

  return {
    userId,
    productId: "astro",
    productName: astroConfig.name,
    consultationType: type,
    baseFee: standardFee,
    effectiveFee,
    baseRatePerMin: 0,
    effectiveRatePerMin: 0,
    isFirstConsultation,
    firstTimeOnlyGated: true,
    discountPercentage,
    discountAmount,
    discountReason: isFirstConsultation
      ? "First Consultation Special Offer: Flat ₹1,051/- (Regular ₹2,100)"
      : "Standard Vedic Astro Consultation Tariff: Flat ₹2,100/-",
  };
}
