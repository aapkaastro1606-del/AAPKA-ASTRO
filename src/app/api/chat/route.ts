import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getChatProvider,
  isChatbotConfigured,
  buildGroundedSystemPrompt,
  ChatMessage,
} from "@/lib/assistant/chatProvider";
import { checkChatbotRateLimit } from "@/lib/assistant/rateLimiter";
import {
  fetchLiveSiteData,
  formatLiveSiteDataSnippet,
} from "@/lib/assistant/liveDataReader";
import {
  retrieveRelevantKnowledge,
  logUnansweredQuestion,
} from "@/lib/assistant/retriever";


export const dynamic = "force-dynamic";

const ChatRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(500, "Message exceeds the 500 character limit"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(1000),
      })
    )
    .optional(),
  sessionKey: z.string().max(64).optional(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Missing Key Check in Production
    if (!isChatbotConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: "chatbot_disabled",
          message:
            "Assistant service is currently disabled. Please connect directly with Acharya Niraj Kumar on WhatsApp at +91 93112 15564.",
          whatsappUrl: "https://wa.me/919311215564",
        },
        { status: 503 }
      );
    }

    // 2. Extract Client IP & Check Privacy-Preserving Rate Limits (Hashed IP)
    const rawIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const body = await req.json();
    const parsed = ChatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "validation_error",
          message: parsed.error.issues[0]?.message || "Invalid message format.",
        },
        { status: 400 }
      );
    }

    const { message, history = [], sessionKey } = parsed.data;

    const rateLimit = checkChatbotRateLimit(rawIp, sessionKey);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "rate_limit_exceeded",
          reason: rateLimit.reason,
          retryAfter: rateLimit.retryAfterSeconds,
          message: rateLimit.friendlyMessage,
          whatsappUrl: rateLimit.whatsappUrl,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds || 60),
          },
        }
      );
    }

    // 3. Dynamic Knowledge Retrieval & Live Site Data (Single Source of Truth)
    const [liveData, retrieved] = await Promise.all([
      fetchLiveSiteData(),
      retrieveRelevantKnowledge(message),
    ]);

    // Log low-confidence or unanswered queries (anonymized & masked, kept 30 days)
    if (!retrieved.isConfident) {
      logUnansweredQuestion(message).catch((err) =>
        console.error("[UnansweredQuestion Log Background Error]", err)
      );
    }

    const liveDataSnippet = formatLiveSiteDataSnippet(liveData);
    const dynamicSystemPrompt = buildGroundedSystemPrompt({
      liveDataSnippet,
      retrievedSections: retrieved.sections,
    });

    // 4. Assemble Context (Limit to strictly the last 8 messages)
    const trimmedHistory = history.slice(-8);

    const fullMessages: ChatMessage[] = [
      { role: "system", content: dynamicSystemPrompt },
      ...trimmedHistory.map((h) => ({
        role: h.role as "user" | "assistant",
        content: h.content,
      })),
      { role: "user", content: message },
    ];

    // 5. Invoke Swappable Provider with 400 max tokens & 15s function timeout
    const provider = getChatProvider();
    const stream = await provider.generateStream(fullMessages, {
      maxTokens: 400,
      timeoutMs: 15000,
    });


    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error: any) {
    console.error("[API /api/chat Error]", error?.message || error);
    return NextResponse.json(
      {
        success: false,
        error: "chat_execution_failed",
        message:
          "Unable to complete assistant response right now. Please message us directly on WhatsApp.",
        whatsappUrl: "https://wa.me/919311215564",
      },
      { status: 500 }
    );
  }
}
