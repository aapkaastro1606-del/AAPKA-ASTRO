import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("Trust Marks & Claims Audit: Unconfirmed '32 Countries' claim removed", () => {
  const footerPath = path.join(process.cwd(), "src/components/layout/Footer.tsx");
  const footerContent = fs.readFileSync(footerPath, "utf-8");

  // 1. Confirms "32 Countries" or any variant is not present in Footer
  assert.ok(
    !footerContent.toLowerCase().includes("32 countr"),
    "Footer.tsx must not contain unconfirmed '32 Countries' claim"
  );

  // 2. Confirms client-authorized "15,000+ Natal Charts Analyzed" is retained
  assert.ok(
    footerContent.includes("15,000+ Natal Charts Analyzed"),
    "Footer.tsx must retain client-confirmed '15,000+ Natal Charts Analyzed'"
  );

  // 3. Confirms replacement copy aligns with authentic guidance and zero gimmicks
  assert.ok(
    footerContent.includes("Authentic Guidance &bull; Zero Gimmicks"),
    "Footer.tsx must include clean 'Authentic Guidance • Zero Gimmicks' without unconfirmed country counts"
  );
});

test("Homepage Sacred Action Banner: Reassurance bar retains client-confirmed claim without country metrics", () => {
  const homePath = path.join(process.cwd(), "src/app/page.tsx");
  const homeContent = fs.readFileSync(homePath, "utf-8");

  assert.ok(
    homeContent.includes("15,000+ Natal Charts Analyzed"),
    "Homepage Sacred Action Banner must retain '15,000+ Natal Charts Analyzed'"
  );
  assert.ok(
    homeContent.includes("Authentic Guidance"),
    "Homepage Sacred Action Banner must retain 'Authentic Guidance'"
  );
  assert.ok(
    homeContent.includes("Zero Gimmicks"),
    "Homepage Sacred Action Banner must retain 'Zero Gimmicks'"
  );
  assert.ok(
    !homeContent.toLowerCase().includes("32 countr"),
    "Homepage must not contain unconfirmed '32 Countries' claim"
  );
});

test("Sitewide Verification: No invented country counts exist in src/", () => {
  const srcDir = path.join(process.cwd(), "src");

  function scanDir(dir: string): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let matches: string[] = [];
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        matches = matches.concat(scanDir(fullPath));
      } else if (entry.isFile() && /\.(tsx?|jsx?|html)$/.test(entry.name)) {
        const content = fs.readFileSync(fullPath, "utf-8");
        if (/across\s+\d+\s+countr/i.test(content) || /\b32\s+countr/i.test(content)) {
          matches.push(fullPath);
        }
      }
    }
    return matches;
  }

  const offendingFiles = scanDir(srcDir);
  assert.deepEqual(
    offendingFiles,
    [],
    `Found unconfirmed country claims in files: ${offendingFiles.join(", ")}`
  );
});

test("Final Sweep Verification: No invented ratings, rogue astrologer names, or arbitrary metrics exist in src/", () => {
  const srcDir = path.join(process.cwd(), "src");

  function scanDir(dir: string): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let matches: string[] = [];
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        matches = matches.concat(scanDir(fullPath));
      } else if (entry.isFile() && /\.(tsx?|jsx?|html)$/.test(entry.name)) {
        const content = fs.readFileSync(fullPath, "utf-8");
        // Check for 4.98 or 4.95 rating, Abhishek Bhardwaj, 95% of Vastu defects, 500+ unverified
        if (
          /\b4\.98\b/.test(content) ||
          /\b4\.95\b/.test(content) ||
          /Abhishek Bhardwaj/i.test(content) ||
          /95%\s+of\s+Vastu\s+defects/i.test(content) ||
          /500\+\s+unverified/i.test(content)
        ) {
          matches.push(fullPath);
        }
      }
    }
    return matches;
  }

  const offendingFiles = scanDir(srcDir);
  assert.deepEqual(
    offendingFiles,
    [],
    `Found unconfirmed/invented metrics in files: ${offendingFiles.join(", ")}`
  );
});

test("Client Confirmed Facts Retention: Essential verified facts are preserved", () => {
  const aboutPath = path.join(process.cwd(), "src/app/about/page.tsx");
  const aboutContent = fs.readFileSync(aboutPath, "utf-8");

  assert.ok(aboutContent.includes("Acharya Niraj Kumar"), "Must contain Acharya Niraj Kumar");
  assert.ok(aboutContent.includes("15,000+"), "Must contain 15,000+ milestone");
  assert.ok(aboutContent.includes("20+"), "Must contain 20+ years");
  assert.ok(aboutContent.includes("Bhartiya Vidya Bhawan"), "Must contain Bhartiya Vidya Bhawan");
  assert.ok(aboutContent.includes("Jyotish Acharya"), "Must contain Jyotish Acharya");
  assert.ok(aboutContent.includes("Baidyanath Dham, Deoghar"), "Must contain Baidyanath Dham");

  const heroPath = path.join(process.cwd(), "src/components/home/Hero.tsx");
  const heroContent = fs.readFileSync(heroPath, "utf-8");
  assert.ok(heroContent.includes("15,000+"), "Hero must contain 15,000+ milestone");
  assert.ok(heroContent.includes("Jyotish Acharya"), "Hero must contain Jyotish Acharya");
  assert.ok(heroContent.includes("Bhartiya Vidya Bhawan"), "Hero must contain Bhartiya Vidya Bhawan");

  const configPath = path.join(process.cwd(), "src/config/placeholderContent.ts");
  const configContent = fs.readFileSync(configPath, "utf-8");
  assert.ok(configContent.includes("Acharya Niraj Kumar"), "Config must contain Acharya Niraj Kumar");
  assert.ok(!configContent.includes("Abhishek Bhardwaj"), "Config must not contain Abhishek Bhardwaj");
});
