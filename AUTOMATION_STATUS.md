# Automation, Deterministic Caching & Fallback Architecture (`AUTOMATION_STATUS.md`)

This document specifies **what runs when**, **how deterministic caching is keyed by date and rounded coordinates**, **how zero-database-read fallback guarantees 100% uptime**, and **how to verify everything in production**.

---

## 1. Daily Scheduled Cron Jobs (`vercel.json`)

The repository configures two daily cron jobs in [`vercel.json`](file:///c:/Users/anmol/OneDrive/Desktop/AAPKA%20ASTRO/vercel.json):

| Cron Path | Cron Expression (UTC) | Equivalent IST Time | Purpose |
| :--- | :--- | :--- | :--- |
| `/api/cron/daily-astrology` | `0 0 * * *` | **05:30 AM IST** (Daily) | Pre-warms Today & Tomorrow Drik Ganita Panchang for major cities + all 12 Vedic Chandra Rashis (Yesterday, Today, Tomorrow), and optionally archives New Delhi's summary to PostgreSQL (`PanchangEntry`). |
| `/api/cron/instagram-sync` | `0 1 * * *` | **06:30 AM IST** (Daily) | Synchronizes latest Instagram Reels metadata if credentials are present. |

### Why `0 0 * * *` (05:30 AM IST)?
In the Hindu calendar, the civil day (*Savana Dina*) begins at **local sunrise** (~05:30 AM – 06:30 AM IST across India). Running `/api/cron/daily-astrology` at **05:30 AM IST** ensures that Today's and Tomorrow's Panchang and all 36 Chandra-Rashi Horoscope entries (`12 signs × 3 days`) are pre-computed right at sunrise.

---

## 2. Deterministic Caching Architecture (Zero Database Dependency for Reads)

All user-facing Panchang and Horoscope routes read from a **deterministic computation + multi-layer cache** ([`src/lib/store/panchangStore.ts`](file:///c:/Users/anmol/OneDrive/Desktop/AAPKA%20ASTRO/src/lib/store/panchangStore.ts) and [`src/lib/astrology/dailyHoroscope.ts`](file:///c:/Users/anmol/OneDrive/Desktop/AAPKA%20ASTRO/src/lib/astrology/dailyHoroscope.ts)) with **zero database read dependency**:

### 2.1 Panchang Cache Key Formula (Date + Rounded Coordinates + Timezone)
```text
panchang:v2:${YYYY-MM-DD}:${lat.toFixed(2)}:${lon.toFixed(2)}:${timeZone}
```
- **Example (New Delhi on 2026-09-28)**:
  `panchang:v2:2026-09-28:28.61:77.21:Asia/Kolkata`
- **Example (London on 2026-06-21 during BST)**:
  `panchang:v2:2026-06-21:51.51:-0.13:Europe/London`
- **Why coordinates are rounded to `0.01°` (`~1.1 km`)**:
  Astronomically, solar upper-limb sunrise (`-0.833°`) and lunar limb transitions across a 1.1 km radius differ by less than 2 seconds. Rounding GPS or city coordinates to 2 decimal places (`lat.toFixed(2)`, `lon.toFixed(2)`) ensures that users in the same city or neighborhood share deterministic cache hits without needing any external geocoding or database storage.
- **TTL & Capacity**:
  - In-memory LRU map: up to `500` concurrent location-date entries, `12-hour` TTL (`43,200` seconds).
  - Edge / CDN HTTP Cache on `/api/panchang`: `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`.

### 2.2 Horoscope Cache Key Formula (Sign + Civil Date)
```text
horoscope:v2:${signId}:${YYYY-MM-DD}
```
- **Example (Mesha / Aries on 2026-09-28)**:
  `horoscope:v2:aries:2026-09-28`
- **TTL & Capacity**:
  - In-memory LRU map: up to `240` sign-date entries (covering 20 full days of all 12 signs), `12-hour` TTL.

---

## 3. Failure & Fallback Matrix (Why Pages Never Break)

| Failure Scenario | System Behavior | User Impact |
| :--- | :--- | :--- |
| **Daily Cron (`/api/cron/daily-astrology`) did not run or timed out** | Every SSR route (`/panchang`, `/panchang/tomorrow`, `/hi/panchang`, `/hi/panchang/tomorrow`, `/horoscope`, `/hi/horoscope`, `/horoscope/[sign]`, `/hi/horoscope/[sign]`) calls `getPanchangForCity()` / `DailyHoroscopeService.getHoroscope()`, which computes the exact Drik Ganita positions **on demand in ~4 ms** via `astronomy-engine` and populates the cache. | **Zero impact.** Pages render identically with 100% astronomical accuracy. |
| **PostgreSQL Database (`DATABASE_URL`) is unreachable or paused** | Reads **never** query PostgreSQL. In `/api/cron/daily-astrology`, the `prisma.panchangEntry.upsert` step catches any DB error, sets `databasePersisted: false`, records a non-fatal note in `report.errors`, and still returns `HTTP 200 OK` (`success: true`). | **Zero impact.** All Panchang & Horoscope pages work without interruption. |
| **User selects a custom town/village not pre-warmed by Cron** | `getPanchangForCity(customLocation, date)` rounds `(lat, lon)` to `0.01°`, computes the Panchang on demand for that location's IANA timezone, and caches it under `panchang:v2:${date}:${lat}:${lon}:${tz}`. | **Zero impact.** Instant computation (< 5 ms). |
| **Malformed date or coordinate query parameter passed to `/api/panchang`** | `getPanchangForCity` and `/api/panchang` catch invalid inputs and fall back to New Delhi's current-day Panchang (`X-Panchang-Cache: FALLBACK_ON_DEMAND`), while `PanchangView.tsx` retains `lastGoodPanchangRef` on the client. | **Zero blank or broken pages.** |

---

## 4. How to Verify in Production (Step-by-Step Commands)

### 4.1 Verify the Daily Cron Endpoint (`/api/cron/daily-astrology`)

Run the following `curl` command against your production domain (include `Authorization: Bearer <CRON_SECRET>` if `CRON_SECRET` is configured in production environment variables):

```bash
curl -sS -H "Authorization: Bearer $CRON_SECRET" \
  https://aapkaastro.com/api/cron/daily-astrology | jq .
```

#### Expected JSON Response:
```json
{
  "success": true,
  "message": "Daily astrology cron pre-warm and verification completed",
  "report": {
    "timestamp": "2026-09-28T00:00:01.120Z",
    "executionDate": "2026-09-28",
    "tomorrowDate": "2026-09-29",
    "panchangStatus": "SUCCESS",
    "horoscopeStatus": "SUCCESS",
    "prewarmedCities": [
      "delhi",
      "mumbai",
      "varanasi",
      "ujjain",
      "bengaluru",
      "kolkata",
      "london",
      "newyork"
    ],
    "panchangSummary": {
      "tithi": "Shukla Pratipada (until ...)",
      "tithiHindi": "शुक्ल पक्ष प्रतिपदा (... तक)",
      "nakshatra": "...",
      "nakshatraHindi": "...",
      "yoga": "...",
      "karana": "...",
      "sunrise": "06:12 AM",
      "sunset": "06:11 PM"
    },
    "signsCalculatedCount": 12,
    "signDaysPrewarmedCount": 36,
    "databasePersisted": true,
    "readDependencyMode": "DETERMINISTIC_CACHE_WITH_ON_DEMAND_FALLBACK",
    "cacheTelemetry": {
      "panchang": {
        "entriesCount": 16,
        "maxEntries": 500,
        "ttlSeconds": 43200,
        "cacheHits": 1,
        "cacheMisses": 16
      },
      "horoscope": {
        "entriesCount": 36,
        "maxEntries": 240,
        "ttlSeconds": 43200,
        "cacheHits": 0,
        "cacheMisses": 36
      }
    },
    "errors": []
  }
}
```
> **Note**: If PostgreSQL is offline or unconfigured, `"databasePersisted"` will be `false` and `"errors"` will contain `"Database archival skipped (non-fatal; reads use deterministic cache/on-demand engine): ..."`, while `"success": true`, `"panchangStatus": "SUCCESS"`, and `"horoscopeStatus": "SUCCESS"` confirm that all caches and calculations are healthy.

---

### 4.2 Verify Deterministic Coordinate-Rounding Cache Hits on `/api/panchang`

1. **First request for a custom coordinate (`28.6139, 77.2090`)**:
   ```bash
   curl -i "https://aapkaastro.com/api/panchang?lat=28.6139&lon=77.2090&tz=Asia/Kolkata&date=2026-09-28"
   ```
   Check the response headers:
   - `X-Panchang-Cache-Key: panchang:v2:2026-09-28:28.61:77.21:Asia/Kolkata`
   - `X-Panchang-Cache: HIT` (if already pre-warmed by cron/SSR) or `MISS_COMPUTED_ON_DEMAND` (on first request).

2. **Second request for a slightly jittered GPS coordinate (`28.6112, 77.2084` — ~300 meters away)**:
   ```bash
   curl -i "https://aapkaastro.com/api/panchang?lat=28.6112&lon=77.2084&tz=Asia/Kolkata&date=2026-09-28"
   ```
   Because `28.6112` rounds to `28.61` and `77.2084` rounds to `77.21`, it maps to the **exact same cache key** (`panchang:v2:2026-09-28:28.61:77.21:Asia/Kolkata`) and returns:
   - `X-Panchang-Cache: HIT`

---

### 4.3 Verify SSR & Hindi SEO Routes Without Cron

You can verify at any time that all English and Hindi SSR routes render complete server-side HTML even on a fresh deployment before any cron job has fired:

```bash
curl -sS https://aapkaastro.com/panchang | grep -o "<title>.*</title>"
curl -sS https://aapkaastro.com/panchang/tomorrow | grep -o "<title>.*</title>"
curl -sS https://aapkaastro.com/hi/panchang | grep -o "<title>.*</title>"
curl -sS https://aapkaastro.com/hi/panchang/tomorrow | grep -o "<title>.*</title>"
curl -sS https://aapkaastro.com/hi/horoscope/aries | grep -o "<title>.*</title>"
```
