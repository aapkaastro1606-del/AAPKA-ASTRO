import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth/serverAuth";
import { BookingWorkflowService } from "@/lib/services/bookingWorkflowService";

export const dynamic = "force-dynamic";

/**
 * POST /api/booking/create
 * Creates a consultation booking record with server-locked pricing and dynamic UPI link.
 * Requires user authentication.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req);

    if (!auth.isAuthenticated || !auth.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please sign in or create an account to book your consultation with Acharya Ji.",
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      clientName,
      clientPhone,
      clientEmail,
      productType = "astro",
      format = "WhatsApp call",
      preferredDay,
      preferredTimeWindow,
      topic,
      intakeDetails,
    } = body;

    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
    const userAgent = req.headers.get("user-agent");

    const result = await BookingWorkflowService.createBooking({
      userId: auth.userId,
      clientName: clientName?.trim() || "Seeker",
      clientPhone: clientPhone?.trim() || "",
      clientEmail: clientEmail?.trim() || auth.email || null,
      productType,
      format,
      preferredDay,
      preferredTimeWindow,
      topic,
      intakeDetails,
      ipAddress,
      userAgent,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Unable to initiate booking at this time.",
      },
      { status: 400 }
    );
  }
}
