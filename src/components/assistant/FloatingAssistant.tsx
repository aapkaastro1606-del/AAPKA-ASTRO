"use client";

import React, { useState, useEffect, useRef, useId } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
  RotateCcw,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  actions?: AssistantAction[];
  timestamp: string;
  isStreaming?: boolean;
}

export interface AssistantAction {
  label: string;
  url: string;
  type: "primary" | "whatsapp" | "call" | "secondary";
}

const STORAGE_KEY = "aapka_astro_chat_history";

/**
 * Evaluates whether the assistant should be hidden on a given route.
 * Hidden on /admin, /dashboard, /instructor, /checkout, /booking.
 */
export function shouldHideAssistantOnPath(pathname: string): boolean {
  if (!pathname) return false;
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/instructor") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/booking")
  );
}

/**
 * Validates URLs: permits strictly internal site paths, canonical site domain, WhatsApp, and tel:
 */
export function isAllowedAssistantUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return true;
  if (trimmed.startsWith("https://www.aapkaastro.com/") || trimmed.startsWith("https://aapkaastro.com/")) return true;
  if (trimmed.startsWith("https://wa.me/")) return true;
  if (trimmed.startsWith("tel:")) return true;
  return false;
}

/**
 * Safely parses and renders assistant text and markdown links without any raw HTML (0% XSS risk).
 */
export function renderSafeAssistantContent(content: string): React.ReactNode {
  // Regex matches [label](url) and **bold**
  const lines = content.split("\n");

  return (
    <div className="space-y-1.5 leading-relaxed">
      {lines.map((line, lineIdx) => {
        if (!line.trim()) {
          return <div key={lineIdx} className="h-1.5" />;
        }

        // Parse markdown links [label](url) and **bold**
        const parts: React.ReactNode[] = [];
        let remaining = line;
        let partKey = 0;

        const tokenRegex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*)/;

        while (remaining) {
          const match = remaining.match(tokenRegex);
          if (!match || match.index === undefined) {
            parts.push(remaining);
            break;
          }

          if (match.index > 0) {
            parts.push(remaining.substring(0, match.index));
          }

          const matchedString = match[0];

          if (matchedString.startsWith("[")) {
            // Markdown link
            const label = match[2];
            const url = match[3];

            if (isAllowedAssistantUrl(url)) {
              if (url.startsWith("/")) {
                parts.push(
                  <Link
                    key={`l-${partKey++}`}
                    href={url}
                    className="text-[#7B2D26] font-bold underline hover:text-[#5B201B] inline-flex items-center gap-0.5"
                  >
                    {label}
                  </Link>
                );
              } else {
                parts.push(
                  <a
                    key={`a-${partKey++}`}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#7B2D26] font-bold underline hover:text-[#5B201B] inline-flex items-center gap-0.5"
                  >
                    {label}
                    <ExternalLink className="h-2.5 w-2.5 inline opacity-80" />
                  </a>
                );
              }
            } else {
              // Deny disallowed external URLs: render safe text only
              parts.push(label);
            }
          } else if (matchedString.startsWith("**")) {
            // Bold
            parts.push(
              <strong key={`b-${partKey++}`} className="font-semibold text-[#241710]">
                {match[4]}
              </strong>
            );
          }

          remaining = remaining.substring(match.index + matchedString.length);
        }

        return <p key={lineIdx}>{parts}</p>;
      })}
    </div>
  );
}

const CHIPS_EN = [
  { label: "💰 Fees & 50% Off", query: "What are your consultation fees and offers?" },
  { label: "🌟 Acharya Ji's Background", query: "Who is Acharya Niraj Kumar and what are his qualifications?" },
  { label: "📅 How to Book a Session", query: "How do I book a consultation with Acharya Ji?" },
  { label: "🏡 Devta Vaastu Consultation", query: "Tell me about your 16-zone zero-demolition Devta Vaastu consultation" },
];

const CHIPS_HI = [
  { label: "💰 परामर्श शुल्क (₹1,051)", query: "परामर्श की फीस और ऑफर क्या हैं?" },
  { label: "🌟 आचार्य जी का परिचय", query: "आचार्य नीरज कुमार जी का अनुभव और योग्यता क्या है?" },
  { label: "📅 बुकिंग प्रक्रिया", query: "परामर्श कैसे बुक करें?" },
  { label: "🏡 देवता वास्तु परामर्श", query: "16-जोन देवता वास्तु परामर्श के बारे में बताएं" },
];

function createWelcomeMessage(isHi: boolean): ChatMessage {
  if (isHi) {
    return {
      id: "msg-welcome-hi",
      sender: "assistant",
      text: "नमस्ते! 🙏 आपका एस्ट्रो में आपका स्वागत है। मैं आचार्य नीरज कुमार जी का आधिकारिक AI सहायक हूँ।\n\nमैं आपको हमारे परामर्श शुल्क (प्रथम बुकिंग पर मात्र ₹1,051 में 50% छूट), 16-जोन देवता वास्तु, प्रमाणित रत्न, या अपॉइंटमेंट बुकिंग के बारे में प्रामाणिक जानकारी दे सकता हूँ। आप मुझसे हिन्दी, English, या Hinglish में बात कर सकते हैं!",
      actions: [
        {
          label: "Book Astro Session (₹1,051)",
          url: "/consult?product=astro&offer=FIRST1051",
          type: "primary",
        },
        {
          label: "Chat on WhatsApp",
          url: "https://wa.me/919311215564?text=" + encodeURIComponent("नमस्ते आचार्य जी, मुझे परामर्श के बारे में जानकारी चाहिए।"),
          type: "whatsapp",
        },
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  }

  return {
    id: "msg-welcome-en",
    sender: "assistant",
    text: "Namaste! 🙏 Welcome to Aapka Astro. I am Acharya Niraj Kumar's official AI assistant.\n\nI can answer questions regarding our consultation fees (flat ₹1,051 first-booking offer), 16-zone zero-demolition Devta Vaastu, lab-certified gemstones, or booking an appointment. You can speak to me in English, हिन्दी, or Hinglish!",
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
  };
}

export function FloatingAssistant() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const isHi = language === "hi" || (typeof pathname === "string" && pathname.startsWith("/hi"));

  const [mounted, setMounted] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionKey, setSessionKey] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lastUserQuestion, setLastUserQuestion] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const liveRegionId = useId();

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
        setIsEnabled(Boolean(data.enabled));
      })
      .catch(() => {
        setIsEnabled(false);
      });

    // 3. Load conversation strictly from sessionStorage
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          const lastUser = parsed.filter((m: ChatMessage) => m.sender === "user").pop();
          if (lastUser) setLastUserQuestion(lastUser.text);
          return;
        }
      }
    } catch {
      // ignore
    }

    // Default welcome message
    setMessages([createWelcomeMessage(isHi)]);
  }, [isHi]);

  // Persist messages strictly in sessionStorage
  useEffect(() => {
    if (mounted && messages.length > 0) {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch {
        // ignore
      }
    }
  }, [messages, mounted]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  // Keyboard accessibility: Escape closes dialog, Focus Trap, return focus to trigger
  useEffect(() => {
    if (!isOpen) return;

    // Focus input on dialog open
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
        triggerButtonRef.current?.focus();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // 4. Strict route hiding: hide on /admin, /dashboard, /instructor, checkout/booking
  if (!mounted || !isEnabled) return null;
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/instructor") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/booking")
  ) {
    return null;
  }

  const handleNewChat = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setMessages([createWelcomeMessage(isHi)]);
    setInput("");
    setLastUserQuestion("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || isLoading) return;

    // Strict 500-character cap
    const sanitizedQuery = queryText.slice(0, 500);
    setLastUserQuestion(sanitizedQuery);

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: sanitizedQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

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
      // Capped to strictly the last 8 messages
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
          (isHi
            ? "अभी मैसेज लिमिट पूरी हो चुकी है। तत्काल सहायता के लिए कृपया सीधे WhatsApp पर संपर्क करें।"
            : "You have reached the message limit for now. For immediate assistance, please connect directly with Acharya Ji on WhatsApp.");

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  text: errorMsg,
                  isStreaming: false,
                  actions: [
                    {
                      label: isHi ? "WhatsApp पर बात करें" : "Chat on WhatsApp",
                      url:
                        errorData.whatsappUrl ||
                        `https://wa.me/919311215564?text=${encodeURIComponent(
                          `Namaste Acharya Ji, ${sanitizedQuery}`
                        )}`,
                      type: "whatsapp",
                    },
                    {
                      label: isHi ? "परामर्श बुक करें (₹1,051)" : "Book Consultation (₹1,051)",
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
            prev.map((m) => (m.id === assistantMsgId ? { ...m, text: fullText } : m))
          );
        }
      }

      // Attach contextual actions
      const lowerFull = fullText.toLowerCase();
      const actions: AssistantAction[] = [];

      if (lowerFull.includes("1,051") || lowerFull.includes("astro") || lowerFull.includes("kundli") || lowerFull.includes("ज्योतिष")) {
        actions.push({
          label: isHi ? "ज्योतिष सत्र बुक करें (₹1,051)" : "Book Astro Session (₹1,051)",
          url: "/consult?product=astro&offer=FIRST1051",
          type: "primary",
        });
      }
      if (lowerFull.includes("vaastu") || lowerFull.includes("vastu") || lowerFull.includes("15,000") || lowerFull.includes("वास्तु")) {
        actions.push({
          label: isHi ? "देवता वास्तु बुक करें (₹15,000)" : "Book Vaastu Audit (₹15,000)",
          url: "/consult?product=vaastu",
          type: "primary",
        });
      }
      actions.push({
        label: isHi ? "WhatsApp पर पूछें" : "Chat on WhatsApp",
        url: `https://wa.me/919311215564?text=${encodeURIComponent(
          `Namaste Acharya Ji, ${sanitizedQuery}`
        )}`,
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
      const fallbackMsg = isHi
        ? "संपर्क करने में तकनीकी बाधा आ रही है। कृपया आचार्य नीरज कुमार जी से सीधे WhatsApp या Call पर संपर्क करें।"
        : "I am having trouble connecting right now. Please message Acharya Niraj Kumar directly on WhatsApp at +91 93112 15564.";

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                text: fallbackMsg,
                isStreaming: false,
                actions: [
                  {
                    label: isHi ? "WhatsApp पर बात करें" : "Chat on WhatsApp",
                    url: `https://wa.me/919311215564?text=${encodeURIComponent(
                      `Namaste Acharya Ji, ${sanitizedQuery}`
                    )}`,
                    type: "whatsapp",
                  },
                  {
                    label: isHi ? "सीधे कॉल करें" : "Call +91 93112 15564",
                    url: "tel:+919311215564",
                    type: "call",
                  },
                  {
                    label: isHi ? "परामर्श स्लॉट बुक करें" : "Book Consultation",
                    url: "/consult?product=astro&offer=FIRST1051",
                    type: "primary",
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

  // Pre-filled WhatsApp escalation URL
  const prefilledWhatsappUrl = `https://wa.me/919311215564?text=${encodeURIComponent(
    lastUserQuestion
      ? `Namaste Acharya Ji, ${lastUserQuestion}`
      : "Namaste Acharya Ji, I would like to inquire about a consultation on Aapka Astro."
  )}`;

  const activeChips = isHi ? CHIPS_HI : CHIPS_EN;

  return (
    <aside
      aria-label={isHi ? "आपका एस्ट्रो AI सहायक" : "Aapka Astro AI Assistant"}
      className="fixed bottom-5 right-5 z-40 print:hidden font-sans select-none"
    >
      {/* Invisible screen reader live region */}
      <div id={liveRegionId} aria-live="polite" aria-atomic="false" className="sr-only">
        {messages[messages.length - 1]?.sender === "assistant" &&
          messages[messages.length - 1]?.text}
      </div>

      {/* 1. Collapsed Floating Trigger Button: Circular Logo Type */}
      {!isOpen && (
        <div className="relative group">
          <button
            ref={triggerButtonRef}
            onClick={() => setIsOpen(true)}
            className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#7B2D26] to-[#5F201B] p-1.5 text-[#FFFDF9] shadow-2xl border-2 border-[#E8A33D] hover:border-[#F59E0B] hover:shadow-red-950/50 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#7B2D26] focus-visible:ring-offset-2 focus-visible:outline-hidden transition-all duration-200 motion-reduce:transition-none motion-reduce:hover:scale-100 cursor-pointer"
            aria-label={isHi ? "AI सहायक खोलें" : "Open Aapka Astro AI Assistant"}
            title={isHi ? "आचार्य जी का AI सहायक" : "Ask Aapka Astro AI Assistant"}
          >
            {/* White Circular Inner Container with Website Logo */}
            <div className="flex h-full w-full items-center justify-center rounded-full bg-white p-2 shadow-inner border border-[#E8D8C3]">
              <img
                src="/images/logo.png"
                alt="Aapka Astro Logo"
                className="h-full w-full object-contain"
              />
            </div>

            {/* Online Live Presence Indicator Badge */}
            <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-reduce:animate-none"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
            </span>
          </button>

          {/* Hover Tooltip (Above Circle) */}
          <div className="pointer-events-none absolute bottom-full right-0 mb-2 hidden group-hover:flex items-center whitespace-nowrap rounded-lg bg-[#241710] text-[#FFFDF9] text-[11px] font-semibold px-2.5 py-1 shadow-lg border border-[#E8A33D]/40 transition-opacity z-50">
            {isHi ? "AI सहायक से पूछें" : "Ask AI Assistant"}
          </div>
        </div>
      )}

      {/* 2. Expanded Assistant Panel: 380x560 on desktop; full-height sheet on mobile */}
      {isOpen && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={isHi ? "आपका एस्ट्रो AI सहायक संवाद" : "Aapka Astro AI Assistant Chat"}
          className="fixed inset-0 sm:inset-auto sm:bottom-0 sm:right-0 w-full sm:w-[380px] h-full sm:h-[560px] max-h-[100dvh] sm:max-h-[560px] sm:rounded-2xl bg-[#FFFDF9] border border-[#E8D8C3] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 motion-reduce:animate-none"
        >
          {/* Header with Cover Logo, Title, AI Badge, New Chat & Close */}
          <header className="bg-gradient-to-r from-[#7B2D26] via-[#65231D] to-[#7B2D26] px-4 py-3 text-[#FFFDF9] border-b border-[#E8A33D]/40 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {/* Cover Logo */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-sm border border-[#E8D8C3]">
                <img
                  src="/images/logo.png"
                  alt="Aapka Astro Official Logo"
                  className="h-full w-full object-contain"
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5 leading-tight">
                  <h2 className="text-xs sm:text-sm font-bold text-white font-temple">
                    {isHi ? "Aapka Astro AI सहायक" : "Aapka Astro Assistant"}
                  </h2>
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded-full bg-[#E8A33D]/30 border border-[#E8A33D]/70 text-[9px] font-bold text-[#FFFDF9] uppercase tracking-wider">
                    AI Assistant
                  </span>
                </div>
                <p className="text-[10px] text-[#E8D8C3] leading-none mt-1">
                  English • हिन्दी • Hinglish
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* New Chat Button */}
              <button
                type="button"
                onClick={handleNewChat}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[#E8D8C3] hover:text-white text-[10px] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-hidden"
                title={isHi ? "नया चैट शुरू करें" : "Start New Chat"}
                aria-label={isHi ? "नया चैट" : "New Chat"}
              >
                <RotateCcw className="h-3 w-3" />
                <span className="hidden sm:inline">{isHi ? "नया चैट" : "New Chat"}</span>
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  triggerButtonRef.current?.focus();
                }}
                className="p-1.5 rounded-lg text-[#E8D8C3] hover:bg-white/15 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-hidden"
                aria-label={isHi ? "सहायक बंद करें" : "Close Assistant"}
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          {/* Messages Container */}
          <div
            tabIndex={0}
            className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FAF6F0]/70 text-xs focus-visible:outline-hidden"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-xs leading-relaxed ${
                    m.sender === "user"
                      ? "bg-[#7B2D26] text-[#FFFDF9] rounded-br-xs"
                      : "bg-[#FFFDF9] text-[#3B2A1E] border border-[#E8D8C3] rounded-bl-xs"
                  }`}
                >
                  {m.sender === "assistant"
                    ? renderSafeAssistantContent(m.text)
                    : m.text}
                  {m.isStreaming && (
                    <span className="inline-block w-1.5 h-3.5 ml-1 bg-[#C1662F] animate-pulse motion-reduce:animate-none"></span>
                  )}
                </div>

                {/* Contextual Action Buttons */}
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
                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 text-[11px] font-bold shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-hidden"
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
                            className="inline-flex items-center gap-1 rounded-xl bg-[#6E5545] hover:bg-[#594436] text-white px-2.5 py-1 text-[11px] font-bold shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-[#7B2D26] focus-visible:outline-hidden"
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
                            className="inline-flex items-center gap-1 rounded-xl bg-[#7B2D26] hover:bg-[#60231D] text-[#FFFDF9] px-2.5 py-1 text-[11px] font-bold shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-[#7B2D26] focus-visible:outline-hidden"
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
                          className="inline-flex items-center gap-1 rounded-xl bg-[#F0E4D2] hover:bg-[#E5D4BE] text-[#7B2D26] px-2.5 py-1 text-[11px] font-semibold border border-[#E8D8C3] transition-colors focus-visible:ring-2 focus-visible:ring-[#7B2D26] focus-visible:outline-hidden"
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

            {/* Typing Indicator */}
            {isLoading && messages[messages.length - 1]?.text === "" && (
              <div
                className="flex items-center gap-1.5 text-[#7B2D26] bg-white border border-[#E8D8C3] px-3 py-2 rounded-xl w-max shadow-xs"
                role="status"
                aria-label="Assistant is typing"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#7B2D26] animate-bounce motion-reduce:animate-none"></span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#C1662F] animate-bounce [animation-delay:0.2s] motion-reduce:animate-none"></span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#E8A33D] animate-bounce [animation-delay:0.4s] motion-reduce:animate-none"></span>
                <span className="text-[10px] font-medium text-[#6E5545] ml-1">
                  {isHi ? "उत्तर तैयार किया जा रहा है..." : "Consulting verified knowledge..."}
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 4 Suggested Question Chips */}
          <div className="px-3 py-2 bg-[#FAF6F0] border-t border-[#E8D8C3] overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5 shrink-0">
            {activeChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(chip.query)}
                disabled={isLoading}
                className="rounded-full bg-white border border-[#E8D8C3] hover:border-[#7B2D26] hover:bg-[#FBF3E7] text-[10px] text-[#6E5545] hover:text-[#7B2D26] px-2.5 py-1 font-medium transition-colors shrink-0 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#7B2D26] focus-visible:outline-hidden"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Escalation Bar: Always available (WhatsApp pre-filled with last query, Call, and Booking) */}
          <div className="px-3 py-1.5 bg-[#F5ECE0] border-t border-[#E8D8C3] flex items-center justify-between text-[11px] shrink-0">
            <span className="text-[10px] font-bold text-[#6E5545] uppercase tracking-wide flex items-center gap-1">
              <HelpCircle className="h-3 w-3 text-[#7B2D26]" />
              {isHi ? "मदद चाहिए?" : "Direct Assistance:"}
            </span>
            <div className="flex items-center gap-2">
              <a
                href={prefilledWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-md transition-colors"
                title="WhatsApp with last question pre-filled"
              >
                <MessageSquare className="h-2.5 w-2.5" />
                WhatsApp
              </a>
              <a
                href="tel:+919311215564"
                className="inline-flex items-center gap-1 text-[10px] font-bold text-[#6E5545] hover:text-[#3B2A1E] bg-white px-2 py-0.5 rounded-md border border-[#E8D8C3] transition-colors"
                title="Call Desk"
              >
                <Phone className="h-2.5 w-2.5" />
                {isHi ? "कॉल" : "Call"}
              </a>
              <Link
                href="/consult?product=astro&offer=FIRST1051"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-[#7B2D26] hover:text-[#5B201B] bg-white px-2 py-0.5 rounded-md border border-[#E8D8C3] transition-colors"
                title="Book 1-on-1 Consultation"
              >
                <Calendar className="h-2.5 w-2.5 text-[#C1662F]" />
                {isHi ? "बुक करें" : "Book"}
              </Link>
            </div>
          </div>

          {/* Input Form Bar */}
          <div className="p-2.5 bg-[#FFFDF9] border-t border-[#E8D8C3] flex items-center gap-2 shrink-0">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                maxLength={500}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                placeholder={
                  isHi
                    ? "अपना प्रश्न पूछें (अधिकतम 500 अक्षर)..."
                    : "Ask a question (max 500 characters)..."
                }
                className="w-full rounded-xl border border-[#E8D8C3] bg-white pl-3 pr-10 py-2 text-xs text-[#3B2A1E] placeholder:text-[#8C7A6B] focus-visible:ring-2 focus-visible:ring-[#7B2D26] focus-visible:border-[#7B2D26] focus-visible:outline-hidden"
              />
              {input.length > 400 && (
                <span className="absolute right-2 top-2 text-[9px] text-[#C1662F] font-mono">
                  {500 - input.length}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7B2D26] text-[#FFFDF9] hover:bg-[#60231D] disabled:opacity-40 disabled:hover:bg-[#7B2D26] transition-colors shrink-0 shadow-xs focus-visible:ring-2 focus-visible:ring-[#7B2D26] focus-visible:outline-hidden"
              aria-label={isHi ? "संदेश भेजें" : "Send message"}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          {/* Footer Note with Privacy Policy link */}
          <footer className="px-3 py-1.5 bg-[#FAF6F0] border-t border-[#E8D8C3] text-center text-[10px] text-[#6E5545] shrink-0 leading-normal">
            {isHi ? (
              <>
                AI सहायक। उत्तर अपूर्ण हो सकते हैं। व्यक्तिगत मार्गदर्शन के लिए संपर्क करें।{" "}
                <Link
                  href="/privacy-policy"
                  onClick={() => setIsOpen(false)}
                  className="underline hover:text-[#7B2D26] font-semibold"
                >
                  गोपनीयता नीति
                </Link>
              </>
            ) : (
              <>
                AI assistant. Answers may be imperfect. For personal guidance please contact us.{" "}
                <Link
                  href="/privacy-policy"
                  onClick={() => setIsOpen(false)}
                  className="underline hover:text-[#7B2D26] font-semibold"
                >
                  Privacy Policy
                </Link>
              </>
            )}
          </footer>
        </div>
      )}
    </aside>
  );
}
