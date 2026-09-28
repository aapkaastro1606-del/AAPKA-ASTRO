import React from "react";
import { Metadata } from "next";
import { PanchangView } from "@/components/panchang/PanchangView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Daily Hindu Panchang & Shubh Muhurat (आज का पंचांग) | Aapka Astro",
  description:
    "High-precision Drik Ganita Daily Panchang calculated from real planetary positions using the Chitra Paksha Lahiri Ayanamsa. View Tithi, Nakshatra, Yoga, Karana, Rahu Kaal, Choghadiya & Chandrabalam.",
  alternates: {
    canonical: "/panchang",
    languages: {
      "en-IN": "/panchang",
      "hi-IN": "/hi/panchang",
      "x-default": "/panchang",
    },
  },
};

export default function PanchangPage() {
  return <PanchangView defaultLocale="en" />;
}
