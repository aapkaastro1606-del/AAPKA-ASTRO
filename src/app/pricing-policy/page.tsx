import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { CreditCard, ArrowLeft, AlertCircle, ShieldCheck, CheckCircle2, PhoneCall, Mail, Sparkles } from "lucide-react";
import { PLACEHOLDER_CONTACT_INFO, PLACEHOLDER_ASTROLOGER, ADMIN_CONFIGURABLE_PRICING, FIRST_CONSULTATION_OFFER } from "@/config/placeholderContent";

export const metadata: Metadata = {
  title: "Pricing Policy & Transparent Rates | Aapka Astro",
  description: "Transparent, upfront pricing policy for 1-on-1 consultations with Acharya Niraj Kumar. No hidden platform charges or surge fees.",
};

export default function PricingPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF9] py-12 px-4 sm:px-6 lg:px-8 text-[#3B2A1E]">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-medium text-[#6E5545]">
          <Link href="/" className="hover:text-[#7B2D26] transition-colors flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" />
            Home
          </Link>
          <span>/</span>
          <span className="text-[#7B2D26] font-bold">Pricing Policy</span>
        </nav>

        {/* Header */}
        <header className="border-b border-[#E8D8C3] pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7B2D26]/10 text-[#7B2D26] text-xs font-bold uppercase tracking-wider mb-3">
            <CreditCard className="h-3.5 w-3.5" />
            Honest &amp; Transparent Billing
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-temple text-[#7B2D26]">
            Pricing Policy &amp; Fee Structure
          </h1>
          <p className="text-xs text-[#6E5545] mt-2">
            Last Updated: March 2026 &bull; Direct access to Acharya Niraj Kumar &bull; Zero marketplace commission markups
          </p>
        </header>

        {/* Pricing Transparency Notice */}
        <div className="p-4 rounded-xl bg-[#FBF3E7] border border-[#E8A33D]/60 text-xs text-[#7B2D26] flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-[#C1662F] shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Pricing Transparency Notice:</strong>
            Aapka Astro operates on a clear, upfront pay-per-booking flat-fee consultation model. For your first consultation, you enjoy a special promotional rate of Flat ₹1,051/- (Regular ₹2,100 — 50% discount). All rates published on this page are inclusive of statutory taxes. There are never surge fees, convenience markups, hidden per-minute debits, or surprise subscriptions.
          </div>
        </div>

        {/* Active Consultation Rates Table */}
        <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              1-on-1 Vedic Consultation Structure
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#6B8E5A]/15 text-[#2A4720] font-bold">
              Special First Consultation Offer: Flat ₹1,051/-
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {/* Live Chat */}
            <div className="p-5 rounded-xl bg-[#FBF3E7]/60 border border-[#E8D8C3] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#7B2D26] uppercase tracking-wider">
                  Live Chat Consultation
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#7B2D26] text-[#FFFDF9] font-bold">
                  CHAT
                </span>
              </div>
              <div className="space-y-0.5">
                <div className="text-2xl font-bold font-temple text-[#7B2D26]">
                  Flat ₹1,051
                  <span className="text-xs font-normal text-[#6E5545] line-through ml-1.5">₹2,100</span>
                </div>
                <div className="text-xs text-[#6B8E5A] font-semibold">
                  First Session: 50% Savings Applied
                </div>
              </div>
              <ul className="text-xs text-[#6E5545] space-y-1 pt-1 border-t border-[#E8D8C3]">
                <li>&bull; Real-time encrypted text</li>
                <li>&bull; Live Kundli chart analysis</li>
                <li>&bull; Complete personal Q&amp;A</li>
              </ul>
            </div>

            {/* Voice Call */}
            <div className="p-5 rounded-xl bg-[#FBF3E7]/60 border border-[#E8D8C3] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#7B2D26] uppercase tracking-wider">
                  Voice Call Consultation
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#C1662F] text-[#FFFDF9] font-bold">
                  VOICE
                </span>
              </div>
              <div className="space-y-0.5">
                <div className="text-2xl font-bold font-temple text-[#7B2D26]">
                  Flat ₹1,051
                  <span className="text-xs font-normal text-[#6E5545] line-through ml-1.5">₹2,100</span>
                </div>
                <div className="text-xs text-[#6B8E5A] font-semibold">
                  First Session: 50% Savings Applied
                </div>
              </div>
              <ul className="text-xs text-[#6E5545] space-y-1 pt-1 border-t border-[#E8D8C3]">
                <li>&bull; High-definition direct audio</li>
                <li>&bull; In-depth voice consultation</li>
                <li>&bull; Direct with Acharya Ji</li>
              </ul>
            </div>

            {/* Video Call */}
            <div className="p-5 rounded-xl bg-[#FBF3E7]/60 border border-[#E8D8C3] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#7B2D26] uppercase tracking-wider">
                  Video Call Consultation
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#E8A33D] text-[#3B2A1E] font-bold">
                  VIDEO
                </span>
              </div>
              <div className="space-y-0.5">
                <div className="text-2xl font-bold font-temple text-[#7B2D26]">
                  Flat ₹1,051
                  <span className="text-xs font-normal text-[#6E5545] line-through ml-1.5">₹2,100</span>
                </div>
                <div className="text-xs text-[#6B8E5A] font-semibold">
                  First Session: 50% Savings Applied
                </div>
              </div>
              <ul className="text-xs text-[#6E5545] space-y-1 pt-1 border-t border-[#E8D8C3]">
                <li>&bull; Face-to-face sacred session</li>
                <li>&bull; Screen-share horoscope reading</li>
                <li>&bull; Deepest spiritual connection</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Detailed Policy Clauses */}
        <div className="prose max-w-none text-xs sm:text-sm text-[#6E5545] space-y-6 leading-relaxed">
          {/* Section 1 */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              1. Pay-Per-Booking Consultation Model
            </h2>
            <p>
              Aapka Astro provides transparent, respectful consultations without the stress of per-minute meters:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Unified Flat Fee:</strong> Whether you prefer Voice Call, Video Call, or Live Chat, the fee remains identical. You select your preferred mode when booking.
              </li>
              <li>
                <strong>First-Time Promotional Rate:</strong> Every new seeker is eligible for our introductory offer of Flat ₹1,051/- (Regular ₹2,100).
              </li>
              <li>
                <strong>Comprehensive Reading Scope:</strong> The reading covers all critical aspects of life: Career Insights, Financial Prosperity, Relationship Compatibility, Health, and Practical Vedic/Vastu Remedies.
              </li>
              <li>
                <strong>No Surprise Meter Deductions:</strong> You pay a single flat fee upfront. There are no sudden call cut-offs due to per-second wallet exhaustion.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              2. Free Calculators &amp; Content Guarantee
            </h2>
            <p>
              We firmly believe foundational Vedic knowledge must remain accessible to all seekers. The following services are permanently 100% free with no credit card or payment required:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
              <span className="flex items-center gap-1.5 text-[#3B2A1E]">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#6B8E5A]" />
                Janam Kundli Generator
              </span>
              <span className="flex items-center gap-1.5 text-[#3B2A1E]">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#6B8E5A]" />
                Kundli Milan (36 Gunas)
              </span>
              <span className="flex items-center gap-1.5 text-[#3B2A1E]">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#6B8E5A]" />
                Love &amp; FLAMES Calculators
              </span>
              <span className="flex items-center gap-1.5 text-[#3B2A1E]">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#6B8E5A]" />
                Daily Vedic Horoscope
              </span>
              <span className="flex items-center gap-1.5 text-[#3B2A1E]">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#6B8E5A]" />
                Daily Astronomical Panchang
              </span>
              <span className="flex items-center gap-1.5 text-[#3B2A1E]">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#6B8E5A]" />
                Hindu Festival Calendar
              </span>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              3. Taxes, Currency &amp; International Payments
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Goods &amp; Services Tax (GST):</strong> Displayed rates are inclusive of all applicable statutory taxes where required.
              </li>
              <li>
                <strong>Currency Conversion:</strong> Indian users are billed in Indian Rupees (INR ₹). International seekers may pay via international credit cards or global gateways in USD, EUR, or GBP calculated via real-time market exchange rates.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="bg-[#FBF3E7] p-6 rounded-2xl border border-[#E8D8C3] space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              4. Billing Inquiries &amp; Wallet Support
            </h2>
            <p>
              If you experience a recharge delay or have questions regarding invoice generation, please contact our payments desk:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a
                href={`mailto:${PLACEHOLDER_CONTACT_INFO.email}?subject=Billing%20Inquiry`}
                className="inline-flex items-center gap-2 font-bold text-[#7B2D26] hover:text-[#C1662F]"
              >
                <Mail className="h-4 w-4" />
                {PLACEHOLDER_CONTACT_INFO.email}
              </a>
              <a
                href={`tel:${PLACEHOLDER_CONTACT_INFO.phoneRaw}`}
                className="inline-flex items-center gap-2 font-bold text-[#7B2D26] hover:text-[#C1662F]"
              >
                <PhoneCall className="h-4 w-4" />
                {PLACEHOLDER_CONTACT_INFO.phone}
              </a>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="pt-6 border-t border-[#E8D8C3] flex flex-wrap items-center justify-between text-xs text-[#6E5545] gap-4">
          <Link href="/terms" className="hover:text-[#7B2D26] underline">
            Terms of Service
          </Link>
          <Link href="/refund-policy" className="hover:text-[#7B2D26] underline">
            Refund &amp; Cancellation Policy
          </Link>
          <Link href="/privacy-policy" className="hover:text-[#7B2D26] underline">
            Privacy Policy
          </Link>
          <Link href="/disclaimer" className="hover:text-[#7B2D26] underline">
            Vedic Astrology Disclaimer
          </Link>
        </div>
      </div>
    </div>
  );
}
