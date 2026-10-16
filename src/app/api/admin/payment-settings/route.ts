import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth/serverAuth";
import { isOwnerEmail } from "@/lib/auth/staffPermissions";
import { PlatformSettingsService, PaymentSettings, isValidUpiId } from "@/lib/services/platformSettingsService";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/payment-settings
 * Returns current payment settings and WhatsApp confirmation state.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req);

    if (!auth.isAuthenticated || !isOwnerEmail(auth.email)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Owner privilege required." },
        { status: 403 }
      );
    }

    const settings = await PlatformSettingsService.getPaymentSettings();

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error: any) {
    console.error("Fetch payment settings error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load payment settings." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/payment-settings
 * Owner-only updates to UPI ID, Payee Name, QR Image, WhatsApp Number, and Unpaid Expiry.
 * Every edit is audit-logged and triggers an immediate security alert email to the Owner.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req);

    if (!auth.isAuthenticated || !isOwnerEmail(auth.email)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Only the site Owner may update payment routing." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { upiId, payeeName, qrImageUrl, whatsappNumber, whatsappConfirmed, unpaidExpiryDays } = body;

    const updates: Partial<PaymentSettings> = {};
    if (upiId !== undefined) {
      if (typeof upiId !== "string" || !isValidUpiId(upiId)) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid UPI ID format: "${upiId}". Expected format: username@handle (e.g. 9311215564@okbizaxis).`,
          },
          { status: 400 }
        );
      }
      updates.upiId = upiId.trim();
    }
    if (typeof payeeName === "string" && payeeName.trim()) updates.payeeName = payeeName.trim();
    if (qrImageUrl !== undefined) updates.qrImageUrl = qrImageUrl ? String(qrImageUrl).trim() : null;
    if (typeof whatsappNumber === "string" && whatsappNumber.trim()) updates.whatsappNumber = whatsappNumber.trim();
    if (typeof whatsappConfirmed === "boolean") updates.whatsappConfirmed = whatsappConfirmed;
    if (typeof unpaidExpiryDays === "number" && unpaidExpiryDays > 0) updates.unpaidExpiryDays = unpaidExpiryDays;

    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
    const userAgent = req.headers.get("user-agent");

    const updated = await PlatformSettingsService.updatePaymentSettings({
      updates,
      actorEmail: auth.email!,
      actorId: auth.userId || undefined,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      settings: updated,
      message: "Payment routing settings updated. Security alert dispatched to Owner email.",
    });
  } catch (error: any) {
    console.error("Update payment settings error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update payment settings." },
      { status: 400 }
    );
  }
}
