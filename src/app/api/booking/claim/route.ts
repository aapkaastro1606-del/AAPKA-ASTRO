import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth/serverAuth";
import { BookingWorkflowService } from "@/lib/services/bookingWorkflowService";

export const dynamic = "force-dynamic";

/**
 * POST /api/booking/claim
 * Marks a booking as PAYMENT_CLAIMED, records optional UTR,
 * alerts the Site Owner via email, and returns prefilled WhatsApp link.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req);
    const body = await req.json();
    const { bookingId, utr } = body;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: "bookingId is required." },
        { status: 400 }
      );
    }

    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
    const userAgent = req.headers.get("user-agent");

    const result = await BookingWorkflowService.claimPayment({
      bookingId,
      utr: utr?.trim() || null,
      userId: auth.userId || "anonymous",
      ipAddress,
      userAgent,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Payment claim error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to submit payment claim." },
      { status: 400 }
    );
  }
}
