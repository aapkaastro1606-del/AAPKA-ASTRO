import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest, hasStaffSectionAccess } from "@/lib/auth/serverAuth";
import { ReelsStore } from "@/lib/store/reelsStore";

export const dynamic = "force-dynamic";

/**
 * GET /api/dashboard/reels
 * Lists all curated reels directly from PostgreSQL (Neon). Requires VIEW access on "reels".
 */
export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req);

  if (!auth.isAuthenticated) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Authentication required." },
      { status: 401 }
    );
  }

  if (!hasStaffSectionAccess(auth, "reels", "VIEW")) {
    return NextResponse.json(
      { success: false, message: "Forbidden: VIEW access required for Instagram Reels." },
      { status: 403 }
    );
  }

  try {
    const reels = await ReelsStore.getAllReelsAsync();
    return NextResponse.json({ success: true, reels });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load reels." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/dashboard/reels
 * Modifies reels curation in PostgreSQL (pin, hide, add, remove, reorder). Requires MANAGE access on "reels".
 */
export async function POST(req: NextRequest) {
  const auth = getAuthFromRequest(req);

  if (!auth.isAuthenticated) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Authentication required." },
      { status: 401 }
    );
  }

  if (!hasStaffSectionAccess(auth, "reels", "MANAGE")) {
    return NextResponse.json(
      { success: false, message: "Forbidden: MANAGE access required to modify reels curation." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { action, reelId, reelData, direction } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, message: "Action is required." },
        { status: 400 }
      );
    }

    if (action === "togglePin") {
      if (!reelId) {
        return NextResponse.json({ success: false, message: "Reel ID is required." }, { status: 400 });
      }
      await ReelsStore.togglePinAsync(reelId);
    } else if (action === "toggleHide") {
      if (!reelId) {
        return NextResponse.json({ success: false, message: "Reel ID is required." }, { status: 400 });
      }
      await ReelsStore.toggleHideAsync(reelId);
    } else if (action === "addReel") {
      if (!reelData?.instagramUrl) {
        return NextResponse.json({ success: false, message: "Instagram URL is required." }, { status: 400 });
      }
      await ReelsStore.addReelAsync(reelData);
    } else if (action === "removeReel") {
      if (!reelId) {
        return NextResponse.json({ success: false, message: "Reel ID is required." }, { status: 400 });
      }
      await ReelsStore.removeReelAsync(reelId);
    } else if (action === "reorder") {
      if (!reelId || !direction) {
        return NextResponse.json({ success: false, message: "Reel ID and direction are required." }, { status: 400 });
      }
      await ReelsStore.reorderReelAsync(reelId, direction);
    } else if (action === "reset") {
      await ReelsStore.resetToDefaultsAsync();
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid action specified." },
        { status: 400 }
      );
    }

    const updatedReels = await ReelsStore.getAllReelsAsync();
    return NextResponse.json({
      success: true,
      message: `Reel ${action} successful.`,
      reels: updatedReels,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update reel." },
      { status: 500 }
    );
  }
}
