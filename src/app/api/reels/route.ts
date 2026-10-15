import { NextResponse } from "next/server";
import { ReelsStore } from "@/lib/store/reelsStore";

export const dynamic = "force-dynamic";

/**
 * GET /api/reels
 * Public endpoint to fetch visible and pinned reels directly from PostgreSQL (Neon).
 */
export async function GET() {
  try {
    const visibleReels = await ReelsStore.getVisibleReelsAsync();
    const pinnedReels = await ReelsStore.getPinnedReelsAsync();
    return NextResponse.json({
      success: true,
      visibleReels,
      pinnedReels,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to load reels",
        visibleReels: ReelsStore.getVisibleReels(),
        pinnedReels: ReelsStore.getPinnedReels(),
      },
      { status: 500 }
    );
  }
}
