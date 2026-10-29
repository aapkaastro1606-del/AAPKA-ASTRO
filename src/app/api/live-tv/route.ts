import { NextResponse } from "next/server";
import { LiveTvSettingsService } from "@/lib/services/liveTvSettingsService";

export const dynamic = "force-dynamic";

/**
 * GET /api/live-tv
 * Public endpoint delivering live television broadcast status and verified settings.
 */
export async function GET() {
  try {
    const settings = await LiveTvSettingsService.getSettings();
    const status = await LiveTvSettingsService.getStatus();

    // If programme ended or unconfirmed, return minimal safe payload
    if (!status.isVisible) {
      return NextResponse.json({
        success: true,
        isVisible: false,
        status: status.status,
      });
    }

    return NextResponse.json({
      success: true,
      isVisible: true,
      status: status.status,
      labelEn: status.labelEn,
      labelHi: status.labelHi,
      settings: {
        programmeName: settings.programmeName,
        segmentName: settings.segmentName,
        channelName: settings.channelName,
        role: settings.role,
        astrologerName: settings.astrologerName,
        schedule: settings.schedule,
        whatsappNumber: settings.whatsappNumber,
        whatsappTemplate: settings.whatsappTemplate,
        proofClipsUrl: settings.proofClipsUrl || "",
        channelLogoApproved: settings.channelLogoApproved,
        channelLogoUrl: settings.channelLogoApproved ? settings.channelLogoUrl : "",
        texts: settings.texts,
        showHomeStrip: settings.showHomeStrip,
      },
    });
  } catch (error) {
    console.error("GET /api/live-tv error:", error);
    return NextResponse.json(
      { success: false, message: "Could not fetch broadcast status" },
      { status: 500 }
    );
  }
}
