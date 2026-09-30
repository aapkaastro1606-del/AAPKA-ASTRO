import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  DEFAULT_NAVRATRI_PROMO_CONFIG,
  isNavratriPromoActive,
  NavratriPromoConfig,
} from "../src/config/placeholderContent";
import { AdminStore } from "../src/lib/store/adminStore";
import {
  NAVRATRI_PROMO_STORAGE_KEY,
  NAVRATRI_PROMO_SESSION_KEY,
  NAVRATRI_PROMO_COOKIE_NAME,
} from "../src/components/promotions/NavratriPromotionalModal";
import {
  isRouteExcludedFromWelcomeModal,
  isUserInActiveSessionOrConsultation,
} from "../src/components/home/WelcomeConsultationModal";

describe("Navratri Promotional Modal - Policy & Headline Compliance", () => {
  const modalFilePath = path.join(
    process.cwd(),
    "src/components/promotions/NavratriPromotionalModal.tsx"
  );
  const modalCode = fs.readFileSync(modalFilePath, "utf8");

  const layoutFilePath = path.join(process.cwd(), "src/app/layout.tsx");
  const layoutCode = fs.readFileSync(layoutFilePath, "utf8");

  const welcomeModalFilePath = path.join(
    process.cwd(),
    "src/components/home/WelcomeConsultationModal.tsx"
  );
  const welcomeModalCode = fs.readFileSync(welcomeModalFilePath, "utf8");

  test("headline strictly adheres to client-specified verbatim copy", () => {
    // Exact headline required by client
    const expectedHeadline =
      "Get one abhimantrit Rudraksh on consultation — limited period offer, only for Navratri.";
    assert.equal(
      DEFAULT_NAVRATRI_PROMO_CONFIG.headline,
      expectedHeadline,
      "Default headline config must match client verbatim copy"
    );
    assert.match(
      modalCode,
      /navratri-promo-title/,
      "Modal must render the promotional headline in a dedicated title element"
    );
  });

  test("explicitly clarifies applicability to booked consultations (both Astro & Vaastu by default)", () => {
    assert.equal(
      DEFAULT_NAVRATRI_PROMO_CONFIG.appliesTo,
      "both",
      "Default applicability must be 'both' (Astro & Vaastu)"
    );
    assert.match(
      DEFAULT_NAVRATRI_PROMO_CONFIG.applicabilityNote,
      /both Vedic Astro Consultation and Vaastu Consultation/i,
      "Applicability note must explicitly state it applies to both consultations"
    );
    assert.match(
      modalCode,
      /Vedic Astro Consultation/i,
      "Modal UI copy must mention Vedic Astro Consultation"
    );
    assert.match(
      modalCode,
      /Vaastu Consultation/i,
      "Modal UI copy must mention Vaastu Consultation"
    );
  });

  test("strictly adheres to the Aapka Astro temple brand system", () => {
    // Brand Tokens Present:
    assert.match(modalCode, /#7B2D26/, "Must use Deep Maroon (#7B2D26)");
    assert.match(modalCode, /#E8A33D/, "Must use Marigold Gold (#E8A33D)");
    assert.match(modalCode, /#FBF3E7/, "Must use Warm Ivory (#FBF3E7)");
    assert.match(modalCode, /#FFFDF9/, "Must use Ivory Card (#FFFDF9)");
    assert.match(modalCode, /#3B2A1E/, "Must use Sandalwood text (#3B2A1E)");

    // Typography:
    assert.match(modalCode, /font-temple/, "Must use font-temple (Cinzel) for sacred headings");
    assert.match(modalCode, /font-body/, "Must use font-body (Mukta) for readable body text");

    // Strictly NOT generic electric yellow / black:
    const forbiddenPatterns = [/#FFD700/i, /#FFF000/i, /bg-yellow-400/i, /text-yellow-400/i];
    for (const pattern of forbiddenPatterns) {
      assert.doesNotMatch(
        modalCode,
        pattern,
        `Modal must not use generic electric yellow theme: ${pattern}`
      );
    }
  });

  test("modal and welcome modal both mounted in root layout with distinct components", () => {
    assert.match(
      layoutCode,
      /import\s*\{\s*WelcomeConsultationModal\s*\}\s*from/,
      "layout.tsx must import WelcomeConsultationModal"
    );
    assert.match(
      layoutCode,
      /<WelcomeConsultationModal\s*\/>/,
      "layout.tsx must mount WelcomeConsultationModal"
    );
    assert.match(
      layoutCode,
      /import\s*\{\s*NavratriPromotionalModal\s*\}\s*from/,
      "layout.tsx must import NavratriPromotionalModal"
    );
    assert.match(
      layoutCode,
      /<NavratriPromotionalModal\s*\/>/,
      "layout.tsx must mount NavratriPromotionalModal"
    );
  });

  test("welcome modal yields priority to Navratri promotional modal when active", () => {
    assert.match(
      welcomeModalCode,
      /isNavratriPromoActive/,
      "WelcomeConsultationModal must check isNavratriPromoActive"
    );
    assert.match(
      welcomeModalCode,
      /astro_promo_updated/,
      "WelcomeConsultationModal must listen to astro_promo_updated event"
    );
  });
});

describe("Navratri Promotional Window & Admin Config Logic", () => {
  test("evaluates active date window accurately (IST boundary)", () => {
    const config: NavratriPromoConfig = {
      enabled: true,
      startDate: "2026-10-10",
      endDate: "2026-10-20",
      headline: "Navratri Special",
      subheadline: "Festive blessing",
      blessingDescription: "Authentic Rudraksh",
      applicabilityNote: "Valid on all booked consultations",
      appliesTo: "both",
      ctaText: "Claim Rudraksh",
    };

    // Before window
    const beforeDate = new Date(2026, 9, 9, 23, 59, 59); // Oct 9, 2026
    assert.equal(isNavratriPromoActive(config, beforeDate), false);

    // On start date (morning)
    const startDateMorning = new Date(2026, 9, 10, 8, 30, 0); // Oct 10, 2026
    assert.equal(isNavratriPromoActive(config, startDateMorning), true);

    // Middle of window
    const midDate = new Date(2026, 9, 15, 14, 0, 0); // Oct 15, 2026
    assert.equal(isNavratriPromoActive(config, midDate), true);

    // On end date (night before midnight)
    const endDateNight = new Date(2026, 9, 20, 23, 59, 0); // Oct 20, 2026
    assert.equal(isNavratriPromoActive(config, endDateNight), true);

    // After window
    const afterDate = new Date(2026, 9, 21, 0, 0, 1); // Oct 21, 2026
    assert.equal(isNavratriPromoActive(config, afterDate), false);

    // Disabled toggle suppresses promo even within window
    const disabledConfig = { ...config, enabled: false };
    assert.equal(isNavratriPromoActive(disabledConfig, midDate), false);
  });

  test("adminStore integrates navratriPromo settings and supports live updates", () => {
    const initialPricing = AdminStore.getPricing();
    assert.ok(initialPricing.navratriPromo, "PricingSettings must include navratriPromo config");
    assert.equal(initialPricing.navratriPromo.enabled, true);

    // Update promo settings
    AdminStore.updatePricing({
      navratriPromo: {
        ...initialPricing.navratriPromo,
        startDate: "2026-10-01",
        endDate: "2026-10-15",
        appliesTo: "both",
      },
    });

    const updated = AdminStore.getPricing();
    assert.equal(updated.navratriPromo?.startDate, "2026-10-01");
    assert.equal(updated.navratriPromo?.endDate, "2026-10-15");

    // Restore default
    AdminStore.updatePricing({
      navratriPromo: { ...DEFAULT_NAVRATRI_PROMO_CONFIG },
    });
  });

  test("pricing manager client includes festive campaign controls", () => {
    const adminPanelPath = path.join(
      process.cwd(),
      "src/app/admin/pricing/PricingManagerClient.tsx"
    );
    const adminPanelCode = fs.readFileSync(adminPanelPath, "utf8");

    assert.match(
      adminPanelCode,
      /Festive Campaign: Navratri Rudraksh Promotion/,
      "Admin panel must include Festive Campaign section"
    );
    assert.match(
      adminPanelCode,
      /navratriPromoEnabled/,
      "Admin panel must include campaign status toggle"
    );
    assert.match(
      adminPanelCode,
      /startDate/,
      "Admin panel must include start date picker"
    );
    assert.match(
      adminPanelCode,
      /endDate/,
      "Admin panel must include end date picker"
    );
    assert.match(
      adminPanelCode,
      /appliesTo/,
      "Admin panel must include consultation applicability dropdown"
    );
  });
});

describe("Navratri Promotional Modal Behavioral Controls", () => {
  test("enforces once per visitor per browser session keys", () => {
    assert.equal(NAVRATRI_PROMO_SESSION_KEY, "aapka_navratri_promo_session_seen");
    assert.equal(NAVRATRI_PROMO_STORAGE_KEY, "aapka_navratri_promo_dismissed");
    assert.equal(NAVRATRI_PROMO_COOKIE_NAME, "aapka_navratri_promo_seen");
  });

  test("strictly suppresses on operating console routes and booking flow", () => {
    const excludedRoutes = [
      "/dashboard",
      "/dashboard/overview",
      "/admin",
      "/admin/pricing",
      "/admin/team",
      "/astrologer",
      "/astrologer/profile",
      "/account",
      "/account/orders",
      "/consult",
      "/consult/room",
      "/login",
      "/signup",
    ];

    for (const route of excludedRoutes) {
      assert.equal(
        isRouteExcludedFromWelcomeModal(route),
        true,
        `Route ${route} must be suppressed`
      );
    }

    const allowedRoutes = [
      "/",
      "/panchang",
      "/kundli",
      "/horoscope/aries",
      "/about",
      "/contact",
      "/terms",
      "/privacy",
    ];

    for (const route of allowedRoutes) {
      assert.equal(
        isRouteExcludedFromWelcomeModal(route),
        false,
        `Public route ${route} must be allowed to show promo modal`
      );
    }
  });

  test("strictly does not show to a user who is logged in or already mid-consultation", () => {
    assert.equal(
      isUserInActiveSessionOrConsultation(true, "/"),
      true,
      "Must suppress when user is authenticated"
    );
    assert.equal(
      isUserInActiveSessionOrConsultation(false, "/consult"),
      true,
      "Must suppress when path is active consultation flow"
    );
    assert.equal(
      isUserInActiveSessionOrConsultation(false, "/"),
      false,
      "Must allow when unauthenticated on public home page"
    );
  });
});
