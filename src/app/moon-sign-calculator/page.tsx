"use client";

import React, { useState } from "react";
import Link from "next/link";
import { calculateMoonSign, MoonSignResult } from "@/lib/astrology/freeCalculators";
import { LocationResult } from "@/lib/services/locationService";
import { LocationAutocomplete } from "@/components/kundli/LocationAutocomplete";
import { Moon, Sparkles, PhoneCall, ArrowRight, Compass, Gem, RefreshCw } from "lucide-react";
import { PLACEHOLDER_ASTROLOGER, ADMIN_CONFIGURABLE_PRICING } from "@/config/placeholderContent";

export default function MoonSignCalculatorPage() {
  const [name, setName] = useState("Aarav");
  const [birthDate, setBirthDate] = useState("1996-05-14");
  const [birthTime, setBirthTime] = useState("14:30");
  const [location, setLocation] = useState<LocationResult>({
    id: "in-new-delhi",
    name: "New Delhi",
    displayName: "New Delhi, Delhi, India",
    state: "Delhi",
    country: "India",
    countryCode: "IN",
    latitude: 28.6139,
    longitude: 77.209,
    timezone: 5.5,
    timezoneId: "Asia/Kolkata",
  });

  const [result, setResult] = useState<MoonSignResult>(() =>
    calculateMoonSign(
      "Aarav",
      "1996-05-14",
      "14:30",
      "New Delhi, Delhi, India",
      28.6139,
      77.209,
      5.5
    )
  );

  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate || !birthTime) return;

    setIsCalculating(true);
    setTimeout(() => {
      setResult(
        calculateMoonSign(
          name,
          birthDate,
          birthTime,
          location.displayName,
          location.latitude,
          location.longitude,
          location.timezone
        )
      );
      setIsCalculating(false);
    }, 350);
  };

  return (
    <div className="bg-[#FBF3E7] min-h-screen text-[#3B2A1E] py-10 lg:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E8A33D]/40 bg-[#FAF1E4] px-3.5 py-1 text-xs font-bold text-[#7B2D26] uppercase font-temple">
            <Moon className="h-3.5 w-3.5 text-[#C1662F]" />
            <span>Nirayana Chandra Rashi Calculator</span>
          </div>
          <h1 className="font-temple text-3xl sm:text-5xl font-bold text-[#7B2D26] tracking-tight">
            Find Your Vedic Moon Sign (चन्द्र राशि)
          </h1>
          <p className="text-xs sm:text-sm text-[#6E5545] font-body">
            In authentic Vedic astrology, your Moon Sign reveals your emotional soul, instinctual mind (Manas), and life destiny. Computed via NASA JPL Ephemeris with Lahiri Ayanamsa.
          </p>
        </div>

        {/* Form and Result Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Birth Details Input Form */}
          <div className="lg:col-span-5 rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm space-y-5">
            <h2 className="font-temple text-lg font-bold text-[#7B2D26] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#E8A33D]" />
              <span>Enter Birth Details</span>
            </h2>

            <form onSubmit={handleCalculate} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#6E5545]">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full rounded-xl border border-[#E8D8C3] bg-white px-3.5 py-2.5 text-xs text-[#3B2A1E] focus:border-[#7B2D26] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#6E5545]">Birth Date</label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full rounded-xl border border-[#E8D8C3] bg-white px-3.5 py-2 text-xs text-[#3B2A1E] focus:border-[#7B2D26] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#6E5545]">Birth Time</label>
                  <input
                    type="time"
                    required
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className="w-full rounded-xl border border-[#E8D8C3] bg-white px-3.5 py-2 text-xs text-[#3B2A1E] focus:border-[#7B2D26] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#6E5545]">Birth Place (City, Town, Village)</label>
                <LocationAutocomplete
                  value={location.displayName}
                  onSelect={(loc: LocationResult) => setLocation(loc)}
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
                    <span>Calculating Astronomical Moon Position...</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 text-[#E8A33D]" />
                    <span>Find My Moon Sign</span>
                  </>
                )}
              </button>
            </form>

            <div className="p-3.5 bg-[#FBF3E7]/70 rounded-2xl border border-[#E8D8C3] text-[11px] text-[#6E5545] space-y-1">
              <span className="font-bold text-[#7B2D26] block uppercase text-[10px]">Why birth time matters:</span>
              <p className="leading-relaxed">
                The Moon traverses an entire sign in approximately 2.25 days and a Nakshatra in less than 24 hours. Accurate time ensures the exact Rashi and Charan Pada.
              </p>
            </div>
          </div>

          {/* Result Card */}
          <div className="lg:col-span-7 rounded-3xl border-2 border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8D8C3] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C1662F]">
                  Your Vedic Lunar Identity
                </span>
                <h3 className="font-temple text-3xl font-bold text-[#7B2D26] mt-0.5">
                  {result.moonSign} Rashi ({result.moonSignHindi})
                </h3>
                <div className="text-xs text-[#6E5545] mt-1">
                  Ruled by <strong>{result.rashiLord}</strong> &bull; Element: <strong>{result.element}</strong>
                </div>
              </div>
              <div className="text-center bg-[#FBF3E7] border border-[#E8D8C3] px-3.5 py-2 rounded-xl">
                <div className="text-[10px] font-bold uppercase text-[#7B2D26]">Nakshatra</div>
                <div className="text-xs font-bold text-[#3B2A1E]">{result.nakshatra}</div>
                <div className="text-[10px] text-[#6E5545]">Pada {result.nakshatraPada}</div>
              </div>
            </div>

            {/* Emotional Profile Card */}
            <div className="p-4 rounded-2xl bg-[#FBF3E7] border border-[#E8D8C3] space-y-2">
              <div className="text-xs font-bold text-[#7B2D26] uppercase tracking-wide">
                Emotional &amp; Psychological Nature
              </div>
              <p className="text-xs text-[#6E5545] leading-relaxed font-body">
                {result.emotionalProfile}
              </p>
            </div>

            {/* Core Traits Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7B2D26] font-temple">
                Key Instinctual Strengths
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                {result.coreTraits.map((trait, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl border border-[#E8D8C3] bg-white text-xs text-[#3B2A1E] font-medium flex items-center gap-2"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#6B8E5A]" />
                    <span>{trait}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Favorable Remedies */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-[#E8D8C3] bg-white space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#6E5545] flex items-center gap-1">
                  <Gem className="h-3 w-3 text-[#6B8E5A]" />
                  <span>Prescribed Gemstone</span>
                </span>
                <div className="font-bold text-[#2E7D32]">{result.favorableGemstone}</div>
              </div>

              <div className="p-3 rounded-xl border border-[#E8D8C3] bg-white space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#6E5545] flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-[#E8A33D]" />
                  <span>Ishta Devata</span>
                </span>
                <div className="font-bold text-[#7B2D26]">{result.favorableDeity}</div>
              </div>
            </div>

            {/* Consultation Upsell Banner */}
            <div className="rounded-2xl border border-[#E8A33D]/60 bg-gradient-to-r from-[#7B2D26] via-[#64231D] to-[#3B2A1E] text-white p-5 shadow-sm space-y-3">
              <div>
                <h4 className="font-temple text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-[#E8A33D]" />
                  <span>Discover your complete 12 Houses and Vimshottari Dashas</span>
                </h4>
                <p className="text-xs text-amber-100/80 mt-1 leading-relaxed font-body">
                  Your Moon sign is only one dimension of your chart. Book a live consultation with {PLACEHOLDER_ASTROLOGER.displayName} to analyze your Lagna chart, Sade Sati phase, and career timing.
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
                  <span>Generate Full Janam Kundli</span>
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
