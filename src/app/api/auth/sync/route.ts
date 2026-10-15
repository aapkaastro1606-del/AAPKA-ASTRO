import { NextRequest, NextResponse } from "next/server";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import { syncClerkUserToDatabase } from "@/lib/auth/syncUser";

export const dynamic = "force-dynamic";

/**
 * On-Demand Auth Sync & Diagnostic Endpoint
 *
 * Can be invoked by authenticated clients to ensure their Clerk account is
 * immediately provisioned in PostgreSQL (Neon) and return the up-to-date user profile.
 * Also records diagnostic session mismatch events from the login flow.
 */
export async function GET(req: NextRequest) {
  try {
    const authUser = await getServerAuthUser();
    if (!authUser.isAuthenticated || !authUser.userId) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    let syncedUser: any = null;
    if (authUser.userId && authUser.userId !== "mock_user") {
      syncedUser = await syncClerkUserToDatabase({
        clerkId: authUser.userId,
        email: authUser.email,
        name: null,
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: syncedUser?.id || authUser.userId,
        email: authUser.email,
        role: authUser.role,
        walletBalance: syncedUser?.walletBalance ?? 0.0,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Sync failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (body?.event === "SESSION_SYNC_MISMATCH") {
      console.warn(
        `[AuthSync] Diagnostic Event: SESSION_SYNC_MISMATCH reported by browser. Target: ${body.targetUrl || "/account"}`
      );
      return NextResponse.json({
        recorded: true,
        event: "SESSION_SYNC_MISMATCH",
        timestamp: new Date().toISOString(),
      });
    }
  } catch {
    // ignore
  }
  return GET(req);
}
