import { test, describe } from "node:test";
import assert from "node:assert";
import { NextRequest } from "next/server";
import {
  detectLanguage,
  queryKnowledgeBase,
} from "../src/lib/assistant/queryEngine";
import { POST as assistantChatPost } from "../src/app/api/assistant/chat/route";
import { ASSISTANT_KNOWLEDGE } from "../src/lib/assistant/knowledgeBase";

describe("Floating AI Assistant — Grounded Knowledge & Multilingual Engine Suite", () => {
  // --------------------------------------------------------------------------
  // 1. Language Detection
  // --------------------------------------------------------------------------
  describe("1. Language Detection (English, Hindi, Hinglish)", () => {
    test("detects Devanagari Hindi accurately", () => {
      assert.strictEqual(detectLanguage("परामर्श का शुल्क कितना है?"), "hi");
      assert.strictEqual(detectLanguage("नमस्ते आचार्य जी"), "hi");
      assert.strictEqual(detectLanguage("वास्तु दोष निवारण कैसे होगा?"), "hi");
    });

    test("detects Hinglish conversational transliteration accurately", () => {
      assert.strictEqual(detectLanguage("fees kitna hai consultation ka?"), "hinglish");
      assert.strictEqual(detectLanguage("kaise book kare appointment"), "hinglish");
      assert.strictEqual(detectLanguage("kya mujhe refund milega agar call miss ho jaye"), "hinglish");
      assert.strictEqual(detectLanguage("meri shadi kab hogi please batao"), "hinglish");
    });

    test("detects English accurately", () => {
      assert.strictEqual(detectLanguage("What is the consultation fee?"), "en");
      assert.strictEqual(detectLanguage("Who is Acharya Niraj Kumar?"), "en");
      assert.strictEqual(detectLanguage("Do you offer zero-demolition Vastu?"), "en");
    });
  });

  // --------------------------------------------------------------------------
  // 2. Grounded Pricing & Anti-Hallucination
  // --------------------------------------------------------------------------
  describe("2. Grounded Pricing & Zero-Hallucination Policies", () => {
    test("accurately answers pricing in English with ₹1,051 and ₹15,000", () => {
      const res = queryKnowledgeBase("What are the consultation fees?");
      assert.strictEqual(res.intent, "pricing");
      assert.ok(res.answer.includes("1,051"), "Must cite flat ₹1,051 for Astro Consultation");
      assert.ok(res.answer.includes("15,000"), "Must cite flat ₹15,000 for Vaastu Consultation");
      assert.ok(res.answer.includes("2,100"), "Must cite regular fee ₹2,100");
      assert.ok(res.answer.includes("50%"), "Must cite 50% discount");
      assert.ok(res.actions.some((a) => a.url.includes("FIRST1051")));
    });

    test("accurately answers pricing in Hindi with ₹1,051 and ₹15,000", () => {
      const res = queryKnowledgeBase("परामर्श की फीस कितनी है?");
      assert.strictEqual(res.language, "hi");
      assert.strictEqual(res.intent, "pricing");
      assert.ok(res.answer.includes("₹1,051"));
      assert.ok(res.answer.includes("₹15,000"));
      assert.ok(res.answer.includes("50%"));
    });

    test("accurately answers pricing in Hinglish", () => {
      const res = queryKnowledgeBase("consultation charges kitna hai?");
      assert.strictEqual(res.language, "hinglish");
      assert.strictEqual(res.intent, "pricing");
      assert.ok(res.answer.includes("1,051"));
      assert.ok(res.answer.includes("15,000"));
    });

    test("strictly denies free consultation while pointing out free online tools", () => {
      const res = queryKnowledgeBase("Can I get a free consultation with the astrologer?");
      assert.ok(
        res.answer.toLowerCase().includes("not free") || res.answer.toLowerCase().includes("1,051"),
        "Must clarify that 1-on-1 consultations are paid"
      );
      assert.ok(
        res.answer.includes("1,051"),
        "Must offer the 50% off ₹1,051 welcome fee"
      );
    });

    test("strictly confirms zero-wallet policy on wallet inquiry", () => {
      const res = queryKnowledgeBase("How do I add money to my wallet balance?");
      assert.strictEqual(res.intent, "payment_methods");
      assert.ok(
        res.answer.toLowerCase().includes("not use a wallet") ||
        res.answer.toLowerCase().includes("no wallet"),
        "Must strictly state there is no wallet balance system"
      );
    });
  });

  // --------------------------------------------------------------------------
  // 3. Acharya Niraj Kumar Credentials
  // --------------------------------------------------------------------------
  describe("3. Acharya Niraj Kumar Credentials Verification", () => {
    test("returns verified credentials, 20+ years experience, and Baidyanath Dham lineage", () => {
      const res = queryKnowledgeBase("Who is Acharya Niraj Kumar and what are his qualifications?");
      assert.strictEqual(res.intent, "acharya_credentials");
      assert.ok(res.answer.includes("20 years") || res.answer.includes("20+"));
      assert.ok(res.answer.includes("15,000+"));
      assert.ok(res.answer.includes("Baidyanath Dham"));
      assert.ok(res.answer.includes("Bhartiya Vidya Bhawan") || res.answer.includes("Bharatiya Vidya Bhawan"));
      assert.ok(res.answer.includes("Reliance Retail"));
    });
  });

  // --------------------------------------------------------------------------
  // 4. Contact Details & Handoff Escalation
  // --------------------------------------------------------------------------
  describe("4. Contact Information & Handoff Escalation", () => {
    test("returns official contact numbers, WhatsApp, and sanctum address in Noida", () => {
      const res = queryKnowledgeBase("What is your office address and contact number?");
      assert.strictEqual(res.intent, "contact_info");
      assert.ok(res.answer.includes("93112 15564") || res.answer.includes("931-121-5564"));
      assert.ok(res.answer.includes("Spectrum@Metro") || res.answer.includes("Sector 75, Noida"));
      assert.ok(res.actions.some((a) => a.type === "whatsapp" && a.url.includes("919311215564")));
    });

    test("safely escalates personal future predictions to 1-on-1 booking & WhatsApp instead of guessing", () => {
      const res = queryKnowledgeBase("meri shadi kab hogi please batao?");
      assert.strictEqual(res.intent, "personal_prediction_handoff");
      assert.ok(res.actions.some((a) => a.url.includes("/consult")));
      assert.ok(res.actions.some((a) => a.type === "whatsapp"));
    });

    test("returns safe fallback when topic is completely out-of-scope", () => {
      const res = queryKnowledgeBase("how do I assemble a quantum nuclear reactor?");
      assert.strictEqual(res.intent, "fallback_safe");
      assert.strictEqual(res.confidence, "fallback");
      assert.ok(
        res.answer.includes("do not have verified information") ||
        res.answer.includes("verified data")
      );
      assert.ok(res.actions.some((a) => a.type === "whatsapp"));
    });
  });

  // --------------------------------------------------------------------------
  // 5. API Route Endpoint Integration (/api/assistant/chat)
  // --------------------------------------------------------------------------
  describe("5. Assistant Chat API Endpoint (/api/assistant/chat)", () => {
    test("POST /api/assistant/chat responds with grounded answer and actions", async () => {
      const req = new NextRequest("http://localhost:3000/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "What is the fee for an Astro consultation?" }),
      });

      const res = await assistantChatPost(req);
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.ok(json.answer.includes("1,051"));
      assert.ok(Array.isArray(json.actions));
      assert.ok(json.actions.length > 0);
    });

    test("POST /api/assistant/chat rejects empty queries with HTTP 400", async () => {
      const req = new NextRequest("http://localhost:3000/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "   " }),
      });

      const res = await assistantChatPost(req);
      assert.strictEqual(res.status, 400);
      const json = await res.json();
      assert.strictEqual(json.success, false);
    });
  });
});
