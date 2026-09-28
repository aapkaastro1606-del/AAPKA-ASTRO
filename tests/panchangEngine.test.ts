import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { computeRealtimePanchang, PANCHANG_LOCATIONS } from "../src/lib/astrology/realtimePanchang";

describe("Phase 2: High-Precision Drik Ganita Panchang Engine", () => {
  test("computes complete Panchang with real transition times and Hindi/English labels for New Delhi (2026-09-28)", () => {
    const p = computeRealtimePanchang("delhi", "2026-09-28");

    assert.equal(p.civilDateStr, "2026-09-28");
    assert.equal(p.timeZone, "Asia/Kolkata");
    assert.equal(p.vikramSamvat, 2083);
    assert.equal(p.shakaSamvat, 1948);

    // Sunrise and sunset must be valid HH:MM AM/PM strings, never placeholders
    assert.match(p.sunTimes.sunrise, /^\d{2}:\d{2}\s(AM|PM)$/);
    assert.match(p.sunTimes.sunset, /^\d{2}:\d{2}\s(AM|PM)$/);
    assert.doesNotMatch(p.moonTimes.moonrise, /Active lunar rise/i);
    assert.doesNotMatch(p.moonTimes.moonset, /Active lunar set/i);

    // Transition end times must be real clock times (with optional next-day date), never placeholder strings
    assert.match(p.tithi.endsAt, /\d{2}:\d{2}\s(AM|PM)/);
    assert.match(p.nakshatra.endsAt, /\d{2}:\d{2}\s(AM|PM)/);
    assert.match(p.yoga.endsAt, /\d{2}:\d{2}\s(AM|PM)/);
    assert.match(p.karana.endsAt, /\d{2}:\d{2}\s(AM|PM)/);

    // Bilingual Hindi strings present for all 5 limbs
    assert.ok(p.tithi.nameHindi.length > 0);
    assert.ok(p.nakshatra.nameHindi.length > 0);
    assert.ok(p.yoga.nameHindi.length > 0);
    assert.ok(p.karana.nameHindi.length > 0);
    assert.ok(p.vaarDetails.nameHindi.length > 0);

    // Choghadiya: 8 day + 8 night slots
    assert.equal(p.choghadiya.day.length, 8);
    assert.equal(p.choghadiya.night.length, 8);

    // Chandrabalam: all 12 Rashis evaluated
    assert.equal(p.chandrabalam.length, 12);
  });

  test("correctly formats local times & DST for international locations (London & New York)", () => {
    const londonSummer = computeRealtimePanchang("london", "2026-06-21"); // BST (UTC+1)
    const londonWinter = computeRealtimePanchang("london", "2026-12-21"); // GMT (UTC+0)
    const nySummer = computeRealtimePanchang("new_york", "2026-06-21");   // EDT (UTC-4)

    assert.equal(londonSummer.timeZone, "Europe/London");
    assert.equal(nySummer.timeZone, "America/New_York");

    // In London on June 21 (Summer Solstice), sunrise is early (~04:43 AM BST), whereas on Dec 21 it is late (~08:04 AM GMT)
    assert.match(londonSummer.sunTimes.sunrise, /^04:\d{2}\sAM$/);
    assert.match(londonWinter.sunTimes.sunrise, /^08:\d{2}\sAM$/);
    assert.match(nySummer.sunTimes.sunrise, /^05:\d{2}\sAM$/);
  });

  test("post-midnight end times explicitly show the next calendar day (never bare AM)", () => {
    // Night Choghadiya late slots always cross midnight into the next calendar day
    const p = computeRealtimePanchang("delhi", "2026-09-28");
    const lastNightSlot = p.choghadiya.night[7];
    assert.match(lastNightSlot.period, /\(next day\)/);
    assert.match(lastNightSlot.periodHindi, /\(अगले दिन\)/);
  });

  test("accurately identifies Diwali Amavasya (2026-11-08) and links festivals from single source of truth", () => {
    const diwali = computeRealtimePanchang("delhi", "2026-11-08");
    const hasDiwali = diwali.festivals.some((f) => f.id === "diwali-2026");
    assert.equal(hasDiwali, true, "Must include Diwali from unified festival dataset");
  });

  test("supports all 20 Indian and international locations in PANCHANG_LOCATIONS", () => {
    assert.ok(PANCHANG_LOCATIONS.length >= 20);
    for (const loc of ["delhi", "varanasi", "mumbai", "london", "new_york"]) {
      const res = computeRealtimePanchang(loc, "2026-09-28");
      assert.equal(res.location.id, loc);
    }
  });

  test("Phase 6: caches deterministically by date and rounded coordinates (0.01 deg) with on-demand fallback", async () => {
    const { buildPanchangCacheKey, getPanchangWithCacheMeta } = await import(
      "../src/lib/store/panchangStore"
    );

    const locA = {
      id: "gps-a",
      name: "Connaught Place",
      nameHindi: "कनॉट प्लेस",
      state: "Delhi",
      stateHindi: "दिल्ली",
      lat: 28.6139,
      lon: 77.209,
      timeZone: "Asia/Kolkata",
    };
    const locB = {
      ...locA,
      id: "gps-b",
      lat: 28.6112, // rounds to 28.61
      lon: 77.2084, // rounds to 77.21
    };

    const keyA = buildPanchangCacheKey(locA, "2026-10-15");
    const keyB = buildPanchangCacheKey(locB, "2026-10-15");
    assert.equal(keyA.cacheKey, "panchang:v2:2026-10-15:28.61:77.21:Asia/Kolkata");
    assert.equal(keyA.cacheKey, keyB.cacheKey, "Nearby GPS coordinates within 0.01 deg must share cache key");

    const firstCall = getPanchangWithCacheMeta(locA, "2026-10-15");
    assert.equal(firstCall.cacheStatus, "MISS_COMPUTED_ON_DEMAND");

    const secondCall = getPanchangWithCacheMeta(locB, "2026-10-15");
    assert.equal(secondCall.cacheStatus, "HIT");
    assert.equal(secondCall.data.tithi.name, firstCall.data.tithi.name);
  });
});

