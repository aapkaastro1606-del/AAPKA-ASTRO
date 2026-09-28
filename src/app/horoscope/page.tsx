import React from "react";
import { Metadata } from "next";
import { ZODIAC_SIGNS, DailyHoroscopeService } from "@/lib/astrology/dailyHoroscope";
import { HoroscopeIndexView } from "@/components/horoscope/HoroscopeIndexView";
import { PLACEHOLDER_ASTROLOGER } from "@/config/placeholderContent";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Daily Vedic Horoscope (Chandra Rashi / दैनिक राशिफल) — All 12 Rashis | Aapka Astro",
  description:
    "Read your daily Vedic Moon Sign (Chandra Rashi) horoscope in English and Hindi by Acharya Niraj Kumar. Calculated from real planetary positions using the Chitra Paksha Lahiri Ayanamsa.",
  keywords: [
    "Daily Horoscope",
    "Dainik Rashifal",
    "Chandra Rashi Horoscope",
    "Moon Sign Horoscope India",
    "Vedic Horoscope 2026",
    "Rashifal today in Hindi",
  ],
};

export default function HoroscopeIndexPage() {
  const items = ZODIAC_SIGNS.map((sign) => ({
    sign,
    horoscope: DailyHoroscopeService.getHoroscope(sign.id, 0)!,
  }));

  return (
    <HoroscopeIndexView
      items={items}
      astrologerName={PLACEHOLDER_ASTROLOGER.displayName}
    />
  );
}
