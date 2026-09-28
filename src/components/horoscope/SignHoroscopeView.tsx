"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DailyHoroscope, ZODIAC_SIGNS } from "@/lib/astrology/dailyHoroscope";
import { HOROSCOPE_UI_COPY } from "@/lib/i18n/vedicGlossary";
import { useLanguage } from "@/context/LanguageContext";
import { DiyaIcon } from "@/components/ui/DiyaIcon";
import {
  Heart,
  Briefcase,
  Activity,
  Coins,
  Users,
  Sparkles,
  PhoneCall,
  ArrowLeft,
  Compass,
  ChevronDown,
  ChevronUp,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  Share2,
} from "lucide-react";

interface SignHoroscopeViewProps {
  yesterday: DailyHoroscope;
  today: DailyHoroscope;
  tomorrow: DailyHoroscope;
  astrologerName: string;
  defaultLocale?: "en" | "hi";
}

export function SignHoroscopeView({
  yesterday,
  today,
  tomorrow,
  astrologerName,
  defaultLocale = "en",
}: SignHoroscopeViewProps) {
  const { setLang } = useLanguage();
  const isHi = defaultLocale === "hi";

  useEffect(() => {
    setLang(defaultLocale);
  }, [defaultLocale, setLang]);

  const [dayTab, setDayTab] = useState<"yesterday" | "today" | "tomorrow">("today");
  const [whyExpanded, setWhyExpanded] = useState<boolean>(false);

  const activeHoroscope =
    dayTab === "yesterday" ? yesterday : dayTab === "tomorrow" ? tomorrow : today;

  const { sign, computedFacts } = activeHoroscope;
  const baseHref = isHi ? "/hi/horoscope" : "/horoscope";

  const handleShareWhatsApp = () => {
    const shareUrl =
      typeof window !== "undefined"
        ? window.location.href
        : `https://aapkaastro.com${baseHref}/${sign.id}`;
    const text = isHi
      ? `🙏 *${sign.hindiName} दैनिक चन्द्र राशिफल (${activeHoroscope.formattedDateHindi})*\n\n✨ *गोचर सार:* ${activeHoroscope.summaryHindi}\n🔹 *चन्द्र गोचर:* ${computedFacts.moonHouseNameHi}\n🎨 *शुभ रंग:* ${activeHoroscope.luckyColorHindi} | *शुभ अंक:* ${activeHoroscope.luckyNumber}\n🕉️ *वैदिक उपाय:* ${activeHoroscope.remedyHindi}\n\nसंपूर्ण राशिफल देखें: ${shareUrl}`
      : `🙏 *${sign.englishName} (${sign.sanskritName}) Vedic Moon Sign Horoscope — ${activeHoroscope.formattedDate}*\n\n✨ *Overview:* ${activeHoroscope.summary}\n🔹 *Chandra Gochar:* ${computedFacts.moonHouseNameEn}\n🎨 *Lucky Colour:* ${activeHoroscope.luckyColor} | *Lucky Number:* ${activeHoroscope.luckyNumber}\n🕉️ *Vedic Remedy:* ${activeHoroscope.remedy}\n\nRead full horoscope: ${shareUrl}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div lang={isHi ? "hi" : "en"} className="min-h-screen bg-[#FBF3E7] text-[#3B2A1E]">
      {/* Breadcrumb + URL Language Switcher & Moon Sign Bar */}
      <div className="border-b border-[#E8D8C3] bg-[#FFFDF9] px-4 py-3 text-xs text-[#6E5545]">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={baseHref}
              className="inline-flex items-center gap-1.5 font-bold text-[#7B2D26] hover:text-[#96372E] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>
                {isHi ? HOROSCOPE_UI_COPY.all12Rashis.hi : HOROSCOPE_UI_COPY.all12Rashis.en}
              </span>
            </Link>
            <Link
              href="/calculators/moon-sign"
              className="inline-flex items-center gap-1 rounded-full bg-[#E8A33D]/15 px-3 py-1 font-bold text-[#7B2D26] hover:bg-[#E8A33D]/25 transition-colors"
            >
              <HelpCircle className="h-3.5 w-3.5 text-[#C1662F]" />
              <span>
                {isHi
                  ? HOROSCOPE_UI_COPY.calculateMoonSignPrompt.hi
                  : HOROSCOPE_UI_COPY.calculateMoonSignPrompt.en}
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="font-mono text-[#C1662F] font-bold hidden sm:inline">
              {isHi ? activeHoroscope.formattedDateHindi : activeHoroscope.formattedDate}
            </span>
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366]/15 border border-[#25D366]/40 px-2.5 py-1 text-[11px] font-bold text-[#1B6E38] hover:bg-[#25D366]/25 transition-colors"
            >
              <Share2 className="h-3 w-3" />
              <span>
                {isHi
                  ? HOROSCOPE_UI_COPY.shareWhatsAppBtn.hi
                  : HOROSCOPE_UI_COPY.shareWhatsAppBtn.en}
              </span>
            </button>
            {/* URL-based SEO Language Switcher (/horoscope/[sign] <-> /hi/horoscope/[sign]) */}
            <div className="inline-flex rounded-lg border border-[#E8D8C3] bg-[#FBF3E7] p-0.5">
              <Link
                href={`/horoscope/${sign.id}`}
                onClick={() => setLang("en")}
                className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition-colors ${
                  !isHi ? "bg-[#7B2D26] text-[#FFFDF9]" : "text-[#6E5545] hover:text-[#3B2A1E]"
                }`}
              >
                English
              </Link>
              <Link
                href={`/hi/horoscope/${sign.id}`}
                onClick={() => setLang("hi")}
                className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition-colors ${
                  isHi ? "bg-[#7B2D26] text-[#FFFDF9]" : "text-[#6E5545] hover:text-[#3B2A1E]"
                }`}
              >
                हिन्दी
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <section className="border-b border-[#E8D8C3] bg-gradient-to-b from-[#7B2D26]/10 to-[#FBF3E7] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Explicit Vedic Chandra Rashi Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E8A33D]/60 bg-[#FFFDF9] px-3.5 py-1 text-xs font-bold text-[#7B2D26] mb-4">
            <DiyaIcon size={13} />
            <span>
              {isHi
                ? HOROSCOPE_UI_COPY.vedicMoonSignBadge.hi
                : HOROSCOPE_UI_COPY.vedicMoonSignBadge.en}
            </span>
          </div>

          <div className="flex items-center justify-center">
            <div className="inline-flex h-18 w-18 items-center justify-center rounded-3xl bg-[#7B2D26] text-4xl text-[#E8A33D] shadow-lg mb-3">
              {sign.symbol}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <h1 className="font-temple text-3xl sm:text-4xl font-bold text-[#7B2D26]">
              {isHi
                ? `${sign.hindiName} दैनिक राशिफल`
                : `${sign.englishName} (${sign.sanskritName}) Daily Horoscope`}
            </h1>
            <span className="rounded-full bg-[#E8A33D]/25 px-3 py-1 text-sm font-bold text-[#7B2D26]">
              {isHi ? sign.elementHindi : sign.hindiName}
            </span>
          </div>

          <p className="mt-2 text-xs sm:text-sm text-[#6E5545] font-medium">
            {isHi ? (
              <>
                तत्व: <strong className="text-[#3B2A1E]">{sign.elementHindi}</strong> | राशि स्वामी:{" "}
                <strong className="text-[#3B2A1E]">{sign.rulingPlanetHindi}</strong> | चन्द्र गोचर:{" "}
                <strong className="text-[#7B2D26]">{computedFacts.moonHouseNameHi}</strong>
              </>
            ) : (
              <>
                Element: <strong className="text-[#3B2A1E]">{sign.element}</strong> | Ruling Lord:{" "}
                <strong className="text-[#3B2A1E]">{sign.rulingPlanet}</strong> | Chandra Gochar:{" "}
                <strong className="text-[#7B2D26]">{computedFacts.moonHouseNameEn}</strong>
              </>
            )}
          </p>

          {/* Yesterday / Today / Tomorrow Tabs */}
          <div className="mt-6 inline-flex rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-1.5 shadow-xs">
            {(
              [
                {
                  key: "yesterday",
                  labelEn: HOROSCOPE_UI_COPY.yesterdayTab.en,
                  labelHi: HOROSCOPE_UI_COPY.yesterdayTab.hi,
                  sub: yesterday.date,
                },
                {
                  key: "today",
                  labelEn: HOROSCOPE_UI_COPY.todayTab.en,
                  labelHi: HOROSCOPE_UI_COPY.todayTab.hi,
                  sub: today.date,
                },
                {
                  key: "tomorrow",
                  labelEn: HOROSCOPE_UI_COPY.tomorrowTab.en,
                  labelHi: HOROSCOPE_UI_COPY.tomorrowTab.hi,
                  sub: tomorrow.date,
                },
              ] as const
            ).map((tab) => {
              const active = dayTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setDayTab(tab.key)}
                  className={`rounded-xl px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold transition-all ${
                    active
                      ? "bg-[#7B2D26] text-[#FFFDF9] shadow-sm"
                      : "text-[#6E5545] hover:text-[#3B2A1E] hover:bg-[#FBF3E7]"
                  }`}
                >
                  <div>{isHi ? tab.labelHi : tab.labelEn}</div>
                  <div
                    className={`text-[10px] font-mono ${
                      active ? "text-[#E8A33D]" : "text-[#6E5545]"
                    }`}
                  >
                    {tab.sub}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4">
            <p className="text-xs font-mono text-[#C1662F] bg-[#FFFDF9] inline-block border border-[#E8D8C3] px-3.5 py-1.5 rounded-full">
              {isHi ? activeHoroscope.planetaryTransitHindi : activeHoroscope.planetaryTransit}
            </p>
          </div>
        </div>
      </section>

      {/* Main Horoscope Content */}
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        {/* 1. Overview Section */}
        <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#7B2D26]">
              <Sparkles className="h-4 w-4 text-[#E8A33D]" />
              <span>
                {isHi
                  ? HOROSCOPE_UI_COPY.overviewSection.hi
                  : HOROSCOPE_UI_COPY.overviewSection.en}
              </span>
            </div>
            <span className="rounded-full bg-[#E8A33D]/15 px-3 py-1 text-xs font-bold text-[#7B2D26]">
              {isHi
                ? `चन्द्रबल: ${
                    computedFacts.moonHouseVerdict === "Favourable"
                      ? "शुभ (अनुकूल)"
                      : computedFacts.moonHouseVerdict === "Mixed"
                      ? "मिश्रित (मध्यम)"
                      : "सावधानी अपेक्षित"
                  }`
                : `Chandra Bala: ${computedFacts.moonHouseVerdict}`}
            </span>
          </div>

          <p className="text-base sm:text-lg text-[#3B2A1E] leading-relaxed font-medium">
            {isHi ? activeHoroscope.summaryHindi : activeHoroscope.summary}
          </p>
        </div>

        {/* 2. Expandable "Why this reading?" (Traceable Astronomical & Gochara Facts) */}
        <div className="rounded-2xl border border-[#C1662F]/40 bg-[#FFFDF9] overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => setWhyExpanded(!whyExpanded)}
            className="w-full flex items-center justify-between px-6 py-4 bg-[#7B2D26]/5 hover:bg-[#7B2D26]/10 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <Info className="h-5 w-5 text-[#7B2D26]" />
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#7B2D26]">
                  {isHi
                    ? HOROSCOPE_UI_COPY.whyThisReadingTitle.hi
                    : HOROSCOPE_UI_COPY.whyThisReadingTitle.en}
                </h2>
                <p className="text-xs text-[#6E5545]">
                  {isHi
                    ? `गोचरस्थ चन्द्र: ${computedFacts.transitingMoonRashiHi} (${sign.hindiName} से ${computedFacts.moonHouseFromRashi}वां भाव) • नक्षत्र: ${computedFacts.nakshatraHi} (चरण ${computedFacts.nakshatraPada}) • तिथि: ${computedFacts.pakshaHi} ${computedFacts.tithiHi}`
                    : `Transiting Moon: ${computedFacts.transitingMoonRashiEn} (${computedFacts.moonHouseFromRashi}H from ${sign.sanskritName}) • Nakshatra: ${computedFacts.nakshatraEn} (Pada ${computedFacts.nakshatraPada}) • Tithi: ${computedFacts.pakshaEn} ${computedFacts.tithiEn}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#7B2D26]">
              <span>{whyExpanded ? (isHi ? "छुपाएं" : "Hide") : isHi ? "विस्तार से देखें" : "View Facts"}</span>
              {whyExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </button>

          {whyExpanded && (
            <div className="p-6 space-y-5 border-t border-[#E8D8C3]">
              {/* Bullet list of computed facts */}
              <ul className="space-y-2 text-xs sm:text-sm text-[#3B2A1E]">
                {(isHi ? computedFacts.factsHi : computedFacts.factsEn).map((fact, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#C1662F] shrink-0" />
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>

              {/* 9-Planet Gochara Table */}
              <div className="overflow-x-auto rounded-xl border border-[#E8D8C3]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FBF3E7] text-[#7B2D26] border-b border-[#E8D8C3]">
                    <tr>
                      <th className="py-2.5 px-3 font-bold">{isHi ? "ग्रह" : "Planet (Graha)"}</th>
                      <th className="py-2.5 px-3 font-bold">{isHi ? "गोचर राशि (अंश)" : "Transit Sign (Deg)"}</th>
                      <th className="py-2.5 px-3 font-bold">
                        {isHi ? `${sign.hindiName} से भाव` : `House from ${sign.sanskritName}`}
                      </th>
                      <th className="py-2.5 px-3 font-bold">{isHi ? "अवस्था (वक्री/अस्त/वेध)" : "State (Vakri/Asta/Vedha)"}</th>
                      <th className="py-2.5 px-3 font-bold">{isHi ? "गोचर फल" : "Gochara Verdict"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8D8C3]">
                    {computedFacts.planetTransits.map((pt) => (
                      <tr key={pt.planet} className="hover:bg-[#FBF3E7]/50">
                        <td className="py-2 px-3 font-bold text-[#3B2A1E]">
                          {isHi ? pt.planetHi : `${pt.planet} (${pt.planetHi})`}
                        </td>
                        <td className="py-2 px-3 font-mono">
                          {isHi ? pt.signHi : pt.signEn} ({pt.degreeInSign}°)
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-[#7B2D26]">
                          {isHi ? `${pt.houseFromMoon}वां भाव` : `${pt.houseFromMoon}H`}
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex flex-wrap gap-1">
                            {pt.isRetrograde && pt.planet !== "Rahu" && pt.planet !== "Ketu" && (
                              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">
                                {isHi ? "वक्री" : "Retrograde (Vakri)"}
                              </span>
                            )}
                            {pt.isCombust && (
                              <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-900">
                                {isHi ? "अस्त" : "Combust (Asta)"}
                              </span>
                            )}
                            {pt.hasVedha && (
                              <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-900">
                                {isHi ? `${pt.vedhaByPlanetHi} से वेध` : `Vedha (${pt.vedhaByPlanet})`}
                              </span>
                            )}
                            {!pt.isRetrograde && !pt.isCombust && !pt.hasVedha && (
                              <span className="text-[#6E5545]">{isHi ? "मार्गी / सामान्य" : "Direct"}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                              pt.verdict === "Favourable"
                                ? "bg-emerald-100 text-emerald-900"
                                : pt.verdict === "Mixed"
                                ? "bg-amber-100 text-amber-900"
                                : "bg-rose-100 text-rose-900"
                            }`}
                          >
                            {pt.verdict === "Favourable" ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <AlertTriangle className="h-3 w-3" />
                            )}
                            {isHi
                              ? pt.verdict === "Favourable"
                                ? "शुभ"
                                : pt.verdict === "Mixed"
                                ? "मिश्रित"
                                : "सावधानी"
                              : pt.verdict}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* 3. Five Life Domains Grid: Career, Love, Health, Finance, Family */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DomainCard
            icon={<Briefcase className="h-4 w-4" />}
            titleEn={HOROSCOPE_UI_COPY.careerSection.en}
            titleHi={HOROSCOPE_UI_COPY.careerSection.hi}
            domain={activeHoroscope.career}
            isHi={isHi}
          />

          <DomainCard
            icon={<Heart className="h-4 w-4" />}
            titleEn={HOROSCOPE_UI_COPY.loveSection.en}
            titleHi={HOROSCOPE_UI_COPY.loveSection.hi}
            domain={activeHoroscope.love}
            isHi={isHi}
          />

          <DomainCard
            icon={<Activity className="h-4 w-4" />}
            titleEn={HOROSCOPE_UI_COPY.healthSection.en}
            titleHi={HOROSCOPE_UI_COPY.healthSection.hi}
            domain={activeHoroscope.health}
            isHi={isHi}
          />

          <DomainCard
            icon={<Coins className="h-4 w-4" />}
            titleEn={HOROSCOPE_UI_COPY.financeSection.en}
            titleHi={HOROSCOPE_UI_COPY.financeSection.hi}
            domain={activeHoroscope.finance}
            isHi={isHi}
          />

          <div className="md:col-span-2">
            <DomainCard
              icon={<Users className="h-4 w-4" />}
              titleEn={HOROSCOPE_UI_COPY.familySection.en}
              titleHi={HOROSCOPE_UI_COPY.familySection.hi}
              domain={activeHoroscope.family}
              isHi={isHi}
            />
          </div>
        </div>

        {/* 4. Lucky Colour, Lucky Number & Favourable Time Window */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-4 text-center">
            <span className="text-[11px] font-bold text-[#6E5545]">
              {isHi ? HOROSCOPE_UI_COPY.luckyColour.hi : HOROSCOPE_UI_COPY.luckyColour.en}
            </span>
            <p className="mt-1 font-bold text-sm text-[#7B2D26]">
              {isHi ? activeHoroscope.luckyColorHindi : activeHoroscope.luckyColor}
            </p>
          </div>
          <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-4 text-center">
            <span className="text-[11px] font-bold text-[#6E5545]">
              {isHi ? HOROSCOPE_UI_COPY.luckyNumber.hi : HOROSCOPE_UI_COPY.luckyNumber.en}
            </span>
            <p className="mt-1 font-mono font-black text-xl text-[#7B2D26]">
              {activeHoroscope.luckyNumber}
            </p>
          </div>
          <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-4 text-center">
            <span className="text-[11px] font-bold text-[#6E5545]">
              {isHi
                ? HOROSCOPE_UI_COPY.favourableWindow.hi
                : HOROSCOPE_UI_COPY.favourableWindow.en}
            </span>
            <p className="mt-1 font-mono font-bold text-xs text-[#6B8E5A]">
              {isHi ? activeHoroscope.auspiciousTimeHindi : activeHoroscope.auspiciousTime}
            </p>
          </div>
        </div>

        {/* 5. Vedic Remedy (Upay) & Vedic Mantra */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-[#E8A33D] bg-[#E8A33D]/10 p-6">
            <div className="flex items-center gap-2 text-xs font-bold text-[#7B2D26] mb-2">
              <DiyaIcon size={16} />
              <span>
                {isHi ? HOROSCOPE_UI_COPY.vedicRemedy.hi : HOROSCOPE_UI_COPY.vedicRemedy.en}
              </span>
            </div>
            <p className="text-sm text-[#3B2A1E] font-medium leading-relaxed">
              {isHi ? activeHoroscope.remedyHindi : activeHoroscope.remedy}
            </p>
          </div>

          <div className="rounded-2xl border border-[#7B2D26]/30 bg-[#FFFDF9] p-6">
            <div className="flex items-center gap-2 text-xs font-bold text-[#7B2D26] mb-2">
              <BookOpen className="h-4 w-4 text-[#C1662F]" />
              <span>
                {isHi ? HOROSCOPE_UI_COPY.vedicMantra.hi : HOROSCOPE_UI_COPY.vedicMantra.en}
              </span>
            </div>
            <p className="text-sm text-[#7B2D26] font-bold leading-relaxed">
              {isHi ? activeHoroscope.mantraHindi : activeHoroscope.mantra}
            </p>
          </div>
        </div>

        {/* Soft 50% Off First Consultation Call-to-Action Strip */}
        <div className="rounded-2xl border border-[#C1662F]/40 bg-[#FFFDF9] px-5 py-3.5 text-center shadow-xs">
          <Link
            href="/consult"
            className="text-xs sm:text-sm font-bold text-[#7B2D26] hover:text-[#96372E] transition-colors inline-flex items-center justify-center gap-2 flex-wrap"
          >
            <DiyaIcon size={15} />
            <span>
              {isHi
                ? HOROSCOPE_UI_COPY.softConsultNote.hi
                : HOROSCOPE_UI_COPY.softConsultNote.en}
            </span>
          </Link>
        </div>

        {/* Quick Switcher to Other 11 Rashis */}
        <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5">
          <h3 className="text-xs font-bold text-[#6E5545] mb-3">
            {isHi
              ? HOROSCOPE_UI_COPY.switchRashiHeading.hi
              : HOROSCOPE_UI_COPY.switchRashiHeading.en}
          </h3>
          <div className="flex flex-wrap gap-2">
            {ZODIAC_SIGNS.map((s) => (
              <Link
                key={s.id}
                href={`${baseHref}/${s.id}`}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                  s.id === sign.id
                    ? "bg-[#7B2D26] text-[#FFFDF9]"
                    : "border border-[#E8D8C3] bg-[#FBF3E7] text-[#3B2A1E] hover:border-[#C1662F]"
                }`}
              >
                <span>{s.symbol}</span>
                <span>{isHi ? s.hindiName : s.englishName}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Consultation Banner */}
        <div className="rounded-3xl border border-[#7B2D26] bg-[#7B2D26] p-8 text-center text-[#FBF3E7] shadow-xl">
          <h3 className="font-temple text-xl sm:text-2xl font-bold">
            {isHi
              ? `${sign.hindiName} राशि के लिए अपनी जन्म कुंडली की महादशा एवं गोचर का व्यक्तिगत विश्लेषण चाहते हैं?`
              : `Want Personalised Janam Kundli & Mahadasha Analysis for ${sign.englishName}?`}
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-[#FBF3E7]/85 max-w-xl mx-auto leading-relaxed">
            {isHi
              ? `चन्द्र राशिफल सामान्य गोचर पर आधारित है। अपने विवाह, करियर, व्यापार और सटीक उपायों के लिए ${astrologerName} जी से सीधा परामर्श लें।`
              : `Daily Chandra Rashi readings reflect planetary transits from your Moon sign. For exact Dasha timing and personal remedies, consult directly with ${astrologerName}.`}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/consult"
              className="inline-flex items-center gap-2 rounded-xl bg-[#E8A33D] px-6 py-3 text-xs font-bold text-[#3B2A1E] hover:bg-[#D5912C] transition-all shadow-md"
            >
              <PhoneCall className="h-4 w-4" />
              <span>{isHi ? "आचार्य जी से परामर्श करें" : "Consult Acharya Ji Live"}</span>
            </Link>
            <Link
              href="/calculators/moon-sign"
              className="inline-flex items-center gap-2 rounded-xl border border-[#FBF3E7]/30 bg-[#FFFDF9]/10 px-6 py-3 text-xs font-bold text-[#FBF3E7] hover:bg-[#FFFDF9]/20 transition-all"
            >
              <Compass className="h-4 w-4" />
              <span>{isHi ? "चन्द्र राशि कैलकुलेटर" : "Moon Sign Calculator"}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function DomainCard({
  icon,
  titleEn,
  titleHi,
  domain,
  isHi,
}: {
  icon: React.ReactNode;
  titleEn: string;
  titleHi: string;
  domain: DailyHoroscope["love"];
  isHi: boolean;
}) {
  const factors = isHi ? domain.factorsHi : domain.factorsEn;
  return (
    <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7B2D26]/10 text-[#7B2D26]">
              {icon}
            </div>
            <h2 className="font-bold text-sm text-[#7B2D26]">{isHi ? titleHi : titleEn}</h2>
          </div>
          <span className="rounded-full bg-[#6B8E5A]/15 px-2.5 py-0.5 font-mono text-xs font-bold text-[#4B6B3B]">
            {domain.score}/100
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[#3B2A1E] leading-relaxed">
          {isHi ? domain.descriptionHindi : domain.description}
        </p>
      </div>

      {factors && factors.length > 0 && (
        <div className="mt-4 pt-3 border-t border-[#E8D8C3]/60">
          <p className="text-[11px] font-mono text-[#6E5545]">
            {factors.slice(0, 2).join(" • ")}
          </p>
        </div>
      )}
    </div>
  );
}
