import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { calculateMoonSign } from "../src/lib/astrology/freeCalculators";
import nextConfig from "../next.config";

describe("Calculator Routes & Internal Link Integrity Audit", () => {
  const rootDir = process.cwd();

  it("verifies zero references to broken /calculators/ routes exist anywhere in src/", () => {
    function scanDir(dir: string): string[] {
      let results: string[] = [];
      const list = fs.readdirSync(dir);
      for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
          results = results.concat(scanDir(fullPath));
        } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
          results.push(fullPath);
        }
      }
      return results;
    }

    const allSourceFiles = scanDir(path.join(rootDir, "src"));
    const brokenMatches: { file: string; line: number; text: string }[] = [];

    for (const filePath of allSourceFiles) {
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line, index) => {
        if (line.includes('href="/calculators/') || line.includes('href="/calculator/')) {
          brokenMatches.push({
            file: path.relative(rootDir, filePath),
            line: index + 1,
            text: line.trim(),
          });
        }
      });
    }

    assert.equal(
      brokenMatches.length,
      0,
      `Found broken /calculators/ links in codebase: ${JSON.stringify(brokenMatches, null, 2)}`
    );
  });

  it("verifies Horoscope index and per-sign views link to /moon-sign-calculator", () => {
    const horoscopeIndexPath = path.join(
      rootDir,
      "src/components/horoscope/HoroscopeIndexView.tsx"
    );
    const horoscopeIndexContent = fs.readFileSync(horoscopeIndexPath, "utf-8");

    assert.ok(
      horoscopeIndexContent.includes('href="/moon-sign-calculator"'),
      "HoroscopeIndexView must link to /moon-sign-calculator"
    );
    assert.ok(
      !horoscopeIndexContent.includes('href="/calculators/moon-sign"'),
      "HoroscopeIndexView must NOT link to /calculators/moon-sign"
    );

    const signHoroscopePath = path.join(
      rootDir,
      "src/components/horoscope/SignHoroscopeView.tsx"
    );
    const signHoroscopeContent = fs.readFileSync(signHoroscopePath, "utf-8");

    assert.ok(
      signHoroscopeContent.includes('href="/moon-sign-calculator"'),
      "SignHoroscopeView must link to /moon-sign-calculator"
    );
    assert.ok(
      !signHoroscopeContent.includes('href="/calculators/moon-sign"'),
      "SignHoroscopeView must NOT link to /calculators/moon-sign"
    );
  });

  it("verifies all calculator routes exist on disk as real pages", () => {
    const requiredCalculators = [
      "src/app/moon-sign-calculator/page.tsx",
      "src/app/sun-sign-calculator/page.tsx",
      "src/app/love-calculator/page.tsx",
      "src/app/flames-calculator/page.tsx",
      "src/app/numerology-calculator/page.tsx",
      "src/app/kundli-generator/page.tsx",
      "src/app/kundli-matching/page.tsx",
    ];

    for (const relPath of requiredCalculators) {
      const fullPath = path.join(rootDir, relPath);
      assert.ok(
        fs.existsSync(fullPath),
        `Calculator page must exist at ${relPath}`
      );
    }
  });

  it("verifies next.config.ts defines permanent 301 redirects for legacy /calculators/* paths", async () => {
    if (typeof nextConfig.redirects !== "function") {
      assert.fail("next.config.ts must define redirects function");
    }

    const redirects = await nextConfig.redirects();
    const sources = redirects.map((r) => r.source);

    assert.ok(
      sources.includes("/calculators/moon-sign"),
      "Must redirect /calculators/moon-sign"
    );
    assert.ok(
      sources.includes("/calculator/moon-sign"),
      "Must redirect /calculator/moon-sign"
    );

    const moonRedirect = redirects.find(
      (r) => r.source === "/calculators/moon-sign"
    );
    assert.equal(moonRedirect?.destination, "/moon-sign-calculator");
    assert.equal(moonRedirect?.permanent, true);
  });

  it("verifies Moon Sign Calculator functions correctly end-to-end with real ephemeris", () => {
    // Test known astrological birth data:
    // 1996-05-14 14:30 in New Delhi (28.6139°N, 77.2090°E, TZ: +5.5)
    const result = calculateMoonSign(
      "Aarav",
      "1996-05-14",
      "14:30",
      "New Delhi, Delhi, India",
      28.6139,
      77.209,
      5.5
    );

    assert.equal(result.name, "Aarav");
    assert.ok(result.moonSign, "Must calculate valid Moon Sign name");
    assert.ok(result.moonSignHindi, "Must calculate valid Hindi Moon Sign name");
    assert.ok(result.rashiNumber >= 1 && result.rashiNumber <= 12, "Rashi number must be 1..12");
    assert.ok(result.nakshatra, "Must calculate Nakshatra");
    assert.ok(result.nakshatraPada >= 1 && result.nakshatraPada <= 4, "Pada must be 1..4");
    assert.ok(["Fire", "Earth", "Air", "Water"].includes(result.element), "Element must be valid");
    assert.ok(result.coreTraits.length >= 3, "Must return core traits");
    assert.ok(result.favorableGemstone, "Must return favorable gemstone");
    assert.ok(result.favorableDeity, "Must return favorable deity");
    assert.ok(result.emotionalProfile.length > 20, "Must return detailed emotional profile");
  });
});
