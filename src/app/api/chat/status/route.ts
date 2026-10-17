import { NextResponse } from "next/server";
import { isChatbotConfigured } from "@/lib/assistant/chatProvider";
import { ChatbotHealthTracker } from "@/lib/assistant/chatbotHealthTracker";

export const dynamic = "force-dynamic";

/**
 * GET /api/chat/status
 * Informs the client widget whether the chatbot is enabled and ready to render.
 * If CHATBOT_API_KEY or CHATBOT_MODEL is missing, or if the circuit breaker has tripped
 * due to repeated provider failures, returns { enabled: false } so the widget is hidden.
 */
export async function GET() {
  const configured = isChatbotConfigured();
  const diagnostics = ChatbotHealthTracker.getDiagnostics();

  return NextResponse.json(
    {
      enabled: configured && !diagnostics.circuitBreakerTripped,
      provider: diagnostics.provider,
      model: diagnostics.model,
      status: diagnostics.status,
      circuitBreakerTripped: diagnostics.circuitBreakerTripped,
      consecutiveFailures: diagnostics.consecutiveFailures,
      whatsappUrl: "https://wa.me/919311215564",
      maxCharacters: 500,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
