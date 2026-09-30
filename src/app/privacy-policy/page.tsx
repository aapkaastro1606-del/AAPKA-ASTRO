import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Lock, ArrowLeft, AlertCircle, ShieldCheck, Mail, PhoneCall } from "lucide-react";
import { PLACEHOLDER_CONTACT_INFO, PLACEHOLDER_ASTROLOGER } from "@/config/placeholderContent";

export const metadata: Metadata = {
  title: "Privacy Policy | 100% Confidential Vedic Sanctuary - Aapka Astro",
  description: "Official Privacy Policy explaining how personal information, birth coordinates, and consultation data are safeguarded at Aapka Astro.",
};

export default function PrivacyPolicyPage() {
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
          <span className="text-[#7B2D26] font-bold">Privacy Policy</span>
        </nav>

        {/* Header */}
        <header className="border-b border-[#E8D8C3] pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7B2D26]/10 text-[#7B2D26] text-xs font-bold uppercase tracking-wider mb-3">
            <Lock className="h-3.5 w-3.5" />
            Data Protection &amp; Confidentiality
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-temple text-[#7B2D26]">
            Privacy Policy
          </h1>
          <p className="text-xs text-[#6E5545] mt-2">
            Last Updated: March 2026 &bull; Committed to strict confidentiality and zero commercial data sharing
          </p>
        </header>

        {/* Placeholder Advisory Alert */}
        <div className="p-4 rounded-xl bg-[#FBF3E7] border border-[#E8A33D]/60 text-xs text-[#7B2D26] flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-[#C1662F] shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Legal Policy Notice:</strong>
            {/* PLACEHOLDER: replace with client-approved legal text */}
            This Privacy Policy details how Aapka Astro collects, stores, protects, and handles personal identification details, natal charts, and consultation transcripts. We treat your personal life details as a sacred trust.
          </div>
        </div>

        {/* Policy Sections */}
        <div className="prose max-w-none text-xs sm:text-sm text-[#6E5545] space-y-6 leading-relaxed">
          {/* Section 1 */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              1. Information We Collect
            </h2>
            <p>
              To generate mathematically accurate Vedic astrological charts and conduct personalized consultations, we collect the following categories of information:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Astrological Birth Coordinates:</strong> Full Name, Gender, Exact Date of Birth, Exact Time of Birth, Place of Birth (City/Town/Village, Latitude, Longitude, Timezone).
              </li>
              <li>
                <strong>Account &amp; Contact Credentials:</strong> Phone Number, Email Address, and encrypted authentication tokens.
              </li>
              <li>
                <strong>Billing &amp; Transaction Details:</strong> Order IDs, consultation bookings, report purchases, and transaction references provided by our payment gateway (Razorpay). <em>Note: We never view or store sensitive debit/credit card numbers or UPI PINs.</em>
              </li>
              <li>
                <strong>Consultation Content:</strong> Written notes, charts, or query submissions uploaded for Acharya Ji&apos;s review during live chat or scheduled sessions.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              2. How We Use Your Information
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Chart Calculation &amp; Dasha Generation:</strong> Utilizing high-precision astronomical algorithms (Swiss Ephemeris / NASA JPL principles) to calculate Nirayana planetary longitudes, divisional charts (D1 to D12), and Ashtakoot Milan scores.
              </li>
              <li>
                <strong>Live Consultations:</strong> Permitting Acharya Niraj Kumar to prepare prior to your call, examine your running Mahadasha, and prescribe remedial solutions.
              </li>
              <li>
                <strong>Account Management:</strong> Processing consultation bookings, unlocking paid Kundli reports, sending appointment reminders via SMS/WhatsApp, and delivering invoices.
              </li>
              <li>
                <strong>Platform Security:</strong> Detecting suspicious logins, fraud prevention, and maintaining server reliability.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              3. Sacred Pledge of 100% Confidentiality &amp; Zero Data Selling
            </h2>
            <div className="p-4 rounded-xl bg-[#F5F7F2] border border-[#6B8E5A]/40 text-[#2A4720] space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <ShieldCheck className="h-4 w-4 text-[#6B8E5A]" />
                Our Confidentiality Commitment
              </div>
              <p className="text-xs">
                Unlike marketplace apps that harvest seeker data for advertising networks, <strong>Aapka Astro NEVER sells, rents, monetizes, or trades your personal details or birth data with third-party advertisers or data brokers</strong>.
              </p>
            </div>
            <p className="pt-2">
              All discussions held with Acharya Ji regarding marriage, career dilemmas, personal health, and family dynamics remain strictly confidential between the seeker and Acharya Niraj Kumar.
            </p>
          </section>

          {/* Section 4 */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              4. Technical Data Storage &amp; Encryption
            </h2>
            <p>
              We implement industry-standard administrative, physical, and technical safeguards:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>In-Transit Encryption:</strong> All data transmitted between your browser and our servers is encrypted using 256-bit SSL/TLS protocols.
              </li>
              <li>
                <strong>Payment Compliance:</strong> Payment transactions are executed via PCI-DSS Level 1 certified payment partners (Razorpay).
              </li>
              <li>
                <strong>Database Protection:</strong> Backend databases are housed in secure enterprise cloud centers with role-based access control.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              5. User Rights &amp; Data Deletion
            </h2>
            <p>
              You maintain sovereign ownership of your personal data. At any time, you may:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Request an export copy of your saved birth profiles and Janam Kundli charts.</li>
              <li>Update or correct erroneous birth timestamps or location coordinates.</li>
              <li>
                Request the permanent deletion of your account, saved charts, and consultation history by writing to our data desk at {PLACEHOLDER_CONTACT_INFO.email}.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="bg-[#FBF3E7] p-6 rounded-2xl border border-[#E8D8C3] space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              6. Privacy Grievance Officer
            </h2>
            <p>
              For questions, privacy compliance inquiries, or to exercise your data protection rights under the Digital Personal Data Protection Act (DPDPA), please reach out:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a
                href={`mailto:${PLACEHOLDER_CONTACT_INFO.email}?subject=Privacy%20Grievance`}
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
