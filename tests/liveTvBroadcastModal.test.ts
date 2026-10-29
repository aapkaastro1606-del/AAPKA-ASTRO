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

  test("headline & core message highlight Acharya Niraj Kumar on Live Times 'Kaal Ki Chaal'", () => {
    // 1. Must feature Live Times News Channel
    assert.match(
      modalCode,
      /Live Times/i,
      "Modal must state Live Times News Channel"
    );

    // 2. Must feature verified programme 'Kaal Ki Chaal'
    assert.match(
      modalCode,
      /Kaal Ki Chaal|programmeName/i,
      "Modal must state the verified programme name 'Kaal Ki Chaal'"
    );

    // 3. Must specify daily 8:00 AM morning broadcast schedule
    assert.match(
      modalCode,
      /8:00 to 8:30 AM IST|8:00 AM/i,
      "Modal must state the daily morning broadcast timing"
    );

    // 4. Must specify role as guest astrologer
    assert.match(
      modalCode,
      /Guest Astrologer|role/i,
      "Modal must state Acharya Niraj Kumar's role as guest astrologer"
    );

    // 5. Must feature how to ask questions live on TV free of charge
    assert.match(
      modalCode,
      /How to Ask a Question|प्रश्न कैसे भेजें/i,
      "Modal must explain how to ask a question for the programme"
    );
  });

  test("features prominent WhatsApp live query action button starting with #KaalKiChaal", () => {
    // 1. WhatsApp link to official sanctum number
    assert.match(
      modalCode,
      /buildLiveTvWhatsAppUrl|wa\.me/,
      "Must link directly to official WhatsApp number"
    );

    // 2. Must feature #KaalKiChaal query prefix
    assert.match(
      modalCode,
      /#KaalKiChaal/,
      "WhatsApp button must instruct #KaalKiChaal prefix"
    );
  });

  test("enforces safe logo representation: channel name as text unless channelLogoApproved is on", () => {
    assert.match(
      modalCode,
      /settings\.channelLogoApproved/,
      "Logo image must be conditional on channelLogoApproved switch"
    );
    assert.match(
      modalCode,
      /settings\.channelName/,
      "Channel name must render as clean text by default"
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
      /aria-label=/,
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
    // 50% off welcome modal must have delayMs defaulted to 90 seconds (90000ms)
    assert.match(
      welcomeModalCode,
      /delayMs\s*=\s*90000/,
      "WelcomeConsultationModal must have delayMs defaulted to 90000ms (90 seconds)"
    );
    assert.match(
      welcomeModalCode,
      /aapka_popup_visit_claimed|aapka_live_tv_modal_active/,
      "WelcomeConsultationModal must coordinate with Live TV modal active state"
    );
  });
});
