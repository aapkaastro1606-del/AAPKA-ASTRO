"use client";

import React, { useEffect, useState } from "react";

export const PRELOADER_SESSION_KEY = "aapka_preloader_session_seen";

/**
 * BrandedPreloader
 * ----------------
 * Lightweight, pure CSS/SVG + CSS-3D animated preloader shown ONLY once per browser session
 * on the site's initial cold load (never on internal client-side Next.js route navigations).
 *
 * Performance & TTI guarantees:
 * 1. Does NOT wrap or gate `{children}` — the actual page renders and hydrates underneath
 *    immediately in parallel.
 * 2. Includes a synchronous inline `<script>` that checks `sessionStorage` during HTML parsing
 *    before first paint so repeat visits within the same session never flash the overlay.
 * 3. Uses GPU-composited `transform` and `opacity` animations only (0 KB external dependencies).
 * 4. Automatically releases pointer events (`pointer-events-none`) after 420ms and unmounts cleanly.
 */
export const BrandedPreloader: React.FC = () => {
  const [phase, setPhase] = useState<"active" | "fading" | "hidden">("active");

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(PRELOADER_SESSION_KEY) === "1") {
        setPhase("hidden");
        return;
      }
      window.sessionStorage.setItem(PRELOADER_SESSION_KEY, "1");
    } catch {
      // Ignore storage errors in restricted private browsing modes
    }

    // Respect prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setPhase("hidden");
      return;
    }

    // Begin smooth fade-out quickly once initial frame settles (never blocks TTI)
    const fadeTimer = window.setTimeout(() => {
      setPhase("fading");
    }, 520);

    const unmountTimer = window.setTimeout(() => {
      setPhase("hidden");
    }, 920);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(unmountTimer);
    };
  }, []);

  if (phase === "hidden") {
    return null;
  }

  // 9 Navratna (Sacred Planetary Gemstones) around the 3D-perspective orbital ring
  const navratnaGems = [
    { name: "Ruby (Surya)", angle: 0, color: "#E03131", rim: "#FFA8A8" },
    { name: "Pearl (Chandra)", angle: 40, color: "#FFFDF9", rim: "#FBF3E7" },
    { name: "Coral (Mangal)", angle: 80, color: "#E8590C", rim: "#FFC078" },
    { name: "Emerald (Budha)", angle: 120, color: "#2F9E44", rim: "#8CE99A" },
    { name: "Yellow Sapphire (Guru)", angle: 160, color: "#F59F00", rim: "#FFE066" },
    { name: "Diamond (Shukra)", angle: 200, color: "#E9ECEF", rim: "#FFFFFF" },
    { name: "Blue Sapphire (Shani)", angle: 240, color: "#3B5BDB", rim: "#91A7FF" },
    { name: "Hessonite (Rahu)", angle: 280, color: "#C1662F", rim: "#F7C59F" },
    { name: "Cat's Eye (Ketu)", angle: 320, color: "#9C836E", rim: "#E8D8C3" },
  ];

  return (
    <div
      id="aapka-branded-preloader"
      role="status"
      aria-live="polite"
      aria-label="Loading Aapka Astro"
      onClick={() => setPhase("hidden")}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,#7B2D26_0%,#4A1813_65%,#2A0C09_100%)] px-6 text-[#FBF3E7] transition-opacity duration-400 ease-out ${
        phase === "fading"
          ? "opacity-0 pointer-events-none"
          : "opacity-100 pointer-events-none"
      }`}
    >
      {/* Synchronous pre-hydration check + independent compositor fade-out so TTI is never delayed */}
      <script
        dangerouslySetInnerHTML={{
          __html: `try{var k='${PRELOADER_SESSION_KEY}',el=document.getElementById('aapka-branded-preloader');if(sessionStorage.getItem(k)==='1'){if(el){el.style.display='none';}}else{sessionStorage.setItem(k,'1');setTimeout(function(){if(el){el.style.opacity='0';}},600);setTimeout(function(){if(el){el.style.display='none';}},980);}}catch(e){}`,
        }}
      />

      <style>{`
        @keyframes aapkaMandalaCW {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes aapkaMandalaCCW {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes aapkaGemOrbit3D {
          0% { transform: perspective(560px) rotateX(62deg) rotateZ(0deg); }
          100% { transform: perspective(560px) rotateX(62deg) rotateZ(360deg); }
        }
        @keyframes aapkaOmPulse {
          0%, 100% { transform: scale(0.96); filter: drop-shadow(0 0 12px rgba(232,163,61,0.55)); }
          50% { transform: scale(1.05); filter: drop-shadow(0 0 24px rgba(232,163,61,0.95)); }
        }
        @keyframes aapkaProgressSweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* Ambient Temple Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-[#E8A33D]/15 blur-3xl"
      />

      {/* Sacred Mandala + 3D Navratna Gemstone Ring + Pulsing Om Emblem */}
      <div className="relative flex h-44 w-44 sm:h-52 sm:w-52 items-center justify-center">
        {/* 1. Outer 12-Petal Vedic Lotus Mandala (Slow Clockwise SVG) */}
        <svg
          viewBox="0 0 240 240"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full text-[#E8A33D]/35"
          style={{ animation: "aapkaMandalaCW 16s linear infinite" }}
        >
          <circle
            cx="120"
            cy="120"
            r="112"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
          <circle
            cx="120"
            cy="120"
            r="98"
            fill="none"
            stroke="#E8A33D"
            strokeOpacity="0.45"
            strokeWidth="1.2"
          />
          {Array.from({ length: 12 }).map((_, idx) => {
            const deg = idx * 30;
            return (
              <g key={deg} transform={`rotate(${deg} 120 120)`}>
                <path
                  d="M120 14 C131 32, 131 48, 120 64 C109 48, 109 32, 120 14 Z"
                  fill="rgba(232,163,61,0.12)"
                  stroke="#E8A33D"
                  strokeWidth="1.2"
                />
                <circle cx="120" cy="8" r="2.2" fill="#E8A33D" />
              </g>
            );
          })}
        </svg>

        {/* 2. Inner 8-Petal Sri Yantra Star Ring (Counter-Clockwise SVG) */}
        <svg
          viewBox="0 0 240 240"
          aria-hidden="true"
          className="absolute inset-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)] text-[#FBF3E7]/30"
          style={{ animation: "aapkaMandalaCCW 11s linear infinite" }}
        >
          {Array.from({ length: 8 }).map((_, idx) => {
            const deg = idx * 45;
            return (
              <g key={deg} transform={`rotate(${deg} 120 120)`}>
                <polygon
                  points="120,28 134,76 120,66 106,76"
                  fill="rgba(251,243,231,0.14)"
                  stroke="#E8A33D"
                  strokeWidth="1"
                />
              </g>
            );
          })}
          <circle
            cx="120"
            cy="120"
            r="64"
            fill="none"
            stroke="#E8A33D"
            strokeOpacity="0.6"
            strokeWidth="1.5"
          />
        </svg>

        {/* 3. CSS-3D Perspective Navratna Gemstone Ring (Zero-JS-Bundle 3D Orbit) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute h-40 w-40 sm:h-48 sm:w-48 rounded-full border border-[#E8A33D]/40"
          style={{
            transformStyle: "preserve-3d",
            animation: "aapkaGemOrbit3D 7s linear infinite",
          }}
        >
          {navratnaGems.map((gem) => (
            <div
              key={gem.name}
              className="absolute left-1/2 top-1/2 -ml-2 -mt-2 h-4 w-4"
              style={{
                transform: `rotate(${gem.angle}deg) translateY(-76px)`,
              }}
            >
              <svg viewBox="0 0 20 20" className="h-full w-full drop-shadow-[0_0_6px_rgba(232,163,61,0.8)]">
                <polygon
                  points="10,1 18,7 15,18 5,18 2,7"
                  fill={gem.color}
                  stroke={gem.rim}
                  strokeWidth="1.4"
                />
                <polygon
                  points="10,4 15,8 13,15 7,15 5,8"
                  fill="rgba(255,255,255,0.35)"
                />
              </svg>
            </div>
          ))}
        </div>

        {/* 4. Central Glowing Faceted Marigold Medallion & Pulsing Sacred Om (ॐ) */}
        <div
          className="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full border-2 border-[#E8A33D] bg-[radial-gradient(circle_at_35%_30%,#C1662F_0%,#7B2D26_65%,#4A1813_100%)] shadow-[0_0_32px_rgba(232,163,61,0.45)]"
          style={{ animation: "aapkaOmPulse 2.4s ease-in-out infinite" }}
        >
          {/* Faceted Octagon Gemstone Frame */}
          <svg
            viewBox="0 0 100 100"
            aria-hidden="true"
            className="absolute inset-1.5 h-[calc(100%-0.75rem)] w-[calc(100%-0.75rem)]"
          >
            <polygon
              points="30,4 70,4 96,30 96,70 70,96 30,96 4,70 4,30"
              fill="none"
              stroke="#E8A33D"
              strokeOpacity="0.65"
              strokeWidth="1.5"
            />
          </svg>
          <span className="font-hindi text-3xl sm:text-4xl font-bold text-[#FBF3E7] select-none leading-none">
            ॐ
          </span>
        </div>
      </div>

      {/* Brand Title & Vedic Mantra Subtitle */}
      <div className="mt-5 text-center max-w-[88vw]">
        <div className="font-temple text-xl sm:text-2xl font-bold tracking-[0.22em] text-[#FBF3E7]">
          AAPKA <span className="text-[#E8A33D]">ASTRO</span>
        </div>
        <div className="mt-1 text-[11px] sm:text-xs font-medium tracking-[0.16em] uppercase text-[#E8A33D]/90">
          वैदिक ज्योतिष एवं वास्तु &bull; Acharya Niraj Kumar
        </div>

        {/* Delicate Golden Shimmer Progress Bar */}
        <div className="mx-auto mt-3.5 h-0.5 w-36 sm:w-44 overflow-hidden rounded-full bg-[#FBF3E7]/15">
          <div
            className="h-full w-full bg-gradient-to-r from-transparent via-[#E8A33D] to-transparent"
            style={{ animation: "aapkaProgressSweep 1.1s ease-in-out infinite" }}
          />
        </div>
      </div>
    </div>
  );
};
