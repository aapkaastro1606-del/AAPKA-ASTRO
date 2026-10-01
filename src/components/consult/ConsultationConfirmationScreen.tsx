"use client";

import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  MessageCircle,
  FileCheck,
  Calendar,
  Clock,
  Sparkles,
  PhoneCall,
  Video,
  ShieldCheck,
  Mail,
  Home,
} from "lucide-react";
import { ConsultationBooking } from "@/lib/services/consultationBilling";
import { PLACEHOLDER_ASTROLOGER } from "@/config/placeholderContent";
import { BookingEmailService } from "@/lib/services/bookingEmailService";

export interface ConsultationConfirmationScreenProps {
  booking: ConsultationBooking;
  onReset: () => void;
}

export const ConsultationConfirmationScreen: React.FC<ConsultationConfirmationScreenProps> = ({
  booking,
  onReset,
}) => {
  const whatsappCoordinationUrl = BookingEmailService.getWhatsAppCoordinationLink({
    bookingId: booking.bookingId,
    clientName: booking.clientName,
    productName: booking.productName,
  });

  const isVaastu = booking.productId === "vaastu";

  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-10 shadow-xl text-center">
      {/* Sacred Seal / Verified Badge */}
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#F4F9F2] text-[#6B8E5A] border-2 border-[#B8DCB0] shadow-sm">
        <CheckCircle2 className="h-10 w-10 text-[#6B8E5A]" />
      </div>

      <span className="rounded-full bg-[#6B8E5A]/20 px-4 py-1.5 text-xs font-bold text-[#2A4720] border border-[#6B8E5A]/30 font-temple tracking-wide">
        PAYMENT VERIFIED &bull; CONSULTATION CONFIRMED
      </span>

      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-temple text-[#3B2A1E] mt-4">
        Your Consultation is Confirmed
      </h2>
      <p className="mt-1 font-temple text-sm sm:text-base font-semibold text-[#7B2D26]">
        {booking.productName} with {PLACEHOLDER_ASTROLOGER.displayName}
      </p>

      {/* Core Delivery Statement Card (Mandatory Post-Payment Notice) */}
      <div className="mt-6 rounded-2xl border-2 border-[#E8A33D] bg-gradient-to-br from-[#FAF1E4] to-[#FFFDF9] p-6 text-center shadow-xs">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#7B2D26] font-temple block mb-2">
          Consultation Delivery Notice
        </span>
        <p className="text-sm sm:text-base text-[#3B2A1E] leading-relaxed font-body">
          The consultation is confirmed, and it will be conducted via <strong>WhatsApp call</strong> or <strong>Google Meet</strong>, as you prefer or as arranged with Acharya Ji&apos;s sanctum.
        </p>

        {/* Direct One-Tap WhatsApp Action Button */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={whatsappCoordinationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white px-6 py-3.5 font-bold text-sm sm:text-base shadow-md transition-all w-full sm:w-auto cursor-pointer"
          >
            <MessageCircle className="h-5 w-5" />
            <span>Message on WhatsApp (+91 93112 15564)</span>
          </a>
        </div>
        <p className="mt-2.5 text-xs text-[#7D6B5D]">
          Tap the button above to coordinate your exact time and preferred format (WhatsApp Audio / Google Meet Video) immediately.
        </p>
      </div>

      {/* 3-Stage Booking Lifecycle Progress */}
      <div className="mt-6 rounded-2xl border border-[#E8D8C3] bg-[#FAF5EE] p-4 max-w-xl mx-auto text-left">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7B2D26] font-temple block mb-2.5">
          Consultation Lifecycle State: Confirmed
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2A4720] bg-[#F4F9F2] p-2.5 rounded-xl border border-[#B8DCB0]">
            <CheckCircle2 className="h-4 w-4 text-[#6B8E5A] shrink-0" />
            <span>1. Confirmed</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#C1662F] bg-[#FFF8ED] p-2.5 rounded-xl border border-[#E8A33D]">
            <Clock className="h-4 w-4 text-[#C1662F] animate-spin shrink-0" />
            <span>2. Awaiting Session</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6E5545] bg-[#FAF5EE] p-2.5 rounded-xl border border-[#E8D8C3] opacity-70">
            <Sparkles className="h-4 w-4 text-[#A8988B] shrink-0" />
            <span>3. Completed</span>
          </div>
        </div>
      </div>

      {/* Booking Summary Card */}
      <div className="mt-6 rounded-2xl border border-[#E8D8C3] bg-[#FAF5EE] p-5 sm:p-6 text-xs text-left max-w-xl mx-auto shadow-xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-[#E8D8C3] pb-2.5">
          <span className="font-temple font-bold text-xs uppercase tracking-wider text-[#7B2D26]">
            Official Booking Summary
          </span>
          <span className="font-mono text-[11px] text-[#7D6B5D] bg-[#FFFDF9] px-2 py-0.5 rounded border border-[#E8D8C3]">
            {booking.bookingId}
          </span>
        </div>

        <div className="flex justify-between py-1">
          <span className="text-[#7D6B5D]">Client Name:</span>
          <span className="font-bold text-[#3B2A1E]">{booking.clientName}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-[#7D6B5D]">Client WhatsApp / Mobile:</span>
          <span className="font-bold text-[#3B2A1E]">{booking.phone}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-[#7D6B5D]">Consultation Type:</span>
          <span className="font-bold text-[#7B2D26]">{booking.productName}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-[#7D6B5D]">Selected Preference:</span>
          <span className="font-semibold text-[#3B2A1E]">{booking.format}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-[#7D6B5D]">Amount Paid:</span>
          <span className="font-bold text-[#2A4720]">
            Flat ₹{booking.amountPaid.toLocaleString("en-IN")} (Paid in Full &bull; Zero Per-Minute Debits)
          </span>
        </div>

        {!isVaastu && booking.dateOfBirth && (
          <div className="flex justify-between py-1 border-t border-[#E8D8C3]/50 pt-2 text-[11px]">
            <span className="text-[#7D6B5D]">Birth Details:</span>
            <span className="text-[#3B2A1E] font-medium">
              {booking.dateOfBirth} ({booking.timeOfBirth || "N/A"}) &bull; {booking.placeOfBirth || "N/A"}
            </span>
          </div>
        )}

        {isVaastu && booking.propertyType && (
          <div className="flex justify-between py-1 border-t border-[#E8D8C3]/50 pt-2 text-[11px]">
            <span className="text-[#7D6B5D]">Property Audit:</span>
            <span className="text-[#3B2A1E] font-medium">
              {booking.propertyType} &bull; {booking.propertyLocation || "N/A"}
            </span>
          </div>
        )}

        {booking.orderId && (
          <div className="flex justify-between py-1 border-t border-[#E8D8C3]/50 pt-2 text-[11px]">
            <span className="text-[#7D6B5D]">Payment Reference:</span>
            <span className="font-mono text-[#7D6B5D]">{booking.paymentId || booking.orderId}</span>
          </div>
        )}
      </div>

      {/* What Happens Next Guidance */}
      <div className="mt-6 rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 text-left max-w-xl mx-auto">
        <h4 className="font-temple font-bold text-xs uppercase tracking-wider text-[#7B2D26] mb-3 flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-[#E8A33D]" />
          <span>What Happens Next</span>
        </h4>
        <ol className="space-y-2 text-xs text-[#5C4535] list-decimal pl-4 leading-relaxed font-body">
          <li>
            <strong>One-Tap Coordination:</strong> Click the WhatsApp button above to message our desk anytime with your preferred time slot and choice of WhatsApp Call or Google Meet.
          </li>
          <li>
            <strong>Sanctum Desk Follow-Up:</strong> If you don&apos;t message right away, Acharya Ji&apos;s sanctum desk will contact your registered phone number (<strong>{booking.phone}</strong>) to confirm the time.
          </li>
          <li>
            <strong>Sacred Chart Preparation:</strong> Acharya Ji personally erects your horoscope or 16-zone Devta Vaastu blueprint prior to the call so every minute of your reading is devoted to focused guidance.
          </li>
          <li>
            <strong>Confirmation Email Dispatched:</strong> A formal booking confirmation receipt with this direct WhatsApp link and your transaction details has also been sent to your registered email.
          </li>
        </ol>
      </div>

      {/* Secondary Action Controls */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl border border-[#D4C3B3] bg-[#FAF5EE] px-5 py-2.5 text-xs font-semibold text-[#3B2A1E] hover:bg-[#F3E7D3] transition-all cursor-pointer flex items-center gap-1.5"
        >
          <FileCheck className="h-4 w-4 text-[#7B2D26]" />
          <span>Print Booking Receipt</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="rounded-xl bg-[#7B2D26] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#64231D] shadow-sm transition-all cursor-pointer"
        >
          Book Another Consultation
        </button>

        <Link
          href="/"
          className="rounded-xl border border-[#D4C3B3] bg-[#FAF5EE] px-5 py-2.5 text-xs font-semibold text-[#3B2A1E] hover:bg-[#F3E7D3] transition-all flex items-center gap-1.5"
        >
          <Home className="h-4 w-4 text-[#7D6B5D]" />
          <span>Return to Home</span>
        </Link>
      </div>
    </div>
  );
};
