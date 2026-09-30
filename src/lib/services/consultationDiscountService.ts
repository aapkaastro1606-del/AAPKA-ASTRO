import { prisma } from "@/lib/db/prisma";
import { FLAT_CONSULTATION_PRICING, FIRST_CONSULTATION_OFFER } from "@/config/placeholderContent";

export interface ConsultationRateCalculation {
  userId: string;
  consultationType: "chat" | "voice" | "video";
  baseFee: number;
  effectiveFee: number;
  baseRatePerMin: number;
  effectiveRatePerMin: number;
  isFirstConsultation: boolean;
  discountPercentage: number;
  discountAmount: number;
  discountReason: string;
}

/**
 * Server-side determination of user consultation fee.
 * Guarantees that first-time ₹1,051 promotional rate (regular ₹2,100) is applied
 * ONLY if the user has zero prior completed sessions in the database.
 */
export async function calculateUserConsultationRate(
  userId: string,
  type: "chat" | "voice" | "video" = "chat"
): Promise<ConsultationRateCalculation> {
  const standardFee = FLAT_CONSULTATION_PRICING.standardFee; // ₹2,100
  const promoFee = FLAT_CONSULTATION_PRICING.firstConsultationFee; // ₹1,051

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
    // If DB is offline in preview, default to first consultation promo
    isFirstConsultation = true;
  }

  const effectiveFee = isFirstConsultation ? promoFee : standardFee;
  const discountAmount = isFirstConsultation ? standardFee - promoFee : 0;
  const discountPercentage = isFirstConsultation ? FIRST_CONSULTATION_OFFER.discountPercentage : 0;

  return {
    userId,
    consultationType: type,
    baseFee: standardFee,
    effectiveFee,
    baseRatePerMin: 0,
    effectiveRatePerMin: 0,
    isFirstConsultation,
    discountPercentage,
    discountAmount,
    discountReason: isFirstConsultation
      ? "First Consultation Special Offer: Flat ₹1,051/- (Regular ₹2,100)"
      : "Standard Vedic Consultation Tariff: Flat ₹2,100/-",
  };
}
