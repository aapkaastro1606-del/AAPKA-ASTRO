"use client";

import React from "react";
import Link from "next/link";
import { Compass, Gem, FileText, PhoneCall, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { MandalaDivider } from "@/components/ui/MandalaDivider";
import { ADMIN_CONFIGURABLE_PRICING, FIRST_CONSULTATION_OFFER, PLACEHOLDER_ASTROLOGER } from "@/config/placeholderContent";

export const ServicesGrid: React.FC = () => {
  // {/* PLACEHOLDER: replace with real content */}
  // Core services (equal focus, four categories)
  const coreServices = [
    {
      id: "kundli",
      title: "Kundli & Horoscope Reading",
      hindi: "जन्म कुण्डली एवं फलित ज्योतिष",
      description:
        "Birth chart analysis, life predictions, and dosha identification using classical Vedic astrological principles.",
      pricing: "Included in Live Session & Detailed PDF Readings",
      badge: "Core Service",
      icon: FileText,
      href: "/kundli-generator",
      features: [
        "Lagna & planetary degrees calculation",
        "Vimshottari Dasha timing & upcoming life transits",
        "Manglik, Sade Sati & Kaal Sarp dosha identification",
        "Clear timeframes for career, marriage & health events",
      ],
    },
    {
      id: "vastu",
      title: "Vastu Consultancy",
      hindi: "वैदिक वास्तु परामर्श",
      description:
        "Home and workspace energy alignment for prosperity and peace using non-demolition scientific remedies.",
      pricing: "Residential, Corporate & Industrial Audits",
      badge: "Core Service",
      icon: Compass,
      href: "/vastu",
      features: [
        "Main entrance (Simha Dwar) energy evaluation",
        "Kitchen (Agni), bedroom & cash counter alignment",
        "100% zero-demolition metallic tape & pyramid remedies",
        "Removal of chronic financial & domestic blockages",
      ],
    },
    {
      id: "gemstone",
      title: "Gemstone Recommendation",
      hindi: "रत्न परामर्श एवं प्राण-प्रतिष्ठा",
      description:
        "Personalized gemstone guidance based on planetary positions, Shadbala, and Lagna Lord strength.",
      pricing: "100% Natural Lab-Certified Stones",
      badge: "Core Service",
      icon: Gem,
      href: "/gemstones",
      features: [
        "Lagna lord fortifying & planet pacification guidance",
        "Govt. recognized laboratory certification",
        "Individualized Vedic consecration (Prana Pratishtha)",
        "Precise wearing finger, auspicious day & Vedic mantra",
      ],
    },
    {
      id: "live-consultation",
      title: "Live Consultation",
      hindi: "सीधा व्यक्तिगत परामर्श",
      description:
        `Real-time chat, voice, or video sessions covering any of the above with ${PLACEHOLDER_ASTROLOGER.displayName}.`,
      pricing: "Flat ₹1,051 (Regular ₹2,100) — 50% Savings",
      badge: "50% Off 1st Session",
      icon: PhoneCall,
      href: "/consult",
      features: [
        "Live 1-on-1 direct encrypted connection",
        "Format choice: Voice Call, Video Call, or Live Chat (Unified Fee)",
        "First consultation: Flat ₹1,051/- (Regular ₹2,100 — 50% savings)",
        "Covers Career, Finance, Marriage Compatibility, Health & Remedies",
      ],
    },
  ];

  return (
    <section className="border-t border-[#E8D8C3] bg-[#FFFDF9] py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E8D8C3] bg-[#FBF3E7] px-3.5 py-1 text-xs font-bold text-[#7B2D26] mb-3 font-temple">
            <span>CORE PILLARS OF WISDOM</span>
          </div>
          <h2 className="font-temple text-3xl sm:text-4xl font-bold text-[#7B2D26] tracking-tight">
            Comprehensive Vedic Guidance
          </h2>
          <MandalaDivider className="my-4" />
          <p className="text-[#6E5545] text-sm sm:text-base leading-relaxed font-body">
            Equal focus across four essential dimensions of life: personalized birth chart analysis, living space harmony, consecrated gemstone power, and direct live consultation.
          </p>
        </div>

        {/* 4 Core Services Grid */}
        {/* PLACEHOLDER: replace with real content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {coreServices.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-8 shadow-sm hover:shadow-md hover:border-[#D4C3B3] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FAF1E4] text-[#7B2D26] border border-[#E8D8C3]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-[#FAF1E4] px-3 py-1 text-xs font-bold text-[#7B2D26] border border-[#E8D8C3] font-temple">
                      {service.badge}
                    </span>
                  </div>

                  <h3 className="font-temple text-xl font-bold text-[#7B2D26]">{service.title}</h3>
                  <div className="text-xs text-[#C1662F] font-semibold mb-3">{service.hindi}</div>
                  <p className="text-xs sm:text-sm text-[#6E5545] leading-relaxed mb-6 font-body">
                    {service.description}
                  </p>

                  <ul className="space-y-2.5 border-t border-[#E8D8C3] pt-5 text-xs text-[#6B5A4E] font-body">
                    {service.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#6B8E5A] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-5 border-t border-[#E8D8C3] flex items-center justify-between">
                  <div className="text-xs font-semibold text-[#7D6B5D] max-w-[200px] truncate font-body">
                    {service.pricing}
                  </div>

                  <Link
                    href={service.href}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#7B2D26] hover:text-[#64231D] font-temple"
                  >
                    <span>Explore Service</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sample Pricing Strip (Admin-Editable Placeholder) */}
        {/* PLACEHOLDER: replace with real content */}
        <div className="rounded-2xl border border-[#E8A33D]/50 bg-[#FAF1E4] p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7B2D26] font-temple mb-1">
                <Sparkles className="h-4 w-4 text-[#E8A33D]" />
                <span>Special 1-on-1 Consultation Offer</span>
              </div>
              <p className="text-xs text-[#6E5545] font-body">
                Flat ₹1,051/- for your first personal reading (Regular ₹2,100). Choose between Voice, Video, or Chat.
              </p>
            </div>

            {/* Pricing Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] px-3.5 py-2 text-center shadow-sm">
                <div className="text-[10px] uppercase font-bold text-[#7D6B5D] font-temple">Live Chat</div>
                <div className="text-base font-bold font-temple text-[#7B2D26]">₹1,051</div>
                <div className="text-[10px] text-[#6B8E5A] font-bold">Reg. ₹2,100</div>
              </div>

              <div className="rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] px-3.5 py-2 text-center shadow-sm">
                <div className="text-[10px] uppercase font-bold text-[#7D6B5D] font-temple">Voice Call</div>
                <div className="text-base font-bold font-temple text-[#7B2D26]">₹1,051</div>
                <div className="text-[10px] text-[#6B8E5A] font-bold">Reg. ₹2,100</div>
              </div>

              <div className="rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] px-3.5 py-2 text-center shadow-sm">
                <div className="text-[10px] uppercase font-bold text-[#7D6B5D] font-temple">Video Call</div>
                <div className="text-base font-bold font-temple text-[#7B2D26]">₹1,051</div>
                <div className="text-[10px] text-[#6B8E5A] font-bold">Reg. ₹2,100</div>
              </div>

              <Link
                href="/consult"
                className="rounded-xl bg-[#7B2D26] px-5 py-3 text-xs font-bold text-white hover:bg-[#64231D] shadow-sm transition-all"
              >
                Book Now (₹1,051)
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
