import React from "react";
import { Metadata } from "next";
import { PanchangView } from "@/components/panchang/PanchangView";
import { getPanchangForCity } from "@/lib/store/panchangStore";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "कल का पंचांग — तिथि, नक्षत्र, चौघड़िया एवं शुभ मुहूर्त | Aapka Astro",
  description:
    "चित्रापक्ष लाहिड़ी अयनांश एवं दृक् गणित पर आधारित कल का संपूर्ण वैदिक पंचांग। जानें कल की तिथि, नक्षत्र, योग, करण, राहुकाल, अभिजित मुहूर्त, दिन-रात्रि का चौघड़िया एवं चन्द्रबल।",
  keywords: [
    "कल का पंचांग",
    "आने वाले कल का पंचांग हिन्दी में",
    "कल का शुभ मुहूर्त",
    "कल का चौघड़िया",
    "कल का राहुकाल",
    "वैदिक पंचांग 2026",
    "Aapka Astro",
  ],
  alternates: {
    canonical: "/hi/panchang/tomorrow",
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

export default function HindiTomorrowPanchangPage() {
  const tomorrowDate = getTomorrowIsoDate();
  const initialPanchang = getPanchangForCity("delhi", tomorrowDate);
  return (
    <PanchangView
      defaultLocale="hi"
      isTomorrowRoute={true}
      initialDateStr={tomorrowDate}
      initialPanchang={initialPanchang}
    />
  );
}
