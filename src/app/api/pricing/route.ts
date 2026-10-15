import { NextResponse } from "next/server";
import { PlatformSettingsService } from "@/lib/services/platformSettingsService";

export const dynamic = "force-dynamic";

/**
 * GET /api/pricing
 * Public endpoint to fetch active consultation prices directly from PostgreSQL (Neon).
 */
export async function GET() {
  try {
    const pricing = await PlatformSettingsService.getPricing();
    return NextResponse.json({
      success: true,
      pricing: {
        flatStandardFee: pricing.flatStandardFee ?? 2100,
        flatFirstConsultationFee: pricing.flatFirstConsultationFee ?? 1051,
        discountPercentage: pricing.discountPercentage ?? 50,
        vaastuStandardFee: pricing.vaastuStandardFee ?? 25000,
        vaastuPromoFee: pricing.vaastuPromoFee ?? 15000,
        vaastuDiscountPercentage: pricing.vaastuDiscountPercentage ?? 40,
        kundliPdfFee: pricing.kundliPdfFee ?? 501,
        navratriPromo: pricing.navratriPromo,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to load pricing",
        pricing: {
          flatStandardFee: 2100,
          flatFirstConsultationFee: 1051,
          discountPercentage: 50,
          vaastuStandardFee: 25000,
          vaastuPromoFee: 15000,
          vaastuDiscountPercentage: 40,
          kundliPdfFee: 501,
        },
      },
      { status: 500 }
    );
  }
}
