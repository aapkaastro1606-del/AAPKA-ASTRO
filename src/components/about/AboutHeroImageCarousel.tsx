"use client";

import React, { useState, useEffect, useRef } from "react";
import { Award, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";

interface CarouselSlide {
  src: string;
  alt: string;
  badge: string;
  caption: string;
  objectPosition?: string;
}

const SLIDES: CarouselSlide[] = [
  {
    src: "/gallery/felicitation_pashupati_award.jpg",
    alt: "Acharya Niraj Kumar receiving felicitation plaque",
    badge: "Felicitation & Award Plaque",
    caption: "Plaque presentation at industrial leadership conclave",
    objectPosition: "object-top",
  },
  {
    src: "/gallery/best_astrologer_award.jpg",
    alt: "Acharya Niraj Kumar receiving Best Astrologer award",
    badge: "Best Astrologer Recognition",
    caption: "Certificate presented at public astrology conclave",
    objectPosition: "object-top",
  },
  {
    src: "/gallery/dignitary_greeting.jpg",
    alt: "Acharya Niraj Kumar receiving floral greeting from senior dignitary",
    badge: "Dignitary Floral Greeting",
    caption: "Floral welcome and felicitation by senior dignitary",
    objectPosition: "object-top",
  },
  {
    src: "/gallery/with_spiritual_guide.jpg",
    alt: "Acharya Niraj Kumar with spiritual mentor",
    badge: "Spiritual Mentorship",
    caption: "With his spiritual guide in traditional ashram setting",
    objectPosition: "object-center",
  },
  {
    src: "/gallery/Awards_Receiving.jpg",
    alt: "Acharya Niraj Kumar memento presentation",
    badge: "Memento Presentation",
    caption: "Memento presentation by state dignitary",
    objectPosition: "object-top",
  },
];

export const AboutHeroImageCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-advance every 5 seconds (5000ms), pausing when user hovers
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  };

  const currentSlide = SLIDES[currentIndex];

  return (
    <div
      className="relative w-full max-w-md overflow-hidden rounded-3xl border-4 border-[#E8D8C3] bg-[#3B2A1E] shadow-xl group select-none h-[490px] sm:h-[510px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Acharya Niraj Kumar Recognition & Credentials Gallery"
    >
      {/* 1. Stacked Slide Images with 700ms Smooth Cross-Fade */}
      {SLIDES.map((slide, index) => {
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
              className={`w-full h-full object-cover ${slide.objectPosition || "object-top"} filter contrast-[1.03] transition-transform duration-700 ease-out ${
                isActive ? "scale-100" : "scale-[1.02]"
              }`}
            />
          </div>
        );
      })}

      {/* 2. Permanent Vignette & Bottom Text Gradient */}
      <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-t from-[#261A12]/95 via-[#261A12]/40 to-transparent" />

      {/* 3. Top Floating Badge: Category of the Current Photo + 5s Auto-Rotation Indicator */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#7B2D26]/90 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-[#FBF3E7] border border-[#E8A33D]/40 shadow-md">
          <Award className="h-3.5 w-3.5 text-[#E8A33D] shrink-0" />
          <span>{currentSlide.badge}</span>
        </span>

        {/* Live Auto-Rotation Pill */}
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md transition-colors ${
            isPaused
              ? "bg-[#3B2A1E]/80 text-[#E8D8C3] border border-[#E8D8C3]/30"
              : "bg-[#6B8E5A]/80 text-white"
          }`}
          title={isPaused ? "Rotation paused on hover" : "Auto-changing every 5 seconds"}
        >
          {isPaused ? "Paused" : "5s Auto"}
        </span>
      </div>

      {/* 4. Navigation Arrows (Visible on hover on desktop, always accessible via tap on mobile) */}
      <button
        type="button"
        onClick={handlePrev}
        aria-label="Previous photo"
        className="absolute left-2.5 top-1/2 -translate-y-1/2 z-30 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#3B2A1E]/60 text-white hover:bg-[#7B2D26] hover:scale-105 backdrop-blur-md border border-white/20 transition-all cursor-pointer opacity-80 sm:opacity-0 group-hover:opacity-100 shadow-md"
      >
        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>

      <button
        type="button"
        onClick={handleNext}
        aria-label="Next photo"
        className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#3B2A1E]/60 text-white hover:bg-[#7B2D26] hover:scale-105 backdrop-blur-md border border-white/20 transition-all cursor-pointer opacity-80 sm:opacity-0 group-hover:opacity-100 shadow-md"
      >
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>

      {/* 5. Bottom Overlay Content: Astrologer Name, Verified Credentials & Dynamic Caption */}
      <div className="absolute bottom-4 left-4 right-4 z-30 text-white text-center">
        <div className="font-temple text-2xl font-bold text-[#E8A33D] drop-shadow-sm">
          Acharya Niraj Kumar
        </div>
        <p className="text-xs text-[#FBF3E7]/95 mt-0.5 font-medium">
          Jyotish Acharya &bull; Vastu &amp; Gemstone Consultant
        </p>
        <p className="text-[11px] text-[#E8D8C3] mt-1 italic font-light line-clamp-1">
          &ldquo;{currentSlide.caption}&rdquo;
        </p>

        {/* Certified Badge */}
        <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-[#7B2D26]/85 backdrop-blur-sm px-3 py-1 text-[11px] font-semibold border border-[#E8A33D]/40">
          <ShieldCheck className="h-3.5 w-3.5 text-[#E8A33D]" />
          <span>Bhartiya Vidya Bhawan &bull; Divya Vastu Certified</span>
        </div>

        {/* 6. Pagination / Progress Dots */}
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {SLIDES.map((_, dotIdx) => {
            const isDotActive = dotIdx === currentIndex;
            return (
              <button
                key={dotIdx}
                type="button"
                onClick={() => setCurrentIndex(dotIdx)}
                aria-label={`Go to slide ${dotIdx + 1} (${SLIDES[dotIdx].badge})`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  isDotActive
                    ? "w-6 bg-[#E8A33D] shadow-xs"
                    : "w-2 bg-white/40 hover:bg-white/80"
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
