import { NextRequest, NextResponse } from "next/server";
import { PresenceService } from "@/lib/redis/presence";
import { PlatformSettingsService } from "@/lib/services/platformSettingsService";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import { AuditLogService } from "@/lib/services/auditLogService";

export const dynamic = "force-dynamic";

/**
 * GET /api/astrologer/presence
 * Public endpoint: returns authoritative live presence of Acharya Niraj Kumar from PostgreSQL.
 */
export async function GET() {
  try {
    const presence = await PlatformSettingsService.getPresence();
    return NextResponse.json(presence);
  } catch (err: any) {
    console.error("Presence GET error:", err);
    return NextResponse.json(
      { status: "AVAILABLE", statusMessage: "Available right now for 1-on-1 consultations" },
      { status: 200 }
    );
  }
}

/**
 * POST /api/astrologer/presence
 * Mutates Acharya Ji's live presence status (AVAILABLE, BUSY, BREAK, OFFLINE) in PostgreSQL.
 * Restricted to Owner, Astrologer, or Admin.
 */
export async function POST(req: NextRequest) {
  try {
    const authState = await getServerAuthUser();
    const isAuthorized =
      authState.isAuthenticated &&
      (authState.isOwner || authState.isAstrologer || authState.role === "ADMIN");

    if (!isAuthorized) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden: Astrologer, Owner, or Admin role required to update presence.",
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

    // Persist to PostgreSQL (Neon) single source of truth
    const updated = await PlatformSettingsService.setPresence({
      status,
      statusMessage,
      nextAvailableAt,
    });

    // Update in-memory / Redis cache
    await PresenceService.setPresence(status, statusMessage, nextAvailableAt).catch(() => {});

    // Tamper-evident Audit Logging
    await AuditLogService.log({
      action: "PRESENCE_STATUS_UPDATED",
      actorId: authState.userId || "operator",
      actorEmail: authState.email,
      targetId: "presence",
      targetType: "ASTROLOGER_PRESENCE",
      newState: updated,
      notes: `Acharya Ji presence updated to ${status}${statusMessage ? ` (${statusMessage})` : ""}`,
    });

    return NextResponse.json({ success: true, presence: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to update presence" },
      { status: 500 }
    );
  }
}
