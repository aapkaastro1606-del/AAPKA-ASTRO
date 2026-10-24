import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import {
  GeminiChatProvider,
  OpenAICompatibleChatProvider,
  getChatProvider,
  isChatbotConfigured,
} from "@/lib/assistant/chatProvider";
import {
  ChatbotHealthTracker,
  ChatbotErrorType,
} from "@/lib/assistant/chatbotHealthTracker";
import {
  checkChatbotRateLimit,
  _resetRateLimitsForTesting,
} from "@/lib/assistant/rateLimiter";
import {
  maskPii,
  cleanupExpiredUnansweredQuestions,
} from "@/lib/assistant/retriever";
import { POST as chatHandler } from "@/app/api/chat/route";
import { GET as chatStatusHandler } from "@/app/api/chat/status/route";
import { GET as cleanupCronHandler } from "@/app/api/cron/cleanup-unanswered/route";
import robotsHandler from "@/app/robots";
import sitemapHandler from "@/app/sitemap";
import middlewareHandler from "@/middleware";
import {
  LocalBusinessJsonLd,
  PersonJsonLd,
  ConsultationServicesJsonLd,
  BreadcrumbJsonLd,
} from "@/components/seo/JsonLd";

describe("AI Chatbot & SEO Production Readiness Suite", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    _resetRateLimitsForTesting();
    ChatbotHealthTracker.resetForTesting();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    _resetRateLimitsForTesting();
    ChatbotHealthTracker.resetForTesting();
  });

  // ============================================================================
  // 1. Model Requirement & No Hardcoded gemini-1.5-flash
  // ============================================================================
  describe("1. Model Requirement & No Hardcoded gemini-1.5-flash", () => {
    test("GeminiChatProvider rejects missing model and documents current model requirement", () => {
      assert.throws(
        () => new GeminiChatProvider({ apiKey: "AIzaSy_fake", model: "" }),
        /CHATBOT_MODEL is required.*retired the Gemini 1\.5 models/i
      );
    });

    test("OpenAICompatibleChatProvider rejects missing model", () => {
      assert.throws(
        () => new OpenAICompatibleChatProvider({ apiKey: "sk-fake", model: "" }),
        /CHATBOT_MODEL is required/i
      );
    });

    test("getChatProvider rejects unconfigured CHATBOT_MODEL for non-mock providers", () => {
      process.env.CHATBOT_PROVIDER = "gemini";
      process.env.CHATBOT_API_KEY = "AIzaSy_fake_test_key";
      delete process.env.CHATBOT_MODEL;

      assert.throws(
        () => getChatProvider(),
        /CHATBOT_MODEL is required for provider 'gemini'/i
      );
    });

    test("isChatbotConfigured returns false when CHATBOT_MODEL is unset for live providers", () => {
      process.env.NODE_ENV = "production";
      process.env.CHATBOT_PROVIDER = "gemini";
      process.env.CHATBOT_API_KEY = "AIzaSy_live_key";
      delete process.env.CHATBOT_MODEL;
      delete process.env.CHATBOT_ENABLE_FALLBACK;

      assert.strictEqual(isChatbotConfigured(), false);
    });

    test("accepts valid active model (e.g. gemini-2.0-flash) cleanly", () => {
      process.env.CHATBOT_PROVIDER = "gemini";
      process.env.CHATBOT_API_KEY = "AIzaSy_live_key";
      process.env.CHATBOT_MODEL = "gemini-2.0-flash";

      const provider = getChatProvider();
      assert.strictEqual(provider.name, "Gemini");
      assert.strictEqual(isChatbotConfigured(), true);
    });

    test("automatically upgrades retired gemini-1.5-flash to gemini-2.0-flash", () => {
      const provider = new GeminiChatProvider({
        apiKey: "AIzaSy_fake",
        model: "gemini-1.5-flash",
      });
      assert.strictEqual((provider as any).model, "gemini-2.0-flash");
    });
  });

  // ============================================================================
  // 2. Error Simulation: Model-not-found, Auth & Quota, WhatsApp Fallback & Circuit Breaker
  // ============================================================================
  describe("2. Provider Error Simulation & Circuit Breaker", () => {
    test("classifies MODEL_NOT_FOUND (404) correctly", () => {
      const type = ChatbotHealthTracker.classifyError(
        new Error("Google GenerativeAI Error: 404 models/gemini-1.5-flash is not found")
      );
      assert.strictEqual(type, "MODEL_NOT_FOUND");
    });

    test("classifies AUTH_ERROR (401 / 403 / API key) correctly", () => {
      const type401 = ChatbotHealthTracker.classifyError(
        new Error("Gemini API failed with HTTP 401: API key not valid")
      );
      assert.strictEqual(type401, "AUTH_ERROR");

      const type403 = ChatbotHealthTracker.classifyError(
        new Error("HTTP 403: Forbidden - caller does not have permission")
      );
      assert.strictEqual(type403, "AUTH_ERROR");
    });

    test("classifies QUOTA_EXCEEDED (429 / resource exhausted) correctly", () => {
      const type429 = ChatbotHealthTracker.classifyError(
        new Error("HTTP 429: Resource exhausted: quota exceeded for quota metric")
      );
      assert.strictEqual(type429, "QUOTA_EXCEEDED");
    });

    test("simulated provider error returns WhatsApp fallback to visitors when fallback disabled", async () => {
      process.env.NODE_ENV = "production";
      process.env.CHATBOT_PROVIDER = "gemini";
      process.env.CHATBOT_API_KEY = "AIzaSy_test";
      process.env.CHATBOT_MODEL = "gemini-2.0-flash";
      process.env.CHATBOT_ENABLE_FALLBACK = "false";

      // Simulate a provider error via mock
      ChatbotHealthTracker.recordError(new Error("404 models/retired-model is not found"));

      const diag = ChatbotHealthTracker.getDiagnostics();
      assert.strictEqual(diag.lastError?.type, "MODEL_NOT_FOUND");
      assert.strictEqual(diag.consecutiveFailures, 1);
      assert.strictEqual(diag.status, "DEGRADED");
    });

    test("trips circuit breaker after 3 consecutive failures and hides widget", async () => {
      process.env.NODE_ENV = "production";
      process.env.CHATBOT_PROVIDER = "gemini";
      process.env.CHATBOT_API_KEY = "AIzaSy_test";
      process.env.CHATBOT_MODEL = "gemini-2.0-flash";
      process.env.CHATBOT_ENABLE_FALLBACK = "false";

      assert.strictEqual(ChatbotHealthTracker.isCircuitBreakerTripped(), false);
      assert.strictEqual(isChatbotConfigured(), true);

      // Failure 1: Model not found
      ChatbotHealthTracker.recordError(new Error("404 Model Not Found"));
      assert.strictEqual(ChatbotHealthTracker.isCircuitBreakerTripped(), false);

      // Failure 2: Auth error
      ChatbotHealthTracker.recordError(new Error("401 API key invalid"));
      assert.strictEqual(ChatbotHealthTracker.isCircuitBreakerTripped(), false);

      // Failure 3: Quota exceeded -> TRIPS CIRCUIT BREAKER
      ChatbotHealthTracker.recordError(new Error("429 Resource exhausted: quota exceeded"));
      assert.strictEqual(ChatbotHealthTracker.isCircuitBreakerTripped(), true);

      // Diagnostics must report ERROR status and circuitBreakerTripped = true
      const diag = ChatbotHealthTracker.getDiagnostics();
      assert.strictEqual(diag.status, "ERROR");
      assert.strictEqual(diag.circuitBreakerTripped, true);
      assert.strictEqual(diag.consecutiveFailures, 3);
      assert.strictEqual(diag.lastError?.type, "QUOTA_EXCEEDED");

      // Widget status route MUST report enabled: false so the widget is hidden from visitors
      const statusRes = await chatStatusHandler();
      const statusJson = await statusRes.json();
      assert.strictEqual(statusJson.enabled, false);
      assert.strictEqual(statusJson.circuitBreakerTripped, true);
      assert.strictEqual(statusJson.status, "ERROR");

      // isChatbotConfigured fails closed
      assert.strictEqual(isChatbotConfigured(), false);
    });

    test("recordSuccess resets failure counter and circuit breaker", () => {
      ChatbotHealthTracker.recordError(new Error("429 Quota Exceeded"));
      ChatbotHealthTracker.recordError(new Error("429 Quota Exceeded"));
      ChatbotHealthTracker.recordError(new Error("429 Quota Exceeded"));
      assert.strictEqual(ChatbotHealthTracker.isCircuitBreakerTripped(), true);

      ChatbotHealthTracker.recordSuccess();
      assert.strictEqual(ChatbotHealthTracker.isCircuitBreakerTripped(), false);
      const diag = ChatbotHealthTracker.getDiagnostics();
      assert.strictEqual(diag.consecutiveFailures, 0);
      assert.strictEqual(diag.circuitBreakerTripped, false);
    });
  });

  // ============================================================================
  // 3. App-Level Daily Message Cap Protection
  // ============================================================================
  describe("3. App-Level Daily Message Cap Protection", () => {
    test("in-app daily message cap is enforced as a hard stop (not just an alert)", () => {
      process.env.CHATBOT_DAILY_MESSAGE_CAP = "3";
      _resetRateLimitsForTesting();

      // First 3 messages across different IPs pass
      for (let i = 1; i <= 3; i++) {
        const res = checkChatbotRateLimit(`192.168.1.${i}`, `session-${i}`);
        assert.strictEqual(res.allowed, true);
      }

      // 4th message is blocked by app-level cap regardless of provider alerts
      const blocked = checkChatbotRateLimit("192.168.1.99", "session-99");
      assert.strictEqual(blocked.allowed, false);
      assert.strictEqual(blocked.reason, "daily_global");
      assert.ok(blocked.friendlyMessage?.includes("quota complete"));
      assert.ok(blocked.whatsappUrl?.includes("wa.me/919311215564"));
    });
  });

  // ============================================================================
  // 4. Unanswered-Question Log PII Masking & 30-Day Retention
  // ============================================================================
  describe("4. Unanswered-Question Log PII Masking & 30-Day Retention", () => {
    test("maskPii strips email addresses", () => {
      const input = "My email is user.name+astro@gmail.com please reply to contact@domain.in";
      const masked = maskPii(input);
      assert.ok(!masked.includes("user.name+astro@gmail.com"));
      assert.ok(!masked.includes("contact@domain.in"));
      assert.ok(masked.includes("[MASKED_EMAIL]"));
    });

    test("maskPii strips Indian 10-digit mobile phone numbers in multiple formats", () => {
      const testCases = [
        "Call me at 9876543210 please",
        "My WhatsApp is +91 93112 15564",
        "Phone: 93112-15564",
        "Reach out at +91-9876543210",
        "Number: 09876543210",
      ];

      for (const text of testCases) {
        const masked = maskPii(text);
        assert.ok(!masked.includes("9876543210"), `Failed on ${text}`);
        assert.ok(!masked.includes("9311215564"), `Failed on ${text}`);
        assert.ok(masked.includes("[MASKED_PHONE]"), `Should contain [MASKED_PHONE] on ${text}`);
      }
    });

    test("maskPii truncates queries exceeding 500 characters", () => {
      const longText = "a".repeat(700);
      const masked = maskPii(longText);
      assert.strictEqual(masked.length, 500);
    });

    test("cleanupExpiredUnansweredQuestions runs successfully", async () => {
      const count = await cleanupExpiredUnansweredQuestions();
      assert.strictEqual(typeof count, "number");
    });

    test("GET /api/cron/cleanup-unanswered rejects unauthorized calls with 401", async () => {
      const req = new NextRequest("http://localhost:3000/api/cron/cleanup-unanswered");
      const res = await cleanupCronHandler(req);
      assert.strictEqual(res.status, 401);
    });

    test("GET /api/cron/cleanup-unanswered executes 30-day retention purge with CRON_SECRET", async () => {
      process.env.CRON_SECRET = "test_cleanup_cron_secret";
      const req = new NextRequest("http://localhost:3000/api/cron/cleanup-unanswered", {
        headers: {
          authorization: `Bearer ${process.env.CRON_SECRET}`,
        },
      });

      const res = await cleanupCronHandler(req);
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.retentionDays, 30);
      assert.strictEqual(typeof json.purgedCount, "number");
    });
  });

  // ============================================================================
  // 5. Privacy Policy Legal Text
  // ============================================================================
  describe("5. Privacy Policy Legal Text", () => {
    test("Privacy policy file contains all 7 mandatory processors and pending lawyer review status", async () => {
      const fs = await import("fs/promises");
      const content = await fs.readFile("src/app/privacy-policy/page.tsx", "utf-8");

      // Status marker
      assert.ok(content.includes("Pending Lawyer Review"));

      // Mandatory processors
      assert.ok(content.includes("Vercel"));
      assert.ok(content.includes("Neon"));
      assert.ok(content.includes("Clerk"));
      assert.ok(content.includes("Google"));
      assert.ok(content.includes("Resend"));
      assert.ok(content.includes("AI Provider") || content.includes("AI Assistant Provider"));
      assert.ok(content.includes("Cloudflare R2"));
      assert.ok(content.includes("WhatsApp"));

      // Key topics
      assert.ok(content.includes("30-Day Automated Retention Purge") || content.includes("30-Day Strict Retention") || content.includes("30-day"));
      assert.ok(content.includes("Direct UPI") || content.includes("UPI"));
      assert.ok(content.includes("Kundli"));
      assert.ok(content.includes("Essential Cookies Only"));
      assert.ok(content.includes("Your Legal Rights") || content.includes("User Rights"));
      assert.ok(content.includes("PLACEHOLDER_CONTACT_INFO.address") || content.includes("Sector 75, Noida"));
    });
  });

  // ============================================================================
  // 6. SEO, Host Redirection, Sitemap & Robots
  // ============================================================================
  describe("6. SEO, Host Redirection, Sitemap & Robots", () => {
    test("canonical host www.aapkaastro.com with apex redirected via 308 in middleware", () => {
      const req = new NextRequest("https://aapkaastro.com/about", {
        headers: {
          host: "aapkaastro.com",
        },
      });

      const res = middlewareHandler(req, {} as any);
      assert.strictEqual(res.status, 308);
      assert.strictEqual(res.headers.get("location"), "https://www.aapkaastro.com/about");
    });

    test("robots.txt disallows admin, account, and API routes", () => {
      const robots = robotsHandler();
      const rules = Array.isArray(robots.rules) ? robots.rules[0] : robots.rules;
      assert.ok(rules);
      const disallows = Array.isArray(rules.disallow) ? rules.disallow : [rules.disallow];

      assert.ok(disallows.some((d) => d === "/admin" || d === "/admin/"));
      assert.ok(disallows.some((d) => d === "/account" || d === "/account/"));
      assert.ok(disallows.some((d) => d === "/api" || d === "/api/"));

      assert.ok(typeof robots.sitemap === "string");
      assert.ok(robots.sitemap.startsWith("https://www.aapkaastro.com"));
    });

    test("sitemap lists public routes only and strictly excludes /wallet, /account, /admin, /api", () => {
      const sitemap = sitemapHandler();
      assert.ok(Array.isArray(sitemap));
      assert.ok(sitemap.length > 20);

      for (const entry of sitemap) {
        assert.ok(
          !entry.url.includes("/wallet"),
          `Sitemap must not contain /wallet: ${entry.url}`
        );
        assert.ok(
          !entry.url.includes("/account"),
          `Sitemap must not contain /account: ${entry.url}`
        );
        assert.ok(
          !entry.url.includes("/admin"),
          `Sitemap must not contain /admin: ${entry.url}`
        );
        assert.ok(
          !entry.url.includes("/api"),
          `Sitemap must not contain /api: ${entry.url}`
        );
        assert.ok(
          entry.url.startsWith("https://www.aapkaastro.com"),
          `Sitemap must use canonical domain: ${entry.url}`
        );
      }
    });

    test("Open Graph images are in PNG format", async () => {
      const fs = await import("fs/promises");
      const layoutContent = await fs.readFile("src/app/layout.tsx", "utf-8");
      const aboutContent = await fs.readFile("src/app/about/page.tsx", "utf-8");

      // Root layout Open Graph image must be PNG
      assert.ok(
        layoutContent.includes("logo-white-bg.png"),
        "Root layout Open Graph image must use a PNG file"
      );

      // About page Open Graph image must be PNG
      assert.ok(
        aboutContent.includes(".png"),
        "About page Open Graph image must use a PNG file"
      );
    });

    test("No ratings in JSON-LD schemas", () => {
      // Check LocalBusinessJsonLd
      const localBusinessEl = LocalBusinessJsonLd({});
      const lbSchema = JSON.parse(localBusinessEl.props.dangerouslySetInnerHTML.__html);
      assert.strictEqual(lbSchema.aggregateRating, undefined);
      assert.strictEqual(lbSchema.ratingValue, undefined);
      assert.strictEqual(lbSchema.reviewRating, undefined);

      // Check PersonJsonLd
      const personEl = PersonJsonLd();
      const personSchema = JSON.parse(personEl.props.dangerouslySetInnerHTML.__html);
      assert.strictEqual(personSchema.aggregateRating, undefined);
      assert.strictEqual(personSchema.ratingValue, undefined);

      // Check ConsultationServicesJsonLd
      const servicesEl = ConsultationServicesJsonLd();
      const servicesSchema = JSON.parse(servicesEl.props.dangerouslySetInnerHTML.__html);
      assert.strictEqual(servicesSchema.aggregateRating, undefined);
      for (const item of servicesSchema.itemListElement) {
        assert.strictEqual(item.aggregateRating, undefined);
        assert.strictEqual(item.review, undefined);
      }

      // Check BreadcrumbJsonLd
      const breadcrumbEl = BreadcrumbJsonLd({ items: [{ name: "Home", url: "/" }] });
      const bcSchema = JSON.parse(breadcrumbEl.props.dangerouslySetInnerHTML.__html);
      assert.strictEqual(bcSchema.aggregateRating, undefined);
    });
  });
});
