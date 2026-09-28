"use client";

import React from "react";
import Link from "next/link";
import { DailyHoroscope, ZodiacSignInfo } from "@/lib/astrology/dailyHoroscope";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { MandalaDivider } from "@/components/ui/MandalaDivider";
import { DiyaIcon } from "@/components/ui/DiyaIcon";
import { Sparkles, ArrowRight, Compass, PhoneCall, HelpCircle } from "lucide-react";

interface HoroscopeIndexViewProps {
  items: Array<{
    sign: ZodiacSignInfo;
    horoscope: DailyHoroscope;
  }>;
  astrologerName: string;
}

export function HoroscopeIndexView({ items, astrologerName }: HoroscopeIndexViewProps) {
  const { lang, setLang } = useLanguage();
  const isHi = lang === "hi";

  const firstHoroscope = items[0]?.horoscope;

  return (
    <div className="min-h-screen bg-[#FBF3E7] text-[#3B2A1E]">
      {/* Top Hero */}
      <section className="relative overflow-hidden border-b border-[#E8D8C3] bg-gradient-to-b from-[#7B2D26]/10 to-[#FBF3E7] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Top badge + Language Switcher */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E8A33D]/60 bg-[#FFFDF9] px-4 py-1.5 text-xs font-bold text-[#7B2D26] shadow-xs">
              <DiyaIcon size={14} />
              <span>
                {isHi
                  ? "वैदिक जन्म चन्द्र राशि (Chandra Rashi / Moon Sign) गोचर गणना"
                  : "Vedic Chandra Rashi (Moon Sign) Gochara Calculations"}
              </span>
              {firstHoroscope && (
                <>
                  <span className="text-[#6E5545]">•</span>
                  <span className="text-[#C1662F] font-mono">
                    {isHi ? firstHoroscope.formattedDateHindi : firstHoroscope.formattedDate}
                  </span>
                </>
              )}
            </div>

            <div className="inline-flex rounded-lg border border-[#E8D8C3] bg-[#FFFDF9] p-0.5">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`rounded-md px-2.5 py-1 text-xs font-bold transition-colors ${
                  !isHi ? "bg-[#7B2D26] text-[#FFFDF9]" : "text-[#6E5545] hover:text-[#3B2A1E]"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLang("hi")}
                className={`rounded-md px-2.5 py-1 text-xs font-bold transition-colors ${
                  isHi ? "bg-[#7B2D26] text-[#FFFDF9]" : "text-[#6E5545] hover:text-[#3B2A1E]"
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>

          <h1 className="font-temple text-3xl sm:text-5xl font-bold text-[#7B2D26] tracking-tight">
            {isHi ? "दैनिक वैदिक चन्द्र राशिफल" : "Daily Vedic Horoscope (Chandra Rashi)"}
          </h1>
          <p className="mt-2 text-lg sm:text-xl font-medium text-[#C1662F]">
            {isHi
              ? "१२ जन्म चन्द्र राशियों का प्रामाणिक दैनिक गोचर फल एवं उपाय"
              : "दैनिक राशिफल — Authentic Moon Sign Readings Calculated from Lahiri Ephemeris"}
          </p>

          <p className="mt-4 text-sm sm:text-base text-[#6E5545] max-w-2xl mx-auto leading-relaxed">
            {isHi
              ? "यह राशिफल आपकी वैदिक जन्म चन्द्र राशि (Moon Sign / Rashi) से चन्द्रमा तथा नवग्रहों के वास्तविक निरयण गोचर (चित्रापक्ष लाहिड़ी अयनांश), तिथि, नक्षत्र एवं वारेश मैत्री के आधार पर गणित किया गया है।"
              : "Unlike generic Sun-sign columns, these readings are calculated from your Vedic Moon Sign (Chandra Rashi) using real-time planetary positions (Chitra Paksha Lahiri Ayanamsa), daily Nakshatra, Tithi, and classical Phaladeepika Gochara rules."}
          </p>

          {/* Direct Link to Moon Sign Calculator */}
          <div className="mt-5 flex justify-center">
            <Link
              href="/calculators/moon-sign"
              className="inline-flex items-center gap-2 rounded-xl border border-[#C1662F]/40 bg-[#FFFDF9] px-4 py-2 text-xs sm:text-sm font-bold text-[#7B2D26] shadow-xs hover:border-[#7B2D26] hover:bg-[#FBF3E7] transition-all"
            >
              <HelpCircle className="h-4 w-4 text-[#C1662F]" />
              <span>
                {isHi
                  ? "अपनी वैदिक चन्द्र राशि (Rashi) नहीं जानते? निःशुल्क चन्द्र राशि कैलकुलेटर से जानें →"
                  : "Don't know your Vedic Moon Sign (Chandra Rashi)? Calculate it free in 10 seconds →"}
              </span>
            </Link>
          </div>

          <div className="flex justify-center my-6">
            <MandalaDivider className="w-32 text-[#C1662F]" />
          </div>
        </div>
      </section>

      {/* 12 Zodiac Signs Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map(({ sign, horoscope }) => {
            const { computedFacts } = horoscope;
            return (
              <Link
                key={sign.id}
                href={`/horoscope/${sign.id}`}
                className="group relative rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#C1662F] hover:shadow-xl flex flex-col justify-between"
              >
                <div>
                  {/* Header with Zodiac Symbol and Chandra Gochar House */}
                  <div className="flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7B2D26] text-3xl text-[#E8A33D] shadow-sm group-hover:scale-105 transition-transform">
                      {sign.symbol}
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        computedFacts.moonHouseVerdict === "Favourable"
                          ? "bg-emerald-100 text-emerald-900"
                          : computedFacts.moonHouseVerdict === "Mixed"
                          ? "bg-amber-100 text-amber-900"
                          : "bg-rose-100 text-rose-900"
                      }`}
                    >
                      {isHi
                        ? `चन्द्र ${computedFacts.moonHouseFromRashi}वें भाव (${
                            computedFacts.moonHouseVerdict === "Favourable"
                              ? "शुभ"
                              : computedFacts.moonHouseVerdict === "Mixed"
                              ? "मिश्रित"
                              : "सावधानी"
                          })`
                        : `Moon in ${computedFacts.moonHouseFromRashi}H (${computedFacts.moonHouseVerdict})`}
                    </span>
                  </div>

                  {/* Sign Names */}
                  <div className="mt-4">
                    <div className="flex items-baseline gap-2">
                      <h2 className="font-temple text-xl font-bold text-[#7B2D26] group-hover:text-[#96372E] transition-colors">
                        {isHi ? `${sign.hindiName} (${sign.sanskritName})` : sign.englishName}
                      </h2>
                      <span className="font-hindi text-base font-bold text-[#C1662F]">
                        {isHi ? sign.englishName : `(${sign.hindiName})`}
                      </span>
                    </div>
                    <p className="text-xs text-[#6E5545] font-medium mt-0.5">{sign.dateRange}</p>
                  </div>

                  {/* Ruling Planet & Lucky Color */}
                  <div className="mt-3 rounded-lg bg-[#FBF3E7] p-2.5 text-[11px] text-[#6E5545]">
                    <p>
                      <span className="font-bold text-[#3B2A1E]">
                        {isHi ? "राशि स्वामी:" : "Ruling Lord:"}
                      </span>{" "}
                      {isHi ? sign.rulingPlanetHindi : sign.rulingPlanet}
                    </p>
                    <p className="mt-0.5">
                      <span className="font-bold text-[#3B2A1E]">
                        {isHi ? "शुभ रंग:" : "Lucky Colour:"}
                      </span>{" "}
                      {isHi ? horoscope.luckyColorHindi : horoscope.luckyColor.split("(")[0]}
                    </p>
                  </div>

                  {/* Short Daily Excerpt */}
                  <p className="mt-3 text-xs text-[#3B2A1E] line-clamp-3 leading-relaxed">
                    {isHi ? horoscope.summaryHindi : horoscope.summary}
                  </p>
                </div>

                {/* Read Full CTA */}
                <div className="mt-4 pt-3 border-t border-[#E8D8C3]/60 flex items-center justify-between text-xs font-bold text-[#7B2D26]">
                  <span>
                    {isHi ? "सम्पूर्ण राशिफल व उपाय पढ़ें" : "Read Full Horoscope & Why"}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Consultation Banner */}
      <section className="bg-[#7B2D26] text-[#FBF3E7] py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E8A33D]/20 px-3.5 py-1 text-xs font-bold text-[#E8A33D] mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isHi ? "व्यक्तिगत वैदिक ज्योतिष परामर्श" : "Personalised Vedic Consultation"}</span>
          </div>

          <h2 className="font-temple text-2xl sm:text-4xl font-bold">
            {isHi
              ? "दैनिक चन्द्र गोचर दिशा दिखाता है — आपकी जन्म कुंडली सटीक निर्णय देती है।"
              : "Daily Gochara Shows the Weather. Your Janam Kundli Shows Your Path."}
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#FBF3E7]/85 leading-relaxed max-w-2xl mx-auto">
            {isHi
              ? `अपनी महादशा, अन्तर्दशा, विवाह, व्यवसाय और जीवन के महत्वपूर्ण निर्णयों के लिए ${astrologerName} जी से सीधा परामर्श प्राप्त करें।`
              : `For exact timing on your career, marriage, health, and Vimshottari Dasha transitions, consult directly with ${astrologerName}.`}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/consult"
              className="inline-flex items-center gap-2 rounded-xl bg-[#E8A33D] px-6 py-3.5 text-sm font-bold text-[#3B2A1E] hover:bg-[#D5912C] transition-all shadow-lg"
            >
              <PhoneCall className="h-4 w-4" />
              <span>{isHi ? "आचार्य जी से बात करें" : "Talk to Acharya Ji Now"}</span>
            </Link>
            <Link
              href="/calculators/moon-sign"
              className="inline-flex items-center gap-2 rounded-xl border border-[#FBF3E7]/30 bg-[#7B2D26] px-6 py-3.5 text-sm font-bold text-[#FBF3E7] hover:bg-[#64221C] transition-all"
            >
              <Compass className="h-4 w-4" />
              <span>{isHi ? "अपनी चन्द्र राशि जानें" : "Calculate Your Moon Sign"}</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
