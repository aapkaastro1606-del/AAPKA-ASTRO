"use client";

import React from "react";
import { Check, X, Award, ShieldCheck } from "lucide-react";
import { MandalaDivider } from "@/components/ui/MandalaDivider";

import { PLACEHOLDER_ASTROLOGER } from "@/config/placeholderContent";

export const WhyAapkaAstro: React.FC = () => {
  // {/* PLACEHOLDER: replace with real content */}
  const comparisonItems = [
    {
      feature: "Who Conducts Your Consultation?",
      aapkaAstro: `Exclusively ${PLACEHOLDER_ASTROLOGER.displayName} (Over ${PLACEHOLDER_ASTROLOGER.experienceYears} Years Exp, Traditional Vedic Scholar)`,
      astrotalk: "Random gig worker selected from unverified marketplace listings",
      aapkaPositive: true,
    },
    {
      feature: "Consultation Style & Depth",
      aapkaAstro: "Direct classical Vedic analysis with your Lagna chart on screen and tailored remedies",
      astrotalk: "Frequent generic copy-pasted scripts designed to keep billing clock running",
      aapkaPositive: true,
    },
    {
      feature: "Availability & Honesty",
      aapkaAstro: "100% transparent real-time status: Online, In Consultation, or Sacred Sadhana window",
      astrotalk: "Illusion of instant 24/7 availability by rotating unknown interns",
      aapkaPositive: true,
    },
    {
      feature: "Privacy & Data Sanctity",
      aapkaAstro: "Sacred confidentiality. Your birth details and personal questions are never resold",
      astrotalk: "Shared across multiple operator terminals and customer service desks",
      aapkaPositive: true,
    },
    {
      feature: "Remedy Philosophy",
      aapkaAstro: "Simple Vedic mantras, charity (Daan), and certified natural gemstones",
      astrotalk: "High-pressure upsells for expensive commercial poojas worth thousands",
      aapkaPositive: true,
    },
  ];

  return (
    <section className="border-t border-[#E8D8C3] bg-[#FBF3E7] py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E8D8C3] bg-[#FFFDF9] px-3.5 py-1 text-xs font-bold text-[#7B2D26] mb-3">
            <Award className="h-3.5 w-3.5 text-[#E8A33D]" />
            <span>THE AAPKA ASTRO SACRED PLEDGE</span>
          </div>
          <h2 className="font-temple text-3xl sm:text-4xl font-bold text-[#7B2D26] tracking-tight">
            Why Discerning Seekers Choose Aapka Astro Over Mass Marketplaces
          </h2>
          <MandalaDivider className="my-4" />
          <p className="text-[#6E5545] text-sm sm:text-base leading-relaxed">
            Astrology is sacred counsel. Discover why personal attention from a true Vedic Scholar
            yields genuine clarity and peace of mind.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-hidden rounded-2xl border-2 border-[#E8D8C3] bg-[#FFFDF9] shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 border-b-2 border-[#E8D8C3] bg-[#FBF3E7] p-4 text-xs font-bold uppercase tracking-wider text-[#3B2A1E]">
            <div className="md:col-span-4 hidden md:block">Evaluation Pillar</div>
            <div className="md:col-span-4 font-temple text-[#7B2D26] font-bold text-sm flex items-center gap-1.5">
              <span>Aapka Astro (Single Master)</span>
            </div>
            <div className="md:col-span-4 text-[#6E5545] text-sm hidden md:block">
              Mass Commercial Marketplaces
            </div>
          </div>

          <div className="divide-y divide-[#E8D8C3]">
            {comparisonItems.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-12 p-4 sm:p-5 gap-4 items-center hover:bg-[#FBF3E7]/40 transition-colors"
              >
                {/* Metric Title */}
                <div className="md:col-span-4">
                  <span className="font-bold text-xs sm:text-sm text-[#3B2A1E]">{item.feature}</span>
                </div>

                {/* Aapka Astro Column */}
                <div className="md:col-span-4 rounded-xl border border-[#C1662F]/30 bg-[#FBF3E7] p-3">
                  <div className="md:hidden text-[10px] font-bold uppercase tracking-wider text-[#7B2D26] mb-1">
                    Aapka Astro
                  </div>
                  <div className="flex items-start gap-2 text-xs font-bold text-[#7B2D26]">
                    <Check className="h-4 w-4 text-[#6B8E5A] shrink-0 mt-0.5" />
                    <span>{item.aapkaAstro}</span>
                  </div>
                </div>

                {/* Mass Marketplace Column */}
                <div className="md:col-span-4 rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] p-3">
                  <div className="md:hidden text-[10px] font-bold uppercase tracking-wider text-[#6E5545] mb-1">
                    Mass Aggregators
                  </div>
                  <div className="flex items-start gap-2 text-xs text-[#6E5545]">
                    <X className="h-4 w-4 text-[#C1662F] shrink-0 mt-0.5" />
                    <span>{item.astrotalk}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
