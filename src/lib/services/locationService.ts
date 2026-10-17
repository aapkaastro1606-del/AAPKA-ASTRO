/**
 * ============================================================================
 * UNIVERSAL LOCATION & GEOCODING SERVICE
 * ============================================================================
 * Provides worldwide geocoding resolution for any city, town, or village to
 * precise latitude, longitude, and IANA timezone / UTC offset.
 *
 * Architecture:
 * - Abstracted behind LocationProvider interface (swap OSM/Nominatim, Google Places, Mapbox)
 * - Multi-tiered cache: Fast-path local catalog -> In-memory query cache -> Live Geocoder
 * - Precise IANA timezone lookup via tz-lookup with Date-aware UTC offset
 */

import tzlookup from "tz-lookup";
import { INDIAN_CITIES, CityLocation } from "@/lib/astrology/indianCities";

export interface LocationResult {
  id: string;
  name: string;
  displayName: string;
  state?: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  timezone: number; // UTC offset in hours, e.g. 5.5, -4.0, +1.0
  timezoneId: string; // e.g. "Asia/Kolkata", "America/New_York"
  isFastPath?: boolean;
}

export interface LocationProvider {
  name: string;
  search(query: string, limit?: number): Promise<LocationResult[]>;
  reverse?(latitude: number, longitude: number): Promise<LocationResult | null>;
}

/**
 * Calculates accurate UTC offset in hours for an IANA timezone on a specific date.
 */
export function getTimezoneOffsetHours(timeZone: string, date: Date = new Date()): number {
  try {
    const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
    const tzDate = new Date(date.toLocaleString("en-US", { timeZone }));
    return (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
  } catch {
    // Fallback: If timezone string fails, check for India or return 5.5 default
    if (timeZone.includes("Kolkata") || timeZone.includes("Calcutta") || timeZone === "IST") {
      return 5.5;
    }
    return 0;
  }
}

/**
 * Resolves accurate IANA timezone ID and UTC offset from coordinates.
 */
export function resolveTimezone(lat: number, lon: number, date?: Date): { timezoneId: string; offset: number } {
  try {
    const tzId = tzlookup(lat, lon);
    const offset = getTimezoneOffsetHours(tzId, date);
    return { timezoneId: tzId, offset };
  } catch {
    // Standard approximation if coordinate is near India
    if (lat >= 6 && lat <= 38 && lon >= 68 && lon <= 98) {
      return { timezoneId: "Asia/Kolkata", offset: 5.5 };
    }
    const approxOffset = Math.round(lon / 15);
    return { timezoneId: "UTC", offset: approxOffset };
  }
}

/**
 * 1. Global & Indian Fast-Path Catalog
 * Extends the existing ~50 Indian cities with major diaspora & global cities
 * for instantaneous (<1ms) keystroke matching without network overhead.
 */
const GLOBAL_FAST_PATH: LocationResult[] = [
  // Expanded Indian Major & Secondary Hubs
  ...INDIAN_CITIES.map((c) => ({
    id: `in-${c.name.toLowerCase().replace(/\s+/g, "-")}`,
    name: c.name,
    displayName: `${c.name}, ${c.state}, India`,
    state: c.state,
    country: "India",
    countryCode: "IN",
    latitude: c.latitude,
    longitude: c.longitude,
    timezone: c.timezone,
    timezoneId: "Asia/Kolkata",
    isFastPath: true,
  })),
  // Essential High-Frequency Cities (e.g., Noida, Gurugram, Ayodhya, Rishikesh)
  {
    id: "in-noida",
    name: "Noida",
    displayName: "Noida, Gautam Buddha Nagar, Uttar Pradesh, India",
    state: "Uttar Pradesh",
    country: "India",
    countryCode: "IN",
    latitude: 28.5355,
    longitude: 77.391,
    timezone: 5.5,
    timezoneId: "Asia/Kolkata",
    isFastPath: true,
  },
  {
    id: "in-gurugram",
    name: "Gurugram (Gurgaon)",
    displayName: "Gurugram, Haryana, India",
    state: "Haryana",
    country: "India",
    countryCode: "IN",
    latitude: 28.4595,
    longitude: 77.0266,
    timezone: 5.5,
    timezoneId: "Asia/Kolkata",
    isFastPath: true,
  },
  {
    id: "in-ayodhya",
    name: "Ayodhya",
    displayName: "Ayodhya, Uttar Pradesh, India",
    state: "Uttar Pradesh",
    country: "India",
    countryCode: "IN",
    latitude: 26.7922,
    longitude: 82.1998,
    timezone: 5.5,
    timezoneId: "Asia/Kolkata",
    isFastPath: true,
  },
  {
    id: "in-haridwar",
    name: "Haridwar",
    displayName: "Haridwar, Uttarakhand, India",
    state: "Uttarakhand",
    country: "India",
    countryCode: "IN",
    latitude: 29.9457,
    longitude: 78.1642,
    timezone: 5.5,
    timezoneId: "Asia/Kolkata",
    isFastPath: true,
  },
  {
    id: "in-rishikesh",
    name: "Rishikesh",
    displayName: "Rishikesh, Dehradun, Uttarakhand, India",
    state: "Uttarakhand",
    country: "India",
    countryCode: "IN",
    latitude: 30.0869,
    longitude: 78.2676,
    timezone: 5.5,
    timezoneId: "Asia/Kolkata",
    isFastPath: true,
  },
  {
    id: "in-ujjain",
    name: "Ujjain",
    displayName: "Ujjain, Madhya Pradesh, India",
    state: "Madhya Pradesh",
    country: "India",
    countryCode: "IN",
    latitude: 23.1765,
    longitude: 75.7885,
    timezone: 5.5,
    timezoneId: "Asia/Kolkata",
    isFastPath: true,
  },
  // Major Global Cities for International & Diaspora Seekers
  {
    id: "uk-london",
    name: "London",
    displayName: "London, Greater London, England, United Kingdom",
    state: "England",
    country: "United Kingdom",
    countryCode: "GB",
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 0.0,
    timezoneId: "Europe/London",
    isFastPath: true,
  },
  {
    id: "us-new-york",
    name: "New York",
    displayName: "New York, New York, United States",
    state: "New York",
    country: "United States",
    countryCode: "US",
    latitude: 40.7128,
    longitude: -74.006,
    timezone: -5.0,
    timezoneId: "America/New_York",
    isFastPath: true,
  },
  {
    id: "us-san-francisco",
    name: "San Francisco",
    displayName: "San Francisco, California, United States",
    state: "California",
    country: "United States",
    countryCode: "US",
    latitude: 37.7749,
    longitude: -122.4194,
    timezone: -8.0,
    timezoneId: "America/Los_Angeles",
    isFastPath: true,
  },
  {
    id: "ae-dubai",
    name: "Dubai",
    displayName: "Dubai, United Arab Emirates",
    country: "United Arab Emirates",
    countryCode: "AE",
    latitude: 25.2048,
    longitude: 55.2708,
    timezone: 4.0,
    timezoneId: "Asia/Dubai",
    isFastPath: true,
  },
  {
    id: "ca-toronto",
    name: "Toronto",
    displayName: "Toronto, Ontario, Canada",
    state: "Ontario",
    country: "Canada",
    countryCode: "CA",
    latitude: 43.6532,
    longitude: -79.3832,
    timezone: -5.0,
    timezoneId: "America/Toronto",
    isFastPath: true,
  },
  {
    id: "sg-singapore",
    name: "Singapore",
    displayName: "Singapore, Singapore",
    country: "Singapore",
    countryCode: "SG",
    latitude: 1.3521,
    longitude: 103.8198,
    timezone: 8.0,
    timezoneId: "Asia/Singapore",
    isFastPath: true,
  },
  {
    id: "au-sydney",
    name: "Sydney",
    displayName: "Sydney, New South Wales, Australia",
    state: "New South Wales",
    country: "Australia",
    countryCode: "AU",
    latitude: -33.8688,
    longitude: 151.2093,
    timezone: 10.0,
    timezoneId: "Australia/Sydney",
    isFastPath: true,
  },
  {
    id: "np-kathmandu",
    name: "Kathmandu",
    displayName: "Kathmandu, Bagmati Province, Nepal",
    state: "Bagmati",
    country: "Nepal",
    countryCode: "NP",
    latitude: 27.7172,
    longitude: 85.324,
    timezone: 5.75,
    timezoneId: "Asia/Kathmandu",
    isFastPath: true,
  },
];

/**
 * 2. Nominatim Sequential Throttle Queue (1 request per second max)
 * OSM Nominatim Usage Policy strictly forbids more than 1 request per second.
 */
class NominatimThrottleQueue {
  private static lastRequestTimestamp = 0;
  private static queue: Promise<any> = Promise.resolve();

  public static enqueue<T>(task: () => Promise<T>): Promise<T> {
    const runTask = async (): Promise<T> => {
      const now = Date.now();
      const elapsed = now - NominatimThrottleQueue.lastRequestTimestamp;
      const minIntervalMs = 1000; // 1 second throttle

      if (elapsed < minIntervalMs) {
        const waitTime = minIntervalMs - elapsed;
        await new Promise((r) => setTimeout(r, waitTime));
      }

      NominatimThrottleQueue.lastRequestTimestamp = Date.now();
      return task();
    };

    const nextPromise = NominatimThrottleQueue.queue.then(runTask, runTask);
    NominatimThrottleQueue.queue = nextPromise.catch(() => {});
    return nextPromise;
  }
}

/**
 * OpenStreetMap Nominatim Geocoding Provider
 * Enforces valid User-Agent, sequential 1 req/sec throttle, and 6-second timeout.
 */
export class NominatimLocationProvider implements LocationProvider {
  public name = "OpenStreetMap Nominatim";

  public async search(query: string, limit: number = 8): Promise<LocationResult[]> {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return [];

    return NominatimThrottleQueue.enqueue(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          trimmed
        )}&format=json&addressdetails=1&limit=${limit}&accept-language=en`;

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            "User-Agent": "AapkaAstro/1.0 (contact: support@aapkaastro.com; Vedic Astrology Platform)",
            Accept: "application/json",
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          console.warn(`[Nominatim Geocoder] HTTP ${response.status}: ${response.statusText}`);
          return [];
        }

        const data = await response.json();
        if (!Array.isArray(data)) return [];

        return data.map((item: any) => {
          const lat = parseFloat(item.lat);
          const lon = parseFloat(item.lon);
          const tz = resolveTimezone(lat, lon);

          const addr = item.address || {};
          const cityName =
            addr.city ||
            addr.town ||
            addr.village ||
            addr.suburb ||
            addr.municipality ||
            addr.county ||
            item.name ||
            trimmed;

          const stateName = addr.state || addr.province || addr.region;
          const countryName = addr.country || "Unknown";
          const countryCode = (addr.country_code || "").toUpperCase();

          return {
            id: `osm-${item.place_id || `${lat}-${lon}`}`,
            name: cityName,
            displayName: item.display_name,
            state: stateName,
            country: countryName,
            countryCode,
            latitude: Number(lat.toFixed(4)),
            longitude: Number(lon.toFixed(4)),
            timezone: tz.offset,
            timezoneId: tz.timezoneId,
            isFastPath: false,
          };
        });
      } catch (err: any) {
        clearTimeout(timeoutId);
        console.warn("[Nominatim Geocoding Error]:", err?.message || err);
        return [];
      }
    });
  }
}

/**
 * Google Maps Geocoding Provider (Swappable via GEOCODER_PROVIDER="google")
 */
export class GoogleLocationProvider implements LocationProvider {
  public name = "Google Geocoding API";
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public async search(query: string, limit: number = 8): Promise<LocationResult[]> {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return [];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        trimmed
      )}&key=${this.apiKey}`;

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) return [];
      const data = await res.json();
      if (!Array.isArray(data.results)) return [];

      return data.results.slice(0, limit).map((item: any) => {
        const lat = item.geometry?.location?.lat || 0;
        const lon = item.geometry?.location?.lng || 0;
        const tz = resolveTimezone(lat, lon);

        let cityName = trimmed;
        let stateName = "";
        let countryName = "Unknown";
        let countryCode = "";

        for (const comp of item.address_components || []) {
          if (comp.types.includes("locality")) cityName = comp.long_name;
          if (comp.types.includes("administrative_area_level_1")) stateName = comp.long_name;
          if (comp.types.includes("country")) {
            countryName = comp.long_name;
            countryCode = comp.short_name;
          }
        }

        return {
          id: `goog-${item.place_id || `${lat}-${lon}`}`,
          name: cityName,
          displayName: item.formatted_address,
          state: stateName,
          country: countryName,
          countryCode,
          latitude: Number(lat.toFixed(4)),
          longitude: Number(lon.toFixed(4)),
          timezone: tz.offset,
          timezoneId: tz.timezoneId,
          isFastPath: false,
        };
      });
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.warn("[Google Geocoding Error]:", err?.message || err);
      return [];
    }
  }
}

/**
 * Mock / Fast-Path Location Provider (For Offline / Test Environments)
 */
export class MockLocationProvider implements LocationProvider {
  public name = "Mock / Fast-Path Geocoder";

  public async search(query: string, limit: number = 8): Promise<LocationResult[]> {
    const q = query.trim().toLowerCase();
    return GLOBAL_FAST_PATH.filter(
      (c) =>
        c.name.toLowerCase().startsWith(q) ||
        c.displayName.toLowerCase().includes(q) ||
        (c.state && c.state.toLowerCase().startsWith(q))
    ).slice(0, limit);
  }
}

/**
 * Factory to instantiate swappable geocoding provider based on GEOCODER_PROVIDER
 */
export function resolveDefaultProvider(): LocationProvider {
  const providerType = (
    process.env.GEOCODER_PROVIDER ||
    (process.env.NODE_ENV === "test" ? "mock" : "nominatim")
  ).toLowerCase();
  const apiKey = process.env.GEOCODER_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

  if (providerType === "google" && apiKey) {
    return new GoogleLocationProvider(apiKey);
  }

  if (providerType === "mock") {
    return new MockLocationProvider();
  }

  return new NominatimLocationProvider();
}

export interface LocationSearchResult {
  locations: LocationResult[];
  isFallback: boolean;
  warning?: string;
}

/**
 * 3. Master LocationService Class
 * Integrates multi-tiered caching: Fast-path -> In-memory -> PostgreSQL database cache -> Geocoding provider.
 */
export class LocationService {
  private static provider: LocationProvider = resolveDefaultProvider();
  private static queryCache: Map<string, { timestamp: number; results: LocationResult[] }> = new Map();
  private static CACHE_TTL_MS = 1000 * 60 * 60; // 1 Hour in-memory
  private static DB_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 Days in DB

  /**
   * Set or swap active provider (e.g. Nominatim, Google Places, Mock)
   */
  public static setProvider(newProvider: LocationProvider): void {
    this.provider = newProvider;
  }

  /**
   * Get active provider name
   */
  public static getProviderName(): string {
    return this.provider.name;
  }

  /**
   * Query database cache with graceful try/catch isolation
   */
  private static async getFromDatabaseCache(query: string): Promise<LocationResult[] | null> {
    try {
      const { prisma } = await import("@/lib/db/prisma");
      if (!prisma || !prisma.geocodeCache) return null;

      const q = query.toLowerCase().trim();
      const cached = await prisma.geocodeCache.findUnique({
        where: { query: q },
      });

      if (cached && Array.isArray(cached.results)) {
        const isFresh = Date.now() - new Date(cached.updatedAt).getTime() < this.DB_CACHE_TTL_MS;
        if (isFresh && cached.results.length > 0) {
          return cached.results as unknown as LocationResult[];
        }
      }
    } catch {
      // Graceful degradation: fail silently if table is not yet created or DB asleep
    }
    return null;
  }

  /**
   * Save geocoded results into PostgreSQL database cache
   */
  private static async saveToDatabaseCache(
    query: string,
    results: LocationResult[],
    providerName: string
  ): Promise<void> {
    if (results.length === 0) return;
    try {
      const { prisma } = await import("@/lib/db/prisma");
      if (!prisma || !prisma.geocodeCache) return;

      const q = query.toLowerCase().trim();
      await prisma.geocodeCache.upsert({
        where: { query: q },
        create: {
          query: q,
          results: results as any,
          provider: providerName,
        },
        update: {
          results: results as any,
          provider: providerName,
        },
      });
    } catch {
      // Graceful degradation: do not throw on DB save failure
    }
  }

  /**
   * Searches locations with status metadata (isFallback and clear warning when provider is unavailable).
   */
  public static async searchWithStatus(query: string, limit: number = 8): Promise<LocationSearchResult> {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return { locations: [], isFallback: false };

    // 1. Check local fast-path catalog (< 1ms)
    const fastPathMatches = GLOBAL_FAST_PATH.filter(
      (c) =>
        c.name.toLowerCase().startsWith(q) ||
        c.displayName.toLowerCase().includes(q) ||
        (c.state && c.state.toLowerCase().startsWith(q))
    ).slice(0, limit);

    // If fast-path provides full quota or exact prefix match for short query, return immediately
    if (fastPathMatches.length >= limit) {
      return { locations: fastPathMatches, isFallback: false };
    }

    // 2. Check in-memory query cache
    const memCached = this.queryCache.get(q);
    if (memCached && Date.now() - memCached.timestamp < this.CACHE_TTL_MS) {
      return {
        locations: this.mergeResults(fastPathMatches, memCached.results, limit),
        isFallback: false,
      };
    }

    // 3. Check persistent PostgreSQL database cache
    const dbCached = await this.getFromDatabaseCache(q);
    if (dbCached && dbCached.length > 0) {
      // Populate memory cache
      this.queryCache.set(q, { timestamp: Date.now(), results: dbCached });
      return {
        locations: this.mergeResults(fastPathMatches, dbCached, limit),
        isFallback: false,
      };
    }

    // 4. Query active Geocoding Provider
    try {
      const providerResults = await this.provider.search(query, limit);

      if (providerResults && providerResults.length > 0) {
        // Cache to memory
        this.queryCache.set(q, { timestamp: Date.now(), results: providerResults });
        // Cache asynchronously to database
        this.saveToDatabaseCache(q, providerResults, this.provider.name).catch(() => {});

        return {
          locations: this.mergeResults(fastPathMatches, providerResults, limit),
          isFallback: false,
        };
      }

      // If provider returned 0 results, fall back to matching from built-in cities
      if (fastPathMatches.length > 0) {
        return { locations: fastPathMatches, isFallback: false };
      }

      return { locations: [], isFallback: false };
    } catch (err: any) {
      console.warn(
        `[LocationService] Geocoder '${this.provider.name}' failed. Falling back to built-in city list:`,
        err?.message || err
      );

      // Return fast-path matches with clear user warning
      return {
        locations: fastPathMatches.length > 0 ? fastPathMatches : [GLOBAL_FAST_PATH[0]],
        isFallback: true,
        warning: "Geocoding service unavailable. Showing standard city list.",
      };
    }
  }

  /**
   * Backward-compatible search method returning LocationResult[]
   */
  public static async search(query: string, limit: number = 8): Promise<LocationResult[]> {
    const res = await this.searchWithStatus(query, limit);
    return res.locations;
  }

  /**
   * Merges and deduplicates results prioritizing fast-path matches.
   */
  private static mergeResults(
    fastPath: LocationResult[],
    live: LocationResult[],
    limit: number
  ): LocationResult[] {
    const seen = new Set<string>();
    const merged: LocationResult[] = [];

    for (const item of fastPath) {
      const key = `${item.name.toLowerCase()}-${item.countryCode.toLowerCase()}`;
      seen.add(key);
      merged.push(item);
    }

    for (const item of live) {
      const key = `${item.name.toLowerCase()}-${item.countryCode.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(item);
      }
    }

    return merged.slice(0, limit);
  }

  /**
   * Resolves fallback location if user submits raw text without selecting from dropdown.
   */
  public static resolveFallback(placeName: string): LocationResult {
    const lower = placeName.trim().toLowerCase();
    const match = GLOBAL_FAST_PATH.find(
      (c) => c.name.toLowerCase() === lower || c.displayName.toLowerCase().includes(lower)
    );

    if (match) return match;

    // Default to New Delhi if unresolvable
    return GLOBAL_FAST_PATH[0];
  }

  /**
   * Resolves GPS coordinates (from explicit "Use my location" click) to a LocationResult
   * using Haversine nearest-city check + tz-lookup timezone resolution.
   */
  public static async reverseGeocode(latitude: number, longitude: number): Promise<LocationResult> {
    const { timezoneId, offset } = resolveTimezone(latitude, longitude);

    // Check if within ~25 km of a known city in GLOBAL_FAST_PATH
    let nearest = GLOBAL_FAST_PATH[0];
    let minSqDist = Infinity;
    for (const c of GLOBAL_FAST_PATH) {
      const dLat = c.latitude - latitude;
      const dLon = c.longitude - longitude;
      const sq = dLat * dLat + dLon * dLon;
      if (sq < minSqDist) {
        minSqDist = sq;
        nearest = c;
      }
    }

    if (minSqDist <= 0.08) {
      return {
        ...nearest,
        latitude,
        longitude,
        timezoneId,
        timezone: offset,
      };
    }

    if (this.provider.reverse) {
      try {
        const rev = await this.provider.reverse(latitude, longitude);
        if (rev) return rev;
      } catch {
        // Fallback below
      }
    }

    return {
      id: `gps-${latitude.toFixed(2)}-${longitude.toFixed(2)}`,
      name: `${nearest.name} Area (${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E)`,
      displayName: `${nearest.name} Region (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`,
      state: nearest.state,
      country: nearest.country,
      countryCode: nearest.countryCode,
      latitude,
      longitude,
      timezone: offset,
      timezoneId,
    };
  }
}
