import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import nextConfig from "../next.config";

describe("Core Pages Visibility & Discoverability Audit", () => {
  const rootDir = process.cwd();

  it("verifies all four canonical page routes exist on disk", () => {
    const requiredPages = [
      "src/app/about/page.tsx",
      "src/app/contact/page.tsx",
      "src/app/terms/page.tsx",
      "src/app/privacy-policy/page.tsx",
    ];

    for (const relPath of requiredPages) {
      const fullPath = path.join(rootDir, relPath);
      assert.ok(
        fs.existsSync(fullPath),
        `Required core page must exist at ${relPath}`
      );
      const content = fs.readFileSync(fullPath, "utf-8");
      assert.ok(
        content.includes("export default"),
        `${relPath} must export a default page component`
      );
    }
  });

  it("verifies next.config.ts provides permanent 301 redirects for common URL variants", async () => {
    assert.ok(typeof nextConfig.redirects === "function", "next.config.ts must define a redirects function");
    const redirects = await nextConfig.redirects();

    const expectedRedirects = [
      { source: "/about-us", destination: "/about" },
      { source: "/aboutus", destination: "/about" },
      { source: "/contact-us", destination: "/contact" },
      { source: "/contactus", destination: "/contact" },
      { source: "/privacy", destination: "/privacy-policy" },
      { source: "/privacy-and-policy", destination: "/privacy-policy" },
      { source: "/privacypolicy", destination: "/privacy-policy" },
      { source: "/terms-of-service", destination: "/terms" },
      { source: "/terms-of-use", destination: "/terms" },
      { source: "/terms-and-conditions", destination: "/terms" },
      { source: "/tos", destination: "/terms" },
    ];

    for (const exp of expectedRedirects) {
      const matched = redirects.find((r) => r.source === exp.source);
      assert.ok(matched, `Redirect for source ${exp.source} must be configured in next.config.ts`);
      assert.strictEqual(
        matched.destination,
        exp.destination,
        `Redirect destination for ${exp.source} must be ${exp.destination}`
      );
      assert.strictEqual(
        matched.permanent,
        true,
        `Redirect for ${exp.source} must be permanent (301)`
      );
    }
  });

  it("verifies Navbar renders visible links for About Us and Contact Us in both desktop and mobile views", () => {
    const navbarPath = path.join(rootDir, "src/components/layout/Navbar.tsx");
    const content = fs.readFileSync(navbarPath, "utf-8");

    // Desktop nav direct links
    assert.ok(
      content.includes('href="/about"'),
      "Navbar must contain a direct link to /about"
    );
    assert.ok(
      content.includes('href="/contact"'),
      "Navbar must contain a direct link to /contact"
    );
    assert.ok(
      content.includes("About Us") || content.includes("About"),
      "Navbar must display 'About Us' text"
    );
    assert.ok(
      content.includes("Contact Us") || content.includes("Contact"),
      "Navbar must display 'Contact Us' text"
    );

    // Hindi navbar translation purity assertion
    assert.doesNotMatch(
      content,
      /परिचय\s*\(About\)/,
      "Hindi navbar must cleanly display 'परिचय' without English '(About)' in parentheses"
    );
    assert.doesNotMatch(
      content,
      /हमारे बारे में\s*\(About Us\)/,
      "Hindi navbar mobile drawer must not contain '(About Us)' in parentheses"
    );
    assert.doesNotMatch(
      content,
      /राशिफल\s*\(Horoscope\)/,
      "Hindi navbar must not contain '(Horoscope)' in parentheses"
    );
    assert.doesNotMatch(
      content,
      /कुंडली एवं मिलान\s*\(Kundli & Matching\)/,
      "Hindi navbar must not contain '(Kundli & Matching)' in parentheses"
    );
    assert.doesNotMatch(
      content,
      /पंचांग एवं पर्व\s*\(Panchang & Festivals\)/,
      "Hindi navbar must not contain '(Panchang & Festivals)' in parentheses"
    );
    assert.doesNotMatch(
      content,
      /वैदिक सेवाएँ एवं पूजा\s*\(Services\)/,
      "Hindi navbar must not contain '(Services)' in parentheses"
    );
    assert.doesNotMatch(
      content,
      /संपर्क करें\s*\(Contact Us\)/,
      "Hindi navbar must not contain '(Contact Us)' in parentheses"
    );
    assert.doesNotMatch(
      content,
      /लेख एवं रील्स\s*\(Content\)/,
      "Hindi navbar must not contain '(Content)' in parentheses"
    );
    assert.doesNotMatch(
      content,
      /दैनिक राशिफल\s*\(Daily Horoscope\)/,
      "Hindi navbar must not contain '(Daily Horoscope)' in parentheses"
    );
    assert.doesNotMatch(
      content,
      /१२ वैदिक राशियाँ\s*\(Zodiac Signs Hub\)/,
      "Hindi navbar must not contain '(Zodiac Signs Hub)' in parentheses"
    );
    assert.doesNotMatch(
      content,
      /चन्द्र राशि कैलकुलेटर\s*\(Moon Sign\)/,
      "Hindi navbar must not contain '(Moon Sign)' in parentheses"
    );
    assert.doesNotMatch(
      content,
      /जन्म कुंडली निर्माण\s*\(Kundli Generator\)/,
      "Hindi navbar must not contain '(Kundli Generator)' in parentheses"
    );
    assert.doesNotMatch(
      content,
      /कुंडली मिलान\s*\(Kundli Matching\)/,
      "Hindi navbar must not contain '(Kundli Matching)' in parentheses"
    );
    assert.doesNotMatch(
      content,
      /प्रेम अनुकूलता\s*\(Love Calculator\)/,
      "Hindi navbar must not contain '(Love Calculator)' in parentheses"
    );
    assert.doesNotMatch(
      content,
      /फ्लेम्स कैलकुलेटर\s*\(FLAMES\)/,
      "Hindi navbar must not contain '(FLAMES)' in parentheses"
    );
    assert.doesNotMatch(
      content,
      /आज का पंचांग\s*\(Daily Panchang\)/,
      "Hindi navbar must not contain '(Daily Panchang)' in parentheses"
    );
    assert.doesNotMatch(
      content,
      /कल का पंचांग\s*\(Tomorrow's Panchang\)/,
      "Hindi navbar must not contain '(Tomorrow's Panchang)' in parentheses"
    );
    assert.doesNotMatch(
      content,
      /व्रत एवं त्यौहार कैलेंडर\s*\(Festivals\)/,
      "Hindi navbar must not contain '(Festivals)' in parentheses"
    );
    assert.doesNotMatch(
      content,
      /ज्योतिष लेख\s*\(Vedic Blog\)/,
      "Hindi navbar must not contain '(Vedic Blog)' in parentheses"
    );
    assert.doesNotMatch(
      content,
      /आध्यात्मिक रील्स\s*\(Astro Reels\)/,
      "Hindi navbar must not contain '(Astro Reels)' in parentheses"
    );
    assert.doesNotMatch(
      content,
      /वास्तु शास्त्र\s*\(Vastu Shastra\)/,
      "Hindi navbar must not contain '(Vastu Shastra)' in parentheses"
    );
    assert.doesNotMatch(
      content,
      /प्रमाणित रत्न\s*\(Gemstones\)/,
      "Hindi navbar must not contain '(Gemstones)' in parentheses"
    );
    assert.ok(
      content.includes('"परिचय"'),
      "Hindi navbar must display clean 'परिचय' for About page link"
    );

    // Mobile drawer trust links
    assert.ok(
      content.includes('href="/terms"'),
      "Navbar mobile drawer must include quick link to /terms"
    );
    assert.ok(
      content.includes('href="/privacy-policy"'),
      "Navbar mobile drawer must include quick link to /privacy-policy"
    );
  });

  it("verifies astronomical ephemeris and Hindi metadata titles contain zero English parentheticals", () => {
    // 1. Ephemeris RASHI_NAMES purity
    const ephemerisPath = path.join(rootDir, "src/lib/astrology/ephemeris.ts");
    const ephemerisContent = fs.readFileSync(ephemerisPath, "utf-8");
    assert.doesNotMatch(
      ephemerisContent,
      /hi:\s*"[^"]*?\([A-Za-z]+\)"/,
      "RASHI_NAMES in ephemeris.ts must have pure Devanagari names without English transliteration parentheticals"
    );

    // 2. Hindi SEO Page Titles purity
    const hiHoroscopePath = path.join(rootDir, "src/app/hi/horoscope/page.tsx");
    const hiHoroscopeContent = fs.readFileSync(hiHoroscopePath, "utf-8");
    assert.doesNotMatch(
      hiHoroscopeContent,
      /title:\s*"[^"]*?\([A-Za-z\s]+in Hindi\)/,
      "Hindi horoscope page title must not contain '(Dainik Rashifal in Hindi)'"
    );

    const hiPanchangPath = path.join(rootDir, "src/app/hi/panchang/page.tsx");
    const hiPanchangContent = fs.readFileSync(hiPanchangPath, "utf-8");
    assert.doesNotMatch(
      hiPanchangContent,
      /title:\s*"[^"]*?\([A-Za-z\s]+in Hindi\)/,
      "Hindi panchang page title must not contain '(Dainik Panchang in Hindi)'"
    );

    const hiTomorrowPath = path.join(rootDir, "src/app/hi/panchang/tomorrow/page.tsx");
    const hiTomorrowContent = fs.readFileSync(hiTomorrowPath, "utf-8");
    assert.doesNotMatch(
      hiTomorrowContent,
      /title:\s*"[^"]*?\([A-Za-z\s]+in Hindi\)/,
      "Hindi tomorrow panchang page title must not contain '(Tomorrow's Panchang in Hindi)'"
    );
  });

  it("verifies Footer renders a dedicated Company & Trust section with prominent direct links to all 4 pages", () => {
    const footerPath = path.join(rootDir, "src/components/layout/Footer.tsx");
    const content = fs.readFileSync(footerPath, "utf-8");

    // Company & Trust column
    assert.ok(
      content.includes("Company &amp; Trust") || content.includes("Company & Trust"),
      "Footer must contain a clearly labeled 'Company & Trust' section"
    );

    // All 4 links must be present
    assert.ok(
      content.includes('href="/about"'),
      "Footer must link directly to /about"
    );
    assert.ok(
      content.includes('href="/contact"'),
      "Footer must link directly to /contact"
    );
    assert.ok(
      content.includes('href="/terms"'),
      "Footer must link directly to /terms"
    );
    assert.ok(
      content.includes('href="/privacy-policy"'),
      "Footer must link directly to /privacy-policy"
    );

    // Bottom copyright legal bar must also feature all 4 links prominently
    assert.ok(
      content.includes("About Us"),
      "Footer must explicitly render 'About Us' text label"
    );
    assert.ok(
      content.includes("Contact Us"),
      "Footer must explicitly render 'Contact Us' text label"
    );
    assert.ok(
      content.includes("Terms of Service"),
      "Footer must explicitly render 'Terms of Service' text label"
    );
    assert.ok(
      content.includes("Privacy Policy"),
      "Footer must explicitly render 'Privacy Policy' text label"
    );
  });
});
