import React from "react";
import Link from "next/link";
import { MandalaDivider } from "@/components/ui/MandalaDivider";
import { DiyaIcon } from "@/components/ui/DiyaIcon";
import {
  ShieldCheck,
  Award,
  BookOpen,
  Briefcase,
  Sparkles,
  ExternalLink,
  Users,
  CheckCircle2,
  Tv,
  Compass,
} from "lucide-react";
import { PLACEHOLDER_ASTROLOGER } from "@/config/placeholderContent";

export const TrustCredentialsSection: React.FC = () => {
  return (
    <section className="border-t border-b border-[#E8D8C3] bg-gradient-to-b from-[#FFFDF9] to-[#FBF3E7] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E8A33D]/60 bg-[#FFFDF9] px-4 py-1 text-xs font-bold text-[#7B2D26] shadow-2xs mb-3">
            <ShieldCheck className="h-3.5 w-3.5 text-[#6B8E5A]" />
            <span>Verifiable Vedic Mastery &bull; Zero Marketplace Gimmicks</span>
          </div>

          <h2 className="font-temple text-3xl sm:text-4xl font-bold text-[#7B2D26]">
            Why Seekers Trust {PLACEHOLDER_ASTROLOGER.displayName}
          </h2>

          <p className="mt-3 text-sm text-[#6E5545] leading-relaxed">
            Aapka Astro provides direct 1-on-1 access to a formally certified Jyotish Acharya and Logical Vastu Expert, blending classical Parashari Jyotish with verified, non-destructive space balancing techniques.
          </p>

          <div className="flex justify-center my-4">
            <MandalaDivider className="w-28 text-[#C1662F]" />
          </div>
        </div>

        {/* Solo Practitioner Trust Badges Strip */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-4 shadow-2xs">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7B2D26]/10 text-[#7B2D26]">
              <Award className="h-5 w-5 text-[#7B2D26]" />
            </div>
            <div>
              <div className="font-temple text-xs font-bold text-[#7B2D26]">Certified Vedic Astrologer</div>
              <div className="text-[10px] text-[#6E5545]">Jyotish Acharya &bull; BVB New Delhi</div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-4 shadow-2xs">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6B8E5A]/15 text-[#6B8E5A]">
              <ShieldCheck className="h-5 w-5 text-[#6B8E5A]" />
            </div>
            <div>
              <div className="font-temple text-xs font-bold text-[#7B2D26]">100% Confidential</div>
              <div className="text-[10px] text-[#6E5545]">Private 1-on-1 Consultations Only</div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-4 shadow-2xs">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8A33D]/15 text-[#C1662F]">
              <CheckCircle2 className="h-5 w-5 text-[#C1662F]" />
            </div>
            <div>
              <div className="font-temple text-xs font-bold text-[#7B2D26]">Direct Access to Acharya Ji</div>
              <div className="text-[10px] text-[#6E5545]">No Junior Astrologers or Bots</div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-4 shadow-2xs">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7B2D26]/10 text-[#7B2D26]">
              <ShieldCheck className="h-5 w-5 text-[#7B2D26]" />
            </div>
            <div>
              <div className="font-temple text-xs font-bold text-[#7B2D26]">Secure Payments</div>
              <div className="text-[10px] text-[#6E5545]">Encrypted via Razorpay &bull; UPI / Cards</div>
            </div>
          </div>
        </div>

        {/* 4 Pillars of Authority */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1: Bharatiya Vidya Bhawan */}
          <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 shadow-xs hover:border-[#C1662F] transition-colors">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7B2D26]/10 text-[#7B2D26] mb-4">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="font-temple text-lg font-bold text-[#7B2D26]">
              Bharatiya Vidya Bhawan
            </h3>
            <p className="mt-2 text-xs text-[#6E5545] leading-relaxed">
              Formally earned <em>Jyotish Acharya</em> title (Second Division, Exam Dec 2023, Roll No. OH21011) from the Institute of Astrology, New Delhi.
            </p>
          </div>

          {/* Pillar 2: DivyVastu Certified */}
          <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 shadow-xs hover:border-[#C1662F] transition-colors">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8A33D]/15 text-[#C1662F] mb-4">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="font-temple text-lg font-bold text-[#7B2D26]">
              Logical Vastu™ Expert
            </h3>
            <p className="mt-2 text-xs text-[#6E5545] leading-relaxed">
              Certified by DivyVastu (on behalf of Alchemy Vastu Pvt. Ltd., an ISO 9001:2015 certified Vastu Consulting and Education services firm, June 2025).
            </p>
          </div>

          {/* Pillar 3: Astro Vastu Specialist */}
          <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 shadow-xs hover:border-[#C1662F] transition-colors">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6B8E5A]/15 text-[#6B8E5A] mb-4">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="font-temple text-lg font-bold text-[#7B2D26]">
              Astro Vastu Certified
            </h3>
            <p className="mt-2 text-xs text-[#6E5545] leading-relaxed">
              Completed specialized Astro Vastu coursework via jyotishvedanghub (2022), integrating spatial layout analysis with planetary placements.
            </p>
          </div>

          {/* Pillar 4: Direct Non-Destructive Counsel */}
          <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 shadow-xs hover:border-[#C1662F] transition-colors">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7B2D26]/10 text-[#7B2D26] mb-4">
              <DiyaIcon size={24} />
            </div>
            <h3 className="font-temple text-lg font-bold text-[#7B2D26]">
              Non-Demolition Remedies
            </h3>
            <p className="mt-2 text-xs text-[#6E5545] leading-relaxed">
              Authentic Vedic astrological guidance and non-destructive Vastu space balancing with zero fear tactics, false promises, or commercial rituals.
            </p>
          </div>
        </div>

        {/* Media & Press Recognition Strip */}
        <div className="mt-12 rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#E8D8C3]/60 pb-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7B2D26] text-[#E8A33D]">
                <Tv className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-temple text-base font-bold text-[#7B2D26]">
                  Media Discourse &amp; Press Features
                </h3>
                <p className="text-xs text-[#6E5545]">
                  Recognized thought leadership in national news broadcasts, publications, and Vedic seminars
                </p>
              </div>
            </div>

            <Link
              href="/about#credentials"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7B2D26] hover:text-[#96372E] transition-colors"
            >
              <span>View Verified Certificates &amp; Awards</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Real Award & Recognition Photo Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="overflow-hidden rounded-2xl border border-[#E8D8C3] bg-[#FBF3E7]/60 shadow-xs">
              <div className="aspect-[4/3] w-full overflow-hidden bg-[#7B2D26]/5">
                <img
                  src="/gallery/felicitation_pashupati_award.jpg"
                  alt="Felicitation Ceremony & Plaque Presentation"
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="p-3">
                <div className="font-temple text-xs font-bold text-[#7B2D26]">Plaque Felicitation</div>
                <p className="text-[11px] text-[#6E5545] mt-1 leading-snug">
                  Felicitation ceremony and plaque presentation with dignitaries.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#E8D8C3] bg-[#FBF3E7]/60 shadow-xs">
              <div className="aspect-[4/3] w-full overflow-hidden bg-[#7B2D26]/5">
                <img
                  src="/gallery/best_astrologer_award.jpg"
                  alt="Best Astrologer Recognition Certificate"
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="p-3">
                <div className="font-temple text-xs font-bold text-[#7B2D26]">Best Astrologer Recognition</div>
                <p className="text-[11px] text-[#6E5545] mt-1 leading-snug">
                  Certificate presented at public astrology conclave.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#E8D8C3] bg-[#FBF3E7]/60 shadow-xs">
              <div className="aspect-[4/3] w-full overflow-hidden bg-[#7B2D26]/5">
                <img
                  src="/gallery/dignitary_greeting.jpg"
                  alt="Floral Greeting from Dignitary"
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="p-3">
                <div className="font-temple text-xs font-bold text-[#7B2D26]">Floral Felicitation</div>
                <p className="text-[11px] text-[#6E5545] mt-1 leading-snug">
                  Floral greeting and warm welcome from senior dignitary.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#E8D8C3] bg-[#FBF3E7]/60 shadow-xs">
              <div className="aspect-[4/3] w-full overflow-hidden bg-[#7B2D26]/5">
                <img
                  src="/gallery/with_spiritual_guide.jpg"
                  alt="With Spiritual Guide"
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="p-3">
                <div className="font-temple text-xs font-bold text-[#7B2D26]">Spiritual Mentor</div>
                <p className="text-[11px] text-[#6E5545] mt-1 leading-snug">
                  With spiritual guide in traditional ashram setting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
