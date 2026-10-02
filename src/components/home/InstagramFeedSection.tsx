"use client";

import React from "react";
import Link from "next/link";
import { ReelsStore } from "@/lib/store/reelsStore";
import { PLACEHOLDER_ASTROLOGER, PLACEHOLDER_SOCIAL_LINKS } from "@/config/placeholderContent";
import { Play, Eye, Heart, ArrowRight, ExternalLink } from "lucide-react";
import { MandalaDivider } from "@/components/ui/MandalaDivider";

export const InstagramFeedSection: React.FC = () => {
  const reels = ReelsStore.getPinnedReels().slice(0, 4);

  return (
    <section className="relative bg-[#FBF3E7] py-20 px-4 sm:px-6 lg:px-8 border-b border-[#E8D8C3]">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C1662F]/30 bg-[#FFFDF9] px-3.5 py-1 text-xs font-bold text-[#7B2D26]">
              <span>DAILY VEDIC GUIDANCE &amp; REELS</span>
            </div>
            <h2 className="mt-2 font-temple text-3xl sm:text-4xl font-bold text-[#7B2D26]">
              Watch {PLACEHOLDER_ASTROLOGER.displayName} on Instagram
            </h2>
            <p className="mt-1 text-sm text-[#6E5545]">
              Daily transit wisdom, Vastu principles, and genuine gemstone insights shared directly by {PLACEHOLDER_ASTROLOGER.displayName}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={PLACEHOLDER_SOCIAL_LINKS.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#7B2D26] bg-[#FFFDF9] px-4 py-2 text-xs font-bold text-[#7B2D26] hover:bg-[#7B2D26] hover:text-[#FBF3E7] transition-all"
            >
              <span>Follow {PLACEHOLDER_SOCIAL_LINKS.instagram.handle}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            <Link
              href="/reels"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#7B2D26] px-4 py-2 text-xs font-bold text-[#FBF3E7] hover:bg-[#96372E] transition-all shadow-sm"
            >
              <span>All Reels Gallery</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Reels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reels.map((reel) => (
            <div
              key={reel.id}
              className="group relative overflow-hidden rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] shadow-sm hover:shadow-md transition-all flex flex-col"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-[9/14] w-full overflow-hidden bg-[#3B2A1E]">
                <img
                  src={reel.thumbnail}
                  alt={reel.caption}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Badge Category */}
                <div className="absolute top-3 left-3 rounded-md bg-[#7B2D26]/85 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-[#FBF3E7]">
                  {reel.category}
                </div>

                {/* Duration */}
                <div className="absolute top-3 right-3 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-mono text-white">
                  {reel.videoDuration}
                </div>

                {/* Center Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8A33D] text-[#3B2A1E] shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="h-5 w-5 fill-[#3B2A1E] ml-0.5" />
                  </div>
                </div>

                {/* Engagement Stats on bottom of video */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/90">
                  <span className="flex items-center gap-1 font-medium text-[11px]">
                    <Eye className="h-3.5 w-3.5" />
                    {reel.views}
                  </span>
                  <span className="flex items-center gap-1 font-medium text-[11px]">
                    <Heart className="h-3.5 w-3.5 text-rose-400 fill-rose-400" />
                    {reel.likes}
                  </span>
                </div>
              </div>

              {/* Caption & External Link */}
              <div className="p-4 flex flex-col flex-1 justify-between bg-[#FFFDF9]">
                <p className="text-xs font-semibold text-[#3B2A1E] line-clamp-2 leading-relaxed">
                  {reel.caption}
                </p>
                <div className="mt-3 pt-3 border-t border-[#E8D8C3] flex items-center justify-between text-[11px]">
                  <span className="text-[#6E5545]">{reel.date}</span>
                  <a
                    href={reel.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-[#C1662F] hover:text-[#7B2D26] inline-flex items-center gap-1"
                  >
                    <span>View on Insta</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <MandalaDivider opacity={0.3} />
        </div>
      </div>
    </section>
  );
};
