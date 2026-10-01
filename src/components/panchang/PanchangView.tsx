"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  getPanchangForCity,
  CITIES_LIST,
  DailyPanchang,
  CustomPanchangLocation,
} from "@/lib/store/panchangStore";
import { LocationService, LocationResult } from "@/lib/services/locationService";
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
  Share2,
  Navigation,
  Search,
} from "lucide-react";

interface PanchangViewProps {
  defaultLocale: "en" | "hi";
  initialCityId?: string;
  initialDateStr?: string;
  initialPanchang?: DailyPanchang;
  isTomorrowRoute?: boolean;
}

const STORAGE_LOCATION_KEY = "aapka_astro_panchang_location_v1";

const CHOGHADIYA_COLOR_MAP: Record<string, { bg: string; border: string; label: string }> = {
  Amrit: { bg: "#10b981", border: "#059669", label: "#065f46" },
  Shubh: { bg: "#22c55e", border: "#16a34a", label: "#14532d" },
  Labh: { bg: "#14b8a6", border: "#0d9488", label: "#134e4a" },
  Char: { bg: "#0ea5e9", border: "#0284c7", label: "#0c4a6e" },
  Udveg: { bg: "#f97316", border: "#ea580c", label: "#7c2d12" },
  Rog: { bg: "#f43f5e", border: "#e11d48", label: "#881337" },
  Kaal: { bg: "#991b1b", border: "#7f1d1d", label: "#450a0a" },
};

export function PanchangView({
  defaultLocale,
  initialCityId = "delhi",
  initialDateStr,
  initialPanchang,
  isTomorrowRoute = false,
}: PanchangViewProps) {
  const { setLang } = useLanguage();
  const isHi = defaultLocale === "hi";

  useEffect(() => {
    setLang(defaultLocale);
  }, [defaultLocale, setLang]);

  const defaultDateIso = useMemo(() => {
    if (initialDateStr) return initialDateStr;
    const base = new Date();
    if (isTomorrowRoute) {
      base.setDate(base.getDate() + 1);
    }
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(base);
  }, [initialDateStr, isTomorrowRoute]);

  const [selectedCityOrCustom, setSelectedCityOrCustom] = useState<
    string | CustomPanchangLocation
  >(initialCityId);
  const [selectedDate, setSelectedDate] = useState<string>(defaultDateIso);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [hadCalculationError, setHadCalculationError] = useState<boolean>(false);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  // Restore saved location from localStorage on client mount (without any silent geolocation tracking)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_LOCATION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed === "string" || (parsed && typeof parsed.lat === "number")) {
          setSelectedCityOrCustom(parsed);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Update "now" marker every 60s
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  // Worldwide city search via LocationService
  useEffect(() => {
    let active = true;
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    LocationService.search(q, 8)
      .then((res) => {
        if (active) {
          setSearchResults(res);
          setIsSearching(false);
        }
      })
      .catch(() => {
        if (active) setIsSearching(false);
      });
    return () => {
      active = false;
    };
  }, [searchQuery]);

  const saveLocationSelection = (loc: string | CustomPanchangLocation) => {
    setSelectedCityOrCustom(loc);
    try {
      localStorage.setItem(STORAGE_LOCATION_KEY, JSON.stringify(loc));
    } catch {
      // Ignore
    }
  };

  // Explicit click-only browser geolocation
  const handleUseMyLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const resolved = await LocationService.reverseGeocode(
            pos.coords.latitude,
            pos.coords.longitude
          );
          const customLoc: CustomPanchangLocation = {
            id: resolved.id,
            name: resolved.name,
            nameHindi: resolved.name,
            state: resolved.state || resolved.country,
            stateHindi: resolved.state || resolved.country,
            lat: resolved.latitude,
            lon: resolved.longitude,
            timeZone:
              resolved.timezoneId ||
              Intl.DateTimeFormat().resolvedOptions().timeZone ||
              "Asia/Kolkata",
          };
          saveLocationSelection(customLoc);
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };

  const shiftDate = (days: number) => {
    const [y, m, d] = selectedDate.split("-").map(Number);
    const nextUtc = new Date(Date.UTC(y, m - 1, d + days, 12, 0, 0));
    setSelectedDate(nextUtc.toISOString().split("T")[0]);
  };

  // Resilient computation with lastGoodPanchang fallback so page never breaks or renders blank
  const lastGoodPanchangRef = useRef<DailyPanchang>(
    initialPanchang || getPanchangForCity("delhi", defaultDateIso)
  );

  const panchang: DailyPanchang = useMemo(() => {
    try {
      const computed = getPanchangForCity(selectedCityOrCustom, selectedDate);
      lastGoodPanchangRef.current = computed;
      setHadCalculationError(false);
      return computed;
    } catch {
      setHadCalculationError(true);
      return lastGoodPanchangRef.current;
    }
  }, [selectedCityOrCustom, selectedDate]);

  const t = (key: keyof typeof PANCHANG_UI_COPY) =>
    isHi ? PANCHANG_UI_COPY[key].hi : PANCHANG_UI_COPY[key].en;

  // Compute current position along the 24-Hour Timeline Bar
  const timelineState = useMemo(() => {
    const tl = panchang.timeline24h;
    if (!tl) return null;

    // If viewing another date, project current time-of-day onto that date's sunrise..nextSunrise window
    let probeMs = nowMs;
    if (probeMs < tl.sunriseMs || probeMs > tl.nextSunriseMs) {
      const elapsedInDayMs = ((nowMs - tl.sunriseMs) % tl.totalDurationMs + tl.totalDurationMs) % tl.totalDurationMs;
      probeMs = tl.sunriseMs + elapsedInDayMs;
    }

    const nowPct = Math.max(
      0,
      Math.min(100, Number((((probeMs - tl.sunriseMs) / tl.totalDurationMs) * 100).toFixed(2)))
    );

    const activeChoghadiya =
      tl.choghadiyaAll.find((c) => probeMs >= c.startMs && probeMs < c.endMs) ||
      tl.choghadiyaAll[0];

    const activeSpecial = tl.specialPeriods.find(
      (s) => probeMs >= s.startMs && probeMs < s.endMs
    );

    const statusLineEn = activeChoghadiya
      ? `Currently: ${activeChoghadiya.name} Choghadiya (${activeChoghadiya.natureEn}) until ${activeChoghadiya.endTimeEn}${
          activeSpecial
            ? ` • ${activeSpecial.labelEn} active until ${activeSpecial.endTimeEn}`
            : ""
        }`
      : "";

    const statusLineHi = activeChoghadiya
      ? `वर्तमान समय: ${activeChoghadiya.nameHindi} चौघड़िया (${activeChoghadiya.natureHi}) — ${activeChoghadiya.endTimeHi} तक${
          activeSpecial
            ? ` • ${activeSpecial.labelHi} (${activeSpecial.endTimeHi} तक)`
            : ""
        }`
      : "";

    return {
      nowPct,
      sunsetPct: Number(
        (((tl.sunsetMs - tl.sunriseMs) / tl.totalDurationMs) * 100).toFixed(2)
      ),
      activeChoghadiya,
      activeSpecial,
      statusLineEn,
      statusLineHi,
    };
  }, [panchang, nowMs]);

  // Share on WhatsApp handler with prefilled message in current language
  const handleShareWhatsApp = () => {
    const pageUrl =
      typeof window !== "undefined"
        ? window.location.href
        : isHi
        ? "https://aapkaastro.com/hi/panchang"
        : "https://aapkaastro.com/panchang";

    const message = isHi
      ? `🙏 *आज का वैदिक पंचांग (${panchang.cityHindi} — ${panchang.dateHindi})*\n` +
        `• *तिथि:* ${panchang.tithi.pakshaHindi} ${panchang.tithi.nameHindi} (${panchang.tithi.endsAtHindi} तक)\n` +
        `• *नक्षत्र:* ${panchang.nakshatra.nameHindi} (चरण ${panchang.nakshatra.pada}, ${panchang.nakshatra.endsAtHindi} तक)\n` +
        `• *योग:* ${panchang.yoga.nameHindi}\n` +
        `• *सूर्योदय / सूर्यास्त:* ${panchang.sunTimes.sunriseHindi} / ${panchang.sunTimes.sunsetHindi}\n` +
        `• *अभिजित मुहूर्त:* ${panchang.auspiciousTimings.abhijitMuhuratHindi}\n` +
        `• *राहुकाल:* ${panchang.inauspiciousTimings.rahuKaalHindi}\n` +
        `संपूर्ण चौघड़िया एवं चन्द्रबल देखें: ${pageUrl}`
      : `🙏 *Daily Vedic Panchang (${panchang.city} — ${panchang.date})*\n` +
        `• *Tithi:* ${panchang.tithi.paksha} ${panchang.tithi.name} (until ${panchang.tithi.endsAt})\n` +
        `• *Nakshatra:* ${panchang.nakshatra.name} (Pada ${panchang.nakshatra.pada}, until ${panchang.nakshatra.endsAt})\n` +
        `• *Yoga:* ${panchang.yoga.name}\n` +
        `• *Sunrise / Sunset:* ${panchang.sunTimes.sunrise} / ${panchang.sunTimes.sunset}\n` +
        `• *Abhijit Muhurat:* ${panchang.auspiciousTimings.abhijitMuhurat}\n` +
        `• *Rahu Kaal:* ${panchang.inauspiciousTimings.rahuKaal}\n` +
        `View full 24h Choghadiya & Chandrabalam: ${pageUrl}`;

    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const englishUrl = isTomorrowRoute ? "/panchang/tomorrow" : "/panchang";
  const hindiUrl = isTomorrowRoute ? "/hi/panchang/tomorrow" : "/hi/panchang";

  return (
    <div lang={isHi ? "hi" : "en"} className="min-h-screen bg-[#FBF3E7] text-[#3B2A1E]">
      {/* 1. Top Header & Controls */}
      <section className="border-b border-[#E8D8C3] bg-[#7B2D26] py-10 sm:py-14 text-[#FBF3E7]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Top bar: Badge + Share on WhatsApp + URL Language Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E8A33D]/40 bg-[#64221C] px-4 py-1.5 text-xs font-bold text-[#E8A33D]">
              <DiyaIcon size={14} />
              <span>{t("pageBadge")}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Share on WhatsApp Button */}
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#1ebe5d] transition-colors cursor-pointer"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>{t("shareWhatsAppBtn")}</span>
              </button>

              {/* URL-based SEO Language Switcher */}
              <div className="inline-flex rounded-xl border border-[#E8A33D]/40 bg-[#64221C] p-1">
                <Link
                  href={englishUrl}
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
                  href={hindiUrl}
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
          </div>

          <div className="text-center">
            <h1 className="font-temple text-3xl sm:text-5xl font-bold text-[#FBF3E7]">
              {t("pageTitle")}
            </h1>

            <p className="mt-3 text-sm sm:text-base text-[#E8A33D] font-bold">
              {isHi ? panchang.cityHindi : panchang.city} •{" "}
              {isHi ? panchang.dateHindi : panchang.date} •{" "}
              {isHi ? panchang.samvatHindi : panchang.samvat}
            </p>

            <p className="mt-1.5 text-xs sm:text-sm text-[#FBF3E7]/85 max-w-2xl mx-auto">
              {t("pageSubtitle")}
            </p>

            {/* Location Selector (Preset Dropdown + Worldwide City Search + Explicit "Use my location") */}
            <div className="mt-6 flex flex-col items-center gap-3">
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {/* Preset 20 Cities Dropdown */}
                <div className="inline-flex items-center gap-2 rounded-2xl bg-[#FFFDF9] px-3.5 py-2 text-xs font-bold text-[#3B2A1E] shadow-md">
                  <MapPin className="h-4 w-4 text-[#C1662F]" />
                  <span>{t("selectLocation")}</span>
                  <select
                    aria-label={t("selectLocation")}
                    value={
                      typeof selectedCityOrCustom === "string"
                        ? selectedCityOrCustom
                        : "custom"
                    }
                    onChange={(e) => {
                      if (e.target.value !== "custom") {
                        saveLocationSelection(e.target.value);
                      }
                    }}
                    className="bg-transparent font-bold text-[#7B2D26] focus:outline-none cursor-pointer"
                  >
                    {typeof selectedCityOrCustom !== "string" && (
                      <option value="custom" className="text-[#3B2A1E]">
                        {selectedCityOrCustom.name}
                      </option>
                    )}
                    {CITIES_LIST.map((city) => (
                      <option key={city.id} value={city.id} className="text-[#3B2A1E]">
                        {isHi
                          ? `${city.nameHindi} (${city.stateHindi})`
                          : `${city.name} (${city.state})`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Worldwide City Search Box (LocationService) */}
                <div className="relative">
                  <div className="inline-flex items-center gap-2 rounded-2xl bg-[#FFFDF9] px-3.5 py-2 text-xs font-bold text-[#3B2A1E] shadow-md">
                    <Search className="h-3.5 w-3.5 text-[#C1662F]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t("searchCityPlaceholder")}
                      className="w-48 sm:w-60 bg-transparent text-xs text-[#3B2A1E] placeholder:text-[#6E5545] focus:outline-none"
                    />
                  </div>
                  {searchResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-1 shadow-xl text-left">
                      {searchResults.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            saveLocationSelection({
                              id: item.id,
                              name: item.name,
                              nameHindi: item.name,
                              state: item.state || item.country,
                              stateHindi: item.state || item.country,
                              lat: item.latitude,
                              lon: item.longitude,
                              timeZone: item.timezoneId,
                            });
                            setSearchQuery("");
                            setSearchResults([]);
                          }}
                          className="w-full rounded-xl px-3 py-2 text-left text-xs hover:bg-[#FBF3E7] transition-colors"
                        >
                          <div className="font-bold text-[#7B2D26]">{item.name}</div>
                          <div className="text-[10px] text-[#6E5545]">{item.displayName}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Explicit Click-Only "Use my location" Button */}
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  disabled={isLocating}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-[#E8A33D]/60 bg-[#64221C] px-3.5 py-2 text-xs font-bold text-[#E8A33D] hover:bg-[#521b16] transition-colors cursor-pointer"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  <span>{isLocating ? t("locatingBtn") : t("useMyLocationBtn")}</span>
                </button>
              </div>

              {/* Date Navigation + /panchang/tomorrow link */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <div className="inline-flex flex-wrap items-center gap-1.5 rounded-2xl bg-[#FFFDF9] p-1.5 text-xs font-bold text-[#3B2A1E] shadow-md">
                  <button
                    type="button"
                    onClick={() => shiftDate(-1)}
                    className="rounded-xl px-3 py-1.5 text-[#7B2D26] hover:bg-[#FBF3E7] transition-colors cursor-pointer"
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
                    onClick={() => setSelectedDate(defaultDateIso)}
                    className="rounded-xl bg-[#E8A33D]/20 px-2.5 py-1.5 text-[#7B2D26] hover:bg-[#E8A33D]/35 transition-colors cursor-pointer"
                  >
                    {t("todayBtn")}
                  </button>
                  <button
                    type="button"
                    onClick={() => shiftDate(1)}
                    className="rounded-xl px-3 py-1.5 text-[#7B2D26] hover:bg-[#FBF3E7] transition-colors cursor-pointer"
                  >
                    {t("nextDay")}
                  </button>
                </div>

                <Link
                  href={
                    isTomorrowRoute
                      ? isHi
                        ? "/hi/panchang"
                        : "/panchang"
                      : isHi
                      ? "/hi/panchang/tomorrow"
                      : "/panchang/tomorrow"
                  }
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-[#E8A33D]/50 bg-[#64221C] px-3.5 py-2 text-xs font-bold text-[#FBF3E7] hover:bg-[#521b16] transition-colors"
                >
                  <span>
                    {isTomorrowRoute ? t("todayRouteBtn") : t("tomorrowRouteBtn")}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Panchang Content */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-8">
          {/* Resilient Fallback Notice if any calculation error occurred */}
          {hadCalculationError && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-900">
              {t("fallbackErrorNotice")}
            </div>
          )}

          {/* Skeleton shimmer during location search */}
          {(isLocating || isSearching) && (
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#E8D8C3]">
              <div className="h-full w-1/2 animate-pulse bg-[#C1662F]" />
            </div>
          )}

          {/* Soft Call-To-Action Strip (50% Off First Consultation) */}
          <div className="rounded-2xl border border-[#E8A33D] bg-[#FFFDF9] px-5 py-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-[#7B2D26]">
              <DiyaIcon size={15} />
              <span>{t("softConsultNote")}</span>
            </div>
            <Link
              href="/consult"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#7B2D26] px-4 py-2 text-xs font-bold text-[#FFFDF9] hover:bg-[#64221C] transition-colors"
            >
              <PhoneCall className="h-3.5 w-3.5 text-[#E8A33D]" />
              <span>{t("consultCta")}</span>
            </Link>
          </div>

          {/* Active Auspicious Yogas Quick Strip */}
          {panchang.auspiciousYogas && panchang.activeAuspiciousYogasCount > 0 && (
            <div className="rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-amber-500/10 p-4 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8A33D]/25 text-[#7B2D26]">
                    <Sparkles className="h-5 w-5 text-[#C1662F]" />
                  </span>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#C1662F]">
                      {isHi ? "आज के सक्रिय शुभ योग" : "Active Auspicious Yogas Today"}
                    </span>
                    <div className="text-sm font-bold text-[#7B2D26]">
                      {panchang.auspiciousYogas
                        .filter((y) => y.isActive)
                        .map((y) => (isHi ? y.nameHi : y.nameEn))
                        .join(" • ")}
                    </div>
                  </div>
                </div>
                <a
                  href="#shubh-yogas"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#7B2D26] px-4 py-2 text-xs font-bold text-[#FFFDF9] hover:bg-[#64221C] transition-colors"
                >
                  <span>{isHi ? "समय व विवरण देखें ↓" : "View Timings & Details ↓"}</span>
                </a>
              </div>
            </div>
          )}

          {/* 3. 24-HOUR HORIZONTAL VEDIC TIMELINE BAR (Pure CSS/SVG) */}
          {panchang.timeline24h && timelineState && (
            <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h2 className="font-temple text-lg sm:text-xl font-bold text-[#7B2D26] flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#C1662F]" />
                  <span>{t("timelineTitle")}</span>
                </h2>
                <span className="rounded-full bg-[#7B2D26]/10 px-3.5 py-1 text-xs font-bold text-[#7B2D26]">
                  {isHi ? timelineState.statusLineHi : timelineState.statusLineEn}
                </span>
              </div>

              {/* Track Container */}
              <div className="relative mt-5 pt-6 pb-2 select-none">
                {/* "NOW" Marker Pin */}
                <div
                  style={{ left: `${timelineState.nowPct}%` }}
                  className="absolute top-0 bottom-0 z-20 -translate-x-1/2 flex flex-col items-center pointer-events-none"
                >
                  <span className="rounded bg-[#7B2D26] px-1.5 py-0.5 text-[10px] font-bold text-[#FFFDF9] shadow-xs whitespace-nowrap">
                    {t("nowMarkerLabel")}
                  </span>
                  <div className="w-0.5 flex-1 bg-[#7B2D26]" />
                </div>

                {/* Track 1: 16 Choghadiya Periods (Sunrise -> Sunset -> Next Sunrise) */}
                <div className="relative flex h-9 w-full overflow-hidden rounded-xl border border-[#E8D8C3]">
                  {panchang.timeline24h.choghadiyaAll.map((seg, idx) => {
                    const palette =
                      CHOGHADIYA_COLOR_MAP[seg.name] || CHOGHADIYA_COLOR_MAP.Char;
                    return (
                      <div
                        key={idx}
                        style={{
                          width: `${seg.widthPct}%`,
                          backgroundColor: palette.bg,
                        }}
                        title={`${isHi ? seg.nameHindi : seg.name}: ${
                          isHi ? seg.periodHindi : seg.period
                        }`}
                        className="h-full border-r border-white/30 flex items-center justify-center overflow-hidden px-0.5 text-[10px] font-bold text-white"
                      >
                        <span className="truncate">
                          {isHi ? seg.nameHindi : seg.name}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Track 2: Rahu Kaal, Yamaganda, Gulika Kaal & Abhijit Muhurat Overlays */}
                <div className="relative mt-2 h-7 w-full rounded-lg bg-[#FBF3E7] border border-[#E8D8C3] overflow-hidden">
                  {panchang.timeline24h.specialPeriods.map((sp) => {
                    const colorMap: Record<string, string> = {
                      rahuKaal: "#dc2626",
                      yamaganda: "#9333ea",
                      gulikaKaal: "#b45309",
                      abhijitMuhurat: "#d97706",
                    };
                    return (
                      <div
                        key={sp.key}
                        style={{
                          left: `${sp.startPct}%`,
                          width: `${sp.widthPct}%`,
                          backgroundColor: colorMap[sp.key] || "#7B2D26",
                        }}
                        title={`${isHi ? sp.labelHi : sp.labelEn}: ${
                          isHi ? sp.periodHi : sp.periodEn
                        }`}
                        className="absolute top-0.5 bottom-0.5 rounded-md flex items-center justify-center px-1 text-[10px] font-bold text-white shadow-2xs overflow-hidden"
                      >
                        <span className="truncate">
                          {isHi ? sp.labelHi : sp.labelEn}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Sunrise / Sunset / Next Sunrise Axis Labels */}
                <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-[#6E5545]">
                  <span>
                    ☀️ {t("sunrise")}:{" "}
                    {isHi ? panchang.sunTimes.sunriseHindi : panchang.sunTimes.sunrise}
                  </span>
                  <span>
                    🌇 {t("sunset")}:{" "}
                    {isHi ? panchang.sunTimes.sunsetHindi : panchang.sunTimes.sunset}
                  </span>
                  <span>
                    🌅{" "}
                    {isHi ? "अगला सूर्योदय" : "Next Sunrise"}
                  </span>
                </div>
              </div>
            </div>
          )}

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
                {panchang.tithi.anomaly && panchang.tithi.anomaly !== "Normal" && (
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

          {/* Auspicious Yogas (शुभ योग) Section */}
          {panchang.auspiciousYogas && (
            <div id="shubh-yogas" className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-xs scroll-mt-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div>
                  <h2 className="font-temple text-xl sm:text-2xl font-bold text-[#7B2D26] flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#E8A33D]" />
                    <span>{t("auspiciousYogasTitle")}</span>
                  </h2>
                  <p className="text-xs text-[#6E5545] mt-1 max-w-2xl">
                    {t("auspiciousYogasSub")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${
                      panchang.activeAuspiciousYogasCount > 0
                        ? "bg-[#6B8E5A]/15 text-[#4B6B3B] border-[#6B8E5A]/30"
                        : "bg-[#6E5545]/10 text-[#6E5545] border-[#E8D8C3]"
                    }`}
                  >
                    {panchang.activeAuspiciousYogasCount > 0 && (
                      <span className="h-2 w-2 rounded-full bg-[#6B8E5A] animate-pulse" />
                    )}
                    {panchang.activeAuspiciousYogasCount}{" "}
                    {isHi ? "योग आज सक्रिय" : "Active Today"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
                {panchang.auspiciousYogas.map((yoga) => (
                  <div
                    key={yoga.id}
                    className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                      yoga.isActive
                        ? "border-[#6B8E5A] bg-gradient-to-b from-[#EDF3EB] to-[#FFFDF9] shadow-xs ring-1 ring-[#6B8E5A]/40"
                        : "border-[#E8D8C3] bg-[#FBF3E7]/50 opacity-90 hover:opacity-100"
                    }`}
                  >
                    <div>
                      {/* Header: Title & Status Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-[11px] font-bold text-[#C1662F]">
                            {isHi ? "वैदिक शुभ योग" : yoga.nameHi}
                          </div>
                          <h3 className="font-temple text-lg font-bold text-[#7B2D26]">
                            {isHi ? yoga.nameHi : yoga.nameEn}
                          </h3>
                        </div>
                        {yoga.isActive ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#6B8E5A] px-2.5 py-0.5 text-[11px] font-bold text-white shadow-2xs whitespace-nowrap">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>{t("activeTodayBadge")}</span>
                          </span>
                        ) : (
                          <span className="rounded-full bg-[#6E5545]/10 px-2 py-0.5 text-[11px] font-medium text-[#6E5545] whitespace-nowrap">
                            {t("notFormedBadge")}
                          </span>
                        )}
                      </div>

                      {/* Formed Time Window */}
                      <div
                        className={`mt-3.5 rounded-xl border p-3 text-xs ${
                          yoga.isActive
                            ? "border-[#6B8E5A]/40 bg-white"
                            : "border-[#E8D8C3] bg-white/70"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-[#6E5545] mb-1">
                          <Clock className="h-3.5 w-3.5 text-[#C1662F]" />
                          <span>{t("auspiciousTimingLabel")}:</span>
                        </div>
                        <div
                          className={`font-mono text-xs sm:text-sm font-bold ${
                            yoga.isActive ? "text-[#4B6B3B]" : "text-[#8C7A6B]"
                          }`}
                        >
                          {isHi ? yoga.timingHi : yoga.timingEn}
                        </div>
                      </div>

                      {/* Rule */}
                      <div className="mt-3 text-[11px] text-[#6E5545] leading-relaxed">
                        <strong className="text-[#3B2A1E]">
                          {t("formationRuleLabel")}:{" "}
                        </strong>
                        {isHi ? yoga.ruleHi : yoga.ruleEn}
                      </div>
                    </div>

                    {/* Astrological Significance */}
                    <p className="mt-3.5 pt-3 border-t border-[#E8D8C3]/60 text-xs text-[#3B2A1E]/90 leading-relaxed">
                      {isHi ? yoga.descriptionHi : yoga.descriptionEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

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

          {/* Today's Festivals & Vrats */}
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
