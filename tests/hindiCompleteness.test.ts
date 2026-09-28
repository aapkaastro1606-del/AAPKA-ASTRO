import { describe, it } from "node:test";
import assert from "node:assert/strict";
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
  PANCHANG_UI_COPY,
  HOROSCOPE_UI_COPY,
} from "../src/lib/i18n/vedicGlossary";
import { computeRealtimePanchang } from "../src/lib/astrology/realtimePanchang";
import { DailyHoroscopeService, ZODIAC_SIGNS } from "../src/lib/astrology/dailyHoroscope";

const DEVANAGARI_REGEX = /[\u0900-\u097F]/;
const LATIN_WORD_REGEX = /[A-Za-z]{2,}/;

function assertPureHindi(value: string | undefined, label: string) {
  assert.ok(value && value.trim().length > 0, `Missing Hindi string for ${label}`);
  assert.match(
    value!,
    DEVANAGARI_REGEX,
    `Hindi string for ${label} must contain Devanagari characters, got: "${value}"`
  );
  assert.doesNotMatch(
    value!,
    LATIN_WORD_REGEX,
    `Hindi string for ${label} silently fell back to English / Latin words: "${value}"`
  );
}

describe("Phase 4: Hindi Glossary & Completeness Guard (Zero Silent English Fallback)", () => {
  it("validates centralized glossary counts and pure Devanagari terms (30 Tithis, 27 Nakshatras, 27 Yogas, 11 Karanas, 7 Varas, 12 Masas, 6 Ritus, 12 Rashis, 9 Grahas, 7 Choghadiyas)", () => {
    assert.equal(TITHIS_30.length, 30);
    assert.equal(PAKSHAS_2.length, 2);
    assert.equal(NAKSHATRAS_27.length, 27);
    assert.equal(YOGAS_27.length, 27);
    assert.equal(KARANAS_11.length, 11);
    assert.equal(VARAS_7.length, 7);
    assert.equal(MASAS_12.length, 12);
    assert.equal(RITUS_6.length, 6);
    assert.equal(RASHIS_12.length, 12);
    assert.equal(GRAHAS_9.length, 9);
    assert.equal(CHOGHADIYAS_7.length, 7);

    const allTerms = [
      ...TITHIS_30,
      ...PAKSHAS_2,
      ...NAKSHATRAS_27,
      ...YOGAS_27,
      ...KARANAS_11,
      ...VARAS_7,
      ...MASAS_12,
      ...RITUS_6,
      ...RASHIS_12,
      ...GRAHAS_9,
      ...CHOGHADIYAS_7,
    ];

    for (const item of allTerms) {
      assertPureHindi(item.hi, `glossary.${item.key}`);
    }
  });

  it("validates all PANCHANG_UI_COPY and HOROSCOPE_UI_COPY Hindi strings have zero English fallback", () => {
    for (const [key, val] of Object.entries(PANCHANG_UI_COPY)) {
      assertPureHindi(val.hi, `PANCHANG_UI_COPY.${key}`);
    }
    for (const [key, val] of Object.entries(HOROSCOPE_UI_COPY)) {
      assertPureHindi(val.hi, `HOROSCOPE_UI_COPY.${key}`);
    }
  });

  it("validates computed Hindi Panchang fields have zero Latin/English fallback across Indian & International cities", () => {
    for (const city of ["delhi", "varanasi", "london", "new_york"]) {
      const p = computeRealtimePanchang(city, "2026-09-28");

      assertPureHindi(p.dateHindi, `${city}.dateHindi`);
      assertPureHindi(p.samvatHindi, `${city}.samvatHindi`);
      assertPureHindi(p.tithi.nameHindi, `${city}.tithi.nameHindi`);
      assertPureHindi(p.tithi.pakshaHindi, `${city}.tithi.pakshaHindi`);
      assertPureHindi(p.tithi.endsAtHindi, `${city}.tithi.endsAtHindi`);
      assertPureHindi(p.tithi.nextTithiHindi, `${city}.tithi.nextTithiHindi`);
      assertPureHindi(p.nakshatra.nameHindi, `${city}.nakshatra.nameHindi`);
      assertPureHindi(p.nakshatra.lordHindi, `${city}.nakshatra.lordHindi`);
      assertPureHindi(p.nakshatra.endsAtHindi, `${city}.nakshatra.endsAtHindi`);
      assertPureHindi(p.yoga.nameHindi, `${city}.yoga.nameHindi`);
      assertPureHindi(p.yoga.endsAtHindi, `${city}.yoga.endsAtHindi`);
      assertPureHindi(p.karana.nameHindi, `${city}.karana.nameHindi`);
      assertPureHindi(p.karana.endsAtHindi, `${city}.karana.endsAtHindi`);
      assertPureHindi(p.varaDetails.nameHindi, `${city}.varaDetails.nameHindi`);
      assertPureHindi(p.varaDetails.lordHindi, `${city}.varaDetails.lordHindi`);
      assertPureHindi(p.varaDetails.dishaShoolHindi, `${city}.varaDetails.dishaShoolHindi`);
      assertPureHindi(p.sunTimes.sunriseHindi, `${city}.sunTimes.sunriseHindi`);
      assertPureHindi(p.sunTimes.sunsetHindi, `${city}.sunTimes.sunsetHindi`);
      assertPureHindi(p.sunTimes.sunSignHindi, `${city}.sunTimes.sunSignHindi`);
      assertPureHindi(p.moonTimes.moonriseHindi, `${city}.moonTimes.moonriseHindi`);
      assertPureHindi(p.moonTimes.moonsetHindi, `${city}.moonTimes.moonsetHindi`);
      assertPureHindi(p.moonTimes.moonSignHindi, `${city}.moonTimes.moonSignHindi`);
      assertPureHindi(p.moonTimes.moonSignChangeHindi, `${city}.moonTimes.moonSignChangeHindi`);
      assertPureHindi(p.auspiciousTimings.abhijitMuhuratHindi, `${city}.abhijitMuhuratHindi`);
      assertPureHindi(p.auspiciousTimings.amritKaalHindi, `${city}.amritKaalHindi`);
      assertPureHindi(p.auspiciousTimings.brahmaMuhuratHindi, `${city}.brahmaMuhuratHindi`);
      assertPureHindi(p.inauspiciousTimings.rahuKaalHindi, `${city}.rahuKaalHindi`);
      assertPureHindi(p.inauspiciousTimings.yamagandaHindi, `${city}.yamagandaHindi`);
      assertPureHindi(p.inauspiciousTimings.gulikaKaalHindi, `${city}.gulikaKaalHindi`);
      assertPureHindi(p.inauspiciousTimings.durMuhuratHindi, `${city}.durMuhuratHindi`);
      assertPureHindi(p.inauspiciousTimings.varjyamHindi, `${city}.varjyamHindi`);

      for (const slot of p.choghadiya.day) {
        assertPureHindi(slot.nameHindi, `${city}.choghadiya.day.nameHindi`);
        assertPureHindi(slot.periodHindi, `${city}.choghadiya.day.periodHindi`);
        assertPureHindi(slot.natureHi, `${city}.choghadiya.day.natureHi`);
      }

      for (const cb of p.chandrabalam) {
        assertPureHindi(cb.rashiHi, `${city}.chandrabalam.rashiHi`);
        assertPureHindi(cb.statusHi, `${city}.chandrabalam.statusHi`);
        assertPureHindi(cb.noteHi, `${city}.chandrabalam.noteHi`);
      }
    }
  });

  it("validates all 12 Chandra Rashi daily horoscopes have pure Hindi content with zero English fallback", () => {
    for (const sign of ZODIAC_SIGNS) {
      const h = DailyHoroscopeService.getHoroscope(sign.id, "2026-09-28")!;
      assertPureHindi(h.formattedDateHindi, `${sign.id}.formattedDateHindi`);
      assertPureHindi(h.summaryHindi, `${sign.id}.summaryHindi`);
      assertPureHindi(h.love.descriptionHindi, `${sign.id}.love.descriptionHindi`);
      assertPureHindi(h.career.descriptionHindi, `${sign.id}.career.descriptionHindi`);
      assertPureHindi(h.health.descriptionHindi, `${sign.id}.health.descriptionHindi`);
      assertPureHindi(h.finance.descriptionHindi, `${sign.id}.finance.descriptionHindi`);
      assertPureHindi(h.family.descriptionHindi, `${sign.id}.family.descriptionHindi`);
      assertPureHindi(h.luckyColorHindi, `${sign.id}.luckyColorHindi`);
      assertPureHindi(h.auspiciousTimeHindi, `${sign.id}.auspiciousTimeHindi`);
      assertPureHindi(h.remedyHindi, `${sign.id}.remedyHindi`);
      assertPureHindi(h.mantraHindi, `${sign.id}.mantraHindi`);
      assertPureHindi(h.planetaryTransitHindi, `${sign.id}.planetaryTransitHindi`);

      for (let i = 0; i < h.computedFacts.factsHi.length; i++) {
        assertPureHindi(h.computedFacts.factsHi[i], `${sign.id}.factsHi[${i}]`);
      }
    }
  });
});
