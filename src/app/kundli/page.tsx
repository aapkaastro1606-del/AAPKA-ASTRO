"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KundliForm } from "@/components/kundli/KundliForm";
import { NorthIndianChart } from "@/components/kundli/NorthIndianChart";
import { SouthIndianChart } from "@/components/kundli/SouthIndianChart";
import { PlanetaryTable } from "@/components/kundli/PlanetaryTable";
import { DashaTimeline } from "@/components/kundli/DashaTimeline";
import { DoshaAnalysis } from "@/components/kundli/DoshaAnalysis";
import { AshtakvargaTable } from "@/components/kundli/AshtakvargaTable";
import { ShadbalaTable } from "@/components/kundli/ShadbalaTable";
import { KPTable } from "@/components/kundli/KPTable";
import { KundliPrintDossier } from "@/components/kundli/KundliPrintDossier";
import { calculateKundli } from "@/lib/astrology/chartCalculations";
import { DivisionalChartCode, KundliData } from "@/lib/astrology/types";
import {
  Sparkles,
  PhoneCall,
  Printer,
  CheckCircle2,
  Award,
  Layers,
  Clock,
  ShieldCheck,
  TrendingUp,
  Compass,
  FileText,
} from "lucide-react";
import { PLACEHOLDER_ASTROLOGER, ADMIN_CONFIGURABLE_PRICING } from "@/config/placeholderContent";

export default function KundliPage() {
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
  const [selectedVarga, setSelectedVarga] = useState<DivisionalChartCode>("D1");
  const [activeTab, setActiveTab] = useState<
    "chart" | "planets" | "kp" | "dasha" | "ashtakvarga" | "shadbala" | "dosha" | "remedies" | "report"
  >("chart");

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const vargaOptions: Array<{ code: DivisionalChartCode; label: string; sub: string }> = [
    { code: "D1", label: "D1 Lagna", sub: "Rashi / Life" },
    { code: "D9", label: "D9 Navamsha", sub: "Spouse & Dharma" },
    { code: "D10", label: "D10 Dashamsha", sub: "Career & Power" },
    { code: "D7", label: "D7 Saptamsha", sub: "Children" },
    { code: "D3", label: "D3 Drekkana", sub: "Courage & Siblings" },
    { code: "D12", label: "D12 Dwadasamsha", sub: "Parents & Lineage" },
    { code: "D2", label: "D2 Hora", sub: "Wealth & Treasury" },
  ];

  // Active divisional chart data
  const currentDivisional = kundli.divisionalCharts?.[selectedVarga];

  return (
    <div className="bg-[#FBF3E7] py-8 lg:py-12 min-h-screen text-[#3B2A1E]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#7D6B5D] mb-1">
              <Link href="/" className="hover:text-[#7B2D26]">Home</Link>
              <span>/</span>
              <span className="text-[#7B2D26] font-semibold">Vedic Janam Kundli</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold font-temple text-[#7B2D26] tracking-tight">
              Detailed Vedic Janam Kundli (जन्म पत्रिका)
            </h1>
            <p className="text-xs sm:text-sm text-[#7D6B5D] mt-1 font-body">
              Classical Lahiri Geocentric Ephemeris &bull; Shodashvarga (D1 to D12) &bull; Ashtakvarga &bull; 6-Fold Shadbala
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl border border-[#D4C3B3] bg-[#FFFDF9] px-3.5 py-2 text-xs font-semibold text-[#3B2A1E] hover:bg-[#F3E7D3] transition-all shadow-sm"
            >
              <Printer className="h-4 w-4 text-[#C1662F]" />
              <span>Print / Save PDF</span>
            </button>
            <Link
              href="/consult"
              className="flex items-center gap-1.5 rounded-xl bg-[#7B2D26] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#64231D] transition-all"
            >
              <PhoneCall className="h-4 w-4 text-[#E8A33D]" />
              <span>Consult Acharya Ji</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form & Key Metrics */}
          <div className="lg:col-span-4 space-y-6">
            <KundliForm onCalculated={(data) => setKundli(data)} />

            {/* Favorable Metrics Card */}
            <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7B2D26] font-temple mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#E8A33D]" />
                <span>Auspicious Vedic Alignments</span>
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-[#E8D8C3]/80 pb-2">
                  <span className="text-[#7D6B5D]">Ascendant (Lagna):</span>
                  <span className="font-bold text-[#3B2A1E]">{kundli.ascendant.rashiName} ({kundli.ascendant.hindiName})</span>
                </div>
                <div className="flex justify-between border-b border-[#E8D8C3]/80 pb-2">
                  <span className="text-[#7D6B5D]">Moon Sign (Rashi):</span>
                  <span className="font-bold text-[#7B2D26]">{kundli.moonSign}</span>
                </div>
                <div className="flex justify-between border-b border-[#E8D8C3]/80 pb-2">
                  <span className="text-[#7D6B5D]">Sun Sign:</span>
                  <span className="font-bold text-[#3B2A1E]">{kundli.sunSign}</span>
                </div>
                <div className="flex justify-between border-b border-[#E8D8C3]/80 pb-2">
                  <span className="text-[#7D6B5D]">Birth Nakshatra:</span>
                  <span className="font-bold text-[#C1662F]">{kundli.nakshatra} (Pada {kundli.charanPada})</span>
                </div>
                <div className="flex justify-between border-b border-[#E8D8C3]/80 pb-2">
                  <span className="text-[#7D6B5D]">Lahiri Ayanamsa:</span>
                  <span className="font-bold font-mono text-[#7B2D26]">{kundli.ayanamsa.toFixed(4)}°</span>
                </div>
                <div className="flex justify-between border-b border-[#E8D8C3]/80 pb-2">
                  <span className="text-[#7D6B5D]">Prescribed Gemstone:</span>
                  <span className="font-bold text-[#6B8E5A]">{kundli.luckyGemstone}</span>
                </div>
                <div className="flex justify-between border-b border-[#E8D8C3]/80 pb-2">
                  <span className="text-[#7D6B5D]">Favorable Color:</span>
                  <span className="font-bold text-[#3B2A1E]">{kundli.luckyColor}</span>
                </div>
                <div className="flex justify-between border-b border-[#E8D8C3]/80 pb-2">
                  <span className="text-[#7D6B5D]">Lucky Number:</span>
                  <span className="font-bold text-[#C1662F]">{kundli.luckyNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7D6B5D]">Ishta Devata:</span>
                  <span className="font-bold text-[#7B2D26]">{kundli.favorableDeity}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Chart & Deep Tab Content */}
          <div className="lg:col-span-8 rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 shadow-sm">
            {/* Header & Chart Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8D8C3] pb-5">
              <div>
                <h3 className="text-xl font-bold font-temple text-[#7B2D26]">{kundli.name}&apos;s Horoscope</h3>
                <div className="text-xs text-[#7D6B5D] mt-0.5">
                  Born {kundli.birthDate} at {kundli.birthTime} ({kundli.birthPlace})
                </div>
              </div>

              <div className="flex items-center rounded-xl border border-[#D4C3B3] bg-[#F5EBE1] p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setChartType("north")}
                  className={`rounded-lg px-3 py-1 font-semibold transition-all ${
                    chartType === "north"
                      ? "bg-[#7B2D26] text-white shadow-sm"
                      : "text-[#7D6B5D] hover:text-[#3B2A1E]"
                  }`}
                >
                  North Indian
                </button>
                <button
                  type="button"
                  onClick={() => setChartType("south")}
                  className={`rounded-lg px-3 py-1 font-semibold transition-all ${
                    chartType === "south"
                      ? "bg-[#7B2D26] text-white shadow-sm"
                      : "text-[#7D6B5D] hover:text-[#3B2A1E]"
                  }`}
                >
                  South Indian
                </button>
              </div>
            </div>

            {/* Navigation Tabs (Astrotalk Tool Depth) */}
            <div className="flex border-b border-[#E8D8C3] my-5 text-xs font-semibold gap-3 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setActiveTab("chart")}
                className={`pb-2.5 border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === "chart"
                    ? "border-[#7B2D26] text-[#7B2D26] font-bold"
                    : "border-transparent text-[#7D6B5D] hover:text-[#3B2A1E]"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Charts &amp; Vargas ({selectedVarga})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("planets")}
                className={`pb-2.5 border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === "planets"
                    ? "border-[#7B2D26] text-[#7B2D26] font-bold"
                    : "border-transparent text-[#7D6B5D] hover:text-[#3B2A1E]"
                }`}
              >
                <span>Planets &amp; Avasthas</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("kp")}
                className={`pb-2.5 border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === "kp"
                    ? "border-[#7B2D26] text-[#7B2D26] font-bold"
                    : "border-transparent text-[#7D6B5D] hover:text-[#3B2A1E]"
                }`}
              >
                <Compass className="h-3.5 w-3.5 text-[#C1662F]" />
                <span>KP System</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("dasha")}
                className={`pb-2.5 border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === "dasha"
                    ? "border-[#7B2D26] text-[#7B2D26] font-bold"
                    : "border-transparent text-[#7D6B5D] hover:text-[#3B2A1E]"
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>4-Tier Dasha</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("ashtakvarga")}
                className={`pb-2.5 border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === "ashtakvarga"
                    ? "border-[#7B2D26] text-[#7B2D26] font-bold"
                    : "border-transparent text-[#7D6B5D] hover:text-[#3B2A1E]"
                }`}
              >
                <Award className="h-3.5 w-3.5" />
                <span>Ashtakvarga</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("shadbala")}
                className={`pb-2.5 border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === "shadbala"
                    ? "border-[#7B2D26] text-[#7B2D26] font-bold"
                    : "border-transparent text-[#7D6B5D] hover:text-[#3B2A1E]"
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Shadbala</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("dosha")}
                className={`pb-2.5 border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === "dosha"
                    ? "border-[#7B2D26] text-[#7B2D26] font-bold"
                    : "border-transparent text-[#7D6B5D] hover:text-[#3B2A1E]"
                }`}
              >
                <span>Doshas</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("remedies")}
                className={`pb-2.5 border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === "remedies"
                    ? "border-[#7B2D26] text-[#7B2D26] font-bold"
                    : "border-transparent text-[#7D6B5D] hover:text-[#3B2A1E]"
                }`}
              >
                <span>Remedies</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("report")}
                className={`pb-2.5 border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === "report"
                    ? "border-[#7B2D26] text-[#7B2D26] font-bold"
                    : "border-transparent text-[#7D6B5D] hover:text-[#3B2A1E]"
                }`}
              >
                <FileText className="h-3.5 w-3.5 text-[#E8A33D]" />
                <span>Free PDF Report</span>
              </button>
            </div>

            {/* Tab Views */}
            <div className="min-h-[440px]">
              {activeTab === "chart" && (
                <div className="space-y-4">
                  {/* Divisional Chart Selector Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 bg-[#FBF3E7] p-2 rounded-xl border border-[#E8D8C3]">
                    {vargaOptions.map((v) => (
                      <button
                        key={v.code}
                        type="button"
                        onClick={() => setSelectedVarga(v.code)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                          selectedVarga === v.code
                            ? "bg-[#7B2D26] text-white shadow-xs"
                            : "bg-white text-[#6E5545] border border-[#E8D8C3] hover:border-[#7B2D26]"
                        }`}
                      >
                        <div className="font-bold">{v.label}</div>
                        <div className="text-[9px] opacity-80">{v.sub}</div>
                      </button>
                    ))}
                  </div>

                  {/* Varga Significance Card */}
                  {currentDivisional && (
                    <div className="text-xs text-[#6E5545] bg-[#FFFDF9] border border-[#E8D8C3]/80 rounded-lg p-2.5 flex items-center gap-2">
                      <span className="font-bold text-[#7B2D26]">{currentDivisional.name} ({currentDivisional.sanskritName}):</span>
                      <span>{currentDivisional.significance}</span>
                    </div>
                  )}

                  {/* Render Chart */}
                  <div className="flex flex-col items-center justify-center py-4">
                    {chartType === "north" ? (
                      <NorthIndianChart
                        kundli={kundli}
                        customHouses={selectedVarga !== "D1" ? currentDivisional?.houses : undefined}
                        size={420}
                        chartTitle={`${currentDivisional?.name || "Lagna"} (${selectedVarga})`}
                      />
                    ) : (
                      <SouthIndianChart
                        kundli={kundli}
                        customHouses={selectedVarga !== "D1" ? currentDivisional?.houses : undefined}
                        size={420}
                        chartTitle={`${currentDivisional?.name || "Lagna"} (${selectedVarga})`}
                      />
                    )}
                  </div>
                </div>
              )}

              {activeTab === "planets" && <PlanetaryTable kundli={kundli} />}
              {activeTab === "kp" && <KPTable kpData={kundli.kpSystem} />}
              {activeTab === "dasha" && <DashaTimeline dashas={kundli.dashas} />}
              {activeTab === "ashtakvarga" && <AshtakvargaTable ashtakvarga={kundli.ashtakvarga} />}
              {activeTab === "shadbala" && <ShadbalaTable shadbala={kundli.shadbala} />}
              {activeTab === "dosha" && <DoshaAnalysis doshas={kundli.doshas} />}
              {activeTab === "report" && <KundliPrintDossier kundli={kundli} isPreview={true} />}

              {activeTab === "remedies" && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-[#E8A33D]/40 bg-[#FAF1E4] p-5">
                    <h4 className="text-sm font-bold text-[#7B2D26] font-temple mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#E8A33D]" />
                      <span>Prescribed Gemstone: {kundli.luckyGemstone}</span>
                    </h4>
                    <p className="text-xs text-[#6B5A4E] leading-relaxed">
                      Recommended to fortify your Lagna Lord and balance planetary afflictions. Wear on the designated finger after proper purification with raw milk, Gangajal, and Vedic mantra chanting on an auspicious day.
                    </p>
                    <div className="mt-4 flex gap-3">
                      <Link
                        href="/gemstones"
                        className="rounded-lg bg-[#7B2D26] px-4 py-2 text-xs font-bold text-white hover:bg-[#64231D] shadow-sm transition-all"
                      >
                        Order Govt-Certified {kundli.luckyGemstone.split(" ")[0]}
                      </Link>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] p-5">
                    <h4 className="text-sm font-bold font-temple text-[#3B2A1E] mb-2">
                      Daily Vedic Mantras &amp; Lifestyle Alignment
                    </h4>
                    <ul className="space-y-2 text-xs text-[#6B5A4E]">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#6B8E5A]" />
                        <span>Chant Gayatri Mantra 21 times daily during sunrise facing East.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#6B8E5A]" />
                        <span>Perform water offering (Surya Arghya) with copper vessel and red flowers.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#6B8E5A]" />
                        <span>Favorable Day for beginning critical ventures: Thursday &amp; Monday.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Consultation CTA */}
            {/* PLACEHOLDER: replace with real content */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-[#E8A33D]/60 bg-gradient-to-r from-[#7B2D26] via-[#64231D] to-[#3B2A1E] text-white p-5 shadow-lg">
              <div>
                <h4 className="text-base font-bold font-temple">Have specific questions about this Kundli?</h4>
                <p className="text-xs text-amber-100/80 mt-0.5 font-body">
                  Discuss career transitions, love life, child prospects, and health directly with {PLACEHOLDER_ASTROLOGER.displayName}.
                </p>
              </div>
              <Link
                href="/consult"
                className="shrink-0 rounded-xl bg-[#E8A33D] px-5 py-2.5 text-xs font-bold text-[#3B2A1E] hover:bg-[#d69330] shadow-md transition-all"
              >
                Book Consultation (Flat ₹1,051)
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Printable PDF Dossier (Active on Window.Print) */}
      <KundliPrintDossier kundli={kundli} />
    </div>
  );
}
