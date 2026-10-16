const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\anmol\\.gemini\\antigravity\\brain\\38dce4e4-16b3-4431-82d2-da75d512f77a";

async function capture() {
  console.log("Launching headless Chrome from:", CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  try {
    const page = await browser.newPage();

    // Helper to take screenshot
    async function takeShot(filename, width, height, lang, openChat) {
      console.log(`Taking screenshot: ${filename} (${width}x${height}, lang: ${lang}, open: ${openChat})`);
      await page.setViewport({ width, height, deviceScaleFactor: 2 });
      
      // Navigate to homepage
      await page.goto("http://localhost:3005", { waitUntil: "networkidle2", timeout: 30000 });

      // Set language in localStorage
      await page.evaluate((l) => {
        localStorage.setItem("aapka_astro_lang", l);
      }, lang);

      // Reload so LanguageContext picks it up
      await page.reload({ waitUntil: "networkidle2" });
      await new Promise((r) => setTimeout(r, 1500));

      if (openChat) {
        // Find and click the assistant trigger button
        const selector = 'button[aria-label="Open Aapka Astro AI Assistant"], button[aria-label="AI सहायक खोलें"]';
        await page.waitForSelector(selector, { timeout: 10000 });
        await page.click(selector);
        await new Promise((r) => setTimeout(r, 1500));
      }

      const destPath = path.join(ARTIFACT_DIR, filename);
      await page.screenshot({ path: destPath, fullPage: false });
      console.log(`Saved screenshot to: ${destPath}`);
    }

    // 1. Desktop English Closed
    await takeShot("screenshot-desktop-closed-en.png", 1280, 800, "en", false);

    // 2. Desktop English Open
    await takeShot("screenshot-desktop-open-en.png", 1280, 800, "en", true);

    // 3. Desktop Hindi Closed
    await takeShot("screenshot-desktop-closed-hi.png", 1280, 800, "hi", false);

    // 4. Desktop Hindi Open
    await takeShot("screenshot-desktop-open-hi.png", 1280, 800, "hi", true);

    // 5. Mobile (390px phone) English Closed
    await takeShot("screenshot-mobile-closed-en.png", 390, 844, "en", false);

    // 6. Mobile (390px phone) English Open
    await takeShot("screenshot-mobile-open-en.png", 390, 844, "en", true);

    // 7. Mobile (390px phone) Hindi Closed
    await takeShot("screenshot-mobile-closed-hi.png", 390, 844, "hi", false);

    // 8. Mobile (390px phone) Hindi Open
    await takeShot("screenshot-mobile-open-hi.png", 390, 844, "hi", true);

    console.log("All 8 screenshots successfully captured!");
  } finally {
    await browser.close();
  }
}

capture().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
