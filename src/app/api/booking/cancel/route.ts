import { NextRequest, NextResponse } from "next/server";
import { BookingWorkflowService } from "@/lib/services/bookingWorkflowService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId, reason } = body;
    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: "Booking reference required." },
        { status: 400 }
      );
    }
    const result = await BookingWorkflowService.cancelBooking(bookingId, reason);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to cancel booking" },
      { status: 400 }
    );
  }
}
