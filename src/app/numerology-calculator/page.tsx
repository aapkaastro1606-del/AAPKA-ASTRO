"use client";

import React, { useState } from "react";
import Link from "next/link";
import { calculateNumerology, NumerologyResult } from "@/lib/astrology/freeCalculators";
import { Hash, Sparkles, PhoneCall, ArrowRight, Compass, ShieldCheck, RefreshCw } from "lucide-react";
import { PLACEHOLDER_ASTROLOGER, ADMIN_CONFIGURABLE_PRICING } from "@/config/placeholderContent";

export default function NumerologyCalculatorPage() {
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("1996-05-14");

  const [result, setResult] = useState<NumerologyResult>(() =>
    calculateNumerology("Seeker", "1996-05-14")
  );

  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate) return;
    const nameToCalc = fullName.trim() || "Seeker";

    setIsCalculating(true);
    setTimeout(() => {
      setResult(calculateNumerology(nameToCalc, birthDate));
      setIsCalculating(false);
    }, 350);
  };

  return (
    <div className="bg-[#FBF3E7] min-h-screen text-[#3B2A1E] py-10 lg:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E8A33D]/40 bg-[#FAF1E4] px-3.5 py-1 text-xs font-bold text-[#7B2D26] uppercase font-temple">
            <Hash className="h-3.5 w-3.5 text-[#C1662F]" />
            <span>Vedic &amp; Chaldean Numerology</span>
          </div>
          <h1 className="font-temple text-3xl sm:text-5xl font-bold text-[#7B2D26] tracking-tight">
            Free Vedic Numerology Calculator
          </h1>
          <p className="text-xs sm:text-sm text-[#6E5545] font-body">
            Calculate your Life Path Number (Bhagyank), Destiny Number (Namank), and Soul Urge to unlock the hidden numerical vibrations governing your success.
          </p>
        </div>

        {/* Calculator Form & Result Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Card */}
          <div className="lg:col-span-5 rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm space-y-5">
            <h2 className="font-temple text-lg font-bold text-[#7B2D26] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#E8A33D]" />
              <span>Enter Name &amp; Birth Date</span>
            </h2>

            <form onSubmit={handleCalculate} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#6E5545]">Full Name (as per birth record)</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full rounded-xl border border-[#E8D8C3] bg-white px-3.5 py-2.5 text-xs text-[#3B2A1E] focus:border-[#7B2D26] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#6E5545]">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
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
                    <span>Calculating Chaldean Frequencies...</span>
                  </>
                ) : (
                  <>
                    <Hash className="h-4 w-4 text-[#E8A33D]" />
                    <span>Calculate My Numbers</span>
                  </>
                )}
              </button>
            </form>

            <div className="p-3.5 bg-[#FBF3E7]/70 rounded-2xl border border-[#E8D8C3] text-[11px] text-[#6E5545] space-y-1">
              <span className="font-bold text-[#7B2D26] block uppercase text-[10px]">What is Life Path Number?</span>
              <p className="leading-relaxed">
                Your Life Path Number represents the core lessons, spiritual mission, and greatest opportunities meant for your soul in this lifetime.
              </p>
            </div>
          </div>

          {/* Result Card */}
          <div className="lg:col-span-7 rounded-3xl border-2 border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm space-y-6">
            {/* Numbers Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-[#7B2D26] text-white space-y-1 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-[#E8D8C3] block">Life Path</span>
                <div className="font-temple text-3xl font-black text-[#E8A33D]">{result.lifePathNumber}</div>
                <div className="text-[9px] text-[#FBF3E7]/80">Bhagyank</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#FBF3E7] border border-[#E8D8C3] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#6E5545] block">Destiny</span>
                <div className="font-temple text-3xl font-black text-[#7B2D26]">{result.destinyNumber}</div>
                <div className="text-[9px] text-[#6E5545]">Namank</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#FBF3E7] border border-[#E8D8C3] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#6E5545] block">Soul Urge</span>
                <div className="font-temple text-3xl font-black text-[#C1662F]">{result.soulUrgeNumber}</div>
                <div className="text-[9px] text-[#6E5545]">Heart Desire</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#FBF3E7] border border-[#E8D8C3] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#6E5545] block">Personality</span>
                <div className="font-temple text-3xl font-black text-[#3B2A1E]">{result.personalityNumber}</div>
                <div className="text-[9px] text-[#6E5545]">Outer Persona</div>
              </div>
            </div>

            {/* Core Vibration Title */}
            <div className="p-4 rounded-2xl bg-[#FBF3E7] border border-[#E8D8C3] space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#7B2D26] uppercase">Vibrational Archetype</span>
                <span className="text-[#6E5545] font-semibold">Ruler: <strong className="text-[#7B2D26]">{result.rulingPlanet}</strong></span>
              </div>
              <div className="font-temple text-xl font-bold text-[#7B2D26]">
                {result.coreVibration}
              </div>
              <p className="text-xs text-[#6E5545] leading-relaxed font-body">
                {result.lifeMission}
              </p>
            </div>

            {/* Strengths & Challenges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border border-[#E8D8C3] bg-white space-y-2">
                <span className="font-bold text-[#2E7D32] uppercase text-[10px] flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Key Strengths</span>
                </span>
                <ul className="space-y-1 text-[#3B2A1E]">
                  {result.strengths.map((s, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full bg-[#2E7D32]" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl border border-[#E8D8C3] bg-white space-y-2">
                <span className="font-bold text-[#C1662F] uppercase text-[10px] flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Karmic Challenges</span>
                </span>
                <ul className="space-y-1 text-[#3B2A1E]">
                  {result.challenges.map((c, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full bg-[#C1662F]" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Career Affinities */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-[#7B2D26] uppercase text-[10px] block">Auspicious Career Avenues:</span>
              <div className="flex flex-wrap gap-1.5">
                {result.careerAffinities.map((career, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-[#FAF1E4] border border-[#E8D8C3] text-[#3B2A1E] font-medium"
                  >
                    💼 {career}
                  </span>
                ))}
              </div>
            </div>

            {/* Consultation Upsell Banner */}
            <div className="rounded-2xl border border-[#E8A33D]/60 bg-gradient-to-r from-[#7B2D26] via-[#64231D] to-[#3B2A1E] text-white p-5 shadow-sm space-y-3">
              <div>
                <h4 className="font-temple text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-[#E8A33D]" />
                  <span>Want to correct your name spelling or lucky mobile number?</span>
                </h4>
                <p className="text-xs text-amber-100/80 mt-1 leading-relaxed font-body">
                  Align your business name, signature, and phone digits with your planetary dasha. Consult {PLACEHOLDER_ASTROLOGER.displayName} for personalized Chaldean name correction.
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
                  href="/kundli-generator"
                  className="text-xs text-[#E8D8C3] hover:text-white underline font-semibold flex items-center gap-1"
                >
                  <span>Check Vedic Kundli</span>
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
              href="/sun-sign-calculator"
              className="px-4 py-2 rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] hover:border-[#7B2D26] text-[#3B2A1E] font-semibold transition-all"
            >
              ☀️ Sun Sign Calculator
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
