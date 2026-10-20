import { NextRequest, NextResponse } from "next/server";
import { resolveRequestAuth } from "@/lib/auth/serverAuth";
import { PricingSettings } from "@/lib/store/adminStore";
import { PlatformSettingsService } from "@/lib/services/platformSettingsService";
import { parseAndValidateJsonBody, checkAdminRateLimit } from "@/lib/admin/rateLimitAndValidation";
import { revalidateAffectedContent } from "@/lib/content/revalidation";

/**
 * GET /api/admin/pricing
 * Reads current consultation pricing settings. Strictly Owner-only.
 */
export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const rateLimit = checkAdminRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, message: "Rate limit exceeded. Please try again later." },
      { status: 429 }
    );
  }

  const auth = await resolveRequestAuth(req);

  if (!auth.isAuthenticated) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Authentication required." },
      { status: 401 }
    );
  }

  if (!auth.isOwner) {
    return NextResponse.json(
      { success: false, message: "Forbidden: Pricing configuration is strictly Owner-only." },
      { status: 403 }
    );
  }

  try {
    const pricing = await PlatformSettingsService.getPricing();
    return NextResponse.json({ success: true, pricing });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load pricing settings." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/pricing
 * Updates consultation pricing rules in Neon database. Strictly Owner-only.
 * Fails closed and triggers selective cache revalidation without full redeploy.
 */
export async function POST(req: NextRequest) {
  const parsed = await parseAndValidateJsonBody<PricingSettings>(req, { maxBodyBytes: 1024 * 50 });
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: parsed.error }, { status: parsed.status });
  }

  const auth = await resolveRequestAuth(req);

  if (!auth.isAuthenticated) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Authentication required." },
      { status: 401 }
    );
  }

  if (!auth.isOwner) {
    return NextResponse.json(
      { success: false, message: "Forbidden: Modifying pricing is strictly Owner-only." },
      { status: 403 }
    );
  }

  try {
    const body = parsed.data;
    const updatedPricing = await PlatformSettingsService.updatePricing(body);

    // Revalidate affected pages (consultation page, pricing policy)
    revalidateAffectedContent("pricing");

    return NextResponse.json({
      success: true,
      message: "Pricing updated successfully in database.",
      pricing: updatedPricing,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update pricing." },
      { status: 500 }
    );
  }
}
