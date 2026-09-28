import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { DailyHoroscopeService, ZODIAC_SIGNS } from "@/lib/astrology/dailyHoroscope";
import { SignHoroscopeView } from "@/components/horoscope/SignHoroscopeView";
import { PLACEHOLDER_ASTROLOGER } from "@/config/placeholderContent";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ sign: string }>;
}

export async function generateStaticParams() {
  return ZODIAC_SIGNS.map((s) => ({
    sign: s.id,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sign: signId } = await params;
  const horoscope = DailyHoroscopeService.getHoroscope(signId, 0);
  if (!horoscope) {
    return { title: "Horoscope Not Found | Aapka Astro" };
  }

  const sign = horoscope.sign;
  return {
    title: `${sign.englishName} (${sign.sanskritName}) Daily Horoscope — ${sign.hindiName} दैनिक राशिफल | Aapka Astro`,
    description: `Read today's Vedic Chandra Rashi (Moon Sign) horoscope for ${sign.englishName} (${sign.hindiName}) in English & Hindi. Calculated from real planetary transits (Lahiri Ayanamsa) with Career, Love, Health, Finance, Family, Upay & Mantra.`,
    keywords: [
      `${sign.englishName} horoscope today`,
      `${sign.sanskritName} rashi today`,
      `${sign.hindiName} राशिफल आज का`,
      "Vedic Moon Sign Horoscope",
      "Aapka Astro",
    ],
  };
}

export default async function SignHoroscopePage({ params }: PageProps) {
  const { sign: signId } = await params;
  const yesterday = DailyHoroscopeService.getHoroscope(signId, -1);
  const today = DailyHoroscopeService.getHoroscope(signId, 0);
  const tomorrow = DailyHoroscopeService.getHoroscope(signId, 1);

  if (!today || !yesterday || !tomorrow) {
    notFound();
  }

  return (
    <SignHoroscopeView
      yesterday={yesterday}
      today={today}
      tomorrow={tomorrow}
      astrologerName={PLACEHOLDER_ASTROLOGER.displayName}
    />
  );
}
