"use client";

import React, { useEffect, useRef } from "react";
import { ExternalLink } from "lucide-react";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { INSTAGRAM_PROFILE_URL, INSTAGRAM_HANDLE } from "@/config/featuredReels";

interface InstagramReelEmbedProps {
  url: string;
  caption?: string;
  category?: string;
  className?: string;
}

/**
 * Normalizes an Instagram post or reel URL for the oEmbed widget
 */
function cleanInstagramUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    // Strip tracking queries (utm_*, igsh, etc.)
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return rawUrl;
  }
}

/**
 * Native Instagram Reel Embed Widget
 * Renders Instagram's official oEmbed blockquote and processes it via embed.js.
 * Displays the real video, thumbnail, and author attribution with native click-through
 * to Acharya Niraj Kumar's official profile (https://www.instagram.com/aapkaastrologer/).
 */
export const InstagramReelEmbed: React.FC<InstagramReelEmbedProps> = ({
  url,
  caption,
  category,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanUrl = cleanInstagramUrl(url);

  useEffect(() => {
    // Process existing embeds if window.instgrm is already initialized
    if (typeof window !== "undefined" && (window as any).instgrm?.Embeds) {
      (window as any).instgrm.Embeds.process();
      return;
    }

    // Otherwise, ensure Instagram's official embed.js script is loaded
    const SCRIPT_ID = "instagram-embed-script";
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      script.onload = () => {
        if ((window as any).instgrm?.Embeds) {
          (window as any).instgrm.Embeds.process();
        }
      };
      document.body.appendChild(script);
    } else {
      // Script tag exists; trigger process once loaded
      const interval = setInterval(() => {
        if ((window as any).instgrm?.Embeds) {
          (window as any).instgrm.Embeds.process();
          clearInterval(interval);
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, [cleanUrl]);

  return (
    <div
      ref={containerRef}
      className={`w-full flex flex-col items-center justify-start ${className}`}
    >
      <div className="w-full max-w-[420px] rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-3 sm:p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
        {/* Category & Astrologer Attribution Pill */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E8D8C3]/60 text-xs">
          {category ? (
            <span className="rounded-md bg-[#7B2D26]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#7B2D26] uppercase tracking-wider font-temple">
              {category}
            </span>
          ) : (
            <span className="rounded-md bg-[#7B2D26]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#7B2D26] uppercase tracking-wider font-temple">
              Vedic Jyotish
            </span>
          )}

          <a
            href={INSTAGRAM_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold text-[#7B2D26] hover:text-[#C1662F] transition-colors text-[11px]"
            title="Follow Acharya Niraj Kumar on Instagram"
          >
            <InstagramIcon className="h-3 w-3 text-[#E8A33D]" />
            <span>{INSTAGRAM_HANDLE}</span>
          </a>
        </div>

        {/* Official Instagram Embed Blockquote */}
        <div className="w-full overflow-hidden flex justify-center min-h-[440px] items-center">
          <blockquote
            className="instagram-media"
            data-instgrm-captioned
            data-instgrm-permalink={cleanUrl}
            data-instgrm-version="14"
            style={{
              background: "#FFFDF9",
              border: 0,
              borderRadius: "12px",
              boxShadow: "none",
              margin: "1px auto",
              maxWidth: "400px",
              minWidth: "280px",
              padding: 0,
              width: "100%",
            }}
          >
            {/* Native Fallback Content before embed.js hydrations */}
            <div className="p-6 flex flex-col items-center justify-center text-center space-y-3 min-h-[360px] bg-[#FAF5EE] rounded-xl border border-[#E8D8C3]/80">
              <div className="h-12 w-12 rounded-full bg-[#7B2D26]/10 flex items-center justify-center text-[#7B2D26]">
                <InstagramIcon className="h-6 w-6 text-[#C1662F]" />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-[#7B2D26] font-temple">
                  Watch on Instagram
                </p>
                <p className="text-[11px] text-[#6E5545] font-body line-clamp-2">
                  {caption || "Vedic Astrological Guidance by Acharya Niraj Kumar"}
                </p>
              </div>

              <a
                href={cleanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#7B2D26] px-4 py-2 text-xs font-bold text-[#FBF3E7] hover:bg-[#64231D] transition-all shadow-sm"
              >
                <span>View Reel on Instagram</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <a
                href={INSTAGRAM_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-[#8C7A6B] hover:text-[#7B2D26] hover:underline"
              >
                Follow {INSTAGRAM_HANDLE}
              </a>
            </div>
          </blockquote>
        </div>

        {/* Topic Title / Caption Footer */}
        {caption && (
          <div className="mt-3 pt-2.5 border-t border-[#E8D8C3]/60">
            <p className="text-xs font-semibold text-[#3B2A1E] line-clamp-2 leading-relaxed">
              {caption}
            </p>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-[#8C7A6B]">Acharya Niraj Kumar</span>
              <a
                href={cleanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#C1662F] hover:text-[#7B2D26] font-bold"
              >
                <span>Watch on App</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
