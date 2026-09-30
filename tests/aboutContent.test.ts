import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("About Us Page - Client Authored Content Verification", () => {
  const aboutFilePath = path.join(process.cwd(), "src/app/about/page.tsx");
  const aboutCode = fs.readFileSync(aboutFilePath, "utf8");
  const normalizedCode = aboutCode.replace(/\s+/g, " ");

  test("1. Opening statement: renders verbatim paragraph", () => {
    assert.match(
      normalizedCode,
      /At Aapka Astro, we work at the intersection of ancient wisdom and modern life\./,
      "Must contain verbatim opening statement"
    );
  });

  test("2. The Mind Behind Aapka Astro: Acharya Niraj Kumar bio & 15,000+ figure", () => {
    assert.match(normalizedCode, /The Mind Behind Aapka Astro/);
    assert.match(normalizedCode, /Acharya Niraj Kumar/);
    assert.match(normalizedCode, /Baidyanath Dham, Deoghar/);
    assert.match(
      normalizedCode,
      /more than 15,000 chart analyses and numerous Vastu consultations/,
      "Must contain exact authorized count of more than 15,000 chart analyses"
    );
    assert.match(
      normalizedCode,
      /analytical, structured, and outcome-oriented rather than ritualistic or abstract/
    );
    assert.match(
      normalizedCode,
      /When your inner intent aligns with the energy of your environment, life begins to move with clarity, ease, and purpose\./
    );
    assert.match(
      normalizedCode,
      /We don’t offer superstition\. We offer structured insight, grounded in time-tested sciences like Vastu Shastra and Astrology/
    );
  });

  test("3. Beyond Traditional Vastu: A Deeper, Precision-Led Approach", () => {
    assert.match(normalizedCode, /Beyond Traditional Vastu: A Deeper, Precision-Led Approach/);
    assert.match(normalizedCode, /Devta Vastu, Energy Vastu, and AstroVastu/);
    assert.match(normalizedCode, /Identifying root causes, not just surface defects\./);
    assert.match(normalizedCode, /Applying practical, non-destructive remedies\./);
    assert.match(normalizedCode, /Aligning spaces with the specific needs of individuals or businesses\./);
    assert.match(normalizedCode, /remove friction, restore balance, and enable growth\./);
  });

  test("4. Our Approach to Vastu Services: all four categories with bullets", () => {
    assert.match(normalizedCode, /Our Approach to Vastu Services/);

    // Residential Vastu
    assert.match(normalizedCode, /Residential Vastu/);
    assert.match(normalizedCode, /Detailed floor plan analysis/);
    assert.match(normalizedCode, /Elemental balance \(Panchamahabhutas\)/);
    assert.match(normalizedCode, /Practical remedies without structural changes/);
    assert.match(normalizedCode, /Ideal for homeowners, renters, and property buyers\./);

    // Commercial & Corporate Vastu
    assert.match(normalizedCode, /Commercial &amp; Corporate|Commercial & Corporate/);
    assert.match(normalizedCode, /Leadership cabin positioning for better decision-making/);
    assert.match(normalizedCode, /Sales and customer flow optimization/);
    assert.match(normalizedCode, /Workplace energy alignment for productivity and retention/);
    assert.match(normalizedCode, /Ideal for business owners, corporate offices, and retail\./);

    // Industrial Vastu
    assert.match(normalizedCode, /Industrial Vastu/);
    assert.match(normalizedCode, /Machinery placement optimization/);
    assert.match(normalizedCode, /Raw material and finished goods zoning/);
    assert.match(normalizedCode, /Energy alignment for workforce stability/);
    assert.match(normalizedCode, /Ideal for factories, warehouses, and processing units\./);

    // Online / Virtual Consultation
    assert.match(normalizedCode, /Online \/ Virtual Consultation/);
    assert.match(normalizedCode, /Expert guidance.*delivered globally/);
    assert.match(normalizedCode, /Digital analysis using plans and compass readings/);
    assert.match(normalizedCode, /Detailed reports with actionable remedies/);
    assert.match(normalizedCode, /Same depth as physical consultations/);
    assert.match(normalizedCode, /Ideal for international clients and time-sensitive decisions\./);
  });

  test("5. Where Spiritual Science Meets Corporate Insight: executive roles & academic foundation", () => {
    assert.match(normalizedCode, /Where Spiritual Science Meets Corporate Insight/);
    assert.match(normalizedCode, /Reliance Retail, Metro Cash &amp; Carry, and NIF Food|Reliance Retail, Metro Cash & Carry, and NIF Food/);
    assert.match(normalizedCode, /Vice President and Business Head/);
    assert.match(normalizedCode, /Academic &amp; Corporate Foundation|Academic & Corporate Foundation/);
    assert.match(normalizedCode, /B\.Sc\. \(Hons\.\) in Physics/);
    assert.match(normalizedCode, /PGDBM in International Business &amp; Marketing|PGDBM in International Business & Marketing/);
    assert.match(normalizedCode, /Leadership Development &amp; Change Management certification from XLRI|Leadership Development & Change Management certification from XLRI/);
  });

  test("6. Lineage, Learning, and Credibility: complete formal credential roster", () => {
    assert.match(normalizedCode, /Lineage, Learning, and Credibility/);
    assert.match(normalizedCode, /Late Guru Shri B\. B\. Tiwari/);
    assert.match(normalizedCode, /Divya Vastu/);
    assert.match(normalizedCode, /Vaastu Just For You/);
    assert.match(normalizedCode, /M\.A\. in Jyotish.*IGNOU, 2024/);
    assert.match(normalizedCode, /Jyotish Acharya.*Bhartiya Vidya Bhawan.*K\.N\. Rao Institute/);
    assert.match(normalizedCode, /Nadi Parveen.*ICAS/);
    assert.match(normalizedCode, /Jyotish Prabhakar.*IRIW under Dr\. Pawan Sinha/);
    assert.match(normalizedCode, /Jyotish Visharad &amp; Jyotish Mani|Jyotish Visharad & Jyotish Mani/);
    assert.match(normalizedCode, /Bharat Jyotish Vidyapith/);
    assert.match(normalizedCode, /He continues to pursue advanced research and actively teaches astrology/);
  });

  test("7. Our Core Offerings: all four specialized branches", () => {
    assert.match(normalizedCode, /Our Core Offerings/);
    assert.match(normalizedCode, /Vastu Shastra/);
    assert.match(normalizedCode, /Strategic alignment of residential, commercial, and industrial spaces/);
    assert.match(normalizedCode, /Vedic &amp; KP Astrology|Vedic & KP Astrology/);
    assert.match(normalizedCode, /Detailed chart analysis offering actionable insights on career, relationships/);
    assert.match(normalizedCode, /Nadi Astrology/);
    assert.match(normalizedCode, /A precise and deterministic system that reveals deeper patterns across time\./);
    assert.match(normalizedCode, /Prashna \(Horary\) Astrology/);
    assert.match(normalizedCode, /Accurate, situation-specific answers based on the moment of inquiry\./);
  });

  test("8. What We Stand For: three pillars & verbatim closing statement", () => {
    assert.match(normalizedCode, /What We Stand For/);
    assert.match(normalizedCode, /At its core, Aapka Astro is about enabling better decisions\./);
    assert.match(normalizedCode, /Not fear\./);
    assert.match(normalizedCode, /Not blind belief\./);
    assert.match(normalizedCode, /But clarity, structure, and alignment\./);
    assert.match(
      normalizedCode,
      /Whether you are building a home, scaling a business, or seeking direction in life, the objective is simple:/
    );
    assert.match(normalizedCode, /Help you move forward with confidence and balance\./);
  });
});
