import { NextRequest, NextResponse } from "next/server";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import { prisma } from "@/lib/db/prisma";
import { checkAdminRateLimit } from "@/lib/admin/rateLimitAndValidation";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/audit
 * Fetches recent audit logs. Strictly restricted to the platform Owner.
 */
export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const rateLimit = checkAdminRateLimit(ip, 60, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, message: "Rate limit exceeded. Please try again later." },
      { status: 429 }
    );
  }

  const auth = await getServerAuthUser();

  if (!auth.isAuthenticated) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Authentication required." },
      { status: 401 }
    );
  }

  // Audit logs are strictly Owner-only
  if (!auth.isOwner) {
    return NextResponse.json(
      { success: false, message: "Forbidden: Only the Owner can inspect audit logs." },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50", 10), 1), 100);
    const action = searchParams.get("action") || undefined;
    const actorEmail = searchParams.get("actorEmail") || undefined;

    const where: any = {};
    if (action) where.action = { contains: action, mode: "insensitive" };
    if (actorEmail) where.actorEmail = { contains: actorEmail, mode: "insensitive" };

    const logs = await prisma.auditLog.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      logs: logs.map((l) => ({
        id: l.id,
        action: l.action,
        actorEmail: l.actorEmail || "System",
        targetId: l.targetId,
        targetType: l.targetType,
        previousState: l.previousState,
        newState: l.newState,
        notes: l.notes,
        createdAt: l.createdAt.toISOString(),
      })),
    });
  } catch (err: any) {
    console.error("GET /api/admin/audit error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to load audit logs", error: err.message },
      { status: 500 }
    );
  }
}
