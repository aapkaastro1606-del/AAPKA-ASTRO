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
 * 2. OpenStreetMap Nominatim Geocoding Provider
 * Free, worldwide, resolves any village, town, or city without API keys.
 */
export class NominatimLocationProvider implements LocationProvider {
  public name = "OpenStreetMap Nominatim";

  public async search(query: string, limit: number = 8): Promise<LocationResult[]> {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return [];

    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        trimmed
      )}&format=json&addressdetails=1&limit=${limit}&accept-language=en`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "AapkaAstro-Geocoder/1.0 (contact@aapkaastro.com; Vedic Astrology Platform)",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
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
    } catch (err) {
      console.warn("Nominatim Geocoding error:", err);
      return [];
    }
  }
}

/**
 * 3. Master LocationService Class
 * Integrates fast-path caching with the active geocoding provider.
 */
export class LocationService {
  private static provider: LocationProvider = new NominatimLocationProvider();
  private static queryCache: Map<string, { timestamp: number; results: LocationResult[] }> = new Map();
  private static CACHE_TTL_MS = 1000 * 60 * 60; // 1 Hour

  /**
   * Set a custom provider (e.g. Google Places, Photon, Mapbox)
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
   * Searches for matching locations across fast-path cache and the geocoding provider.
   */
  public static async search(query: string, limit: number = 8): Promise<LocationResult[]> {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return [];

    // Check fast-path catalog first
    const fastPathMatches = GLOBAL_FAST_PATH.filter(
      (c) =>
        c.name.toLowerCase().startsWith(q) ||
        c.displayName.toLowerCase().includes(q) ||
        (c.state && c.state.toLowerCase().startsWith(q))
    ).slice(0, limit);

    // If fast-path provides exact/high confidence matches and query is short, return immediately
    if (fastPathMatches.length >= limit) {
      return fastPathMatches;
    }

    // Check query cache
    const cached = this.queryCache.get(q);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return this.mergeResults(fastPathMatches, cached.results, limit);
    }

    // Query active geocoding provider
    try {
      const providerResults = await this.provider.search(query, limit);

      // Cache the geocoded result
      this.queryCache.set(q, {
        timestamp: Date.now(),
        results: providerResults,
      });

      return this.mergeResults(fastPathMatches, providerResults, limit);
    } catch {
      return fastPathMatches;
    }
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
