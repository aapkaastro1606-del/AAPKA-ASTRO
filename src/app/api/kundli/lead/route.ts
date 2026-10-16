import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { KundliLeadService } from "@/lib/services/kundliLeadService";
import { getAuthFromRequest } from "@/lib/auth/serverAuth";
import { kundliLeadRateLimiter } from "@/lib/security/rateLimiter";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

const KundliLeadRequestSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  phone: z.string().trim().min(8, "Valid phone number required").max(20),
  email: z.string().email("Invalid email format").optional().nullable().or(z.literal("")),
  gender: z.string().optional().default("male"),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Birth date must be YYYY-MM-DD"),
  birthTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, "Birth time must be HH:MM"),
  birthPlace: z.string().trim().min(1, "Birth place is required").max(200),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  timezone: z.number().optional().nullable(),
  sourcePage: z.string().optional().default("/kundli-generator"),
  userId: z.string().optional().nullable(),
  consentGiven: z.boolean().default(true),
  consentText: z.string().optional(),
  consentVersion: z.string().optional(),
  honeypot: z.string().optional().nullable(),
  website_hp: z.string().optional().nullable(),
  formRenderedAt: z.number().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. IP Rate Limiting: 10 lead submissions per minute
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rateLimit = kundliLeadRateLimiter.check(ip);
    if (!rateLimit.allowed) {
      console.warn(`[API /api/kundli/lead] Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        {
          success: false,
          message: "Too many lead submissions. Please wait a minute and try again.",
        },
        { status: 429 }
      );
    }

    // 2. Strict Input Validation
    const body = await req.json();
    const parsed = KundliLeadRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid input parameters for Kundli lead submission.",
          errors: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const auth = getAuthFromRequest(req);
    const userAgent = req.headers.get("user-agent") || null;

    const result = await KundliLeadService.captureLead({
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      gender: data.gender,
      birthDate: data.birthDate,
      birthTime: data.birthTime,
      birthPlace: data.birthPlace,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
      sourcePage: data.sourcePage || "/kundli-generator",
      userId: data.userId || auth.userId || null,
      consentGiven: data.consentGiven === true,
      consentText: data.consentText || KundliLeadService.DEFAULT_CONSENT_TEXT,
      consentVersion: data.consentVersion || KundliLeadService.CURRENT_CONSENT_VERSION,
      honeypot: data.honeypot || data.website_hp || undefined,
      formRenderedAt: data.formRenderedAt || undefined,
      ipAddress: ip,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      leadId: result.leadId,
      isUpdate: result.isUpdate,
    });
  } catch (error: any) {
    console.warn("[API /api/kundli/lead] Capture error:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to record Kundli lead.",
      },
      { status: 400 }
    );
  }
}
