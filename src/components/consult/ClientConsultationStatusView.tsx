"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Sparkles,
  MessageCircle,
  FileText,
  Calendar,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Video,
  XCircle,
  RotateCcw,
  RefreshCw,
  QrCode,
  ArrowRight,
  Edit3,
  Star,
  Send,
} from "lucide-react";
import { AstrologerStateStore, AstrologerStatus } from "@/lib/store/astrologerStore";
import { PLACEHOLDER_ASTROLOGER } from "@/config/placeholderContent";
import { useUser } from "@/components/auth/ClerkAuthWrapper";
import { UpiQrModal } from "./UpiQrModal";

export type BookingWorkflowState =
  | "PENDING_PAYMENT"
  | "PAYMENT_CLAIMED"
  | "CONFIRMED"
  | "SCHEDULED"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED"
  | "EXPIRED";

export interface UnifiedBooking {
  id?: string;
  bookingId: string;
  userName?: string;
  clientName?: string;
  userPhone?: string;
  phone?: string;
  userEmail?: string | null;
  productType?: "astro" | "vaastu" | "kundli_pdf" | string;
  productId?: string;
  productName?: string;
  format?: string;
  concern?: string | null;
  topic?: string | null;
  amount?: number;
  amountPaid?: number;
  lockedAmount?: number;
  isFirstTimeAstro?: boolean;
  bookingStatus?: BookingWorkflowState;
  status?: string;
  paymentStatus?: string;
  utr?: string | null;
  preferredDay?: string | null;
  preferredTimeWindow?: string | null;
  preferredSlot?: string | null;
  scheduledSlot?: string | null;
  meetingLink?: string | null;
  rejectionReason?: string | null;
  intakeDetails?: any;
  createdAt?: string;
  expiresAt?: string | null;
}

interface ClientConsultationStatusViewProps {
  booking?: UnifiedBooking | null;
  onBookNew?: () => void;
}

export const ClientConsultationStatusView: React.FC<ClientConsultationStatusViewProps> = ({
  booking: propBooking,
  onBookNew,
}) => {
  const { user } = useUser();
  const [activeBooking, setActiveBooking] = useState<UnifiedBooking | null>(propBooking || null);
  const [loading, setLoading] = useState<boolean>(!propBooking);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [astrologerStatus, setAstrologerStatus] = useState<AstrologerStatus>("AVAILABLE");
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [claimUtr, setClaimUtr] = useState<string>("");
  const [claiming, setClaiming] = useState<boolean>(false);
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [isEditingUtr, setIsEditingUtr] = useState<boolean>(false);
  const [utrInput, setUtrInput] = useState<string>("");
  const [utrError, setUtrError] = useState<string | null>(null);
  const [utrSuccess, setUtrSuccess] = useState<string | null>(null);
  const [isSavingUtr, setIsSavingUtr] = useState<boolean>(false);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackHoverRating, setFeedbackHoverRating] = useState<number>(0);
  const [feedbackName, setFeedbackName] = useState<string>("");
  const [feedbackComment, setFeedbackComment] = useState<string>("");
  const [submittingFeedback, setSubmittingFeedback] = useState<boolean>(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.fullName || user?.firstName) {
      setFeedbackName(user.fullName || user.firstName || "");
    } else if (activeBooking?.userName) {
      setFeedbackName(activeBooking.userName);
    }
  }, [user, activeBooking]);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackComment.trim()) return;

    setSubmittingFeedback(true);
    setFeedbackError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: activeBooking?.bookingId || activeBooking?.id,
          clientName: feedbackName.trim() || activeBooking?.userName || "Seeker",
          service: activeBooking?.productType === "vaastu" ? "Vastu Consultation" : "Voice Call Consultation",
          rating: feedbackRating,
          comment: feedbackComment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit feedback.");
      }

      setFeedbackSubmitted(true);
    } catch (err: any) {
      setFeedbackError(err.message || "Could not record feedback. Please try again.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleSavePaymentReference = async (e: React.FormEvent) => {
    e.preventDefault();
    setUtrError(null);
    setUtrSuccess(null);
    const trimmed = utrInput.trim();

    if (!/^\d{12}$/.test(trimmed)) {
      setUtrError("UTR must be exactly 12 numeric digits.");
      return;
    }

    setIsSavingUtr(true);
    try {
      const res = await fetch("/api/booking/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: (booking?.bookingId || booking?.id) as string,
          utr: trimmed,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUtrSuccess(`Payment reference updated to ${trimmed}. The sanctum desk has been notified.`);
        setIsEditingUtr(false);
        fetchActiveBooking();
        window.dispatchEvent(new CustomEvent("aapka_booking_updated"));
      } else {
        setUtrError(data.message || "Failed to update payment reference. Please check your reference.");
      }
    } catch {
      setUtrError("Network error. Could not update reference. Please try again.");
    } finally {
      setIsSavingUtr(false);
    }
  };

  const fetchActiveBooking = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const email = user?.primaryEmailAddress?.emailAddress;
      const params = new URLSearchParams();
      if (email) params.set("userEmail", email);
      if (user?.id) params.set("userId", user.id);
      const qs = params.toString() ? `?${params.toString()}` : "";
      const res = await fetch(`/api/booking/status${qs}`, { cache: "no-store" });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setLoadError("Your session expired or you don't have access. Sign in again.");
        } else {
          setLoadError("Could not load booking details. Please retry.");
        }
        return;
      }
      const data = await res.json();
      if (data.success && data.booking) {
        setActiveBooking(data.booking);
        setLoadError(null);
      } else if (!propBooking) {
        setActiveBooking(null);
      }
    } catch (err: any) {
      setLoadError("Could not load booking details. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propBooking) {
      setActiveBooking(propBooking);
      setLoading(false);
    } else {
      fetchActiveBooking();
    }

    const fetchPresence = () => {
      fetch("/api/astrologer/presence")
        .then((r) => r.json())
        .then((d) => {
          if (d?.status) setAstrologerStatus(d.status);
        })
        .catch(() => setAstrologerStatus(AstrologerStateStore.getStatus()));
    };
    fetchPresence();

    const handleSync = () => {
      fetchPresence();
      setAstrologerStatus(AstrologerStateStore.getStatus());
      fetchActiveBooking();
    };

    window.addEventListener("astro_state_changed", handleSync);
    window.addEventListener("aapka_booking_updated", handleSync);
    return () => {
      window.removeEventListener("astro_state_changed", handleSync);
      window.removeEventListener("aapka_booking_updated", handleSync);
    };
  }, [propBooking]);

  const booking = propBooking || activeBooking;

  // Resolve normalized fields across legacy and unified booking types
  const bookingId = booking?.bookingId || "";
  const clientName = booking?.userName || booking?.clientName || "Seeker";
  const clientPhone = booking?.userPhone || booking?.phone || "";
  const productType = booking?.productType || booking?.productId || "astro";
  const productName =
    booking?.productName ||
    (productType === "vaastu"
      ? "Comprehensive Devta & Energy Vaastu Audit"
      : productType === "kundli_pdf"
      ? "Janam Kundli Full PDF Dossier"
      : "1-on-1 Vedic Astro Consultation");
  const amount = booking?.lockedAmount || booking?.amount || booking?.amountPaid || (productType === "vaastu" ? 15000 : 1051);
  const format = booking?.format || "WhatsApp call";
  const preferredDay = booking?.preferredDay || "Earliest Available";
  const preferredTime = booking?.preferredTimeWindow || "Morning";
  const topic = booking?.topic || booking?.concern || "";
  const scheduledSlot = booking?.scheduledSlot;
  const meetingLink = booking?.meetingLink;
  const rejectionReason = booking?.rejectionReason;
  const isFirstTime = Boolean(booking?.isFirstTimeAstro);

  // Normalize booking status
  let rawStatus = (booking?.bookingStatus || booking?.status || "CONFIRMED").toUpperCase();
  if (rawStatus === "AWAITING_SESSION" || rawStatus === "IN_SESSION") {
    rawStatus = "CONFIRMED";
  }
  const status: BookingWorkflowState = (rawStatus as BookingWorkflowState) || "PENDING_PAYMENT";

  const rawWaNumber = "919311215564";
  const whatsappCoordinationUrl = `https://wa.me/${rawWaNumber}?text=${encodeURIComponent(
    `Pranam Acharya Ji,\n\nI am contacting regarding my consultation booking.\n• Booking Ref: ${bookingId}\n• Seeker: ${clientName}\n• Service: ${productName}\n• Status: ${status}\n\nPlease let me know our consultation timing and details.`
  )}`;

  const handleClaimPayment = async () => {
    if (!bookingId) return;
    setClaiming(true);
    try {
      await fetch("/api/booking/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          utr: claimUtr.trim() || undefined,
        }),
      });
      // Open WhatsApp with proof confirmation
      const waMsg = `Pranam Acharya Ji,\n\nI have completed payment for my consultation.\n• Booking Ref: ${bookingId}\n• Seeker: ${clientName}\n• Amount: ₹${amount.toLocaleString("en-IN")}\n• UTR: ${claimUtr.trim() || "Attached in screenshot"}\n\nAttached is my payment screenshot for bank verification.`;
      window.open(`https://wa.me/${rawWaNumber}?text=${encodeURIComponent(waMsg)}`, "_blank");
      await fetchActiveBooking();
    } catch (e) {
      console.warn("Claim error:", e);
    } finally {
      setClaiming(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!bookingId) return;
    if (
      !confirm(
        "Are you sure you want to cancel this booking? Once cancelled, you will be able to book a new consultation slot immediately."
      )
    ) {
      return;
    }
    setCancelling(true);
    try {
      const res = await fetch("/api/booking/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          reason: "Cancelled by seeker",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveBooking(null);
        if (onBookNew) onBookNew();
        await fetchActiveBooking();
      } else {
        alert(data.message || "Failed to cancel booking.");
      }
    } catch {
      alert("Network error cancelling booking. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-12 text-center max-w-2xl mx-auto shadow-sm">
        <Clock className="h-8 w-8 text-[#C1662F] animate-spin mx-auto mb-3" />
        <h3 className="font-temple text-lg font-bold text-[#7B2D26]">Loading Booking Details...</h3>
        <p className="text-xs text-[#6E5545] mt-1">Checking live status with sanctum server.</p>
      </div>
    );
  }

  if (loadError) {
    const isAuthError = loadError.includes("session expired") || loadError.includes("don't have access");
    return (
      <div className="rounded-3xl border border-red-200 bg-[#FFFDF9] p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-200">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="font-temple text-xl font-bold text-red-800">
          {isAuthError ? "Session Expired" : "Could Not Load Booking Details"}
        </h3>
        <p className="text-xs sm:text-sm text-[#6E5545] mt-2 max-w-md mx-auto leading-relaxed">
          {loadError}
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          {isAuthError ? (
            <Link
              href="/login?redirect_url=/account/consult"
              className="w-full sm:w-auto rounded-xl bg-[#7B2D26] px-6 py-3 text-xs font-bold text-white hover:bg-[#64221C] transition-all shadow-md text-center"
            >
              Sign In Again
            </Link>
          ) : (
            <button
              onClick={fetchActiveBooking}
              className="w-full sm:w-auto rounded-xl bg-[#7B2D26] px-6 py-3 text-xs font-bold text-white hover:bg-[#64221C] transition-all shadow-md text-center flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Fallback if no booking exists
  if (!booking) {
    return (
      <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FBF3E7] text-[#7B2D26] border border-[#E8D8C3]">
          <Clock className="h-8 w-8 text-[#C1662F]" />
        </div>
        <h3 className="font-temple text-xl font-bold text-[#7B2D26]">No Active Consultation Booking</h3>
        <p className="text-xs sm:text-sm text-[#6E5545] mt-2 max-w-md mx-auto leading-relaxed">
          You do not have any pending consultation sessions. Book an Astro Consultation (Regular ₹2,100 ➔ First-time Flat ₹1,051) or Vaastu Consultation (Regular ₹25,000 ➔ Now Flat ₹15,000) to connect directly with Acharya Niraj Kumar.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/consult"
            className="w-full sm:w-auto rounded-xl bg-[#7B2D26] px-6 py-3 text-xs font-bold text-white hover:bg-[#64221C] transition-all shadow-md text-center flex items-center justify-center gap-1.5"
          >
            <span className="line-through text-red-200/90 text-xs font-bold decoration-red-300">₹2,100</span>
            <span>Book Astro Consultation (Flat ₹1,051)</span>
          </Link>
          <a
            href="https://wa.me/919311215564"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto rounded-xl border border-[#E8D8C3] bg-[#FAF5EE] px-5 py-3 text-xs font-bold text-[#3B2A1E] hover:bg-[#E8D8C3] transition-all text-center flex items-center justify-center gap-1.5"
          >
            <MessageCircle className="h-4 w-4 text-[#25D366]" />
            <span>Message on WhatsApp (+91 93112 15564)</span>
          </a>
        </div>
      </div>
    );
  }

  // Stepper Stage Calculation
  // 1: PENDING_PAYMENT, 2: PAYMENT_CLAIMED, 3: CONFIRMED, 4: SCHEDULED, 5: COMPLETED
  let currentStepIndex = 1;
  if (status === "PAYMENT_CLAIMED") currentStepIndex = 2;
  else if (status === "CONFIRMED") currentStepIndex = 3;
  else if (status === "SCHEDULED") currentStepIndex = 4;
  else if (status === "COMPLETED") currentStepIndex = 5;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="rounded-3xl border-2 border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-md">
        {/* Top Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8D8C3]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#7B2D26] bg-[#FBF3E7] px-2.5 py-1 rounded-md border border-[#E8D8C3]">
                {bookingId}
              </span>

              {status === "PENDING_PAYMENT" && (
                <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-900 border border-amber-500/30">
                  PAYMENT PENDING
                </span>
              )}
              {status === "PAYMENT_CLAIMED" && (
                <span className="rounded-full bg-orange-500/15 px-2.5 py-0.5 text-[10px] font-bold text-orange-900 border border-orange-500/30">
                  PAYMENT CLAIMED &bull; VERIFICATION IN PROGRESS
                </span>
              )}
              {status === "CONFIRMED" && (
                <span className="rounded-full bg-[#6B8E5A]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#2A4720] border border-[#6B8E5A]/30">
                  PAYMENT VERIFIED &bull; SCHEDULING
                </span>
              )}
              {status === "SCHEDULED" && (
                <span className="rounded-full bg-emerald-600/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-900 border border-emerald-600/40">
                  CONSULTATION SCHEDULED
                </span>
              )}
              {status === "COMPLETED" && (
                <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[10px] font-bold text-blue-900 border border-blue-500/30">
                  CONSULTATION COMPLETED
                </span>
              )}
              {status === "REJECTED" && (
                <span className="rounded-full bg-red-500/15 px-2.5 py-0.5 text-[10px] font-bold text-red-900 border border-red-500/30">
                  PAYMENT REJECTED
                </span>
              )}
              {status === "EXPIRED" && (
                <span className="rounded-full bg-gray-500/15 px-2.5 py-0.5 text-[10px] font-bold text-gray-700 border border-gray-500/30">
                  BOOKING EXPIRED
                </span>
              )}
            </div>

            <h2 className="font-temple text-xl sm:text-2xl font-bold text-[#7B2D26] mt-2">
              {productName}
            </h2>
            <p className="text-xs text-[#6E5545] mt-0.5">
              Consulting with <strong>{PLACEHOLDER_ASTROLOGER.displayName}</strong> • Locked Amount: <strong>₹{amount.toLocaleString("en-IN")}</strong>
              {isFirstTime && <span className="ml-2 font-bold text-[#6B8E5A]">(First-Time 50% Off Applied)</span>}
            </p>
          </div>

          {/* Sanctum Presence Desk */}
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

        {/* 4-Step Lifecycle Visual Progress Bar (Only for non-rejected/non-expired) */}
        {status !== "REJECTED" && status !== "EXPIRED" && status !== "CANCELLED" && (
          <div className="py-6 border-b border-[#E8D8C3]">
            <div className="flex items-center justify-between text-xs font-bold mb-3">
              <span className="text-[11px] uppercase tracking-wider text-[#7B2D26] font-temple">
                Consultation Lifecycle Progress
              </span>
              <span className="text-[11px] text-[#6E5545] font-semibold">
                Step {currentStepIndex} of 5
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {/* Step 1: Payment */}
              <div
                className={`rounded-xl p-2.5 border text-center transition-all ${
                  currentStepIndex === 1
                    ? "border-[#7B2D26] bg-[#FAF1E4] shadow-xs"
                    : currentStepIndex > 1
                    ? "border-[#B8DCB0] bg-[#F4F9F2]"
                    : "border-[#E8D8C3] bg-[#FAF5EE] opacity-60"
                }`}
              >
                <div className="font-temple font-bold text-[11px] text-[#3B2A1E]">1. Payment</div>
                <div className="text-[10px] text-[#6E5545] mt-0.5">
                  {currentStepIndex > 1 ? "Paid" : "Pending UPI"}
                </div>
              </div>

              {/* Step 2: Verification */}
              <div
                className={`rounded-xl p-2.5 border text-center transition-all ${
                  currentStepIndex === 2
                    ? "border-[#E8A33D] bg-[#FFF8ED] shadow-xs ring-1 ring-[#E8A33D]"
                    : currentStepIndex > 2
                    ? "border-[#B8DCB0] bg-[#F4F9F2]"
                    : "border-[#E8D8C3] bg-[#FAF5EE] opacity-60"
                }`}
              >
                <div className="font-temple font-bold text-[11px] text-[#3B2A1E]">2. Verification</div>
                <div className="text-[10px] text-[#6E5545] mt-0.5">
                  {currentStepIndex === 2 ? "Bank Checking" : currentStepIndex > 2 ? "Matched" : "Awaiting"}
                </div>
              </div>

              {/* Step 3: Confirmed */}
              <div
                className={`rounded-xl p-2.5 border text-center transition-all ${
                  currentStepIndex === 3
                    ? "border-[#6B8E5A] bg-[#F4F9F2] shadow-xs ring-1 ring-[#6B8E5A]"
                    : currentStepIndex > 3
                    ? "border-[#B8DCB0] bg-[#F4F9F2]"
                    : "border-[#E8D8C3] bg-[#FAF5EE] opacity-60"
                }`}
              >
                <div className="font-temple font-bold text-[11px] text-[#3B2A1E]">3. Confirmed</div>
                <div className="text-[10px] text-[#6E5545] mt-0.5">
                  {currentStepIndex >= 3 ? "Approved" : "Pending"}
                </div>
              </div>

              {/* Step 4: Scheduled */}
              <div
                className={`rounded-xl p-2.5 border text-center transition-all ${
                  currentStepIndex === 4
                    ? "border-[#6B8E5A] bg-[#F4F9F2] shadow-xs ring-1 ring-[#6B8E5A]"
                    : currentStepIndex > 4
                    ? "border-[#B8DCB0] bg-[#F4F9F2]"
                    : "border-[#E8D8C3] bg-[#FAF5EE] opacity-60"
                }`}
              >
                <div className="font-temple font-bold text-[11px] text-[#3B2A1E]">4. Scheduled / Awaiting Session</div>
                <div className="text-[10px] text-[#6E5545] mt-0.5">
                  {currentStepIndex >= 4 ? "Slot Fixed" : "Pending"}
                </div>
              </div>

              {/* Step 5: Completed */}
              <div
                className={`col-span-2 sm:col-span-1 rounded-xl p-2.5 border text-center transition-all ${
                  currentStepIndex === 5
                    ? "border-[#6B8E5A] bg-[#F4F9F2] shadow-xs ring-1 ring-[#6B8E5A]"
                    : "border-[#E8D8C3] bg-[#FAF5EE] opacity-60"
                }`}
              >
                <div className="font-temple font-bold text-[11px] text-[#3B2A1E]">5. Completed</div>
                <div className="text-[10px] text-[#6E5545] mt-0.5">
                  {currentStepIndex === 5 ? "Concluded" : "Upcoming"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STATE-SPECIFIC ACTION & NOTIFICATION CARDS
        ========================================================================= */}

        {/* 1. PENDING_PAYMENT */}
        {status === "PENDING_PAYMENT" && (
          <div className="my-6 rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-[#FFF9EE] to-[#FFFDF9] p-6 text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200">
              <Clock className="h-3.5 w-3.5" />
              <span>Payment Pending</span>
            </div>
            <h3 className="font-temple text-lg font-bold text-[#7B2D26]">
              Complete Your UPI Payment to Lock Your Consultation Slot
            </h3>
            <p className="text-xs text-[#6E5545] max-w-lg mx-auto">
              Scan our official UPI QR code for <strong>₹{amount.toLocaleString("en-IN")}</strong> using GPay, PhonePe, Paytm, or BHIM. Zero gateway commissions charged.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#7B2D26] hover:bg-[#64221C] text-white px-6 py-3 font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <QrCode className="h-4 w-4 text-[#E8A33D]" />
                <span>Show UPI QR Code (₹{amount.toLocaleString("en-IN")})</span>
              </button>

              <button
                type="button"
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-red-300 bg-red-50 hover:bg-red-100 text-red-800 px-5 py-3 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <XCircle className="h-4 w-4 text-red-600" />
                <span>{cancelling ? "Cancelling..." : "Cancel This Booking"}</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. PAYMENT_CLAIMED: "Payment received for verification. Promise no time." */}
        {status === "PAYMENT_CLAIMED" && (
          <div className="my-6 rounded-2xl border-2 border-[#E8A33D] bg-gradient-to-br from-[#FAF1E4] to-[#FFFDF9] p-6 text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-900 text-xs font-bold border border-orange-200">
              <Clock className="h-3.5 w-3.5 text-orange-600 animate-spin" />
              <span>Payment Received for Verification</span>
            </div>

            <h3 className="font-temple text-xl font-bold text-[#7B2D26]">
              Payment Received for Verification
            </h3>

            <div className="max-w-xl mx-auto rounded-xl bg-[#FAF5EE] border border-[#E8D8C3] p-4 text-xs text-[#3B2A1E] leading-relaxed text-left space-y-2">
              <p className="font-semibold text-[#7B2D26]">Important Note on Verification:</p>
              <p>
                Our sanctum desk reconciles all payments directly against official bank statements during working hours. Because bank settlements can take time to reflect, <strong>we do not promise a fixed wait minute or automated timer</strong>.
              </p>
              <p className="text-[#6E5545]">
                As soon as our Owner verifies the credit in our bank account, your consultation time slot and Google Meet or WhatsApp call link will be published here and emailed to you.
              </p>
              <div className="pt-2 border-t border-[#E8D8C3] text-left space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-[#7D6B5D]">
                    {booking.utr ? (
                      <>
                        Submitted UTR / Ref: <strong className="text-[#3B2A1E] font-bold">{booking.utr}</strong>
                      </>
                    ) : (
                      <span className="italic text-[#8C7A6B]">No payment reference submitted yet</span>
                    )}
                  </span>
                  {!isEditingUtr && (
                    <button
                      type="button"
                      onClick={() => {
                        setUtrInput(booking.utr || "");
                        setUtrError(null);
                        setUtrSuccess(null);
                        setIsEditingUtr(true);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7B2D26] hover:underline cursor-pointer"
                    >
                      <Edit3 className="h-3 w-3 text-[#C1662F]" />
                      <span>Add or update payment reference</span>
                    </button>
                  )}
                </div>

                {utrSuccess && (
                  <p className="text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg p-2">
                    {utrSuccess}
                  </p>
                )}

                {isEditingUtr && (
                  <form onSubmit={handleSavePaymentReference} className="pt-2 border-t border-[#E8D8C3]/50 space-y-2">
                    <label className="block text-[11px] font-bold text-[#7B2D26]">
                      Add or update payment reference (12-digit UTR):
                    </label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={12}
                          value={utrInput}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setUtrInput(val);
                            if (utrError) setUtrError(null);
                          }}
                          placeholder="Enter 12-digit UPI reference"
                          className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-[#D5C2B1] bg-[#FFFDF9] text-[#3B2A1E] focus:outline-none focus:ring-1 focus:ring-[#7B2D26]"
                        />
                        <span className="absolute right-2 top-2 text-[10px] text-[#A69383]">
                          {utrInput.length}/12
                        </span>
                      </div>
                      <button
                        type="submit"
                        disabled={isSavingUtr || utrInput.length !== 12}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#7B2D26] hover:bg-[#66241E] text-white text-xs font-bold disabled:opacity-50 transition-all cursor-pointer"
                      >
                        {isSavingUtr ? "Saving..." : "Save Reference"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingUtr(false);
                          setUtrError(null);
                        }}
                        className="px-3 py-2 rounded-lg bg-[#FAF5EE] border border-[#E8D8C3] text-xs font-bold text-[#6E5545] hover:bg-[#F3ECE2] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                    {utrError && (
                      <p className="text-[11px] font-medium text-red-600 bg-red-50 border border-red-200 rounded p-1.5">
                        {utrError}
                      </p>
                    )}
                  </form>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={whatsappCoordinationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white px-6 py-3 font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Send / Update Proof on WhatsApp (+91 93112 15564)</span>
              </a>
            </div>
          </div>
        )}

        {/* 3. CONFIRMED */}
        {status === "CONFIRMED" && (
          <div className="my-6 rounded-2xl border-2 border-[#6B8E5A] bg-gradient-to-br from-[#F4F9F2] to-[#FFFDF9] p-6 text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6B8E5A]/20 text-[#2A4720] text-xs font-bold border border-[#6B8E5A]/30">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#6B8E5A]" />
              <span>Payment Verified &amp; Approved</span>
            </div>

            <h3 className="font-temple text-xl font-bold text-[#2A4720]">
              Bank Credit Confirmed! Scheduling Your Slot
            </h3>
            <p className="text-xs text-[#6E5545] max-w-lg mx-auto leading-relaxed">
              Acharya Ji&apos;s sanctum desk has verified your payment against bank records. Your consultation slot and meeting link are being scheduled right now.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={whatsappCoordinationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white px-6 py-3 font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Message Sanctum Desk on WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        {/* 4. SCHEDULED */}
        {status === "SCHEDULED" && (
          <div className="my-6 rounded-2xl border-2 border-emerald-500 bg-gradient-to-br from-[#F0FDF4] to-[#FFFDF9] p-6 text-center space-y-4 shadow-sm">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300">
              <Calendar className="h-3.5 w-3.5 text-emerald-700" />
              <span>Consultation Scheduled</span>
            </div>

            <h3 className="font-temple text-2xl font-bold text-emerald-900">
              Your Session is Confirmed &amp; Scheduled!
            </h3>

            {/* Scheduled Slot Highlight Box */}
            <div className="max-w-md mx-auto rounded-2xl bg-white border-2 border-emerald-400 p-5 text-center shadow-xs space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 block">
                Confirmed Consultation Time Slot
              </span>
              <div className="font-temple text-lg sm:text-xl font-bold text-[#3B2A1E]">
                {scheduledSlot || "Confirmed with Acharya Ji"}
              </div>
              <p className="text-[11px] text-[#6E5545]">
                Please ensure you are ready 5 minutes prior to the scheduled slot.
              </p>
            </div>

            {/* Meeting Link / WhatsApp Call Action */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {meetingLink && meetingLink.startsWith("http") ? (
                <a
                  href={meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3.5 font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Video className="h-4 w-4 text-emerald-200" />
                  <span>Join Google Meet Consultation</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <div className="rounded-xl bg-[#FAF5EE] border border-[#E8D8C3] px-5 py-3 text-xs text-[#3B2A1E]">
                  <strong>Consultation Mode:</strong> WhatsApp Call to{" "}
                  <span className="font-bold text-[#7B2D26]">{clientPhone || "your registered number"}</span>. Acharya Ji will initiate the call directly.
                </div>
              )}

              <a
                href={whatsappCoordinationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#E8D8C3] bg-[#FAF5EE] hover:bg-[#E8D8C3] text-[#3B2A1E] px-5 py-3.5 font-bold text-xs transition-all text-center"
              >
                <MessageCircle className="h-4 w-4 text-[#25D366]" />
                <span>Message on WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        {/* 5. COMPLETED */}
        {status === "COMPLETED" && (
          <div className="my-6 rounded-2xl border-2 border-[#6B8E5A] bg-gradient-to-br from-[#F4F9F2] to-[#FFFDF9] p-6 text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6B8E5A]/20 text-[#2A4720] text-xs font-bold border border-[#6B8E5A]/30">
              <Sparkles className="h-3.5 w-3.5 text-[#6B8E5A]" />
              <span>Consultation Completed</span>
            </div>
            <h3 className="font-temple text-xl font-bold text-[#2A4720]">
              Consultation Successfully Concluded
            </h3>
            <p className="text-xs text-[#6E5545] max-w-md mx-auto">
              May the divine remedies and planetary alignments guide you with harmony and peace.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/account/history"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7B2D26] hover:bg-[#64221C] text-white px-5 py-3 font-bold text-xs shadow-md transition-all"
              >
                <FileText className="h-4 w-4 text-[#E8A33D]" />
                <span>View Summary &amp; Remedies</span>
              </Link>
              <Link
                href="/consult"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E8D8C3] bg-[#FAF5EE] hover:bg-[#E8D8C3] text-[#3B2A1E] px-5 py-3 font-bold text-xs transition-all"
              >
                <span>Book Another Consultation</span>
              </Link>
            </div>

            {/* Interactive Session Feedback Card */}
            {!feedbackSubmitted ? (
              <div className="mt-6 rounded-2xl border-2 border-[#E8A33D] bg-gradient-to-b from-[#FFFDF9] via-[#FAF4EA] to-[#F5EAD9] p-5 sm:p-6 text-left shadow-md space-y-4">
                <div className="text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8A33D]/20 text-[#7B2D26] text-xs font-bold border border-[#E8A33D]/40 mb-2">
                    <Star className="h-3.5 w-3.5 fill-[#E8A33D] text-[#E8A33D]" />
                    <span>Session Feedback &amp; Review</span>
                  </div>
                  <h4 className="font-temple text-lg sm:text-xl font-bold text-[#7B2D26]">
                    How Was Your Consultation with Acharya Niraj Kumar?
                  </h4>
                  <p className="text-xs text-[#6E5545]">
                    Your honest feedback is saved in genuine seeker testimonials and helps guide others on their spiritual path.
                  </p>
                </div>

                <form onSubmit={handleSubmitFeedback} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#7B2D26] mb-1">
                      Rate Your Consultation Experience:
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setFeedbackRating(star)}
                          onMouseEnter={() => setFeedbackHoverRating(star)}
                          onMouseLeave={() => setFeedbackHoverRating(0)}
                          className="p-1 focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-6 w-6 transition-colors ${
                              (feedbackHoverRating || feedbackRating) >= star
                                ? "fill-[#E8A33D] text-[#E8A33D]"
                                : "text-[#E8D8C3]"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-xs font-bold text-[#7B2D26]">
                        {feedbackRating} of 5 Stars
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#3B2A1E] mb-1">
                      Your Name:
                    </label>
                    <input
                      type="text"
                      value={feedbackName}
                      onChange={(e) => setFeedbackName(e.target.value)}
                      placeholder="e.g. Parnika Grover"
                      className="w-full rounded-xl border border-[#E8D8C3] bg-white px-3.5 py-2 text-xs text-[#3B2A1E] focus:border-[#7B2D26] focus:outline-none focus:ring-1 focus:ring-[#7B2D26]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#3B2A1E] mb-1">
                      Your Consultation Experience &amp; Review:
                    </label>
                    <textarea
                      rows={3}
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="Share your experience, insights received, or remedies guidance..."
                      className="w-full rounded-xl border border-[#E8D8C3] bg-white p-3 text-xs text-[#3B2A1E] focus:border-[#7B2D26] focus:outline-none focus:ring-1 focus:ring-[#7B2D26]"
                      required
                    />
                  </div>

                  {feedbackError && (
                    <p className="text-xs text-red-600 font-semibold">{feedbackError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submittingFeedback || !feedbackComment.trim()}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7B2D26] to-[#9A382F] hover:from-[#64221C] hover:to-[#7B2D26] text-white px-6 py-2.5 font-bold text-xs shadow-md transition-all disabled:opacity-50"
                  >
                    {submittingFeedback ? (
                      <span>Recording Feedback...</span>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5 text-[#E8A33D]" />
                        <span>Submit Consultation Feedback &amp; Review</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border-2 border-[#6B8E5A] bg-[#F4F9F2] p-5 text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-[#6B8E5A] mx-auto" />
                <h4 className="font-temple text-base font-bold text-[#2A4720]">
                  Thank You for Your Feedback!
                </h4>
                <p className="text-xs text-[#2A4720]/90">
                  Your consultation review has been recorded into official seeker testimonials and submitted to Acharya Ji&apos;s desk.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 6. REJECTED */}
        {status === "REJECTED" && (
          <div className="my-6 rounded-2xl border-2 border-red-300 bg-red-50 p-6 text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-900 text-xs font-bold border border-red-200">
              <XCircle className="h-3.5 w-3.5 text-red-600" />
              <span>Payment Verification Rejected</span>
            </div>
            <h3 className="font-temple text-lg font-bold text-red-900">
              Payment Could Not Be Reconciled
            </h3>
            <p className="text-xs text-red-800 max-w-md mx-auto">
              {rejectionReason || "The payment transaction could not be verified against our official bank statement. Please verify your transaction reference."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={whatsappCoordinationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white px-5 py-2.5 font-bold text-xs shadow-md transition-all"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Contact Sanctum Desk on WhatsApp</span>
              </a>
              <Link
                href="/consult"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-300 bg-white hover:bg-red-100 text-red-900 px-5 py-2.5 font-bold text-xs transition-all"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Initiate New Booking</span>
              </Link>
            </div>
          </div>
        )}

        {/* 7. EXPIRED / CANCELLED */}
        {(status === "EXPIRED" || status === "CANCELLED") && (
          <div className="my-6 rounded-2xl border border-gray-300 bg-gray-50 p-6 text-center space-y-3">
            <h3 className="font-temple text-lg font-bold text-gray-800">
              Booking Request Expired
            </h3>
            <p className="text-xs text-gray-600 max-w-md mx-auto">
              This consultation booking expired because payment was not claimed within the required window.
            </p>
            <div className="pt-2">
              <Link
                href="/consult"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7B2D26] hover:bg-[#64221C] text-white px-5 py-2.5 font-bold text-xs shadow-md transition-all"
              >
                <span>Book a New Consultation</span>
              </Link>
            </div>
          </div>
        )}

        {/* Detailed Booking Summary Grid */}
        <div className="rounded-2xl border border-[#E8D8C3] bg-[#FAF5EE] p-5 text-xs text-left space-y-2">
          <div className="flex items-center justify-between border-b border-[#E8D8C3] pb-2">
            <span className="font-temple font-bold text-xs uppercase tracking-wider text-[#7B2D26]">
              Consultation Intake Details
            </span>
            <span className="text-[11px] text-[#7D6B5D]">
              Format: <strong>{format}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 pt-1">
            <div>
              <span className="text-[#7D6B5D] block">Client Name:</span>
              <strong className="text-[#3B2A1E]">{clientName}</strong>
            </div>
            <div>
              <span className="text-[#7D6B5D] block">Contact Phone:</span>
              <strong className="text-[#3B2A1E]">{clientPhone || "Provided on WhatsApp"}</strong>
            </div>
            <div>
              <span className="text-[#7D6B5D] block">Amount:</span>
              <strong className="text-[#2A4720]">Flat ₹{amount.toLocaleString("en-IN")}</strong>
            </div>
            <div>
              <span className="text-[#7D6B5D] block">Preferred Window:</span>
              <strong className="text-[#3B2A1E]">{preferredDay} ({preferredTime})</strong>
            </div>
          </div>

          {topic && (
            <div className="border-t border-[#E8D8C3]/60 pt-2 text-[11px]">
              <span className="text-[#7D6B5D] block">Consultation Focus / Concern:</span>
              <p className="text-[#3B2A1E] font-medium mt-0.5">{topic}</p>
            </div>
          )}

          {booking.intakeDetails?.birthDetails && (
            <div className="border-t border-[#E8D8C3]/60 pt-2 text-[11px]">
              <span className="text-[#7D6B5D] block">Birth Details:</span>
              <p className="text-[#3B2A1E] font-medium mt-0.5">
                {booking.intakeDetails.birthDetails.dob} ({booking.intakeDetails.birthDetails.timeOfBirth || "N/A"}) &bull; {booking.intakeDetails.birthDetails.placeOfBirth || "N/A"}
              </p>
            </div>
          )}

          {booking.intakeDetails?.propertyDetails && (
            <div className="border-t border-[#E8D8C3]/60 pt-2 text-[11px]">
              <span className="text-[#7D6B5D] block">Property Details:</span>
              <p className="text-[#3B2A1E] font-medium mt-0.5">
                {booking.intakeDetails.propertyDetails.propertyType || "Property"} &bull; {booking.intakeDetails.propertyDetails.city || "N/A"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* UPI QR Modal if user wants to view QR or claim payment */}
      {showQrModal && (
        <UpiQrModal
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
          bookingId={bookingId}
          amount={amount}
          productType={productType as any}
          serviceName={productName}
          clientName={clientName}
          clientPhone={clientPhone}
          onPaymentSubmitted={() => {
            setShowQrModal(false);
            fetchActiveBooking();
          }}
        />
      )}
    </div>
  );
};
