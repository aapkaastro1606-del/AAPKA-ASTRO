import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { storageProvider } from "@/lib/providers/storage";
import { AuditLogService } from "@/lib/services/auditLogService";
import { stripExifData } from "@/lib/utils/imageExifStripper";
import { isBase64Payload } from "@/lib/services/bookingWorkflowService";

export const dynamic = "force-dynamic";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * POST /api/booking/upload-screenshot
 * Secure payment screenshot upload.
 * - Only enabled when STORAGE_PROVIDER is configured
 * - Strips EXIF metadata before persistence
 * - Stores in private bucket with random object key (never base64 in database)
 */
export async function POST(req: NextRequest) {
  try {
    const storageProviderName = process.env.STORAGE_PROVIDER?.trim().toLowerCase();
    const isStorageConfigured = Boolean(storageProviderName && storageProviderName !== "none");

    if (!isStorageConfigured) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Storage uploads are disabled when STORAGE_PROVIDER is not set. Please send your payment screenshot via WhatsApp.",
        },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const bookingId = (formData.get("bookingId") as string)?.trim();
    const file = formData.get("file") as File | null;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: "bookingId is required." },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Screenshot image file is required." },
        { status: 400 }
      );
    }

    const mime = file.type.toLowerCase().trim();
    if (!ALLOWED_MIME_TYPES.includes(mime)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid file type "${file.type}". Only JPG, PNG, and WebP images are permitted.`,
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          message: `File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds 5 MB limit.`,
        },
        { status: 400 }
      );
    }

    const booking = await prisma.session.findUnique({
      where: { bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: `Booking ${bookingId} not found.` },
        { status: 404 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);

    // Guard: ensure no inline base64 data injection
    if (isBase64Payload(rawBuffer.toString("utf8", 0, Math.min(1000, rawBuffer.length)))) {
      return NextResponse.json(
        {
          success: false,
          message: "Base64 encoded files are prohibited. Provide raw binary image.",
        },
        { status: 400 }
      );
    }

    // Strip EXIF metadata
    const cleanBuffer = stripExifData(rawBuffer, mime);

    // Upload to private bucket (returns random canonical object key)
    const storageKey = await storageProvider.uploadFile(
      cleanBuffer,
      file.name,
      mime,
      { folder: "screenshots", isPublic: false }
    );

    // Persist canonical key in database (never base64)
    await prisma.session.update({
      where: { id: booking.id },
      data: {
        paymentScreenshotUrl: storageKey,
        bookingStatus: booking.bookingStatus === "PENDING_PAYMENT" ? "PAYMENT_CLAIMED" : booking.bookingStatus,
        paymentStatus: "AWAITING_VERIFICATION",
      },
    });

    await AuditLogService.log({
      action: "PAYMENT_SCREENSHOT_UPLOADED",
      actorId: booking.clientId,
      targetId: booking.bookingId || booking.id,
      targetType: "BOOKING",
      notes: `Uploaded payment screenshot to private storage (key=${storageKey})`,
    });

    return NextResponse.json({
      success: true,
      message: "Payment screenshot securely uploaded and attached.",
    });
  } catch (error: any) {
    console.error("Screenshot upload error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to upload screenshot." },
      { status: 500 }
    );
  }
}
