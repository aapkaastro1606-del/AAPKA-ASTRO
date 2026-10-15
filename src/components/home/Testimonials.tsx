"use client";

import React from "react";
import { Star, ShieldCheck, Quote } from "lucide-react";
import { MandalaDivider } from "@/components/ui/MandalaDivider";
import { PLACEHOLDER_TESTIMONIALS } from "@/config/placeholderContent";

export const Testimonials: React.FC = () => {
  const [reviews, setReviews] = React.useState<any[]>(PLACEHOLDER_TESTIMONIALS);

  React.useEffect(() => {
    fetch("/api/reviews")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.reviews?.length > 0) {
          setReviews(
            data.reviews.map((r: any, idx: number) => ({
              id: r.id || `rev-${idx}`,
              stars: r.rating || r.stars || 5,
              text: r.comment || r.text || "",
              clientName: r.clientName || "Seeker",
              city: r.city || "Verified Seeker",
              service: r.service || "Vedic Astrology",
              verified: true,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);
  return (
    <section className="border-t border-[#E8D8C3] bg-[#FFFDF9] py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E8D8C3] bg-[#FBF3E7] px-3.5 py-1 text-xs font-bold text-[#7B2D26] mb-3 font-temple">
            <Star className="h-3.5 w-3.5 fill-[#E8A33D] text-[#E8A33D]" />
            <span>REAL EXPERIENCES OF SEEKERS</span>
          </div>
          <h2 className="font-temple text-3xl sm:text-4xl font-bold text-[#7B2D26] tracking-tight">
            Client Words of Appreciation
          </h2>
          <MandalaDivider className="my-4" />
          <p className="text-[#6E5545] text-sm sm:text-base font-body">
            Trusted by a growing community of seekers seeking authentic, fear-free Vedic guidance.
          </p>
        </div>

        {/* 4-5 Realistic Placeholder Testimonials */}
        {/* PLACEHOLDER: replace with real content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="relative rounded-2xl border-2 border-[#E8D8C3] bg-[#FBF3E7]/60 p-6 sm:p-8 shadow-sm hover:border-[#C1662F] transition-all flex flex-col justify-between"
            >
              <Quote className="absolute top-6 right-6 h-8 w-8 text-[#C1662F]/20 pointer-events-none" />

              <div>
                <div className="flex items-center gap-1 text-[#E8A33D] mb-3">
                  {[...Array(r.stars)].map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-current" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-[#3B2A1E] leading-relaxed mb-6 italic font-body">
                  &ldquo;{r.text}&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-[#E8D8C3] pt-4 text-xs font-body">
                <div>
                  <div className="font-bold text-[#7B2D26] flex items-center gap-1.5 font-temple">
                    <span>{r.clientName}</span>
                    {r.verified && <ShieldCheck className="h-3.5 w-3.5 text-[#6B8E5A]" />}
                  </div>
                  <div className="text-[11px] text-[#6E5545]">{r.city}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#C1662F] text-[11px] font-temple">{r.service}</div>
                  <div className="text-[10px] text-[#A8988B]">Verified Client</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
