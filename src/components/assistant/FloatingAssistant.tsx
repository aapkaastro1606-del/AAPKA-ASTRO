"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  MessageSquare,
  X,
  Send,
  Phone,
  Calendar,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { DiyaIcon } from "@/components/ui/DiyaIcon";
import { AssistantAction } from "@/lib/assistant/queryEngine";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  actions?: AssistantAction[];
  timestamp: string;
  isStreaming?: boolean;
}

const QUICK_PROMPTS = [
  { label: "💰 Fees & 50% Off", query: "What are your consultation fees and offers?" },
  { label: "🌟 Acharya Ji's Background", query: "Who is Acharya Niraj Kumar and what is his experience?" },
  { label: "📅 How to Book a Session", query: "How do I book a consultation with Acharya Ji?" },
  { label: "🏡 Vaastu Consultation", query: "Tell me about your Devta Vaastu consultation charges and process" },
  { label: "🔮 Free Kundli & Tools", query: "What free astrological tools do you offer?" },
];

export function FloatingAssistant() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionKey, setSessionKey] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    // 1. Session key initialization for anonymous rate limiting
    try {
      let key = sessionStorage.getItem("aapka_astro_chat_session");
      if (!key) {
        key = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem("aapka_astro_chat_session", key);
      }
      setSessionKey(key);
    } catch {
      // sessionStorage unavailable
    }

    // 2. Production Health Check: Do NOT render if chatbot is disabled / key missing
    fetch("/api/chat/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.enabled) {
          setIsEnabled(true);
        } else {
          setIsEnabled(false);
        }
      })
      .catch(() => {
        // Safe fail-closed: do not render broken chatbot
        setIsEnabled(false);
      });

    // 3. Welcome Message
    setMessages([
      {
        id: "msg-welcome",
        sender: "assistant",
        text: "Namaste! 🙏 Welcome to Aapka Astro. I am Acharya Niraj Kumar's verified assistant.\n\nI can answer questions regarding our consultation fees (flat ₹1,051 first-booking offer), 16-zone Devta Vaastu, certified gemstones, or booking an appointment. You can speak to me in English, हिन्दी, or Hinglish!",
        actions: [
          {
            label: "Book Astro Session (₹1,051)",
            url: "/consult?product=astro&offer=FIRST1051",
            type: "primary",
          },
          {
            label: "Chat on WhatsApp",
            url: "https://wa.me/919311215564?text=" + encodeURIComponent("Namaste Acharya Ji, I would like to inquire about a consultation on Aapka Astro."),
            type: "whatsapp",
          },
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Suppress when unmounted, disabled in production, or on administrative desks
  if (!mounted || !isEnabled) return null;
  if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
    return null;
  }

  const handleSendMessage = async (textToSend?: string) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || isLoading) return;

    // Strict 500-character cap
    const sanitizedQuery = queryText.slice(0, 500);

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: sanitizedQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Create an empty assistant message ready to receive streamed tokens
    const assistantMsgId = `ast-${Date.now()}`;
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      sender: "assistant",
      text: "",
      isStreaming: true,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, initialAssistantMsg]);

    try {
      // Assemble history capped to last 8 messages
      const historyContext = messages.slice(-8).map((m) => ({
        role: m.sender,
        content: m.text,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: sanitizedQuery,
          history: historyContext,
          sessionKey,
        }),
      });

      // Handle Rate Limiting (429) or Service Disabled (503)
      if (response.status === 429 || response.status === 503) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg =
          errorData.message ||
          "You have reached the message limit for now. For immediate assistance, please connect with us directly on WhatsApp.";

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  text: errorMsg,
                  isStreaming: false,
                  actions: [
                    {
                      label: "Chat on WhatsApp",
                      url: errorData.whatsappUrl || "https://wa.me/919311215564",
                      type: "whatsapp",
                    },
                    {
                      label: "Book Consultation",
                      url: "/consult?product=astro&offer=FIRST1051",
                      type: "primary",
                    },
                  ],
                }
              : m
          )
        );
        return;
      }

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      // Read streamed chunks
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, text: fullText } : m
            )
          );
        }
      }

      // Attach relevant contextual actions based on generated text
      const lowerFull = fullText.toLowerCase();
      const actions: AssistantAction[] = [];

      if (lowerFull.includes("1,051") || lowerFull.includes("astro") || lowerFull.includes("kundli")) {
        actions.push({
          label: "Book Astro Session (₹1,051)",
          url: "/consult?product=astro&offer=FIRST1051",
          type: "primary",
        });
      }
      if (lowerFull.includes("vaastu") || lowerFull.includes("vastu") || lowerFull.includes("15,000")) {
        actions.push({
          label: "Book Vaastu Audit (₹15,000)",
          url: "/consult?product=vaastu",
          type: "primary",
        });
      }
      actions.push({
        label: "Chat on WhatsApp",
        url: "https://wa.me/919311215564?text=" + encodeURIComponent("Namaste Acharya Ji, I would like to inquire about a consultation on Aapka Astro."),
        type: "whatsapp",
      });

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, isStreaming: false, actions }
            : m
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                text: "I am having trouble connecting right now. Please message Acharya Niraj Kumar directly on WhatsApp at +91 93112 15564.",
                isStreaming: false,
                actions: [
                  {
                    label: "Chat on WhatsApp",
                    url: "https://wa.me/919311215564",
                    type: "whatsapp",
                  },
                ],
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <aside aria-label="Aapka Astro AI Assistant" className="fixed bottom-5 right-5 z-40 print:hidden">
      {/* 1. Collapsed Floating Action Pill */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#7B2D26] to-[#64221C] px-4 py-3 text-[#FFFDF9] shadow-xl border border-[#E8A33D]/50 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200"
          aria-label="Open Aapka Astro AI Assistant"
        >
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#E8A33D] text-[#7B2D26] shadow-sm">
            <DiyaIcon size={18} />
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8A33D] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 border border-white"></span>
            </span>
          </div>
          <div className="text-left hidden sm:block">
            <span className="block text-xs font-bold leading-tight tracking-wide text-[#E8D8C3]">
              Ask Acharya Ji&apos;s Assistant
            </span>
            <span className="block text-[10px] text-[#E8A33D] font-medium leading-none">
              Fees • Services • WhatsApp
            </span>
          </div>
          <span className="sm:hidden text-xs font-bold text-[#E8A33D]">सहायक</span>
        </button>
      )}

      {/* 2. Expanded Floating Dialog Card */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Aapka Astro Assistant Chat Window"
          className="flex flex-col w-[92vw] sm:w-[390px] h-[550px] max-h-[82vh] rounded-2xl bg-[#FFFDF9] border border-[#E8D8C3] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-[#7B2D26] via-[#64221C] to-[#7B2D26] px-4 py-3 text-[#FFFDF9] border-b border-[#E8A33D]/30 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8A33D] text-[#7B2D26] shadow-inner">
                <DiyaIcon size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#FFFDF9] flex items-center gap-1.5 leading-tight font-serif">
                  Aapka Astro Sahayak
                  <span className="inline-flex items-center rounded-full bg-green-600/30 border border-green-400 px-1.5 py-0.2 text-[9px] font-semibold text-green-200">
                    Live
                  </span>
                </h3>
                <p className="text-[10px] text-[#E8D8C3] leading-none mt-0.5">
                  English • हिन्दी • Hinglish
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-[#E8D8C3] hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Minimize Assistant"
                title="Minimize"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-[#E8D8C3] hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Close Assistant"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FAF6F0]/60 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-xs leading-relaxed whitespace-pre-wrap ${
                    m.sender === "user"
                      ? "bg-[#7B2D26] text-[#FFFDF9] rounded-br-xs"
                      : "bg-[#FFFDF9] text-[#3B2A1E] border border-[#E8D8C3] rounded-bl-xs"
                  }`}
                >
                  {m.text}
                  {m.isStreaming && (
                    <span className="inline-block w-1.5 h-3.5 ml-1 bg-[#C1662F] animate-pulse"></span>
                  )}
                </div>

                {/* Interactive Action Buttons */}
                {m.actions && m.actions.length > 0 && !m.isStreaming && (
                  <div className="mt-2 flex flex-wrap gap-1.5 w-full">
                    {m.actions.map((act, idx) => {
                      if (act.type === "whatsapp") {
                        return (
                          <a
                            key={idx}
                            href={act.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-xl bg-green-700 hover:bg-green-800 text-white px-2.5 py-1 text-[11px] font-bold shadow-xs transition-colors"
                          >
                            <MessageSquare className="h-3 w-3" />
                            {act.label}
                            <ExternalLink className="h-2.5 w-2.5 opacity-80" />
                          </a>
                        );
                      }
                      if (act.type === "call") {
                        return (
                          <a
                            key={idx}
                            href={act.url}
                            className="inline-flex items-center gap-1 rounded-xl bg-[#6E5545] hover:bg-[#594436] text-white px-2.5 py-1 text-[11px] font-bold shadow-xs transition-colors"
                          >
                            <Phone className="h-3 w-3" />
                            {act.label}
                          </a>
                        );
                      }
                      if (act.type === "primary") {
                        return (
                          <Link
                            key={idx}
                            href={act.url}
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center gap-1 rounded-xl bg-[#7B2D26] hover:bg-[#64221C] text-[#FFFDF9] px-2.5 py-1 text-[11px] font-bold shadow-xs transition-colors"
                          >
                            <Calendar className="h-3 w-3 text-[#E8A33D]" />
                            {act.label}
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        );
                      }
                      return (
                        <Link
                          key={idx}
                          href={act.url}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1 rounded-xl bg-[#F0E4D2] hover:bg-[#E5D4BE] text-[#7B2D26] px-2.5 py-1 text-[11px] font-semibold border border-[#E8D8C3] transition-colors"
                        >
                          <Sparkles className="h-3 w-3 text-[#C1662F]" />
                          {act.label}
                        </Link>
                      );
                    })}
                  </div>
                )}

                <span className="text-[9px] text-[#8C7A6B] mt-1 px-1">
                  {m.timestamp}
                </span>
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.text === "" && (
              <div className="flex items-center gap-1.5 text-[#7B2D26] bg-white border border-[#E8D8C3] px-3 py-2 rounded-xl w-max">
                <span className="h-1.5 w-1.5 rounded-full bg-[#7B2D26] animate-bounce"></span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#C1662F] animate-bounce [animation-delay:0.2s]"></span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#E8A33D] animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-[10px] font-medium text-[#6E5545] ml-1">Searching verified knowledge...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 bg-[#FAF6F0] border-t border-[#E8D8C3] overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5 shrink-0">
            {QUICK_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p.query)}
                disabled={isLoading}
                className="rounded-full bg-white border border-[#E8D8C3] hover:border-[#7B2D26] hover:bg-[#FBF3E7] text-[10px] text-[#6E5545] hover:text-[#7B2D26] px-2.5 py-1 font-medium transition-colors shrink-0 disabled:opacity-50"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Input Box & Escalation Bar */}
          <div className="p-2.5 bg-[#FFFDF9] border-t border-[#E8D8C3] flex items-center gap-2 shrink-0">
            <a
              href="https://wa.me/919311215564?text=Namaste%20Acharya%20Ji"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors shrink-0"
              title="Escalate directly to WhatsApp"
              aria-label="Direct WhatsApp Support"
            >
              <MessageSquare className="h-4 w-4" />
            </a>

            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                maxLength={500}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                placeholder="Poochhiye apna sawal / Ask a question..."
                className="w-full rounded-xl border border-[#E8D8C3] bg-white pl-3 pr-10 py-2 text-xs text-[#3B2A1E] focus:outline-none focus:ring-1 focus:ring-[#7B2D26] focus:border-[#7B2D26]"
              />
              {input.length > 400 && (
                <span className="absolute right-2 top-2 text-[9px] text-[#C1662F]">
                  {500 - input.length}
                </span>
              )}
            </div>

            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7B2D26] text-[#FFFDF9] hover:bg-[#64221C] disabled:opacity-40 disabled:hover:bg-[#7B2D26] transition-colors shrink-0"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
