import { NextRequest, NextResponse } from "next/server";
import { KundliLeadService } from "@/lib/services/kundliLeadService";
import { getAuthFromRequest } from "@/lib/auth/serverAuth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const auth = getAuthFromRequest(req);

    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null;
    const userAgent = req.headers.get("user-agent") || null;

    const result = await KundliLeadService.captureLead({
      name: body.name,
      phone: body.phone,
      email: body.email,
      gender: body.gender,
      birthDate: body.birthDate,
      birthTime: body.birthTime,
      birthPlace: body.birthPlace,
      latitude: body.latitude,
      longitude: body.longitude,
      timezone: body.timezone,
      sourcePage: body.sourcePage || "/kundli-generator",
      userId: body.userId || auth.userId || null,
      consentGiven: body.consentGiven === true,
      consentText: body.consentText,
      consentVersion: body.consentVersion,
      honeypot: body.honeypot || body.website_hp,
      formRenderedAt: body.formRenderedAt,
      ipAddress,
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
