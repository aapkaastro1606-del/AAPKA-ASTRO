"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PLACEHOLDER_TESTIMONIALS, PLACEHOLDER_ASTROLOGER } from "@/config/placeholderContent";
import { MandalaDivider } from "@/components/ui/MandalaDivider";
import { DiyaIcon } from "@/components/ui/DiyaIcon";
import {
  Star,
  CheckCircle2,
  Quote,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  PhoneCall,
} from "lucide-react";

export default function TestimonialsPage() {
  const [selectedService, setSelectedService] = useState<string>("All");

  const services = [
    "All",
    "Kundli & Horoscope Reading",
    "Vastu Consultancy",
    "Gemstone Recommendation",
    "Live Consultation",
  ];

  const extendedTestimonials = [
    ...PLACEHOLDER_TESTIMONIALS,
    {
      id: "test-6",
      clientName: "Sunita Aggarwal",
      city: "Chandigarh, Punjab",
      service: "Live Consultation",
      stars: 5,
      text: "I was deeply anxious regarding my son's overseas higher education visa. Acharya Ji's reassurance and Guru mantra remedy gave us divine peace. The visa arrived in the exact Rahu-Jupiter sub-period he had highlighted!",
      verified: true,
    },
    {
      id: "test-7",
      clientName: "Karthik Sundaram",
      city: "Chennai, Tamil Nadu",
      service: "Kundli & Horoscope Reading",
      stars: 5,
      text: "The Sade Sati explanation took away all my fear. Instead of selling expensive rituals, Acharya Ji prescribed simple daily seva and Shani Stotra. My business turned profitable within six months.",
      verified: true,
    },
    {
      id: "test-8",
      clientName: "Nisha Patel",
      city: "Ahmedabad, Gujarat",
      service: "Vastu Consultancy",
      stars: 5,
      text: "Our manufacturing unit was experiencing recurrent machinery breakdowns. Acharya Ji audited the directional energy without requiring any demolition. Applying the copper helix remedy stabilized our production within weeks.",
      verified: true,
    },
  ];

  const filteredTestimonials = extendedTestimonials.filter((t) => {
    if (selectedService === "All") return true;
    return t.service.toLowerCase().includes(selectedService.toLowerCase());
  });

  return (
    <div className="bg-[#FBF3E7] text-[#3B2A1E]">
      {/* 1. Header Banner */}
      <section className="border-b border-[#E8D8C3] bg-[#7B2D26] py-16 sm:py-20 text-[#FBF3E7]">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E8A33D]/30 bg-[#64221C] px-4 py-1 text-xs font-bold text-[#E8A33D] mb-4">
            <DiyaIcon size={14} />
            <span>VERIFIED CLIENT EXPERIENCES</span>
          </div>

          <h1 className="font-temple text-3xl sm:text-5xl font-bold tracking-tight text-[#FBF3E7]">
            Words of Trust &amp; Transformation
          </h1>

          <p className="mt-3 text-sm sm:text-base text-[#FBF3E7]/80 max-w-2xl mx-auto font-body">
            Real stories from genuine seekers guided by {PLACEHOLDER_ASTROLOGER.displayName} across India and overseas.
          </p>

          {/* Trust Milestone Badge */}
          <div className="mt-8 inline-flex items-center gap-6 rounded-2xl bg-[#FFFDF9] px-6 py-3 shadow-lg text-[#3B2A1E]">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-7 w-7 text-[#6B8E5A]" />
              <div className="text-left">
                <div className="font-temple text-xl font-bold text-[#7B2D26]">15,000+</div>
                <div className="text-[11px] text-[#6E5545] font-semibold">Natal Charts Analyzed</div>
              </div>
            </div>
            <div className="h-8 w-px bg-[#E8D8C3]" />
            <div className="text-left text-xs">
              <div className="font-bold text-[#7B2D26]">Two Decades of Mastery</div>
              <div className="text-[#6E5545]">Direct Counsel with Acharya Ji</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Testimonials Grid */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Service Filter */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-10">
            {services.map((svc) => (
              <button
                key={svc}
                type="button"
                onClick={() => setSelectedService(svc)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                  selectedService === svc
                    ? "bg-[#7B2D26] text-[#FBF3E7] shadow-sm"
                    : "bg-[#FFFDF9] text-[#3B2A1E] border border-[#E8D8C3] hover:bg-[#FBF3E7]"
                }`}
              >
                {svc}
              </button>
            ))}
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTestimonials.map((item) => (
              <div
                key={item.id}
                className="relative rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex text-[#E8A33D]">
                      {[...Array(item.stars)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-[#E8A33D]" />
                      ))}
                    </div>
                    <span className="rounded-md bg-[#FBF3E7] px-2 py-0.5 text-[10px] font-bold text-[#7B2D26] border border-[#E8D8C3]">
                      {item.service}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#3B2A1E]/90 leading-relaxed italic">
                    &ldquo;{item.text}&rdquo;
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E8D8C3] flex items-center justify-between">
                  <div>
                    <h4 className="font-temple text-sm font-bold text-[#7B2D26]">
                      {item.clientName}
                    </h4>
                    <span className="text-[11px] text-[#6E5545]">{item.city}</span>
                  </div>

                  {item.verified && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#6B8E5A]">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Box */}
          <div className="mt-16 rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-8 sm:p-12 text-center shadow-sm max-w-4xl mx-auto">
            <h3 className="font-temple text-2xl sm:text-3xl font-bold text-[#7B2D26]">
              Have You Had a Consultation with Acharya Ji?
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-[#6E5545] max-w-lg mx-auto">
              Your honest feedback illuminates the path for fellow seekers. Leave your review directly in your client portal.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Link
                href="/account/reviews"
                className="rounded-xl bg-[#7B2D26] px-6 py-3 text-xs sm:text-sm font-bold text-[#FBF3E7] hover:bg-[#96372E] transition-all shadow-sm"
              >
                Submit Your Review
              </Link>
              <Link
                href="/consult"
                className="rounded-xl bg-[#E8A33D] px-6 py-3 text-xs sm:text-sm font-bold text-[#3B2A1E] hover:bg-[#F6CF86] transition-all shadow-sm"
              >
                Book a Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
