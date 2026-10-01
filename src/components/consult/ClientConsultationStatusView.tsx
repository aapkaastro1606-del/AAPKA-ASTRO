"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Sparkles,
  MessageCircle,
  FileText,
  PhoneCall,
  Calendar,
  ShieldCheck,
  Star,
  Download,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { ConsultationBooking } from "@/lib/services/consultationBilling";
import { ClientAccountStore } from "@/lib/store/clientAccountStore";
import { AstrologerStateStore, AstrologerStatus } from "@/lib/store/astrologerStore";
import { PLACEHOLDER_ASTROLOGER } from "@/config/placeholderContent";
import { BookingEmailService } from "@/lib/services/bookingEmailService";

export type BookingDisplayState = "CONFIRMED" | "AWAITING_SESSION" | "COMPLETED";

interface ClientConsultationStatusViewProps {
  booking?: ConsultationBooking | null;
  onBookNew?: () => void;
}

export const ClientConsultationStatusView: React.FC<ClientConsultationStatusViewProps> = ({
  booking: propBooking,
  onBookNew,
}) => {
  const [activeBooking, setActiveBooking] = useState<ConsultationBooking | null>(
    () => propBooking || ClientAccountStore.getActiveBooking()
  );
  const [astrologerStatus, setAstrologerStatus] = useState<AstrologerStatus>("AVAILABLE");

  useEffect(() => {
    setAstrologerStatus(AstrologerStateStore.getStatus());
    const sync = () => {
      setAstrologerStatus(AstrologerStateStore.getStatus());
      if (!propBooking) {
        setActiveBooking(ClientAccountStore.getActiveBooking());
      }
    };
    window.addEventListener("astro_state_changed", sync);
    window.addEventListener("aapka_booking_updated", sync);
    return () => {
      window.removeEventListener("astro_state_changed", sync);
      window.removeEventListener("aapka_booking_updated", sync);
    };
  }, [propBooking]);

  const booking = propBooking || activeBooking;

  // Determine current lifecycle step (1: Confirmed, 2: Awaiting Session, 3: Completed)
  let currentState: BookingDisplayState = "CONFIRMED";
  if (booking) {
    if (booking.status === "COMPLETED") {
      currentState = "COMPLETED";
    } else if ((booking.status as string) === "AWAITING_SESSION" || booking.status === "IN_SESSION") {
      currentState = "AWAITING_SESSION";
    } else {
      currentState = "CONFIRMED";
    }
  }

  const whatsappCoordinationUrl = booking
    ? BookingEmailService.getWhatsAppCoordinationLink({
        bookingId: booking.bookingId,
        clientName: booking.clientName,
        productName: booking.productName,
      })
    : "https://wa.me/919311215564";

  // Fallback if no booking exists in storage
  if (!booking) {
    return (
      <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FBF3E7] text-[#7B2D26] border border-[#E8D8C3]">
          <Clock className="h-8 w-8 text-[#C1662F]" />
        </div>
        <h3 className="font-temple text-xl font-bold text-[#7B2D26]">No Active Consultation Booking</h3>
        <p className="text-xs sm:text-sm text-[#6E5545] mt-2 max-w-md mx-auto leading-relaxed">
          You do not have any pending consultation sessions. Book an Astro Consultation (Flat ₹1,051) or Vaastu Consultation (Flat ₹15,000) to connect directly with Acharya Niraj Kumar.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/consult"
            className="w-full sm:w-auto rounded-xl bg-[#7B2D26] px-6 py-3 text-xs font-bold text-white hover:bg-[#64221C] transition-all shadow-md text-center"
          >
            Book Astro Consultation (₹1,051)
          </Link>
          <a
            href="https://wa.me/919311215564"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto rounded-xl border border-[#E8D8C3] bg-[#FAF5EE] px-5 py-3 text-xs font-bold text-[#3B2A1E] hover:bg-[#E8D8C3] transition-all text-center flex items-center justify-center gap-1.5"
          >
            <MessageCircle className="h-4 w-4 text-[#25D366]" />
            <span>Chat on WhatsApp (+91 93112 15564)</span>
          </a>
        </div>
      </div>
    );
  }

  const isVaastu = booking.productId === "vaastu";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Main Status Container */}
      <div className="rounded-3xl border-2 border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-md">
        {/* Top Header Strip: Ref ID & Astrologer Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8D8C3]">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#7B2D26] bg-[#FBF3E7] px-2.5 py-1 rounded-md border border-[#E8D8C3]">
                {booking.bookingId}
              </span>
              <span className="rounded-full bg-[#6B8E5A]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#2A4720] border border-[#6B8E5A]/30">
                PAID &amp; CONFIRMED
              </span>
            </div>
            <h2 className="font-temple text-xl sm:text-2xl font-bold text-[#7B2D26] mt-2">
              {booking.productName}
            </h2>
            <p className="text-xs text-[#6E5545] mt-0.5">
              Consulting with <strong>{PLACEHOLDER_ASTROLOGER.displayName}</strong> • Flat ₹{booking.amountPaid.toLocaleString("en-IN")} Paid
            </p>
          </div>

          {/* Astrologer Desk Presence Signal */}
          <div className="flex items-center gap-3 bg-[#FAF5EE] px-3.5 py-2 rounded-2xl border border-[#E8D8C3] self-start sm:self-auto">
            <div className="relative">
              <img
                src={PLACEHOLDER_ASTROLOGER.avatarUrl}
                alt={PLACEHOLDER_ASTROLOGER.displayName}
                className="h-10 w-10 rounded-xl object-cover border border-[#E8A33D]"
              />
              {astrologerStatus === "AVAILABLE" && (
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#6B8E5A] ring-2 ring-white" />
              )}
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-[#7D6B5D]">Sanctum Desk</div>
              <div className="text-xs font-bold text-[#3B2A1E] flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full ${
                    astrologerStatus === "AVAILABLE"
                      ? "bg-[#6B8E5A] animate-pulse"
                      : astrologerStatus === "BUSY"
                      ? "bg-[#E8A33D]"
                      : "bg-[#7D6B5D]"
                  }`}
                />
                <span>
                  {astrologerStatus === "AVAILABLE"
                    ? "Online (Available)"
                    : astrologerStatus === "BUSY"
                    ? "In Session"
                    : astrologerStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            3-STAGE BOOKING LIFECYCLE STEPPER
            1. CONFIRMED -> 2. AWAITING SESSION -> 3. COMPLETED
        ========================================================================= */}
        <div className="py-6 border-b border-[#E8D8C3]">
          <div className="flex items-center justify-between text-xs font-bold mb-3">
            <span className="text-[11px] uppercase tracking-wider text-[#7B2D26] font-temple">
              Consultation Lifecycle State
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                currentState === "COMPLETED"
                  ? "bg-[#6B8E5A]/20 text-[#2A4720] border border-[#6B8E5A]/30"
                  : currentState === "AWAITING_SESSION"
                  ? "bg-[#E8A33D]/20 text-[#C1662F] border border-[#E8A33D]/30"
                  : "bg-[#7B2D26]/10 text-[#7B2D26] border border-[#7B2D26]/20"
              }`}
            >
              Current State: {currentState === "CONFIRMED" ? "Confirmed" : currentState === "AWAITING_SESSION" ? "Awaiting Session" : "Completed"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Step 1: Confirmed */}
            <div
              className={`rounded-2xl p-4 border transition-all ${
                currentState === "CONFIRMED"
                  ? "border-[#7B2D26] bg-[#FAF1E4] shadow-xs"
                  : "border-[#B8DCB0] bg-[#F4F9F2]"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <CheckCircle2
                  className={`h-5 w-5 ${
                    currentState === "CONFIRMED" ? "text-[#7B2D26]" : "text-[#6B8E5A]"
                  }`}
                />
                <span className="font-temple font-bold text-xs text-[#3B2A1E]">1. Confirmed</span>
              </div>
              <p className="text-[11px] text-[#6E5545] leading-relaxed">
                Payment verified &bull; Priority slot reserved at Acharya Ji&apos;s desk.
              </p>
            </div>

            {/* Step 2: Awaiting Session */}
            <div
              className={`rounded-2xl p-4 border transition-all ${
                currentState === "AWAITING_SESSION"
                  ? "border-[#E8A33D] bg-[#FFF8ED] shadow-xs ring-1 ring-[#E8A33D]"
                  : currentState === "COMPLETED"
                  ? "border-[#B8DCB0] bg-[#F4F9F2]"
                  : "border-[#E8D8C3] bg-[#FAF5EE] opacity-80"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Clock
                  className={`h-5 w-5 ${
                    currentState === "AWAITING_SESSION"
                      ? "text-[#C1662F] animate-spin"
                      : currentState === "COMPLETED"
                      ? "text-[#6B8E5A]"
                      : "text-[#A8988B]"
                  }`}
                />
                <span className="font-temple font-bold text-xs text-[#3B2A1E]">2. Awaiting Session</span>
              </div>
              <p className="text-[11px] text-[#6E5545] leading-relaxed">
                Sanctum coordination &bull; WhatsApp call / Google Meet link scheduled.
              </p>
            </div>

            {/* Step 3: Completed */}
            <div
              className={`rounded-2xl p-4 border transition-all ${
                currentState === "COMPLETED"
                  ? "border-[#6B8E5A] bg-[#F4F9F2] shadow-xs ring-1 ring-[#6B8E5A]"
                  : "border-[#E8D8C3] bg-[#FAF5EE] opacity-70"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles
                  className={`h-5 w-5 ${
                    currentState === "COMPLETED" ? "text-[#6B8E5A]" : "text-[#A8988B]"
                  }`}
                />
                <span className="font-temple font-bold text-xs text-[#3B2A1E]">3. Completed</span>
              </div>
              <p className="text-[11px] text-[#6E5545] leading-relaxed">
                Session conducted &bull; Remedies &amp; summary preserved in account history.
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            CORE ACTION & DELIVERY NOTICE
            Direct WhatsApp Coordination Link
        ========================================================================= */}
        <div className="my-6 rounded-2xl border-2 border-[#E8A33D] bg-gradient-to-br from-[#FAF1E4] to-[#FFFDF9] p-6 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7B2D26] font-temple block mb-1.5">
            How Your Session Takes Place
          </span>
          <p className="text-sm text-[#3B2A1E] leading-relaxed font-body max-w-xl mx-auto">
            The consultation is confirmed, and it will be conducted directly via <strong>WhatsApp call</strong> or <strong>Google Meet</strong>, as you prefer or as arranged with Acharya Ji&apos;s sanctum desk.
          </p>

          {/* Direct WhatsApp Call/Chat Button */}
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={whatsappCoordinationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white px-6 py-3.5 font-bold text-sm shadow-md transition-all w-full sm:w-auto cursor-pointer"
            >
              <MessageCircle className="h-5 w-5" />
              <span>Message on WhatsApp (+91 93112 15564)</span>
            </a>

            {currentState === "COMPLETED" && (
              <Link
                href="/account/history"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7B2D26] hover:bg-[#64221C] text-white px-5 py-3.5 font-bold text-xs shadow-md transition-all w-full sm:w-auto"
              >
                <FileText className="h-4 w-4 text-[#E8A33D]" />
                <span>View Summary &amp; Remedies</span>
              </Link>
            )}
          </div>
          <p className="mt-2 text-xs text-[#7D6B5D]">
            Tap the button above to coordinate your exact time and preferred session format directly. There is no in-app calling room or queue software to join.
          </p>
        </div>

        {/* Detailed Booking Summary Grid */}
        <div className="rounded-2xl border border-[#E8D8C3] bg-[#FAF5EE] p-5 text-xs text-left space-y-2">
          <div className="flex items-center justify-between border-b border-[#E8D8C3] pb-2">
            <span className="font-temple font-bold text-xs uppercase tracking-wider text-[#7B2D26]">
              Consultation Intake Details
            </span>
            <span className="text-[11px] text-[#7D6B5D]">
              Format: <strong>{booking.format}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 pt-1">
            <div>
              <span className="text-[#7D6B5D] block">Client Name:</span>
              <strong className="text-[#3B2A1E]">{booking.clientName}</strong>
            </div>
            <div>
              <span className="text-[#7D6B5D] block">Contact Phone:</span>
              <strong className="text-[#3B2A1E]">{booking.phone}</strong>
            </div>
            <div>
              <span className="text-[#7D6B5D] block">Amount Paid:</span>
              <strong className="text-[#2A4720]">Flat ₹{booking.amountPaid.toLocaleString("en-IN")} (Paid in Full)</strong>
            </div>
            <div>
              <span className="text-[#7D6B5D] block">Preferred Window:</span>
              <strong className="text-[#3B2A1E]">{booking.preferredSlot || "Immediate / Coordinated via WhatsApp"}</strong>
            </div>
          </div>

          {booking.topic && (
            <div className="border-t border-[#E8D8C3]/60 pt-2 text-[11px]">
              <span className="text-[#7D6B5D] block">Consultation Focus / Concern:</span>
              <p className="text-[#3B2A1E] font-medium mt-0.5">{booking.topic}</p>
            </div>
          )}

          {!isVaastu && booking.dateOfBirth && (
            <div className="border-t border-[#E8D8C3]/60 pt-2 text-[11px]">
              <span className="text-[#7D6B5D] block">Birth Details:</span>
              <p className="text-[#3B2A1E] font-medium mt-0.5">
                {booking.dateOfBirth} ({booking.timeOfBirth || "N/A"}) &bull; {booking.placeOfBirth || "N/A"}
              </p>
            </div>
          )}

          {isVaastu && booking.propertyType && (
            <div className="border-t border-[#E8D8C3]/60 pt-2 text-[11px]">
              <span className="text-[#7D6B5D] block">Property Details:</span>
              <p className="text-[#3B2A1E] font-medium mt-0.5">
                {booking.propertyType} &bull; {booking.propertyLocation || "N/A"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
