import { NextRequest, NextResponse } from "next/server";
import { BookingWorkflowService } from "@/lib/services/bookingWorkflowService";
import { getServerAuthUser } from "@/lib/auth/serverAuth";

export const dynamic = "force-dynamic";

/**
 * POST /api/consultation/book
 * Bridges consult form to unified BookingWorkflowService.
 * Enforces one open booking rule, server-locked pricing, and dynamic UPI QR generation.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await getServerAuthUser();
    const body = await req.json();
    const {
      userId: bodyUserId = "guest",
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

    const resolvedUserId = auth.isAuthenticated ? (auth.dbUserId || auth.userId || bodyUserId) : bodyUserId;
    const resolvedEmail = auth.isAuthenticated ? (auth.email || clientEmail) : clientEmail;
    const resolvedName = auth.isAuthenticated ? (auth.name || clientName) : clientName;

    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
    const userAgent = req.headers.get("user-agent");

    const result = await BookingWorkflowService.createBooking({
      userId: resolvedUserId,
      clientName: (resolvedName || "Seeker").trim(),
      clientPhone: clientPhone?.trim() || "",
      clientEmail: resolvedEmail?.trim() || null,
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
      bookingStatus: "PENDING_PAYMENT",
      paymentStatus: "PENDING_PAYMENT",
    });
  } catch (error: any) {
    console.error("Consultation booking creation error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create consultation booking." },
      { status: 400 }
    );
  }
}
