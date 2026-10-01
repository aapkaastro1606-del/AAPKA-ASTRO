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
