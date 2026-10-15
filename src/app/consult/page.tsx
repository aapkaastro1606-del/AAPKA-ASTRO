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
  Award,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Lock,
  ArrowRight,
  User,
  MapPin,
  Home,
  Compass,
  FileCheck,
  MessageCircle,
} from "lucide-react";
import {
  PLACEHOLDER_ASTROLOGER,
  PLACEHOLDER_CONTACT_INFO,
  CONSULTATION_PRODUCTS,
  FLAT_CONSULTATION_PRICING,
} from "@/config/placeholderContent";
import {
  ConsultationBookingService,
  ConsultationBooking,
} from "@/lib/services/consultationBilling";
import { BookingEmailService } from "@/lib/services/bookingEmailService";
import { ClientAccountStore } from "@/lib/store/clientAccountStore";
import { useCurrentUserRole } from "@/lib/auth/roleContext";
import { useUser } from "@/components/auth/ClerkAuthWrapper";
import { ConsultationServicesJsonLd } from "@/components/seo/JsonLd";
import { ConsultationConfirmationScreen } from "@/components/consult/ConsultationConfirmationScreen";
import { UpiQrModal } from "@/components/consult/UpiQrModal";

export default function ConsultPage() {
  const { isAstrologer } = useCurrentUserRole();
  const { user } = useUser();

  // Consultation Product Selection ("astro" | "vaastu")
  const [selectedProduct, setSelectedProduct] = useState<"astro" | "vaastu">("astro");

  // Live Astrologer & Queue State
  const [status, setStatus] = useState<AstrologerStatus>("AVAILABLE");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);

  // Common Client Intake State
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [consultFormat, setConsultFormat] = useState<"Voice Call" | "Video Call" | "Live Chat">("Voice Call");

  // Astro Product Specific State
  const [birthDate, setBirthDate] = useState("1995-10-24");
  const [birthTime, setBirthTime] = useState("14:35");
  const [birthPlace, setBirthPlace] = useState("New Delhi, Delhi");
  const [concern, setConcern] = useState("Career growth, job switch timing, and financial stability");

  // Vaastu Product Specific State
  const [propertyType, setPropertyType] = useState("Residential Apartment / Villa");
  const [propertyCity, setPropertyCity] = useState("New Delhi, Delhi");
  const [vaastuConcern, setVaastuConcern] = useState("Main entrance direction, kitchen & bedroom placement, and spatial energy alignment");

  // Booking & Payment State
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<ConsultationBooking | null>(() =>
    ClientAccountStore.getActiveBooking()
  );
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiBookingInfo, setUpiBookingInfo] = useState<{
    bookingId: string;
    amount: number;
    serviceName: string;
  } | null>(null);

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

  // Read URL query params on mount to select product
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const prod = searchParams.get("product");
      if (prod === "vaastu") {
        setSelectedProduct("vaastu");
      } else if (prod === "astro") {
        setSelectedProduct("astro");
      }
    }
  }, []);

  // Pricing calculations
  const productConfig = CONSULTATION_PRODUCTS[selectedProduct];
  const isAstro = selectedProduct === "astro";
  const standardFee = productConfig.standardPrice;
  const promoFee = productConfig.promoPrice;
  const discountAmount = standardFee - promoFee;

  const syncAll = () => {
    const currentStatus = AstrologerStateStore.getStatus();
    const currentQueue = AstrologerStateStore.getQueue();
    const currentSession = AstrologerStateStore.getActiveSession();
    const currentActiveBooking = ClientAccountStore.getActiveBooking();

    setStatus(currentStatus);
    setQueue(currentQueue);
    setActiveSession(currentSession);
    if (currentActiveBooking && !confirmedBooking) {
      setConfirmedBooking(currentActiveBooking);
    }

    if (currentSession) {
      setMessages(AstrologerStateStore.getMessages(currentSession.id));
    }
  };

  useEffect(() => {
    syncAll();
    window.addEventListener("astro_state_changed", syncAll);
    window.addEventListener("aapka_booking_updated", syncAll);
    const interval = setInterval(syncAll, 2000);
    return () => {
      window.removeEventListener("astro_state_changed", syncAll);
      window.removeEventListener("aapka_booking_updated", syncAll);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (user?.fullName && !userName) {
      setUserName(user.fullName);
    }
    if (user?.primaryEmailAddress?.emailAddress && !userEmail) {
      setUserEmail(user.primaryEmailAddress.emailAddress);
    }
  }, [user, userName, userEmail]);

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

  // Handle Direct Commission-Free UPI QR Booking Workflow
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName.trim() || !userPhone.trim()) {
      alert("Please provide your name and contact phone number to proceed.");
      return;
    }

    setIsProcessingPayment(true);

    try {
      const topicText = isAstro ? concern : `${propertyType} in ${propertyCity}: ${vaastuConcern}`;

      // 1. Create booking in Neon PostgreSQL database
      const res = await fetch("/api/consultation/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          clientName: userName,
          clientPhone: userPhone,
          clientEmail: userEmail || user?.primaryEmailAddress?.emailAddress,
          productId: selectedProduct,
          format: consultFormat,
          concern: topicText,
          birthDetails: isAstro
            ? { birthDate, birthTime, birthPlace }
            : undefined,
          propertyDetails: !isAstro
            ? { propertyType, propertyCity, vaastuConcern }
            : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create consultation booking");
      }

      const bookingRef = data.bookingId;
      const chargedAmount = data.amount;

      // 2. Register local booking records for immediate optimistic UI
      const booking = ConsultationBookingService.createBooking({
        userId: user?.id || `user_${Date.now()}`,
        clientName: userName,
        phone: userPhone,
        productId: selectedProduct,
        format: consultFormat,
        topic: topicText,
        preferredSlot: "Direct WhatsApp / Google Meet Coordination",
        dateOfBirth: isAstro ? birthDate : undefined,
        timeOfBirth: isAstro ? birthTime : undefined,
        placeOfBirth: isAstro ? birthPlace : undefined,
        propertyType: !isAstro ? propertyType : undefined,
        propertyLocation: !isAstro ? propertyCity : undefined,
        isFirstTime: isAstro,
      });

      booking.bookingId = bookingRef;
      booking.status = "CONFIRMED";
      booking.orderId = bookingRef;
      booking.confirmedAt = new Date().toISOString();

      AstrologerStateStore.addConfirmedBooking({
        id: `bk-${Date.now()}`,
        bookingId: bookingRef,
        userId: user?.id || `user_${Date.now()}`,
        userName,
        userPhone,
        userEmail: userEmail || user?.primaryEmailAddress?.emailAddress || "",
        productId: selectedProduct,
        productName: data.serviceName,
        format: consultFormat,
        concern: topicText,
        amountPaid: chargedAmount,
        paymentStatus: "AWAITING_VERIFICATION",
        bookingState: "CONFIRMED",
        bookedAt: new Date().toISOString(),
        preferredSlot: "Immediate Next Window",
      });

      ClientAccountStore.setActiveBooking(booking);

      setUpiBookingInfo({
        bookingId: bookingRef,
        amount: chargedAmount,
        serviceName: data.serviceName,
      });
      setShowUpiModal(true);
      setIsProcessingPayment(false);
    } catch (err: any) {
      console.error("Booking error:", err);
      setIsProcessingPayment(false);
      const msg = err.message || "Encountered an issue processing booking. Please try again.";
      if (msg.includes("already have an active Astro consultation booking")) {
        if (
          confirm(
            `${msg}\n\nWould you like to open your active consultation now to complete payment or cancel it?`
          )
        ) {
          window.location.href = "/account/consult";
          return;
        }
      } else {
        alert(msg);
      }
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
      ClientAccountStore.setActiveBooking(null);
      setConfirmedBooking(null);
    }
  };

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleSuccess(true);
    setTimeout(() => {
      setShowScheduleModal(false);
      setScheduleSuccess(false);
      alert(
        `Consultation confirmed for ${scheduledDate} at ${scheduledSlot}! Confirmation receipt and meeting bridge link sent to ${userPhone}.`
      );
    }, 1200);
  };

  const myQueuePosition = myQueueItem
    ? queue.findIndex((q) => q.id === myQueueItem.id) + 1
    : queue.length > 0
    ? queue.length
    : 1;
  const estimatedWaitMins = myQueuePosition * 7;

  return (
    <div className="bg-[#FBF3E7] py-8 lg:py-12 min-h-screen text-[#3B2A1E]">
      <ConsultationServicesJsonLd />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* =========================================================================
            STATE 1: POST-PAYMENT HANDOFF CONFIRMATION SCREEN
            (Shown immediately upon booking confirmation for Astro or Vaastu)
        ========================================================================= */}
        {confirmedBooking ? (
          <ConsultationConfirmationScreen
            booking={confirmedBooking}
            onReset={() => {
              setConfirmedBooking(null);
              ClientAccountStore.setActiveBooking(null);
            }}
          />
        ) : (
          /* =========================================================================
             STATE 3: GENERAL CONSULTATION LANDING & INTAKE FORM (TWO PRODUCTS)
          ========================================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Astrologer Profile, Product Info & Pillars */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-7 shadow-sm">
                {/* Real-time Astrologer Status Card */}
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
                      <div className="flex items-center gap-1.5 text-[11px] text-[#7D6B5D] mt-0.5 font-body">
                        <Award className="h-3.5 w-3.5 text-[#C1662F]" />
                        <span className="font-semibold text-[#3B2A1E]">15,000+ Natal Charts Analyzed</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Callout Pill */}
                <div className="mt-5 rounded-2xl border border-[#E8D8C3] bg-[#FAF5EE] p-4">
                  <div className="flex items-center justify-between text-xs font-bold mb-2">
                    <span className="text-[#7D6B5D] uppercase tracking-wider text-[10px]">Real-Time Desk Presence</span>
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
                    {status === "AVAILABLE" && `${PLACEHOLDER_ASTROLOGER.displayName} is currently online at his sanctum desk. High likelihood of immediate WhatsApp call / Google Meet connection upon booking.`}
                    {status === "BUSY" && `${PLACEHOLDER_ASTROLOGER.displayName} is currently reading a client chart. New bookings are received and coordinated for the immediate next window.`}
                    {status === "BREAK" && "Acharya Ji is on a brief tea/sadhana break. WhatsApp sanctum desk remains open for booking coordination."}
                    {status === "OFFLINE" && "Acharya Ji is offline for sacred rituals. Book now to hold your priority consultation slot for tomorrow."}
                  </p>
                </div>

                {/* Promotional Banner (Astro vs Vaastu) */}
                {isAstro ? (
                  <div className="mt-5 rounded-2xl border border-[#E8A33D] bg-gradient-to-br from-[#FAF1E4] to-[#FFFDF9] p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-[#7B2D26] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white font-temple">
                        First Consultation Offer
                      </span>
                      <span className="rounded-full bg-[#6B8E5A]/20 px-2 py-0.5 text-[11px] font-bold text-[#2A4720]">
                        50% Savings
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-baseline gap-2.5">
                      <div className="inline-flex items-baseline gap-1.5 bg-red-50 border border-red-200/80 px-2.5 py-1 rounded-xl">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-800">Regular:</span>
                        <span className="font-temple text-2xl sm:text-3xl font-black text-red-700 line-through decoration-red-600 decoration-2">₹2,100</span>
                      </div>
                      <div className="inline-flex items-baseline gap-1">
                        <span className="text-xs font-bold text-[#7B2D26] uppercase">Now:</span>
                        <span className="font-temple text-2xl sm:text-3xl font-black text-[#7B2D26]">₹1,051/-</span>
                      </div>
                      <span className="text-xs font-bold text-[#2A4720] bg-[#6B8E5A]/20 px-2 py-0.5 rounded-full">50% Off First Booking</span>
                    </div>

                    <p className="mt-2 text-xs text-[#6E5545] leading-relaxed font-body">
                      A comprehensive 1-on-1 personal reading covering all your questions. Pay once per booking with zero surprise per-minute debits.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-[#C1662F] bg-gradient-to-br from-[#FAF1E4] to-[#FFFDF9] p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-[#7B2D26] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white font-temple">
                        Devta Vaastu Consultation
                      </span>
                      <span className="rounded-full bg-[#6B8E5A]/20 px-2 py-0.5 text-[11px] font-bold text-[#2A4720]">
                        Flat ₹10,000 Off
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-baseline gap-2.5">
                      <div className="inline-flex items-baseline gap-1.5 bg-red-50 border border-red-200/80 px-2.5 py-1 rounded-xl">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-800">Regular:</span>
                        <span className="font-temple text-2xl sm:text-3xl font-black text-red-700 line-through decoration-red-600 decoration-2">₹25,000</span>
                      </div>
                      <div className="inline-flex items-baseline gap-1">
                        <span className="text-xs font-bold text-[#7B2D26] uppercase">Now:</span>
                        <span className="font-temple text-2xl sm:text-3xl font-black text-[#7B2D26]">₹15,000/-</span>
                      </div>
                      <span className="text-xs font-bold text-[#2A4720] bg-[#6B8E5A]/20 px-2 py-0.5 rounded-full">Flat ₹10,000 Savings</span>
                    </div>

                    <p className="mt-2 text-xs text-[#6E5545] leading-relaxed font-body">
                      Authentic Devta Vaastu spatial analysis for residence, office, or industrial site. Complete 16-zone review with non-demolition remedies.
                    </p>
                  </div>
                )}

                {/* Deliverables / Covered Topics */}
                <div className="mt-5 space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#7B2D26] font-temple block">
                    {isAstro ? "What This Astro Reading Covers:" : "What This Vaastu Audit Covers:"}
                  </span>
                  <div className="space-y-2">
                    {productConfig.deliverables.map((topic, idx) => (
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
              {/* Product Selector Tabs */}
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3B2A1E] mb-2 font-temple">
                  Select Consultation Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedProduct("astro")}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedProduct === "astro"
                        ? "border-[#7B2D26] bg-[#FAF1E4] ring-2 ring-[#7B2D26]/20 shadow-sm"
                        : "border-[#D4C3B3] bg-[#FAF5EE] hover:bg-[#F3E7D3]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-temple font-bold text-sm text-[#7B2D26]">Astro Consultation</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7B2D26] text-white">
                        50% OFF
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-temple font-black text-xl text-red-700 line-through decoration-red-600 decoration-2">₹2,100</span>
                      <span className="font-temple font-black text-lg text-[#7B2D26]">Now ₹1,051</span>
                    </div>
                    <span className="text-[10px] text-[#6E5545] block mt-1">
                      Personal Horoscope &amp; Kundli Guidance
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedProduct("vaastu")}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedProduct === "vaastu"
                        ? "border-[#7B2D26] bg-[#FAF1E4] ring-2 ring-[#7B2D26]/20 shadow-sm"
                        : "border-[#D4C3B3] bg-[#FAF5EE] hover:bg-[#F3E7D3]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-temple font-bold text-sm text-[#7B2D26]">Vaastu Consultation</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#6B8E5A] text-white">
                        ₹10,000 OFF
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-temple font-black text-xl text-red-700 line-through decoration-red-600 decoration-2">₹25,000</span>
                      <span className="font-temple font-black text-lg text-[#7B2D26]">Now ₹15,000</span>
                    </div>
                    <span className="text-[10px] text-[#6E5545] block mt-1">
                      Home, Office &amp; Site Energy Audit
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7B2D26] text-white font-bold">
                  {isAstro ? <PhoneCall className="h-5 w-5 text-[#E8A33D]" /> : <Compass className="h-5 w-5 text-[#E8A33D]" />}
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold font-temple text-[#7B2D26]">
                    Book {productConfig.name}
                  </h3>
                  <p className="text-xs text-[#7D6B5D] font-body">
                    Direct access to {PLACEHOLDER_ASTROLOGER.displayName}. Provide intake details and proceed to secure checkout.
                  </p>
                </div>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-5">
                {/* 1. Format Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3B2A1E] mb-2 font-temple">
                    1. Choose Consultation Format
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
                      <span className="text-[10px] text-[#6E5545] mt-0.5">Direct WhatsApp Audio</span>
                      <div className="mt-1 flex items-center justify-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-red-700 line-through decoration-red-600 decoration-2">
                          ₹{standardFee.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-[#7B2D26] bg-[#7B2D26]/10 px-1.5 py-0.5 rounded">
                          Now ₹{promoFee.toLocaleString("en-IN")}
                        </span>
                      </div>
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
                      <span className="text-xs font-bold">
                        {isAstro ? "Video Call" : "Video (Layout Review)"}
                      </span>
                      <span className="text-[10px] text-[#6E5545] mt-0.5">Google Meet / Video</span>
                      <div className="mt-1 flex items-center justify-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-red-700 line-through decoration-red-600 decoration-2">
                          ₹{standardFee.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-[#7B2D26] bg-[#7B2D26]/10 px-1.5 py-0.5 rounded">
                          Now ₹{promoFee.toLocaleString("en-IN")}
                        </span>
                      </div>
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
                      <span className="text-xs font-bold">
                        {isAstro ? "Live Chat" : "Audit Report Consultation"}
                      </span>
                      <span className="text-[10px] text-[#6E5545] mt-0.5">WhatsApp / Client Desk</span>
                      <div className="mt-1 flex items-center justify-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-red-700 line-through decoration-red-600 decoration-2">
                          ₹{standardFee.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-[#7B2D26] bg-[#7B2D26]/10 px-1.5 py-0.5 rounded">
                          Now ₹{promoFee.toLocaleString("en-IN")}
                        </span>
                      </div>
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
                    <label className="block text-xs font-semibold text-[#3B2A1E] mb-1">
                      WhatsApp &amp; Mobile Number (for Call / Google Meet Link)
                    </label>
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

                <div>
                  <label className="block text-xs font-semibold text-[#3B2A1E] mb-1">
                    Email Address (for Booking Confirmation Receipt &amp; WhatsApp Coordination Link)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. rahul@example.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full rounded-xl border border-[#D4C3B3] bg-[#FAF5EE] px-3.5 py-2.5 text-xs text-[#3B2A1E] focus:border-[#7B2D26] focus:outline-none"
                  />
                </div>

                {/* 3. Dynamic Section: Birth Coordinates (for Astro) OR Property Details (for Vaastu) */}
                {isAstro ? (
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
                ) : (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3B2A1E] mb-2 font-temple">
                      2. Property Space &amp; Location Details
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#6E5545] mb-1">Property Type</label>
                        <select
                          value={propertyType}
                          onChange={(e) => setPropertyType(e.target.value)}
                          className="w-full rounded-xl border border-[#D4C3B3] bg-[#FAF5EE] px-3 py-2 text-xs text-[#3B2A1E] focus:border-[#7B2D26] focus:outline-none"
                        >
                          <option value="Residential Apartment / Flat">Residential Apartment / Flat</option>
                          <option value="Independent Villa / Bungalow / Kothi">Independent Villa / Bungalow / Kothi</option>
                          <option value="Commercial Office / Corporate Suite">Commercial Office / Corporate Suite</option>
                          <option value="Retail Shop / Showroom / Restaurant">Retail Shop / Showroom / Restaurant</option>
                          <option value="Industrial Factory / Warehouse / Plant">Industrial Factory / Warehouse / Plant</option>
                          <option value="Open Residential / Commercial Plot">Open Residential / Commercial Plot</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#6E5545] mb-1">Property City &amp; State</label>
                        <input
                          type="text"
                          required
                          value={propertyCity}
                          onChange={(e) => setPropertyCity(e.target.value)}
                          placeholder="e.g. Gurugram, Haryana"
                          className="w-full rounded-xl border border-[#D4C3B3] bg-[#FAF5EE] px-3 py-2 text-xs text-[#3B2A1E] focus:border-[#7B2D26] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Primary Questions / Concern */}
                <div>
                  <label className="block text-xs font-semibold text-[#3B2A1E] mb-1">
                    {isAstro ? "What would you like to ask Acharya Ji?" : "Describe Your Space or Vaastu Dilemma"}
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={isAstro ? concern : vaastuConcern}
                    onChange={(e) => (isAstro ? setConcern(e.target.value) : setVaastuConcern(e.target.value))}
                    placeholder={
                      isAstro
                        ? "e.g. Career dilemma, job switch timing, marital compatibility, financial growth..."
                        : "e.g. Main entrance facing south-west, kitchen in north-east, stagnant cashflow, sleep disturbance in master bedroom..."
                    }
                    className="w-full rounded-xl border border-[#D4C3B3] bg-[#FAF5EE] px-3.5 py-2.5 text-xs text-[#3B2A1E] placeholder-[#7D6B5D] focus:border-[#7B2D26] focus:outline-none leading-relaxed font-body"
                  />
                </div>

                {/* 5. Order Summary & Direct Pay-Per-Booking Card */}
                <div className="rounded-2xl border border-[#E8D8C3] bg-[#FAF5EE] p-5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-[#6B5A4E]">
                    <span>Standard Consultation Fee:</span>
                    <span className="font-semibold line-through">₹{standardFee.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#6B8E5A]">
                    <span>
                      {isAstro
                        ? "First Consultation Special Discount (50% Off):"
                        : "Vaastu Standing Promotional Discount:"}
                    </span>
                    <span className="font-bold">-₹{discountAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="border-t border-[#E8D8C3] pt-2 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-[#3B2A1E] font-temple">Net Amount Payable:</span>
                      <span className="block text-[10px] text-[#7D6B5D]">
                        Inclusive of statutory taxes &bull; Single upfront payment (No per-minute billing)
                      </span>
                    </div>
                    <span className="font-temple text-2xl font-black text-[#7B2D26]">
                      ₹{promoFee.toLocaleString("en-IN")}/-
                    </span>
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
                    {isProcessingPayment ? (
                      "Initiating Booking..."
                    ) : (
                      <span className="flex items-center gap-1.5 flex-wrap justify-center">
                        <span className="line-through text-red-200/90 text-xs sm:text-sm font-bold decoration-red-300">
                          ₹{standardFee.toLocaleString("en-IN")}
                        </span>
                        <span>Proceed to Pay ₹{promoFee.toLocaleString("en-IN")} &amp; Start Consultation</span>
                      </span>
                    )}
                  </span>
                </button>

                <div className="flex items-center justify-center gap-4 text-[11px] text-[#7D6B5D]">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#6B8E5A]" />
                    <span>100% Direct Secure UPI Payment</span>
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
                  <label className="block text-[#3B2A1E] font-semibold mb-1">Consultation Service</label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value as "astro" | "vaastu")}
                    className="w-full rounded-xl border border-[#D4C3B3] bg-[#FAF5EE] p-2.5 text-[#3B2A1E]"
                  >
                    <option value="astro">Astro Consultation (Regular ₹2,100 ➔ Now Flat ₹1,051)</option>
                    <option value="vaastu">Vaastu Consultation (Regular ₹25,000 ➔ Now Flat ₹15,000)</option>
                  </select>
                </div>

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
                  <div className="flex justify-between items-center text-[#6B5A4E]">
                    <span>Dedicated 1-on-1 Consultation:</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-black text-red-700 line-through decoration-red-600">
                        ₹{standardFee.toLocaleString("en-IN")}
                      </span>
                      <strong className="text-[#7B2D26] font-bold text-sm">
                        Now Flat ₹{promoFee.toLocaleString("en-IN")}/-
                      </strong>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#7D6B5D] block">
                    {isAstro
                      ? "Includes personal chart reading, birth chart analysis, and practical remedies."
                      : "Includes complete 16-zone spatial energy audit with zero-demolition remedies."}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={scheduleSuccess}
                  className="w-full rounded-xl bg-[#7B2D26] py-3 font-bold text-white hover:bg-[#64231D] transition-all shadow-sm cursor-pointer"
                >
                  {scheduleSuccess ? "Booking Confirmed..." : `Confirm & Pay ₹${promoFee.toLocaleString("en-IN")} via UPI QR`}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Direct UPI QR Payment Modal */}
        {upiBookingInfo && (
          <UpiQrModal
            isOpen={showUpiModal}
            onClose={() => {
              setShowUpiModal(false);
              const active = ClientAccountStore.getActiveBooking();
              if (active) setConfirmedBooking(active);
            }}
            bookingId={upiBookingInfo.bookingId}
            amount={upiBookingInfo.amount}
            productType={selectedProduct}
            serviceName={upiBookingInfo.serviceName}
            clientName={userName}
            clientPhone={userPhone}
            onPaymentSubmitted={() => {
              const active = ClientAccountStore.getActiveBooking();
              if (active) setConfirmedBooking(active);
            }}
          />
        )}
      </div>
    </div>
  );
}
