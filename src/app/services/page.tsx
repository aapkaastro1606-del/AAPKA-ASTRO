"use client";

import React from "react";
import Link from "next/link";
import { CORE_SERVICES, ADMIN_CONFIGURABLE_PRICING, PLACEHOLDER_ASTROLOGER } from "@/config/placeholderContent";
import { MandalaDivider } from "@/components/ui/MandalaDivider";
import { DiyaIcon } from "@/components/ui/DiyaIcon";
import { ConsultationServicesJsonLd } from "@/components/seo/JsonLd";
import {
  FileText,
  Compass,
  Gem,
  PhoneCall,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function ServicesPage() {
  const serviceIcons = {
    kundli: FileText,
    vastu: Compass,
    gemstone: Gem,
    "live-consultation": PhoneCall,
  };

  const detailedServices = [
    {
      id: "kundli",
      slug: "kundli",
      title: "Kundli & Horoscope Reading",
      hindi: "जन्म कुण्डली एवं फलित ज्योतिष",
      description:
        "Comprehensive birth chart synthesis deciphering planetary placements, Mahadasha cycles, Shadbala potency, and targeted life-stage remedies.",
      features: [
        "Lagna, Navamsha (D9) & Divisional chart analysis",
        "Vimshottari Dasha timing for career, marriage, & health",
        "Dosha diagnosis: Manglik, Sade Sati, Kaal Sarp, Pitra Dosha",
        "Personalized Mantra, Yantra, & Dana recommendations",
      ],
      idealFor: "Career dilemmas, marital delays, business decisions, health cautions",
      actionHref: "/services/kundli",
    },
    {
      id: "vastu",
      slug: "vastu",
      title: "Vastu Consultancy",
      hindi: "वैदिक वास्तु परामर्श",
      description:
        "Sacred spatial energy balancing for residential homes, corporate workspaces, and industrial units using 100% zero-demolition Vedic remedies.",
      features: [
        "16-zone directional energy mapping (Devata & Asura zones)",
        "Entrance Pada diagnosis & Main Door rectification",
        "Zero-demolition metallic helix, pyramid & copper wire energy locks",
        "Color therapy, mirror placement, & water element alignment",
      ],
      idealFor: "Persistent financial blockage, domestic disharmony, chronic health struggles",
      actionHref: "/services/vastu",
    },
    {
      id: "gemstone",
      slug: "gemstone",
      title: "Gemstone Recommendation",
      hindi: "रत्न परामर्श एवं प्राण-प्रतिष्ठा",
      description:
        "Scientifically verified, government lab-certified natural untreated gemstones energized through sacred Vedic Prana Pratishtha.",
      features: [
        "Planetary Lord & Lagna-friendly gemstone assessment",
        "100% natural, unheated & untreated certified precious gems",
        "Customized Prana Pratishtha consecration with your Gotra & Nakshatra",
        "Exact wearing day, auspicious Muhurat, and finger guidelines",
      ],
      idealFor: "Amplifying benefic planet energy, clearing planetary obstacles",
      actionHref: "/services/gemstone",
    },
    {
      id: "live-consultation",
      slug: "live-consultation",
      title: "Live Consultation",
      hindi: "सीधा व्यक्तिगत परामर्श",
      description:
        `Direct 1-on-1 personal consultation via WhatsApp Call or Google Meet with ${PLACEHOLDER_ASTROLOGER.displayName}.`,
      features: [
        "Direct 1-on-1 session via WhatsApp Call or Google Meet",
        "Upfront flat-fee booking with zero hidden charges or surprise per-minute meters",
        "Automatic 50% discount on your very first consultation (Flat ₹1,051/-)",
        "Direct prescription notes and written remedy summary in your account",
      ],
      idealFor: "Immediate clarity, urgent life decisions, specific questions",
      actionHref: "/services/live-consultation",
    },
  ];

  return (
    <div className="bg-[#FBF3E7] text-[#3B2A1E]">
      <ConsultationServicesJsonLd />
      {/* 1. Header Banner */}
      <section className="relative overflow-hidden border-b border-[#E8D8C3] bg-[#7B2D26] py-16 sm:py-20 text-[#FBF3E7]">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E8A33D]/30 bg-[#64221C] px-4 py-1 text-xs font-bold text-[#E8A33D] mb-4">
            <DiyaIcon size={14} />
            <span>FOUR SACRED VEDIC PILLARS</span>
          </div>

          <h1 className="font-temple text-3xl sm:text-5xl font-bold tracking-tight text-[#FBF3E7]">
            Vedic Astrology &amp; Vastu Services
          </h1>

          <p className="mt-4 text-base sm:text-lg text-[#FBF3E7]/80 max-w-2xl mx-auto font-body">
            Every consultation is personally conducted by {PLACEHOLDER_ASTROLOGER.displayName} with mathematical Vedic rigor and compassionate counsel.
          </p>
        </div>
      </section>

      {/* 2. Services Grid */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {detailedServices.map((service) => {
              const Icon = serviceIcons[service.id as keyof typeof serviceIcons] || Sparkles;

              return (
                <div
                  key={service.id}
                  className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-8 shadow-sm hover:shadow-md transition-all hover:border-[#C1662F] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7B2D26]/10 text-[#7B2D26]">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-xs font-bold text-[#C1662F] font-temple">
                        {service.hindi}
                      </span>
                    </div>

                    <h2 className="font-temple text-2xl font-bold text-[#7B2D26]">
                      {service.title}
                    </h2>

                    <p className="mt-3 text-sm text-[#6E5545] leading-relaxed">
                      {service.description}
                    </p>

                    <div className="mt-6 space-y-2.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#7B2D26]">
                        Key Inclusions:
                      </span>
                      {service.features.map((feat, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-[#3B2A1E]">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#6B8E5A] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 rounded-xl bg-[#FBF3E7] p-3 text-xs text-[#6E5545]">
                      <strong className="text-[#7B2D26]">Best suited for:</strong> {service.idealFor}
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-[#E8D8C3] flex items-center justify-between">
                    <Link
                      href={service.actionHref}
                      className="inline-flex items-center gap-1.5 font-bold text-xs sm:text-sm text-[#7B2D26] hover:text-[#C1662F] group"
                    >
                      <span>Explore In-Depth Details</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                      href="/consult"
                      className="rounded-xl bg-[#E8A33D] px-4 py-2 text-xs font-bold text-[#3B2A1E] hover:bg-[#F6CF86] transition-all shadow-sm"
                    >
                      Book Session
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-16 text-center">
            <MandalaDivider opacity={0.3} />
          </div>
        </div>
      </section>
    </div>
  );
}
