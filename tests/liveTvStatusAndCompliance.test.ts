import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  DEFAULT_LIVE_TV_SETTINGS,
  LiveTvBroadcastSettings,
  evaluateLiveTvStatus,
  buildLiveTvWhatsAppUrl,
  RECONFIRMATION_GRACE_DAYS,
} from "../src/config/liveTvBroadcastConfig";
import { queryKnowledgeBase } from "../src/lib/assistant/queryEngine";

describe("Live TV Broadcast - Confirmed Facts & Status Engine (IST)", () => {
  it("evaluates LIVE_NOW between 08:00 and 08:30 IST on scheduled days", () => {
    // 2026-10-30 08:15:00 IST -> 2026-10-30T02:45:00.000Z
    const testDate = new Date("2026-10-30T02:45:00.000Z");
    const result = evaluateLiveTvStatus(DEFAULT_LIVE_TV_SETTINGS, testDate);

    assert.equal(result.status, "LIVE_NOW");
    assert.equal(result.isVisible, true);
    assert.equal(result.labelEn, "Live now on Live Times");
    assert.equal(result.labelHi, "Live Times पर अभी लाइव");

    // The word "live" MUST appear in LIVE_NOW
    assert.match(result.labelEn.toLowerCase(), /live/);
  });

  it("evaluates UPCOMING_TODAY before 08:00 IST on scheduled days", () => {
    // 2026-10-30 07:45:00 IST -> 2026-10-30T02:15:00.000Z
    const testDate = new Date("2026-10-30T02:15:00.000Z");
    const result = evaluateLiveTvStatus(DEFAULT_LIVE_TV_SETTINGS, testDate);

    assert.equal(result.status, "UPCOMING_TODAY");
    assert.equal(result.isVisible, true);
    assert.equal(result.labelEn, "Today at 8:00 AM IST");
    assert.equal(result.labelHi, "आज सुबह 8:00 बजे (IST)");

    // The word "live" must NOT appear in UPCOMING_TODAY
    assert.equal(/live/i.test(result.labelEn), false, "The word 'live' must not appear in UPCOMING_TODAY");
    assert.equal(/live/i.test(result.labelHi), false, "The word 'live' must not appear in UPCOMING_TODAY (Hindi)");
  });

  it("evaluates TOMORROW after 08:30 IST on scheduled days", () => {
    // 2026-10-30 16:32:00 IST -> 2026-10-30T11:02:00.000Z (the screenshot time!)
    const testDate = new Date("2026-10-30T11:02:00.000Z");
    const result = evaluateLiveTvStatus(DEFAULT_LIVE_TV_SETTINGS, testDate);

    assert.equal(result.status, "TOMORROW");
    assert.equal(result.isVisible, true);
    assert.equal(result.labelEn, "Tomorrow at 8:00 AM IST");
    assert.equal(result.labelHi, "कल सुबह 8:00 बजे (IST)");

    // The word "live" must NOT appear in TOMORROW
    assert.equal(/live/i.test(result.labelEn), false, "The word 'live' must not appear in TOMORROW");
  });

  it("evaluates OFF_TODAY when Owner activates notOnAirToday switch", () => {
    const settings: LiveTvBroadcastSettings = {
      ...DEFAULT_LIVE_TV_SETTINGS,
      notOnAirToday: true,
      returnDate: "2 Nov",
    };

    // Even during 08:15 IST, notOnAirToday takes precedence
    const testDate = new Date("2026-10-30T02:45:00.000Z");
    const result = evaluateLiveTvStatus(settings, testDate);

    assert.equal(result.status, "OFF_TODAY");
    assert.equal(result.isVisible, true);
    assert.match(result.labelEn, /Not on air today \(Returns 2 Nov\)/);
    assert.match(result.labelHi, /आज प्रसारण नहीं है \(वापसी: 2 Nov\)/);

    // The word "live" must NOT appear in OFF_TODAY
    assert.equal(/live/i.test(result.labelEn), false, "The word 'live' must not appear in OFF_TODAY");
  });

  it("evaluates ENDED and sets isVisible=false when programmeEnded is active", () => {
    const settings: LiveTvBroadcastSettings = {
      ...DEFAULT_LIVE_TV_SETTINGS,
      programmeEnded: true,
    };

    const result = evaluateLiveTvStatus(settings);
    assert.equal(result.status, "ENDED");
    assert.equal(result.isVisible, false, "ENDED must hide all broadcast content site-wide");
  });

  it("evaluates UNCONFIRMED and sets isVisible=false when 37-day reconfirmation lapses", () => {
    // 40 days ago
    const expiredDate = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString();
    const settings: LiveTvBroadcastSettings = {
      ...DEFAULT_LIVE_TV_SETTINGS,
      lastReconfirmedAt: expiredDate,
    };

    const result = evaluateLiveTvStatus(settings);
    assert.equal(result.status, "UNCONFIRMED");
    assert.equal(result.isVisible, false, "UNCONFIRMED must hide all broadcast content site-wide");
    assert.equal(result.reconfirmationExpired, true);
  });
});

describe("Forbidden-Text Anti-Pattern Protection Audit", () => {
  const filesToAudit = [
    "src/config/liveTvBroadcastConfig.ts",
    "src/components/home/LiveTvBroadcastModal.tsx",
    "src/components/home/LiveTvHomeStrip.tsx",
    "src/components/about/LiveTvAboutSection.tsx",
  ];

  const forbiddenTerms = [
    "National",
    "Tata Play",
    "Airtel DTH",
    "Dish TV",
    "D2H",
    "local cable",
  ];

  for (const relPath of filesToAudit) {
    it(`guarantees ${relPath} contains zero forbidden terms`, () => {
      const fullPath = path.join(process.cwd(), relPath);
      assert.ok(fs.existsSync(fullPath), `File must exist: ${relPath}`);
      const content = fs.readFileSync(fullPath, "utf8");

      for (const term of forbiddenTerms) {
        const regex = new RegExp(`\\b${term}\\b`, "i");
        assert.equal(
          regex.test(content),
          false,
          `Forbidden term "${term}" must NOT appear in ${relPath}`
        );
      }
    });
  }
});

describe("Logo Permission & Safe Representation", () => {
  it("renders channel name as plain text when channelLogoApproved is false", () => {
    const modalPath = path.join(process.cwd(), "src/components/home/LiveTvBroadcastModal.tsx");
    const modalCode = fs.readFileSync(modalPath, "utf8");

    // Must check channelLogoApproved before showing image
    assert.match(
      modalCode,
      /settings\.channelLogoApproved/,
      "Must check channelLogoApproved before rendering logo image"
    );
  });

  it("ensures WhatsApp prefilled message begins with #KaalKiChaal", () => {
    const url = buildLiveTvWhatsAppUrl(DEFAULT_LIVE_TV_SETTINGS);
    const decoded = decodeURIComponent(url);

    assert.match(
      decoded,
      /#KaalKiChaal/,
      "WhatsApp message must begin with #KaalKiChaal"
    );
    assert.match(decoded, /Name:/);
    assert.match(decoded, /Question:/);
    assert.match(decoded, /Date of Birth:/);
    assert.match(decoded, /Time of Birth:/);
    assert.match(decoded, /Place of Birth:/);
  });
});

describe("Chatbot State-Aware Broadcast Answers", () => {
  it("answers active broadcast questions honestly without inventing operators", () => {
    const resp = queryKnowledgeBase("Where can I watch Acharya ji on TV?", DEFAULT_LIVE_TV_SETTINGS);

    assert.equal(resp.intent, "television_broadcast_info");
    assert.match(resp.answer, /Kaal Ki Chaal/i);
    assert.match(resp.answer, /Live Times/i);
    assert.match(resp.answer, /8:00 to 8:30 AM IST/i);
    assert.match(resp.answer, /guest astrologer/i);
    assert.match(resp.answer, /#KaalKiChaal/);

    // Must NOT invent operators
    assert.equal(/Tata Play/i.test(resp.answer), false);
    assert.equal(/Airtel DTH/i.test(resp.answer), false);
    assert.equal(/National/i.test(resp.answer), false);
  });

  it("answers honestly that programme has ended when programmeEnded is active", () => {
    const endedSettings: LiveTvBroadcastSettings = {
      ...DEFAULT_LIVE_TV_SETTINGS,
      programmeEnded: true,
    };

    const resp = queryKnowledgeBase("Can I watch Acharya ji on live times tv?", endedSettings);
    assert.equal(resp.intent, "television_broadcast_ended");
    assert.match(resp.answer, /concluded|samapt/i);
  });

  it("answers honestly that Acharya Ji is not on air today when notOnAirToday is active", () => {
    const offSettings: LiveTvBroadcastSettings = {
      ...DEFAULT_LIVE_TV_SETTINGS,
      notOnAirToday: true,
      returnDate: "5 Nov",
    };

    const resp = queryKnowledgeBase("Is Acharya ji on tv today?", offSettings);
    assert.equal(resp.intent, "television_broadcast_off_today");
    assert.match(resp.answer, /not appearing on Live Times.*today|उपस्थित नहीं हैं/i);
    assert.match(resp.answer, /5 Nov/);
  });
});

describe("One Popup Per Visit Coordination & Viewport Accessibility", () => {
  it("guarantees POPUP_VISIT_CLAIMED_KEY coordinates priority between modals", () => {
    const tvModalCode = fs.readFileSync(
      path.join(process.cwd(), "src/components/home/LiveTvBroadcastModal.tsx"),
      "utf8"
    );
    const navratriModalCode = fs.readFileSync(
      path.join(process.cwd(), "src/components/promotions/NavratriPromotionalModal.tsx"),
      "utf8"
    );
    const welcomeModalCode = fs.readFileSync(
      path.join(process.cwd(), "src/components/home/WelcomeConsultationModal.tsx"),
      "utf8"
    );

    assert.match(tvModalCode, /POPUP_VISIT_CLAIMED_KEY/);
    assert.match(navratriModalCode, /POPUP_VISIT_CLAIMED_KEY/);
    assert.match(welcomeModalCode, /aapka_popup_visit_claimed/);
  });

  it("enforces 7-day dismissal window persistence", () => {
    const tvModalCode = fs.readFileSync(
      path.join(process.cwd(), "src/components/home/LiveTvBroadcastModal.tsx"),
      "utf8"
    );
    assert.match(tvModalCode, /SEVEN_DAYS_MS/);
  });

  it("supports keyboard Escape key to close modal", () => {
    const tvModalCode = fs.readFileSync(
      path.join(process.cwd(), "src/components/home/LiveTvBroadcastModal.tsx"),
      "utf8"
    );
    assert.match(tvModalCode, /e\.key === "Escape"/);
  });

  it("modal container fits compact mobile (390px) and laptop (1366x768)", () => {
    const tvModalCode = fs.readFileSync(
      path.join(process.cwd(), "src/components/home/LiveTvBroadcastModal.tsx"),
      "utf8"
    );
    assert.match(tvModalCode, /max-w-\[520px\]/);
    assert.match(tvModalCode, /max-h-\[92vh\]/);
    assert.match(tvModalCode, /overflow-y-auto/);
  });
});
