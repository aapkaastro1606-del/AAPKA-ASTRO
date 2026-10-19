import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { FileText, ArrowLeft, AlertCircle, ShieldCheck, Mail, PhoneCall } from "lucide-react";
import { PLACEHOLDER_CONTACT_INFO, PLACEHOLDER_ASTROLOGER } from "@/config/placeholderContent";

export const metadata: Metadata = {
  title: "Terms of Service & Consultation Agreement | Aapka Astro",
  description: "Official Terms and Conditions governing use of Aapka Astro, live consultations, and digital astrological tools.",
};

export default function TermsOfServicePage() {
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
          <span className="text-[#7B2D26] font-bold">Terms of Service</span>
        </nav>

        {/* Header */}
        <header className="border-b border-[#E8D8C3] pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7B2D26]/10 text-[#7B2D26] text-xs font-bold uppercase tracking-wider mb-3">
            <FileText className="h-3.5 w-3.5" />
            User Agreement &amp; Operating Rules
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-temple text-[#7B2D26]">
            Terms of Service &amp; Consultation
          </h1>
          <p className="text-xs text-[#6E5545] mt-2">
            Last Updated: March 2026 &bull; Governing all website access, consultation bookings, and live sessions
          </p>
        </header>

        {/* Pending Lawyer Review Notice */}
        <div className="p-4 rounded-xl bg-[#FBF3E7] border border-[#E8A33D]/60 text-xs text-[#7B2D26] flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-[#C1662F] shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Terms of Service &amp; Consultation Agreement:</strong>
              By accessing aapkaastro.com, creating a seeker account, or booking a consultation with Acharya Niraj Kumar, you agree to abide by these terms. This document constitutes a binding electronic agreement.
            </div>
          </div>
          <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#7B2D26]/10 text-[#7B2D26] border border-[#7B2D26]/20">
            Pending Lawyer Review
          </span>
        </div>

        {/* Terms Articles */}
        <div className="prose max-w-none text-xs sm:text-sm text-[#6E5545] space-y-6 leading-relaxed">
          {/* Article 1 */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              1. Preamble &amp; Description of Platform
            </h2>
            <p>
              Aapka Astro (&quot;Platform&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;) provides authentic classical Vedic astrology (Parashari, Jaimini, Nadi Jyotish), AstroVastu, and Devta Vastu advisory services conducted personally by Acharya Niraj Kumar. Our platform offers free computerized calculation engines (Kundli, Panchang, Compatibility, Astrological Calculators) as well as paid 1-on-1 consultations conducted directly via WhatsApp Call or Google Meet.
            </p>
            <p>
              Aapka Astro is a dedicated private practice and boutique consultation sanctum, not an unvetted public aggregator or freelance marketplace.
            </p>
          </section>

          {/* Article 2 */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              2. User Eligibility &amp; Account Responsibility
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                You must be at least 18 years of age (or have explicit parental/guardian supervision) to book paid astrological consultations, purchase reports, or transact via the platform.
              </li>
              <li>
                You agree to provide true, accurate, current, and complete birth coordinates (Exact Date of Birth, Exact Time of Birth, and Specific Town/City of Birth). You acknowledge that astrological mathematical algorithms (Lagna, Bhava Chalit, Navamsha, and Dasha calculations) are intrinsically sensitive to input accuracy.
              </li>
              <li>
                You are solely responsible for maintaining the confidentiality of your account credentials, login OTPs, and authentication keys.
              </li>
            </ul>
          </section>

          {/* Article 3 */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              3. Consultation Etiquette &amp; Code of Conduct
            </h2>
            <p>
              We maintain a revered, respectful environment honoring sacred spiritual traditions:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Clients must interact respectfully and courteously with Acharya Ji and our sanctum support team.
              </li>
              <li>
                Abusive, profane, harassing, obscene, sexually explicit, defamatory, or threatening language will result in immediate consultation termination without refund, and potential permanent banning of the user&apos;s phone number.
              </li>
              <li>
                Aapka Astro does NOT facilitate or endorse unethical practices such as black magic (Abhichara/Tantra for harm), illegal sex determination during pregnancy, betting/gambling tips, or unlawful activities.
              </li>
            </ul>
          </section>

          {/* Article 4 */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E8D8C3] pb-2">
              <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
                4. Direct UPI Payments, Manual Verification &amp; Pricing Rules
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FBF3E7] text-[#C1662F] border border-[#E8A33D]/40">
                Pending Lawyer Review
              </span>
            </div>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Direct UPI Payment Model:</strong> All consultations and reports on Aapka Astro are payable exclusively via direct UPI transfer (Google Pay, PhonePe, Paytm, BHIM, Cred) by scanning the official merchant standee QR code or using our verified merchant UPI ID (<code>9311215564@okbizaxis</code>, Payee: <strong>Aapka Astro Official</strong>). We do not employ third-party payment gateway aggregators; there are zero transaction markups or gateway fees.
              </li>
              <li>
                <strong>Manual Bank Verification Standard:</strong> Because payments are received directly by UPI without automated gateway callbacks, <em>the bank or UPI business account credit record is the sole and ultimate proof of payment</em>. Submitting a transaction reference (UTR) or payment screenshot via WhatsApp (+91 93112 15564) initiates manual verification. Bookings transition to &quot;CONFIRMED&quot; only after our accounts desk verifies that the funds have physically cleared in our bank account.
              </li>
              <li>
                <strong>First-Time Astro Consultation Rule (₹1,051 vs ₹2,100):</strong>
                First-time seekers are eligible for our promotional introductory rate of Flat ₹1,051/- (50% discount on regular ₹2,100). Eligibility is strictly evaluated server-side: a user qualifies as a first-time client only if they have zero previously confirmed, scheduled, or completed Astro consultations. All subsequent Astro consultations are charged at the standard rate of Flat ₹2,100/-. Only one open Astro booking is permitted per user at a time.
              </li>
              <li>
                <strong>Vaastu Consultation Pricing:</strong> Flat ₹15,000/- (discounted from ₹25,000) is the standing promotional fee for all residential, commercial, and industrial property audits, with no first-time restriction.
              </li>
              <li>
                <strong>Kundli Full PDF Report:</strong> Free online chart generation is permanently complimentary. Comprehensive, multi-page downloadable PDF reports are available for Flat ₹501/- one-time fee, unlocked following manual payment verification.
              </li>
              <li>
                <strong>Booking Expiration:</strong> Unpaid bookings that remain unclaimed automatically expire after a configurable validity window (default 3 days) to free consultation queue capacity.
              </li>
            </ul>
          </section>

          {/* Article 5 */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E8D8C3] pb-2">
              <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
                5. Strict No-Cancellation, Rescheduling &amp; Consultation Delivery
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FBF3E7] text-[#C1662F] border border-[#E8A33D]/40">
                Pending Lawyer Review
              </span>
            </div>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Delivery Channels:</strong> Consultations are conducted exclusively via WhatsApp Call or Google Meet, arranged after bank payment verification. There is no in-app calling or proprietary client download required.
              </li>
              <li>
                <strong>Strict No-Cancellation Policy:</strong> Once a consultation is booked and payment is verified, it cannot be cancelled for a refund. Seekers are required to attend their booked consultation session. Fees paid for Acharya Ji&apos;s allocated time, preparatory chart calculations, and research are non-refundable.
              </li>
              <li>
                <strong>Client Rescheduling Notice:</strong> If you need to reschedule your confirmed consultation slot, you must provide written notice via WhatsApp (+91 93112 15564) or Email at least <strong>4 hours prior</strong> to the scheduled time. We will arrange a mutually agreed alternative slot at zero additional charge.
              </li>
              <li>
                <strong>No-Show Policy:</strong> Acharya Ji reserves 15 minutes of grace time for each appointment. If a seeker fails to join the Google Meet or answer the WhatsApp call within 15 minutes of the confirmed start time without prior intimation, the session will be marked as completed, and fees will not be refunded.
              </li>
              <li>
                <strong>Emergency Rescheduling by Acharya Ji:</strong> In the rare event of urgent Vedic rituals, temple ceremonies, or medical emergencies, our sanctum desk will notify you immediately. You may choose between priority rescheduling at your preferred time or a 100% full refund directly to your UPI/bank account.
              </li>
            </ul>
          </section>

          {/* Article 6 */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              6. Intellectual Property &amp; Content Rights
            </h2>
            <p>
              All proprietary algorithms, Panchang calculation engines, astronomical ephemeris models, articles, media reels, infographics, and website design trademarks are the exclusive intellectual property of Aapka Astro and Acharya Niraj Kumar.
            </p>
            <p>
              Users may save or print their personalized Janam Kundli charts for personal, non-commercial use. Automated scraping, data extraction, reverse engineering, or redistributing our calculation API is strictly forbidden.
            </p>
          </section>

          {/* Article 7 */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              7. Limitation of Liability
            </h2>
            <p>
              Under no circumstances shall Aapka Astro, Acharya Niraj Kumar, or its associates be liable for any direct, indirect, incidental, punitive, or consequential damages resulting from decisions made by the client regarding medical, legal, financial, or personal life choices. Astrological counsel is spiritual advisory in nature and must never substitute for licensed medical treatment, psychiatric care, or legal counsel.
            </p>
          </section>

          {/* Article 8 */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              8. Governing Law &amp; Jurisdiction
            </h2>
            <p>
              These Terms of Service shall be governed by and construed in accordance with the substantive laws of India. Any legal dispute, grievance, or arbitration arising out of or related to these terms shall fall under the exclusive jurisdiction of the competent courts in New Delhi, India.
            </p>
          </section>

          {/* Contact Details */}
          <section className="bg-[#FBF3E7] p-6 rounded-2xl border border-[#E8D8C3] space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              9. Grievance Officer &amp; Communication
            </h2>
            <p>
              If you have inquiries regarding these Terms of Service, please reach out to our administration desk:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a
                href={`mailto:${PLACEHOLDER_CONTACT_INFO.email}?subject=Terms%20Inquiry`}
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
          <Link href="/refund-policy" className="hover:text-[#7B2D26] underline">
            Refund &amp; Cancellation Policy
          </Link>
          <Link href="/privacy-policy" className="hover:text-[#7B2D26] underline">
            Privacy Policy
          </Link>
          <Link href="/pricing-policy" className="hover:text-[#7B2D26] underline">
            Pricing Policy
          </Link>
          <Link href="/disclaimer" className="hover:text-[#7B2D26] underline">
            Vedic Astrology Disclaimer
          </Link>
        </div>
      </div>
    </div>
  );
}
