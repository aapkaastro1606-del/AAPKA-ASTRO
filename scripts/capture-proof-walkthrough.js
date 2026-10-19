const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\anmol\\.gemini\\antigravity\\brain\\38dce4e4-16b3-4431-82d2-da75d512f77a";

const OWNER_COOKIE = {
  name: "aapka_astro_mock_user",
  value: encodeURIComponent(
    JSON.stringify({
      id: "usr_owner_official",
      email: "aapkaastro1606@gmail.com",
      role: "OWNER",
      isOwner: true,
      permissions: ["pricing", "bookings", "staff", "content", "leads", "audit", "knowledge"],
      grants: [],
    })
  ),
  domain: "localhost",
  path: "/",
};

const STAFF_COOKIE = {
  name: "aapka_astro_mock_user",
  value: encodeURIComponent(
    JSON.stringify({
      id: "usr_staff_restricted",
      email: "staff_editor@aapkaastro.com",
      role: "CLIENT",
      isOwner: false,
      permissions: ["content"],
      grants: [
        {
          id: "g_content_1",
          email: "staff_editor@aapkaastro.com",
          section: "content",
          accessLevel: "MANAGE",
          grantedAt: new Date().toISOString(),
          revokedAt: null,
        },
      ],
    })
  ),
  domain: "localhost",
  path: "/",
};

async function captureProof() {
  console.log("Launching Chrome for Proof Walkthrough...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

    // Helper screenshot recorder
    async function snap(filename, label) {
      const dest = path.join(ARTIFACT_DIR, filename);
      console.log(`[Snap] ${label} -> ${filename}`);
      await page.screenshot({ path: dest, fullPage: false });
    }

    // --- STEP 1: Admin Home Hub (Owner View) ---
    await page.setCookie(OWNER_COOKIE);
    await page.goto("http://localhost:3005/admin", { waitUntil: "networkidle2", timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1200));
    await snap("proof-01-admin-home-owner.png", "Admin Home Hub (Owner tiles, help texts, audit link)");

    // --- STEP 2: Content Studio - Headline Editing & Live Preview ---
    await page.goto("http://localhost:3005/admin/content?tab=hero", { waitUntil: "networkidle2", timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1200));
    await snap("proof-02-content-studio-hero.png", "Content Studio: Hero headline editor & live preview");

    // --- STEP 3: Content Studio - Contact Info & Phone Number Editing ---
    await page.goto("http://localhost:3005/admin/content?tab=contact", { waitUntil: "networkidle2", timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1200));
    await snap("proof-03-content-studio-contact.png", "Content Studio: Contact details, phone & WhatsApp number");

    // --- STEP 4: Content Studio - FAQ Management, Reordering & Status ---
    await page.goto("http://localhost:3005/admin/content?tab=faqs", { waitUntil: "networkidle2", timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1200));
    await snap("proof-04-content-studio-faqs.png", "Content Studio: FAQ editor, bilingual tabs, reorder, and hide/draft toggle");

    // --- STEP 5: Media Library - R2 Uploads, Alt Text Enforcement, In-Use Protection ---
    await page.goto("http://localhost:3005/admin/media", { waitUntil: "networkidle2", timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1200));
    await snap("proof-05-media-library-r2.png", "Media Library: Cloudflare R2 browser uploads, alt text rules, and in-use badges");

    // --- STEP 6: Owner Audit Trail & Security Logs ---
    await page.goto("http://localhost:3005/admin/audit", { waitUntil: "networkidle2", timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1200));
    await snap("proof-06-admin-audit-log.png", "Owner Audit Trail: Operations logged with actors, timestamps, and filters");

    // --- STEP 7: Staff Restriction (Content-only staff blocked from Owner-only sections) ---
    await page.deleteCookie({ name: "aapka_astro_mock_user", domain: "localhost", path: "/" });
    await page.setCookie(STAFF_COOKIE);
    // Navigate to pricing (Owner-only)
    await page.goto("http://localhost:3005/admin/pricing", { waitUntil: "networkidle2", timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1200));
    await snap("proof-07-staff-blocked-pricing.png", "Staff restriction: Content staff rejected from /admin/pricing (Owner only)");

    // --- STEP 8: Public Homepage - Hindi Toggle with Devanagari Content ---
    await page.deleteCookie({ name: "aapka_astro_mock_user", domain: "localhost", path: "/" });
    await page.goto("http://localhost:3005", { waitUntil: "networkidle2", timeout: 30000 });
    await page.evaluate(() => {
      localStorage.setItem("aapka_astro_lang", "hi");
    });
    await page.reload({ waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 1200));
    await snap("proof-08-public-homepage-hindi.png", "Public homepage: Bilingual Devanagari fields via Hindi toggle");

    console.log("Proof walkthrough screenshots recorded successfully!");
  } finally {
    await browser.close();
  }
}

captureProof().catch((err) => {
  console.error("Proof capture error:", err);
  process.exit(1);
});
