import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { queryKnowledgeBase } from "@/lib/assistant/queryEngine";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const ChatRequestSchema = z.object({
  message: z.string().trim().min(1, "Message cannot be empty").max(1000, "Message too long"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional(),
});

// In-memory sliding rate limiter: max 30 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.expiresAt) {
    rateLimitMap.set(ip, { count: 1, expiresAt: now + 60000 });
    return true;
  }

  if (entry.count >= 30) {
    return false;
  }

  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    if (process.env.CHATBOT_ENABLED === "false") {
      return NextResponse.json(
        {
          success: false,
          message: "Assistant service is currently in quiet hours. Please connect directly on WhatsApp at +91 93112 15564.",
          actions: [{ label: "Connect on WhatsApp", url: "https://wa.me/919311215564" }],
        },
        { status: 503 }
      );
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many messages sent. Please wait a minute or connect directly on WhatsApp.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = ChatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid input. Please provide a valid query.",
          errors: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const { message } = parsed.data;

    // Grounded evaluation against verified site knowledge base
    const result = queryKnowledgeBase(message);

    return NextResponse.json({
      success: true,
      answer: result.answer,
      actions: result.actions,
      language: result.language,
      intent: result.intent,
      confidence: result.confidence,
    });
  } catch (error: any) {
    console.error("[Assistant API Error]", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while processing your query.",
      },
      { status: 500 }
    );
  }
}
