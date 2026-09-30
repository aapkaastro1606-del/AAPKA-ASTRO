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

        {/* Placeholder Advisory Alert */}
        <div className="p-4 rounded-xl bg-[#FBF3E7] border border-[#E8A33D]/60 text-xs text-[#7B2D26] flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-[#C1662F] shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Legal Notice:</strong>
            {/* PLACEHOLDER: replace with client-approved legal text */}
            By accessing aapkaastro.com, creating a seeker account, or booking a consultation with {PLACEHOLDER_ASTROLOGER.displayName}, you agree to abide by these terms. This document constitutes a binding electronic agreement.
          </div>
        </div>

        {/* Terms Articles */}
        <div className="prose max-w-none text-xs sm:text-sm text-[#6E5545] space-y-6 leading-relaxed">
          {/* Article 1 */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              1. Preamble &amp; Description of Platform
            </h2>
            <p>
              Aapka Astro (&quot;Platform&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;) provides authentic classical Vedic astrology (Parashari, Jaimini, Nadi Jyotish), AstroVastu, and Devta Vastu advisory services conducted personally by Acharya Niraj Kumar. Our platform offers free computerized calculation engines (Kundli, Panchang, Compatibility, Astrological Calculators) as well as paid 1-on-1 consultations via encrypted audio call, video call, and real-time chat.
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
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              4. Consultation Booking, Pricing &amp; Payment Terms
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                All monetary transactions on Aapka Astro are processed securely through certified PCI-DSS compliant payment aggregators (Razorpay / UPI / Net Banking).
              </li>
              <li>
                <strong>Pay-Per-Booking Model:</strong> All consultations operate on a transparent flat-fee, pay-per-booking model with zero hidden charges and zero per-minute debits.
              </li>
              <li>
                <strong>Astro Consultation:</strong> First-time seekers are eligible for our introductory offer of Flat ₹1,051/- (Regular ₹2,100). The unified flat fee applies across all formats: Voice Call, Video Call, and Live Chat.
              </li>
              <li>
                <strong>Vaastu Consultation:</strong> Flat ₹15,000/- (discounted from ₹25,000) is the standing promotional fee for all residential, commercial, and industrial property audits.
              </li>
              <li>
                <strong>Kundli PDF Report:</strong> Free online chart generation remains 100% complimentary. Full downloadable formatted PDF reports are available for a one-time charge of Flat ₹501/-.
              </li>
              <li>
                Promotional discounts, special booking vouchers, and introductory offers are non-transferable and valid for one consultation booking per verified user.
              </li>
            </ul>
          </section>

          {/* Article 5 */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              5. Intellectual Property &amp; Content Rights
            </h2>
            <p>
              All proprietary algorithms, Panchang calculation engines, astronomical ephemeris models, articles, media reels, infographics, and website design trademarks are the exclusive intellectual property of Aapka Astro and Acharya Niraj Kumar.
            </p>
            <p>
              Users may save or print their personalized Janam Kundli charts for personal, non-commercial use. Automated scraping, data extraction, reverse engineering, or redistributing our calculation API is strictly forbidden.
            </p>
          </section>

          {/* Article 6 */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              6. Limitation of Liability
            </h2>
            <p>
              Under no circumstances shall Aapka Astro, Acharya Niraj Kumar, or its associates be liable for any direct, indirect, incidental, punitive, or consequential damages resulting from decisions made by the client regarding medical, legal, financial, or personal life choices. Astrological counsel is spiritual advisory in nature and must never substitute for licensed medical treatment, psychiatric care, or legal counsel.
            </p>
          </section>

          {/* Article 7 */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              7. Governing Law &amp; Jurisdiction
            </h2>
            <p>
              These Terms of Service shall be governed by and construed in accordance with the substantive laws of India. Any legal dispute, grievance, or arbitration arising out of or related to these terms shall fall under the exclusive jurisdiction of the competent courts in New Delhi, India.
            </p>
          </section>

          {/* Contact Details */}
          <section className="bg-[#FBF3E7] p-6 rounded-2xl border border-[#E8D8C3] space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              8. Grievance Officer &amp; Communication
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
