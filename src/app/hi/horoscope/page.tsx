import React from "react";
import { Metadata } from "next";
import { ZODIAC_SIGNS, DailyHoroscopeService } from "@/lib/astrology/dailyHoroscope";
import { HoroscopeIndexView } from "@/components/horoscope/HoroscopeIndexView";
import { PLACEHOLDER_ASTROLOGER } from "@/config/placeholderContent";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "आज का राशिफल (Dainik Rashifal in Hindi) — १२ चन्द्र राशियों का वैदिक भविष्यफल | Aapka Astro",
  description:
    "आचार्य नीरज कुमार द्वारा चित्रापक्ष लाहिड़ी अयनांश एवं वास्तविक ग्रह गोचर (चन्द्र राशि) पर आधारित आज का दैनिक राशिफल। जानें मेष से मीन तक करियर, प्रेम, स्वास्थ्य, धन, शुभ समय एवं वैदिक उपाय।",
  keywords: [
    "आज का राशिफल",
    "दैनिक राशिफल हिन्दी में",
    "चन्द्र राशिफल",
    "मेष से मीन राशिफल",
    "वैदिक राशिफल 2026",
    "Aapka Astro",
  ],
  alternates: {
    canonical: "/hi/horoscope",
    languages: {
      "en-IN": "/horoscope",
      "hi-IN": "/hi/horoscope",
      "x-default": "/horoscope",
    },
  },
};

export default function HindiHoroscopeIndexPage() {
  const items = ZODIAC_SIGNS.map((sign) => ({
    sign,
    horoscope: DailyHoroscopeService.getHoroscope(sign.id, 0)!,
  }));

  return (
    <HoroscopeIndexView
      items={items}
      astrologerName={PLACEHOLDER_ASTROLOGER.displayName}
      defaultLocale="hi"
    />
  );
}
