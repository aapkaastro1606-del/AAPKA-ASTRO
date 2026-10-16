import { NextResponse } from "next/server";
import { isChatbotConfigured } from "@/lib/assistant/chatProvider";

export const dynamic = "force-dynamic";

/**
 * GET /api/chat/status
 * Informs the client widget whether the chatbot is enabled and ready to render.
 * If CHATBOT_API_KEY is missing in production, returns { enabled: false }
 * so the frontend never renders a broken widget.
 */
export async function GET() {
  const configured = isChatbotConfigured();

  return NextResponse.json(
    {
      enabled: configured,
      provider: process.env.CHATBOT_PROVIDER || "mock",
      maxCharacters: 500,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    }
  );
}
