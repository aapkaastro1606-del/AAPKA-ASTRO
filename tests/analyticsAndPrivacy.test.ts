import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import {
  sanitizeString,
  sanitizeUrl,
  sanitizeEventParams,
} from "../src/lib/analytics/piiSanitizer";
import {
  isRouteExcluded,
  isStaffOrOwnerUser,
  trackEvent,
  trackWhatsAppClick,
  trackCallClick,
  trackChatbotOpened,
  trackLanguageSwitched,
  trackContactFormSent,
  trackCoursePageViewed,
  trackFreeKundliGenerated,
  trackBookingStarted,
  trackPaymentClaimed,
  trackEnrolmentStarted,
  trackEnquiry,
  CONSENT_STORAGE_KEY,
} from "../src/lib/analytics/trackEvent";

describe("Traffic Analytics & Privacy Compliance Test Suite", () => {
  describe("1. Strict PII Sanitization Guardrails", () => {
    it("redacts email addresses from arbitrary text", () => {
      const input = "Please contact me at seeker.anand@gmail.com for details";
      const cleaned = sanitizeString(input);
      assert.strictEqual(cleaned.includes("seeker.anand@gmail.com"), false);
      assert.strictEqual(cleaned.includes("[REDACTED_EMAIL]"), true);
    });

    it("redacts 10-digit and international phone numbers from text", () => {
      const input1 = "Call me on 9876543210 urgently";
      const cleaned1 = sanitizeString(input1);
      assert.strictEqual(cleaned1.includes("9876543210"), false);
      assert.strictEqual(cleaned1.includes("[REDACTED_PHONE]"), true);

      const input2 = "WhatsApp +91 93112 15564";
      const cleaned2 = sanitizeString(input2);
      assert.strictEqual(cleaned2.includes("[REDACTED_PHONE]"), true);
    });

    it("redacts 12-digit UPI transaction references (UTRs)", () => {
      const input = "Paid via GPay with UTR 428901234567 successfully";
      const cleaned = sanitizeString(input);
      assert.strictEqual(cleaned.includes("428901234567"), false);
      assert.strictEqual(cleaned.includes("[REDACTED_UTR]"), true);
    });

    it("redacts booking reference numbers (ASTRO-XXXXXX, VAASTU-XXXXXX)", () => {
      const input = "Status inquiry for booking ASTRO-2026-X991A";
      const cleaned = sanitizeString(input);
      assert.strictEqual(cleaned.includes("ASTRO-2026-X991A"), false);
      assert.strictEqual(cleaned.includes("[REDACTED_REF]"), true);
    });

    it("completely removes sensitive keys from event parameter payloads", () => {
      const rawPayload = {
        name: "Rahul Sharma",
        userEmail: "rahul@example.com",
        phone: "+919876543210",
        utr: "123456789012",
        bookingId: "ASTRO-10293",
        dob: "1992-05-14",
        product_type: "astro",
        amount: 2100,
        currency: "INR",
      };

      const safePayload = sanitizeEventParams(rawPayload);

      assert.strictEqual(safePayload.name, undefined);
      assert.strictEqual(safePayload.userEmail, undefined);
      assert.strictEqual(safePayload.phone, undefined);
      assert.strictEqual(safePayload.utr, undefined);
      assert.strictEqual(safePayload.bookingId, undefined);
      assert.strictEqual(safePayload.dob, undefined);

      // Safe non-PII attributes must be retained
      assert.strictEqual(safePayload.product_type, "astro");
      assert.strictEqual(safePayload.amount, 2100);
      assert.strictEqual(safePayload.currency, "INR");
    });

    it("strips sensitive query parameters from URLs", () => {
      const dirtyUrl = "https://www.aapkaastro.com/consult?email=test@example.com&phone=9876543210&source=header";
      const clean = sanitizeUrl(dirtyUrl);
      assert.strictEqual(clean.includes("test@example.com"), false);
      assert.strictEqual(clean.includes("9876543210"), false);
      assert.strictEqual(clean.includes("source=header"), true);
    });
  });

  describe("2. Route & Staff Exclusion Blacklist", () => {
    it("excludes all administrative and account routes from tracking", () => {
      assert.strictEqual(isRouteExcluded("/admin"), true);
      assert.strictEqual(isRouteExcluded("/admin/bookings"), true);
      assert.strictEqual(isRouteExcluded("/admin/pricing"), true);
      assert.strictEqual(isRouteExcluded("/admin/leads"), true);
      assert.strictEqual(isRouteExcluded("/dashboard"), true);
      assert.strictEqual(isRouteExcluded("/dashboard/blog"), true);
      assert.strictEqual(isRouteExcluded("/dashboard/reels"), true);
      assert.strictEqual(isRouteExcluded("/instructor"), true);
      assert.strictEqual(isRouteExcluded("/instructor/courses"), true);
      assert.strictEqual(isRouteExcluded("/account"), true);
      assert.strictEqual(isRouteExcluded("/account/profile"), true);
    });

    it("allows public exploration routes to be tracked", () => {
      assert.strictEqual(isRouteExcluded("/"), false);
      assert.strictEqual(isRouteExcluded("/about"), false);
      assert.strictEqual(isRouteExcluded("/services"), false);
      assert.strictEqual(isRouteExcluded("/consult"), false);
      assert.strictEqual(isRouteExcluded("/kundli-generator"), false);
      assert.strictEqual(isRouteExcluded("/blog"), false);
      assert.strictEqual(isRouteExcluded("/cookie-policy"), false);
      assert.strictEqual(isRouteExcluded("/privacy-policy"), false);
    });

    it("excludes signed-in Owner and staff roles from tracking", () => {
      assert.strictEqual(isStaffOrOwnerUser("aapkaastro1606@gmail.com"), true);
      assert.strictEqual(isStaffOrOwnerUser("AAPKAASTRO1606@GMAIL.COM"), true);
      assert.strictEqual(isStaffOrOwnerUser("helper@aapkaastro.com", "STAFF"), true);
      assert.strictEqual(isStaffOrOwnerUser("admin@aapkaastro.com", "ADMIN"), true);
      assert.strictEqual(isStaffOrOwnerUser("astrologer@aapkaastro.com", "ASTROLOGER"), true);
      assert.strictEqual(isStaffOrOwnerUser("instructor@aapkaastro.com", "INSTRUCTOR"), true);

      // Regular seeker / client must NOT be excluded
      assert.strictEqual(isStaffOrOwnerUser("seeker@gmail.com", "CLIENT"), false);
      assert.strictEqual(isStaffOrOwnerUser("seeker@gmail.com", null), false);
    });
  });

  describe("3. Consent Mode v2 & Event Dispatch Gate", () => {
    it("rejects event dispatch when consent is not granted (zero analytics requests)", () => {
      // In Node environment without window/localStorage consent, trackEvent must safely return false
      const dispatched = trackEvent("test_event", { foo: "bar" });
      assert.strictEqual(dispatched, false);
    });
  });

  describe("4. Documentation, Legal Notices & Cookie Policy Files", () => {
    it("documents all standardized events in docs/ANALYTICS.md", () => {
      const docPath = path.join(process.cwd(), "docs/ANALYTICS.md");
      assert.strictEqual(fs.existsSync(docPath), true, "docs/ANALYTICS.md must exist");
      const content = fs.readFileSync(docPath, "utf8");

      assert.ok(content.includes("click_whatsapp"), "Documents click_whatsapp");
      assert.ok(content.includes("click_call"), "Documents click_call");
      assert.ok(content.includes("chatbot_opened"), "Documents chatbot_opened");
      assert.ok(content.includes("language_switched"), "Documents language_switched");
      assert.ok(content.includes("contact_form_sent"), "Documents contact_form_sent");
      assert.ok(content.includes("course_page_viewed"), "Documents course_page_viewed");
      assert.ok(content.includes("free_kundli_generated"), "Documents free_kundli_generated");
      assert.ok(content.includes("booking_started"), "Documents booking_started");
      assert.ok(content.includes("payment_claimed"), "Documents payment_claimed");
      assert.ok(content.includes("enrolment_started"), "Documents enrolment_started (Viar)");
      assert.ok(content.includes("enquiry_whatsapp"), "Documents enquiry_whatsapp (DOW)");
      assert.ok(content.includes("enquiry_call"), "Documents enquiry_call (DOW)");
      assert.ok(content.includes("Consent Mode v2"), "Documents Consent Mode v2");
      assert.ok(content.includes("Cookieless"), "Documents cookieless Vercel Analytics");
      assert.ok(content.includes("2 Months"), "Documents GA4 default retention window");
    });

    it("updates Privacy Policy with lawyer review notice, retention, and processors", () => {
      const privacyPath = path.join(process.cwd(), "src/app/privacy-policy/page.tsx");
      const content = fs.readFileSync(privacyPath, "utf8");

      assert.ok(content.includes("Pending Lawyer Review"), "Privacy policy has pending lawyer review notice");
      assert.ok(content.includes("Google Analytics 4"), "Explains GA4 analytics");
      assert.ok(content.includes("Vercel"), "Explains Vercel Analytics");
      assert.ok(content.includes("Cookie Notice"), "Links to Cookie Notice");
    });

    it("provides dedicated /cookie-policy page with consent reset action", () => {
      const cookiePath = path.join(process.cwd(), "src/app/cookie-policy/page.tsx");
      assert.strictEqual(fs.existsSync(cookiePath), true, "Cookie policy page must exist");
      const content = fs.readFileSync(cookiePath, "utf8");

      assert.ok(content.includes("Pending Lawyer Review"), "Cookie policy has pending lawyer review notice");
      assert.ok(content.includes("CookiePreferenceResetButton"), "Provides interactive consent reset button");
      assert.ok(content.includes("Google LLC"), "Documents Google LLC as processor");
      assert.ok(content.includes("Vercel Inc."), "Documents Vercel Inc. as processor");
      assert.ok(content.includes("2 months"), "Documents GA4 retention period");
    });

    it("ensures Admin Home Traffic tile and Analytics panel show three questions and no invented numbers", () => {
      const adminPath = path.join(process.cwd(), "src/app/admin/AdminHomeClient.tsx");
      const adminContent = fs.readFileSync(adminPath, "utf8");
      assert.ok(adminContent.includes("Visitor Traffic & Search Analytics"), "Has Traffic tile");
      assert.ok(adminContent.includes("Not connected yet"), "Handles not connected state");

      const analyticsPath = path.join(process.cwd(), "src/app/admin/analytics/AnalyticsManagerClient.tsx");
      const analyticsContent = fs.readFileSync(analyticsPath, "utf8");
      assert.ok(analyticsContent.includes("How many people visited this week?"), "Answers question 1");
      assert.ok(analyticsContent.includes("From which countries and cities?"), "Answers question 2");
      assert.ok(analyticsContent.includes("Which pages did they read?"), "Answers question 3");
      assert.ok(analyticsContent.includes("Google Search Console"), "Links to Google Search Console");
      assert.ok(analyticsContent.includes("Not connected yet"), "Displays not connected status when env is missing");
      assert.ok(!analyticsContent.includes("12,450 pageviews"), "Shows no invented traffic numbers");
    });
  });
});
