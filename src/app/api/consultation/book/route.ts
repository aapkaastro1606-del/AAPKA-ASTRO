import { NextRequest, NextResponse } from "next/server";
import { BookingWorkflowService } from "@/lib/services/bookingWorkflowService";

export const dynamic = "force-dynamic";

/**
 * POST /api/consultation/book
 * Bridges consult form to unified BookingWorkflowService.
 * Enforces one open booking rule, server-locked pricing, and dynamic UPI QR generation.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId = "guest",
      clientName,
      clientPhone,
      clientEmail,
      productId = "astro",
      format = "Voice Call",
      concern = "",
      preferredDay,
      preferredTimeWindow,
      birthDetails,
      propertyDetails,
    } = body;

    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
    const userAgent = req.headers.get("user-agent");

    const result = await BookingWorkflowService.createBooking({
      userId,
      clientName: clientName?.trim() || "Seeker",
      clientPhone: clientPhone?.trim() || "",
      clientEmail: clientEmail?.trim() || null,
      productType: productId,
      format,
      preferredDay,
      preferredTimeWindow,
      topic: concern,
      intakeDetails: {
        birthDetails: birthDetails || null,
        propertyDetails: propertyDetails || null,
        concerns: concern,
      },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      bookingId: result.bookingId,
      sessionId: result.sessionId,
      amount: result.amount,
      serviceName: result.serviceName,
      upiPayLink: result.upiPayLink,
      paymentSettings: result.paymentSettings,
      upiId: result.paymentSettings.upiId,
      whatsappNumber: result.paymentSettings.whatsappNumber,
      paymentStatus: "AWAITING_VERIFICATION",
    });
  } catch (error: any) {
    console.error("Consultation booking creation error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create consultation booking." },
      { status: 400 }
    );
  }
}
