"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  AstrologerStateStore,
  AstrologerStatus,
  QueueItem,
  ActiveSession,
  ConsultationMessage,
} from "@/lib/store/astrologerStore";
import {
  PhoneCall,
  Video,
  MessageSquare,
  Clock,
  Sparkles,
  Send,
  PhoneOff,
  Mic,
  MicOff,
  VideoOff,
  Calendar,
  Star,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Lock,
  ArrowRight,
  User,
  MapPin,
} from "lucide-react";
import {
  PLACEHOLDER_ASTROLOGER,
  ADMIN_CONFIGURABLE_PRICING,
  FIRST_CONSULTATION_OFFER,
  FLAT_CONSULTATION_PRICING,
} from "@/config/placeholderContent";
import {
  ConsultationBookingService,
  ConsultationBooking,
} from "@/lib/services/consultationBilling";
import { useCurrentUserRole } from "@/lib/auth/roleContext";
import { useUser } from "@/components/auth/ClerkAuthWrapper";

export default function ConsultPage() {
  const { isAstrologer } = useCurrentUserRole();
  const { user } = useUser();

  // Live Astrologer & Queue State
  const [status, setStatus] = useState<AstrologerStatus>("AVAILABLE");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);

  // Client Consultation Intake State
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [consultFormat, setConsultFormat] = useState<"Voice Call" | "Video Call" | "Live Chat">("Voice Call");
  const [birthDate, setBirthDate] = useState("1995-10-24");
  const [birthTime, setBirthTime] = useState("14:35");
  const [birthPlace, setBirthPlace] = useState("New Delhi, Delhi");
  const [concern, setConcern] = useState("Career growth, job switch timing, and financial stability");

  // Booking & Payment State
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<ConsultationBooking | null>(null);

  // In-Queue state for current user
  const [myQueueItem, setMyQueueItem] = useState<QueueItem | null>(null);

  // Active Session State
  const [messages, setMessages] = useState<ConsultationMessage[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // Scheduled Slot Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("2026-10-02");
  const [scheduledSlot, setScheduledSlot] = useState("11:00 AM - 11:45 AM");
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Pricing constants (Flat-Fee Pay-Per-Booking Model)
  const standardFee = FLAT_CONSULTATION_PRICING.standardFee; // ₹2,100
  const promoFee = FLAT_CONSULTATION_PRICING.firstConsultationFee; // ₹1,051
  const discountAmount = standardFee - promoFee; // ₹1,049

  const syncAll = () => {
    const currentStatus = AstrologerStateStore.getStatus();
    const currentQueue = AstrologerStateStore.getQueue();
    const currentSession = AstrologerStateStore.getActiveSession();

    setStatus(currentStatus);
    setQueue(currentQueue);
    setActiveSession(currentSession);

    if (currentSession) {
      setMessages(AstrologerStateStore.getMessages(currentSession.id));
    }
  };

  useEffect(() => {
    syncAll();
    window.addEventListener("astro_state_changed", syncAll);
    const interval = setInterval(syncAll, 2000);
    return () => {
      window.removeEventListener("astro_state_changed", syncAll);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (user?.fullName && !userName) {
      setUserName(user.fullName);
    }
  }, [user, userName]);

  // Clean Elapsed Session Timer (No wallet ticks / no balance countdowns)
  useEffect(() => {
    if (activeSession) {
      const timer = setInterval(() => {
        setSessionSeconds((prev) => prev + 1);
      }, 1000);

      return () => {
        clearInterval(timer);
      };
    } else {
      setSessionSeconds(0);
    }
  }, [activeSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle Pay-Per-Booking Checkout & Session Entrance
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName.trim() || !userPhone.trim()) {
      alert("Please provide your name and contact phone number to proceed.");
      return;
    }

    setIsProcessingPayment(true);

    try {
      // 1. Create order on server via payment endpoint
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: promoFee, // Flat ₹1,051
          userId: user?.id || `guest_${Date.now()}`,
          serviceType: "consultation_booking",
        }),
      });

      const orderData = await res.json().catch(() => null);

      // 2. Generate local ConsultationBooking record
      const booking = ConsultationBookingService.createBooking({
        userId: user?.id || `user_${Date.now()}`,
        clientName: userName,
        phone: userPhone,
        format: consultFormat,
        topic: concern,
        preferredSlot: "Immediate Live Consultation",
        dateOfBirth: birthDate,
        timeOfBirth: birthTime,
        placeOfBirth: birthPlace,
        isFirstTime: true,
      });

      booking.status = "CONFIRMED";
      booking.orderId = orderData?.order?.id || `ord_${Date.now()}`;
      booking.paymentId = `pay_${Date.now()}_sim`;
      booking.confirmedAt = new Date().toISOString();

      setConfirmedBooking(booking);
      setIsProcessingPayment(false);

      // Map format to session type
      const sessionType = consultFormat === "Voice Call" ? "voice" : consultFormat === "Video Call" ? "video" : "chat";

      // 3. Enter direct session if astrologer is available, otherwise join queue
      if (status === "AVAILABLE" && queue.length === 0) {
        const sess = AstrologerStateStore.startDirectSession({
          userName,
          userPhone,
          type: sessionType,
          ratePerMin: 0,
          birthDetails: {
            name: userName,
            birthDate,
            birthTime,
            birthPlace,
            gender: "male",
            latitude: 28.6139,
            longitude: 77.209,
            timezone: 5.5,
          },
          concern,
        });
        setActiveSession(sess);
      } else {
        const qItem = AstrologerStateStore.joinQueue({
          userName,
          userPhone,
          consultationType: sessionType,
          birthDetails: {
            name: userName,
            birthDate,
            birthTime,
            birthPlace,
            gender: "male",
            latitude: 28.6139,
            longitude: 77.209,
            timezone: 5.5,
          },
          concern,
        });
        setMyQueueItem(qItem);
      }
    } catch (err) {
      console.error("Payment or booking error:", err);
      setIsProcessingPayment(false);
      alert("Encountered an issue processing booking. Please try again or reach out to support.");
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || !activeSession) return;

    AstrologerStateStore.sendMessage(activeSession.id, "client", inputMsg.trim());
    setInputMsg("");
  };

  const handleEndSession = () => {
    if (activeSession) {
      AstrologerStateStore.endSession();
      setActiveSession(null);
      setSessionSeconds(0);
    }
  };

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleSuccess(true);
    setTimeout(() => {
      setShowScheduleModal(false);
      setScheduleSuccess(false);
      alert(`Consultation confirmed for ${scheduledDate} at ${scheduledSlot}! Confirmation receipt and meeting bridge link sent to ${userPhone}.`);
    }, 1200);
  };

  const myQueuePosition = myQueueItem
    ? queue.findIndex((q) => q.id === myQueueItem.id) + 1
    : queue.length + 1;
  const estimatedWaitMins = myQueuePosition * 7;

  return (
    <div className="bg-[#FBF3E7] py-8 lg:py-12 min-h-screen text-[#3B2A1E]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* =========================================================================
            STATE 1: ACTIVE LIVE CONSULTATION SESSION (SPLIT CHAT / CALL SCREEN)
        ========================================================================= */}
        {activeSession ? (
          <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] shadow-xl overflow-hidden">
            {/* Session Top Bar: Elapsed Duration & Astrologer Details */}
            <div className="flex flex-wrap items-center justify-between border-b border-[#E8D8C3] bg-[#FAF5EE] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={PLACEHOLDER_ASTROLOGER.avatarUrl}
                    alt={PLACEHOLDER_ASTROLOGER.displayName}
                    className="h-11 w-11 rounded-full object-cover border-2 border-[#E8A33D]"
                  />
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-[#6B8E5A] ring-2 ring-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#3B2A1E] font-temple text-base">
                      {PLACEHOLDER_ASTROLOGER.displayName}
                    </h3>
                    <span className="rounded bg-[#6B8E5A]/20 px-2 py-0.5 text-[10px] font-bold text-[#6B8E5A] border border-[#6B8E5A]/30 font-temple">
                      LIVE 1-ON-1
                    </span>
                  </div>
                  <div className="text-xs text-[#7D6B5D] font-body">
                    Vedic Jyotish &bull; Client: {activeSession.userName} ({activeSession.type.toUpperCase()})
                  </div>
                </div>
              </div>

              {/* Session Duration Counter & Controls */}
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2 rounded-xl border border-[#E8A33D]/50 bg-[#FAF1E4] px-3.5 py-1.5 font-mono text-xs text-[#7B2D26]">
                  <Clock className="h-4 w-4 animate-pulse text-[#C1662F]" />
                  <span className="font-bold text-sm">
                    {Math.floor(sessionSeconds / 60).toString().padStart(2, "0")}:
                    {(sessionSeconds % 60).toString().padStart(2, "0")}
                  </span>
                  <span className="text-[10px] text-[#7D6B5D] font-sans">
                    (Session Elapsed)
                  </span>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-[#D4C3B3] bg-[#FFFDF9] px-3 py-1.5 text-xs">
                  <ShieldCheck className="h-4 w-4 text-[#6B8E5A]" />
                  <span className="font-bold text-[#3B2A1E]">Paid Session (Flat ₹1,051)</span>
                </div>

                <button
                  type="button"
                  onClick={handleEndSession}
                  className="rounded-xl bg-[#7B2D26] px-4 py-2 text-xs font-bold text-white hover:bg-[#64231D] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <PhoneOff className="h-4 w-4" />
                  <span>End Session</span>
                </button>
              </div>
            </div>

            {/* Main Consultation Room Body */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
              {/* Left Column: Client Kundli Summary & Audio/Video Bridge */}
              <div className="lg:col-span-4 border-r border-[#E8D8C3] p-6 flex flex-col justify-between bg-[#FAF5EE]">
                <div>
                  <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-4 mb-5 text-xs space-y-2 shadow-sm">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7B2D26] font-temple block">
                      Consultation Profile
                    </span>
                    <div className="flex justify-between text-[#6B5A4E]">
                      <span>Client:</span>
                      <strong className="text-[#3B2A1E]">{activeSession.userName}</strong>
                    </div>
                    <div className="flex justify-between text-[#6B5A4E]">
                      <span>Birth Time:</span>
                      <span>{activeSession.birthDetails.birthDate} ({activeSession.birthDetails.birthTime})</span>
                    </div>
                    <div className="flex justify-between text-[#6B5A4E]">
                      <span>Place:</span>
                      <span>{activeSession.birthDetails.birthPlace}</span>
                    </div>
                    <div className="border-t border-[#E8D8C3] pt-2 text-[#6B5A4E]">
                      <span className="text-[#7D6B5D] block mb-1">Primary Concern:</span>
                      <span className="text-[#7B2D26] italic">&ldquo;{activeSession.concern}&rdquo;</span>
                    </div>
                  </div>

                  {/* Audio/Video Call Control Panel */}
                  <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-4 text-center shadow-sm">
                    <div className="relative mx-auto mb-3 h-24 w-24 rounded-full border-2 border-[#E8A33D] p-1">
                      <img
                        src={PLACEHOLDER_ASTROLOGER.avatarUrl}
                        alt="Acharya Ji"
                        className="h-full w-full rounded-full object-cover"
                      />
                      <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-[#6B8E5A] ring-2 ring-white" />
                    </div>
                    <div className="text-xs font-bold text-[#3B2A1E] font-temple">Encrypted Vedic Bridge</div>
                    <div className="text-[11px] text-[#7D6B5D]">High-Definition Direct Connection</div>

                    <div className="mt-4 flex justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsMuted(!isMuted)}
                        className={`rounded-xl p-3 text-xs transition-all cursor-pointer ${
                          isMuted
                            ? "bg-rose-600 text-white"
                            : "border border-[#D4C3B3] bg-[#FAF5EE] text-[#3B2A1E] hover:bg-[#F3E7D3]"
                        }`}
                        title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
                      >
                        {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4 text-[#7B2D26]" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsVideoOff(!isVideoOff)}
                        className={`rounded-xl p-3 text-xs transition-all cursor-pointer ${
                          isVideoOff
                            ? "bg-rose-600 text-white"
                            : "border border-[#D4C3B3] bg-[#FAF5EE] text-[#3B2A1E] hover:bg-[#F3E7D3]"
                        }`}
                        title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
                      >
                        {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4 text-[#7B2D26]" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-center text-[11px] text-[#7D6B5D] mt-4 font-body">
                  100% Private &amp; Confidential &bull; Personal Guidance by Acharya Ji
                </div>
              </div>

              {/* Right Column: Live Interactive Chat Stream */}
              <div className="lg:col-span-8 p-6 flex flex-col justify-between bg-[#FFFDF9]">
                <div className="space-y-4 overflow-y-auto max-h-[420px] pr-2">
                  <div className="text-center">
                    <span className="rounded-full bg-[#FAF1E4] border border-[#E8D8C3] px-3.5 py-1 text-[10px] font-semibold text-[#7D6B5D]">
                      Live Session Established &bull; Full Vedic Reading in Progress
                    </span>
                  </div>

                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${m.sender === "client" ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-md rounded-2xl p-3.5 text-xs shadow-sm ${
                          m.sender === "client"
                            ? "bg-[#7B2D26] text-white rounded-br-none"
                            : "bg-[#FAF5EE] border border-[#E8D8C3] text-[#3B2A1E] rounded-bl-none"
                        }`}
                      >
                        <div className="text-[10px] opacity-75 font-semibold mb-1">
                          {m.sender === "client" ? "You" : PLACEHOLDER_ASTROLOGER.displayName} &bull; {m.timestamp}
                        </div>
                        <p className="leading-relaxed font-body">{m.text}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <form onSubmit={handleSendMessage} className="mt-4 flex gap-2 border-t border-[#E8D8C3] pt-4">
                  <input
                    type="text"
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    placeholder="Ask Acharya Ji anything regarding your chart, career, marriage..."
                    className="flex-1 rounded-xl border border-[#D4C3B3] bg-[#FAF5EE] px-4 py-3 text-xs text-[#3B2A1E] placeholder-[#7D6B5D] focus:border-[#7B2D26] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-[#7B2D26] p-3 text-white hover:bg-[#64231D] transition-all font-bold shrink-0 shadow-sm cursor-pointer"
                  >
                    <Send className="h-4 w-4 text-[#E8A33D]" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : myQueueItem ? (
          /* =========================================================================
             STATE 2: CURRENT USER IS WAITING IN LIVE QUEUE
          ========================================================================= */
          <div className="mx-auto max-w-2xl rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-8 text-center shadow-lg">
            <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#FAF1E4] text-[#7B2D26] border border-[#E8D8C3]">
              <Clock className="h-10 w-10 animate-spin text-[#C1662F]" />
            </div>

            <span className="rounded-full bg-[#FAF1E4] px-3.5 py-1 text-xs font-bold text-[#7B2D26] border border-[#E8D8C3] font-temple">
              BOOKING CONFIRMED &bull; IN QUEUE
            </span>

            <h2 className="text-3xl font-bold font-temple text-[#3B2A1E] mt-4">
              Your Position: <span className="text-[#7B2D26] font-mono">#{myQueuePosition} in Line</span>
            </h2>

            <p className="mt-2 text-sm text-[#6B5A4E] font-body">
              Estimated wait time: <strong className="text-[#7B2D26]">~{estimatedWaitMins} Minutes</strong>
            </p>

            <div className="mt-6 rounded-2xl border border-[#E8D8C3] bg-[#FAF5EE] p-5 text-xs text-[#6B5A4E] space-y-2 text-left max-w-lg mx-auto">
              <div className="flex justify-between">
                <span className="text-[#7D6B5D]">Client Name:</span>
                <span className="font-bold text-[#3B2A1E]">{myQueueItem.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7D6B5D]">Selected Format:</span>
                <span className="font-bold uppercase text-[#7B2D26]">{myQueueItem.consultationType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7D6B5D]">Consultation Fee:</span>
                <span className="font-bold text-[#6B8E5A]">Flat ₹1,051 Paid (Standard ₹2,100)</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => {
                  AstrologerStateStore.removeFromQueue(myQueueItem.id);
                  setMyQueueItem(null);
                }}
                className="rounded-xl border border-[#D4C3B3] bg-[#FAF5EE] px-5 py-2.5 text-xs font-semibold text-[#3B2A1E] hover:bg-[#F3E7D3] cursor-pointer"
              >
                Leave Queue
              </button>

              {isAstrologer && (
                <Link
                  href="/astrologer"
                  className="rounded-xl bg-[#7B2D26] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#64231D] shadow-md transition-all"
                >
                  Open Astrologer Cockpit (Simulate Accept)
                </Link>
              )}
            </div>

            <p className="mt-6 text-[11px] text-[#7D6B5D]">
              Please keep this page open. You will be connected automatically the moment Acharya Ji completes the preceding reading.
            </p>
          </div>
        ) : (
          /* =========================================================================
             STATE 3: GENERAL CONSULTATION LANDING & INTAKE FORM (FLAT ₹1,051 MODEL)
          ========================================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Astrologer Profile, Promotional Pricing & 5 Pillars */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-7 shadow-sm">
                {/* Real-time Status Card */}
                <div className="flex items-center justify-between border-b border-[#E8D8C3] pb-5">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={PLACEHOLDER_ASTROLOGER.avatarUrl}
                        alt={PLACEHOLDER_ASTROLOGER.displayName}
                        className="h-16 w-16 rounded-2xl object-cover border-2 border-[#E8A33D]"
                      />
                      {status === "AVAILABLE" && (
                        <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-[#6B8E5A] ring-2 ring-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold font-temple text-[#3B2A1E] text-lg">
                        {PLACEHOLDER_ASTROLOGER.displayName}
                      </h3>
                      <div className="text-xs text-[#C1662F] font-semibold">
                        {PLACEHOLDER_ASTROLOGER.experienceText}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-[#7D6B5D] mt-0.5 font-body">
                        <Star className="h-3.5 w-3.5 fill-[#E8A33D] text-[#E8A33D]" />
                        <span className="font-bold text-[#3B2A1E]">4.98</span>
                        <span>({PLACEHOLDER_ASTROLOGER.followersCount} Followers)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Callout Pill */}
                <div className="mt-5 rounded-2xl border border-[#E8D8C3] bg-[#FAF5EE] p-4">
                  <div className="flex items-center justify-between text-xs font-bold mb-2">
                    <span className="text-[#7D6B5D] uppercase tracking-wider text-[10px]">Real-Time Status</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        status === "AVAILABLE"
                          ? "bg-[#6B8E5A]/20 text-[#6B8E5A] border border-[#6B8E5A]/30"
                          : status === "BUSY"
                          ? "bg-[#E8A33D]/20 text-[#C1662F] border border-[#E8A33D]/30"
                          : "bg-slate-200 text-[#7D6B5D]"
                      }`}
                    >
                      {status === "AVAILABLE" ? "ONLINE (AVAILABLE)" : status === "BUSY" ? "IN CONSULTATION" : status}
                    </span>
                  </div>

                  <p className="text-xs text-[#6B5A4E] leading-relaxed font-body">
                    {status === "AVAILABLE" && `${PLACEHOLDER_ASTROLOGER.displayName} is at his desk and ready to connect right now.`}
                    {status === "BUSY" && `${PLACEHOLDER_ASTROLOGER.displayName} is currently reading a client chart. ${queue.length} in queue. Estimated wait: ~${(queue.length + 1) * 7} mins.`}
                    {status === "BREAK" && "Acharya Ji is on a brief tea/sadhana break. Resuming live sessions shortly."}
                    {status === "OFFLINE" && "Acharya Ji is offline. Pre-book an appointment slot below for tomorrow."}
                  </p>
                </div>

                {/* Promotional Flat Fee Callout Banner */}
                <div className="mt-5 rounded-2xl border border-[#E8A33D] bg-gradient-to-br from-[#FAF1E4] to-[#FFFDF9] p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#7B2D26] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white font-temple">
                      Promotional Offer
                    </span>
                    <span className="rounded-full bg-[#6B8E5A]/20 px-2 py-0.5 text-[11px] font-bold text-[#2A4720]">
                      50% Savings
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline gap-2.5">
                    <span className="font-temple text-3xl font-extrabold text-[#7B2D26]">₹1,051/-</span>
                    <span className="text-sm font-semibold text-[#7D6B5D] line-through">₹2,100</span>
                    <span className="text-xs font-semibold text-[#6B8E5A]">for first consultation</span>
                  </div>

                  <p className="mt-2 text-xs text-[#6E5545] leading-relaxed font-body">
                    A comprehensive 1-on-1 personal reading covering all your questions. Pay once per booking with zero surprise per-minute debits.
                  </p>
                </div>

                {/* 5 Core Pillars Covered */}
                <div className="mt-5 space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#7B2D26] font-temple block">
                    What This Consultation Covers:
                  </span>
                  <div className="space-y-2">
                    {FLAT_CONSULTATION_PRICING.includedTopics.map((topic, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-[#3B2A1E]">
                        <CheckCircle2 className="h-4 w-4 text-[#6B8E5A] shrink-0 mt-0.5" />
                        <span>{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pre-book Dedicated Appointment Slot Option */}
                <div className="mt-6 border-t border-[#E8D8C3] pt-5">
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#D4C3B3] bg-[#FAF5EE] py-3 text-xs font-bold text-[#3B2A1E] hover:bg-[#F3E7D3] transition-all shadow-sm cursor-pointer"
                  >
                    <Calendar className="h-4 w-4 text-[#C1662F]" />
                    <span>Prefer a Scheduled Time? Book Slot</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Intake Form & Unified Flat Fee Checkout */}
            <div className="lg:col-span-7 rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7B2D26] text-white font-bold">
                  <PhoneCall className="h-5 w-5 text-[#E8A33D]" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold font-temple text-[#7B2D26]">Book 1-on-1 Consultation</h3>
                  <p className="text-xs text-[#7D6B5D] font-body">
                    Direct access to {PLACEHOLDER_ASTROLOGER.displayName}. Select format, provide birth coordinates, and proceed.
                  </p>
                </div>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-5">
                {/* 1. Format Selection (Voice, Video, Live Chat) under Unified Flat Fee */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3B2A1E] mb-2 font-temple">
                    1. Choose Consultation Format (Unified Flat Fee)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setConsultFormat("Voice Call")}
                      className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                        consultFormat === "Voice Call"
                          ? "border-[#7B2D26] bg-[#FAF1E4] text-[#7B2D26] ring-1 ring-[#7B2D26]/30 shadow-sm"
                          : "border-[#D4C3B3] bg-[#FAF5EE] text-[#7D6B5D] hover:bg-[#F3E7D3]"
                      }`}
                    >
                      <PhoneCall className="h-5 w-5 mb-1.5 text-[#7B2D26]" />
                      <span className="text-xs font-bold">Voice Call</span>
                      <span className="text-[11px] font-mono mt-0.5 font-bold text-[#7B2D26]">
                        Flat ₹1,051
                      </span>
                      <span className="text-[9px] text-[#6B8E5A] font-bold">Reg. ₹2,100</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConsultFormat("Video Call")}
                      className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                        consultFormat === "Video Call"
                          ? "border-[#7B2D26] bg-[#FAF1E4] text-[#7B2D26] ring-1 ring-[#7B2D26]/30 shadow-sm"
                          : "border-[#D4C3B3] bg-[#FAF5EE] text-[#7D6B5D] hover:bg-[#F3E7D3]"
                      }`}
                    >
                      <Video className="h-5 w-5 mb-1.5 text-[#7B2D26]" />
                      <span className="text-xs font-bold">Video Call</span>
                      <span className="text-[11px] font-mono mt-0.5 font-bold text-[#7B2D26]">
                        Flat ₹1,051
                      </span>
                      <span className="text-[9px] text-[#6B8E5A] font-bold">Reg. ₹2,100</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConsultFormat("Live Chat")}
                      className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                        consultFormat === "Live Chat"
                          ? "border-[#7B2D26] bg-[#FAF1E4] text-[#7B2D26] ring-1 ring-[#7B2D26]/30 shadow-sm"
                          : "border-[#D4C3B3] bg-[#FAF5EE] text-[#7D6B5D] hover:bg-[#F3E7D3]"
                      }`}
                    >
                      <MessageSquare className="h-5 w-5 mb-1.5 text-[#7B2D26]" />
                      <span className="text-xs font-bold">Live Chat</span>
                      <span className="text-[11px] font-mono mt-0.5 font-bold text-[#7B2D26]">
                        Flat ₹1,051
                      </span>
                      <span className="text-[9px] text-[#6B8E5A] font-bold">Reg. ₹2,100</span>
                    </button>
                  </div>
                </div>

                {/* 2. Client Details (Name & Phone) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#3B2A1E] mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Verma"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full rounded-xl border border-[#D4C3B3] bg-[#FAF5EE] px-3.5 py-2.5 text-xs text-[#3B2A1E] focus:border-[#7B2D26] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#3B2A1E] mb-1">Mobile (for SMS &amp; Session Alert)</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      className="w-full rounded-xl border border-[#D4C3B3] bg-[#FAF5EE] px-3.5 py-2.5 text-xs text-[#3B2A1E] focus:border-[#7B2D26] focus:outline-none"
                    />
                  </div>
                </div>

                {/* 3. Birth Coordinates for Vedic Horoscope Calculation */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3B2A1E] mb-2 font-temple">
                    2. Birth Details for Precise Chart Reading
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#6E5545] mb-1">Birth Date</label>
                      <input
                        type="date"
                        required
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="w-full rounded-xl border border-[#D4C3B3] bg-[#FAF5EE] px-3 py-2 text-xs text-[#3B2A1E] focus:border-[#7B2D26] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#6E5545] mb-1">Birth Time</label>
                      <input
                        type="time"
                        required
                        value={birthTime}
                        onChange={(e) => setBirthTime(e.target.value)}
                        className="w-full rounded-xl border border-[#D4C3B3] bg-[#FAF5EE] px-3 py-2 text-xs text-[#3B2A1E] focus:border-[#7B2D26] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#6E5545] mb-1">Birth City / Town</label>
                      <input
                        type="text"
                        required
                        value={birthPlace}
                        onChange={(e) => setBirthPlace(e.target.value)}
                        placeholder="e.g. New Delhi, Delhi"
                        className="w-full rounded-xl border border-[#D4C3B3] bg-[#FAF5EE] px-3 py-2 text-xs text-[#3B2A1E] focus:border-[#7B2D26] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Primary Questions / Concern */}
                <div>
                  <label className="block text-xs font-semibold text-[#3B2A1E] mb-1">
                    What would you like to ask Acharya Ji?
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={concern}
                    onChange={(e) => setConcern(e.target.value)}
                    placeholder="e.g. Career dilemma, job switch timing, marital compatibility, financial growth..."
                    className="w-full rounded-xl border border-[#D4C3B3] bg-[#FAF5EE] px-3.5 py-2.5 text-xs text-[#3B2A1E] placeholder-[#7D6B5D] focus:border-[#7B2D26] focus:outline-none leading-relaxed font-body"
                  />
                </div>

                {/* 5. Order Summary & Direct Pay-Per-Booking Card */}
                <div className="rounded-2xl border border-[#E8D8C3] bg-[#FAF5EE] p-5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-[#6B5A4E]">
                    <span>Standard Consultation Fee:</span>
                    <span className="font-semibold line-through">₹{standardFee}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#6B8E5A]">
                    <span>First Consultation Special Discount (50% Off):</span>
                    <span className="font-bold">-₹{discountAmount}</span>
                  </div>
                  <div className="border-t border-[#E8D8C3] pt-2 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-[#3B2A1E] font-temple">Net Amount Payable:</span>
                      <span className="block text-[10px] text-[#7D6B5D]">Inclusive of statutory taxes &bull; Single upfront payment</span>
                    </div>
                    <span className="font-temple text-2xl font-black text-[#7B2D26]">₹{promoFee}/-</span>
                  </div>
                </div>

                {/* Submit & Pay Action */}
                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="w-full rounded-xl bg-[#7B2D26] py-4 font-bold text-white shadow-md hover:bg-[#64231D] active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-75"
                >
                  <CreditCard className="h-4 w-4 text-[#E8A33D]" />
                  <span>
                    {isProcessingPayment
                      ? "Initiating Booking..."
                      : `Proceed to Pay ₹${promoFee} & Start Consultation`}
                  </span>
                </button>

                <div className="flex items-center justify-center gap-4 text-[11px] text-[#7D6B5D]">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#6B8E5A]" />
                    <span>PCI-DSS Secure Razorpay Checkout</span>
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Lock className="h-3.5 w-3.5 text-[#7B2D26]" />
                    <span>100% Confidential</span>
                  </span>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Schedule Appointment Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3B2A1E]/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#E8D8C3] pb-4 mb-4">
                <h3 className="font-bold font-temple text-[#7B2D26] text-base">Schedule Consultation Slot</h3>
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="text-[#7D6B5D] hover:text-[#3B2A1E] text-lg font-bold cursor-pointer"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleBookAppointment} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#3B2A1E] font-semibold mb-1">Select Date</label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full rounded-xl border border-[#D4C3B3] bg-[#FAF5EE] p-2.5 text-[#3B2A1E]"
                  />
                </div>

                <div>
                  <label className="block text-[#3B2A1E] font-semibold mb-1">Available Time Slot</label>
                  <select
                    value={scheduledSlot}
                    onChange={(e) => setScheduledSlot(e.target.value)}
                    className="w-full rounded-xl border border-[#D4C3B3] bg-[#FAF5EE] p-2.5 text-[#3B2A1E]"
                  >
                    <option value="11:00 AM - 11:45 AM">11:00 AM - 11:45 AM IST</option>
                    <option value="03:00 PM - 03:45 PM">03:00 PM - 03:45 PM IST</option>
                    <option value="05:30 PM - 06:15 PM">05:30 PM - 06:15 PM IST</option>
                    <option value="07:30 PM - 08:15 PM">07:30 PM - 08:15 PM IST</option>
                  </select>
                </div>

                <div className="rounded-xl border border-[#E8D8C3] bg-[#FAF5EE] p-3 space-y-1">
                  <div className="flex justify-between text-[#6B5A4E]">
                    <span>Dedicated 1-on-1 Consultation:</span>
                    <strong className="text-[#7B2D26] font-bold">Flat ₹1,051/-</strong>
                  </div>
                  <span className="text-[10px] text-[#7D6B5D] block">Includes personal reading, birth chart analysis, and practical remedies.</span>
                </div>

                <button
                  type="submit"
                  disabled={scheduleSuccess}
                  className="w-full rounded-xl bg-[#7B2D26] py-3 font-bold text-white hover:bg-[#64231D] transition-all shadow-sm cursor-pointer"
                >
                  {scheduleSuccess ? "Booking Confirmed..." : "Confirm & Pay ₹1,051 via UPI / Card"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
