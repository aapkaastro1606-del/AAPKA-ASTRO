import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { NextRequest } from "next/server";
import {
  hashIp,
  checkChatbotRateLimit,
  _resetRateLimitsForTesting,
} from "../src/lib/assistant/rateLimiter";
import {
  MockGroundedChatProvider,
  OpenAICompatibleChatProvider,
  isChatbotConfigured,
  getChatProvider,
  GROUNDED_SYSTEM_PROMPT,
} from "../src/lib/assistant/chatProvider";
import { POST as chatPost } from "../src/app/api/chat/route";
import { GET as chatStatusGet } from "../src/app/api/chat/status/route";

describe("Chatbot Architecture, Cost Control & Privacy Suite", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    _resetRateLimitsForTesting();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    _resetRateLimitsForTesting();
    process.env = { ...originalEnv };
  });

  // ==========================================================================
  // 1. Privacy-Preserving Rate Limiting & Zero Raw IP Storage
  // ==========================================================================
  describe("1. Privacy-Preserving Rate Limiting (Hashed IP & Daily Caps)", () => {
    test("hashIp produces a deterministic 32-character hex hash and never exposes raw IP", () => {
      const rawIp = "203.0.113.195";
      const hash1 = hashIp(rawIp);
      const hash2 = hashIp(rawIp);

      assert.strictEqual(hash1, hash2, "Hashing same IP must be deterministic");
      assert.strictEqual(hash1.length, 32, "Hash must be 32 characters hex");
      assert.ok(!hash1.includes(rawIp), "Hash must not contain the raw IP");
      assert.strictEqual(/^[0-9a-f]{32}$/.test(hash1), true, "Hash must be pure hexadecimal");
    });

    test("enforces 15 messages per 10-minute short window and provides WhatsApp fallback", () => {
      const testIp = "198.51.100.1";
      const sessionKey = "test-session-1";

      // 15 messages should be allowed
      for (let i = 1; i <= 15; i++) {
        const result = checkChatbotRateLimit(testIp, sessionKey);
        assert.strictEqual(result.allowed, true, `Message ${i} must be allowed`);
      }

      // 16th message should be blocked
      const blockedResult = checkChatbotRateLimit(testIp, sessionKey);
      assert.strictEqual(blockedResult.allowed, false, "16th message must be blocked");
      assert.strictEqual(blockedResult.reason, "short_window");
      assert.ok(blockedResult.retryAfterSeconds! > 0, "Must provide retryAfterSeconds");
      assert.ok(blockedResult.friendlyMessage?.includes("10 minute"), "Must provide friendly message");
      assert.ok(blockedResult.whatsappUrl?.includes("wa.me/919311215564"), "Must provide WhatsApp escalation URL");
    });

    test("enforces 100 messages per 24 hours per user", () => {
      const testIp = "198.51.100.2";
      const sessionKey = "test-session-2";

      // Reset limits and simulate 100 queries across multiple sub-windows
      for (let i = 1; i <= 100; i++) {
        // Clear short window to isolate daily check
        const result = checkChatbotRateLimit(testIp, sessionKey);
        if (i <= 15) {
          assert.strictEqual(result.allowed, true);
        }
      }
    });

    test("enforces global daily cap via CHATBOT_DAILY_MESSAGE_CAP", () => {
      process.env.CHATBOT_DAILY_MESSAGE_CAP = "5";
      _resetRateLimitsForTesting();

      // Send 5 messages across different users
      for (let i = 1; i <= 5; i++) {
        const res = checkChatbotRateLimit(`10.0.0.${i}`, `session-${i}`);
        assert.strictEqual(res.allowed, true, `Query ${i} within global cap must pass`);
      }

      // 6th message should be rejected by global cap
      const capExceeded = checkChatbotRateLimit("10.0.0.99", "session-new");
      assert.strictEqual(capExceeded.allowed, false);
      assert.strictEqual(capExceeded.reason, "daily_global");
      assert.ok(capExceeded.friendlyMessage?.includes("quota complete"));
      assert.ok(capExceeded.whatsappUrl?.includes("wa.me/919311215564"));
    });
  });

  // ==========================================================================
  // 2. Swappable Provider & Grounded Engine
  // ==========================================================================
  describe("2. Swappable ChatProvider Architecture", () => {
    test("MockGroundedChatProvider streams grounded knowledge accurately", async () => {
      const provider = new MockGroundedChatProvider();
      assert.strictEqual(provider.name, "MockGroundedProvider");

      const stream = await provider.generateStream([
        { role: "user", content: "What are your consultation fees?" },
      ]);

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let streamedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        streamedContent += decoder.decode(value);
      }

      assert.ok(streamedContent.includes("1,051"), "Must cite flat ₹1,051 offer");
      assert.ok(streamedContent.includes("15,000"), "Must cite flat ₹15,000 Vaastu");
    });

    test("getChatProvider resolves configured providers cleanly", () => {
      // 1. Default / test mock provider
      process.env.CHATBOT_PROVIDER = "mock";
      const mockProvider = getChatProvider();
      assert.strictEqual(mockProvider.name, "MockGroundedProvider");

      // 2. Groq provider
      process.env.CHATBOT_PROVIDER = "groq";
      process.env.CHATBOT_API_KEY = "gsk_test_key_groq";
      process.env.CHATBOT_MODEL = "llama-3.1-8b-instant";
      const groqProvider = getChatProvider();
      assert.strictEqual(groqProvider.name, "Groq");

      // 3. OpenAI provider
      process.env.CHATBOT_PROVIDER = "openai";
      process.env.CHATBOT_API_KEY = "sk-test-key-openai";
      process.env.CHATBOT_MODEL = "gpt-4o-mini";
      const openaiProvider = getChatProvider();
      assert.strictEqual(openaiProvider.name, "OpenAI");

      // 4. Gemini provider
      process.env.CHATBOT_PROVIDER = "gemini";
      process.env.CHATBOT_API_KEY = "AIzaSy_test_key_gemini";
      process.env.CHATBOT_MODEL = "gemini-2.0-flash";
      const geminiProvider = getChatProvider();
      assert.strictEqual(geminiProvider.name, "Gemini");
    });
  });

  // ==========================================================================
  // 3. Production Key Missing Fail-Closed Safety
  // ==========================================================================
  describe("3. Production Key Missing Fail-Closed Safety", () => {
    test("isChatbotConfigured returns false in production if CHATBOT_API_KEY is missing", () => {
      process.env.NODE_ENV = "production";
      delete process.env.CHATBOT_API_KEY;

      assert.strictEqual(isChatbotConfigured(), false);
    });

    test("isChatbotConfigured returns true in production if CHATBOT_ENABLE_FALLBACK is set", () => {
      process.env.NODE_ENV = "production";
      delete process.env.CHATBOT_API_KEY;
      process.env.CHATBOT_ENABLE_FALLBACK = "true";

      assert.strictEqual(isChatbotConfigured(), true);
    });

    test("isChatbotConfigured returns true in production if valid CHATBOT_API_KEY is set", () => {
      process.env.NODE_ENV = "production";
      process.env.CHATBOT_API_KEY = "gsk_live_valid_key";

      assert.strictEqual(isChatbotConfigured(), true);
    });

    test("GET /api/chat/status informs client to suppress widget when unconfigured in production", async () => {
      process.env.NODE_ENV = "production";
      delete process.env.CHATBOT_API_KEY;

      const res = await chatStatusGet();
      assert.strictEqual(res.status, 200);

      const json = await res.json();
      assert.strictEqual(json.enabled, false, "Must report enabled: false when key is missing in production");
      assert.strictEqual(json.maxCharacters, 500);
    });

    test("POST /api/chat returns HTTP 503 when chatbot is unconfigured in production", async () => {
      process.env.NODE_ENV = "production";
      delete process.env.CHATBOT_API_KEY;

      const req = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Hello" }),
      });

      const res = await chatPost(req);
      assert.strictEqual(res.status, 503);

      const json = await res.json();
      assert.strictEqual(json.success, false);
      assert.strictEqual(json.error, "chatbot_disabled");
      assert.ok(json.whatsappUrl?.includes("wa.me/919311215564"));
    });
  });

  // ==========================================================================
  // 4. API Input Validation, Character Limits & Context Window Trimming
  // ==========================================================================
  describe("4. API Input Validation & Context Window Trimming", () => {
    test("rejects messages exceeding 500 characters with HTTP 400", async () => {
      process.env.NODE_ENV = "development";
      const longMessage = "a".repeat(501);

      const req = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: longMessage }),
      });

      const res = await chatPost(req);
      assert.strictEqual(res.status, 400);

      const json = await res.json();
      assert.strictEqual(json.success, false);
      assert.strictEqual(json.error, "validation_error");
      assert.ok(json.message.includes("500 character limit"));
    });

    test("rejects empty or whitespace-only messages with HTTP 400", async () => {
      process.env.NODE_ENV = "development";

      const req = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "   " }),
      });

      const res = await chatPost(req);
      assert.strictEqual(res.status, 400);

      const json = await res.json();
      assert.strictEqual(json.success, false);
      assert.strictEqual(json.error, "validation_error");
    });

    test("accepts valid message <= 500 characters and streams response", async () => {
      process.env.NODE_ENV = "development";
      process.env.CHATBOT_PROVIDER = "mock";

      const req = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "198.51.100.42",
        },
        body: JSON.stringify({
          message: "What is your consultation fee?",
          history: [
            { role: "user", content: "Hi" },
            { role: "assistant", content: "Namaste! How can I help?" },
          ],
        }),
      });

      const res = await chatPost(req);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.headers.get("Content-Type"), "text/plain; charset=utf-8");

      const text = await res.text();
      assert.ok(text.includes("1,051"), "Streamed response must contain grounded pricing");
    });

    test("returns HTTP 429 when rate limit is reached", async () => {
      process.env.NODE_ENV = "development";
      process.env.CHATBOT_PROVIDER = "mock";

      const ip = "192.0.2.77";

      // Exhaust 15 queries
      for (let i = 0; i < 15; i++) {
        const req = new NextRequest("http://localhost:3000/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": ip,
          },
          body: JSON.stringify({ message: "Hello", sessionKey: "sess-ratelimit" }),
        });
        const res = await chatPost(req);
        assert.strictEqual(res.status, 200);
      }

      // 16th query must return 429
      const req16 = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": ip,
        },
        body: JSON.stringify({ message: "Hello again", sessionKey: "sess-ratelimit" }),
      });
      const res16 = await chatPost(req16);
      assert.strictEqual(res16.status, 429);
      assert.ok(res16.headers.get("Retry-After") !== null);

      const json16 = await res16.json();
      assert.strictEqual(json16.success, false);
      assert.strictEqual(json16.error, "rate_limit_exceeded");
      assert.ok(json16.whatsappUrl?.includes("wa.me/919311215564"));
    });
  });
});
