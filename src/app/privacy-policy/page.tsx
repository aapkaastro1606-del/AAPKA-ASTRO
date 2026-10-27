import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  Lock,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  Mail,
  PhoneCall,
  Server,
  Database,
  KeyRound,
  Send,
  Bot,
  Cloud,
  MessageCircle,
  Cookie,
  FileText,
  MapPin,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { PLACEHOLDER_CONTACT_INFO, PLACEHOLDER_ASTROLOGER } from "@/config/placeholderContent";

export const metadata: Metadata = {
  title: "Privacy Policy | 100% Confidential Vedic Sanctuary - Aapka Astro",
  description:
    "Official Privacy Policy explaining how personal information, birth coordinates, payment verification, and consultation data are safeguarded at Aapka Astro.",
  alternates: {
    canonical: "https://www.aapkaastro.com/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy | 100% Confidential Vedic Sanctuary - Aapka Astro",
    description:
      "Strict confidentiality, zero data selling, enterprise data processor transparency, and clear user privacy rights at Aapka Astro.",
    url: "https://www.aapkaastro.com/privacy-policy",
    images: ["https://www.aapkaastro.com/images/logo-white-bg.png"],
  },
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
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7B2D26]/10 text-[#7B2D26] text-xs font-bold uppercase tracking-wider">
              <Lock className="h-3.5 w-3.5" />
              Data Protection &amp; Confidentiality
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider">
              <AlertCircle className="h-3.5 w-3.5 text-amber-700" />
              Pending Lawyer Review
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-temple text-[#7B2D26]">
            Privacy Policy
          </h1>
          <p className="text-xs text-[#6E5545] mt-2">
            Effective Date: March 2026 &bull; Status: Draft Version Pending Formal Legal Counsel Review &bull; Committed to 100% Confidentiality &amp; Zero Commercial Data Monetization
          </p>
        </header>

        {/* Legal Advisory Notice */}
        <div className="p-4 rounded-xl bg-[#FBF3E7] border border-[#E8A33D]/60 text-xs text-[#7B2D26] flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-[#C1662F] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block font-bold">Pending Lawyer Review Notice:</strong>
            <p className="text-[#6E5545]">
              This policy document outlines the architectural data flows, storage practices, and third-party data processors utilized by Aapka Astro (www.aapkaastro.com). This document is marked as <strong>Pending Lawyer Review</strong> while undergoing final regulatory sign-off in accordance with the Digital Personal Data Protection Act (DPDPA), 2023, and applicable Indian IT laws.
            </p>
          </div>
        </div>

        {/* Policy Sections */}
        <div className="prose max-w-none text-xs sm:text-sm text-[#6E5545] space-y-6 leading-relaxed">
          {/* Section 1: Sacred Pledge & Overview */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              1. Our Sacred Pledge: 100% Confidentiality &amp; Zero Data Selling
            </h2>
            <div className="p-4 rounded-xl bg-[#F5F7F2] border border-[#6B8E5A]/40 text-[#2A4720] space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <ShieldCheck className="h-4 w-4 text-[#6B8E5A]" />
                Absolute No-Data-Selling Guarantee
              </div>
              <p className="text-xs">
                Unlike mass-market astrological platforms that harvest seekers&apos; birth coordinates, relationship queries, and contact lists to monetize on behavioral ad networks, <strong>Aapka Astro NEVER sells, rents, leases, trades, or commercializes your personal information or birth charts with third-party advertisers, data aggregators, or brokers</strong>.
              </p>
            </div>
            <p className="pt-2">
              Every consultation with Acharya Niraj Kumar concerning marital harmony, career crossroads, family concerns, and energy corrections is treated as a sacred trust held in strict confidence between the seeker and the Acharya.
            </p>
          </section>

          {/* Section 2: Third-Party Data Processors & Purposes */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-4">
            <div className="border-b border-[#E8D8C3] pb-3">
              <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
                2. Third-Party Data Processors &amp; Specific Processing Purposes
              </h2>
              <p className="text-xs text-[#6E5545] mt-1">
                To provide secure, scalable, and mathematically precise services, we partner with specialized enterprise infrastructure providers acting solely as data processors under strict contractual confidentiality:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Processor: Vercel */}
              <div className="p-4 rounded-xl border border-[#E8D8C3] bg-[#FAF5EE]/60 space-y-2">
                <div className="flex items-center gap-2 text-[#7B2D26] font-bold text-sm">
                  <Server className="h-4 w-4" />
                  Vercel Inc.
                </div>
                <div className="text-xs space-y-1">
                  <p><strong>Purpose:</strong> Web application hosting, serverless compute runtime, Content Delivery Network (CDN) edge routing, and DDoS mitigation.</p>
                  <p><strong>Data Handled:</strong> Ephemeral HTTP request headers, IP address for request routing and edge security.</p>
                </div>
              </div>

              {/* Processor: Neon */}
              <div className="p-4 rounded-xl border border-[#E8D8C3] bg-[#FAF5EE]/60 space-y-2">
                <div className="flex items-center gap-2 text-[#7B2D26] font-bold text-sm">
                  <Database className="h-4 w-4" />
                  Neon Technologies Inc.
                </div>
                <div className="text-xs space-y-1">
                  <p><strong>Purpose:</strong> Serverless PostgreSQL relational database hosting with automated backups and encryption at rest.</p>
                  <p><strong>Data Handled:</strong> User profiles, consultation booking records, UTR submission IDs, astrological lead coordinates, and knowledge base records.</p>
                </div>
              </div>

              {/* Processor: Clerk & Google */}
              <div className="p-4 rounded-xl border border-[#E8D8C3] bg-[#FAF5EE]/60 space-y-2">
                <div className="flex items-center gap-2 text-[#7B2D26] font-bold text-sm">
                  <KeyRound className="h-4 w-4" />
                  Clerk Inc. &amp; Google LLC
                </div>
                <div className="text-xs space-y-1">
                  <p><strong>Purpose:</strong> User authentication, passwordless login tokens, Google OAuth Single Sign-On (SSO), and session security.</p>
                  <p><strong>Data Handled:</strong> Email address, mobile telephone number, name, and cryptographically verified JWT session tokens.</p>
                </div>
              </div>

              {/* Processor: Resend */}
              <div className="p-4 rounded-xl border border-[#E8D8C3] bg-[#FAF5EE]/60 space-y-2">
                <div className="flex items-center gap-2 text-[#7B2D26] font-bold text-sm">
                  <Send className="h-4 w-4" />
                  Resend Inc.
                </div>
                <div className="text-xs space-y-1">
                  <p><strong>Purpose:</strong> Transactional email delivery for consultation booking confirmations, receipts, calendar invites, and platform owner security alerts.</p>
                  <p><strong>Data Handled:</strong> Recipient email address, name, booking date/time, and transaction summary.</p>
                </div>
              </div>

              {/* Processor: AI Provider */}
              <div className="p-4 rounded-xl border border-[#E8D8C3] bg-[#FAF5EE]/60 space-y-2">
                <div className="flex items-center gap-2 text-[#7B2D26] font-bold text-sm">
                  <Bot className="h-4 w-4" />
                  AI Provider (Google Cloud / Groq / OpenAI)
                </div>
                <div className="text-xs space-y-1">
                  <p><strong>Purpose:</strong> Generating natural language answers to visitors&apos; website questions via the floating assistant widget.</p>
                  <p><strong>Data Handled:</strong> Chat messages are sent to generate answers. Used solely on paid enterprise API tiers with data training on customer inputs contractually disabled.</p>
                </div>
              </div>

              {/* Processor: Cloudflare R2 */}
              <div className="p-4 rounded-xl border border-[#E8D8C3] bg-[#FAF5EE]/60 space-y-2">
                <div className="flex items-center gap-2 text-[#7B2D26] font-bold text-sm">
                  <Cloud className="h-4 w-4" />
                  Cloudflare Inc. (Cloudflare R2, if used)
                </div>
                <div className="text-xs space-y-1">
                  <p><strong>Purpose:</strong> Private encrypted object storage for optional manual payment confirmation screenshots.</p>
                  <p><strong>Data Handled:</strong> EXIF-scrubbed image files accessible exclusively via short-lived 15-minute signed URLs by the platform Owner, subject to automatic 90-day retention deletion.</p>
                </div>
              </div>

              {/* Processor: WhatsApp */}
              <div className="p-4 rounded-xl border border-[#E8D8C3] bg-[#FAF5EE]/60 md:col-span-2 space-y-2">
                <div className="flex items-center gap-2 text-[#7B2D26] font-bold text-sm">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp (Meta Platforms, Inc. — User-Initiated)
                </div>
                <div className="text-xs space-y-1">
                  <p><strong>Purpose:</strong> Direct, 1-on-1 user-initiated communication channel for appointment scheduling, audio/video consultation sessions, Kundli inquiries, and manual payment verification.</p>
                  <p><strong>Data Handled:</strong> Only activated when a visitor or client explicitly taps a WhatsApp link or initiates contact. Communication is governed by WhatsApp&apos;s end-to-end encryption protocols.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: AI Assistant Interaction & 30-Day Query Quality Logging */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              3. AI Assistant Interaction &amp; 30-Day Query Quality Logging
            </h2>
            <p>
              When visitors use our floating AI Assistant, the conversation is processed under strict privacy controls:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-[#6E5545]">
              <li>
                <strong>Privacy-Preserving Rate Limiting:</strong> Visitor IP addresses are one-way hashed using salted cryptographic SHA-256 algorithms. Raw IP addresses are never saved, stored, or logged in our database.
              </li>
              <li>
                <strong>PII Masking &amp; Stripping:</strong> Any sensitive personal information entered into chat—such as email addresses, 10-digit mobile phone numbers, or bank identifiers—is automatically scrubbed and replaced with generic masked tokens (<code>[MASKED_EMAIL]</code>, <code>[MASKED_PHONE]</code>) prior to any logging.
              </li>
              <li>
                <strong>30-Day Strict Retention:</strong> Unanswered queries or low-confidence questions recorded in our 30-Day Query Quality Logging pipeline are stored without personal identifiers. All logged records are automatically and permanently purged from the database after 30 days via our scheduled retention job (<code>/api/cron/cleanup-unanswered</code>).
              </li>
              <li>
                <strong>No Third-Party AI Model Training:</strong> Chat messages are sent to the AI provider solely to generate real-time answers. We use enterprise API tiers where customer inputs are contractually excluded from third-party model training or public dataset inclusion.
              </li>
              <li>
                <strong>Fail-Closed Circuit Breaker:</strong> In the event of provider outages, quota limits, or authentication failures, the assistant automatically surfaces a direct WhatsApp fallback to visitors and temporarily hides the widget upon repeated failures.
              </li>
            </ul>
          </section>

          {/* Section 4: Direct UPI & Booking Data Safety */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              4. Direct UPI Payments &amp; Booking Data Security
            </h2>
            <p>
              We operate a transparent, zero-wallet, flat-fee consultation booking architecture:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-[#6E5545]">
              <li>
                <strong>Direct UPI Routing:</strong> Payments are transacted directly to our verified merchant UPI ID (<code>9310709233m@pnb</code>, Payee: AAPKA ASTRO). We never process, store, or view your bank account passwords, credit/debit card numbers, or UPI PINs.
              </li>
              <li>
                <strong>Zero Base64 Image Storage:</strong> Payment screenshots are never converted to base64 or stored inside our application database, ensuring database integrity and preventing storage bloat.
              </li>
              <li>
                <strong>Private Bucket &amp; EXIF Metadata Stripping:</strong> If screenshot uploads are active via Cloudflare R2, image files are stripped of camera, device, and GPS EXIF metadata, assigned random UUID keys, and protected by short-lived 15-minute presigned URLs visible solely to the platform Owner.
              </li>
              <li>
                <strong>90-Day Payment Screenshot Retention:</strong> Payment verification screenshots are permanently purged from private storage after 90 days via our automated retention job.
              </li>
            </ul>
          </section>

          {/* Section 5: Free Kundli Leads & Astrological Coordinates */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              5. Free Kundli Leads &amp; Astrological Birth Coordinates
            </h2>
            <p>
              When you generate a Janam Kundli, Kundli Milan, or astrological report, we collect your birth details to run our high-precision astronomical ephemeris calculations:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-[#6E5545]">
              <li>
                <strong>Data Collected:</strong> Name, WhatsApp telephone number, gender, date of birth, exact time of birth, and birth place coordinates (city, latitude, longitude, and timezone).
              </li>
              <li>
                <strong>Strict Purpose Limitation:</strong> Collected solely to calculate your Nirayana planetary positions, divisional charts (D1 to D12), and Ashtakoot guna scores, and to allow Acharya Ji&apos;s desk to coordinate scheduled consultations.
              </li>
              <li>
                <strong>Zero Automated Marketing Guarantee:</strong> We maintain a strict prohibition against automated robocalls, blast SMS campaigns, and third-party promotional syndication.
              </li>
              <li>
                <strong>Consent &amp; Revocation:</strong> Lead submissions record explicit user consent with timestamp. You may withdraw your consent at any time to request immediate data erasure.
              </li>
            </ul>
          </section>

          {/* Section 6: Cookie Policy & Traffic Analytics Disclosure (Pending Lawyer Review) */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8D8C3] pb-3">
              <div className="flex items-center gap-2">
                <Cookie className="h-5 w-5 text-[#C1662F]" />
                <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
                  6. Cookie Policy: Strictly Essential Cookies Only &amp; Traffic Analytics Disclosure
                </h2>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                Pending Lawyer Review
              </span>
            </div>
            <p>
              Aapka Astro adheres to a minimal, privacy-preserving digital architecture in compliance with the Digital Personal Data Protection Act (DPDPA), 2023:
            </p>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#FAF5EE] border border-[#E8D8C3]">
                <strong className="block font-bold text-[#3B2A1E] mb-1">A. What is Collected:</strong>
                <p className="text-[#6E5545]">
                  Essential session tokens (via Clerk for user sign-in and CSRF defense), cookieless web vitals (via Vercel Analytics for page speed), and aggregate traffic metrics (via Google Analytics 4, <em>only when you give explicit consent</em>).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF5EE] border border-[#E8D8C3]">
                <strong className="block font-bold text-[#3B2A1E] mb-1">B. Why It Is Collected:</strong>
                <p className="text-[#6E5545]">
                  To verify bookings, optimize consultation checkout speeds, and understand which spiritual and astrology guides help seekers most. We never sell data to advertising brokers or run commercial behavioral retargeting.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF5EE] border border-[#E8D8C3]">
                <strong className="block font-bold text-[#3B2A1E] mb-1">C. Retention Periods:</strong>
                <p className="text-[#6E5545]">
                  Cookieless performance metrics are retained for 24 hours. Google Analytics 4 retains event data for <strong>2 months</strong> (user-level default) up to a maximum of <strong>14 months</strong>, after which it is automatically deleted by Google servers.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF5EE] border border-[#E8D8C3]">
                <strong className="block font-bold text-[#3B2A1E] mb-1">D. Data Processors:</strong>
                <p className="text-[#6E5545]">
                  Processed securely by Vercel Inc. (cookieless infrastructure), Google LLC (GA4, only upon consent), and Clerk Inc. (authentication).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF5EE] border border-[#E8D8C3]">
                <strong className="block font-bold text-[#3B2A1E] mb-1">E. How to Withdraw Consent:</strong>
                <p className="text-[#6E5545]">
                  You can withdraw or update your cookie preferences at any time by visiting our dedicated <Link href="/cookie-policy" className="font-bold text-[#7B2D26] underline">Cookie Notice Page</Link> and clicking &quot;Change Cookie Preferences&quot;. If rejected, no analytics cookies are stored and no analytics requests are dispatched.
                </p>
              </div>
            </div>
            <p className="text-xs font-semibold text-[#7B2D26]">
              &bull; Strict Guardrail: We NEVER put personal names, phone numbers, email addresses, UTR numbers, or birth charts into analytics events or URLs.
            </p>
          </section>

          {/* Section 7: User Rights Under DPDPA 2023 */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              7. Your Legal Rights (DPDPA 2023)
            </h2>
            <p>
              Under the Digital Personal Data Protection Act, 2023, you have clear rights regarding your personal data:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-[#E8D8C3] bg-[#FAF5EE]">
                <strong className="block font-bold text-[#7B2D26] mb-1">Right to Access:</strong>
                Request a complete export of your saved birth profiles, Janam Kundli records, and consultation invoices.
              </div>
              <div className="p-3 rounded-xl border border-[#E8D8C3] bg-[#FAF5EE]">
                <strong className="block font-bold text-[#7B2D26] mb-1">Right to Correction:</strong>
                Update or rectify inaccurate birth times, locations, contact phone numbers, or account names.
              </div>
              <div className="p-3 rounded-xl border border-[#E8D8C3] bg-[#FAF5EE]">
                <strong className="block font-bold text-[#7B2D26] mb-1">Right to Erasure (&quot;Be Forgotten&quot;):</strong>
                Request the permanent deletion of your account, consultation history, and Kundli leads from all databases.
              </div>
              <div className="p-3 rounded-xl border border-[#E8D8C3] bg-[#FAF5EE]">
                <strong className="block font-bold text-[#7B2D26] mb-1">Right to Withdraw Consent:</strong>
                Revoke consent for future communications or consultations at any time without penalty.
              </div>
            </div>
          </section>

          {/* Section 8: Physical Sanctum Address & Privacy Officer */}
          <section className="bg-[#FBF3E7] p-6 rounded-2xl border border-[#E8D8C3] space-y-4">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              8. Physical Sanctum Address &amp; Privacy Grievance Officer
            </h2>
            <p className="text-xs">
              To exercise your data protection rights, request data erasure, or submit questions regarding this policy, please contact our designated Privacy Grievance Officer:
            </p>

            <div className="space-y-2 text-xs text-[#3B2A1E]">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-[#7B2D26] shrink-0 mt-0.5" />
                <div>
                  <strong>Official Sanctum Address:</strong>
                  <p className="text-[#6E5545]">{PLACEHOLDER_CONTACT_INFO.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#7B2D26] shrink-0" />
                <div>
                  <strong>Email:</strong>{" "}
                  <a href={`mailto:${PLACEHOLDER_CONTACT_INFO.email}`} className="text-[#7B2D26] font-bold underline hover:text-[#C1662F]">
                    {PLACEHOLDER_CONTACT_INFO.email}
                  </a>{" "}
                  /{" "}
                  <a href="mailto:support@aapkaastro.com" className="text-[#7B2D26] font-bold underline hover:text-[#C1662F]">
                    support@aapkaastro.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <PhoneCall className="h-4 w-4 text-[#7B2D26] shrink-0" />
                <div>
                  <strong>Direct Telephone / WhatsApp:</strong>{" "}
                  <a href={`tel:${PLACEHOLDER_CONTACT_INFO.phoneRaw}`} className="text-[#7B2D26] font-bold underline hover:text-[#C1662F]">
                    {PLACEHOLDER_CONTACT_INFO.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#7B2D26] shrink-0" />
                <div>
                  <strong>Operating Hours:</strong> {PLACEHOLDER_CONTACT_INFO.operatingHours}
                </div>
              </div>
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
