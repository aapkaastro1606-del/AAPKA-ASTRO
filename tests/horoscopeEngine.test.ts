import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DailyHoroscopeService, ZODIAC_SIGNS } from "../src/lib/astrology/dailyHoroscope";

describe("Phase 3: Vedic Chandra Rashi Horoscope Engine", () => {
  it("computes real Chandra Gochar houses (1..12) across all 12 signs for a given date", () => {
    const dateStr = "2026-09-28";
    const results = ZODIAC_SIGNS.map((s) => DailyHoroscopeService.getHoroscope(s.id, dateStr)!);

    assert.equal(results.length, 12);

    // Every sign must have a unique Moon transit house from 1 to 12 on the same date
    const moonHouses = results.map((r) => r.computedFacts.moonHouseFromRashi).sort((a, b) => a - b);
    assert.deepEqual(moonHouses, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

    // Check that all 9 Graha transits are computed with degrees, verdicts, and classical sources
    for (const r of results) {
      assert.equal(r.computedFacts.planetTransits.length, 9);
      assert.ok(r.computedFacts.factsEn.length >= 5);
      assert.ok(r.computedFacts.factsHi.length >= 5);

      // Verify Hindi content contains Devanagari characters
      assert.match(r.summaryHindi, /[\u0900-\u097F]/);
      assert.match(r.love.descriptionHindi, /[\u0900-\u097F]/);
      assert.match(r.career.descriptionHindi, /[\u0900-\u097F]/);
      assert.match(r.health.descriptionHindi, /[\u0900-\u097F]/);
      assert.match(r.finance.descriptionHindi, /[\u0900-\u097F]/);
      assert.match(r.family.descriptionHindi, /[\u0900-\u097F]/);
      assert.match(r.remedyHindi, /[\u0900-\u097F]/);
      assert.match(r.mantraHindi, /[\u0900-\u097F]/);
    }
  });

  it("scores favourable Chandra Gochar houses (e.g., 1st, 10th, 11th) higher than 8th house (Chandra Ashtama)", () => {
    const dateStr = "2026-09-28";
    const results = ZODIAC_SIGNS.map((s) => DailyHoroscopeService.getHoroscope(s.id, dateStr)!);

    const house11Sign = results.find((r) => r.computedFacts.moonHouseFromRashi === 11)!;
    const house8Sign = results.find((r) => r.computedFacts.moonHouseFromRashi === 8)!;

    assert.equal(house11Sign.computedFacts.moonHouseVerdict, "Favourable");
    assert.equal(house8Sign.computedFacts.moonHouseVerdict, "Unfavourable");

    const avg11 =
      (house11Sign.love.score +
        house11Sign.career.score +
        house11Sign.health.score +
        house11Sign.finance.score) /
      4;
    const avg8 =
      (house8Sign.love.score +
        house8Sign.career.score +
        house8Sign.health.score +
        house8Sign.finance.score) /
      4;

    assert.ok(avg11 > avg8, `Expected 11th house avg (${avg11}) > 8th house avg (${avg8})`);
  });

  it("supports Yesterday (-1), Today (0), and Tomorrow (+1) with distinct dates and deterministic readings", () => {
    const yesterday = DailyHoroscopeService.getHoroscope("aries", -1)!;
    const today = DailyHoroscopeService.getHoroscope("aries", 0)!;
    const tomorrow = DailyHoroscopeService.getHoroscope("aries", 1)!;

    assert.notEqual(yesterday.date, today.date);
    assert.notEqual(today.date, tomorrow.date);

    // Calling getHoroscope twice with the same date & sign is 100% deterministic
    const repeatToday = DailyHoroscopeService.getHoroscope("aries", today.date)!;
    assert.equal(repeatToday.summary, today.summary);
    assert.equal(repeatToday.summaryHindi, today.summaryHindi);
    assert.equal(repeatToday.love.score, today.love.score);
    assert.equal(repeatToday.career.score, today.career.score);
  });
});
