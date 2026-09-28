import { NextRequest, NextResponse } from "next/server";
import {
  getPanchangWithCacheMeta,
  getPanchangCacheStats,
  CustomPanchangLocation,
} from "@/lib/store/panchangStore";
import { PanchangService } from "@/lib/services/panchangService";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || undefined;
    const cityId = searchParams.get("city");
    const latParam = searchParams.get("lat");
    const lonParam = searchParams.get("lon");
    const tzParam = searchParams.get("tz") || searchParams.get("timeZone") || "Asia/Kolkata";

    let locationInput: string | CustomPanchangLocation = "delhi";

    if (cityId) {
      locationInput = cityId;
    } else if (latParam && lonParam) {
      const parsedLat = parseFloat(latParam);
      const parsedLon = parseFloat(lonParam);
      if (Number.isFinite(parsedLat) && Number.isFinite(parsedLon)) {
        locationInput = {
          id: `coord-${parsedLat.toFixed(2)}-${parsedLon.toFixed(2)}`,
          name: searchParams.get("name") || `${parsedLat.toFixed(2)}°N, ${parsedLon.toFixed(2)}°E`,
          nameHindi: searchParams.get("nameHindi") || `${parsedLat.toFixed(2)}°उ, ${parsedLon.toFixed(2)}°पू`,
          state: searchParams.get("state") || "Custom Coordinates",
          stateHindi: searchParams.get("stateHindi") || "चयनित निर्देशांक",
          lat: Number(parsedLat.toFixed(2)),
          lon: Number(parsedLon.toFixed(2)),
          timeZone: tzParam,
        };
      }
    }

    const { data: realtimePanchang, cacheKey, cacheStatus } = getPanchangWithCacheMeta(
      locationInput,
      date
    );
    const legacyReport = await PanchangService.getDailyPanchang(
      date,
      realtimePanchang.location.lat,
      realtimePanchang.location.lon,
      realtimePanchang.location.timeZone
    );

    return NextResponse.json(
      {
        success: true,
        cache: {
          status: cacheStatus,
          key: cacheKey,
          stats: getPanchangCacheStats(),
        },
        panchang: realtimePanchang,
        data: legacyReport,
      },
      {
        headers: {
          "X-Panchang-Cache": cacheStatus,
          "X-Panchang-Cache-Key": cacheKey,
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (err: any) {
    // On-demand fallback to New Delhi Today so API consumers never break
    const fallback = getPanchangWithCacheMeta("delhi");
    return NextResponse.json(
      {
        success: true,
        fallbackUsed: true,
        notice: err?.message || "Invalid parameters; served New Delhi fallback Panchang",
        cache: {
          status: fallback.cacheStatus,
          key: fallback.cacheKey,
        },
        panchang: fallback.data,
      },
      {
        status: 200,
        headers: {
          "X-Panchang-Cache": "FALLBACK_ON_DEMAND",
        },
      }
    );
  }
}
