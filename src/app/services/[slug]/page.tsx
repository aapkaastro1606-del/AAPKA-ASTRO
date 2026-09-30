"use client";

import React, { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PLACEHOLDER_ASTROLOGER, ADMIN_CONFIGURABLE_PRICING } from "@/config/placeholderContent";
import { MandalaDivider } from "@/components/ui/MandalaDivider";
import { DiyaIcon } from "@/components/ui/DiyaIcon";
import {
  FileText,
  Compass,
  Gem,
  PhoneCall,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  Sparkles,
} from "lucide-react";

interface ServiceDetailData {
  title: string;
  hindi: string;
  subtitle: string;
  longDescription: string;
  icon: typeof FileText;
  steps: { title: string; desc: string }[];
  deliverables: string[];
  preparationItems: string[];
  faqs: { q: string; a: string }[];
  ctaText: string;
  ctaHref: string;
}

const SERVICE_MAP: Record<string, ServiceDetailData> = {
  kundli: {
    title: "Kundli & Horoscope Reading",
    hindi: "जन्म कुण्डली एवं फलित ज्योतिष",
    subtitle: "Complete mathematical birth chart synthesis, Dasha roadmap, and karmic analysis.",
    longDescription:
      "Your Janam Kundli is the celestial blueprint captured at the exact moment of your first breath. In Vedic astrology, planetary positions reflect your Prarabdha Karma (accumulated karmic momentum). Acharya Ji analyses your Lagna chart, Navamsha (D9 for marriage and dharma), Dashamsha (D10 for career), and current Vimshottari Mahadasha/Antardasha to illuminate your authentic path.",
    icon: FileText,
    steps: [
      {
        title: "1. Precise Coordinate & Ayanamsa Verification",
        desc: "We verify your birth time, latitude, and longitude using classical Lahiri (Chitra Paksha) Ayanamsa for error-free degree calculations.",
      },
      {
        title: "2. House & Planetary Strength (Shadbala)",
        desc: "Each planet is evaluated across 6 dimensions of strength (positional, directional, temporal, motional, natural, and aspectual).",
      },
      {
        title: "3. Dasha & Transit Overlay",
        desc: "We correlate your current Vimshottari period with major Gochara (transits of Jupiter, Saturn, Rahu, and Ketu) to pinpoint specific windows for action.",
      },
      {
        title: "4. Practical Vedic Remedies",
        desc: "Prescription of personalized Beej Mantras, fasting rules, charity guidelines, and gemstones without any unnecessary superstitions.",
      },
    ],
    deliverables: [
      "North / South Indian Vedic Chart Breakdown",
      "Planetary degrees, Rashi, and Nakshatra Pada details",
      "Vimshottari Dasha timeline for the next 5–10 years",
      "Manglik, Sade Sati & Kaal Sarp dosha evaluation",
      "Direct personalized remedies recorded in your client account",
    ],
    preparationItems: [
      "Full Legal Name",
      "Date of Birth (DD/MM/YYYY)",
      "Exact Birth Time (as recorded on birth certificate/hospital slip)",
      "Exact Birth City & State",
      "2-3 specific life questions you wish to prioritize",
    ],
    faqs: [
      {
        q: "What if I do not know my exact birth time?",
        a: "Birth Time Rectification (BTR) techniques can determine your correct Lagna using significant historical life events (marriage, foreign travel, major surgeries). Please note this during consultation intake.",
      },
      {
        q: "Are the remedies complicated or expensive?",
        a: "Never. Acharya Ji prioritizes satvik remedies: Vedic mantra japa, morning Surya Arghya, charitable donations on auspicious days, and lifestyle corrections.",
      },
    ],
    ctaText: "Consult on Your Kundli",
    ctaHref: "/consult",
  },

  vastu: {
    title: "Vastu Consultancy",
    hindi: "वैदिक वास्तु परामर्श",
    subtitle: "Scientific spatial energy alignment for residential, commercial, and industrial spaces.",
    longDescription:
      "Vastu Shastra is the Vedic science of architecture that aligns human living spaces with cosmic energy grids (Pranic and Jaivik currents). Rather than suggesting destructive demolitions, Acharya Ji applies sacred Vedic geometry, elemental re-balancing (Pancha Mahabhutas), metallic energy locks, and consecrated pyramids to transform stressful properties into sanctuaries of peace and prosperity.",
    icon: Compass,
    steps: [
      {
        title: "1. Directional Grid & Floor Plan Audit",
        desc: "Analysis of your home or office layout mapped against the 16 Vastu directional zones and 32 entrance Padas.",
      },
      {
        title: "2. Elemental Imbalance Identification",
        desc: "Diagnosis of fire (Agni), water (Jal), earth (Prithvi), air (Vayu), and space (Akash) disharmonies causing financial drain or domestic friction.",
      },
      {
        title: "3. Zero-Demolition Remedy Blueprint",
        desc: "Strategic placement of copper, brass, and lead helixes, consecrated mirrors, and elemental color therapies.",
      },
      {
        title: "4. Implementation & Energy Follow-up",
        desc: "Step-by-step guidance on energizing remedies during auspicious Vedic Muhurats.",
      },
    ],
    deliverables: [
      "16-Zone Energy Assessment Report",
      "Entrance Pada & Main Door Evaluation",
      "Kitchen, Master Bedroom, and Puja Room corrections",
      "Zero-demolition non-invasive metallic remedy blueprint",
      "Auspicious installation Muhurat timings",
    ],
    preparationItems: [
      "Floor plan / architectural drawing with clear North direction",
      "Photographs or short video walk-through of the property",
      "List of specific challenges (health, cash flow, family disputes)",
    ],
    faqs: [
      {
        q: "Do I have to break walls or renovate my house?",
        a: "No. 95% of Vastu defects can be neutralized using elemental energy locks, metallic strips, energized pyramids, and color vibration corrections without breaking a single brick.",
      },
      {
        q: "Can rented apartments be corrected?",
        a: "Yes. Portable remedies (copper helixes, energized symbols, yantras) can be installed without altering the property structure and taken along when you relocate.",
      },
    ],
    ctaText: "Request Vastu Consultation",
    ctaHref: "/vastu",
  },

  gemstone: {
    title: "Gemstone Recommendation",
    hindi: "रत्न परामर्श एवं प्राण-प्रतिष्ठा",
    subtitle: "100% natural, unheated Jyotish gemstones consecrated with sacred Prana Pratishtha.",
    longDescription:
      "In Vedic science, precious gemstones act as optical cosmic filters, transmitting pure planetary rays (Kiran Shastra) into the wearer's energetic aura. Wearing an incorrect gemstone can amplify malefic influences, which is why Acharya Ji performs thorough Lagna and Shadbala cross-verification before recommending any ratna.",
    icon: Gem,
    steps: [
      {
        title: "1. Planetary Rulership & Anukul Analysis",
        desc: "We verify whether the target planet is a functional benefic (Yoga Karaka) or functional malefic for your specific ascendant.",
      },
      {
        title: "2. Ratti & Metal Calculation",
        desc: "Calculation of the exact carat weight (Ratti) and optimal setting metal (Panchadhatu, Gold, Silver, or Ashtadhatu) aligned with your body weight.",
      },
      {
        title: "3. Vedic Consecration (Prana Pratishtha)",
        desc: "The gemstone is cleansed in Ganga jal, raw cow milk, and energized with 1,008 Vedic mantra recitations under your Gotra and Nakshatra.",
      },
      {
        title: "4. Wearing Muhurat Instructions",
        desc: "Exact day, Shukla Paksha timing, and Vedic mantra for the first wear.",
      },
    ],
    deliverables: [
      "Astrological Gemstone Eligibility Certificate",
      "Government-accredited laboratory test report (unheated/untreated)",
      "Prana Pratishtha consecration video/photo confirmation",
      "Detailed ritual guide for wearing and maintenance",
    ],
    preparationItems: [
      "Accurate Janam Kundli birth details",
      "Current physical weight (for Ratti calculation)",
      "Any gemstones previously worn or currently being worn",
    ],
    faqs: [
      {
        q: "Why should I avoid synthetic or glass-filled stones?",
        a: "Synthetic and heated gems have damaged molecular lattices and cannot refract cosmic planetary energy. Only natural, eye-clean, unheated stones hold Jyotish potency.",
      },
      {
        q: "Can I wear multiple gemstones together?",
        a: "Only mutually friendly planetary gems can be combined (e.g., Ruby with Yellow Sapphire). Enemy gems (such as Blue Sapphire and Ruby) should never be worn together.",
      },
    ],
    ctaText: "Browse Certified Gemstones",
    ctaHref: "/gemstones",
  },

  "live-consultation": {
    title: "Live Consultation",
    hindi: "सीधा व्यक्तिगत परामर्श",
    subtitle: "Encrypted 1-on-1 private Chat, Voice, or Video call directly with Acharya Ji.",
    longDescription:
      "When facing crucial crossroads in career, marriage, health, or business, direct conversation provides immediate relief and clarity. In our live consultation room, Acharya Ji reviews your live Janam Kundli chart simultaneously on screen, giving you heartfelt, uncluttered answers and practical remedies.",
    icon: PhoneCall,
    steps: [
      {
        title: "1. Select Consultation Format",
        desc: "Choose between Voice Call, Video Call, or Live Text Chat — all available at the unified flat fee.",
      },
      {
        title: "2. Promotional Flat Fee (50% Off)",
        desc: "Your first consultation automatically qualifies for the promotional flat fee of ₹1,051/- (Regular ₹2,100). No hidden per-minute ticking clock.",
      },
      {
        title: "3. Direct Private Connection",
        desc: "Enter the private room. No middlemen, no recorded public streams. 100% confidential.",
      },
      {
        title: "4. Prescribed Summary in Account",
        desc: "After the session ends, access written notes, remedies, and dasha insights directly in your client portal.",
      },
    ],
    deliverables: [
      "1-on-1 direct session with Acharya Ji",
      "Live birth chart analysis on screen",
      "Direct answers to your personal queries",
      "Prescription notes saved in your account",
    ],
    preparationItems: [
      "Birth Date, Time, and City",
      "Specific questions regarding career, wealth, relationships, or health",
      "Peaceful environment for focused conversation",
    ],
    faqs: [
      {
        q: "How does consultation booking work?",
        a: "Consultations are booked on a transparent flat-fee basis (₹1,051 first consultation promo / ₹2,100 standard). You select your preferred format (Voice, Video, or Chat) and connect directly with Acharya Ji.",
      },
      {
        q: "What if Acharya Ji is offline when I visit?",
        a: "You can request a priority callback or book a guaranteed slot for his next scheduled availability.",
      },
    ],
    ctaText: "Start Live Consultation",
    ctaHref: "/consult",
  },
};

export default function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const service = SERVICE_MAP[slug];

  if (!service) {
    notFound();
  }

  const Icon = service.icon;

  return (
    <div className="bg-[#FBF3E7] text-[#3B2A1E]">
      {/* 1. Header */}
      <section className="border-b border-[#E8D8C3] bg-[#7B2D26] py-16 sm:py-20 text-[#FBF3E7]">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E8A33D]/30 bg-[#64221C] px-4 py-1 text-xs font-bold text-[#E8A33D] mb-4">
            <DiyaIcon size={14} />
            <span>{service.hindi}</span>
          </div>

          <h1 className="font-temple text-3xl sm:text-5xl font-bold tracking-tight text-[#FBF3E7]">
            {service.title}
          </h1>

          <p className="mt-4 text-base sm:text-lg text-[#FBF3E7]/80 max-w-2xl mx-auto font-body">
            {service.subtitle}
          </p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href={service.ctaHref}
              className="rounded-xl bg-[#E8A33D] px-6 py-3 text-xs sm:text-sm font-bold text-[#3B2A1E] hover:bg-[#F6CF86] transition-all shadow-md"
            >
              {service.ctaText}
            </Link>
            <Link
              href="/services"
              className="rounded-xl border border-[#FBF3E7]/30 px-6 py-3 text-xs sm:text-sm font-semibold text-[#FBF3E7] hover:bg-[#FBF3E7]/10 transition-all"
            >
              &larr; All Services
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Detailed Breakdown */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Overview text */}
          <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-8 sm:p-10 shadow-sm">
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-[#C1662F] mb-2">
              <Sparkles className="h-4 w-4" />
              <span>In-Depth Vedic Foundation</span>
            </div>
            <h2 className="font-temple text-2xl sm:text-3xl font-bold text-[#7B2D26]">
              How We Approach {service.title}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#3B2A1E]/85 leading-relaxed font-body">
              {service.longDescription}
            </p>
          </div>

          {/* Process Steps */}
          <div className="mt-12">
            <h3 className="font-temple text-2xl font-bold text-[#7B2D26] mb-6 text-center">
              Our 4-Step Consultation Methodology
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {service.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 shadow-sm"
                >
                  <h4 className="font-temple text-base font-bold text-[#7B2D26]">
                    {step.title}
                  </h4>
                  <p className="mt-2 text-xs sm:text-sm text-[#6E5545] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Deliverables & What to Prepare */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm">
              <h4 className="font-temple text-lg font-bold text-[#7B2D26] flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-[#6B8E5A]" />
                <span>What You Will Receive</span>
              </h4>
              <ul className="space-y-3 text-xs sm:text-sm text-[#3B2A1E]">
                {service.deliverables.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#E8A33D] font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm">
              <h4 className="font-temple text-lg font-bold text-[#7B2D26] flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-[#C1662F]" />
                <span>What to Prepare in Advance</span>
              </h4>
              <ul className="space-y-3 text-xs sm:text-sm text-[#3B2A1E]">
                {service.preparationItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#C1662F] font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Service Specific FAQs */}
          <div className="mt-12 rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-8 shadow-sm">
            <h3 className="font-temple text-2xl font-bold text-[#7B2D26] mb-6 flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-[#E8A33D]" />
              <span>Frequently Asked Questions</span>
            </h3>
            <div className="space-y-6">
              {service.faqs.map((faq, i) => (
                <div key={i} className="border-b border-[#E8D8C3] pb-4 last:border-0 last:pb-0">
                  <h4 className="font-bold text-sm text-[#7B2D26] mb-1.5">{faq.q}</h4>
                  <p className="text-xs sm:text-sm text-[#6E5545] leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Action CTA */}
          <div className="mt-12 rounded-3xl bg-[#7B2D26] p-8 text-center text-[#FBF3E7] shadow-lg">
            <h3 className="font-temple text-2xl sm:text-3xl font-bold">
              Ready for Authentic Vedic Guidance?
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-[#FBF3E7]/80 max-w-xl mx-auto">
              Direct consultation with {PLACEHOLDER_ASTROLOGER.displayName}. Second-by-second billing with 50% off on your first consultation.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Link
                href={service.ctaHref}
                className="rounded-xl bg-[#E8A33D] px-6 py-3 text-xs sm:text-sm font-bold text-[#3B2A1E] hover:bg-[#F6CF86] transition-all shadow-md"
              >
                {service.ctaText}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
