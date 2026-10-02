"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { WhyAapkaAstro } from "@/components/home/WhyAapkaAstro";
import { Testimonials } from "@/components/home/Testimonials";
import { FAQSection } from "@/components/home/FAQSection";
import { PanchangWidget } from "@/components/home/PanchangWidget";
import { InstagramFeedSection } from "@/components/home/InstagramFeedSection";
import { BlogPreviewSection } from "@/components/home/BlogPreviewSection";
import { TrustCredentialsSection } from "@/components/home/TrustCredentialsSection";
import { SisterServicesSection } from "@/components/home/SisterServicesSection";
import { KundliForm } from "@/components/kundli/KundliForm";
import { NorthIndianChart } from "@/components/kundli/NorthIndianChart";
import { SouthIndianChart } from "@/components/kundli/SouthIndianChart";
import { PlanetaryTable } from "@/components/kundli/PlanetaryTable";
import { DashaTimeline } from "@/components/kundli/DashaTimeline";
import { DoshaAnalysis } from "@/components/kundli/DoshaAnalysis";
import { calculateKundli } from "@/lib/astrology/chartCalculations";
import { KundliData } from "@/lib/astrology/types";
import { PhoneCall, ArrowRight } from "lucide-react";
import { DiyaIcon } from "@/components/ui/DiyaIcon";
import { MandalaDivider } from "@/components/ui/MandalaDivider";
import { PLACEHOLDER_ASTROLOGER, ADMIN_CONFIGURABLE_PRICING } from "@/config/placeholderContent";
import { LocalBusinessJsonLd, PersonJsonLd, ConsultationServicesJsonLd } from "@/components/seo/JsonLd";

export default function HomePage() {
  const [kundli, setKundli] = useState<KundliData>(() =>
    calculateKundli({
      name: "Sample Chart",
      gender: "male",
      birthDate: "1995-10-24",
      birthTime: "14:35",
      birthPlace: "New Delhi, Delhi",
      latitude: 28.6139,
      longitude: 77.209,
      timezone: 5.5,
    })
  );

  const [chartType, setChartType] = useState<"north" | "south">("north");
  const [activeTab, setActiveTab] = useState<"chart" | "planets" | "dasha" | "dosha">("chart");

  return (
    <div className="bg-[#FBF3E7] text-[#3B2A1E]">
      {/* Schema.org Structured Data */}
      <LocalBusinessJsonLd />
      <PersonJsonLd />
      <ConsultationServicesJsonLd />

      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Free Janam Kundli Lead Section */}
      <section className="border-t border-[#E8D8C3] bg-[#FFFDF9] py-16 lg:py-24 mandala-bg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E8D8C3] bg-[#FBF3E7] px-3.5 py-1 text-xs font-bold text-[#7B2D26] mb-3">
              <DiyaIcon size={14} />
              <span>INSTANT VEDIC EPHEMERIS</span>
            </div>
            <h2 className="font-temple text-3xl sm:text-4xl font-bold text-[#7B2D26] tracking-tight">
              Generate Your Complete Janam Kundli
            </h2>
            <MandalaDivider className="my-4" />
            <p className="text-[#6E5545] text-sm sm:text-base">
              Enter your birth coordinates to calculate your Lagna, planetary degrees,
              Vimshottari Dasha, and Manglik status with ancient mathematical precision.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Input Form */}
            <div className="lg:col-span-5 space-y-6">
              <KundliForm onCalculated={(data) => setKundli(data)} />

              {/* Quick Consultation Callout */}
              <div className="rounded-2xl border-2 border-[#E8D8C3] bg-[#FBF3E7] p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-[#7B2D26] p-2.5 text-[#E8A33D] font-bold shrink-0">
                    <PhoneCall className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-temple text-sm font-bold text-[#7B2D26]">
                      Want Acharya Ji to personally read this chart?
                    </h4>
                    <p className="text-xs text-[#6E5545] mt-1 leading-relaxed">
                      Understand your Mahadasha transitions, career turnaround yogas, and authentic Vedic remedies.
                    </p>
                    <Link
                      href="/consult"
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#7B2D26] hover:text-[#C1662F] underline underline-offset-4"
                    >
                      <span>Start 1-on-1 Consultation</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Kundli Output & Visualizer */}
            <div className="lg:col-span-7 rounded-2xl border-2 border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm">
              {/* Header & Chart Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8D8C3] pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-temple text-lg font-bold text-[#7B2D26]">
                      {kundli.name}&apos;s Chart
                    </h3>
                    <span className="rounded-full bg-[#E8A33D]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#7B2D26] border border-[#E8A33D]/40">
                      Lagna: {kundli.ascendant.rashiName}
                    </span>
                  </div>
                  <div className="text-xs text-[#6E5545] mt-0.5">
                    {kundli.birthDate} &bull; {kundli.birthTime} &bull; {kundli.birthPlace}
                  </div>
                </div>

                {/* Chart Style Switcher */}
                <div className="flex items-center rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setChartType("north")}
                    className={`rounded-lg px-3 py-1 font-bold transition-all ${
                      chartType === "north"
                        ? "bg-[#7B2D26] text-[#FBF3E7] shadow-sm"
                        : "text-[#6E5545] hover:text-[#3B2A1E]"
                    }`}
                  >
                    North Indian
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartType("south")}
                    className={`rounded-lg px-3 py-1 font-bold transition-all ${
                      chartType === "south"
                        ? "bg-[#7B2D26] text-[#FBF3E7] shadow-sm"
                        : "text-[#6E5545] hover:text-[#3B2A1E]"
                    }`}
                  >
                    South Indian
                  </button>
                </div>
              </div>

              {/* Key Astrological Pillars Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-[#E8D8C3] text-xs">
                <div className="rounded-xl bg-[#FBF3E7] p-2.5 border border-[#E8D8C3]">
                  <span className="text-[10px] text-[#6E5545] uppercase font-bold block">Moon Sign (Rashi)</span>
                  <span className="font-bold text-[#7B2D26]">{kundli.moonSign}</span>
                </div>
                <div className="rounded-xl bg-[#FBF3E7] p-2.5 border border-[#E8D8C3]">
                  <span className="text-[10px] text-[#6E5545] uppercase font-bold block">Nakshatra</span>
                  <span className="font-bold text-[#7B2D26]">{kundli.nakshatra} (P{kundli.charanPada})</span>
                </div>
                <div className="rounded-xl bg-[#FBF3E7] p-2.5 border border-[#E8D8C3]">
                  <span className="text-[10px] text-[#6E5545] uppercase font-bold block">Sun Sign</span>
                  <span className="font-bold text-[#7B2D26]">{kundli.sunSign}</span>
                </div>
                <div className="rounded-xl bg-[#FBF3E7] p-2.5 border border-[#E8D8C3]">
                  <span className="text-[10px] text-[#6E5545] uppercase font-bold block">Lucky Gemstone</span>
                  <span className="font-bold text-[#2E7D32]">{kundli.luckyGemstone.split(" ")[0]}</span>
                </div>
              </div>

              {/* Sub-tabs: Chart, Planets, Dasha, Doshas */}
              <div className="flex border-b border-[#E8D8C3] my-4 text-xs font-bold gap-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab("chart")}
                  className={`pb-2.5 px-3 border-b-2 transition-all shrink-0 ${
                    activeTab === "chart"
                      ? "border-[#7B2D26] text-[#7B2D26]"
                      : "border-transparent text-[#6E5545] hover:text-[#3B2A1E]"
                  }`}
                >
                  Lagna Chart (D1)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("planets")}
                  className={`pb-2.5 px-3 border-b-2 transition-all shrink-0 ${
                    activeTab === "planets"
                      ? "border-[#7B2D26] text-[#7B2D26]"
                      : "border-transparent text-[#6E5545] hover:text-[#3B2A1E]"
                  }`}
                >
                  Planetary Degrees
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("dasha")}
                  className={`pb-2.5 px-3 border-b-2 transition-all shrink-0 ${
                    activeTab === "dasha"
                      ? "border-[#7B2D26] text-[#7B2D26]"
                      : "border-transparent text-[#6E5545] hover:text-[#3B2A1E]"
                  }`}
                >
                  Vimshottari Dasha
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("dosha")}
                  className={`pb-2.5 px-3 border-b-2 transition-all shrink-0 ${
                    activeTab === "dosha"
                      ? "border-[#7B2D26] text-[#7B2D26]"
                      : "border-transparent text-[#6E5545] hover:text-[#3B2A1E]"
                  }`}
                >
                  Dosha Diagnosis
                </button>
              </div>

              {/* Tab Views */}
              <div className="pt-2">
                {activeTab === "chart" && (
                  <div className="flex justify-center py-4">
                    {chartType === "north" ? (
                      <NorthIndianChart kundli={kundli} size={360} />
                    ) : (
                      <SouthIndianChart kundli={kundli} size={360} />
                    )}
                  </div>
                )}

                {activeTab === "planets" && <PlanetaryTable kundli={kundli} />}
                {activeTab === "dasha" && <DashaTimeline dashas={kundli.dashas} />}
                {activeTab === "dosha" && <DoshaAnalysis doshas={kundli.doshas} />}
              </div>

              {/* Direct Full Report Link */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E8D8C3] pt-4 text-xs">
                <span className="text-[#6E5545]">
                  Calculated with Lahiri Ayanamsa: <strong className="text-[#3B2A1E]">{kundli.ayanamsa.toFixed(2)}°</strong>
                </span>
                <Link
                  href="/kundli"
                  className="flex items-center gap-1.5 font-bold text-[#7B2D26] hover:underline"
                >
                  <span>Open Full Screen Detailed Kundli</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Daily Vedic Panchang Alignment */}
      <PanchangWidget />

      {/* 3. Offerings Grid */}
      <ServicesGrid />

      {/* 4. Daily Vedic Guidance & Reels */}
      <InstagramFeedSection />

      {/* 5. Why Aapka Astro vs Astrotalk */}
      <WhyAapkaAstro />

      {/* 5.1 Trust, Credentials & Press Authority */}
      <TrustCredentialsSection />

      {/* 6. Client Testimonials */}
      <Testimonials />

      {/* 7. Vedic Astrology Journal / Blog Preview */}
      <BlogPreviewSection />

      {/* 8. FAQ Section */}
      <FAQSection />

      {/* 9. Our Other Services / Sister Initiatives (Viar.in Academy) */}
      <SisterServicesSection />

      {/* 10. Sacred Action Banner */}
      <section className="border-t border-[#E8D8C3] bg-[#7B2D26] py-16 text-[#FBF3E7]">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#64221C] px-3.5 py-1 text-xs font-bold text-[#E8A33D] border border-[#E8A33D]/30 mb-4">
            <DiyaIcon size={16} />
            <span>CONFIDENTIAL 1-ON-1 VEDIC CONSULTATION</span>
          </div>
          <h2 className="font-temple text-3xl sm:text-5xl font-bold text-[#FBF3E7] tracking-tight">
            Stop Guessing Your Future. Step Into Clarity.
          </h2>
          {/* PLACEHOLDER: replace with real content */}
          <p className="mt-4 text-sm sm:text-base text-[#FBF3E7]/80 max-w-2xl mx-auto leading-relaxed font-body">
            Connect directly with {PLACEHOLDER_ASTROLOGER.displayName}. Discuss career dilemmas, relationship knots, health timings, and practical remedies tailored specifically to your Janam Kundli.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/consult"
              className="flex items-center gap-2 rounded-xl bg-[#E8A33D] px-8 py-4 font-bold text-[#3B2A1E] hover:bg-[#F6CF86] transition-all text-sm shadow-md"
            >
              <PhoneCall className="h-4 w-4" />
              <span>Consult Acharya Ji Now</span>
              <span className="rounded-md bg-[#3B2A1E]/15 px-2 py-0.5 text-xs font-black">
                Flat ₹1,051 (Reg. ₹2,100)
              </span>
            </Link>

            <Link
              href="/consult"
              className="flex items-center gap-2 rounded-xl border border-[#FBF3E7]/30 bg-[#64221C] px-7 py-4 text-sm font-semibold text-[#FBF3E7] hover:bg-[#FBF3E7]/10 transition-all"
            >
              <span>View Consultation Formats &amp; Topics</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
