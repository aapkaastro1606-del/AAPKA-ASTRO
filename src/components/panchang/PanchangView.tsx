"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getPanchangForCity, CITIES_LIST } from "@/lib/store/panchangStore";
import { PANCHANG_UI_COPY } from "@/lib/i18n/vedicGlossary";
import { useLanguage } from "@/context/LanguageContext";
import { DiyaIcon } from "@/components/ui/DiyaIcon";
import {
  Sun,
  Moon,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Compass,
  MapPin,
  PhoneCall,
} from "lucide-react";

interface PanchangViewProps {
  defaultLocale: "en" | "hi";
  initialCityId?: string;
  initialDateStr?: string;
}

export function PanchangView({
  defaultLocale,
  initialCityId = "delhi",
  initialDateStr,
}: PanchangViewProps) {
  const { setLang } = useLanguage();
  const isHi = defaultLocale === "hi";

  useEffect(() => {
    setLang(defaultLocale);
  }, [defaultLocale, setLang]);

  const todayIso =
    initialDateStr ||
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

  const [selectedCity, setSelectedCity] = useState(initialCityId);
  const [selectedDate, setSelectedDate] = useState(todayIso);

  const shiftDate = (days: number) => {
    const [y, m, d] = selectedDate.split("-").map(Number);
    const nextUtc = new Date(Date.UTC(y, m - 1, d + days, 12, 0, 0));
    setSelectedDate(nextUtc.toISOString().split("T")[0]);
  };

  const panchang = getPanchangForCity(selectedCity, selectedDate);
  const t = (key: keyof typeof PANCHANG_UI_COPY) =>
    isHi ? PANCHANG_UI_COPY[key].hi : PANCHANG_UI_COPY[key].en;

  return (
    <div lang={isHi ? "hi" : "en"} className="min-h-screen bg-[#FBF3E7] text-[#3B2A1E]">
      {/* 1. Top Header & Controls */}
      <section className="border-b border-[#E8D8C3] bg-[#7B2D26] py-12 sm:py-16 text-[#FBF3E7]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Top bar: Badge + URL Language Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E8A33D]/40 bg-[#64221C] px-4 py-1.5 text-xs font-bold text-[#E8A33D]">
              <DiyaIcon size={14} />
              <span>{t("pageBadge")}</span>
            </div>

            {/* URL-based SEO Language Switcher (/panchang <-> /hi/panchang) */}
            <div className="inline-flex rounded-xl border border-[#E8A33D]/40 bg-[#64221C] p-1">
              <Link
                href="/panchang"
                onClick={() => setLang("en")}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-colors ${
                  !isHi
                    ? "bg-[#E8A33D] text-[#3B2A1E]"
                    : "text-[#FBF3E7]/80 hover:text-[#FBF3E7]"
                }`}
              >
                English
              </Link>
              <Link
                href="/hi/panchang"
                onClick={() => setLang("hi")}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-colors ${
                  isHi
                    ? "bg-[#E8A33D] text-[#3B2A1E]"
                    : "text-[#FBF3E7]/80 hover:text-[#FBF3E7]"
                }`}
              >
                हिन्दी
              </Link>
            </div>
          </div>

          <div className="text-center">
            <h1 className="font-temple text-3xl sm:text-5xl font-bold text-[#FBF3E7]">
              {t("pageTitle")}
            </h1>

            <p className="mt-3 text-sm sm:text-base text-[#E8A33D] font-bold">
              {isHi ? panchang.dateHindi : panchang.date} •{" "}
              {isHi ? panchang.samvatHindi : panchang.samvat}
            </p>

            <p className="mt-2 text-xs sm:text-sm text-[#FBF3E7]/85 max-w-2xl mx-auto">
              {t("pageSubtitle")}
            </p>

            {/* Location & Date Selector Strip */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              {/* City Picker */}
              <div className="inline-flex items-center gap-2 rounded-2xl bg-[#FFFDF9] px-4 py-2.5 text-xs font-bold text-[#3B2A1E] shadow-md">
                <MapPin className="h-4 w-4 text-[#C1662F]" />
                <span>{t("selectLocation")}</span>
                <select
                  aria-label={t("selectLocation")}
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-transparent font-bold text-[#7B2D26] focus:outline-none cursor-pointer"
                >
                  {CITIES_LIST.map((city) => (
                    <option key={city.id} value={city.id} className="text-[#3B2A1E]">
                      {isHi
                        ? `${city.nameHindi} (${city.stateHindi})`
                        : `${city.name} (${city.state})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Navigation */}
              <div className="inline-flex flex-wrap items-center gap-1.5 rounded-2xl bg-[#FFFDF9] p-1.5 text-xs font-bold text-[#3B2A1E] shadow-md">
                <button
                  type="button"
                  onClick={() => shiftDate(-1)}
                  className="rounded-xl px-3 py-1.5 text-[#7B2D26] hover:bg-[#FBF3E7] transition-colors"
                >
                  {t("prevDay")}
                </button>
                <div className="flex items-center gap-1.5 px-2">
                  <Calendar className="h-3.5 w-3.5 text-[#C1662F]" />
                  <input
                    type="date"
                    aria-label={t("selectDate")}
                    value={selectedDate}
                    onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                    className="bg-transparent font-mono font-bold text-[#3B2A1E] focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDate(todayIso)}
                  className="rounded-xl bg-[#E8A33D]/20 px-2.5 py-1.5 text-[#7B2D26] hover:bg-[#E8A33D]/35 transition-colors"
                >
                  {t("todayBtn")}
                </button>
                <button
                  type="button"
                  onClick={() => shiftDate(1)}
                  className="rounded-xl px-3 py-1.5 text-[#7B2D26] hover:bg-[#FBF3E7] transition-colors"
                >
                  {t("nextDay")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Panchang Content */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-10">
          {/* Solar & Lunar Rise/Set + Rashi Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-4 shadow-xs text-center">
              <Sun className="h-5 w-5 text-[#E8A33D] mx-auto mb-1.5" />
              <div className="text-xs font-bold text-[#6E5545]">{t("sunrise")}</div>
              <div className="mt-1 font-mono text-sm sm:text-base font-bold text-[#7B2D26]">
                {isHi ? panchang.sunTimes.sunriseHindi : panchang.sunTimes.sunrise}
              </div>
            </div>

            <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-4 shadow-xs text-center">
              <Sun className="h-5 w-5 text-[#C1662F] mx-auto mb-1.5" />
              <div className="text-xs font-bold text-[#6E5545]">{t("sunset")}</div>
              <div className="mt-1 font-mono text-sm sm:text-base font-bold text-[#7B2D26]">
                {isHi ? panchang.sunTimes.sunsetHindi : panchang.sunTimes.sunset}
              </div>
            </div>

            <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-4 shadow-xs text-center">
              <Moon className="h-5 w-5 text-[#7B2D26] mx-auto mb-1.5" />
              <div className="text-xs font-bold text-[#6E5545]">{t("moonrise")}</div>
              <div className="mt-1 font-mono text-xs sm:text-sm font-bold text-[#7B2D26]">
                {isHi ? panchang.moonTimes.moonriseHindi : panchang.moonTimes.moonrise}
              </div>
            </div>

            <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-4 shadow-xs text-center">
              <Moon className="h-5 w-5 text-[#6E5545] mx-auto mb-1.5" />
              <div className="text-xs font-bold text-[#6E5545]">{t("moonset")}</div>
              <div className="mt-1 font-mono text-xs sm:text-sm font-bold text-[#7B2D26]">
                {isHi ? panchang.moonTimes.moonsetHindi : panchang.moonTimes.moonset}
              </div>
            </div>

            <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-4 shadow-xs text-center">
              <Compass className="h-5 w-5 text-[#6B8E5A] mx-auto mb-1.5" />
              <div className="text-xs font-bold text-[#6E5545]">{t("moonSign")}</div>
              <div className="mt-1 text-xs sm:text-sm font-bold text-[#3B2A1E]">
                {isHi ? panchang.moonTimes.moonSignHindi : panchang.moonTimes.moonSign}
              </div>
              <div className="mt-0.5 text-[10px] text-[#C1662F]">
                {isHi ? panchang.moonTimes.moonSignChangeHindi : panchang.moonTimes.moonSignChange}
              </div>
            </div>

            <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-4 shadow-xs text-center">
              <Sun className="h-5 w-5 text-[#7B2D26] mx-auto mb-1.5" />
              <div className="text-xs font-bold text-[#6E5545]">{t("sunSign")}</div>
              <div className="mt-1 text-xs sm:text-sm font-bold text-[#3B2A1E]">
                {isHi ? panchang.sunTimes.sunSignHindi : panchang.sunTimes.sunSign}
              </div>
              <div className="mt-0.5 text-[10px] text-[#6E5545]">
                {t("dishaShool")}:{" "}
                {isHi
                  ? panchang.varaDetails?.dishaShoolHindi
                  : panchang.varaDetails?.dishaShool}
              </div>
            </div>
          </div>

          {/* Hindu Calendar Context (Samvats, Amanta & Purnimanta Masa, Ritu, Ayana) */}
          {panchang.samvatDetails && (
            <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 shadow-xs">
              <h2 className="font-temple text-lg sm:text-xl font-bold text-[#7B2D26] mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#C1662F]" />
                <span>{t("samvatHeader")}</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
                <div className="rounded-xl bg-[#FBF3E7] p-3">
                  <div className="text-[#6E5545] font-bold">{t("vikramSamvat")}</div>
                  <div className="mt-1 font-bold text-[#3B2A1E]">
                    {panchang.samvatDetails.vikramSamvat} (
                    {isHi
                      ? panchang.samvatDetails.samvatsaraNameHi
                      : panchang.samvatDetails.samvatsaraNameEn}
                    )
                  </div>
                </div>
                <div className="rounded-xl bg-[#FBF3E7] p-3">
                  <div className="text-[#6E5545] font-bold">{t("shakaSamvat")}</div>
                  <div className="mt-1 font-bold text-[#3B2A1E]">
                    {panchang.samvatDetails.shakaSamvat}
                  </div>
                </div>
                <div className="rounded-xl bg-[#FBF3E7] p-3">
                  <div className="text-[#6E5545] font-bold">{t("amantaMasa")}</div>
                  <div className="mt-1 font-bold text-[#7B2D26]">
                    {isHi ? panchang.samvatDetails.amantaMasaHi : panchang.samvatDetails.amantaMasaEn}
                  </div>
                </div>
                <div className="rounded-xl bg-[#FBF3E7] p-3">
                  <div className="text-[#6E5545] font-bold">{t("purnimantaMasa")}</div>
                  <div className="mt-1 font-bold text-[#7B2D26]">
                    {isHi
                      ? panchang.samvatDetails.purnimantaMasaHi
                      : panchang.samvatDetails.purnimantaMasaEn}
                  </div>
                </div>
                <div className="rounded-xl bg-[#FBF3E7] p-3">
                  <div className="text-[#6E5545] font-bold">{t("ritu")}</div>
                  <div className="mt-1 font-bold text-[#3B2A1E]">
                    {isHi ? panchang.samvatDetails.rituHi : panchang.samvatDetails.rituEn}
                  </div>
                </div>
                <div className="rounded-xl bg-[#FBF3E7] p-3">
                  <div className="text-[#6E5545] font-bold">{t("ayana")}</div>
                  <div className="mt-1 font-bold text-[#3B2A1E]">
                    {isHi ? panchang.samvatDetails.ayanaHi : panchang.samvatDetails.ayanaEn}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* The Five Sacred Limbs (Pancha Anga) */}
          <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-xs">
            <h2 className="font-temple text-xl sm:text-2xl font-bold text-[#7B2D26] mb-6 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#E8A33D]" />
              <span>{t("fiveLimbsTitle")}</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* 1. Tithi */}
              <div className="rounded-2xl border border-[#E8D8C3] bg-[#FBF3E7] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#C1662F]">1. {t("tithi")}</span>
                  <span className="rounded bg-[#7B2D26]/10 px-2 py-0.5 text-[11px] font-bold text-[#7B2D26]">
                    {isHi ? panchang.tithi.pakshaHindi : panchang.tithi.paksha}
                  </span>
                </div>
                <div className="mt-2 font-temple text-xl font-bold text-[#7B2D26]">
                  {isHi ? panchang.tithi.nameHindi : panchang.tithi.name}
                </div>
                <p className="mt-1.5 text-xs text-[#3B2A1E]">
                  {t("endsAt")}:{" "}
                  <strong>{isHi ? panchang.tithi.endsAtHindi : panchang.tithi.endsAt}</strong>
                </p>
                {panchang.tithi.nextTithi && (
                  <p className="mt-1 text-xs text-[#6E5545]">
                    {t("nextElement")}:{" "}
                    <strong>
                      {isHi ? panchang.tithi.nextTithiHindi : panchang.tithi.nextTithi}
                    </strong>
                  </p>
                )}
                {panchang.tithi.anomaly && panchang.tithi.anomaly !== "None" && (
                  <p className="mt-2 rounded-lg bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-900">
                    {isHi ? panchang.tithi.anomalyNoteHi : panchang.tithi.anomalyNoteEn}
                  </p>
                )}
              </div>

              {/* 2. Vara (Weekday) */}
              <div className="rounded-2xl border border-[#E8D8C3] bg-[#FBF3E7] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#C1662F]">2. {t("vara")}</span>
                  <span className="rounded bg-[#7B2D26]/10 px-2 py-0.5 text-[11px] font-bold text-[#7B2D26]">
                    {t("rulingLord")}:{" "}
                    {isHi ? panchang.varaDetails?.lordHindi : panchang.varaDetails?.lord}
                  </span>
                </div>
                <div className="mt-2 font-temple text-xl font-bold text-[#7B2D26]">
                  {isHi ? panchang.varaDetails?.nameHindi : panchang.varaDetails?.name}
                </div>
                <p className="mt-1.5 text-xs text-[#6E5545]">
                  {t("dishaShool")}:{" "}
                  <strong>
                    {isHi
                      ? panchang.varaDetails?.dishaShoolHindi
                      : panchang.varaDetails?.dishaShool}
                  </strong>
                </p>
              </div>

              {/* 3. Nakshatra */}
              <div className="rounded-2xl border border-[#E8D8C3] bg-[#FBF3E7] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#C1662F]">3. {t("nakshatra")}</span>
                  <span className="rounded bg-[#7B2D26]/10 px-2 py-0.5 text-[11px] font-bold text-[#7B2D26]">
                    {t("pada")} {panchang.nakshatra.pada}
                  </span>
                </div>
                <div className="mt-2 font-temple text-xl font-bold text-[#7B2D26]">
                  {isHi ? panchang.nakshatra.nameHindi : panchang.nakshatra.name}
                </div>
                <p className="mt-1.5 text-xs text-[#3B2A1E]">
                  {t("rulingLord")}:{" "}
                  <strong>
                    {isHi ? panchang.nakshatra.lordHindi : panchang.nakshatra.lord}
                  </strong>{" "}
                  • {t("endsAt")}:{" "}
                  <strong>
                    {isHi ? panchang.nakshatra.endsAtHindi : panchang.nakshatra.endsAt}
                  </strong>
                </p>
                {panchang.nakshatra.nextNakshatra && (
                  <p className="mt-1 text-xs text-[#6E5545]">
                    {t("nextElement")}:{" "}
                    <strong>
                      {isHi
                        ? panchang.nakshatra.nextNakshatraHindi
                        : panchang.nakshatra.nextNakshatra}
                    </strong>
                  </p>
                )}
              </div>

              {/* 4. Yoga */}
              <div className="rounded-2xl border border-[#E8D8C3] bg-[#FBF3E7] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#C1662F]">4. {t("yoga")}</span>
                </div>
                <div className="mt-2 font-temple text-xl font-bold text-[#7B2D26]">
                  {isHi ? panchang.yoga.nameHindi : panchang.yoga.name}
                </div>
                <p className="mt-1.5 text-xs text-[#3B2A1E]">
                  {t("endsAt")}:{" "}
                  <strong>{isHi ? panchang.yoga.endsAtHindi : panchang.yoga.endsAt}</strong>
                </p>
                {panchang.yoga.nextYoga && (
                  <p className="mt-1 text-xs text-[#6E5545]">
                    {t("nextElement")}:{" "}
                    <strong>
                      {isHi ? panchang.yoga.nextYogaHindi : panchang.yoga.nextYoga}
                    </strong>
                  </p>
                )}
              </div>

              {/* 5. Karana */}
              <div className="rounded-2xl border border-[#E8D8C3] bg-[#FBF3E7] p-5 md:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#C1662F]">5. {t("karana")}</span>
                  <span className="rounded bg-[#7B2D26]/10 px-2 py-0.5 text-[11px] font-bold text-[#7B2D26]">
                    {isHi
                      ? panchang.karana.type === "Chara"
                        ? "चर करण"
                        : "स्थिर करण"
                      : panchang.karana.type}
                  </span>
                </div>
                <div className="mt-2 font-temple text-xl font-bold text-[#7B2D26]">
                  {isHi ? panchang.karana.nameHindi : panchang.karana.name}
                </div>
                <p className="mt-1.5 text-xs text-[#3B2A1E]">
                  {t("endsAt")}:{" "}
                  <strong>{isHi ? panchang.karana.endsAtHindi : panchang.karana.endsAt}</strong>
                  {panchang.karana.secondKarana && (
                    <>
                      {" "}
                      • {t("nextElement")}:{" "}
                      <strong>
                        {isHi
                          ? panchang.karana.secondKaranaHindi
                          : panchang.karana.secondKarana}
                      </strong>{" "}
                      ({isHi ? panchang.karana.secondEndsAtHindi : panchang.karana.secondEndsAt})
                    </>
                  )}
                </p>
                {panchang.karana.bhadraTiming && (
                  <p className="mt-1.5 text-xs font-bold text-[#96372E]">
                    {t("bhadra")}:{" "}
                    {isHi ? panchang.karana.bhadraTimingHindi : panchang.karana.bhadraTiming}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Auspicious & Inauspicious Timings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Auspicious */}
            <div className="rounded-3xl border border-[#6B8E5A]/40 bg-[#FFFDF9] p-6 shadow-xs">
              <div className="flex items-center gap-2 text-lg font-bold text-[#6B8E5A] mb-4">
                <CheckCircle2 className="h-5 w-5" />
                <h3 className="font-temple">{t("auspiciousTitle")}</h3>
              </div>
              <div className="space-y-3 text-xs sm:text-sm">
                {[
                  {
                    label: t("abhijitMuhurat"),
                    val: isHi
                      ? panchang.auspiciousTimings.abhijitMuhuratHindi
                      : panchang.auspiciousTimings.abhijitMuhurat,
                  },
                  {
                    label: t("amritKaal"),
                    val: isHi
                      ? panchang.auspiciousTimings.amritKaalHindi
                      : panchang.auspiciousTimings.amritKaal,
                  },
                  {
                    label: t("brahmaMuhurat"),
                    val: isHi
                      ? panchang.auspiciousTimings.brahmaMuhuratHindi
                      : panchang.auspiciousTimings.brahmaMuhurat,
                  },
                  {
                    label: t("vijayaMuhurat"),
                    val: isHi
                      ? panchang.auspiciousTimings.vijayaMuhuratHindi
                      : panchang.auspiciousTimings.vijayaMuhurat,
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between rounded-xl bg-[#EDF3EB] p-3.5"
                  >
                    <span className="font-bold text-[#3B2A1E]">{row.label}</span>
                    <span className="font-mono font-bold text-[#4B6B3B]">{row.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Inauspicious */}
            <div className="rounded-3xl border border-[#C1662F]/40 bg-[#FFFDF9] p-6 shadow-xs">
              <div className="flex items-center gap-2 text-lg font-bold text-[#96372E] mb-4">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="font-temple">{t("inauspiciousTitle")}</h3>
              </div>
              <div className="space-y-3 text-xs sm:text-sm">
                {[
                  {
                    label: t("rahuKaal"),
                    val: isHi
                      ? panchang.inauspiciousTimings.rahuKaalHindi
                      : panchang.inauspiciousTimings.rahuKaal,
                  },
                  {
                    label: t("yamaganda"),
                    val: isHi
                      ? panchang.inauspiciousTimings.yamagandaHindi
                      : panchang.inauspiciousTimings.yamaganda,
                  },
                  {
                    label: t("gulikaKaal"),
                    val: isHi
                      ? panchang.inauspiciousTimings.gulikaKaalHindi
                      : panchang.inauspiciousTimings.gulikaKaal,
                  },
                  {
                    label: t("durMuhurat"),
                    val: isHi
                      ? panchang.inauspiciousTimings.durMuhuratHindi
                      : panchang.inauspiciousTimings.durMuhurat,
                  },
                  {
                    label: t("varjyam"),
                    val: isHi
                      ? panchang.inauspiciousTimings.varjyamHindi
                      : panchang.inauspiciousTimings.varjyam,
                  },
                  {
                    label: t("bhadra"),
                    val: isHi
                      ? panchang.inauspiciousTimings.bhadraHindi
                      : panchang.inauspiciousTimings.bhadra,
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between rounded-xl bg-[#7B2D26]/5 p-3"
                  >
                    <span className="font-bold text-[#3B2A1E]">{row.label}</span>
                    <span className="font-mono font-bold text-[#7B2D26] text-right">{row.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Day & Night Choghadiya Table */}
          {panchang.choghadiya && (
            <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-xs">
              <h2 className="font-temple text-xl sm:text-2xl font-bold text-[#7B2D26] mb-6 flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#C1662F]" />
                <span>{t("choghadiyaTitle")}</span>
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Day Choghadiya */}
                <div>
                  <h3 className="text-sm font-bold text-[#7B2D26] mb-3">{t("dayChoghadiya")}</h3>
                  <div className="space-y-2">
                    {panchang.choghadiya.day.map((slot, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs ${
                          slot.auspicious
                            ? "bg-emerald-50/80 border border-emerald-200"
                            : "bg-amber-50/60 border border-amber-200/70"
                        }`}
                      >
                        <div>
                          <span className="font-bold text-[#3B2A1E]">
                            {isHi ? slot.nameHindi : `${slot.name} (${slot.nameHindi})`}
                          </span>
                          <span className="ml-2 text-[#6E5545]">
                            ({isHi ? slot.natureHi : slot.natureEn})
                          </span>
                        </div>
                        <span className="font-mono font-bold text-[#7B2D26]">
                          {isHi ? slot.periodHindi : slot.period}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Night Choghadiya */}
                <div>
                  <h3 className="text-sm font-bold text-[#7B2D26] mb-3">{t("nightChoghadiya")}</h3>
                  <div className="space-y-2">
                    {panchang.choghadiya.night.map((slot, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs ${
                          slot.auspicious
                            ? "bg-emerald-50/80 border border-emerald-200"
                            : "bg-amber-50/60 border border-amber-200/70"
                        }`}
                      >
                        <div>
                          <span className="font-bold text-[#3B2A1E]">
                            {isHi ? slot.nameHindi : `${slot.name} (${slot.nameHindi})`}
                          </span>
                          <span className="ml-2 text-[#6E5545]">
                            ({isHi ? slot.natureHi : slot.natureEn})
                          </span>
                        </div>
                        <span className="font-mono font-bold text-[#7B2D26]">
                          {isHi ? slot.periodHindi : slot.period}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 12-Rashi Chandrabalam Grid */}
          {panchang.chandrabalam && (
            <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-xs">
              <h2 className="font-temple text-xl sm:text-2xl font-bold text-[#7B2D26] mb-5">
                {t("chandrabalamTitle")}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {panchang.chandrabalam.map((cb) => (
                  <Link
                    key={cb.rashiId}
                    href={isHi ? `/hi/horoscope/${cb.rashiId}` : `/horoscope/${cb.rashiId}`}
                    className={`rounded-xl border p-3 text-xs transition-transform hover:-translate-y-0.5 ${
                      cb.status === "Favourable"
                        ? "border-emerald-200 bg-emerald-50/60"
                        : cb.status === "Moderate"
                        ? "border-amber-200 bg-amber-50/60"
                        : "border-rose-200 bg-rose-50/60"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-[#3B2A1E]">
                      <span>{isHi ? cb.rashiHi : cb.rashiEn}</span>
                      <span className="text-[11px] text-[#7B2D26]">
                        {isHi ? cb.statusHi : cb.status}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-[#6E5545]">
                      {isHi ? cb.noteHi : cb.noteEn}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Today's Festivals & Vrats (Single Source of Truth) */}
          <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-xs">
            <h2 className="font-temple text-xl sm:text-2xl font-bold text-[#7B2D26] mb-4">
              {t("festivalsTitle")}
            </h2>
            {panchang.festivals && panchang.festivals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {panchang.festivals.map((f) => (
                  <div
                    key={f.id}
                    className="rounded-2xl border border-[#E8A33D]/50 bg-[#FBF3E7] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-[#7B2D26]">
                        {isHi ? f.nameHindi : f.name}
                      </h3>
                      <span className="rounded-full bg-[#E8A33D]/20 px-2.5 py-0.5 text-[11px] font-bold text-[#7B2D26]">
                        {isHi ? f.categoryHindi : f.category}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-[#3B2A1E] leading-relaxed">
                      {isHi ? f.descriptionHindi : f.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-[#6E5545]">{t("noFestivalsToday")}</p>
            )}
          </div>

          {/* Consultation CTA */}
          <div className="rounded-3xl bg-[#7B2D26] p-8 sm:p-10 text-center text-[#FBF3E7] shadow-xl">
            <h2 className="font-temple text-2xl sm:text-3xl font-bold">
              {t("consultBannerTitle")}
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-[#FBF3E7]/85 max-w-2xl mx-auto leading-relaxed">
              {t("consultBannerSub")}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link
                href="/consult"
                className="inline-flex items-center gap-2 rounded-xl bg-[#E8A33D] px-6 py-3 text-xs sm:text-sm font-bold text-[#3B2A1E] hover:bg-[#D5912C] transition-all shadow-md"
              >
                <PhoneCall className="h-4 w-4" />
                <span>{t("consultCta")}</span>
              </Link>
              <Link
                href={isHi ? "/hi/horoscope" : "/horoscope"}
                className="inline-flex items-center gap-2 rounded-xl border border-[#FBF3E7]/30 bg-[#FFFDF9]/10 px-6 py-3 text-xs sm:text-sm font-bold text-[#FBF3E7] hover:bg-[#FFFDF9]/20 transition-all"
              >
                <Compass className="h-4 w-4" />
                <span>{t("horoscopeLinkCta")}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
