import { NextRequest, NextResponse } from "next/server";
import { PresenceService } from "@/lib/redis/presence";
import { getServerAuthUser } from "@/lib/auth/serverAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  const presence = await PresenceService.getPresence();
  return NextResponse.json(presence);
}

export async function POST(req: NextRequest) {
  try {
    // Server-Side RBAC Enforcement: Only Astrologer or Admin can mutate status
    const authState = await getServerAuthUser();
    if (!authState.isAuthenticated || !authState.isAstrologer) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden: Astrologer or Admin role required to update presence.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { status, statusMessage, nextAvailableAt } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, message: "Status is required" },
        { status: 400 }
      );
    }

    const updated = await PresenceService.setPresence(status, statusMessage, nextAvailableAt);
    return NextResponse.json({ success: true, presence: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to update presence" },
      { status: 500 }
    );
  }
}
