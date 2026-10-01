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
    return { title: "राशिफल उपलब्ध नहीं है | Aapka Astro" };
  }

  const sign = horoscope.sign;
  return {
    title: `आज का ${sign.hindiName} राशिफल — वैदिक चन्द्र गोचर भविष्यफल | Aapka Astro`,
    description: `आज का ${sign.hindiName} (${sign.sanskritName}) वैदिक चन्द्र राशिफल — जानें करियर, प्रेम, स्वास्थ्य, आर्थिक स्थिति, पारिवारिक सुख, शुभ रंग, शुभ समय, वैदिक उपाय एवं बीज मंत्र। चित्रापक्ष लाहिड़ी अयनांश पर आधारित।`,
    keywords: [
      `${sign.hindiName} राशिफल आज का`,
      `आज का ${sign.hindiName} राशिफल`,
      `${sign.hindiName} दैनिक राशिफल`,
      `${sign.englishName} rashifal in hindi`,
      "Aapka Astro",
    ],
    alternates: {
      canonical: `/hi/horoscope/${sign.id}`,
      languages: {
        "en-IN": `/horoscope/${sign.id}`,
        "hi-IN": `/hi/horoscope/${sign.id}`,
        "x-default": `/horoscope/${sign.id}`,
      },
    },
  };
}

export default async function HindiSignHoroscopePage({ params }: PageProps) {
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
      defaultLocale="hi"
    />
  );
}
