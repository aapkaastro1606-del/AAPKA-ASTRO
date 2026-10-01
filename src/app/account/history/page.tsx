"use client";

import React from "react";
import Link from "next/link";
import { ClientAccountStore } from "@/lib/store/clientAccountStore";
import { PLACEHOLDER_ASTROLOGER } from "@/config/placeholderContent";
import { MandalaDivider } from "@/components/ui/MandalaDivider";
import { DiyaIcon } from "@/components/ui/DiyaIcon";
import {
  Clock,
  ArrowLeft,
  Download,
  FileText,
  Star,
  PhoneCall,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export default function AccountHistoryPage() {
  const consultations = ClientAccountStore.getConsultationHistory();

  const handleDownloadSummary = (id: string) => {
    alert(`Downloading Official Astrological Prescription & Summary for session ${id} in PDF format...`);
  };

  return (
    <div className="bg-[#FBF3E7] text-[#3B2A1E] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Navigation & Header */}
        <div>
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7B2D26] hover:underline mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Account Dashboard</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-temple text-2xl sm:text-3xl font-bold text-[#7B2D26]">
                Consultation Records &amp; Remedies
              </h1>
              <p className="text-xs sm:text-sm text-[#6E5545] mt-1">
                Access written session notes, prescribed Vedic remedies, and downloadable summaries.
              </p>
            </div>

            <Link
              href="/account/consult"
              className="inline-flex items-center gap-2 rounded-xl bg-[#7B2D26] px-5 py-2.5 text-xs font-bold text-[#FBF3E7] hover:bg-[#96372E] transition-all shadow-sm"
            >
              <PhoneCall className="h-4 w-4 text-[#E8A33D]" />
              <span>Start New Consultation</span>
            </Link>
          </div>
        </div>

        {/* Records List */}
        <div className="space-y-6">
          {consultations.length === 0 ? (
            <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-12 text-center">
              <Clock className="h-10 w-10 text-[#C1662F] mx-auto mb-3" />
              <h3 className="font-temple text-lg font-bold text-[#7B2D26]">No Past Sessions Yet</h3>
              <p className="text-xs text-[#6E5545] mt-1">
                Your past WhatsApp, Google Meet, and consultation session summaries will be automatically preserved here.
              </p>
            </div>
          ) : (
            consultations.map((session) => (
              <div
                key={session.id}
                className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm space-y-6"
              >
                {/* Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E8D8C3]">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-[#7B2D26] bg-[#FBF3E7] px-2.5 py-1 rounded-md border border-[#E8D8C3]">
                      {session.id}
                    </span>
                    <span className="text-xs font-semibold text-[#6E5545]">
                      {session.date} • {session.duration} ({session.mode})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-[#7B2D26]">
                      {session.amount}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDownloadSummary(session.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#E8D8C3] bg-[#FBF3E7] px-3 py-1.5 text-xs font-bold text-[#3B2A1E] hover:bg-[#E8D8C3] transition-all"
                    >
                      <Download className="h-3.5 w-3.5 text-[#C1662F]" />
                      <span>Summary PDF</span>
                    </button>
                  </div>
                </div>

                {/* Topic & Astrologer */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C1662F]">
                    Primary Consultation Focus
                  </span>
                  <h3 className="font-temple text-lg font-bold text-[#7B2D26] mt-0.5">
                    {session.topic}
                  </h3>
                  <p className="text-xs text-[#6E5545] mt-1">
                    Consulted with: <strong>{session.astrologer}</strong>
                  </p>
                </div>

                {/* Remedy Box */}
                <div className="rounded-2xl border border-[#E8A33D]/40 bg-[#FBF3E7] p-5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#7B2D26] mb-2">
                    <Sparkles className="h-4 w-4 text-[#E8A33D]" />
                    <span>Prescribed Vedic Remedy &amp; Mantras</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#3B2A1E] leading-relaxed font-semibold">
                    {session.remedy}
                  </p>
                </div>

                {/* Astrologer's Observations */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#6E5545] mb-1">
                    Astrological Observations &amp; Dasha Notes:
                  </h4>
                  <p className="text-xs text-[#3B2A1E]/90 leading-relaxed bg-[#FFFDF9] p-4 rounded-xl border border-[#E8D8C3]">
                    {session.notes}
                  </p>
                </div>

                {/* Footer Action */}
                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-[#6B8E5A] font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Archived in your permanent Vedic record</span>
                  </span>

                  {!session.hasReview ? (
                    <Link
                      href="/account/reviews"
                      className="inline-flex items-center gap-1 font-bold text-[#C1662F] hover:underline"
                    >
                      <Star className="h-3.5 w-3.5" />
                      <span>Leave a Review for this Session</span>
                    </Link>
                  ) : (
                    <span className="text-[#6E5545]">Feedback Submitted</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
