import {
  computeRealtimePanchang,
  PANCHANG_LOCATIONS,
  PanchangLocation,
  CustomPanchangLocation,
  ChoghadiyaSlot,
  ChandrabalamEntry,
  FestivalOrVratItem,
  AuspiciousYogaItem,
  AuspiciousYogaId,
} from "@/lib/astrology/realtimePanchang";

export type DailyPanchang = ReturnType<typeof computeRealtimePanchang>;

export type {
  PanchangLocation,
  CustomPanchangLocation,
  ChoghadiyaSlot,
  ChandrabalamEntry,
  FestivalOrVratItem,
  AuspiciousYogaItem,
  AuspiciousYogaId,
};

export const CITIES_LIST: PanchangLocation[] = PANCHANG_LOCATIONS;

/**
 * ============================================================================
 * PHASE 6: DETERMINISTIC CACHE (KEYED BY DATE + ROUNDED LOCATION)
 * ============================================================================
 * - Coordinates are rounded to 2 decimal places (~1.1 km precision, < 2s solar
 *   timing variance) so nearby GPS lookups and city presets share cache hits.
 * - Zero database dependency for reads: if the daily cron or PostgreSQL is
 *   unavailable, computation happens deterministically on demand in ~4ms and
 *   populates the cache automatically.
 */

interface CacheEntry<T> {
  value: T;
  createdAtMs: number;
  cacheKey: string;
}

const MAX_PANCHANG_CACHE_ENTRIES = 500;
const PANCHANG_CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

const panchangMemoryCache = new Map<string, CacheEntry<DailyPanchang>>();
let cacheHits = 0;
let cacheMisses = 0;

/**
 * Resolves a normalized date string (YYYY-MM-DD) in the target timezone so
 * cache keys are deterministic for a given calendar day.
 */
export function normalizeDateKey(targetDate?: Date | string, timeZone: string = "Asia/Kolkata"): string {
  if (typeof targetDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(targetDate.trim())) {
    return targetDate.trim();
  }
  const d =
    targetDate instanceof Date && !isNaN(targetDate.getTime())
      ? targetDate
      : typeof targetDate === "string"
      ? new Date(targetDate)
      : new Date();
  const validDate = !isNaN(d.getTime()) ? d : new Date();
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(validDate);
    const y = parts.find((p) => p.type === "year")?.value;
    const m = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;
    if (y && m && day) return `${y}-${m}-${day}`;
  } catch {
    // Fallback to UTC ISO slice
  }
  return validDate.toISOString().slice(0, 10);
}

/**
 * Builds a deterministic cache key from date + rounded (lat, lon) to 0.01° + timezone.
 */
export function buildPanchangCacheKey(
  cityOrCustom: string | CustomPanchangLocation = "delhi",
  targetDate?: Date | string
): {
  cacheKey: string;
  dateKey: string;
  roundedLat: string;
  roundedLon: string;
  timeZone: string;
  resolvedInput: string | CustomPanchangLocation;
} {
  let lat = 28.6139;
  let lon = 77.209;
  let timeZone = "Asia/Kolkata";
  let resolvedInput: string | CustomPanchangLocation = cityOrCustom;

  if (typeof cityOrCustom === "string") {
    const found =
      PANCHANG_LOCATIONS.find((loc) => loc.id.toLowerCase() === cityOrCustom.toLowerCase()) ||
      PANCHANG_LOCATIONS[0];
    lat = found.lat;
    lon = found.lon;
    timeZone = found.timeZone;
    resolvedInput = found.id;
  } else if (cityOrCustom && typeof cityOrCustom === "object") {
    lat = Number.isFinite(cityOrCustom.lat) ? cityOrCustom.lat : 28.6139;
    lon = Number.isFinite(cityOrCustom.lon) ? cityOrCustom.lon : 77.209;
    timeZone = cityOrCustom.timeZone || "Asia/Kolkata";
    resolvedInput = {
      ...cityOrCustom,
      lat: Number(lat.toFixed(2)),
      lon: Number(lon.toFixed(2)),
      timeZone,
    };
  }

  const roundedLat = lat.toFixed(2);
  const roundedLon = lon.toFixed(2);
  const dateKey = normalizeDateKey(targetDate, timeZone);
  const cacheKey = `panchang:v2:${dateKey}:${roundedLat}:${roundedLon}:${timeZone}`;

  return {
    cacheKey,
    dateKey,
    roundedLat,
    roundedLon,
    timeZone,
    resolvedInput,
  };
}

/**
 * Returns the Daily Panchang for any city or custom worldwide location.
 * Uses deterministic caching keyed by `(YYYY-MM-DD, lat.toFixed(2), lon.toFixed(2), timeZone)`
 * and falls back seamlessly to on-demand astronomical computation.
 */
export const getPanchangForCity = (
  cityOrCustom: string | CustomPanchangLocation = "delhi",
  targetDate?: Date | string
): DailyPanchang => {
  const { cacheKey, resolvedInput } = buildPanchangCacheKey(cityOrCustom, targetDate);
  const nowMs = Date.now();

  const existing = panchangMemoryCache.get(cacheKey);
  if (existing && nowMs - existing.createdAtMs < PANCHANG_CACHE_TTL_MS) {
    cacheHits++;
    return existing.value;
  }

  cacheMisses++;
  try {
    const computed = computeRealtimePanchang(resolvedInput, targetDate);

    if (panchangMemoryCache.size >= MAX_PANCHANG_CACHE_ENTRIES) {
      const oldestKey = panchangMemoryCache.keys().next().value;
      if (oldestKey) panchangMemoryCache.delete(oldestKey);
    }
    panchangMemoryCache.set(cacheKey, {
      value: computed,
      createdAtMs: nowMs,
      cacheKey,
    });

    return computed;
  } catch (err) {
    // Ultimate safety net: never allow a page to break even if an invalid date/coord is passed
    return computeRealtimePanchang("delhi");
  }
};

/**
 * Returns metadata alongside the Panchang result for API headers and diagnostics.
 */
export function getPanchangWithCacheMeta(
  cityOrCustom: string | CustomPanchangLocation = "delhi",
  targetDate?: Date | string
): {
  data: DailyPanchang;
  cacheKey: string;
  cacheStatus: "HIT" | "MISS_COMPUTED_ON_DEMAND";
} {
  const { cacheKey } = buildPanchangCacheKey(cityOrCustom, targetDate);
  const nowMs = Date.now();
  const existing = panchangMemoryCache.get(cacheKey);
  const isHit = Boolean(existing && nowMs - existing.createdAtMs < PANCHANG_CACHE_TTL_MS);
  const data = getPanchangForCity(cityOrCustom, targetDate);
  return {
    data,
    cacheKey,
    cacheStatus: isHit ? "HIT" : "MISS_COMPUTED_ON_DEMAND",
  };
}

/**
 * Returns live cache diagnostics for monitoring and verification.
 */
export function getPanchangCacheStats() {
  return {
    entriesCount: panchangMemoryCache.size,
    maxEntries: MAX_PANCHANG_CACHE_ENTRIES,
    ttlSeconds: PANCHANG_CACHE_TTL_MS / 1000,
    cacheHits,
    cacheMisses,
    sampleKeys: Array.from(panchangMemoryCache.keys()).slice(0, 8),
  };
}
