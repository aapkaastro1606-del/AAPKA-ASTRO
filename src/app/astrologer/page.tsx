"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AstrologerStateStore,
  AstrologerStatus,
  QueueItem,
  ActiveSession,
  ConsultationMessage,
  INITIAL_ASTROLOGER,
} from "@/lib/store/astrologerStore";
import { calculateKundli } from "@/lib/astrology/chartCalculations";
import { KundliData } from "@/lib/astrology/types";
import { NorthIndianChart } from "@/components/kundli/NorthIndianChart";
import { PlanetaryTable } from "@/components/kundli/PlanetaryTable";
import {
  ShieldCheck,
  PhoneCall,
  Clock,
  PhoneOff,
  CheckCircle2,
  FileText,
  RefreshCw,
} from "lucide-react";

export default function AstrologerCockpitPage() {
  const [status, setStatus] = useState<AstrologerStatus>("AVAILABLE");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [messages, setMessages] = useState<ConsultationMessage[]>([]);
  const [astroReply, setAstroReply] = useState("");
  const [sessionSeconds, setSessionSeconds] = useState(0);

  // Remedy prescription scratchpad
  const [remedyText, setRemedyText] = useState("");
  const [remedySent, setRemedySent] = useState(false);

  // Client Kundli for Active Session
  const [clientKundli, setClientKundli] = useState<KundliData | null>(null);

  const syncState = () => {
    const s = AstrologerStateStore.getStatus();
    const q = AstrologerStateStore.getQueue();
    const sess = AstrologerStateStore.getActiveSession();
    setStatus(s);
    setQueue(q);
    setActiveSession(sess);

    if (sess) {
      setMessages(AstrologerStateStore.getMessages(sess.id));
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
    } else {
      setClientKundli(null);
    }
  };

  useEffect(() => {
    syncState();
    window.addEventListener("astro_state_changed", syncState);
    const interval = setInterval(syncState, 2000);
    return () => {
      window.removeEventListener("astro_state_changed", syncState);
      clearInterval(interval);
    };
  }, []);

  // Timer for active consultation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeSession) {
      interval = setInterval(() => {
        setSessionSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setSessionSeconds(0);
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  const handleStatusChange = (newStatus: AstrologerStatus) => {
    AstrologerStateStore.setStatus(newStatus);
    setStatus(newStatus);
  };

  const handleAcceptQueueItem = (queueId: string) => {
    const sess = AstrologerStateStore.acceptNextInQueue(queueId);
    if (sess) {
      setActiveSession(sess);
      setSessionSeconds(0);
      syncState();
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!astroReply.trim() || !activeSession) return;
    AstrologerStateStore.sendMessage(activeSession.id, "astrologer", astroReply.trim());
    setAstroReply("");
  };

  const handleSendRemedy = () => {
    if (!remedyText.trim() || !activeSession) return;
    AstrologerStateStore.sendMessage(
      activeSession.id,
      "astrologer",
      `VEDIC REMEDY PRESCRIBED: ${remedyText.trim()}`
    );
    setRemedySent(true);
    setTimeout(() => setRemedySent(false), 2500);
    setRemedyText("");
  };

  const handleEndSession = () => {
    if (confirm("Conclude consultation and send summary to client?")) {
      AstrologerStateStore.endSession();
      setActiveSession(null);
      setClientKundli(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF3E7] text-[#3B2A1E] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Cockpit Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8D8C3] pb-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7B2D26] text-white font-black shadow-md">
              <ShieldCheck className="h-6 w-6 text-[#E8A33D]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-temple text-[#7B2D26]">Acharya Ji&apos;s Operator Cockpit</h1>
                <span className="rounded-full bg-[#FAF1E4] px-2.5 py-0.5 text-[10px] font-bold text-[#7B2D26] border border-[#E8D8C3] font-temple">
                  MASTER CONSOLE
                </span>
              </div>
              <p className="text-xs text-[#7D6B5D] font-body">
                Single-Astrologer Control Desk &bull; Live Queue, Presence &amp; Real-Time Consultation Workbench
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] px-3.5 py-2 shadow-sm">
              <span className="text-[#7D6B5D] block text-[10px]">Today&apos;s Earnings</span>
              <span className="font-bold text-[#6B8E5A]">₹11,480</span>
            </div>
            <div className="rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] px-3.5 py-2 shadow-sm">
              <span className="text-[#7D6B5D] block text-[10px]">Sessions Completed</span>
              <span className="font-bold text-[#3B2A1E]">14</span>
            </div>
            <Link
              href="/"
              className="rounded-xl border border-[#D4C3B3] bg-[#FAF5EE] px-3.5 py-2 text-xs font-semibold text-[#3B2A1E] hover:bg-[#F3E7D3] transition-all"
            >
              View Public Site &rarr;
            </Link>
          </div>
        </div>

        {/* Master Status Control Bar */}
        <div className="mb-8 rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#7D6B5D] block mb-1 font-temple">
                Astrologer Live Presence Status
              </span>
              <div className="text-sm font-semibold text-[#3B2A1E] flex items-center gap-2">
                <span className="text-[#6B5A4E]">Current Broadcast:</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    status === "AVAILABLE"
                      ? "bg-[#6B8E5A]/20 text-[#6B8E5A] border border-[#6B8E5A]/30"
                      : status === "BUSY"
                      ? "bg-[#E8A33D]/20 text-[#C1662F] border border-[#E8A33D]/30"
                      : status === "BREAK"
                      ? "bg-[#7B2D26]/20 text-[#7B2D26] border border-[#7B2D26]/30"
                      : "bg-slate-200 text-[#7D6B5D]"
                  }`}
                >
                  {status}
                </span>
              </div>
            </div>

            {/* 4-way Status Switcher */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleStatusChange("AVAILABLE")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  status === "AVAILABLE"
                    ? "bg-[#6B8E5A] text-white shadow-sm"
                    : "border border-[#D4C3B3] bg-[#FAF5EE] text-[#3B2A1E] hover:bg-[#F3E7D3]"
                }`}
              >
                AVAILABLE (Online)
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange("BUSY")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  status === "BUSY"
                    ? "bg-[#C1662F] text-white shadow-sm"
                    : "border border-[#D4C3B3] bg-[#FAF5EE] text-[#3B2A1E] hover:bg-[#F3E7D3]"
                }`}
              >
                BUSY (In Session)
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange("BREAK")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  status === "BREAK"
                    ? "bg-[#7B2D26] text-white shadow-sm"
                    : "border border-[#D4C3B3] bg-[#FAF5EE] text-[#3B2A1E] hover:bg-[#F3E7D3]"
                }`}
              >
                TEA / SADHANA BREAK
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange("OFFLINE")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  status === "OFFLINE"
                    ? "bg-stone-700 text-white shadow-sm"
                    : "border border-[#D4C3B3] bg-[#FAF5EE] text-[#3B2A1E] hover:bg-[#F3E7D3]"
                }`}
              >
                OFFLINE
              </button>
            </div>
          </div>
        </div>

        {/* Main Work Area: Active Session vs Live Queue */}
        {activeSession && clientKundli ? (
          /* =========================================================================
             ACTIVE LIVE WORKBENCH (SPLIT CHAT & KUNDLI VIEWER)
          ========================================================================= */
          <div className="space-y-6">
            {/* Active Session Ribbon */}
            <div className="flex flex-wrap items-center justify-between rounded-2xl border border-[#E8D8C3] bg-[#FAF1E4] p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-[#6B8E5A] animate-ping" />
                <div>
                  <h3 className="font-bold font-temple text-[#7B2D26] text-base">
                    Consulting With: {activeSession.userName} ({activeSession.userPhone})
                  </h3>
                  <div className="text-xs text-[#6B5A4E] font-body">
                    Concern: &ldquo;{activeSession.concern}&rdquo; &bull; Mode: {activeSession.type.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="font-mono text-xs text-[#7B2D26] font-bold bg-[#FFFDF9] px-3 py-1.5 rounded-lg border border-[#E8D8C3]">
                  Timer: {Math.floor(sessionSeconds / 60)}m {sessionSeconds % 60}s &bull; Consultation: Flat ₹1,051 (Prepaid)
                </div>
                <button
                  type="button"
                  onClick={handleEndSession}
                  className="rounded-xl bg-[#7B2D26] px-4 py-2 text-xs font-bold text-white hover:bg-[#64231D] transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <PhoneOff className="h-4 w-4" />
                  <span>Conclude Session</span>
                </button>
              </div>
            </div>

            {/* Split Screen Workbench */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Pane: Live Chat & Remedy Writer */}
              <div className="lg:col-span-6 rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 flex flex-col justify-between min-h-[520px] shadow-sm">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#7B2D26] font-temple mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#E8A33D]" />
                    <span>Live Consultation Conversation</span>
                  </h4>

                  {/* Messages Feed */}
                  <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2 mb-4">
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex flex-col ${m.sender === "astrologer" ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-md rounded-2xl p-3 text-xs shadow-sm ${
                            m.sender === "astrologer"
                              ? "bg-[#7B2D26] text-white font-medium rounded-br-none"
                              : "bg-[#FAF5EE] text-[#3B2A1E] rounded-bl-none border border-[#E8D8C3]"
                          }`}
                        >
                          <div className="text-[10px] opacity-75 font-semibold mb-0.5">
                            {m.sender === "astrologer" ? "You (Acharya Ji)" : activeSession.userName} &bull; {m.timestamp}
                          </div>
                          <p>{m.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <form onSubmit={handleSendMessage} className="flex gap-2 mb-6">
                    <input
                      type="text"
                      value={astroReply}
                      onChange={(e) => setAstroReply(e.target.value)}
                      placeholder="Type your astrological advice..."
                      className="flex-1 rounded-xl border border-[#D4C3B3] bg-[#FAF5EE] px-3.5 py-2.5 text-xs text-[#3B2A1E] focus:border-[#7B2D26] focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-[#7B2D26] px-4 py-2.5 font-bold text-white hover:bg-[#64231D] text-xs shadow-sm transition-all"
                    >
                      Send
                    </button>
                  </form>
                </div>

                {/* Remedy Prescription Generator */}
                <div className="border-t border-[#E8D8C3] pt-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7B2D26] font-temple block mb-2">
                    Write Official Remedy / Prescription
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={remedyText}
                      onChange={(e) => setRemedyText(e.target.value)}
                      placeholder="e.g. Wear 6.25 Ratti Pukhraj on Thursday; chant Om Namah Shivaya 108 times."
                      className="flex-1 rounded-xl border border-[#D4C3B3] bg-[#FAF5EE] px-3.5 py-2 text-xs text-[#3B2A1E] focus:border-[#7B2D26] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleSendRemedy}
                      className="rounded-xl bg-[#6B8E5A] px-4 py-2 text-xs font-bold text-white hover:bg-[#587449] shadow-sm transition-all"
                    >
                      {remedySent ? "Prescribed ✓" : "Prescribe Remedy"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Pane: Client's Kundli Side-by-Side */}
              <div className="lg:col-span-6 rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 overflow-hidden shadow-sm">
                <div className="flex items-center justify-between border-b border-[#E8D8C3] pb-3 mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#7B2D26] font-temple">
                    Client&apos;s Janam Kundli (Lagna &amp; Planetary Degrees)
                  </h4>
                  <span className="text-xs text-[#7D6B5D] font-mono">
                    Lagna: <strong className="text-[#3B2A1E]">{clientKundli.ascendant.rashiName}</strong> &bull; Moon: <strong className="text-[#3B2A1E]">{clientKundli.moonSign}</strong>
                  </span>
                </div>

                <div className="flex justify-center mb-4">
                  <NorthIndianChart kundli={clientKundli} size={320} />
                </div>

                <PlanetaryTable kundli={clientKundli} className="max-h-60 overflow-y-auto" />
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================================
             LIVE WAITLIST QUEUE MANAGER (WHEN IDLE OR WAITING)
          ========================================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Queue List (Left Column) */}
            <div className="lg:col-span-8 rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E8D8C3] pb-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold font-temple text-[#7B2D26] flex items-center gap-2">
                    <span>Live Waiting Queue</span>
                    <span className="rounded-full bg-[#FAF1E4] px-2 py-0.5 text-xs font-mono font-bold text-[#7B2D26] border border-[#E8D8C3]">
                      {queue.length} Clients
                    </span>
                  </h3>
                  <p className="text-xs text-[#7D6B5D] mt-0.5 font-body">
                    Clients currently in line waiting for Acharya Ji to accept their session.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={syncState}
                  className="rounded-lg border border-[#D4C3B3] bg-[#FAF5EE] p-2 text-[#3B2A1E] hover:bg-[#F3E7D3]"
                  title="Refresh Queue"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              {queue.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#D4C3B3] p-12 text-center text-xs text-[#7D6B5D]">
                  <Clock className="mx-auto h-8 w-8 text-[#C1662F] mb-2" />
                  No clients currently waiting in the live queue.
                  <p className="text-[11px] text-[#7D6B5D] mt-1 font-body">
                    Your status is set to &ldquo;{status}&rdquo;. New consultations will appear here automatically.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {queue.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-[#E8D8C3] bg-[#FAF5EE] p-4 hover:border-[#D4C3B3] transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#7B2D26]">#{idx + 1}</span>
                          <span className="font-bold text-[#3B2A1E] text-sm">{item.userName}</span>
                          <span className="rounded bg-[#FFFDF9] border border-[#E8D8C3] px-2 py-0.5 text-[10px] font-semibold text-[#7D6B5D]">
                            {item.consultationType.toUpperCase()}
                          </span>
                          <span className="text-xs text-[#7D6B5D]">({item.userPhone})</span>
                        </div>
                        <div className="text-xs text-[#6B5A4E] italic font-body">
                          &ldquo;{item.concern}&rdquo;
                        </div>
                        <div className="text-[11px] text-[#7D6B5D]">
                          Birth: {item.birthDetails.birthDate} at {item.birthDetails.birthTime} ({item.birthDetails.birthPlace})
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleAcceptQueueItem(item.id)}
                          className="rounded-xl bg-[#7B2D26] px-4 py-2 text-xs font-bold text-white hover:bg-[#64231D] shadow-sm flex items-center gap-1.5 transition-all"
                        >
                          <PhoneCall className="h-3.5 w-3.5 text-[#E8A33D]" />
                          <span>Accept &amp; Connect</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats & Astrologer Instructions (Right Column) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#7B2D26] font-temple mb-3">
                  Operator Guidelines
                </h4>
                <ul className="space-y-2.5 text-xs text-[#6B5A4E] leading-relaxed font-body">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#6B8E5A] shrink-0 mt-0.5" />
                    <span>
                      When taking a break or stepping away, always set status to <strong>BREAK</strong> or <strong>OFFLINE</strong> to maintain user trust.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#6B8E5A] shrink-0 mt-0.5" />
                    <span>
                      The client&apos;s chart automatically opens side-by-side upon clicking &ldquo;Accept &amp; Connect&rdquo;.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#6B8E5A] shrink-0 mt-0.5" />
                    <span>
                      Consultations are prepaid flat-fee bookings. Clients pay upfront per booking with zero per-minute meter stress.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
