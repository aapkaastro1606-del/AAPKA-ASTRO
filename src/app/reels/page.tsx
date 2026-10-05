"use client";

import React, { useEffect, useState } from "react";
import { ReelsStore, AstroReel } from "@/lib/store/reelsStore";
import { PLACEHOLDER_ASTROLOGER } from "@/config/placeholderContent";
import { INSTAGRAM_PROFILE_URL, INSTAGRAM_HANDLE } from "@/config/featuredReels";
import { InstagramReelEmbed } from "@/components/reels/InstagramReelEmbed";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { MandalaDivider } from "@/components/ui/MandalaDivider";
import { DiyaIcon } from "@/components/ui/DiyaIcon";
import { ExternalLink, Sparkles } from "lucide-react";

export default function ReelsPage() {
  const [allReels, setAllReels] = useState<AstroReel[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", "Horoscope", "Vastu", "Gemstone", "Remedy"];

  useEffect(() => {
    const updateReels = () => {
      setAllReels(ReelsStore.getVisibleReels());
    };

    updateReels();

    window.addEventListener("aapka_reels_updated", updateReels);
    return () => {
      window.removeEventListener("aapka_reels_updated", updateReels);
    };
  }, []);

  const filteredReels = allReels.filter(
    (r) => activeCategory === "All" || r.category === activeCategory
  );

  return (
    <div className="bg-[#FBF3E7] text-[#3B2A1E] min-h-screen">
      {/* 1. Header Banner */}
      <section className="border-b border-[#E8D8C3] bg-[#7B2D26] py-16 sm:py-20 text-[#FBF3E7]">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E8A33D]/30 bg-[#64221C] px-4 py-1 text-xs font-bold text-[#E8A33D] mb-4">
            <DiyaIcon size={14} />
            <span>AUTHENTIC INSTAGRAM EMBEDS</span>
          </div>

          <h1 className="font-temple text-3xl sm:text-5xl font-bold tracking-tight text-[#FBF3E7]">
            Instagram Reels &amp; Astrological Shorts
          </h1>

          <p className="mt-3 text-sm sm:text-base text-[#FBF3E7]/80 max-w-2xl mx-auto font-body">
            Daily bite-sized Jyotish guidance, planetary transit alerts, and authentic Vastu tips embedded directly from {INSTAGRAM_HANDLE}.
          </p>

          <div className="mt-6 flex items-center justify-center gap-4">
            <a
              href={INSTAGRAM_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#E8A33D] px-6 py-3 text-xs sm:text-sm font-bold text-[#3B2A1E] hover:bg-[#F6CF86] transition-all shadow-md"
            >
              <InstagramIcon className="h-4 w-4" />
              <span>Follow Acharya Niraj Kumar ({INSTAGRAM_HANDLE})</span>
              <ExternalLink className="h-4 w-4 ml-1" />
            </a>
          </div>
        </div>
      </section>

      {/* 2. Reels Gallery */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Category Filter */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`rounded-xl px-5 py-2 text-xs font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-[#7B2D26] text-[#FBF3E7] shadow-sm"
                    : "bg-[#FFFDF9] text-[#3B2A1E] border border-[#E8D8C3] hover:bg-[#FBF3E7]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Real Native Instagram Embeds Grid */}
          {filteredReels.length === 0 ? (
            <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-12 text-center max-w-md mx-auto">
              <p className="text-sm font-bold text-[#7B2D26]">No reels in this category yet.</p>
              <p className="text-xs text-[#6E5545] mt-1">
                Explore our full catalog of daily videos on Instagram.
              </p>
              <a
                href={INSTAGRAM_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#7B2D26] px-4 py-2 text-xs font-bold text-[#FBF3E7]"
              >
                <span>Visit {INSTAGRAM_HANDLE}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-center">
              {filteredReels.map((reel) => (
                <InstagramReelEmbed
                  key={reel.id}
                  url={reel.instagramUrl}
                  caption={reel.caption}
                  category={reel.category}
                />
              ))}
            </div>
          )}

          {/* 3. Follow Footer Banner */}
          <div className="mt-16 rounded-3xl border border-[#E8A33D]/60 bg-[#FAF1E4] p-8 text-center max-w-3xl mx-auto shadow-sm">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#7B2D26]/10 px-3 py-1 text-xs font-bold text-[#7B2D26] font-temple mb-2">
              <Sparkles className="h-3.5 w-3.5 text-[#E8A33D]" />
              <span>FRESH REELS DAILY</span>
            </div>
            <h3 className="font-temple text-xl sm:text-2xl font-bold text-[#7B2D26]">
              Never Miss a Celestial Transit Alert
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-[#6E5545] max-w-xl mx-auto font-body">
              Join thousands of seekers on Instagram for daily Rashifal, auspicious Muhurat timings, festival Puja vidhi, and AstroVastu directional guidelines.
            </p>
            <div className="mt-5">
              <a
                href={INSTAGRAM_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#7B2D26] px-6 py-3 text-xs sm:text-sm font-bold text-[#FBF3E7] hover:bg-[#64231D] transition-all shadow-md"
              >
                <InstagramIcon className="h-4 w-4" />
                <span>Follow @aapkaastrologer on Instagram</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div className="mt-16 text-center">
            <MandalaDivider opacity={0.3} />
          </div>
        </div>
      </section>
    </div>
  );
}
