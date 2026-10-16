import { ASSISTANT_KNOWLEDGE } from "./knowledgeBase";
import { queryKnowledgeBase } from "./queryEngine";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatProviderOptions {
  maxTokens?: number;
  timeoutMs?: number;
}

export interface ChatProvider {
  name: string;
  generateStream(
    messages: ChatMessage[],
    options?: ChatProviderOptions
  ): Promise<ReadableStream<Uint8Array>>;
}

/**
 * Authoritative Grounded System Prompt
 * Strictly binds the model to verified site content with anti-hallucination rules.
 */
export const GROUNDED_SYSTEM_PROMPT = `You are the official Vedic AI Assistant for "Aapka Astro" (led by Acharya Niraj Kumar).
Your job is to answer visitors' questions accurately, respectfully, and succinctly in the visitor's chosen language (English, Hindi, or conversational Hinglish).

CRITICAL GROUNDING RULES:
1. ACCURACY FIRST: A confident wrong answer about prices or policies is worse than saying "I don't know".
2. PRICING & OFFERS (NON-NEGOTIABLE FACTS):
   - Vedic Astro Consultation (1-on-1 with Acharya Niraj Kumar): Flat ₹1,051/- for first consultation (50% Off regular ₹2,100 with code FIRST1051). Formats: Voice Call, Video Call, Live Chat via WhatsApp or Google Meet.
   - Devta Vaastu Consultation: Flat ₹15,000/- (Save ₹10,000 off regular ₹25,000). Zero-demolition 16-zone energy audit.
   - Full Kundli PDF Report: Flat ₹501/- one-time download.
   - Certified Vedic Gemstones: 100% natural, lab-certified with individualized Prana Pratishtha.
   - Free Online Tools: Janam Kundli generation (/kundli-generator), Kundli Milan / 36 Guna Matching (/kundli-matching), Daily Panchang (/panchang), Daily Horoscope (/horoscope), Moon sign and Numerology calculators.
   - NO FREE 1-ON-1 SESSIONS: 1-on-1 consultations are paid sessions (with 50% discount at ₹1,051). Never claim sessions are free.
   - ZERO WALLET COINS / RECHARGE: Aapka Astro operates on transparent flat pay-per-booking with direct UPI. We DO NOT have a wallet recharge or coin balance system.
3. ACHARYA NIRAJ KUMAR'S CREDENTIALS:
   - 20+ years of classical mastery, 15,000+ chart consultations.
   - Rooted in Baidyanath Dham (Deoghar); discipleship under Late Guru Shri B. B. Tiwari.
   - Jyotish Acharya from Bharatiya Vidya Bhawan (K.N. Rao Institute), M.A. in Jyotish from IGNOU (2024), Nadi Parveen from ICAS, certified Logical Vastu Expert from DivyVastu.
   - Former Vice President & Business Head at Reliance Retail and Metro Cash & Carry.
4. PAYMENT METHOD:
   - Direct UPI to 9311215564@okbizaxis (Payee: Aapka Astro) via Google Pay, PhonePe, Paytm, BHIM, or instant QR code.
5. REFUND & CANCELLATION:
   - 100% refund within 2-3 business days if Acharya Ji misses the scheduled session.
   - Free rescheduling with 2 hours prior notice. No refunds after session completion.
6. CONTACT & SANCTUM:
   - WhatsApp & Phone: +91 93112 15564 (https://wa.me/919311215564)
   - Email: aapkaastro1606@gmail.com
   - Office: Spectrum@Metro Phase 1, Sector 75, Noida, U.P. 201301.
   - Hours: Monday – Sunday: 7:00 AM – 11:00 PM IST.
7. OUT-OF-SCOPE OR PERSONAL CHART PREDICTIONS:
   - If asked for personal future predictions ("Meri shadi kab hogi?", "Will I get this job?"), politely explain that authentic Vedic Jyotish requires exact birth time/place calculation with Acharya Ji. Do not fabricate predictions. Offer booking at /consult or direct WhatsApp chat (+91 93112 15564).
8. If asked anything completely outside the website's scope, say you do not have verified information and direct them to WhatsApp support. Keep answers under 150 words.`;

/**
 * OpenAI / Groq Compatible Streaming Provider
 * Works seamlessly with Groq (llama-3.1-8b-instant), OpenAI (gpt-4o-mini), DeepSeek, etc.
 * Uses paid API tier with training on customer data disabled.
 */
export class OpenAICompatibleChatProvider implements ChatProvider {
  name: string;
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(config: {
    name?: string;
    apiKey: string;
    model?: string;
    baseUrl?: string;
  }) {
    this.name = config.name || "OpenAICompatible";
    this.apiKey = config.apiKey;
    this.model = config.model || "gpt-4o-mini";
    this.baseUrl = (config.baseUrl || "https://api.openai.com/v1").replace(/\/+$/, "");
  }

  async generateStream(
    messages: ChatMessage[],
    options?: ChatProviderOptions
  ): Promise<ReadableStream<Uint8Array>> {
    const maxTokens = options?.maxTokens || 400;
    const timeoutMs = options?.timeoutMs || 15000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          max_tokens: maxTokens,
          temperature: 0.3, // Low temperature for high factual precision
          stream: true,
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(
          `Provider ${this.name} failed with HTTP ${response.status}: ${errorText.slice(0, 150)}`
        );
      }

      const bodyStream = response.body;
      if (!bodyStream) {
        throw new Error(`Provider ${this.name} returned empty response body`);
      }

      const reader = bodyStream.getReader();
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      return new ReadableStream<Uint8Array>({
        async pull(streamController) {
          try {
            const { done, value } = await reader.read();
            if (done) {
              streamController.close();
              return;
            }

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith("data: ")) continue;
              const dataPayload = trimmed.replace(/^data: /, "").trim();

              if (dataPayload === "[DONE]") {
                streamController.close();
                return;
              }

              try {
                const parsed = JSON.parse(dataPayload);
                const token = parsed.choices?.[0]?.delta?.content;
                if (token) {
                  streamController.enqueue(encoder.encode(token));
                }
              } catch {
                // Incomplete JSON chunk in buffer, ignore
              }
            }
          } catch (err) {
            streamController.error(err);
          }
        },
      });
    } catch (err: any) {
      clearTimeout(timer);
      throw err;
    }
  }
}

/**
 * Mock / Local Grounded Chat Provider
 * Uses the deterministic queryEngine so local development and test runs operate at $0 cost
 * with zero latency and 100% factual accuracy.
 */
export class MockGroundedChatProvider implements ChatProvider {
  name = "MockGroundedProvider";

  async generateStream(
    messages: ChatMessage[],
    _options?: ChatProviderOptions
  ): Promise<ReadableStream<Uint8Array>> {
    const lastUserMessage =
      [...messages].reverse().find((m) => m.role === "user")?.content || "";

    const result = queryKnowledgeBase(lastUserMessage);
    const encoder = new TextEncoder();
    const words = result.answer.split(" ");

    return new ReadableStream<Uint8Array>({
      async start(controller) {
        for (let i = 0; i < words.length; i++) {
          const piece = i === 0 ? words[i] : ` ${words[i]}`;
          controller.enqueue(encoder.encode(piece));
        }
        controller.close();
      },
    });
  }
}

/**
 * Checks if chatbot is validly configured.
 * In production: If CHATBOT_API_KEY is missing, logs a clear warning and returns false.
 * In test/dev: allows mock provider so developers and CI tests succeed without paid keys.
 */
export function isChatbotConfigured(): boolean {
  const isProd = process.env.NODE_ENV === "production";
  const apiKey = process.env.CHATBOT_API_KEY;

  if (!apiKey || apiKey.trim() === "" || apiKey === "change_in_production") {
    if (isProd) {
      console.warn(
        "[Chatbot Disabled] CHATBOT_API_KEY is missing in production environment. Hiding assistant widget to prevent broken user experience."
      );
      return false;
    }
    // In dev or test, we fall back cleanly to MockGroundedProvider
    return true;
  }

  return true;
}

/**
 * Resolves the configured ChatProvider instance.
 */
export function getChatProvider(): ChatProvider {
  const apiKey = process.env.CHATBOT_API_KEY;
  const providerType = (process.env.CHATBOT_PROVIDER || "mock").toLowerCase();
  const model = process.env.CHATBOT_MODEL;

  if (!apiKey || apiKey === "change_in_production" || providerType === "mock") {
    return new MockGroundedChatProvider();
  }

  if (providerType === "groq") {
    return new OpenAICompatibleChatProvider({
      name: "Groq",
      apiKey,
      model: model || "llama-3.1-8b-instant",
      baseUrl: "https://api.groq.com/openai/v1",
    });
  }

  if (providerType === "openai") {
    return new OpenAICompatibleChatProvider({
      name: "OpenAI",
      apiKey,
      model: model || "gpt-4o-mini",
      baseUrl: "https://api.openai.com/v1",
    });
  }

  // Fallback to OpenAI-compatible with custom base URL if configured
  return new OpenAICompatibleChatProvider({
    name: providerType,
    apiKey,
    model: model || "gpt-4o-mini",
    baseUrl: process.env.CHATBOT_BASE_URL || "https://api.openai.com/v1",
  });
}
