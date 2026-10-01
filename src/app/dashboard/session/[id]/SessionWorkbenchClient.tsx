"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AstrologerStateStore,
  ActiveSession,
  ConsultationMessage,
} from "@/lib/store/astrologerStore";
import { ClientAccountStore } from "@/lib/store/clientAccountStore";
import { PLACEHOLDER_ASTROLOGER } from "@/config/placeholderContent";
import { calculateKundli } from "@/lib/astrology/chartCalculations";
import { KundliData } from "@/lib/astrology/types";
import { NorthIndianChart } from "@/components/kundli/NorthIndianChart";
import { SouthIndianChart } from "@/components/kundli/SouthIndianChart";
import { PlanetaryTable } from "@/components/kundli/PlanetaryTable";
import { DashaTimeline } from "@/components/kundli/DashaTimeline";
import {
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Send,
  Sparkles,
  ArrowLeft,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface SessionWorkbenchClientProps {
  sessionId: string;
}

export default function SessionWorkbenchClient({ sessionId }: SessionWorkbenchClientProps) {
  const router = useRouter();

  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [messages, setMessages] = useState<ConsultationMessage[]>([]);
  const [replyInput, setReplyInput] = useState("");
  const [remedyText, setRemedyText] = useState("");
  const [remedySent, setRemedySent] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [chartType, setChartType] = useState<"north" | "south">("north");
  const [activeTab, setActiveTab] = useState<"chart" | "planets" | "dasha">("chart");
  const [clientKundli, setClientKundli] = useState<KundliData | null>(null);

  useEffect(() => {
    const storedSess = AstrologerStateStore.getActiveSession();
    const fallbackSess: ActiveSession = {
      id: sessionId,
      userId: "usr_demo",
      userName: "Devendra Verma",
      userPhone: "+91 98111 22334",
      type: "voice",
      startedAt: new Date().toISOString(),
      ratePerMin: 20,
      elapsedSeconds: 0,
      status: "active",
      concern: "Mahadasha change & business investment timing",
      notes: "",
      remedies: [],
      birthDetails: {
        name: "Devendra Verma",
        gender: "male",
        birthDate: "1988-04-18",
        birthTime: "06:45",
        birthPlace: "Lucknow, UP",
        latitude: 26.8467,
        longitude: 80.9462,
        timezone: 5.5,
      },
    };
    const sess: ActiveSession = storedSess && storedSess.id === sessionId ? storedSess : fallbackSess;
    setActiveSession(sess);

    const k = calculateKundli({
      name: sess.birthDetails.name,
      gender: sess.birthDetails.gender,
      birthDate: sess.birthDetails.birthDate,
      birthTime: sess.birthDetails.birthTime,
      birthPlace: sess.birthDetails.birthPlace,
      latitude: sess.birthDetails.latitude,
      longitude: sess.birthDetails.longitude,
      timezone: sess.birthDetails.timezone,
    });
    setClientKundli(k);

    const msgs = AstrologerStateStore.getMessages(sess.id);
    if (msgs.length === 0) {
      AstrologerStateStore.sendMessage(
        sess.id,
        "user",
        `Pranam Acharya Ji! Seeking clarity on my career and financial prospects during my upcoming Dasha.`
      );
    }
    setMessages(AstrologerStateStore.getMessages(sess.id));

    const timer = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionId]);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim() || !activeSession) return;

    AstrologerStateStore.sendMessage(activeSession.id, "astrologer", replyInput);
    setMessages(AstrologerStateStore.getMessages(activeSession.id));
    setReplyInput("");
  };

  const handleSendRemedy = () => {
    if (!remedyText.trim() || !activeSession) return;
    AstrologerStateStore.sendMessage(
      activeSession.id,
      "astrologer",
      `📜 PRESCRIBED VEDIC REMEDY:\n${remedyText}`
    );
    setMessages(AstrologerStateStore.getMessages(activeSession.id));
    setRemedySent(true);
  };

  const handleEndSession = () => {
    if (confirm("End consultation session and finalize client summary?")) {
      if (activeSession) {
        ClientAccountStore.addConsultationRecord({
          id: activeSession.id,
          date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
          duration: `${Math.max(1, Math.ceil(sessionSeconds / 60))} Minutes`,
          mode: activeSession.type === "chat" ? "Chat" : activeSession.type === "voice" ? "Voice Call" : "Video Call",
          amount: "₹1,051",
          astrologer: PLACEHOLDER_ASTROLOGER.displayName,
          topic: activeSession.concern || "Vedic Astrological Guidance",
          remedy: remedyText || "Personalized satvik remedies and mantra chanting as prescribed during consultation.",
          notes: activeSession.notes || "Comprehensive Janam Kundli and planetary transit analysis completed.",
          hasReview: false,
        });
      }
      AstrologerStateStore.endSession();
      router.push("/dashboard");
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-[#FBF3E7] text-[#3B2A1E] min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Top Control Bar */}
        <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg p-2 text-[#7B2D26] hover:bg-[#FBF3E7]"
              title="Return to Dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-temple text-base font-bold text-[#7B2D26]">
                  Consulting: {activeSession?.userName}
                </span>
                <span className="rounded-md bg-[#6B8E5A] px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                  Live {activeSession?.type}
                </span>
              </div>
              <p className="text-[11px] text-[#6E5545]">
                Concern: {activeSession?.concern}
              </p>
            </div>
          </div>

          {/* Timer & Booking Status */}
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-[#FBF3E7] px-3.5 py-1.5 border border-[#E8D8C3] text-right">
              <div className="font-mono text-xs font-black text-[#7B2D26] flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[#C1662F]" />
                <span>{formatTime(sessionSeconds)}</span>
              </div>
              <span className="text-[10px] font-semibold text-[#6B8E5A]">
                Paid Consultation (Flat ₹1,051)
              </span>
            </div>

            <button
              type="button"
              onClick={handleEndSession}
              className="rounded-xl bg-rose-700 px-4 py-2 text-xs font-bold text-white hover:bg-rose-800 transition-all shadow-sm flex items-center gap-1.5"
            >
              <PhoneOff className="h-4 w-4" />
              <span>End Consultation</span>
            </button>
          </div>
        </div>

        {/* Workbench Split Screen */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Live Chat Feed & Remedy Scratchpad */}
          <div className="lg:col-span-6 space-y-6">
            {/* Live Call Bridge (WhatsApp Call & Google Meet) */}
            {activeSession?.type !== "chat" && (
              <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#6B8E5A] animate-pulse" />
                  <span className="text-xs font-bold text-[#2A4720]">
                    Direct Client Bridge (WhatsApp / Google Meet)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/${activeSession?.userPhone?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Pranam ${activeSession?.userName || ""}, this is Acharya Niraj Kumar connecting with you for your booked consultation session.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white px-3 py-1.5 text-xs font-bold transition-all shadow-xs"
                  >
                    <PhoneCall className="h-3.5 w-3.5" />
                    <span>WhatsApp Call</span>
                  </a>

                  <a
                    href="https://meet.google.com/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white px-3 py-1.5 text-xs font-bold transition-all shadow-xs"
                  >
                    <Video className="h-3.5 w-3.5" />
                    <span>Google Meet</span>
                  </a>
                </div>
              </div>
            )}

            {/* Chat Stream */}
            <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 shadow-sm flex flex-col h-[460px]">
              <div className="text-xs font-bold uppercase tracking-wider text-[#C1662F] pb-3 border-b border-[#E8D8C3]">
                Encrypted Client Dialogue
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-3">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      m.sender === "astrologer" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-line ${
                        m.sender === "astrologer"
                          ? "bg-[#7B2D26] text-[#FBF3E7]"
                          : "bg-[#FBF3E7] text-[#3B2A1E] border border-[#E8D8C3]"
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[10px] text-[#A8988B] mt-0.5 px-1">{m.timestamp}</span>
                  </div>
                ))}
              </div>

              {/* Chat Reply Form */}
              <form onSubmit={handleSendReply} className="pt-3 border-t border-[#E8D8C3] flex gap-2">
                <input
                  type="text"
                  placeholder="Type advice or message..."
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  className="flex-1 rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] px-3.5 py-2 text-xs text-[#3B2A1E] focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-[#7B2D26] px-4 py-2 text-xs font-bold text-white hover:bg-[#96372E] shadow-sm flex items-center gap-1"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>

            {/* Live Remedy Prescription Scratchpad */}
            <div className="rounded-3xl border border-[#E8A33D]/40 bg-[#FFFDF9] p-6 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7B2D26] mb-2">
                <Sparkles className="h-4 w-4 text-[#E8A33D]" />
                <span>Prescribe Vedic Remedy &amp; Mantras to Client Portal</span>
              </div>
              <textarea
                rows={3}
                placeholder="e.g. Chant Brihaspati Beej Mantra 108 times on Thursdays. Wear 6.25 Ratti certified Yellow Sapphire..."
                value={remedyText}
                onChange={(e) => {
                  setRemedyText(e.target.value);
                  setRemedySent(false);
                }}
                className="w-full rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] p-3 text-xs text-[#3B2A1E] focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
              />
              <div className="mt-2 flex items-center justify-between">
                {remedySent ? (
                  <span className="text-xs text-[#6B8E5A] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Prescription sent to client&apos;s account notes!</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-[#6E5545]">
                    This will appear in client&apos;s Account History summary.
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleSendRemedy}
                  className="rounded-xl bg-[#E8A33D] px-4 py-1.5 text-xs font-bold text-[#3B2A1E] hover:bg-[#F6CF86] transition-all shadow-sm"
                >
                  Save &amp; Transmit Remedy
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Client's Janam Kundli Alongside Workbench */}
          <div className="lg:col-span-6 rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8D8C3] pb-3">
              <div>
                <h3 className="font-temple text-lg font-bold text-[#7B2D26]">
                  {clientKundli?.name}&apos;s Live Janam Kundli
                </h3>
                <p className="text-[11px] text-[#6E5545]">
                  Born {clientKundli?.birthDate} at {clientKundli?.birthTime} ({clientKundli?.birthPlace})
                </p>
              </div>

              {/* Chart Format Switcher */}
              <div className="flex rounded-lg bg-[#FBF3E7] p-1 border border-[#E8D8C3]">
                <button
                  type="button"
                  onClick={() => setChartType("north")}
                  className={`rounded px-2.5 py-0.5 text-xs font-bold ${
                    chartType === "north" ? "bg-[#7B2D26] text-white" : "text-[#6E5545]"
                  }`}
                >
                  North
                </button>
                <button
                  type="button"
                  onClick={() => setChartType("south")}
                  className={`rounded px-2.5 py-0.5 text-xs font-bold ${
                    chartType === "south" ? "bg-[#7B2D26] text-white" : "text-[#6E5545]"
                  }`}
                >
                  South
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#E8D8C3] gap-2">
              {[
                { id: "chart", label: "Chakra View" },
                { id: "planets", label: "Planetary Degrees" },
                { id: "dasha", label: "Vimshottari Dasha" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 ${
                    activeTab === tab.id
                      ? "border-[#7B2D26] text-[#7B2D26]"
                      : "border-transparent text-[#6E5545]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Display */}
            {clientKundli && (
              <div className="pt-2">
                {activeTab === "chart" && (
                  <div className="flex justify-center py-2">
                    {chartType === "north" ? (
                      <NorthIndianChart kundli={clientKundli} size={320} />
                    ) : (
                      <SouthIndianChart kundli={clientKundli} size={320} />
                    )}
                  </div>
                )}
                {activeTab === "planets" && <PlanetaryTable kundli={clientKundli} />}
                {activeTab === "dasha" && <DashaTimeline dashas={clientKundli.dashas} />}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
