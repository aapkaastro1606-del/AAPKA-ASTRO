import { NextResponse } from "next/server";
import { ReelsStore } from "@/lib/store/reelsStore";
import { isReelsEnabled, safeExternalCall } from "@/lib/utils/resilience";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

/**
 * GET /api/reels
 * Public endpoint to fetch visible and pinned reels directly from PostgreSQL (Neon).
 * Resilient against database downtime; obeys REELS_ENABLED kill switch.
 */
export async function GET() {
  // 1. Kill switch check
  if (!isReelsEnabled()) {
    return NextResponse.json({
      success: true,
      disabled: true,
      visibleReels: [],
      pinnedReels: [],
    });
  }

  try {
    const visibleReels = await safeExternalCall({
      name: "ReelsStore.getVisibleReelsAsync",
      timeoutMs: 6000,
      fallback: () => ReelsStore.getVisibleReels(),
      fn: () => ReelsStore.getVisibleReelsAsync(),
    });

    const pinnedReels = await safeExternalCall({
      name: "ReelsStore.getPinnedReelsAsync",
      timeoutMs: 6000,
      fallback: () => ReelsStore.getPinnedReels(),
      fn: () => ReelsStore.getPinnedReelsAsync(),
    });

    return NextResponse.json({
      success: true,
      visibleReels,
      pinnedReels,
    });
  } catch (error: any) {
    console.error("[Reels API Graceful Degradation] Fallback to static reels:", error);
    return NextResponse.json({
      success: true,
      isFallback: true,
      visibleReels: ReelsStore.getVisibleReels(),
      pinnedReels: ReelsStore.getPinnedReels(),
    });
  }
}
