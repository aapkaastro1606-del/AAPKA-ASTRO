import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ShieldAlert, ArrowLeft, AlertCircle, Compass, Sparkles, Mail, PhoneCall } from "lucide-react";
import { PLACEHOLDER_CONTACT_INFO, PLACEHOLDER_ASTROLOGER } from "@/config/placeholderContent";

export const metadata: Metadata = {
  title: "Astrology & Vastu Disclaimer | Spiritual Guidance Advisory - Aapka Astro",
  description: "Official Astrological, Spiritual, and Vastu Disclaimer for Aapka Astro. Clarifying the nature of Vedic Jyotish predictions and remedies.",
};

export default function DisclaimerPage() {
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
          <span className="text-[#7B2D26] font-bold">Disclaimer</span>
        </nav>

        {/* Header */}
        <header className="border-b border-[#E8D8C3] pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7B2D26]/10 text-[#7B2D26] text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldAlert className="h-3.5 w-3.5" />
            Spiritual Science &amp; Legal Notice
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-temple text-[#7B2D26]">
            Astrology &amp; Spiritual Advisory Disclaimer
          </h1>
          <p className="text-xs text-[#6E5545] mt-2">
            Last Updated: March 2026 &bull; Clear ethical boundaries governing Vedic Jyotish &amp; Vastu Shastra
          </p>
        </header>

        {/* Placeholder Advisory Alert */}
        <div className="p-4 rounded-xl bg-[#FBF3E7] border border-[#E8A33D]/60 text-xs text-[#7B2D26] flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-[#C1662F] shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Ethical &amp; Legal Disclaimer Notice:</strong>
            {/* PLACEHOLDER: replace with client-approved legal text */}
            The insights, planetary analyses, and Vastu evaluations provided on Aapka Astro by {PLACEHOLDER_ASTROLOGER.displayName} are offered in good faith as spiritual guidance rooted in classical Vedic heritage. Please read this statement carefully before acting on any consultation.
          </div>
        </div>

        {/* Disclaimer Articles */}
        <div className="prose max-w-none text-xs sm:text-sm text-[#6E5545] space-y-6 leading-relaxed">
          {/* Article 1 */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              1. Interpretative Nature of Vedic Astrology
            </h2>
            <p>
              Vedic Astrology (Jyotish) is an ancient, revered Vidya that studies cosmic energies and planetary configurations at the exact moment of human birth. While our mathematical calculations are executed with modern astronomical ephemeris precision (incorporating the Lahiri Ayanamsha), astrological interpretations and future trends remain subjective and interpretative.
            </p>
            <p>
              Astrological forecasts are possibilities and cosmic tendencies based on Prarabdha Karma, not pre-determined fate. Human consciousness, Purushartha (self-effort), spiritual sadhana, and free will play an indispensable role in shaping human destiny. No astrologer can guarantee 100% predictive certainty.
            </p>
          </section>

          {/* Article 2 */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              2. Not a Substitute for Professional Medical, Legal, or Financial Counsel
            </h2>
            <div className="p-4 rounded-xl bg-[#FDF2F0] border border-[#C1662F]/30 text-[#7B2D26] space-y-2">
              <span className="font-bold text-xs uppercase tracking-wider block">Critical Boundary:</span>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>
                  <strong>Medical Disclaimer:</strong> Planetary indications regarding health, Rog-Bhavas (6th, 8th, 12th houses), or doshas must NEVER replace professional medical diagnosis, allopathic therapies, surgical procedures, or psychiatric treatments by certified medical practitioners.
                </li>
                <li>
                  <strong>Financial &amp; Investment Disclaimer:</strong> Astrological timing of wealth cycles or Dasha periods must NEVER be treated as registered SEBI investment advice, stock trading tips, or guaranteed commercial returns. Seek guidance from licensed financial planners before committing funds.
                </li>
                <li>
                  <strong>Legal &amp; Judicial Disclaimer:</strong> Astrological insights into court cases, litigation timing, or matrimonial disputes are spiritual observations and do not constitute legal advice. Always consult an advocate licensed to practice law in your jurisdiction.
                </li>
              </ul>
            </div>
          </section>

          {/* Article 2B: Television Broadcast Guidance Disclaimer */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#E8D8C3] pb-2">
              <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
                2B. Television Broadcast Guidance Disclaimer (&quot;Kaal Ki Chaal&quot; on Live Times)
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                Pending Lawyer Review
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#6E5545] leading-relaxed">
              Guidance given on air on television programmes (including Acharya Niraj Kumar&apos;s guest appearance on Live Times&apos; &quot;Kaal Ki Chaal&quot;) is general in nature and is not a substitute for professional medical, legal, or financial advice.
            </p>
            <p className="text-xs text-[#6E5545] leading-relaxed">
              Astrological answers provided during live broadcasts address broad planetary principles and can never substitute for a comprehensive birth chart reading evaluating full Dasha, Antardasha, and divisional vargas. For personal, private guidance, seekers should book an individual 1-on-1 consultation.
            </p>
          </section>

          {/* Article 3 */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              3. Vastu Shastra &amp; Energy Alignment
            </h2>
            <p>
              Devta Vastu and Energy Vastu audits analyze directional orientations, 45 energy fields (Devtas &amp; Asuras), and elemental balances (Pancha Tattva). While our remedies emphasize non-demolition measures (brass/copper strips, elemental colors, crystal placements), structural architectural decisions or engineering modifications must always be reviewed by certified structural engineers and licensed architects.
            </p>
          </section>

          {/* Article 4 */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              4. Vedic Remedies, Gemstones &amp; Rituals
            </h2>
            <p>
              Spiritual remedies suggested by Acharya Niraj Kumar—including planetary Beej Mantras, fasting on specific Tithis, charity (Daan), Rudraksha beads, and natural gemstones—are traditional Vedic harmonization practices intended to cultivate psychological equilibrium and karmic mitigation.
            </p>
            <p>
              Aapka Astro categorically rejects superstition, miracle cure promises, or fear-based coercion. Remedial efficacy is intimately bound to the seeker&apos;s devotion, moral conduct, and divine grace.
            </p>
          </section>

          {/* Article 5 */}
          <section className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8D8C3] shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              5. Limitation of Liability
            </h2>
            <p>
              Aapka Astro, its founder Acharya Niraj Kumar, technical developers, and representatives expressly disclaim all liability for any loss, damage, emotional distress, or financial expense incurred directly or indirectly as a consequence of applying or misinterpreting information obtained through this platform.
            </p>
          </section>

          {/* Article 6 */}
          <section className="bg-[#FBF3E7] p-6 rounded-2xl border border-[#E8D8C3] space-y-3">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26]">
              6. Queries &amp; Clarifications
            </h2>
            <p>
              If you have any questions regarding the ethical boundaries or scope of our consultations, please contact our administrative desk:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a
                href={`mailto:${PLACEHOLDER_CONTACT_INFO.email}?subject=Disclaimer%20Inquiry`}
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
          <Link href="/pricing-policy" className="hover:text-[#7B2D26] underline">
            Pricing Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
