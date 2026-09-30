"use client";

import React, { useState } from "react";
import Link from "next/link";
import { calculateSunSign, SunSignResult } from "@/lib/astrology/freeCalculators";
import { Sun, Sparkles, PhoneCall, ArrowRight, Compass, Flame, RefreshCw } from "lucide-react";
import { PLACEHOLDER_ASTROLOGER, ADMIN_CONFIGURABLE_PRICING } from "@/config/placeholderContent";

export default function SunSignCalculatorPage() {
  const [birthDate, setBirthDate] = useState("1996-08-15");
  const [result, setResult] = useState<SunSignResult>(() =>
    calculateSunSign("1996-08-15")
  );

  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate) return;

    setIsCalculating(true);
    setTimeout(() => {
      setResult(calculateSunSign(birthDate));
      setIsCalculating(false);
    }, 250);
  };

  return (
    <div className="bg-[#FBF3E7] min-h-screen text-[#3B2A1E] py-10 lg:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E8A33D]/40 bg-[#FAF1E4] px-3.5 py-1 text-xs font-bold text-[#7B2D26] uppercase font-temple">
            <Sun className="h-3.5 w-3.5 text-[#C1662F]" />
            <span>Zodiac Sun Sign Finder</span>
          </div>
          <h1 className="font-temple text-3xl sm:text-5xl font-bold text-[#7B2D26] tracking-tight">
            Find Your Sun Sign (Surya Rashi)
          </h1>
          <p className="text-xs sm:text-sm text-[#6E5545] font-body">
            Enter your birthday to instantly discover your Western zodiac sign, element, ruling planet, and personality traits.
          </p>
        </div>

        {/* Calculator Form & Result Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Card */}
          <div className="lg:col-span-5 rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm space-y-5">
            <h2 className="font-temple text-lg font-bold text-[#7B2D26] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#E8A33D]" />
              <span>Select Your Birthday</span>
            </h2>

            <form onSubmit={handleCalculate} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#6E5545]">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full rounded-xl border border-[#E8D8C3] bg-white px-3.5 py-2.5 text-xs text-[#3B2A1E] focus:border-[#7B2D26] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isCalculating}
                className="w-full mt-2 rounded-xl bg-[#7B2D26] py-3 text-xs font-bold text-[#FBF3E7] hover:bg-[#96372E] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isCalculating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Locating Solar Position...</span>
                  </>
                ) : (
                  <>
                    <Sun className="h-4 w-4 text-[#E8A33D]" />
                    <span>Calculate Sun Sign</span>
                  </>
                )}
              </button>
            </form>

            <div className="p-3.5 bg-[#FBF3E7]/70 rounded-2xl border border-[#E8D8C3] text-[11px] text-[#6E5545] space-y-1">
              <span className="font-bold text-[#7B2D26] block uppercase text-[10px]">Sun Sign vs Moon Sign:</span>
              <p className="leading-relaxed">
                While Western astrology focuses on your solar birth date, Vedic astrology considers your <strong>Moon sign (Chandra Rashi)</strong> and <strong>Ascendant (Lagna)</strong> to be far more influential in daily predictions.
              </p>
            </div>
          </div>

          {/* Result Card */}
          <div className="lg:col-span-7 rounded-3xl border-2 border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8D8C3] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C1662F]">
                  Your Solar Sign
                </span>
                <h3 className="font-temple text-3xl font-bold text-[#7B2D26] mt-0.5">
                  {result.sign} ({result.signHindi})
                </h3>
                <div className="text-xs text-[#6E5545] mt-1 font-mono">
                  {result.dateRange}
                </div>
              </div>
              <div className="text-center bg-[#FBF3E7] border border-[#E8D8C3] px-3.5 py-2 rounded-xl">
                <div className="text-2xl font-bold text-[#7B2D26]">{result.symbol}</div>
                <div className="text-[10px] uppercase font-bold text-[#6E5545] mt-0.5">{result.element} Element</div>
              </div>
            </div>

            {/* Core Sign Description */}
            <div className="p-4 rounded-2xl bg-[#FBF3E7] border border-[#E8D8C3] space-y-2">
              <div className="text-xs font-bold text-[#7B2D26] uppercase tracking-wide">
                Zodiac Archetype &amp; Persona
              </div>
              <p className="text-xs text-[#6E5545] leading-relaxed font-body">
                {result.description}
              </p>
            </div>

            {/* Sign Attributes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-xl border border-[#E8D8C3] bg-white">
                <span className="text-[10px] uppercase font-bold text-[#6E5545] block">Ruling Planet</span>
                <div className="font-bold text-[#7B2D26] text-sm mt-0.5">{result.rulingPlanet}</div>
              </div>
              <div className="p-2.5 rounded-xl border border-[#E8D8C3] bg-white">
                <span className="text-[10px] uppercase font-bold text-[#6E5545] block">Modality</span>
                <div className="font-bold text-[#3B2A1E] text-sm mt-0.5">{result.modality}</div>
              </div>
              <div className="p-2.5 rounded-xl border border-[#E8D8C3] bg-white">
                <span className="text-[10px] uppercase font-bold text-[#6E5545] block">Lucky Day</span>
                <div className="font-bold text-[#C1662F] text-sm mt-0.5">{result.luckyDay}</div>
              </div>
              <div className="p-2.5 rounded-xl border border-[#E8D8C3] bg-white">
                <span className="text-[10px] uppercase font-bold text-[#6E5545] block">Lucky Color</span>
                <div className="font-bold text-[#6B8E5A] text-xs mt-0.5">{result.luckyColor}</div>
              </div>
            </div>

            {/* Core Traits Badges */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7B2D26] font-temple">
                Core Solar Virtues
              </h4>
              <div className="flex flex-wrap gap-2 text-xs">
                {result.coreTraits.map((t, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full border border-[#E8D8C3] bg-white text-[#3B2A1E] font-medium"
                  >
                    ✨ {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Vedic Contrast Note */}
            <div className="p-3.5 rounded-xl border border-[#E8D8C3] bg-white text-xs text-[#6E5545] space-y-1">
              <span className="font-bold text-[#7B2D26] uppercase text-[10px] block">Vedic Sidereal Note:</span>
              <p className="leading-relaxed">{result.vedicContrast}</p>
            </div>

            {/* Consultation Upsell Banner */}
            <div className="rounded-2xl border border-[#E8A33D]/60 bg-gradient-to-r from-[#7B2D26] via-[#64231D] to-[#3B2A1E] text-white p-5 shadow-sm space-y-3">
              <div>
                <h4 className="font-temple text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-[#E8A33D]" />
                  <span>Ready to unlock your authentic Vedic birth chart?</span>
                </h4>
                <p className="text-xs text-amber-100/80 mt-1 leading-relaxed font-body">
                  Western Sun signs only touch the surface. Consult {PLACEHOLDER_ASTROLOGER.displayName} to examine your true 12 houses, Lagna lord, and dasha cycles.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <Link
                  href="/consult"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#E8A33D] hover:bg-[#d69330] text-[#3B2A1E] px-4 py-2.5 text-xs font-bold transition-all shadow-md"
                >
                  <PhoneCall className="h-4 w-4" />
                  <span>Book Consultation (Flat ₹1,051)</span>
                </Link>
                <Link
                  href="/moon-sign-calculator"
                  className="text-xs text-[#E8D8C3] hover:text-white underline font-semibold flex items-center gap-1"
                >
                  <span>Check Vedic Moon Sign</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Other Tools Strip */}
        <div className="pt-8 border-t border-[#E8D8C3] text-center space-y-4">
          <h4 className="font-temple text-sm font-bold uppercase tracking-wider text-[#7B2D26]">
            Explore More Free Vedic Astrological Tools
          </h4>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
            <Link
              href="/moon-sign-calculator"
              className="px-4 py-2 rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] hover:border-[#7B2D26] text-[#3B2A1E] font-semibold transition-all"
            >
              🌙 Moon Sign Calculator
            </Link>
            <Link
              href="/numerology-calculator"
              className="px-4 py-2 rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] hover:border-[#7B2D26] text-[#3B2A1E] font-semibold transition-all"
            >
              🔢 Numerology Calculator
            </Link>
            <Link
              href="/love-calculator"
              className="px-4 py-2 rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] hover:border-[#7B2D26] text-[#3B2A1E] font-semibold transition-all"
            >
              ❤️ Love Calculator
            </Link>
            <Link
              href="/flames-calculator"
              className="px-4 py-2 rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] hover:border-[#7B2D26] text-[#3B2A1E] font-semibold transition-all"
            >
              🔥 FLAMES Calculator
            </Link>
            <Link
              href="/kundli-generator"
              className="px-4 py-2 rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] hover:border-[#7B2D26] text-[#3B2A1E] font-semibold transition-all"
            >
              📜 Free Kundli Generator
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
