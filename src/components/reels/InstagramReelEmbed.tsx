"use client";

import React, { useEffect, useRef, useState } from "react";
import { ExternalLink, Play, Pause, Volume2, VolumeX, Maximize2 } from "lucide-react";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { INSTAGRAM_PROFILE_URL, INSTAGRAM_HANDLE } from "@/config/featuredReels";

interface InstagramReelEmbedProps {
  url: string;
  videoUrl?: string;
  posterUrl?: string;
  videoDuration?: string;
  caption?: string;
  category?: string;
  className?: string;
}

/**
 * High-Performance Native Reel Player & Instagram Embed
 * - When videoUrl is present: Renders an ultra-fast, zero-lag HTML5 video player
 *   with IntersectionObserver lazy loading, hardware-accelerated playback,
 *   mute/unmute controls, and instant click-through to @aapkaastrologer.
 * - When videoUrl is absent: Fallbacks gracefully to Instagram's oEmbed blockquote.
 */
export const InstagramReelEmbed: React.FC<InstagramReelEmbedProps> = ({
  url,
  videoUrl,
  posterUrl,
  videoDuration,
  caption,
  category,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isInView, setIsInView] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  const defaultPoster = "/videos/reels/posters/thumb-DeZIvudACZW.jpg";
  const [imgSrc, setImgSrc] = useState<string>(posterUrl || defaultPoster);

  useEffect(() => {
    if (posterUrl) {
      setImgSrc(posterUrl);
    }
  }, [posterUrl]);

  // Lazy loading observer: Only mount/activate video when scrolled near viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
          } else {
            // Auto-pause when user scrolls away to save CPU and battery
            if (videoRef.current && !videoRef.current.paused) {
              videoRef.current.pause();
              setIsPlaying(false);
            }
          }
        });
      },
      { rootMargin: "150px 0px", threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Play / Pause toggle
  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;

    if (vid.paused) {
      vid
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Fallback if browser blocks sound autoplay
          vid.muted = true;
          setIsMuted(true);
          vid.play().then(() => setIsPlaying(true));
        });
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  };

  // Mute / Unmute toggle
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = !vid.muted;
    setIsMuted(vid.muted);
  };

  // Update progress bar
  const handleTimeUpdate = () => {
    const vid = videoRef.current;
    if (!vid || !vid.duration) return;
    setProgress((vid.currentTime / vid.duration) * 100);
  };

  return (
    <div
      ref={containerRef}
      className={`w-full flex flex-col items-center justify-start ${className}`}
    >
      <div className="w-full max-w-[380px] rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-3 sm:p-4 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group">
        {/* Category & Astrologer Attribution Pill */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E8D8C3]/60 text-xs">
          <span className="rounded-md bg-[#7B2D26]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#7B2D26] uppercase tracking-wider font-temple">
            {category || "Vedic Jyotish"}
          </span>

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

        {/* Video Canvas Container (9:16 Aspect Ratio) */}
        <div
          onClick={(e) => {
            if (videoUrl) {
              togglePlay(e);
            } else if (url) {
              e.stopPropagation();
              window.open(url, "_blank", "noopener,noreferrer");
            }
          }}
          title={videoUrl ? (isPlaying ? "Pause video" : "Play video") : "Watch this reel on Instagram"}
          className="relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-[#2A1D15] cursor-pointer shadow-inner select-none"
        >
          {videoUrl && isInView ? (
            <video
              ref={videoRef}
              src={videoUrl}
              poster={imgSrc}
              preload="metadata"
              playsInline
              loop
              muted={isMuted}
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="h-full w-full object-cover"
            />
          ) : (
            <img
              src={imgSrc}
              alt={caption || "Aapka Astro Reel"}
              loading="lazy"
              decoding="async"
              onError={() => setImgSrc(defaultPoster)}
              className="h-full w-full object-cover"
            />
          )}

          {/* Top Duration Badge */}
          {videoDuration && (
            <div className="absolute top-2.5 left-2.5 rounded-md bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[10px] font-mono font-bold text-white shadow-xs">
              {videoDuration}
            </div>
          )}

          {/* Top Right Sound Toggle */}
          {videoUrl && (
            <button
              type="button"
              onClick={toggleMute}
              className="absolute top-2.5 right-2.5 rounded-full bg-black/60 p-2 text-white hover:bg-[#7B2D26] transition-colors shadow-md z-10"
              title={isMuted ? "Unmute Sound" : "Mute Sound"}
            >
              {isMuted ? (
                <VolumeX className="h-3.5 w-3.5" />
              ) : (
                <Volume2 className="h-3.5 w-3.5 text-[#E8A33D]" />
              )}
            </button>
          )}

          {/* Center Play Overlay Icon (shown when paused or when static poster is active) */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/25 transition-opacity pointer-events-none">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E8A33D] text-[#3B2A1E] shadow-xl transform group-hover:scale-110 transition-transform">
                <Play className="h-6 w-6 fill-[#3B2A1E] ml-0.5" />
              </div>
            </div>
          )}

          {/* Subtle gradient overlay at bottom for controls */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Bottom Video Progress Bar */}
          {videoUrl && (
            <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20">
              <div
                className="h-full bg-[#E8A33D] transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Topic Title / Caption Footer */}
        <div className="mt-3 pt-2.5 border-t border-[#E8D8C3]/60 flex flex-col justify-between flex-1">
          <p className="text-xs font-semibold text-[#3B2A1E] line-clamp-2 leading-relaxed">
            {caption || "Vedic Astrological Guidance by Acharya Niraj Kumar"}
          </p>

          <div className="mt-3 flex items-center justify-between text-[11px] pt-1">
            <span className="text-[#8C7A6B] font-medium font-body">Acharya Niraj Kumar</span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#7B2D26]/10 px-2.5 py-1 text-[#7B2D26] hover:bg-[#7B2D26] hover:text-[#FBF3E7] font-bold transition-all"
              title="Open full reel on Instagram"
            >
              <span>Watch on Instagram</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
