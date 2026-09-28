import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { computeRealtimePanchang } from "../src/lib/astrology/realtimePanchang";
import { DailyHoroscopeService, ZODIAC_SIGNS } from "../src/lib/astrology/dailyHoroscope";
import {
  TITHIS_30,
  PAKSHAS_2,
  NAKSHATRAS_27,
  YOGAS_27,
  KARANAS_11,
  VARAS_7,
  MASAS_12,
  RITUS_6,
  RASHIS_12,
  GRAHAS_9,
  CHOGHADIYAS_7,
} from "../src/lib/i18n/vedicGlossary";

function devanagariRatio(text: string): number {
  const devanagariChars = (text.match(/[\u0900-\u097F]/g) || []).length;
  const latinChars = (text.match(/[A-Za-z]/g) || []).length;
  const totalAlpha = devanagariChars + latinChars;
  return totalAlpha === 0 ? 1 : devanagariChars / totalAlpha;
}

describe("Verification Deliverables Suite (All Mandatory Checks)", () => {
  test("1. Glossary completeness: every Tithi, Nakshatra, Yoga, Karana, Vara, Masa, Ritu, Rashi, Graha & Choghadiya has both English and Devanagari Hindi", () => {
    const collections = [
      { name: "Tithi (30)", items: TITHIS_30, count: 30 },
      { name: "Paksha (2)", items: PAKSHAS_2, count: 2 },
      { name: "Nakshatra (27)", items: NAKSHATRAS_27, count: 27 },
      { name: "Yoga (27)", items: YOGAS_27, count: 27 },
      { name: "Karana (11)", items: KARANAS_11, count: 11 },
      { name: "Vara (7)", items: VARAS_7, count: 7 },
      { name: "Masa (12)", items: MASAS_12, count: 12 },
      { name: "Ritu (6)", items: RITUS_6, count: 6 },
      { name: "Rashi (12)", items: RASHIS_12, count: 12 },
      { name: "Graha (9)", items: GRAHAS_9, count: 9 },
      { name: "Choghadiya (7)", items: CHOGHADIYAS_7, count: 7 },
    ];

    for (const col of collections) {
      assert.equal(col.items.length, col.count, `${col.name} must have ${col.count} items`);
      for (const item of col.items) {
        assert.ok(item.en && item.en.trim().length > 0, `${col.name} missing English label`);
        assert.ok(item.hi && item.hi.trim().length > 0, `${col.name} missing Hindi label`);
        assert.equal(
          devanagariRatio(item.hi),
          1,
          `${col.name} Hindi term '${item.hi}' must be 100% Devanagari`
        );
      }
    }
  });

  test("2. Hindi pages/data contain predominantly Devanagari text (>98% Devanagari ratio, 0% Latin fallback)", () => {
    const panchang = computeRealtimePanchang("delhi", "2026-09-28");
    const hindiCorpus = [
      panchang.tithi.nameHindi,
      panchang.tithi.pakshaHindi,
      panchang.tithi.endsAtHindi,
      panchang.nakshatra.nameHindi,
      panchang.yoga.nameHindi,
      panchang.karana.nameHindi,
      panchang.vaarHindi,
      panchang.specialSignificanceHindi,
      ...ZODIAC_SIGNS.map((s) => {
        const h = DailyHoroscopeService.getHoroscope(s.id, "2026-09-28")!;
        return `${h.summaryHindi} ${h.career.descriptionHindi} ${h.love.descriptionHindi} ${h.health.descriptionHindi} ${h.finance.descriptionHindi} ${h.remedyHindi}`;
      }),
    ].join(" ");

    const ratio = devanagariRatio(hindiCorpus);
    assert.ok(ratio > 0.99, `Expected Devanagari ratio > 0.99, got ${ratio}`);
  });

  test("3. Kshaya Tithi, Vriddhi Tithi, and Two-Nakshatra-Changes handling", () => {
    // Kshaya Tithi on 2026-01-06 in New Delhi (Chaturthi begins 08:02 AM & ends 06:52 AM Jan 7 before next sunrise)
    const kshayaDay = computeRealtimePanchang("delhi", "2026-01-06");
    assert.equal(kshayaDay.tithi.anomaly, "Kshaya");
    assert.equal(kshayaDay.tithi.name, "Tritiya");
    assert.equal(kshayaDay.tithi.endsAt, "08:02 AM");
    assert.match(kshayaDay.tithi.anomalyNoteEn, /Chaturthi begins at 08:02 AM and ends at 06:52 AM/);

    // Vriddhi Tithi on 2026-01-09 in New Delhi (Saptami spans both Jan 9 and Jan 10 sunrises)
    const vriddhiDay = computeRealtimePanchang("delhi", "2026-01-09");
    assert.equal(vriddhiDay.tithi.anomaly, "Vriddhi");
    assert.equal(vriddhiDay.tithi.name, "Saptami");
    assert.match(vriddhiDay.tithi.endsAt, /08:24 AM, Jan 10 \(next day\)/);

    // Two Nakshatra transitions on 2026-01-29 in New Delhi (Rohini -> Mrigashira -> Ardra)
    const twoNakDay = computeRealtimePanchang("delhi", "2026-01-29");
    assert.equal(twoNakDay.nakshatra.hasTwoTransitionsInDay, true);
    assert.equal(twoNakDay.nakshatra.name, "Rohini");
    assert.equal(twoNakDay.nakshatra.endsAt, "07:31 AM");
    assert.equal(twoNakDay.nakshatra.nextNakshatra, "Mrigashira");
    assert.match(twoNakDay.nakshatra.secondEndsAt!, /05:29 AM, Jan 30 \(next day\)/);
    assert.equal(twoNakDay.nakshatra.thirdNakshatra, "Ardra");
  });

  test("4. DST correctness for London (BST UTC+1 vs GMT UTC+0) and New York (EDT UTC-4 vs EST UTC-5)", () => {
    const londonSummer = computeRealtimePanchang("london", "2026-06-21");
    const londonWinter = computeRealtimePanchang("london", "2026-12-21");
    assert.equal(londonSummer.sunTimes.sunrise, "04:43 AM");
    assert.equal(londonSummer.sunTimes.sunset, "09:21 PM");
    assert.equal(londonWinter.sunTimes.sunrise, "08:03 AM");
    assert.equal(londonWinter.sunTimes.sunset, "03:53 PM");

    const nySummer = computeRealtimePanchang("new_york", "2026-06-21");
    const nyWinter = computeRealtimePanchang("new_york", "2026-12-21");
    assert.equal(nySummer.sunTimes.sunrise, "05:25 AM");
    assert.equal(nySummer.sunTimes.sunset, "08:30 PM");
    assert.equal(nyWinter.sunTimes.sunrise, "07:16 AM");
    assert.equal(nyWinter.sunTimes.sunset, "04:32 PM");
  });

  test("5. Adhika Masa detection (Adhika Jyeshtha in May/June 2026 vs Nija Masa in Sept 2026)", () => {
    const adhikaMay = computeRealtimePanchang("delhi", "2026-05-25");
    assert.equal(adhikaMay.masa.isAdhikaMasa, true);
    assert.equal(adhikaMay.masa.purnimanta, "Adhika Jyeshtha");
    assert.equal(adhikaMay.masa.purnimantaHindi, "अधिक ज्येष्ठ");

    const normalSept = computeRealtimePanchang("delhi", "2026-09-28");
    assert.equal(normalSept.masa.isAdhikaMasa, false);
    assert.equal(normalSept.masa.purnimanta, "Ashwin");
    assert.equal(normalSept.masa.amanta, "Bhadrapada");
  });

  test("6. Determinism: same date and sign always yield identical English/Hindi text and scores", () => {
    for (const sign of ZODIAC_SIGNS) {
      const first = DailyHoroscopeService.getHoroscope(sign.id, "2026-09-28")!;
      const second = DailyHoroscopeService.getHoroscope(sign.id, "2026-09-28")!;
      assert.equal(first.summary, second.summary);
      assert.equal(first.summaryHindi, second.summaryHindi);
      assert.equal(first.overallScore, second.overallScore);
      assert.equal(first.career.score, second.career.score);
      assert.equal(first.love.score, second.love.score);
      assert.equal(first.health.score, second.health.score);
      assert.equal(first.finance.score, second.finance.score);
    }
  });

  test("7. Fixed Snapshot for 2026-09-28 in New Delhi (28.6139°N, 77.2090°E)", () => {
    const snap = computeRealtimePanchang("delhi", "2026-09-28");
    assert.deepEqual(
      {
        civilDateStr: snap.civilDateStr,
        city: snap.city,
        vikramSamvat: snap.vikramSamvat,
        shakaSamvat: snap.shakaSamvat,
        sunrise: snap.sunTimes.sunrise,
        sunset: snap.sunTimes.sunset,
        tithiName: snap.tithi.name,
        tithiPaksha: snap.tithi.paksha,
        tithiEndsAt: snap.tithi.endsAt,
        tithiNext: snap.tithi.nextTithi,
        nakshatraName: snap.nakshatra.name,
        nakshatraPada: snap.nakshatra.pada,
        nakshatraEndsAt: snap.nakshatra.endsAt,
        nakshatraNext: snap.nakshatra.nextNakshatra,
        yogaName: snap.yoga.name,
        yogaEndsAt: snap.yoga.endsAt,
        karana1: snap.karana.name,
        karana1EndsAt: snap.karana.endsAt,
        karana2: snap.karana.secondKarana,
        karana2EndsAt: snap.karana.secondEndsAt,
        rahuKaal: snap.inauspiciousTimings.rahuKaal,
        abhijitMuhurat: snap.auspiciousTimings.abhijitMuhurat,
      },
      {
        civilDateStr: "2026-09-28",
        city: "New Delhi",
        vikramSamvat: 2083,
        shakaSamvat: 1948,
        sunrise: "06:12 AM",
        sunset: "06:10 PM",
        tithiName: "Dwitiya",
        tithiPaksha: "Krishna Paksha",
        tithiEndsAt: "07:13 PM",
        tithiNext: "Tritiya",
        nakshatraName: "Revati",
        nakshatraPada: 4,
        nakshatraEndsAt: "10:16 AM",
        nakshatraNext: "Ashwini",
        yogaName: "Dhruva",
        yogaEndsAt: "08:53 AM",
        karana1: "Taitila",
        karana1EndsAt: "08:09 AM",
        karana2: "Gara",
        karana2EndsAt: "07:13 PM",
        rahuKaal: "07:42 AM – 09:12 AM",
        abhijitMuhurat: "11:47 AM – 12:35 PM",
      }
    );
  });
});
