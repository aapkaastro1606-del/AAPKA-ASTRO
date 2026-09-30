"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  PhoneCall,
  CheckCircle2,
  FileText,
  ArrowRight,
  Clock,
  Sparkles,
  Receipt,
  HelpCircle,
} from "lucide-react";
import { PLACEHOLDER_ASTROLOGER, FLAT_CONSULTATION_PRICING, FIRST_CONSULTATION_OFFER } from "@/config/placeholderContent";
import { ClientAccountStore } from "@/lib/store/clientAccountStore";

export default function WalletPage() {
  const consultations = ClientAccountStore.getConsultationHistory();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadInvoice = (id: string) => {
    setDownloadingId(id);
    setTimeout(() => {
      setDownloadingId(null);
      alert(`Consultation invoice #${id} downloaded successfully.`);
    }, 800);
  };

  return (
    <div className="bg-[#FBF3E7] py-8 lg:py-16 min-h-screen text-[#3B2A1E]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E8D8C3] bg-[#FFFDF9] px-3.5 py-1 text-xs font-semibold text-[#7B2D26] shadow-sm mb-3 font-temple">
            <Receipt className="h-3.5 w-3.5 text-[#C1662F]" />
            <span>TRANSPARENT PAY-PER-BOOKING BILLING</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-temple text-[#7B2D26] tracking-tight">
            Consultation Bookings &amp; Invoices
          </h1>
          <p className="mt-2 text-[#7D6B5D] text-xs sm:text-sm font-body">
            All consultations are billed on a fixed, flat-fee basis. Pay directly per session with zero per-minute debits, zero wallet recharge minimums, and full upfront transparency.
          </p>
        </div>

        {/* Pricing Notice Card */}
        <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6B8E5A]/15 text-[#2A4720] text-xs font-bold">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#6B8E5A]" />
                <span>Pay-Per-Booking Consultation Model</span>
              </div>
              <h2 className="font-temple text-xl sm:text-2xl font-bold text-[#7B2D26]">
                Flat ₹1,051/- for First Consultation
              </h2>
              <p className="text-xs sm:text-sm text-[#6E5545] leading-relaxed">
                Enjoy complete 1-on-1 private guidance with {PLACEHOLDER_ASTROLOGER.displayName} across Voice Call, Video Call, or Live Chat at a single flat fee (Standard ₹2,100 — 50% promotional discount).
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#6E5545] pt-2">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-[#6B8E5A]" />
                  <span>No hidden per-minute debits</span>
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-[#6B8E5A]" />
                  <span>Direct UPI / Card checkout</span>
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-[#6B8E5A]" />
                  <span>Instant GST invoice provided</span>
                </span>
              </div>
            </div>

            <div className="w-full md:w-auto shrink-0 flex flex-col items-center sm:items-end gap-3">
              <div className="text-right">
                <span className="text-xs text-[#6E5545] line-through block">Regular ₹2,100</span>
                <span className="font-mono text-3xl font-black text-[#7B2D26]">₹1,051</span>
                <span className="text-[10px] text-[#6B8E5A] font-bold block">50% First-Time Savings</span>
              </div>
              <Link
                href="/consult?offer=FIRST1051"
                className="w-full sm:w-auto rounded-xl bg-[#7B2D26] hover:bg-[#64221C] px-6 py-3 text-xs sm:text-sm font-bold text-[#FFFDF9] shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Book Consultation (₹1,051)</span>
                <ArrowRight className="h-4 w-4 text-[#E8A33D]" />
              </Link>
            </div>
          </div>
        </div>

        {/* Consultation Receipts / Invoices Table */}
        <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-temple text-lg font-bold text-[#7B2D26] flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#C1662F]" />
                <span>Your Consultation Receipts &amp; Invoices</span>
              </h3>
              <p className="text-xs text-[#6E5545] mt-0.5">
                Download tax receipts and booking confirmations for your consultations.
              </p>
            </div>
            <Link
              href="/account/consult"
              className="text-xs font-bold text-[#7B2D26] hover:underline flex items-center gap-1"
            >
              <span>Manage active bookings</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {consultations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#E8D8C3] bg-[#FBF3E7] p-8 text-center space-y-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFFDF9] text-[#6E5545] shadow-xs">
                <Receipt className="h-6 w-6 text-[#C1662F]" />
              </div>
              <h4 className="font-temple text-base font-bold text-[#7B2D26]">No Prior Invoices</h4>
              <p className="text-xs text-[#6E5545] max-w-sm mx-auto">
                You haven&apos;t booked a consultation yet. Book your first session with Acharya Ji at the promotional flat rate of ₹1,051/-.
              </p>
              <Link
                href="/consult?offer=FIRST1051"
                className="inline-flex items-center gap-2 rounded-xl bg-[#7B2D26] px-5 py-2.5 text-xs font-bold text-[#FFFDF9] hover:bg-[#64221C] transition-all"
              >
                <span>Book First Consultation</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#E8A33D]" />
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E8D8C3] text-[11px] font-bold text-[#6E5545] uppercase tracking-wider">
                    <th className="pb-3 pl-2">Session ID &amp; Date</th>
                    <th className="pb-3">Consultation Mode</th>
                    <th className="pb-3">Topic</th>
                    <th className="pb-3 text-right">Fee Paid</th>
                    <th className="pb-3 text-right pr-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8D8C3]/50">
                  {consultations.map((sess) => (
                    <tr key={sess.id} className="hover:bg-[#FBF3E7]/60 transition-colors">
                      <td className="py-3.5 pl-2">
                        <span className="font-mono font-bold text-[#7B2D26] block">#{sess.id}</span>
                        <span className="text-[10px] text-[#6E5545]">{sess.date}</span>
                      </td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#FAF1E4] px-2 py-0.5 font-bold text-[#7B2D26] text-[11px]">
                          <PhoneCall className="h-3 w-3 text-[#C1662F]" />
                          <span>{sess.mode}</span>
                        </span>
                      </td>
                      <td className="py-3.5 text-[#3B2A1E] font-medium max-w-xs truncate">
                        {sess.topic}
                      </td>
                      <td className="py-3.5 text-right font-mono font-bold text-[#2A4720]">
                        {sess.amount || "₹1,051"}
                      </td>
                      <td className="py-3.5 text-right pr-2">
                        <button
                          type="button"
                          onClick={() => handleDownloadInvoice(sess.id)}
                          disabled={downloadingId === sess.id}
                          className="rounded-lg border border-[#E8D8C3] bg-[#FFFDF9] px-3 py-1 text-[11px] font-bold text-[#7B2D26] hover:bg-[#FAF1E4] transition-all cursor-pointer disabled:opacity-50"
                        >
                          {downloadingId === sess.id ? "Preparing..." : "Invoice PDF"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Statutory Policy & Transition Note */}
        <div className="rounded-2xl border border-[#E8D8C3] bg-[#FAF1E4] p-5 text-xs text-[#6E5545] space-y-2">
          <div className="flex items-center gap-2 font-bold text-[#7B2D26]">
            <HelpCircle className="h-4 w-4 text-[#C1662F]" />
            <span>Notice Regarding Legacy Per-Minute Wallet Debits</span>
          </div>
          <p className="leading-relaxed text-[11px]">
            In accordance with client operational guidelines, Aapka Astro operates exclusively on a transparent flat-fee pay-per-booking model. Second-by-second wallet deductions and wallet recharge packs have been retired. All consultations are paid directly per booking without recurring debits. Historical wallet transactions remain archived for statutory tax and reconciliation purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
