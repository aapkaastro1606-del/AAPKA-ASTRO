"use client";

import React, { useState } from "react";
import Link from "next/link";
import { calculateFlames, FlamesResult, FlamesLetter } from "@/lib/astrology/freeCalculators";
import { Flame, Sparkles, PhoneCall, ArrowRight, Heart, RefreshCw } from "lucide-react";
import { PLACEHOLDER_ASTROLOGER, ADMIN_CONFIGURABLE_PRICING } from "@/config/placeholderContent";

const LETTERS: Array<{ code: FlamesLetter; label: string; full: string }> = [
  { code: "F", label: "Friends", full: "F — Friends (मित्रता)" },
  { code: "L", label: "Love", full: "L — Love (प्रेम)" },
  { code: "A", label: "Affection", full: "A — Affection (स्नेह)" },
  { code: "M", label: "Marriage", full: "M — Marriage (विवाह)" },
  { code: "E", label: "Enemies", full: "E — Enemies (विरोधी)" },
  { code: "S", label: "Siblings", full: "S — Siblings (सहोदर)" },
];

export default function FlamesCalculatorPage() {
  const [name1, setName1] = useState("Rohan");
  const [name2, setName2] = useState("Ananya");

  const [result, setResult] = useState<FlamesResult>(() =>
    calculateFlames("Rohan", "Ananya")
  );

  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name1.trim() || !name2.trim()) return;

    setIsCalculating(true);
    setTimeout(() => {
      setResult(calculateFlames(name1, name2));
      setIsCalculating(false);
    }, 350);
  };

  return (
    <div className="bg-[#FBF3E7] min-h-screen text-[#3B2A1E] py-10 lg:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E8A33D]/40 bg-[#FAF1E4] px-3.5 py-1 text-xs font-bold text-[#7B2D26] uppercase font-temple">
            <Flame className="h-3.5 w-3.5 text-[#C1662F]" />
            <span>Classic Relationship Game</span>
          </div>
          <h1 className="font-temple text-3xl sm:text-5xl font-bold text-[#7B2D26] tracking-tight">
            Free FLAMES Love &amp; Fate Calculator
          </h1>
          <p className="text-xs sm:text-sm text-[#6E5545] font-body">
            Discover the secret destiny connecting your names: Friends, Love, Affection, Marriage, Enemies, or Siblings!
          </p>
        </div>

        {/* FLAMES Letters Tracker */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto">
          {LETTERS.map((item) => {
            const isWinner = result.letter === item.code;
            return (
              <div
                key={item.code}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  isWinner
                    ? "bg-[#7B2D26] text-white border-[#7B2D26] shadow-md scale-105 ring-2 ring-[#E8A33D]"
                    : "bg-[#FFFDF9] text-[#6E5545] border-[#E8D8C3]"
                }`}
              >
                <span className="font-mono text-sm">{item.code}</span>
                <span className="text-[11px]">{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Form and Result Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Card */}
          <div className="lg:col-span-5 rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm space-y-5">
            <h2 className="font-temple text-lg font-bold text-[#7B2D26] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#E8A33D]" />
              <span>Enter Two Names</span>
            </h2>

            <form onSubmit={handleCalculate} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#6E5545]">First Person&apos;s Name</label>
                <input
                  type="text"
                  required
                  value={name1}
                  onChange={(e) => setName1(e.target.value)}
                  placeholder="e.g. Rohan"
                  className="w-full rounded-xl border border-[#E8D8C3] bg-white px-3.5 py-2.5 text-xs text-[#3B2A1E] focus:border-[#7B2D26] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#6E5545]">Second Person&apos;s Name</label>
                <input
                  type="text"
                  required
                  value={name2}
                  onChange={(e) => setName2(e.target.value)}
                  placeholder="e.g. Ananya"
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
                    <span>Striking Common Letters...</span>
                  </>
                ) : (
                  <>
                    <Flame className="h-4 w-4 text-[#E8A33D]" />
                    <span>Calculate FLAMES Destiny</span>
                  </>
                )}
              </button>
            </form>

            <div className="p-3.5 bg-[#FBF3E7]/70 rounded-2xl border border-[#E8D8C3] text-[11px] text-[#6E5545] space-y-1">
              <span className="font-bold text-[#7B2D26] block uppercase text-[10px]">How FLAMES works:</span>
              <p className="leading-relaxed">
                Common letters across both names are cancelled. The remaining unshared count is used to sequentially eliminate letters until the ultimate connection reveals itself.
              </p>
            </div>
          </div>

          {/* Result Card */}
          <div className="lg:col-span-7 rounded-3xl border-2 border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8D8C3] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C1662F]">
                  FLAMES Relationship Category
                </span>
                <h3 className="font-temple text-2xl font-bold text-[#7B2D26] mt-0.5">
                  {result.name1} &amp; {result.name2}
                </h3>
              </div>
              <div className="text-4xl sm:text-5xl">{result.emoji}</div>
            </div>

            {/* Prominent Category Announcement */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#FAF1E4] to-[#FBF3E7] border border-[#E8D8C3] text-center space-y-2">
              <div className="text-xs uppercase font-bold tracking-wider text-[#C1662F]">
                Fate has chosen letter &ldquo;{result.letter}&rdquo;
              </div>
              <div className="font-temple text-2xl sm:text-3xl font-extrabold text-[#7B2D26]">
                {result.category}
              </div>
              <p className="text-xs text-[#6E5545] max-w-lg mx-auto leading-relaxed font-body">
                {result.description}
              </p>
            </div>

            {/* Compatibility Insight */}
            <div className="p-4 rounded-xl border border-[#E8D8C3] bg-white space-y-1 text-xs text-[#6E5545]">
              <span className="font-bold text-[#7B2D26] uppercase text-[10px] block">Vedic Astrologer Guidance:</span>
              <p className="leading-relaxed">{result.compatibilityAdvice}</p>
            </div>

            {/* Consultation Upsell Banner */}
            <div className="rounded-2xl border border-[#E8A33D]/60 bg-gradient-to-r from-[#7B2D26] via-[#64231D] to-[#3B2A1E] text-white p-5 shadow-sm space-y-3">
              <div>
                <h4 className="font-temple text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-[#E8A33D]" />
                  <span>FLAMES is fun, but what do your real horoscopes say?</span>
                </h4>
                <p className="text-xs text-amber-100/80 mt-1 leading-relaxed font-body">
                  Names provide vibrational clues, but only planetary dasha synastry and 36-Guna Milan reveal whether you are truly meant to walk life&apos;s journey together.
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
                  <span>Free 36-Gun Milan</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Other Tools Strip */}
        <div className="pt-8 border-t border-[#E8D8C3] text-center space-y-4">
          <h4 className="font-temple text-sm font-bold uppercase tracking-wider text-[#7B2D26]">
            Try Other Free Vedic Astrological Tools
          </h4>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
            <Link
              href="/love-calculator"
              className="px-4 py-2 rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] hover:border-[#7B2D26] text-[#3B2A1E] font-semibold transition-all"
            >
              ❤️ Love Calculator
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
              href="/kundli-matching"
              className="px-4 py-2 rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] hover:border-[#7B2D26] text-[#3B2A1E] font-semibold transition-all"
            >
              💍 36-Guna Milan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
