import { prisma } from "@/lib/db/prisma";
import { PlatformSettingsService } from "@/lib/services/platformSettingsService";
import { CONSULTATION_PRODUCTS, FIRST_CONSULTATION_OFFER } from "@/config/placeholderContent";

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
 * 1. Astro Consultation: Standard ₹2,100, First-time ₹1,051 (confirmed server-side in Neon DB, one-time only).
 * 2. Vaastu Consultation: Flat ₹15,000 (discounted from ₹25,000) — standing price for everyone, NOT gated by first-time check.
 * All base and promotional prices are retrieved live from PostgreSQL (Neon).
 */
export async function calculateUserConsultationRate(
  userId: string,
  productId: "astro" | "vaastu" = "astro",
  type: string = "voice"
): Promise<ConsultationRateCalculation> {
  const settings = await PlatformSettingsService.getPricing();

  // Product 2: Vaastu Consultation (Standing price for everyone)
  if (productId === "vaastu") {
    const baseFee = settings.vaastuStandardFee ?? 25000;
    const effectiveFee = settings.vaastuPromoFee ?? 15000;
    const discountAmount = Math.max(0, baseFee - effectiveFee);
    const discountPercentage = baseFee > 0 ? Math.round((discountAmount / baseFee) * 100) : 40;

    return {
      userId,
      productId: "vaastu",
      productName: "Vaastu Shastra Consultation",
      consultationType: type,
      baseFee,
      effectiveFee,
      baseRatePerMin: 0,
      effectiveRatePerMin: 0,
      isFirstConsultation: false,
      firstTimeOnlyGated: false,
      discountPercentage,
      discountAmount,
      discountReason: `Vaastu Consultation Standing Offer: Flat ₹${effectiveFee.toLocaleString("en-IN")}/- (Regular ₹${baseFee.toLocaleString("en-IN")})`,
    };
  }

  // Product 1: Astro Consultation (First-time clients: Flat ₹1,051; Returning clients: Flat ₹2,100)
  const standardFee = settings.flatStandardFee ?? 2100;
  const promoFee = settings.flatFirstConsultationFee ?? 1051;

  let isFirstConsultation = true;

  try {
    if (userId && userId !== "guest") {
      const dbUser = await prisma.user.findFirst({
        where: {
          OR: [{ id: userId }, { clerkId: userId }],
        },
        select: { id: true },
      });
      const targetUserId = dbUser ? dbUser.id : userId;

      const priorSessionCount = await prisma.session.count({
        where: {
          clientId: targetUserId,
          bookingStatus: { in: ["CONFIRMED", "SCHEDULED", "COMPLETED"] },
        },
      });

      isFirstConsultation = priorSessionCount === 0;
    }
  } catch {
    // If DB check fails, default to first consultation promo
    isFirstConsultation = true;
  }

  const effectiveFee = isFirstConsultation ? promoFee : standardFee;
  const discountAmount = isFirstConsultation ? standardFee - promoFee : 0;
  const discountPercentage = isFirstConsultation && standardFee > 0
    ? Math.round((discountAmount / standardFee) * 100)
    : 0;

  return {
    userId,
    productId: "astro",
    productName: "Vedic Astrology Consultation",
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
      ? `First Consultation Special Offer: Flat ₹${promoFee.toLocaleString("en-IN")}/- (Regular ₹${standardFee.toLocaleString("en-IN")})`
      : `Standard Consultation Fee: Flat ₹${standardFee.toLocaleString("en-IN")}/-`,
  };
}
