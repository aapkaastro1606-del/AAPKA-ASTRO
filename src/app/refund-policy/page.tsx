import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ShieldCheck, ArrowLeft, RefreshCw, AlertCircle, PhoneCall, Mail } from "lucide-react";
import { MandalaDivider } from "@/components/ui/MandalaDivider";
import { PLACEHOLDER_CONTACT_INFO, PLACEHOLDER_ASTROLOGER } from "@/config/placeholderContent";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | Aapka Astro",
  description: "Official Refund and Cancellation Policy for astrological consultations, Vastu audits, and gemstone consecrations at Aapka Astro.",
};

export default function RefundPolicyPage() {
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
          <span className="text-[#7B2D26] font-bold">Refund Policy</span>
        </nav>

        {/* Header */}
        <header className="border-b border-[#E8D8C3] pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7B2D26]/10 text-[#7B2D26] text-xs font-bold uppercase tracking-wider mb-3">
            <RefreshCw className="h-3.5 w-3.5" />
            Fair Practice &amp; Consumer Protection
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-temple text-[#7B2D26]">
            Refund &amp; Cancellation Policy
          </h1>
          <p className="text-xs text-[#6E5545] mt-2">
            Last Updated: March 2026 &bull; Effective for all consultations, reports, and sacred remedies
          </p>
        </header>

        {/* Placeholder Advisory Alert */}
        <div className="p-4 rounded-xl bg-[#FBF3E7] border border-[#E8A33D]/60 text-xs text-[#7B2D26] flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-[#C1662F] shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Legal Policy Notice:</strong>
            {/* PLACEHOLDER: replace with client-approved legal text */}
            The following terms govern billing, cancellations, and refunds across live audio/video/chat consultations, Janam Kundli reports, and customized Vastu site visits conducted by {PLACEHOLDER_ASTROLOGER.displayName}.
          </div>
        </div>

        {/* Main Content Sections */}
        <div className="prose max-w-none text-xs sm:text-sm text-[#6E5545] space-y-6 leading-relaxed">
          {/* Section 1 */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              1. Nature of Astrological Services
            </h2>
            <p>
              Astrological interpretations, Kundli analyses, and Vastu recommendations provided on Aapka Astro are advisory spiritual consultations based on classical Vedic scriptures (Brihat Parashara Hora Shastra, Jaimini Sutras, and Vishwakarma Prakash). Astrology is an interpretative science; outcomes depend on individual Karma, free will, and unforeseen worldly circumstances.
            </p>
            <p>
              Once a live consultation (Chat, Voice Call, or Video Call) has commenced or concluded, fees paid for the astrologer&apos;s personal time, research, and expertise are generally non-refundable.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              2. Live Consultation Cancellations &amp; Rescheduling
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Client Rescheduling:</strong> If you schedule a scheduled consultation slot and need to reschedule, you must provide written notice via WhatsApp or Email at least 4 hours prior to the booked appointment. We will gladly accommodate a mutually agreed alternative slot at zero additional charge.
              </li>
              <li>
                <strong>Acharya Ji Emergency Rescheduling:</strong> In the rare event that Acharya Niraj Kumar is summoned for Vedic rituals, temple ceremonies, or unforeseen emergencies, our team will promptly notify you. You will have the option to either reschedule at your preferred time or request a 100% full refund to your original payment method.
              </li>
              <li>
                <strong>No-Show Policy:</strong> If a client fails to attend a pre-booked scheduled consultation without prior intimation within 15 minutes of the slot start time, the session will be marked as delivered and fees will not be refunded.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              3. Telecommunication Disconnections &amp; Session Continuity
            </h2>
            <p>
              All consultations operate on an upfront flat-fee, pay-per-booking model conducted via WhatsApp Call or Google Meet. If a call drops prematurely due to cellular network glitch, Wi-Fi outage, or carrier interruption:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Acharya Ji or his desk will immediately redial or re-share the meeting link to resume your booked session at zero additional charge.
              </li>
              <li>
                If reconnection is impossible due to verified prolonged network failure, our desk will reschedule your consultation at your convenience or issue a 100% full refund directly to your original payment method (Bank / UPI / Card) within 24–48 business hours.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              4. Customized Kundli PDF Reports &amp; Vastu Audits
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Free Online Ephemeris Calculations:</strong> Online chart generation (Kundli charts, Love Calculator, Panchang) is provided complimentary with zero charge.
              </li>
              <li>
                <strong>Paid Kundli PDF Reports (₹501):</strong> If a PDF generation failure occurs after successful payment, our automated system re-triggers the PDF build immediately. In the event of an unresolvable technical generation error, a 100% refund is issued to your original payment mode within 24 hours.
              </li>
              <li>
                <strong>Vaastu Consultations (₹15,000):</strong> For comprehensive Devta Vaastu audits, once the bespoke floor plan analysis has commenced, cancellations are not permitted. If you need to submit updated architectural blueprints or compass degrees, you may do so within 12 hours of booking.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              5. Energized Gemstones &amp; Sacred Yantras
            </h2>
            <p>
              Natural Vedic gemstones (such as Yellow Sapphire, Blue Sapphire, Emerald, Ruby) and energized Yantras undergo personalized Vedic consecration (Prana Pratishtha) invoking the seeker&apos;s specific Gotra, Nakshatra, and birth coordinates.
            </p>
            <p>
              Because consecrated items are bespoke and spiritually sanctified for one individual seeker, returns or exchanges cannot be accepted once the puja ritual has been performed or the item has shipped, except in cases where the physical stone arrives damaged in transit with unboxing video proof.
            </p>
          </section>

          {/* Section 6 */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              6. Refund Process &amp; Timelines
            </h2>
            <p>
              Approved refunds will be processed through our payment gateway partners (Razorpay / UPI) back to the original source account:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>UPI / Net Banking / Debit Card:</strong> 3 to 7 business days depending on your issuing bank.
              </li>
              <li>
                <strong>Credit Card:</strong> 5 to 10 business days as per the card issuer&apos;s settlement cycle.
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="bg-[#FBF3E7] p-6 rounded-2xl border border-[#E8D8C3] space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              7. Contact Our Grievance Desk
            </h2>
            <p>
              To initiate a refund request, report a dropped session billing discrepancy, or clarify your order status, please contact our helpline with your registered phone number and Transaction ID:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a
                href={`mailto:${PLACEHOLDER_CONTACT_INFO.email}?subject=Refund%20Discrepancy%20Request`}
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
