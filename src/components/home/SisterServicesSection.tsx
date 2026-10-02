"use client";

import React from "react";
import { GraduationCap, ExternalLink, CheckCircle2, ArrowRight, Sparkles, BookOpen } from "lucide-react";
import { MandalaDivider } from "@/components/ui/MandalaDivider";
import { SISTER_SERVICES } from "@/config/sisterServices";

export const SisterServicesSection: React.FC = () => {
  const viar = SISTER_SERVICES.viar;

  return (
    <section
      id="our-other-services"
      aria-label="Our Other Services"
      className="border-t border-[#E8D8C3] bg-[#FFFDF9] py-16 lg:py-24 relative overflow-hidden"
    >
      {/* Subtle Background Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#E8A33D]/10 blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E8D8C3] bg-[#FBF3E7] px-3.5 py-1 text-xs font-bold text-[#7B2D26] mb-3">
            <Sparkles className="h-3.5 w-3.5 text-[#C1662F]" />
            <span className="font-temple tracking-wider uppercase">Ecosystem &amp; Lineage</span>
          </div>
          <h2 className="font-temple text-3xl sm:text-4xl font-bold text-[#7B2D26] tracking-tight">
            Our Other Services
          </h2>
          <MandalaDivider className="my-4 text-[#C1662F]" />
          <p className="text-sm sm:text-base text-[#6E5545] leading-relaxed font-body">
            Aapka Astro is part of a unified Vedic knowledge ecosystem founded by Acharya Niraj Kumar.
            While Aapka Astro is dedicated to personal 1-on-1 consultations and remedies, our sister institute
            trains seekers and aspiring practitioners who wish to systematically study and master astrology themselves.
          </p>
        </div>

        {/* Sister Services Grid */}
        <div className="max-w-4xl mx-auto">
          {/* Service Card: Viar.in (Vihangam Institute of Astrology and Research) */}
          <div className="rounded-3xl border-2 border-[#E8D8C3] bg-[#FBF3E7]/60 p-6 sm:p-10 shadow-md hover:border-[#E8A33D] hover:shadow-xl transition-all duration-300 relative overflow-hidden">
            {/* Top Decorative Border Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#7B2D26] via-[#E8A33D] to-[#7B2D26]" />

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 pb-6 border-b border-[#E8D8C3]/80">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#7B2D26] px-3 py-1 text-[11px] font-bold text-[#FFFDF9] shadow-xs">
                    <GraduationCap className="h-3.5 w-3.5 text-[#E8A33D]" />
                    <span>{viar.badge}</span>
                  </span>
                  <span className="rounded-full bg-[#E8A33D]/20 border border-[#E8A33D]/40 px-2.5 py-0.5 text-[10px] font-bold text-[#7B2D26]">
                    {viar.category}
                  </span>
                </div>

                <h3 className="font-temple text-2xl sm:text-3xl font-black text-[#7B2D26] tracking-tight pt-1">
                  {viar.name}{" "}
                  <span className="text-base sm:text-lg font-bold text-[#6E5545] block sm:inline">
                    ({viar.fullName})
                  </span>
                </h3>

                <p className="text-xs sm:text-sm font-bold text-[#C1662F] font-temple">
                  {viar.tagline}
                </p>
              </div>

              {/* Direct Domain Badge */}
              <div className="shrink-0">
                <a
                  href={viar.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] px-3.5 py-2 text-xs font-bold text-[#7B2D26] hover:bg-[#FBF3E7] hover:border-[#7B2D26] transition-all shadow-xs"
                >
                  <BookOpen className="h-3.5 w-3.5 text-[#C1662F]" />
                  <span>{viar.domain}</span>
                  <ExternalLink className="h-3 w-3 text-[#C1662F]" />
                </a>
              </div>
            </div>

            {/* Description & Target Audience */}
            <div className="py-6 space-y-4">
              <p className="text-sm sm:text-base text-[#3B2A1E] leading-relaxed font-body">
                {viar.description}
              </p>

              {/* Key Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {viar.highlights.map((highlight, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 rounded-xl border border-[#E8D8C3]/80 bg-[#FFFDF9] p-3 text-xs text-[#3B2A1E] font-medium shadow-2xs"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[#6B8E5A] shrink-0 mt-0.5" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Row */}
            <div className="pt-6 border-t border-[#E8D8C3]/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="text-xs text-[#6E5545] font-medium flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#6B8E5A]" />
                <span>Admission Open for Next Cohort Batch</span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <a
                  href={viar.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7B2D26] hover:bg-[#64221C] px-6 py-3.5 text-xs sm:text-sm font-bold text-[#FFFDF9] shadow-md hover:shadow-lg transition-all border border-[#E8A33D]/40"
                >
                  <span>{viar.ctaText}</span>
                  <ArrowRight className="h-4 w-4 text-[#E8A33D]" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
