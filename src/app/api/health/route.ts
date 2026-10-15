import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

/**
 * Public Health Check Endpoint
 * Minimal database ping only. Does NOT expose internal schema, tables, or configuration data.
 */
export async function GET() {
  const startTime = Date.now();
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      {
        status: "unhealthy",
        database: "disconnected",
        latencyMs: 0,
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "healthy",
        database: "connected",
        latencyMs,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch {
    const latencyMs = Date.now() - startTime;
    return NextResponse.json(
      {
        status: "unhealthy",
        database: "disconnected",
        latencyMs,
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }
}
