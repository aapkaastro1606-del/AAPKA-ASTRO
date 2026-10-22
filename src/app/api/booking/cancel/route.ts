import { NextRequest, NextResponse } from "next/server";
import { BookingWorkflowService } from "@/lib/services/bookingWorkflowService";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import { isOwnerEmail } from "@/lib/auth/staffPermissions";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const auth = await getServerAuthUser();
    const body = await req.json();
    const { bookingId, reason } = body;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: "Booking reference required." },
        { status: 400 }
      );
    }

    const isOwner = auth.isAuthenticated && auth.email ? isOwnerEmail(auth.email) : false;
    const actorRole = isOwner ? "OWNER" : "CLIENT";

    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
    const userAgent = req.headers.get("user-agent");

    const result = await BookingWorkflowService.cancelBooking({
      bookingId,
      reason,
      actorRole,
      actorEmail: auth.email || undefined,
      actorId: auth.userId || undefined,
      ipAddress,
      userAgent,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to cancel booking" },
      { status: 400 }
    );
  }
}
