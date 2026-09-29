import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { PLACEHOLDER_ASTROLOGER, ADMIN_CONFIGURABLE_PRICING, PLACEHOLDER_SOCIAL_LINKS } from "@/config/placeholderContent";
import { MandalaDivider } from "@/components/ui/MandalaDivider";
import { DiyaIcon } from "@/components/ui/DiyaIcon";
import { PersonJsonLd, LocalBusinessJsonLd } from "@/components/seo/JsonLd";
import { GallerySection } from "@/components/about/GallerySection";
import { TrustCredentialsSection } from "@/components/home/TrustCredentialsSection";
import {
  ShieldCheck,
  Award,
  Sparkles,
  BookOpen,
  Users,
  Compass,
  Briefcase,
  GraduationCap,
  HeartHandshake,
  PhoneCall,
  CheckCircle2,
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

      {/* 1. Header Banner */}
      <section className="relative overflow-hidden border-b border-[#E8D8C3] bg-[#7B2D26] py-16 sm:py-24 text-[#FBF3E7]">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E8A33D]/30 bg-[#64221C] px-4 py-1 text-xs font-bold text-[#E8A33D] mb-4">
            <DiyaIcon size={14} />
            <span>CERTIFIED JYOTISH ACHARYA &amp; LOGICAL VASTU EXPERT</span>
          </div>

          <h1 className="font-temple text-3xl sm:text-5xl font-bold tracking-tight text-[#FBF3E7]">
            Meet {PLACEHOLDER_ASTROLOGER.displayName}
          </h1>

          <p className="mt-4 text-base sm:text-lg text-[#FBF3E7]/90 max-w-2xl mx-auto font-body leading-relaxed">
            {PLACEHOLDER_ASTROLOGER.tagline}
          </p>
        </div>
      </section>

      {/* 2. Biography & Sacred Approach */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Image & Badges */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-md overflow-hidden rounded-3xl border-4 border-[#E8D8C3] bg-[#FFFDF9] shadow-xl">
                <img
                  src={PLACEHOLDER_ASTROLOGER.avatarUrl}
                  alt={PLACEHOLDER_ASTROLOGER.displayName}
                  className="w-full h-[460px] object-cover object-top filter contrast-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3B2A1E]/85 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white text-center">
                  <div className="font-temple text-2xl font-bold text-[#E8A33D]">
                    {PLACEHOLDER_ASTROLOGER.displayName}
                  </div>
                  <p className="text-xs text-white/95 mt-1 font-medium">
                    Jyotish Acharya &bull; Vastu &amp; Gemstone Consultant
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#7B2D26]/80 px-3 py-1 text-[11px] border border-[#E8A33D]/40">
                    <Award className="h-3 w-3 text-[#E8A33D]" />
                    <span>Bhartiya Vidya Bhawan Certified</span>
                  </div>
                </div>
              </div>

              {/* Quick Trust Highlights */}
              <div className="mt-6 grid grid-cols-3 gap-3 w-full max-w-md text-center">
                <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-3 shadow-sm">
                  <div className="text-xl font-black text-[#7B2D26]">20+</div>
                  <div className="text-[11px] text-[#6E5545] font-medium mt-0.5">Years Mastery</div>
                </div>
                <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-3 shadow-sm">
                  <div className="text-xl font-black text-[#7B2D26]">15,000+</div>
                  <div className="text-[11px] text-[#6E5545] font-medium mt-0.5">Charts Read</div>
                </div>
                <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-3 shadow-sm">
                  <div className="text-xl font-black text-[#7B2D26]">4.98 ★</div>
                  <div className="text-[11px] text-[#6E5545] font-medium mt-0.5">Seeker Rating</div>
                </div>
              </div>
            </div>

            {/* Right Detailed Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C1662F]">
                <Sparkles className="h-4 w-4" />
                <span>Lineage, Science &amp; Counsel</span>
              </div>

              <h2 className="font-temple text-2xl sm:text-4xl font-bold text-[#7B2D26] leading-snug">
                Classical Vedic Astrology &amp; Certified Logical Vastu Guidance
              </h2>

              <p className="text-sm sm:text-base text-[#3B2A1E]/90 leading-relaxed font-body">
                Aapka Astro is led by <strong>Niraj Kumar</strong>, a formally certified <strong>Jyotish Acharya</strong> from the prestigious <strong>Institute of Astrology, Bharatiya Vidya Bhawan</strong>, Kasturba Gandhi Marg, New Delhi. He is also certified as a <strong>Logical Vastu™ Expert</strong> by DivyVastu (Alchemy Vastu Pvt. Ltd.) and has completed specialized Astro Vastu training through jyotishvedanghub.
              </p>

              <p className="text-sm sm:text-base text-[#3B2A1E]/85 leading-relaxed font-body">
                With formal examination and credentials, Niraj Kumar specializes in classical Parashari chart analysis, accurate planetary dasha timing, and scientific, non-destructive Vastu solutions for homes and workplaces. Every reading is grounded in authentic Vedic principles with no fear tactics, false promises, or superstition.
              </p>

              <div className="rounded-2xl border border-[#E8A33D]/40 bg-[#FAF1E4] p-5">
                <h4 className="font-temple text-sm font-bold text-[#7B2D26] mb-1">
                  The Core Philosophy
                </h4>
                <p className="text-xs sm:text-sm text-[#6E5545] leading-relaxed italic">
                  &ldquo;Astrology is not fear-mongering or passive fatalism. It is cosmic illumination. When combined with clear diagnostics and practical, non-destructive remedies, your Janam Kundli becomes a roadmap for decisive action and lasting peace.&rdquo;
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href="/consult"
                  className="flex items-center gap-2 rounded-xl bg-[#7B2D26] px-6 py-3.5 text-xs sm:text-sm font-bold text-[#FBF3E7] hover:bg-[#96372E] transition-all shadow-md"
                >
                  <PhoneCall className="h-4 w-4 text-[#E8A33D]" />
                  <span>Consult Niraj Kumar (From ₹{ADMIN_CONFIGURABLE_PRICING.chat.ratePerMinute}/min)</span>
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

      {/* 3. Verified Pillars: Jyotish Acharya + Logical Vastu */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#FAF1E4] border-y border-[#E8D8C3]">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E8D8C3] bg-[#FFFDF9] px-3.5 py-1 text-xs font-bold text-[#7B2D26] mb-3">
              <Compass className="h-4 w-4 text-[#C1662F]" />
              <span>VERIFIED EXPERTISE</span>
            </div>
            <h2 className="font-temple text-3xl sm:text-4xl font-bold text-[#7B2D26] tracking-tight">
              Credentials &amp; Certified Specializations
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-[#6E5545] font-body">
              Authentic, certificate-backed qualifications in classical Vedic Jyotish and modern Logical Vastu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pillar 1: Bharatiya Vidya Bhawan */}
            <div className="rounded-3xl border-2 border-[#E8D8C3] bg-[#FFFDF9] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7B2D26]/10 text-[#7B2D26]">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-temple text-xl font-bold text-[#7B2D26]">
                    Bharatiya Vidya Bhawan
                  </h3>
                  <span className="text-xs text-[#C1662F] font-semibold">
                    Institute of Astrology, New Delhi
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#6E5545] leading-relaxed mb-6 font-body">
                Conferred the prestigious title of <strong>Jyotish Acharya</strong> by the Institute of Astrology, Bharatiya Vidya Bhawan, Kasturba Gandhi Marg, New Delhi (promoting Sanskrit &amp; Sanskriti since 1938):
              </p>

              <ul className="space-y-3 text-xs sm:text-sm text-[#3B2A1E]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#6B8E5A] shrink-0 mt-0.5" />
                  <span>Title Conferred: <strong>Jyotish Acharya</strong> (Second Division)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#6B8E5A] shrink-0 mt-0.5" />
                  <span>Examination Session: <strong>December 2023</strong> (Roll No. OH21011)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#6B8E5A] shrink-0 mt-0.5" />
                  <span>Certificate Issued: <strong>13 July 2024</strong></span>
                </li>
              </ul>

              <div className="mt-6 rounded-2xl bg-[#FBF3E7] p-4 text-xs text-[#6E5545] leading-relaxed">
                <strong className="text-[#7B2D26]">Academic Rigor:</strong> Rigorous examination covering mathematical astronomy, planetary dashas, Gochara transits, and classical Vedic interpretive methods.
              </div>
            </div>

            {/* Pillar 2: Vastu Certifications */}
            <div className="rounded-3xl border-2 border-[#E8D8C3] bg-[#FFFDF9] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7B2D26]/10 text-[#7B2D26]">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-temple text-xl font-bold text-[#7B2D26]">
                    Vastu Certifications
                  </h3>
                  <span className="text-xs text-[#C1662F] font-semibold">
                    DivyVastu &amp; Jyotishvedanghub
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#6E5545] leading-relaxed mb-6 font-body">
                Certified in scientific, non-demolition space balancing and Astro Vastu applications:
              </p>

              <ul className="space-y-3 text-xs sm:text-sm text-[#3B2A1E]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#C1662F] shrink-0 mt-0.5" />
                  <span><strong>Logical Vastu™ Expert</strong> — Certified by DivyVastu (Alchemy Vastu Pvt. Ltd., ISO 9001:2015 certified, June 2025)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#C1662F] shrink-0 mt-0.5" />
                  <span><strong>Astro Vastu Course</strong> — Completed via jyotishvedanghub (August 2022)</span>
                </li>
              </ul>

              <div className="mt-6 rounded-2xl bg-[#FBF3E7] p-4 text-xs text-[#6E5545] leading-relaxed">
                <strong className="text-[#7B2D26]">Non-Demolition Solutions:</strong> Correcting spatial energies and elemental imbalances through micro-zoning, elemental balancing, and color/metallic remedies without structural alterations.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Official Video Introduction */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E8D8C3] bg-[#FFFDF9] px-3.5 py-1 text-xs font-bold text-[#7B2D26] mb-3">
            <Video className="h-4 w-4 text-[#E8A33D]" />
            <span>OFFICIAL VIDEO DISCOURSE</span>
          </div>
          <h2 className="font-temple text-2xl sm:text-4xl font-bold text-[#7B2D26] tracking-tight mb-4">
            Watch Acharya Niraj Kumar in Discourse
          </h2>
          <p className="text-xs sm:text-sm text-[#6E5545] max-w-xl mx-auto mb-8 font-body">
            Listen to Acharya Ji articulate how the cosmic geometry of Vastu and Vedic ephemeris influence every sphere of human existence.
          </p>

          <div className="relative aspect-video w-full overflow-hidden rounded-3xl border-4 border-[#E8D8C3] bg-black shadow-xl">
            <iframe
              className="h-full w-full"
              src={PLACEHOLDER_SOCIAL_LINKS.youtube.embedUrl || "https://www.youtube.com/embed/hibDdoH5kbQ?si=1fp_acyv9bs01pLm"}
              title="Aapka Astro Acharya Niraj Kumar Discourse"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          {/* Social Channels Connection Bar */}
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

      {/* 5. Trust, Credentials & Press Authority */}
      <TrustCredentialsSection />

      {/* 5.1 Certificates & Gallery Section */}
      <GallerySection />

      {/* 6. Four Pillars of Practice */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#FAF1E4] border-t border-[#E8D8C3]">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h3 className="font-temple text-2xl sm:text-3xl font-bold text-[#7B2D26]">
              Our Sacred Commitment to Every Seeker
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-[#6E5545]">
              Every consultation at Aapka Astro is guided by unwavering principles of transparency and care.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#7B2D26]/10 text-[#7B2D26] mb-4">
                <CheckCircle2 className="h-6 w-6 text-[#6B8E5A]" />
              </div>
              <h4 className="font-temple text-base font-bold text-[#7B2D26]">100% Direct</h4>
              <p className="text-xs text-[#6E5545] mt-2 leading-relaxed">
                You speak exclusively with Acharya Niraj Kumar, never an untrained junior or auto-generated script.
              </p>
            </div>

            <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#7B2D26]/10 text-[#7B2D26] mb-4">
                <ShieldCheck className="h-6 w-6 text-[#E8A33D]" />
              </div>
              <h4 className="font-temple text-base font-bold text-[#7B2D26]">Zero Fear Tactics</h4>
              <p className="text-xs text-[#6E5545] mt-2 leading-relaxed">
                No invented curses, fabricated planetary horrors, or extortionate commercial ritual packages.
              </p>
            </div>

            <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#7B2D26]/10 text-[#7B2D26] mb-4">
                <Sparkles className="h-6 w-6 text-[#C1662F]" />
              </div>
              <h4 className="font-temple text-base font-bold text-[#7B2D26]">Actionable Remedies</h4>
              <p className="text-xs text-[#6E5545] mt-2 leading-relaxed">
                Satvik mantra japa, morning Surya Arghya, charitable timing, and lab-certified natural gemstones.
              </p>
            </div>

            <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#7B2D26]/10 text-[#7B2D26] mb-4">
                <HeartHandshake className="h-6 w-6 text-[#7B2D26]" />
              </div>
              <h4 className="font-temple text-base font-bold text-[#7B2D26]">Total Confidentiality</h4>
              <p className="text-xs text-[#6E5545] mt-2 leading-relaxed">
                Your birth details and personal life matters remain completely confidential and secure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Bottom CTA Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#7B2D26] text-[#FBF3E7]">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-temple text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to Connect with Niraj Kumar?
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-[#FBF3E7]/80 max-w-xl mx-auto">
            Experience live 1-on-1 counsel backed by formal Jyotish Acharya qualifications and certified Logical Vastu expertise. First session is 50% off.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/consult"
              className="flex items-center gap-2 rounded-xl bg-[#E8A33D] px-8 py-3.5 text-xs sm:text-sm font-bold text-[#3B2A1E] hover:bg-[#F6CF86] transition-all shadow-md"
            >
              <PhoneCall className="h-4 w-4" />
              <span>Start Live Consultation Now</span>
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
    </div>
  );
}
