"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

export interface HeroCarouselSlide {
  src: string;
  alt: string;
  badge: string;
  caption: string;
  objectPosition?: string;
}

export const HERO_SLIDES: HeroCarouselSlide[] = [
  {
    src: "/gallery/felicitation_pashupati_award.jpg",
    alt: "Acharya Niraj Kumar receiving felicitation honor and memento",
    badge: "Jyotish Acharya & Vastu Expert",
    caption: "Felicitation by State Dignitaries",
    objectPosition: "object-top",
  },
  {
    src: "/gallery/best_astrologer_award.jpg",
    alt: "Acharya Niraj Kumar receiving Best Astrologer award",
    badge: "Jyotish Acharya & Vastu Expert",
    caption: "National Astrology Conclave Honor",
    objectPosition: "object-top",
  },
  {
    src: "/gallery/dignitary_greeting.jpg",
    alt: "Acharya Niraj Kumar receiving floral greeting from senior dignitary",
    badge: "Jyotish Acharya & Vastu Expert",
    caption: "Stage Greeting by Senior Dignitaries",
    objectPosition: "object-top",
  },
  {
    src: "/gallery/Getting_Certificates.jpg",
    alt: "Acharya Niraj Kumar at Live Vastu Workshop Haridwar",
    badge: "Jyotish Acharya & Vastu Expert",
    caption: "Live Vastu Workshop Felicitation",
    objectPosition: "object-top",
  },
  {
    src: "/gallery/Getting_Awards.jpg",
    alt: "Acharya Niraj Kumar receiving stage award",
    badge: "Jyotish Acharya & Vastu Expert",
    caption: "Distinguished Service Award",
    objectPosition: "object-top",
  },
  {
    src: "/gallery/with_spiritual_guide.jpg",
    alt: "Acharya Niraj Kumar with spiritual mentor",
    badge: "Jyotish Acharya & Vastu Expert",
    caption: "Traditional Ashram Guru Parampara",
    objectPosition: "object-center",
  },
];

export const HeroImageCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check prefers-reduced-motion accessibility preference
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleMotionChange);
    return () => mediaQuery.removeEventListener("change", handleMotionChange);
  }, []);

  // 5-second auto-advance timer with pause on hover or reduced-motion
  useEffect(() => {
    if (isPaused || prefersReducedMotion) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPaused, prefersReducedMotion]);

  const goToPrev = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  const goToNext = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const currentSlide = HERO_SLIDES[currentIndex];

  return (
    <div
      className="relative mb-5 overflow-hidden rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] shadow-inner select-none group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      role="region"
      aria-label="Acharya Niraj Kumar Credentials and Recognition Carousel"
    >
      {/* 1. Crossfading Image Stack (Height: h-64 sm:h-72 w-full) */}
      <div className="relative h-64 sm:h-72 w-full overflow-hidden">
        {HERO_SLIDES.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={slide.src}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
              aria-hidden={!isActive}
            >
              <img
                src={slide.src}
                alt={slide.alt}
                className={`h-full w-full object-cover ${slide.objectPosition || "object-top"} filter contrast-[1.02] transition-transform duration-700 ease-out ${
                  isActive ? "scale-100" : "scale-[1.02]"
                }`}
              />
            </div>
          );
        })}

        {/* Subtle Vignette Gradient for Text Contrast */}
        <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-t from-[#3B2A1E]/85 via-transparent to-[#3B2A1E]/20" />

        {/* Top-Right Pause / Status Indicator (Subtle, informative) */}
        {isPaused && !prefersReducedMotion && (
          <div className="absolute top-2.5 right-2.5 z-30 pointer-events-none">
            <span className="rounded-full bg-[#3B2A1E]/80 backdrop-blur-xs px-2 py-0.5 text-[10px] font-semibold text-[#E8A33D] border border-[#E8A33D]/30 shadow-xs">
              Paused
            </span>
          </div>
        )}

        {/* Bottom Floating Badge & Rating Strip: Preserved exactly as-is across all photos */}
        <div className="absolute bottom-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
          <div className="rounded-lg bg-[#FFFDF9]/95 backdrop-blur-xs px-2.5 py-1 text-xs font-bold text-[#7B2D26] shadow-sm border border-[#E8D8C3] font-temple">
            Jyotish Acharya &bull; Vastu Expert
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-[#E8A33D] px-2 py-1 text-xs font-black text-[#3B2A1E] shadow-sm">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span>4.98</span>
          </div>
        </div>

        {/* Previous / Next Arrow Controls (Subtle, visible on hover / focus) */}
        <button
          type="button"
          onClick={goToPrev}
          aria-label="Previous photo"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-30 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#3B2A1E]/60 text-white hover:bg-[#7B2D26] hover:scale-105 backdrop-blur-xs border border-white/20 transition-all cursor-pointer opacity-70 sm:opacity-0 group-hover:opacity-100 shadow-sm"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={goToNext}
          aria-label="Next photo"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-30 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#3B2A1E]/60 text-white hover:bg-[#7B2D26] hover:scale-105 backdrop-blur-xs border border-white/20 transition-all cursor-pointer opacity-70 sm:opacity-0 group-hover:opacity-100 shadow-sm"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* 2. Warm Gold Subtle Dot Indicators & Caption Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#FFFDF9] border-t border-[#E8D8C3]/80 text-[11px]">
        {/* Caption */}
        <span className="text-[#6E5545] font-medium truncate max-w-[65%]" title={currentSlide.caption}>
          {currentSlide.caption}
        </span>

        {/* Dot Indicators */}
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Carousel slide selector">
          {HERO_SLIDES.map((slide, dotIdx) => {
            const isDotActive = dotIdx === currentIndex;
            return (
              <button
                key={dotIdx}
                type="button"
                role="tab"
                aria-selected={isDotActive}
                aria-label={`Show ${slide.badge} (${dotIdx + 1} of ${HERO_SLIDES.length})`}
                onClick={() => setCurrentIndex(dotIdx)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  isDotActive
                    ? "w-5 bg-[#C1662F] shadow-xs"
                    : "w-1.5 bg-[#E8D8C3] hover:bg-[#C1662F]/60"
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
