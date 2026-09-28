import React from "react";
import { Metadata } from "next";
import { PanchangView } from "@/components/panchang/PanchangView";
import { getPanchangForCity } from "@/lib/store/panchangStore";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "आज का पंचांग (Dainik Panchang in Hindi) — तिथि, नक्षत्र, चौघड़िया एवं शुभ मुहूर्त | Aapka Astro",
  description:
    "चित्रापक्ष लाहिड़ी अयनांश एवं दृक् गणित पर आधारित आज का संपूर्ण वैदिक पंचांग। जानें आज की तिथि, नक्षत्र, योग, करण, राहुकाल, अभिजित मुहूर्त, दिन-रात्रि का चौघड़िया एवं चन्द्रबल।",
  keywords: [
    "आज का पंचांग",
    "दैनिक पंचांग हिन्दी में",
    "आज का शुभ मुहूर्त",
    "आज का चौघड़िया",
    "आज का राहुकाल",
    "वैदिक पंचांग 2026",
    "Aapka Astro",
  ],
  alternates: {
    canonical: "/hi/panchang",
    languages: {
      "en-IN": "/panchang",
      "hi-IN": "/hi/panchang",
      "x-default": "/panchang",
    },
  },
};

export default function HindiPanchangPage() {
  const initialPanchang = getPanchangForCity("delhi");
  return <PanchangView defaultLocale="hi" initialPanchang={initialPanchang} />;
}

