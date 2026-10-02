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
