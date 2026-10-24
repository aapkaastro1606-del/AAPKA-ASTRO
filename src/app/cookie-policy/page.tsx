import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  Cookie,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Lock,
  RotateCcw,
  Clock,
  Building2,
  ExternalLink,
} from "lucide-react";
import { CookiePreferenceResetButton } from "@/components/analytics/CookiePreferenceResetButton";

export const metadata: Metadata = {
  title: "Cookie Policy & Analytics Notice | Aapka Astro",
  description:
    "Official Cookie Notice explaining cookieless telemetry, optional Google Analytics, data retention periods, third-party processors, and consent management at Aapka Astro.",
  alternates: {
    canonical: "https://www.aapkaastro.com/cookie-policy",
  },
};

export default function CookiePolicyPage() {
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
          <span className="text-[#7B2D26] font-bold">Cookie Notice</span>
        </nav>

        {/* Header */}
        <header className="border-b border-[#E8D8C3] pb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7B2D26]/10 text-[#7B2D26] text-xs font-bold uppercase tracking-wider">
              <Cookie className="h-3.5 w-3.5" />
              Cookie Notice &amp; Telemetry
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider">
              <AlertCircle className="h-3.5 w-3.5 text-amber-700" />
              Pending Lawyer Review
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-temple text-[#7B2D26]">
            Cookie Notice &amp; Analytics Disclosure
          </h1>
          <p className="text-xs text-[#6E5545] mt-2">
            Effective Date: March 2026 &bull; Status: Draft Version Pending Formal Legal Counsel Review &bull; Digital Personal Data Protection Act (DPDPA), 2023 Compliant
          </p>
        </header>

        {/* Legal Advisory Notice */}
        <div className="p-4 rounded-xl bg-[#FBF3E7] border border-[#E8A33D]/60 text-xs text-[#7B2D26] flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-[#C1662F] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block font-bold">Pending Lawyer Review Notice:</strong>
            <p className="text-[#6E5545]">
              This disclosure documents the technical cookies, cookieless metrics, and optional analytical cookies deployed on Aapka Astro (www.aapkaastro.com). This document is marked as <strong>Pending Lawyer Review</strong> while undergoing final regulatory sign-off in accordance with the Digital Personal Data Protection Act (DPDPA), 2023, and applicable Indian IT laws.
            </p>
          </div>
        </div>

        {/* Interactive Consent Management Card */}
        <div className="p-6 rounded-2xl border-2 border-[#7B2D26]/30 bg-[#FFFDF9] shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-[#7B2D26] flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Manage Your Cookie &amp; Analytics Preferences
              </h2>
              <p className="text-xs text-[#6E5545] mt-1">
                You can withdraw or update your analytics consent at any time. When you reject analytics, all optional cookies and external tracking requests are completely blocked.
              </p>
            </div>
            <CookiePreferenceResetButton />
          </div>
        </div>

        {/* Policy Sections */}
        <div className="prose max-w-none text-xs sm:text-sm text-[#6E5545] space-y-6 leading-relaxed">
          {/* Section 1: What is Collected */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              1. What Information Is Collected?
            </h2>
            <p>
              Aapka Astro maintains a strict privacy-first architecture. We categorize digital identifiers into three strict tiers:
            </p>
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-[#FAF5EE] border border-[#E8D8C3]">
                <strong className="block font-bold text-[#3B2A1E] mb-1">A. Strictly Essential Cookies (Always Active):</strong>
                <p className="text-[#6E5545]">
                  Authentication session tokens (via Clerk) enabling you to log in to your account, security tokens preventing Cross-Site Request Forgery (CSRF), and your stored cookie consent choice (<code>aapka_cookie_consent</code>).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF5EE] border border-[#E8D8C3]">
                <strong className="block font-bold text-[#3B2A1E] mb-1">B. Cookieless Performance Telemetry (Vercel Web Analytics &amp; Speed Insights):</strong>
                <p className="text-[#6E5545]">
                  Aggregated page-load performance and web vitals (Largest Contentful Paint, First Input Delay). <strong>No cookies, no IP storage, and no personal identifiers</strong> are ever used.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF5EE] border border-[#E8D8C3]">
                <strong className="block font-bold text-[#3B2A1E] mb-1">C. Optional Analytics Cookies (Google Analytics 4 — Consent Required):</strong>
                <p className="text-[#6E5545]">
                  Loaded <strong>ONLY after you explicitly click &quot;Accept&quot;</strong> on our consent banner. Measures aggregate traffic (e.g. number of visitors this week, high-level country/city, which pages were read).
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F5F7F2] border border-[#6B8E5A]/40 text-[#2A4720] text-xs font-semibold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-[#6B8E5A]" />
              <span>Strict Guarantee: We NEVER collect or pass personal names, phone numbers, email addresses, UTR numbers, or birth charts into analytics events or URLs.</span>
            </div>
          </section>

          {/* Section 2: Why We Collect This */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              2. Why Do We Collect This Data?
            </h2>
            <p>
              Data is collected solely for the following legitimate purposes:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#6E5545]">
              <li><strong>Site Stability &amp; Performance:</strong> Measuring server response times and frontend loading speeds to ensure uninterrupted consultation bookings.</li>
              <li><strong>Audience Understanding:</strong> Learning which educational articles, Vedic astrology guides, and free calculators are most helpful to visitors.</li>
              <li><strong>Fraud &amp; Abuse Prevention:</strong> Throttling malicious scraping and automated form spam on consultation intake forms.</li>
              <li><strong>Zero Advertising:</strong> We do NOT build behavioral advertising profiles, sell data to brokers, or run third-party advertising retargeting campaigns.</li>
            </ul>
          </section>

          {/* Section 3: Data Retention Periods */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              3. How Long Is Data Retained?
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#E8D8C3] rounded-xl overflow-hidden">
                <thead className="bg-[#FAF5EE] text-[#7B2D26] font-bold border-b border-[#E8D8C3]">
                  <tr>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Cookie / Identifier</th>
                    <th className="py-2.5 px-3">Default Retention Period</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8D8C3] text-[#6E5545]">
                  <tr>
                    <td className="py-2 px-3 font-semibold text-[#3B2A1E]">Clerk Auth Session</td>
                    <td className="py-2 px-3"><code>__session</code>, <code>__client_uat</code></td>
                    <td className="py-2 px-3">Session to 7 days (or until manual sign-out)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-[#3B2A1E]">Consent Memory</td>
                    <td className="py-2 px-3"><code>aapka_cookie_consent</code></td>
                    <td className="py-2 px-3">12 months (or until cleared by user)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-[#3B2A1E]">Vercel Analytics</td>
                    <td className="py-2 px-3">None (cookieless)</td>
                    <td className="py-2 px-3">24 hours rolling checksum</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-[#3B2A1E]">Google Analytics 4 (Optional)</td>
                    <td className="py-2 px-3"><code>_ga</code>, <code>_ga_*</code></td>
                    <td className="py-2 px-3">GA4 standard event retention: <strong>2 months</strong> (user-level) to <strong>14 months</strong> (maximum)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 4: Who Processes It */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              4. Who Processes This Information?
            </h2>
            <p>
              Your data is processed only by verified, enterprise-grade cloud service providers bound by strict Data Processing Addendums (DPAs):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-[#E8D8C3] bg-[#FAF5EE] space-y-1">
                <div className="font-bold text-[#7B2D26] flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  Google LLC
                </div>
                <p className="text-[11px] text-[#6E5545]">
                  Google Analytics 4 (only upon consent). Processes anonymized traffic metrics with IP anonymization enabled.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-[#E8D8C3] bg-[#FAF5EE] space-y-1">
                <div className="font-bold text-[#7B2D26] flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  Vercel Inc.
                </div>
                <p className="text-[11px] text-[#6E5545]">
                  Cookieless web vitals and edge performance analytics. Fully privacy-friendly with zero client storage.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-[#E8D8C3] bg-[#FAF5EE] space-y-1">
                <div className="font-bold text-[#7B2D26] flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  Clerk Inc.
                </div>
                <p className="text-[11px] text-[#6E5545]">
                  Strictly essential session tokens for passwordless and SSO authentication for registered seekers.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5: How to Withdraw Consent */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              5. How to Withdraw Consent or Exercise Your Rights
            </h2>
            <p>
              You maintain total sovereignty over your digital trail:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-[#6E5545]">
              <li>
                <strong>One-Click Consent Reset:</strong> Click the <strong>&quot;Reset Cookie Preferences&quot;</strong> button at the top of this page or in the footer to revoke Google Analytics consent. Optional cookies and requests will immediately cease.
              </li>
              <li>
                <strong>Browser Cookie Clearing:</strong> You can clear cookies at any time via your browser settings (Chrome: Settings &gt; Privacy &gt; Clear Browsing Data).
              </li>
              <li>
                <strong>DPDPA Data Rights:</strong> To request complete erasure of your consultation history or registered profile, write to us at <a href="mailto:aapkaastro1606@gmail.com" className="font-bold text-[#7B2D26] underline">aapkaastro1606@gmail.com</a>.
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
