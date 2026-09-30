import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  PLACEHOLDER_ASTROLOGER,
  PLACEHOLDER_SOCIAL_LINKS,
  FLAT_CONSULTATION_PRICING,
} from "@/config/placeholderContent";
import { MandalaDivider } from "@/components/ui/MandalaDivider";
import { DiyaIcon } from "@/components/ui/DiyaIcon";
import { PersonJsonLd, LocalBusinessJsonLd } from "@/components/seo/JsonLd";
import { GallerySection } from "@/components/about/GallerySection";
import { AboutHeroImageCarousel } from "@/components/about/AboutHeroImageCarousel";
import { TrustCredentialsSection } from "@/components/home/TrustCredentialsSection";
import {
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Compass,
  Factory,
  GraduationCap,
  HeartHandshake,
  Home,
  Laptop,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Store,
  Video,
} from "lucide-react";

export const metadata: Metadata = {
  title: `About ${PLACEHOLDER_ASTROLOGER.displayName} | Aapka Astro`,
  description: PLACEHOLDER_ASTROLOGER.bio,
  openGraph: {
    title: `About ${PLACEHOLDER_ASTROLOGER.displayName} — Vedic Astrology & Vastu`,
    description: PLACEHOLDER_ASTROLOGER.bio,
    images: [PLACEHOLDER_ASTROLOGER.avatarUrl],
  },
};

export default function AboutPage() {
  return (
    <div className="bg-[#FBF3E7] text-[#3B2A1E]">
      <PersonJsonLd />
      <LocalBusinessJsonLd />

      {/* ========================================================================= */}
      {/* 1. OPENING STATEMENT & HERO BANNER */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden border-b border-[#E8D8C3] bg-[#7B2D26] py-16 sm:py-24 text-[#FBF3E7]">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E8A33D]/30 bg-[#64221C] px-4 py-1.5 text-xs font-bold text-[#E8A33D] mb-5 shadow-sm">
            <DiyaIcon size={14} />
            <span>ANCIENT WISDOM &bull; MODERN LIFE</span>
          </div>

          <h1 className="font-temple text-3xl sm:text-5xl font-bold tracking-tight text-[#FBF3E7]">
            About Aapka Astro
          </h1>

          {/* Verbatim Opening Statement */}
          <p className="mt-5 text-lg sm:text-xl text-[#FBF3E7]/90 max-w-3xl mx-auto font-body leading-relaxed font-light">
            At Aapka Astro, we work at the intersection of ancient wisdom and modern life.
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. THE MIND BEHIND AAPKA ASTRO: ACHARYA NIRAJ KUMAR */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: 5-Second Cycling Carousel & Trust Counts */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <AboutHeroImageCarousel />

              {/* Verified Trust Metrics */}
              <div className="mt-6 grid grid-cols-3 gap-3 w-full max-w-md text-center">
                <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-3.5 shadow-sm">
                  <div className="text-xl font-black text-[#7B2D26]">20+</div>
                  <div className="text-[11px] text-[#6E5545] font-medium mt-0.5">
                    Years Vedic Mastery
                  </div>
                </div>
                <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-3.5 shadow-sm">
                  <div className="text-xl font-black text-[#7B2D26]">15,000+</div>
                  <div className="text-[11px] text-[#6E5545] font-medium mt-0.5">
                    Consultations
                  </div>
                </div>
                <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-3.5 shadow-sm">
                  <div className="text-xl font-black text-[#7B2D26]">4.98 ★</div>
                  <div className="text-[11px] text-[#6E5545] font-medium mt-0.5">
                    Seeker Rating
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Verbatim Narrative & Bio */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C1662F]">
                <Sparkles className="h-4 w-4" />
                <span>The Mind Behind Aapka Astro</span>
              </div>

              <h2 className="font-temple text-3xl sm:text-4xl font-bold text-[#7B2D26] leading-tight">
                Acharya Niraj Kumar
              </h2>

              {/* Full Bio Paragraphs */}
              <p className="text-base text-[#3B2A1E]/95 leading-relaxed font-body font-light">
                Aapka Astro is led by Acharya Niraj Kumar, a practitioner who brings together deep
                traditional learning and rare real-world experience.
              </p>

              <p className="text-base text-[#3B2A1E]/90 leading-relaxed font-body font-light">
                Raised in the spiritually rich ecosystem of Baidyanath Dham, Deoghar, his journey
                into astrology and Vastu began early, shaped by both curiosity and disciplined
                guidance. Over the last two decades, he has studied, practiced, and refined his
                approach across more than 15,000 chart analyses and numerous Vastu consultations.
              </p>

              {/* Highlight / Quote Box */}
              <div className="rounded-2xl border-l-4 border-[#E8A33D] bg-[#FAF1E4] p-5 shadow-xs">
                <p className="text-sm sm:text-base text-[#7B2D26] font-medium italic leading-relaxed">
                  &ldquo;What sets him apart is not just knowledge, but interpretation. His work is
                  known for being analytical, structured, and outcome-oriented rather than ritualistic
                  or abstract.&rdquo;
                </p>
              </div>

              {/* Belief & Philosophy Box */}
              <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 shadow-sm space-y-3">
                <p className="text-base sm:text-lg text-[#3B2A1E] font-medium leading-relaxed font-body">
                  Our belief is simple yet profound:{" "}
                  <strong className="text-[#7B2D26]">
                    When your inner intent aligns with the energy of your environment, life begins to
                    move with clarity, ease, and purpose.
                  </strong>
                </p>
                <p className="text-sm text-[#6E5545] leading-relaxed">
                  We don’t offer superstition. We offer structured insight, grounded in time-tested
                  sciences like Vastu Shastra and Astrology, interpreted through a contemporary,
                  practical lens.
                </p>
              </div>

              {/* Call to Action */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href="/consult"
                  className="flex items-center gap-2 rounded-xl bg-[#7B2D26] px-6 py-3.5 text-xs sm:text-sm font-bold text-[#FBF3E7] hover:bg-[#96372E] transition-all shadow-md"
                >
                  <PhoneCall className="h-4 w-4 text-[#E8A33D]" />
                  <span>
                    Book Consultation — ₹
                    {FLAT_CONSULTATION_PRICING.firstConsultationFee.toLocaleString(
                      "en-IN"
                    )}{" "}
                    (First Session)
                  </span>
                </Link>
                <Link
                  href="/services"
                  className="rounded-xl border border-[#7B2D26] px-6 py-3.5 text-xs sm:text-sm font-bold text-[#7B2D26] hover:bg-[#FBF3E7] transition-all"
                >
                  Explore All Services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. BEYOND TRADITIONAL VASTU: A DEEPER, PRECISION-LED APPROACH */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#FFFDF9] border-t border-[#E8D8C3]">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E8D8C3] bg-[#FAF1E4] px-3.5 py-1 text-xs font-bold text-[#7B2D26] mb-3">
              <Compass className="h-4 w-4 text-[#C1662F]" />
              <span>PRECISION ENERGY ARCHITECTURE</span>
            </div>
            <h2 className="font-temple text-3xl sm:text-4xl font-bold text-[#7B2D26] tracking-tight">
              Beyond Traditional Vastu: A Deeper, Precision-Led Approach
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#6E5545] font-light leading-relaxed font-body max-w-4xl mx-auto">
              Acharya Niraj Kumar’s expertise in Vastu goes far beyond conventional directional
              corrections. With advanced training in{" "}
              <strong className="font-semibold text-[#7B2D26]">
                Devta Vastu, Energy Vastu, and AstroVastu
              </strong>
              , he works at a far more granular level — decoding the energetic blueprint of a space,
              including micro-zones and elemental imbalances.
            </p>
          </div>

          {/* 3 Framing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="rounded-2xl border-t-4 border-[#7B2D26] bg-[#FAF1E4] p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-[#7B2D26]/10 text-[#7B2D26] flex items-center justify-center mb-5">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-[#3B2A1E] leading-snug">
                Identifying root causes, not just surface defects.
              </h3>
            </div>

            <div className="rounded-2xl border-t-4 border-[#E8A33D] bg-[#FAF1E4] p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-[#E8A33D]/20 text-[#7B2D26] flex items-center justify-center mb-5">
                <CheckCircle2 className="h-6 w-6 text-[#6B8E5A]" />
              </div>
              <h3 className="text-lg font-semibold text-[#3B2A1E] leading-snug">
                Applying practical, non-destructive remedies.
              </h3>
            </div>

            <div className="rounded-2xl border-t-4 border-[#C1662F] bg-[#FAF1E4] p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-[#C1662F]/15 text-[#C1662F] flex items-center justify-center mb-5">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-[#3B2A1E] leading-snug">
                Aligning spaces with the specific needs of individuals or businesses.
              </h3>
            </div>
          </div>

          {/* Focus Summary Banner */}
          <div className="rounded-2xl border border-[#E8D8C3] bg-[#FBF3E7] p-8 text-center max-w-4xl mx-auto shadow-xs">
            <p className="text-lg sm:text-xl text-[#3B2A1E] leading-relaxed font-body">
              Whether it is a home, office, retail space, or industrial setup, the goal remains
              consistent:
              <strong className="block mt-2 text-2xl font-temple font-bold text-[#7B2D26]">
                remove friction, restore balance, and enable growth.
              </strong>
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. OUR APPROACH TO VASTU SERVICES */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#FAF1E4] border-t border-[#E8D8C3]">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-temple text-3xl sm:text-4xl font-bold text-[#7B2D26] tracking-tight">
              Our Approach to Vastu Services
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#6E5545] font-light">
              Tailored spatial diagnostics and elemental alignment across all living and commercial environments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* 1. Residential Vastu */}
            <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-8 shadow-md hover:-translate-y-1 transition-transform flex flex-col">
              <div className="w-14 h-14 bg-[#7B2D26]/10 text-[#7B2D26] rounded-2xl flex items-center justify-center mb-6">
                <Home className="h-7 w-7" />
              </div>
              <h3 className="font-temple text-2xl font-bold text-[#7B2D26] mb-3">
                Residential Vastu
              </h3>
              <p className="text-sm text-[#6E5545] mb-6 font-light leading-relaxed">
                We help transform homes into spaces that support peace, health, and financial
                stability.
              </p>
              <ul className="space-y-3 mb-8 text-xs sm:text-sm text-[#3B2A1E]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#6B8E5A] shrink-0 mt-0.5" />
                  <span>Detailed floor plan analysis</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#6B8E5A] shrink-0 mt-0.5" />
                  <span>Elemental balance (Panchamahabhutas)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#6B8E5A] shrink-0 mt-0.5" />
                  <span>Practical remedies without structural changes</span>
                </li>
              </ul>
              <div className="pt-6 border-t border-[#E8D8C3] mt-auto">
                <span className="text-xs font-semibold text-[#7B2D26] bg-[#FAF1E4] inline-block px-3.5 py-1.5 rounded-xl border border-[#E8D8C3]">
                  Ideal for homeowners, renters, and property buyers.
                </span>
              </div>
            </div>

            {/* 2. Commercial & Corporate Vastu */}
            <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-8 shadow-md hover:-translate-y-1 transition-transform flex flex-col relative overflow-hidden">
              <div className="w-14 h-14 bg-[#E8A33D]/20 text-[#7B2D26] rounded-2xl flex items-center justify-center mb-6">
                <Store className="h-7 w-7" />
              </div>
              <h3 className="font-temple text-2xl font-bold text-[#7B2D26] mb-3">
                Commercial &amp; Corporate
              </h3>
              <p className="text-sm text-[#6E5545] mb-6 font-light leading-relaxed">
                Designed with a strong understanding of business dynamics.
              </p>
              <ul className="space-y-3 mb-8 text-xs sm:text-sm text-[#3B2A1E]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#6B8E5A] shrink-0 mt-0.5" />
                  <span>Leadership cabin positioning for better decision-making</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#6B8E5A] shrink-0 mt-0.5" />
                  <span>Sales and customer flow optimization</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#6B8E5A] shrink-0 mt-0.5" />
                  <span>Workplace energy alignment for productivity and retention</span>
                </li>
              </ul>
              <div className="pt-6 border-t border-[#E8D8C3] mt-auto">
                <span className="text-xs font-semibold text-[#7B2D26] bg-[#FAF1E4] inline-block px-3.5 py-1.5 rounded-xl border border-[#E8D8C3]">
                  Ideal for business owners, corporate offices, and retail.
                </span>
              </div>
            </div>

            {/* 3. Industrial Vastu */}
            <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-8 shadow-md hover:-translate-y-1 transition-transform flex flex-col">
              <div className="w-14 h-14 bg-[#C1662F]/15 text-[#C1662F] rounded-2xl flex items-center justify-center mb-6">
                <Factory className="h-7 w-7" />
              </div>
              <h3 className="font-temple text-2xl font-bold text-[#7B2D26] mb-3">
                Industrial Vastu
              </h3>
              <p className="text-sm text-[#6E5545] mb-6 font-light leading-relaxed">
                Focused on efficiency, safety, and operational flow.
              </p>
              <ul className="space-y-3 mb-8 text-xs sm:text-sm text-[#3B2A1E]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#6B8E5A] shrink-0 mt-0.5" />
                  <span>Machinery placement optimization</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#6B8E5A] shrink-0 mt-0.5" />
                  <span>Raw material and finished goods zoning</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#6B8E5A] shrink-0 mt-0.5" />
                  <span>Energy alignment for workforce stability</span>
                </li>
              </ul>
              <div className="pt-6 border-t border-[#E8D8C3] mt-auto">
                <span className="text-xs font-semibold text-[#7B2D26] bg-[#FAF1E4] inline-block px-3.5 py-1.5 rounded-xl border border-[#E8D8C3]">
                  Ideal for factories, warehouses, and processing units.
                </span>
              </div>
            </div>
          </div>

          {/* 4. Online / Virtual Consultation (Full Width) */}
          <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-8 md:p-10 shadow-md hover:-translate-y-1 transition-transform flex flex-col md:flex-row gap-8 items-center">
            <div className="w-16 h-16 bg-[#7B2D26]/10 text-[#7B2D26] rounded-2xl flex items-center justify-center shrink-0">
              <Laptop className="h-8 w-8" />
            </div>
            <div className="flex-1 w-full">
              <h3 className="font-temple text-2xl font-bold text-[#7B2D26] mb-4">
                Online / Virtual Consultation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-xs sm:text-sm text-[#3B2A1E]">
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#6B8E5A] shrink-0 mt-0.5" />
                    <span>
                      <strong className="font-semibold text-[#7B2D26]">Expert guidance,</strong>{" "}
                      delivered globally.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#6B8E5A] shrink-0 mt-0.5" />
                    <span>Digital analysis using plans and compass readings</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#6B8E5A] shrink-0 mt-0.5" />
                    <span>Detailed reports with actionable remedies</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#6B8E5A] shrink-0 mt-0.5" />
                    <span className="font-semibold text-[#7B2D26]">
                      Same depth as physical consultations
                    </span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-[#E8D8C3]">
                <span className="text-xs font-semibold text-[#7B2D26] bg-[#FAF1E4] inline-block px-3.5 py-1.5 rounded-xl border border-[#E8D8C3]">
                  Ideal for international clients and time-sensitive decisions.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. WHERE SPIRITUAL SCIENCE MEETS CORPORATE INSIGHT */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#FFFDF9] border-t border-[#E8D8C3]">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C1662F]">
                <Briefcase className="h-4 w-4" />
                <span>Executive Experience</span>
              </div>

              <h2 className="font-temple text-3xl sm:text-4xl font-bold text-[#7B2D26] leading-tight">
                Where Spiritual Science Meets Corporate Insight
              </h2>

              <p className="text-base text-[#3B2A1E]/90 leading-relaxed font-body font-light">
                What makes Acharya Niraj Kumar uniquely effective, especially in commercial and
                corporate Vastu, is his extensive leadership background.
              </p>

              {/* Senior Roles Box */}
              <div className="bg-[#FAF1E4] border-l-4 border-[#7B2D26] p-6 rounded-r-2xl shadow-xs">
                <p className="text-base text-[#3B2A1E] leading-relaxed font-body">
                  With over two decades in senior roles including{" "}
                  <strong className="font-bold text-[#7B2D26]">
                    Vice President and Business Head
                  </strong>{" "}
                  at organizations such as{" "}
                  <strong className="font-bold text-[#7B2D26]">
                    Reliance Retail, Metro Cash &amp; Carry, and NIF Food
                  </strong>
                  , he understands business realities firsthand.
                </p>
              </div>

              <p className="text-base text-[#3B2A1E]/90 leading-relaxed font-body font-light">
                This rare blend allows him to translate Vastu from theory into strategy — making it
                relevant for decision-making, productivity, growth, and leadership effectiveness.
              </p>
            </div>

            {/* Right Academic Foundation Card */}
            <div className="lg:col-span-5">
              <div className="bg-[#7B2D26] text-[#FBF3E7] rounded-3xl p-8 md:p-10 shadow-xl border-2 border-[#E8A33D]/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#E8A33D]/10 rounded-full blur-2xl pointer-events-none" />

                <h3 className="text-xl sm:text-2xl font-temple font-bold text-[#E8A33D] mb-6 flex items-center gap-3">
                  <GraduationCap className="h-7 w-7 text-[#E8A33D] shrink-0" />
                  <span>Academic &amp; Corporate Foundation</span>
                </h3>

                <ul className="space-y-5 text-sm sm:text-base">
                  <li className="flex items-start gap-3.5">
                    <CheckCircle2 className="h-5 w-5 text-[#E8A33D] shrink-0 mt-0.5" />
                    <span className="text-[#FBF3E7]/95 font-medium">B.Sc. (Hons.) in Physics</span>
                  </li>
                  <li className="flex items-start gap-3.5">
                    <CheckCircle2 className="h-5 w-5 text-[#E8A33D] shrink-0 mt-0.5" />
                    <span className="text-[#FBF3E7]/95 font-medium">
                      PGDBM in International Business &amp; Marketing
                    </span>
                  </li>
                  <li className="flex items-start gap-3.5">
                    <CheckCircle2 className="h-5 w-5 text-[#E8A33D] shrink-0 mt-0.5" />
                    <span className="text-[#FBF3E7]/95 font-medium">
                      Leadership Development &amp; Change Management certification from XLRI
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. LINEAGE, LEARNING, AND CREDIBILITY */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#FAF1E4] border-t border-[#E8D8C3]">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="font-temple text-3xl sm:text-4xl font-bold text-[#7B2D26] tracking-tight">
              Lineage, Learning, and Credibility
            </h2>
            <p className="mt-3 text-base sm:text-lg text-[#6E5545] font-light leading-relaxed">
              His practice is rooted in both traditional lineage and formal education:
            </p>
          </div>

          <div className="bg-[#FFFDF9] rounded-3xl p-8 md:p-12 shadow-md border border-[#E8D8C3] mb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Column 1 */}
              <ul className="space-y-6 text-sm sm:text-base text-[#3B2A1E]">
                <li className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-[#FAF1E4] text-[#7B2D26] flex items-center justify-center shrink-0 mt-0.5 border border-[#E8D8C3]">
                    <Award className="h-5 w-5" />
                  </div>
                  <span className="leading-relaxed">
                    Trained under{" "}
                    <strong className="font-bold text-[#7B2D26]">
                      Late Guru Shri B. B. Tiwari
                    </strong>
                  </span>
                </li>

                <li className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-[#FAF1E4] text-[#7B2D26] flex items-center justify-center shrink-0 mt-0.5 border border-[#E8D8C3]">
                    <Award className="h-5 w-5" />
                  </div>
                  <span className="leading-relaxed">
                    Advanced Vastu certifications from{" "}
                    <strong className="font-semibold text-[#7B2D26]">Divya Vastu</strong> and{" "}
                    <strong className="font-semibold text-[#7B2D26]">Vaastu Just For You</strong>
                  </span>
                </li>

                <li className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-[#FAF1E4] text-[#7B2D26] flex items-center justify-center shrink-0 mt-0.5 border border-[#E8D8C3]">
                    <Award className="h-5 w-5" />
                  </div>
                  <span className="leading-relaxed">
                    <strong className="font-bold text-[#7B2D26]">M.A. in Jyotish</strong> (IGNOU,
                    2024)
                  </span>
                </li>

                <li className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-[#FAF1E4] text-[#7B2D26] flex items-center justify-center shrink-0 mt-0.5 border border-[#E8D8C3]">
                    <Award className="h-5 w-5" />
                  </div>
                  <span className="leading-relaxed">
                    <strong className="font-bold text-[#7B2D26]">Jyotish Acharya</strong> from
                    Bhartiya Vidya Bhawan (K.N. Rao Institute)
                  </span>
                </li>
              </ul>

              {/* Column 2 */}
              <ul className="space-y-6 text-sm sm:text-base text-[#3B2A1E]">
                <li className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-[#FAF1E4] text-[#7B2D26] flex items-center justify-center shrink-0 mt-0.5 border border-[#E8D8C3]">
                    <Award className="h-5 w-5" />
                  </div>
                  <span className="leading-relaxed">
                    <strong className="font-bold text-[#7B2D26]">Nadi Parveen</strong> (ICAS)
                  </span>
                </li>

                <li className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-[#FAF1E4] text-[#7B2D26] flex items-center justify-center shrink-0 mt-0.5 border border-[#E8D8C3]">
                    <Award className="h-5 w-5" />
                  </div>
                  <span className="leading-relaxed">
                    <strong className="font-bold text-[#7B2D26]">Jyotish Prabhakar</strong> (IRIW
                    under Dr. Pawan Sinha)
                  </span>
                </li>

                <li className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-[#FAF1E4] text-[#7B2D26] flex items-center justify-center shrink-0 mt-0.5 border border-[#E8D8C3]">
                    <Award className="h-5 w-5" />
                  </div>
                  <span className="leading-relaxed">
                    <strong className="font-bold text-[#7B2D26]">
                      Jyotish Visharad &amp; Jyotish Mani
                    </strong>{" "}
                    (Bharat Jyotish Vidyapith)
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Research & Teaching Note */}
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-base sm:text-lg text-[#6E5545] leading-relaxed italic font-body">
              He continues to pursue advanced research and actively teaches astrology, reflecting a
              commitment to both depth and evolution.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. OUR CORE OFFERINGS */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#7B2D26] text-[#FBF3E7] border-t border-[#E8D8C3] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E8A33D]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-6xl relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E8A33D]/40 bg-[#64221C] px-4 py-1.5 text-xs font-bold text-[#E8A33D] mb-4">
              <Sparkles className="h-4 w-4" />
              <span>MEASURABLE IMPACT</span>
            </div>
            <h2 className="font-temple text-3xl sm:text-4xl font-bold text-[#E8A33D] mb-4 tracking-tight">
              Our Core Offerings
            </h2>
            <p className="text-base sm:text-lg text-[#FBF3E7]/90 font-light max-w-2xl mx-auto leading-relaxed">
              At Aapka Astro, the focus is always on clarity, practicality, and measurable impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 1. Vastu Shastra */}
            <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-8 hover:bg-white/15 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-[#E8A33D]/20 text-[#E8A33D] flex items-center justify-center mb-6">
                <Compass className="h-7 w-7" />
              </div>
              <h3 className="font-temple text-2xl font-bold text-[#FBF3E7] mb-3">
                Vastu Shastra
              </h3>
              <p className="text-base text-[#FBF3E7]/90 leading-relaxed font-light font-body">
                Strategic alignment of residential, commercial, and industrial spaces to enhance
                well-being, financial flow, and stability.
              </p>
            </div>

            {/* 2. Vedic & KP Astrology */}
            <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-8 hover:bg-white/15 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-[#E8A33D]/20 text-[#E8A33D] flex items-center justify-center mb-6">
                <BookOpen className="h-7 w-7" />
              </div>
              <h3 className="font-temple text-2xl font-bold text-[#FBF3E7] mb-3">
                Vedic &amp; KP Astrology
              </h3>
              <p className="text-base text-[#FBF3E7]/90 leading-relaxed font-light font-body">
                Detailed chart analysis offering actionable insights on career, relationships, and
                life direction.
              </p>
            </div>

            {/* 3. Nadi Astrology */}
            <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-8 hover:bg-white/15 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-[#E8A33D]/20 text-[#E8A33D] flex items-center justify-center mb-6">
                <Sparkles className="h-7 w-7" />
              </div>
              <h3 className="font-temple text-2xl font-bold text-[#FBF3E7] mb-3">
                Nadi Astrology
              </h3>
              <p className="text-base text-[#FBF3E7]/90 leading-relaxed font-light font-body">
                A precise and deterministic system that reveals deeper patterns across time.
              </p>
            </div>

            {/* 4. Prashna (Horary) Astrology */}
            <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-8 hover:bg-white/15 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-[#E8A33D]/20 text-[#E8A33D] flex items-center justify-center mb-6">
                <Award className="h-7 w-7" />
              </div>
              <h3 className="font-temple text-2xl font-bold text-[#FBF3E7] mb-3">
                Prashna (Horary) Astrology
              </h3>
              <p className="text-base text-[#FBF3E7]/90 leading-relaxed font-light font-body">
                Accurate, situation-specific answers based on the moment of inquiry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. WHAT WE STAND FOR */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#FFFDF9] border-t border-[#E8D8C3]">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="font-temple text-3xl sm:text-4xl font-bold text-[#7B2D26] mb-4 tracking-tight">
              What We Stand For
            </h2>
            <p className="text-xl sm:text-2xl font-serif text-[#3B2A1E]">
              At its core, Aapka Astro is about enabling better decisions.
            </p>
          </div>

          {/* 3 Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-[#E8D8C3] bg-[#FAF1E4] p-6 text-center shadow-xs">
              <div className="w-14 h-14 bg-red-100/70 text-red-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[#3B2A1E]">Not fear.</h3>
            </div>

            <div className="rounded-2xl border border-[#E8D8C3] bg-[#FAF1E4] p-6 text-center shadow-xs">
              <div className="w-14 h-14 bg-gray-200/70 text-[#6E5545] rounded-full flex items-center justify-center mx-auto mb-4">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[#3B2A1E]">Not blind belief.</h3>
            </div>

            <div className="rounded-2xl border-2 border-[#E8A33D] bg-[#FAF1E4] p-6 text-center shadow-md transform md:-translate-y-2">
              <div className="w-14 h-14 bg-[#E8A33D]/25 text-[#7B2D26] rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[#7B2D26]">
                But clarity, structure, and alignment.
              </h3>
            </div>
          </div>

          {/* Verbatim Closing Banner */}
          <div className="rounded-3xl border-2 border-[#E8D8C3] bg-[#7B2D26] text-[#FBF3E7] p-10 md:p-14 text-center shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#E8A33D_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

            <p className="text-xl sm:text-2xl leading-relaxed relative z-10 max-w-3xl mx-auto font-light font-body">
              Whether you are building a home, scaling a business, or seeking direction in life, the
              objective is simple:
            </p>

            <div className="mt-4 text-2xl sm:text-3xl font-temple font-bold text-[#E8A33D] relative z-10">
              Help you move forward with confidence and balance.
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. OFFICIAL VIDEO DISCOURSE */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#FAF1E4] border-t border-[#E8D8C3]">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E8D8C3] bg-[#FFFDF9] px-3.5 py-1 text-xs font-bold text-[#7B2D26] mb-3">
            <Video className="h-4 w-4 text-[#E8A33D]" />
            <span>OFFICIAL VIDEO DISCOURSE</span>
          </div>
          <h2 className="font-temple text-2xl sm:text-4xl font-bold text-[#7B2D26] tracking-tight mb-4">
            Watch Acharya Niraj Kumar in Discourse
          </h2>
          <p className="text-xs sm:text-sm text-[#6E5545] max-w-xl mx-auto mb-8 font-body">
            Listen to Acharya Ji articulate how the cosmic geometry of Vastu and Vedic ephemeris
            influence every sphere of human existence.
          </p>

          <div className="relative aspect-video w-full overflow-hidden rounded-3xl border-4 border-[#E8D8C3] bg-black shadow-xl">
            <iframe
              className="h-full w-full"
              src={
                PLACEHOLDER_SOCIAL_LINKS.youtube.embedUrl ||
                "https://www.youtube.com/embed/hibDdoH5kbQ?si=1fp_acyv9bs01pLm"
              }
              title="Aapka Astro Acharya Niraj Kumar Discourse"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={PLACEHOLDER_SOCIAL_LINKS.youtube.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#7B2D26] px-5 py-2.5 text-xs sm:text-sm font-bold text-[#FBF3E7] hover:bg-[#96372E] transition-all shadow-sm"
            >
              <span>Watch on YouTube ({PLACEHOLDER_SOCIAL_LINKS.youtube.handle})</span>
            </a>
            <a
              href={PLACEHOLDER_SOCIAL_LINKS.facebook.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-[#7B2D26] bg-[#FFFDF9] px-5 py-2.5 text-xs sm:text-sm font-bold text-[#7B2D26] hover:bg-[#FBF3E7] transition-all shadow-sm"
            >
              <span>Connect on Facebook ({PLACEHOLDER_SOCIAL_LINKS.facebook.handle})</span>
            </a>
            <a
              href={PLACEHOLDER_SOCIAL_LINKS.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-[#7B2D26] bg-[#FFFDF9] px-5 py-2.5 text-xs sm:text-sm font-bold text-[#7B2D26] hover:bg-[#FBF3E7] transition-all shadow-sm"
            >
              <span>Follow on Instagram ({PLACEHOLDER_SOCIAL_LINKS.instagram.handle})</span>
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. OFFICIAL CERTIFICATES & LINEAGE GALLERY */}
      {/* ========================================================================= */}
      <GallerySection />

      {/* ========================================================================= */}
      {/* 11. TRUST CREDENTIALS SECTION */}
      {/* ========================================================================= */}
      <TrustCredentialsSection />

      {/* ========================================================================= */}
      {/* 12. BOTTOM CTA BANNER */}
      {/* ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#7B2D26] text-[#FBF3E7]">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-temple text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to Connect with Acharya Niraj Kumar?
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-[#FBF3E7]/80 max-w-xl mx-auto">
            Experience live 1-on-1 counsel backed by formal Jyotish Acharya qualifications,
            traditional lineage, and extensive corporate leadership insight.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/consult"
              className="flex items-center gap-2 rounded-xl bg-[#E8A33D] px-8 py-3.5 text-xs sm:text-sm font-bold text-[#3B2A1E] hover:bg-[#F6CF86] transition-all shadow-md"
            >
              <PhoneCall className="h-4 w-4" />
              <span>
                Start Consultation — ₹
                {FLAT_CONSULTATION_PRICING.firstConsultationFee.toLocaleString(
                  "en-IN"
                )}{" "}
                (50% Off First)
              </span>
            </Link>
            <Link
              href="/services"
              className="rounded-xl border border-[#FBF3E7]/30 px-6 py-3.5 text-xs sm:text-sm font-semibold text-[#FBF3E7] hover:bg-[#FBF3E7]/10 transition-all"
            >
              Browse Detailed Services
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="text-center py-6 bg-[#FBF3E7]">
        <MandalaDivider opacity={0.3} />
      </div>
    </div>
  );
}
