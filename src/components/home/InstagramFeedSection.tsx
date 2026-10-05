"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ReelsStore, AstroReel } from "@/lib/store/reelsStore";
import { PLACEHOLDER_ASTROLOGER, PLACEHOLDER_SOCIAL_LINKS } from "@/config/placeholderContent";
import { INSTAGRAM_PROFILE_URL, INSTAGRAM_HANDLE } from "@/config/featuredReels";
import { InstagramReelEmbed } from "@/components/reels/InstagramReelEmbed";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { MandalaDivider } from "@/components/ui/MandalaDivider";
import { ArrowRight, ExternalLink } from "lucide-react";

export const InstagramFeedSection: React.FC = () => {
  const [reels, setReels] = useState<AstroReel[]>([]);

  useEffect(() => {
    const updateReels = () => {
      setReels(ReelsStore.getPinnedReels().slice(0, 4));
    };

    updateReels();

    window.addEventListener("aapka_reels_updated", updateReels);
    return () => {
      window.removeEventListener("aapka_reels_updated", updateReels);
    };
  }, []);

  return (
    <section className="relative bg-[#FBF3E7] py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-[#E8D8C3]">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C1662F]/30 bg-[#FFFDF9] px-3.5 py-1 text-xs font-bold text-[#7B2D26]">
              <InstagramIcon className="h-3.5 w-3.5 text-[#E8A33D]" />
              <span>OFFICIAL INSTAGRAM REELS</span>
            </div>
            <h2 className="mt-2 font-temple text-3xl sm:text-4xl font-bold text-[#7B2D26]">
              Watch {PLACEHOLDER_ASTROLOGER.displayName} on Instagram
            </h2>
            <p className="mt-1 text-sm text-[#6E5545] max-w-2xl">
              Daily planetary transits, practical Vastu remedies, and authentic Vedic insights shared directly on {INSTAGRAM_HANDLE}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={INSTAGRAM_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#7B2D26] bg-[#FFFDF9] px-4 py-2.5 text-xs font-bold text-[#7B2D26] hover:bg-[#7B2D26] hover:text-[#FBF3E7] transition-all shadow-xs"
            >
              <span>Follow {INSTAGRAM_HANDLE}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            <Link
              href="/reels"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#7B2D26] px-4 py-2.5 text-xs font-bold text-[#FBF3E7] hover:bg-[#96372E] transition-all shadow-xs"
            >
              <span>All Reels Gallery</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Real Native Instagram Embeds Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-center">
          {reels.map((reel) => (
            <InstagramReelEmbed
              key={reel.id}
              url={reel.instagramUrl}
              caption={reel.caption}
              category={reel.category}
            />
          ))}
        </div>

        {/* Bottom Profile CTA & Divider */}
        <div className="mt-12 text-center space-y-6">
          <p className="text-xs text-[#8C7A6B]">
            All videos are served directly from Instagram via official embeds &bull; Zero third-party trackers
          </p>
          <MandalaDivider opacity={0.3} />
        </div>
      </div>
    </section>
  );
};
