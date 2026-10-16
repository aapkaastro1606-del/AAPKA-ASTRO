import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { KundliService } from "@/lib/services/kundliService";
import { kundliCalcRateLimiter } from "@/lib/security/rateLimiter";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const KundliInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  gender: z.string().optional().default("male"),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Birth date must be YYYY-MM-DD"),
  birthTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, "Birth time must be HH:MM"),
  birthPlace: z.string().trim().min(1, "Birth place is required").max(200),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.number().min(-12).max(14).default(5.5),
});

const KundliCalculateRequestSchema = z.object({
  action: z.enum(["calculate", "save"]).optional().default("calculate"),
  tier: z.enum(["free", "paid"]).optional().default("free"),
  userId: z.string().optional(),
  chartData: z.any().optional(),
  input: KundliInputSchema,
});

export async function POST(req: NextRequest) {
  try {
    // 1. IP Rate Limiting: 20 requests per minute
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rateLimit = kundliCalcRateLimiter.check(ip);
    if (!rateLimit.allowed) {
      console.warn(`[API /api/kundli/calculate] Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        {
          success: false,
          message: "Too many Kundli calculation requests. Please wait a minute and try again.",
        },
        { status: 429 }
      );
    }

    // 2. Strict Input Validation
    const body = await req.json();
    const parsed = KundliCalculateRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid input parameters for Kundli calculation.",
          errors: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const { input, tier, action, chartData, userId } = parsed.data;

    if (action === "save") {
      const saveResult = await KundliService.saveKundli(input as any, chartData, userId);
      return NextResponse.json({ success: true, ...saveResult });
    }

    if (tier === "paid") {
      const interpretation = await KundliService.generatePaidInterpretation(input as any);
      return NextResponse.json({ success: true, interpretation });
    }

    const freeReport = await KundliService.generateFreeChart(input as any);
    return NextResponse.json({ success: true, report: freeReport });
  } catch (err: any) {
    console.error("[API /api/kundli/calculate Exception]:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to process Kundli request" },
      { status: 500 }
    );
  }
}
