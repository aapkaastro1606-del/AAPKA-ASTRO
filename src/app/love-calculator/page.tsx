"use client";

import React, { useState } from "react";
import Link from "next/link";
import { calculateLoveScore, LoveCalculatorResult } from "@/lib/astrology/freeCalculators";
import { Heart, Sparkles, PhoneCall, ArrowRight, Flame, Compass, RefreshCw } from "lucide-react";
import { PLACEHOLDER_ASTROLOGER, ADMIN_CONFIGURABLE_PRICING } from "@/config/placeholderContent";

export default function LoveCalculatorPage() {
  const [name1, setName1] = useState("Aarav");
  const [name2, setName2] = useState("Meera");
  const [dob1, setDob1] = useState("1996-05-14");
  const [dob2, setDob2] = useState("1998-11-22");

  const [result, setResult] = useState<LoveCalculatorResult>(() =>
    calculateLoveScore("Aarav", "Meera", "1996-05-14", "1998-11-22")
  );

  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name1.trim() || !name2.trim()) return;

    setIsCalculating(true);
    setTimeout(() => {
      setResult(calculateLoveScore(name1, name2, dob1, dob2));
      setIsCalculating(false);
    }, 400);
  };

  return (
    <div className="bg-[#FBF3E7] min-h-screen text-[#3B2A1E] py-10 lg:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E8A33D]/40 bg-[#FAF1E4] px-3.5 py-1 text-xs font-bold text-[#7B2D26] uppercase font-temple">
            <Heart className="h-3.5 w-3.5 text-[#C1662F] fill-[#C1662F]/20" />
            <span>Free Vedic Love &amp; Chemistry Calculator</span>
          </div>
          <h1 className="font-temple text-3xl sm:text-5xl font-bold text-[#7B2D26] tracking-tight">
            Check Your Cosmic Love Percentage
          </h1>
          <p className="text-xs sm:text-sm text-[#6E5545] font-body">
            Test the energetic resonance and romantic affinity between you and your partner using name synergy and birth vibrations.
          </p>
        </div>

        {/* Calculator Form & Result Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Card */}
          <div className="lg:col-span-5 rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="font-temple text-lg font-bold text-[#7B2D26] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#E8A33D]" />
              <span>Enter Partner Details</span>
            </h2>

            <form onSubmit={handleCalculate} className="space-y-4 text-xs">
              {/* Person 1 */}
              <div className="space-y-1.5">
                <label className="font-semibold text-[#6E5545]">Your Name / First Partner</label>
                <input
                  type="text"
                  required
                  value={name1}
                  onChange={(e) => setName1(e.target.value)}
                  placeholder="e.g. Aarav"
                  className="w-full rounded-xl border border-[#E8D8C3] bg-white px-3.5 py-2.5 text-xs text-[#3B2A1E] focus:border-[#7B2D26] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#6E5545]">Your Birth Date (Optional for precision)</label>
                <input
                  type="date"
                  value={dob1}
                  onChange={(e) => setDob1(e.target.value)}
                  className="w-full rounded-xl border border-[#E8D8C3] bg-white px-3.5 py-2 text-xs text-[#3B2A1E] focus:border-[#7B2D26] focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-[#E8D8C3]/60 space-y-1.5">
                <label className="font-semibold text-[#6E5545]">Partner&apos;s Name</label>
                <input
                  type="text"
                  required
                  value={name2}
                  onChange={(e) => setName2(e.target.value)}
                  placeholder="e.g. Meera"
                  className="w-full rounded-xl border border-[#E8D8C3] bg-white px-3.5 py-2.5 text-xs text-[#3B2A1E] focus:border-[#7B2D26] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#6E5545]">Partner&apos;s Birth Date (Optional)</label>
                <input
                  type="date"
                  value={dob2}
                  onChange={(e) => setDob2(e.target.value)}
                  className="w-full rounded-xl border border-[#E8D8C3] bg-white px-3.5 py-2 text-xs text-[#3B2A1E] focus:border-[#7B2D26] focus:outline-none"
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
                    <span>Aligning Planetary Waves...</span>
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4 fill-current text-[#E8A33D]" />
                    <span>Calculate Love Compatibility</span>
                  </>
                )}
              </button>
            </form>

            <div className="p-3 bg-[#FBF3E7]/60 rounded-xl border border-[#E8D8C3] text-[11px] text-[#6E5545]">
              💡 <strong>Seeking marriage readiness?</strong> Use our classical{" "}
              <Link href="/kundli-matching" className="text-[#7B2D26] font-bold underline">
                36-Guna Milan Matcher
              </Link>{" "}
              for detailed Ashtakoot and Manglik dosha checks.
            </div>
          </div>

          {/* Result Card */}
          <div className="lg:col-span-7 rounded-3xl border-2 border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8D8C3] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C1662F]">
                  Love Compatibility Synthesis
                </span>
                <h3 className="font-temple text-xl font-bold text-[#7B2D26]">
                  {result.partner1} &amp; {result.partner2}
                </h3>
              </div>
              <div className="text-right">
                <div className="font-temple text-4xl sm:text-5xl font-extrabold text-[#7B2D26]">
                  {result.score}%
                </div>
                <div className="text-[10px] uppercase font-bold text-[#6B8E5A]">Affinity Rating</div>
              </div>
            </div>

            {/* Verdict */}
            <div className="p-4 rounded-2xl bg-[#FBF3E7] border border-[#E8D8C3] space-y-1 text-center sm:text-left">
              <div className="text-xs font-bold text-[#7B2D26] uppercase tracking-wide">
                {result.verdict}
              </div>
              <p className="text-xs text-[#6E5545] leading-relaxed font-body">
                {result.summary}
              </p>
            </div>

            {/* 4 Pillars of Harmony */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7B2D26] font-temple">
                Core Compatibility Pillars
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-[#E8D8C3] bg-white">
                  <div className="flex justify-between font-semibold mb-1.5">
                    <span className="text-[#6E5545]">Emotional Harmony</span>
                    <span className="text-[#7B2D26] font-mono font-bold">{result.pillars.emotional}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#E8D8C3]/50 rounded-full overflow-hidden">
                    <div className="h-full bg-[#6B8E5A] rounded-full" style={{ width: `${result.pillars.emotional}%` }} />
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-[#E8D8C3] bg-white">
                  <div className="flex justify-between font-semibold mb-1.5">
                    <span className="text-[#6E5545]">Communication</span>
                    <span className="text-[#7B2D26] font-mono font-bold">{result.pillars.communication}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#E8D8C3]/50 rounded-full overflow-hidden">
                    <div className="h-full bg-[#E8A33D] rounded-full" style={{ width: `${result.pillars.communication}%` }} />
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-[#E8D8C3] bg-white">
                  <div className="flex justify-between font-semibold mb-1.5">
                    <span className="text-[#6E5545]">Passion &amp; Spark</span>
                    <span className="text-[#7B2D26] font-mono font-bold">{result.pillars.passion}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#E8D8C3]/50 rounded-full overflow-hidden">
                    <div className="h-full bg-[#C1662F] rounded-full" style={{ width: `${result.pillars.passion}%` }} />
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-[#E8D8C3] bg-white">
                  <div className="flex justify-between font-semibold mb-1.5">
                    <span className="text-[#6E5545]">Stability &amp; Trust</span>
                    <span className="text-[#7B2D26] font-mono font-bold">{result.pillars.stability}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#E8D8C3]/50 rounded-full overflow-hidden">
                    <div className="h-full bg-[#7B2D26] rounded-full" style={{ width: `${result.pillars.stability}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Astrological Advice */}
            <div className="text-xs text-[#6E5545] p-3.5 rounded-xl border border-[#E8D8C3] bg-white space-y-1">
              <span className="font-bold text-[#7B2D26] uppercase text-[10px] block">Vedic Relationship Advice:</span>
              <p className="leading-relaxed">{result.advice}</p>
            </div>

            {/* Consultation Upsell Box */}
            <div className="rounded-2xl border border-[#E8A33D]/60 bg-gradient-to-r from-[#7B2D26] via-[#64231D] to-[#3B2A1E] text-white p-5 shadow-sm space-y-3">
              <div>
                <h4 className="font-temple text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-[#E8A33D]" />
                  <span>Want to know your exact marriage timing &amp; Kundli compatibility?</span>
                </h4>
                <p className="text-xs text-amber-100/80 mt-1 leading-relaxed font-body">
                  Discuss planetary yogas, Bhakoot/Nadi doshas, and lifelong marital prospects in a confidential 1-on-1 session with {PLACEHOLDER_ASTROLOGER.displayName}.
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
                  href="/kundli-matching"
                  className="text-xs text-[#E8D8C3] hover:text-white underline font-semibold flex items-center gap-1"
                >
                  <span>Detailed 36-Gun Milan</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Other Free Calculators Strip */}
        <div className="pt-8 border-t border-[#E8D8C3] text-center space-y-4">
          <h4 className="font-temple text-sm font-bold uppercase tracking-wider text-[#7B2D26]">
            Explore More Free Vedic Astrological Tools
          </h4>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
            <Link
              href="/flames-calculator"
              className="px-4 py-2 rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] hover:border-[#7B2D26] text-[#3B2A1E] font-semibold transition-all"
            >
              🔥 FLAMES Calculator
            </Link>
            <Link
              href="/moon-sign-calculator"
              className="px-4 py-2 rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] hover:border-[#7B2D26] text-[#3B2A1E] font-semibold transition-all"
            >
              🌙 Moon Sign Calculator
            </Link>
            <Link
              href="/sun-sign-calculator"
              className="px-4 py-2 rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] hover:border-[#7B2D26] text-[#3B2A1E] font-semibold transition-all"
            >
              ☀️ Sun Sign Calculator
            </Link>
            <Link
              href="/numerology-calculator"
              className="px-4 py-2 rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] hover:border-[#7B2D26] text-[#3B2A1E] font-semibold transition-all"
            >
              🔢 Numerology Calculator
            </Link>
            <Link
              href="/kundli-generator"
              className="px-4 py-2 rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] hover:border-[#7B2D26] text-[#3B2A1E] font-semibold transition-all"
            >
              📜 Janam Kundli Generator
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
