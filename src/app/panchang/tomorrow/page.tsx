import React from "react";
import { Metadata } from "next";
import { PanchangView } from "@/components/panchang/PanchangView";
import { getPanchangForCity } from "@/lib/store/panchangStore";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tomorrow's Hindu Panchang & Shubh Muhurat (कल का पंचांग) | Aapka Astro",
  description:
    "Plan ahead with Tomorrow's Drik Ganita Hindu Panchang calculated from real planetary positions using the Chitra Paksha Lahiri Ayanamsa. View Tithi, Nakshatra, Yoga, Karana, Rahu Kaal, Choghadiya & Chandrabalam.",
  alternates: {
    canonical: "/panchang/tomorrow",
    languages: {
      "en-IN": "/panchang/tomorrow",
      "hi-IN": "/hi/panchang/tomorrow",
      "x-default": "/panchang/tomorrow",
    },
  },
};

function getTomorrowIsoDate(): string {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function TomorrowPanchangPage() {
  const tomorrowDate = getTomorrowIsoDate();
  const initialPanchang = getPanchangForCity("delhi", tomorrowDate);
  return (
    <PanchangView
      defaultLocale="en"
      isTomorrowRoute={true}
      initialDateStr={tomorrowDate}
      initialPanchang={initialPanchang}
    />
  );
}
