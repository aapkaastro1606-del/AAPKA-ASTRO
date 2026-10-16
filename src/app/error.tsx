"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home, MessageCircle } from "lucide-react";
import { MandalaDivider } from "@/components/ui/MandalaDivider";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error securely for telemetry and diagnostics
    console.error("[Graceful Degradation] Unhandled error captured by app/error.tsx:", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className="min-h-[75vh] bg-[#FBF3E7] text-[#3B2A1E] flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl text-center">
        {/* Vedic Sacred Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1 text-xs font-bold text-[#7B2D26] mb-6 shadow-xs">
          <AlertCircle className="h-3.5 w-3.5 text-[#C1662F]" />
          <span>TEMPORARY COSMIC DISRUPTION</span>
        </div>

        {/* Headline */}
        <h1 className="font-temple text-2xl sm:text-3xl lg:text-4xl font-black text-[#7B2D26] tracking-tight">
          A Momentary Disruption in the Cosmic Currents
        </h1>

        <p className="mt-4 text-xs sm:text-sm text-[#6E5545] leading-relaxed">
          We encountered an unexpected planetary interference while loading this sanctum view. Your personal information and data remain safe and uncompromised.
        </p>

        {/* Error Digest (if available) */}
        {error.digest && (
          <div className="mt-3 inline-block rounded-md bg-[#FFFDF9] border border-[#E8D8C3] px-2.5 py-1 text-[11px] font-mono text-[#8C7A6B]">
            Incident Ref: <span className="font-bold">{error.digest}</span>
          </div>
        )}

        <div className="my-6 flex justify-center">
          <MandalaDivider opacity={0.35} />
        </div>

        {/* Recovery Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#7B2D26] px-5 py-2.5 text-xs font-bold text-[#FFFDF9] hover:bg-[#96372E] transition-all shadow-xs"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#7B2D26] bg-[#FFFDF9] px-5 py-2.5 text-xs font-bold text-[#7B2D26] hover:bg-[#FBF3E7] transition-all shadow-xs"
          >
            <Home className="h-4 w-4" />
            <span>Return to Sanctum Home</span>
          </Link>
        </div>

        {/* WhatsApp Help Desk */}
        <div className="mt-8 pt-6 border-t border-[#E8D8C3]/70">
          <p className="text-[11px] text-[#6E5545] mb-2">
            If the problem persists, our desk is standing by to assist:
          </p>
          <a
            href="https://wa.me/919311215564?text=Pranam%20Acharya%20Ji%2C%20I%20experienced%20an%20issue%20loading%20the%20page%20on%20aapkaastro.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#25D366] hover:underline"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>WhatsApp Support (+91 93112 15564)</span>
          </a>
        </div>
      </div>
    </div>
  );
}
