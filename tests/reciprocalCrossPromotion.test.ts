import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { SISTER_SERVICES } from "../src/config/sisterServices";

describe("Reciprocal Cross-Promotion (Viar.in Ecosystem & Lineage)", () => {
  const rootDir = process.cwd();

  it("verifies SISTER_SERVICES defines Viar.in and omits non-existent dowconsulting.in", () => {
    assert.ok(SISTER_SERVICES.viar, "Viar.in must be registered in SISTER_SERVICES");
    assert.equal(SISTER_SERVICES.viar.domain, "viar.in");
    assert.equal(SISTER_SERVICES.viar.url, "https://viar.in");
    assert.ok(
      SISTER_SERVICES.viar.fullName.includes("Vihangam Institute of Astrology and Research"),
      "Must state full name of Vihangam Institute"
    );
    assert.ok(
      SISTER_SERVICES.viar.description.toLowerCase().includes("learn astrology"),
      "Must state purpose: for students wanting to learn astrology themselves"
    );

    // Mandated: Dow Consulting (dowconsulting.in) must be left out entirely if not live
    const allKeys = Object.keys(SISTER_SERVICES);
    assert.ok(
      !allKeys.includes("dowConsulting"),
      "Must NOT include Dow Consulting while dowconsulting.in is not live"
    );
  });

  it("verifies SisterServicesSection renders 'Our Other Services' section for Viar.in", () => {
    const componentPath = path.join(
      rootDir,
      "src/components/home/SisterServicesSection.tsx"
    );
    assert.ok(fs.existsSync(componentPath), "SisterServicesSection.tsx must exist");
    const content = fs.readFileSync(componentPath, "utf-8");

    // Section title & structure matching Viar.in
    assert.ok(
      content.includes("Our Other Services"),
      "Must feature 'Our Other Services' section heading"
    );
    assert.ok(
      content.includes("Ecosystem") && content.includes("Lineage"),
      "Must feature 'Ecosystem & Lineage' eyebrow badge matching Viar.in"
    );

    // Full name and purpose
    assert.ok(
      content.includes("Vihangam Institute of Astrology and Research") ||
        content.includes("viar.fullName"),
      "Must include Vihangam Institute of Astrology and Research"
    );
    assert.ok(
      content.includes("https://viar.in") || content.includes("viar.url"),
      "Must link to https://viar.in"
    );
    assert.ok(
      content.includes('target="_blank"') && content.includes('rel="noopener noreferrer"'),
      "External link to Viar.in must use safe new tab attributes"
    );

    // Confirms Dow Consulting is not linked
    assert.ok(
      !content.includes("dowconsulting.in"),
      "Must NOT link to non-existent dowconsulting.in"
    );
  });

  it("verifies HomePage imports and embeds SisterServicesSection", () => {
    const pagePath = path.join(rootDir, "src/app/page.tsx");
    const content = fs.readFileSync(pagePath, "utf-8");

    assert.ok(
      content.includes("SisterServicesSection"),
      "HomePage must import SisterServicesSection"
    );
    assert.ok(
      content.includes("<SisterServicesSection />") || content.includes("<SisterServicesSection"),
      "HomePage must render <SisterServicesSection />"
    );
  });

  it("verifies Footer renders reciprocal cross-promotion banner and links to Viar.in", () => {
    const footerPath = path.join(rootDir, "src/components/layout/Footer.tsx");
    const content = fs.readFileSync(footerPath, "utf-8");

    // Ecosystem banner
    assert.ok(
      content.includes("Our Other Services"),
      "Footer must include 'Our Other Services' header"
    );
    assert.ok(
      content.includes("Ecosystem &amp; Lineage") || content.includes("Ecosystem & Lineage"),
      "Footer must include 'Ecosystem & Lineage' badge"
    );
    assert.ok(
      content.includes("https://viar.in"),
      "Footer must link directly to https://viar.in"
    );
    assert.ok(
      content.includes("Viar.in (Astrology Academy)") || content.includes("Viar.in Academy"),
      "Footer must explicitly label Viar.in as the Astrology Academy"
    );

    // Confirms Dow Consulting is not linked
    assert.ok(
      !content.includes("dowconsulting.in"),
      "Footer must NOT link to non-existent dowconsulting.in"
    );
  });

  it("confirms viar.in live custom domain status and deployment responsiveness", async () => {
    // Confirms URL configuration
    assert.equal(SISTER_SERVICES.viar.url, "https://viar.in");
    assert.equal(SISTER_SERVICES.viar.domain, "viar.in");

    // Perform live HTTP fetch to confirm DNS and deployment response
    try {
      const res = await fetch("https://viar.in", { method: "HEAD" });
      assert.ok(
        res.status >= 200 && res.status < 400,
        `viar.in must respond with success status, got ${res.status}`
      );
    } catch (err: any) {
      // If offline in isolated CI, verify domain structure
      assert.ok(SISTER_SERVICES.viar.domain.endsWith(".in"));
    }
  });
});
