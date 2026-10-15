"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  X,
  Copy,
  Check,
  MessageCircle,
  ShieldCheck,
  Clock,
  Sparkles,
  Smartphone,
  CheckCircle2,
  Globe,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { DiyaIcon } from "@/components/ui/DiyaIcon";

interface UpiQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  amount: number;
  productType: "astro" | "vaastu" | "kundli_pdf";
  serviceName: string;
  clientName: string;
  clientPhone: string;
  initialUpiPayLink?: string;
  onPaymentSubmitted?: () => void;
}

export const UpiQrModal: React.FC<UpiQrModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  amount,
  productType,
  serviceName,
  clientName,
  clientPhone,
  initialUpiPayLink,
  onPaymentSubmitted,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<"PAY" | "CLAIMED">("PAY");
  const [utrInput, setUtrInput] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [qrError, setQrError] = useState(false);

  // Dynamic payment settings loaded from database
  const [paymentSettings, setPaymentSettings] = useState({
    upiId: "9311215564@okbizaxis",
    payeeName: "Aapka Astro",
    qrImageUrl: null as string | null,
    whatsappNumber: "+91 93112 15564",
  });

  useEffect(() => {
    if (isOpen) {
      fetch("/api/booking/status?bookingId=" + encodeURIComponent(bookingId))
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.paymentSettings) {
            setPaymentSettings(data.paymentSettings);
          }
          if (data.booking?.bookingStatus === "PAYMENT_CLAIMED" || data.booking?.bookingStatus === "CONFIRMED") {
            setStep("CLAIMED");
          }
        })
        .catch(() => {});
    }
  }, [isOpen, bookingId]);

  const upiId = paymentSettings.upiId || "9311215564@okbizaxis";
  const upiPayee = paymentSettings.payeeName || "Aapka Astro";
  const rawWa = (paymentSettings.whatsappNumber || "919311215564").replace(/[^0-9]/g, "");

  // Pre-filled UPI Payment Intent URL with locked amount and booking reference
  const upiUrl =
    initialUpiPayLink ||
    `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiPayee)}&am=${amount}&cu=INR&tr=${bookingId}&tn=${encodeURIComponent(
      `Booking ${bookingId}`
    )}`;

  // Construct pre-filled WhatsApp message
  const constructWhatsAppMessage = (utrVal: string) => {
    return (
      `Pranam Acharya Ji,\n\n` +
      `I have submitted my payment for consultation.\n\n` +
      `• Seeker Name: ${clientName || "Seeker"}\n` +
      `• Consultation: ${serviceName}\n` +
      `• Locked Amount: ₹${amount.toLocaleString("en-IN")}\n` +
      `• Booking Reference: ${bookingId}\n` +
      `• UTR / Txn Ref: ${utrVal?.trim() || "Attached in payment screenshot"}\n\n` +
      `Attached is my payment screenshot for your bank verification.`
    );
  };

  const whatsappMessage = constructWhatsAppMessage(utrInput);
  const whatsappLink = `https://wa.me/${rawWa}?text=${encodeURIComponent(whatsappMessage)}`;
  const outsideIndiaWaLink = `https://wa.me/${rawWa}?text=${encodeURIComponent(
    `Hello Aapka Astro, I am outside India and would like to consult with Acharya Niraj Kumar. Please share international payment options for Booking ID: ${bookingId}.`
  )}`;

  useEffect(() => {
    if (isOpen && amount > 0) {
      setQrError(false);
      QRCode.toDataURL(upiUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: "#3B2A1E",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => {
          console.error("Failed to generate dynamic UPI QR:", err);
          setQrError(true);
        });
    }
  }, [isOpen, amount, upiUrl]);

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    navigator.clipboard?.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // "I Have Paid" Button Clicked:
  // 1. Sets PAYMENT_CLAIMED on server
  // 2. Emails the Owner
  // 3. Opens WhatsApp with prefilled message
  // 4. Transitions UI to status page ("Payment received for verification. Promise no time.")
  const handleIHavePaid = async () => {
    setClaiming(true);
    try {
      await fetch("/api/booking/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          utr: utrInput.trim() || undefined,
        }),
      });
    } catch (e) {
      console.warn("Claim API dispatch completed:", e);
    } finally {
      setClaiming(false);
      setStep("CLAIMED");

      // Open WhatsApp with prefilled message
      if (typeof window !== "undefined") {
        window.open(whatsappLink, "_blank", "noopener,noreferrer");
      }

      if (onPaymentSubmitted) {
        onPaymentSubmitted();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border-2 border-[#E8D8C3] bg-[#FFFDF9] shadow-2xl my-8 overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[#E8D8C3] bg-[#7B2D26] px-6 py-4 text-[#FBF3E7]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#64221C] text-[#E8A33D]">
              <DiyaIcon size={20} />
            </div>
            <div>
              <h3 className="font-temple text-lg font-bold tracking-wide">
                Direct UPI QR Payment &bull; Zero Gateway Fee
              </h3>
              <p className="text-[11px] text-[#E8D8C3]">
                Official Sanctum Account &bull; 100% Commission-Free
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#E8D8C3] hover:bg-[#64221C] hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {step === "PAY" ? (
            <>
              {/* Booking Summary Box */}
              <div className="rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] p-4 text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6E5545]">
                  {serviceName}
                </span>
                <div className="mt-1 flex items-baseline justify-center gap-2">
                  <span className="font-temple text-3xl font-extrabold text-[#7B2D26]">
                    ₹{amount.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-[#6E5545] font-semibold">Locked Server Rate</span>
                </div>
                <div className="mt-1 flex items-center justify-center gap-1.5 text-[11px] text-[#6E5545]">
                  <span>Booking Ref:</span>
                  <span className="font-mono font-bold text-[#7B2D26] bg-white px-2 py-0.5 rounded border border-[#E8D8C3]">
                    {bookingId}
                  </span>
                </div>
              </div>

              {/* Dynamic QR Code (Static image as fallback) */}
              <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#E8D8C3] bg-white shadow-2xs">
                {qrDataUrl && !qrError ? (
                  <img
                    src={qrDataUrl}
                    alt={`UPI Payment QR for ${bookingId}`}
                    className="h-52 w-52 rounded-lg border border-stone-200"
                  />
                ) : paymentSettings.qrImageUrl ? (
                  <img
                    src={paymentSettings.qrImageUrl}
                    alt={`Static UPI Payment QR for ${bookingId}`}
                    className="h-52 w-52 rounded-lg border border-stone-200 object-contain"
                  />
                ) : (
                  <div className="flex h-52 w-52 items-center justify-center rounded-lg bg-stone-100 text-xs text-stone-500">
                    Generating UPI QR...
                  </div>
                )}
                <span className="mt-2 text-[11px] font-medium text-[#6E5545]">
                  Scan with GPay, PhonePe, Paytm, BHIM, or Cred
                </span>
              </div>

              {/* UPI ID Row */}
              <div className="flex items-center justify-between rounded-xl border border-[#E8D8C3] bg-[#FAF5EE] p-3 text-xs">
                <div className="truncate pr-2">
                  <span className="text-[10px] uppercase font-bold text-[#6E5545] block">
                    Payee: {upiPayee}
                  </span>
                  <div className="font-mono font-bold text-[#7B2D26] text-xs sm:text-sm truncate">
                    {upiId}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="flex items-center gap-1.5 rounded-lg bg-[#FBF3E7] px-3 py-1.5 text-xs font-bold text-[#7B2D26] hover:bg-[#E8D8C3] transition-colors shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy UPI</span>
                    </>
                  )}
                </button>
              </div>

              {/* Mobile Deep Link */}
              <div className="sm:hidden">
                <a
                  href={upiUrl}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#3B2A1E] py-2.5 text-xs font-bold text-[#FBF3E7] hover:bg-black transition-colors"
                >
                  <Smartphone className="h-4 w-4" />
                  <span>Tap to Open Installed UPI App</span>
                </a>
              </div>

              {/* Optional UTR Input Field */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-[#3B2A1E] flex items-center justify-between">
                  <span>UTR / Bank Reference Number:</span>
                  <span className="text-[10px] text-stone-500 font-normal">(Optional, from UPI receipt)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 428901284910 or leave blank if sending screenshot"
                  value={utrInput}
                  onChange={(e) => setUtrInput(e.target.value)}
                  className="w-full rounded-xl border border-[#E8D8C3] bg-white p-2.5 text-xs font-mono text-[#3B2A1E] focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                />
              </div>

              {/* Primary "I Have Paid" Button */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleIHavePaid}
                  disabled={claiming}
                  className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-[#7B2D26] py-3.5 px-6 font-bold text-white shadow-md hover:bg-[#64221C] transition-all text-sm disabled:opacity-60"
                >
                  <CheckCircle2 className="h-5 w-5 text-[#E8A33D]" />
                  <span>{claiming ? "Submitting for Verification..." : "I Have Paid — Submit for Verification"}</span>
                </button>

                <p className="text-[11px] text-center text-[#6E5545]">
                  Clicking opens WhatsApp to submit your payment screenshot to <strong>{paymentSettings.whatsappNumber}</strong>.
                </p>
              </div>

              {/* Mandatory Checkout Note: Outside India */}
              <div className="rounded-xl border border-[#E8D8C3] bg-[#FAF5EE] p-3 text-center text-xs text-[#6E5545] flex items-center justify-center gap-2">
                <Globe className="h-4 w-4 text-[#C1662F] shrink-0" />
                <span>
                  <strong>Outside India?</strong>{" "}
                  <a
                    href={outsideIndiaWaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#7B2D26] font-bold underline hover:text-[#C1662F]"
                  >
                    Message us on WhatsApp for payment options &rarr;
                  </a>
                </span>
              </div>
            </>
          ) : (
            /* STATUS PAGE: Payment received for verification (Promise NO TIME) */
            <div className="space-y-5 text-center py-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-purple-700 border-2 border-purple-300 animate-pulse">
                <Clock className="h-8 w-8" />
              </div>

              <div>
                <h4 className="font-temple text-2xl font-bold text-[#7B2D26]">
                  Payment Received for Verification
                </h4>
                <p className="mt-2 text-xs text-[#6E5545] max-w-sm mx-auto leading-relaxed">
                  Your payment submission for <strong>{serviceName}</strong> (Ref: <span className="font-mono font-bold text-[#7B2D26]">{bookingId}</span>) has been recorded in the Owner Verification Queue.
                </p>
              </div>

              <div className="rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] p-4 text-xs text-left space-y-2">
                <div className="flex items-center gap-1.5 text-[#7B2D26] font-bold">
                  <ShieldCheck className="h-4 w-4 text-[#6B8E5A]" />
                  <span>Verification Policy &amp; Next Steps:</span>
                </div>
                <p className="text-[#3B2A1E]">
                  • <strong>Direct Bank Reconciliation:</strong> Our sanctum desk reconciles payment receipts directly with official bank records during temple business hours.
                </p>
                <p className="text-[#3B2A1E]">
                  • <strong>Time Slot &amp; Meeting Link:</strong> Once your transfer is confirmed credited, Acharya Ji assigns your consultation slot and shares the Google Meet / WhatsApp call link directly in your account and via email.
                </p>
                {utrInput && (
                  <p className="text-stone-600 font-mono text-[11px] pt-1 border-t border-[#E8D8C3]">
                    Recorded UTR: {utrInput}
                  </p>
                )}
              </div>

              <div className="space-y-2 pt-2">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-xs font-bold text-white hover:bg-[#20ba5a] transition-colors shadow-sm"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Send Screenshot on WhatsApp ({paymentSettings.whatsappNumber})</span>
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-xl bg-[#7B2D26] py-3 text-xs font-bold text-[#FBF3E7] hover:bg-[#64221C] transition-colors"
                >
                  Done / View in My Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
