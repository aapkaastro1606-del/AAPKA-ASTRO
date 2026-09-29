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

  test("calculates the 5 classical Auspicious Yogas accurately with genuine ephemeris verification", () => {
    // 1. April 23, 2026 (Thursday): Guru Pushya Yog & Amrit Siddhi formed from 08:57 PM to next sunrise
    const apr23 = computeRealtimePanchang("delhi", "2026-04-23");
    assert.equal(apr23.auspiciousYogas.length, 5);
    const gpApr23 = apr23.auspiciousYogas.find((y) => y.id === "guru_pushya")!;
    const asApr23 = apr23.auspiciousYogas.find((y) => y.id === "amrit_siddhi")!;
    const ssApr23 = apr23.auspiciousYogas.find((y) => y.id === "sarvartha_siddhi")!;
    assert.equal(gpApr23.isActive, true);
    assert.match(gpApr23.timingEn, /08:57\sPM/);
    assert.equal(asApr23.isActive, true);
    assert.match(asApr23.timingEn, /08:57\sPM/);
    assert.equal(ssApr23.isActive, true);
    assert.match(ssApr23.timingEn, /Full Day/i);

    // 2. May 21, 2026 (Thursday): Guru Pushya Yog from Sunrise (05:27 AM) to 02:49 AM next day
    const may21 = computeRealtimePanchang("delhi", "2026-05-21");
    const gpMay21 = may21.auspiciousYogas.find((y) => y.id === "guru_pushya")!;
    assert.equal(gpMay21.isActive, true);
    assert.match(gpMay21.timingEn, /05:27\sAM.*02:49\sAM/);

    // 3. June 18, 2026 (Thursday): Guru Pushya Yog from Sunrise (05:23 AM) to 11:32 AM
    const jun18 = computeRealtimePanchang("delhi", "2026-06-18");
    const gpJun18 = jun18.auspiciousYogas.find((y) => y.id === "guru_pushya")!;
    assert.equal(gpJun18.isActive, true);
    assert.match(gpJun18.timingEn, /05:23\sAM.*11:32\sAM/);

    // 4. January 14, 2026 (Wednesday): Amrit Siddhi & Sarvartha Siddhi (Anuradha Nakshatra)
    const jan14 = computeRealtimePanchang("delhi", "2026-01-14");
    const asJan14 = jan14.auspiciousYogas.find((y) => y.id === "amrit_siddhi")!;
    const ssJan14 = jan14.auspiciousYogas.find((y) => y.id === "sarvartha_siddhi")!;
    assert.equal(asJan14.isActive, true);
    assert.match(asJan14.timingEn, /07:15\sAM.*03:03\sAM/);
    assert.equal(ssJan14.isActive, true);
    assert.match(ssJan14.timingEn, /07:15\sAM.*03:03\sAM/);

    // 5. January 1, 2026 (Thursday): Ravi Yog from 10:48 PM to Next Sunrise
    const jan01 = computeRealtimePanchang("delhi", "2026-01-01");
    const ryJan01 = jan01.auspiciousYogas.find((y) => y.id === "ravi_yog")!;
    assert.equal(ryJan01.isActive, true);
    assert.match(ryJan01.timingEn, /10:48\sPM.*07:14\sAM/);

    // 6. January 4, 2026 (Sunday): Sarvartha Siddhi starts at 03:11 PM
    const jan04 = computeRealtimePanchang("delhi", "2026-01-04");
    const ssJan04 = jan04.auspiciousYogas.find((y) => y.id === "sarvartha_siddhi")!;
    assert.equal(ssJan04.isActive, true);
    assert.match(ssJan04.timingEn, /03:11\sPM/);

    // 7. January 5, 2026 (Monday): Sarvartha Siddhi from Sunrise to 01:24 PM
    const jan05 = computeRealtimePanchang("delhi", "2026-01-05");
    const ssJan05 = jan05.auspiciousYogas.find((y) => y.id === "sarvartha_siddhi")!;
    assert.equal(ssJan05.isActive, true);
    assert.match(ssJan05.timingEn, /07:14\sAM.*01:24\sPM/);

    // 8. April 4, 2026 (Saturday): Sarvartha Siddhi from Sunrise to 09:35 PM
    const apr04 = computeRealtimePanchang("delhi", "2026-04-04");
    const ssApr04 = apr04.auspiciousYogas.find((y) => y.id === "sarvartha_siddhi")!;
    assert.equal(ssApr04.isActive, true);
    assert.match(ssApr04.timingEn, /06:08\sAM.*09:35\sPM/);

    // 9. When a yoga is inactive, isActive is false and never reports false active timings
    assert.equal(jan01.auspiciousYogas.find((y) => y.id === "guru_pushya")!.isActive, false);
    assert.equal(jan04.auspiciousYogas.find((y) => y.id === "guru_pushya")!.isActive, false);
  });
});


