"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AstrologerStateStore, AstrologerStatus, QueueItem } from "@/lib/store/astrologerStore";
import { PhoneCall, Star, ArrowRight, Award } from "lucide-react";
import { DiyaIcon } from "@/components/ui/DiyaIcon";
import { PLACEHOLDER_ASTROLOGER, ADMIN_CONFIGURABLE_PRICING, FIRST_CONSULTATION_OFFER } from "@/config/placeholderContent";

export const Hero: React.FC = () => {
  const [status, setStatus] = useState<AstrologerStatus>("AVAILABLE");
  const [queue, setQueue] = useState<QueueItem[]>([]);

  const sync = () => {
    setStatus(AstrologerStateStore.getStatus());
    setQueue(AstrologerStateStore.getQueue());
  };

  useEffect(() => {
    sync();
    window.addEventListener("astro_state_changed", sync);
    return () => window.removeEventListener("astro_state_changed", sync);
  }, []);

  const queueLength = queue.length;
  const estimatedWait = (queueLength + 1) * 7;

  return (
    <section className="relative overflow-hidden bg-[#FBF3E7] pt-8 pb-16 lg:pt-14 lg:pb-24 mandala-bg">
      {/* Subtle Warm Amber Glow Behind */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-[#E8A33D]/10 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Core Identity & Temple Callout */}
          <div className="lg:col-span-7 space-y-6">
            {/* Live Astrologer Presence Badge */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[#E8D8C3] bg-[#FFFDF9] px-4 py-1.5 text-xs font-semibold shadow-sm">
              <DiyaIcon size={16} />
              <div className="relative flex items-center">
                {status === "AVAILABLE" && (
                  <>
                    <span className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-[#6B8E5A] opacity-75" />
                    <span className="relative h-2 w-2 rounded-full bg-[#6B8E5A]" />
                  </>
                )}
                {status === "BUSY" && (
                  <>
                    <span className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-[#E8A33D] opacity-75" />
                    <span className="relative h-2 w-2 rounded-full bg-[#E8A33D]" />
                  </>
                )}
                {(status === "BREAK" || status === "OFFLINE") && (
                  <span className="relative h-2 w-2 rounded-full bg-[#A8988B]" />
                )}
              </div>

              {/* PLACEHOLDER: replace with real content */}
              <span className="text-[#3B2A1E]">
                {status === "AVAILABLE" && (
                  <>
                    <strong className="text-[#6B8E5A]">{PLACEHOLDER_ASTROLOGER.displayName} is Online:</strong> Ready for 1-on-1 Consultation
                  </>
                )}
                {status === "BUSY" && (
                  <>
                    <strong className="text-[#C1662F]">In Session:</strong> {queueLength} waiting &bull; ~{estimatedWait}m wait
                  </>
                )}
                {status === "BREAK" && "Acharya Ji on brief break &bull; Resumes shortly"}
                {status === "OFFLINE" && "Acharya Ji is Offline &bull; Next slot: Tomorrow 10 AM"}
              </span>
            </div>

            {/* Main Headline & Tagline */}
            {/* PLACEHOLDER: replace with real content */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#C1662F] font-temple mb-2">
                {PLACEHOLDER_ASTROLOGER.tagline}
              </div>
              <h1 className="font-temple text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#7B2D26] leading-tight">
                Sacred Vedic Wisdom, Guided by{" "}
                <span className="text-[#C1662F] underline decoration-[#E8A33D] decoration-2 underline-offset-8">
                  {PLACEHOLDER_ASTROLOGER.displayName}
                </span>
              </h1>
            </div>

            {/* About / Bio Placeholder */}
            {/* PLACEHOLDER: replace with real content */}
            <p className="text-base sm:text-lg text-[#6E5545] leading-relaxed max-w-2xl font-body">
              {PLACEHOLDER_ASTROLOGER.bio}
            </p>

            {/* First Consultation 50% Off Offer Pill */}
            {/* PLACEHOLDER: replace with real content */}
            <div className="inline-flex items-center gap-2 rounded-xl border border-[#E8A33D]/50 bg-[#FAF1E4] px-3.5 py-2 text-xs font-bold text-[#7B2D26]">
              <span className="rounded-md bg-[#7B2D26] px-2 py-0.5 text-[10px] uppercase text-white font-temple">
                Introductory Offer
              </span>
              <span>{FIRST_CONSULTATION_OFFER.description}</span>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/consult"
                className="group flex items-center justify-center gap-3 rounded-xl bg-[#7B2D26] px-8 py-4 text-sm font-bold text-[#FBF3E7] shadow-md hover:bg-[#64221C] transition-all active:scale-[0.99]"
              >
                <PhoneCall className="h-4 w-4 text-[#E8A33D]" />
                <span>
                  {status === "AVAILABLE" ? "Start Live Consultation" : status === "BUSY" ? "Join Live Queue" : "Book Preferred Slot"}
                </span>
                {/* PLACEHOLDER: replace with real content */}
                <span className="rounded-md bg-[#E8A33D] px-2 py-0.5 text-xs font-black text-[#3B2A1E]">
                  Flat ₹1,051 (Reg. ₹2,100)
                </span>
              </Link>

              <Link
                href="/kundli"
                className="flex items-center justify-center gap-2 rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] px-6 py-4 text-sm font-bold text-[#3B2A1E] hover:border-[#C1662F] hover:bg-[#FBF3E7] transition-all shadow-sm"
              >
                <span>Calculate Free Janam Kundli</span>
                <ArrowRight className="h-4 w-4 text-[#C1662F]" />
              </Link>
            </div>

            {/* Trust Proof Points */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#E8D8C3] max-w-xl">
              <div>
                <div className="font-temple text-2xl sm:text-3xl font-bold text-[#7B2D26]">20+</div>
                <div className="text-xs text-[#6E5545] font-medium">Years Vedic Mastery</div>
              </div>
              <div>
                <div className="font-temple text-2xl sm:text-3xl font-bold text-[#7B2D26]">15,000+</div>
                <div className="text-xs text-[#6E5545] font-medium">Consultations Completed</div>
              </div>
              <div>
                <div className="font-temple text-2xl sm:text-3xl font-bold text-[#7B2D26]">4.98 ★</div>
                <div className="text-xs text-[#6E5545] font-medium">Bhartiya Vidya Bhawan</div>
              </div>
            </div>
          </div>

          {/* Right Column: Grounded Temple Carved Astrologer Card */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md rounded-2xl border-2 border-[#E8D8C3] bg-[#FFFDF9] p-6 shadow-md">
              {/* Sacred Corner Ornament */}
              <div className="absolute -top-3.5 -right-3.5 rounded-full bg-[#7B2D26] p-2 text-[#E8A33D] shadow-sm border border-[#C1662F]">
                <Award className="h-5 w-5" />
              </div>

              {/* Portrait with Warm Natural Lighting */}
              <div className="relative mb-5 overflow-hidden rounded-xl border border-[#E8D8C3] bg-[#FBF3E7]">
                <img
                  src={PLACEHOLDER_ASTROLOGER.avatarUrl}
                  alt={PLACEHOLDER_ASTROLOGER.displayName}
                  className="h-64 w-full object-cover object-top filter contrast-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3B2A1E]/80 via-transparent to-transparent" />

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <div className="rounded-lg bg-[#FFFDF9]/95 px-2.5 py-1 text-xs font-bold text-[#7B2D26] shadow-sm border border-[#E8D8C3] font-temple">
                    Jyotish Acharya &bull; Vastu Expert
                  </div>
                  <div className="flex items-center gap-1 rounded-lg bg-[#E8A33D] px-2 py-1 text-xs font-black text-[#3B2A1E] shadow-sm">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span>4.98</span>
                  </div>
                </div>
              </div>

              {/* Bio & Credentials */}
              <div className="space-y-3">
                <div>
                  <h3 className="font-temple text-xl font-bold text-[#7B2D26]">
                    {PLACEHOLDER_ASTROLOGER.displayName}
                  </h3>
                  <p className="text-xs font-bold text-[#C1662F] font-temple">
                    {PLACEHOLDER_ASTROLOGER.tagline}
                  </p>
                </div>

                <p className="text-xs text-[#6E5545] leading-relaxed line-clamp-3 font-body">
                  Certified Jyotish Acharya from the Institute of Astrology, Bharatiya Vidya Bhawan, New Delhi, and certified Logical Vastu™ Expert by DivyVastu. Direct, practical Vedic astrology and non-demolition space remedies.
                </p>

                {/* Core Specialties Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["Kundli & Horoscope", "Vastu Shastra", "Gemstone Wisdom", "Live Sessions"].map((spec) => (
                    <span
                      key={spec}
                      className="rounded-lg border border-[#E8D8C3] bg-[#FBF3E7] px-2.5 py-1 text-[11px] font-semibold text-[#3B2A1E]"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Quick Action */}
                <div className="pt-2">
                  <Link
                    href="/consult"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#7B2D26]/10 py-3 text-xs font-bold text-[#7B2D26] border border-[#7B2D26]/30 hover:bg-[#7B2D26] hover:text-[#FBF3E7] transition-all"
                  >
                    <span>Direct 1-on-1 Consultation (Chat / Call / Video)</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
