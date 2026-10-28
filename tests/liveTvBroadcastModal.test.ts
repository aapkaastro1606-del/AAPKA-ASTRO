import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  LIVE_TV_MODAL_STORAGE_KEY,
  LIVE_TV_MODAL_SESSION_KEY,
  LIVE_TV_MODAL_COOKIE_NAME,
  LIVE_TV_MODAL_ACTIVE_KEY,
} from "../src/components/home/LiveTvBroadcastModal";
import { isRouteExcludedFromWelcomeModal } from "../src/components/home/WelcomeConsultationModal";

describe("Live TV Broadcast Announcement Modal - Reputation & Copy Compliance", () => {
  const modalFilePath = path.join(
    process.cwd(),
    "src/components/home/LiveTvBroadcastModal.tsx"
  );
  const modalCode = fs.readFileSync(modalFilePath, "utf8");

  const layoutFilePath = path.join(
    process.cwd(),
    "src/app/layout.tsx"
  );
  const layoutCode = fs.readFileSync(layoutFilePath, "utf8");

  const welcomeModalFilePath = path.join(
    process.cwd(),
    "src/components/home/WelcomeConsultationModal.tsx"
  );
  const welcomeModalCode = fs.readFileSync(welcomeModalFilePath, "utf8");

  test("headline & core message highlight Acharya Niraj Kumar on national television", () => {
    // 1. Must prominently feature Acharya Niraj live on television
    assert.match(
      modalCode,
      /WATCH ACHARYA NIRAJ LIVE DAILY ON TELEVISION/i,
      "Modal headline must prominently announce Acharya Niraj live daily on TV"
    );

    // 2. Must feature Live Times News Channel
    assert.match(
      modalCode,
      /Live Times/i,
      "Modal must state Live Times News Channel"
    );

    // 3. Must specify daily 8:00 AM morning broadcast schedule
    assert.match(
      modalCode,
      /8:00 AM/i,
      "Modal must state the daily 8:00 AM broadcast timing"
    );

    // 4. Must feature asking questions and queries live on the news channel
    assert.match(
      modalCode,
      /Ask Your Question & Kundli Query LIVE on News Channel|Ask Live on TV/i,
      "Modal must convey the feature to ask questions/queries live on the news channel"
    );
  });

  test("features prominent WhatsApp live query action button and pre-filled message", () => {
    // 1. WhatsApp link to official sanctum number
    assert.match(
      modalCode,
      /https:\/\/wa\.me\/919311215564/,
      "Must link directly to official WhatsApp number"
    );

    // 2. Pre-filled query text mentioning Live Times and 8:00 AM show
    assert.match(
      modalCode,
      /Live Times News Channel/i,
      "Pre-filled WhatsApp text must mention Live Times News Channel"
    );
    assert.match(
      modalCode,
      /8:00 AM/i,
      "Pre-filled WhatsApp text must mention 8:00 AM show"
    );
  });

  test("renders official media assets: Live Times logo and Acharya Niraj portrait", () => {
    assert.match(
      modalCode,
      /\/images\/live-times-logo\.png/,
      "Must render the official Live Times news channel logo"
    );
    assert.match(
      modalCode,
      /\/images\/(?:Acharya_Niraj_Kumar|acharya-yellow)\.jpg/,
      "Must render Acharya Niraj Kumar's official portrait"
    );
  });

  test("strictly adheres to the Aapka Astro luxury brand aesthetic", () => {
    assert.match(modalCode, /#7B2D26/, "Must use Deep Maroon (#7B2D26)");
    assert.match(modalCode, /#E8A33D/, "Must use Gold (#E8A33D)");
    assert.match(modalCode, /#FFFDF9/, "Must use Warm Ivory (#FFFDF9)");
    assert.match(modalCode, /font-temple/, "Must use sacred temple typography");
  });
});

describe("Live TV Broadcast Announcement Modal - Behavioral Controls & Timing", () => {
  const modalFilePath = path.join(
    process.cwd(),
    "src/components/home/LiveTvBroadcastModal.tsx"
  );
  const modalCode = fs.readFileSync(modalFilePath, "utf8");

  const layoutFilePath = path.join(
    process.cwd(),
    "src/app/layout.tsx"
  );
  const layoutCode = fs.readFileSync(layoutFilePath, "utf8");

  const welcomeModalFilePath = path.join(
    process.cwd(),
    "src/components/home/WelcomeConsultationModal.tsx"
  );
  const welcomeModalCode = fs.readFileSync(welcomeModalFilePath, "utf8");

  test("loads immediately upon website load (delay < 2000ms)", () => {
    assert.match(
      modalCode,
      /delayMs\s*=\s*(?:1[0-9]{3}|[0-9]{1,3})/,
      "Live TV modal must load immediately on page load (< 2000ms delay)"
    );
  });

  test("enforces once-per-session display and stores session keys", () => {
    assert.equal(LIVE_TV_MODAL_STORAGE_KEY, "aapka_live_tv_modal_dismissed");
    assert.equal(LIVE_TV_MODAL_SESSION_KEY, "aapka_live_tv_modal_session_seen");
    assert.equal(LIVE_TV_MODAL_COOKIE_NAME, "aapka_live_tv_seen");
    assert.equal(LIVE_TV_MODAL_ACTIVE_KEY, "aapka_live_tv_modal_active");

    assert.match(
      modalCode,
      /sessionStorage\.getItem\(LIVE_TV_MODAL_SESSION_KEY\)/,
      "Must check session storage to show once per session"
    );
    assert.match(
      modalCode,
      /sessionStorage\.setItem\(LIVE_TV_MODAL_SESSION_KEY,\s*"true"\)/,
      "Must set session storage when displayed"
    );
  });

  test("is dismissible via close button, escape key, and backdrop click", () => {
    assert.match(
      modalCode,
      /aria-label="Close television broadcast announcement"/,
      "Must provide an accessible close button"
    );
    assert.match(
      modalCode,
      /e\.key === "Escape"/,
      "Must support Escape key dismissal"
    );
    assert.match(
      modalCode,
      /onClick=\{handleDismiss\}/,
      "Must support backdrop click dismissal"
    );
  });

  test("strictly suppresses on administrative and consultation operating routes", () => {
    assert.equal(isRouteExcludedFromWelcomeModal("/admin"), true);
    assert.equal(isRouteExcludedFromWelcomeModal("/admin/pricing"), true);
    assert.equal(isRouteExcludedFromWelcomeModal("/dashboard"), true);
    assert.equal(isRouteExcludedFromWelcomeModal("/consult"), true);
    assert.equal(isRouteExcludedFromWelcomeModal("/account"), true);

    // Permitted on visitor routes
    assert.equal(isRouteExcludedFromWelcomeModal("/"), false);
    assert.equal(isRouteExcludedFromWelcomeModal("/horoscope"), false);
    assert.equal(isRouteExcludedFromWelcomeModal("/about"), false);
  });

  test("is mounted in root layout (src/app/layout.tsx)", () => {
    assert.match(
      layoutCode,
      /import\s*{\s*LiveTvBroadcastModal\s*}\s*from\s*["']@\/components\/home\/LiveTvBroadcastModal["']/,
      "Root layout must import LiveTvBroadcastModal"
    );
    assert.match(
      layoutCode,
      /<LiveTvBroadcastModal\s*\/>/,
      "Root layout must render LiveTvBroadcastModal"
    );
  });

  test("coordinates with 50% Off Consultation modal timing (90 seconds / 90000ms)", () => {
    // 50% off welcome modal must now be configured for 90 seconds (90000ms)
    assert.match(
      welcomeModalCode,
      /delayMs\s*=\s*90000/,
      "WelcomeConsultationModal must have delayMs defaulted to 90000ms (90 seconds)"
    );
    assert.match(
      welcomeModalCode,
      /aapka_live_tv_modal_active/,
      "WelcomeConsultationModal must coordinate with Live TV modal active state"
    );
  });
});
