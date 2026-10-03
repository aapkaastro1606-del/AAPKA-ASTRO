import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("Wallet Reference Audit: Refund & Cancellation Policy has zero wallet credit references", () => {
  const refundPolicyPath = path.join(process.cwd(), "src/app/refund-policy/page.tsx");
  const refundContent = fs.readFileSync(refundPolicyPath, "utf-8");

  assert.ok(
    !refundContent.toLowerCase().includes("in-app wallet credit"),
    "Refund policy must not list 'In-App Wallet Credit'"
  );
  assert.ok(
    !refundContent.toLowerCase().includes("wallet"),
    "Refund policy must contain zero references to 'wallet'"
  );
});

test("Wallet Reference Audit: Legal and policy pages contain no wallet credit, balance, or top-up claims", () => {
  const policyPages = [
    "src/app/refund-policy/page.tsx",
    "src/app/terms/page.tsx",
    "src/app/privacy-policy/page.tsx",
    "src/app/pricing-policy/page.tsx",
    "src/app/disclaimer/page.tsx",
  ];

  for (const relPath of policyPages) {
    const fullPath = path.join(process.cwd(), relPath);
    const content = fs.readFileSync(fullPath, "utf-8");

    assert.ok(
      !/wallet\s*(credit|balance|top-?up|recharge)/i.test(content),
      `${relPath} must not contain any wallet credit, balance, top-up, or recharge claims`
    );
  }
});

test("Wallet Reference Audit: Login header and public components contain zero wallet references", () => {
  const loginPath = path.join(process.cwd(), "src/app/login/LoginClient.tsx");
  const loginContent = fs.readFileSync(loginPath, "utf-8");

  assert.ok(
    !loginContent.toLowerCase().includes("wallet"),
    "LoginClient.tsx must not reference wallet"
  );

  const navbarPath = path.join(process.cwd(), "src/components/layout/Navbar.tsx");
  const navbarContent = fs.readFileSync(navbarPath, "utf-8");
  assert.ok(
    !navbarContent.includes("walletBalance"),
    "Navbar.tsx must not declare or track walletBalance"
  );

  const sitemapPath = path.join(process.cwd(), "src/app/sitemap.ts");
  const sitemapContent = fs.readFileSync(sitemapPath, "utf-8");
  assert.ok(
    !sitemapContent.includes('"/wallet"'),
    "sitemap.ts must not index /wallet"
  );
});
