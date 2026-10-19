import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { LocationService } from "@/lib/services/locationService";
import { locationSearchRateLimiter } from "@/lib/security/rateLimiter";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

const LocationSearchQuerySchema = z.object({
  q: z.string().trim().min(2, "Search query must be at least 2 characters").max(100, "Query too long"),
  limit: z.coerce.number().int().min(1).max(20).default(8),
});

export async function GET(req: NextRequest) {
  try {
    // 1. IP Rate Limiting: 60 location searches per minute
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rateLimit = locationSearchRateLimiter.check(ip);
    if (!rateLimit.allowed) {
      console.warn(`[API /api/location/search] Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        {
          success: false,
          error: "Too many location searches. Please slow down.",
          locations: [],
        },
        { status: 429 }
      );
    }

    // 2. Input Validation
    const { searchParams } = new URL(req.url);
    const parsed = LocationSearchQuerySchema.safeParse({
      q: searchParams.get("q") || "",
      limit: searchParams.get("limit") || "8",
    });

    if (!parsed.success) {
      return NextResponse.json({
        success: true,
        locations: [],
        count: 0,
        errors: parsed.error.format(),
      });
    }

    const { q, limit } = parsed.data;

    // 3. Search with multi-tier cache, throttled queue, and built-in fallback
    const result = await LocationService.searchWithStatus(q, limit);

    return NextResponse.json({
      success: true,
      query: q,
      count: result.locations.length,
      locations: result.locations,
      isFallback: result.isFallback,
      warning: result.warning,
      provider: LocationService.getProviderName(),
    });
  } catch (error: any) {
    console.error("[Location search API error - Graceful Fallback]:", error);
    // Never crash: fall back to built-in city matches
    const fallbackQuery = new URL(req.url).searchParams.get("q") || "";
    const fallbackLocations = await LocationService.search(fallbackQuery, 5);

    return NextResponse.json({
      success: true,
      query: fallbackQuery,
      count: fallbackLocations.length,
      locations: fallbackLocations,
      isFallback: true,
      warning: "Geocoding service unavailable. Showing standard cities.",
    });
  }
}
