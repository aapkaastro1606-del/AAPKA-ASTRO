"use client";

import React, { useEffect, useState } from "react";

export const PRELOADER_SESSION_KEY = "aapka_preloader_session_seen";
export const PRELOADER_MIN_DISPLAY_MS = 1400;
export const PRELOADER_FADE_DURATION_MS = 380;

declare global {
  interface Window {
    __AAPKA_PRELOADER_SEEN_BEFORE_LOAD?: boolean;
  }
}

/**
 * BrandedPreloader
 * ----------------
 * Lightweight, pure CSS/SVG + CSS-3D animated preloader shown ONLY once per browser session
 * on the site's initial cold load (never on internal client-side Next.js route navigations).
 *
 * Dual-Condition Exit Gate:
 * 1. Condition A (`minTimerElapsed`): Hard minimum display timer of `1400ms` started the moment
 *    the preloader mounts, regardless of how fast the underlying page loads.
 * 2. Condition B (`pageContentReady`): Tracks real page/asset readiness (`document.readyState === "complete"`
 *    or the `window` `load` event). On slow connections, the preloader stays visible until the page's
 *    assets have actually finished loading.
 * 3. Smooth Exit Fade (`380ms`): Only after BOTH Condition A and Condition B are true does the preloader
 *    transition from `opacity: 1` to `opacity: 0` over `380ms` (`cubic-bezier(0.4, 0, 0.2, 1)`) before unmounting.
 * 4. Full-Cycle Animation Pacing: Om pulse/glow (`1.15s`), 3D Navratna gemstone orbit (`1.35s`),
 *    and inner Sri Yantra ring (`1.35s`) each complete at least one full cycle inside the `1400ms` window.
 */
export const BrandedPreloader: React.FC = () => {
  const [phase, setPhase] = useState<"active" | "fading" | "hidden">("active");

  useEffect(() => {
    let cancelled = false;
    let unmountTimer: number | undefined;

    try {
      const alreadySeenBeforeThisPageLoad =
        window.__AAPKA_PRELOADER_SEEN_BEFORE_LOAD === true ||
        (window.__AAPKA_PRELOADER_SEEN_BEFORE_LOAD === undefined &&
          window.sessionStorage.getItem(PRELOADER_SESSION_KEY) === "1");

      if (alreadySeenBeforeThisPageLoad) {
        setPhase("hidden");
        return;
      }

      // Mark session seen so subsequent navigations or refreshes in this session skip the preloader
      window.sessionStorage.setItem(PRELOADER_SESSION_KEY, "1");
    } catch {
      // Ignore storage errors in restricted private browsing modes
    }

    // Condition A: Hard minimum display timer (1400ms from mount)
    const minTimerPromise = new Promise<void>((resolve) => {
      window.setTimeout(resolve, PRELOADER_MIN_DISPLAY_MS);
    });

    // Condition B: Real page & asset readiness (continues waiting on slow connections until ready)
    const contentReadyPromise = new Promise<void>((resolve) => {
      if (document.readyState === "complete") {
        resolve();
      } else {
        window.addEventListener("load", () => resolve(), { once: true });
      }
    });

    // Only begin the 380ms smooth opacity fade-out once BOTH conditions are satisfied
    Promise.all([minTimerPromise, contentReadyPromise]).then(() => {
      if (cancelled) return;
      setPhase("fading");
      unmountTimer = window.setTimeout(() => {
        if (!cancelled) {
          setPhase("hidden");
        }
      }, PRELOADER_FADE_DURATION_MS);
    });

    return () => {
      cancelled = true;
      if (unmountTimer) window.clearTimeout(unmountTimer);
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
      style={{
        opacity: phase === "fading" ? 0 : 1,
        transform: phase === "fading" ? "scale(1.02)" : "scale(1)",
        transition: `opacity ${PRELOADER_FADE_DURATION_MS}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${PRELOADER_FADE_DURATION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,#7B2D26_0%,#4A1813_65%,#2A0C09_100%)] px-6 text-[#FBF3E7] pointer-events-none"
    >
      {/* Synchronous pre-hydration check: records whether sessionStorage already had the key BEFORE hydration */}
      <script
        dangerouslySetInnerHTML={{
          __html: `try{var k='${PRELOADER_SESSION_KEY}',el=document.getElementById('aapka-branded-preloader');if(sessionStorage.getItem(k)==='1'){window.__AAPKA_PRELOADER_SEEN_BEFORE_LOAD=true;if(el){el.style.display='none';}}else{window.__AAPKA_PRELOADER_SEEN_BEFORE_LOAD=false;}}catch(e){}`,
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
          0%, 100% { transform: scale(0.92); filter: drop-shadow(0 0 10px rgba(232,163,61,0.5)); }
          50% { transform: scale(1.08); filter: drop-shadow(0 0 28px rgba(232,163,61,1)); }
        }
        @keyframes aapkaProgressFill {
          0% { width: 6%; opacity: 0.75; }
          100% { width: 100%; opacity: 1; }
        }
      `}</style>

      {/* Ambient Temple Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-[#E8A33D]/15 blur-3xl"
      />

      {/* Sacred Mandala + 3D Navratna Gemstone Ring + Pulsing Om Emblem */}
      <div className="relative flex h-44 w-44 sm:h-52 sm:w-52 items-center justify-center">
        {/* 1. Outer 12-Petal Vedic Lotus Mandala (2.4s full 360° = 6 full petal cycles inside 1400ms) */}
        <svg
          viewBox="0 0 240 240"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full text-[#E8A33D]/40"
          style={{ animation: "aapkaMandalaCW 2.4s linear infinite" }}
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

        {/* 2. Inner 8-Petal Sri Yantra Star Ring (1.35s full 360° counter-clockwise cycle inside 1400ms) */}
        <svg
          viewBox="0 0 240 240"
          aria-hidden="true"
          className="absolute inset-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)] text-[#FBF3E7]/35"
          style={{ animation: "aapkaMandalaCCW 1.35s linear infinite" }}
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

        {/* 3. CSS-3D Perspective Navratna Gemstone Ring (1.35s full 360° 3D revolution inside 1400ms) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute h-40 w-40 sm:h-48 sm:w-48 rounded-full border border-[#E8A33D]/40"
          style={{
            transformStyle: "preserve-3d",
            animation: "aapkaGemOrbit3D 1.35s linear infinite",
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

        {/* 4. Central Glowing Faceted Marigold Medallion & Pulsing Sacred Om (1.15s full pulse/glow cycle) */}
        <div
          className="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full border-2 border-[#E8A33D] bg-[radial-gradient(circle_at_35%_30%,#C1662F_0%,#7B2D26_65%,#4A1813_100%)] shadow-[0_0_32px_rgba(232,163,61,0.45)]"
          style={{ animation: "aapkaOmPulse 1.15s ease-in-out infinite" }}
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
      <div className="mt-5 text-center max-w-[88vw] flex flex-col items-center">
        <div className="rounded-xl bg-[#FFFDF9]/95 px-3.5 py-1.5 shadow-lg border border-[#E8A33D]/50">
          <img src="/images/logo.png" alt="Aapka Astro - Aligning Your Destiny" className="h-8 sm:h-10 w-auto object-contain" />
        </div>
        <div className="mt-2 text-[11px] sm:text-xs font-medium tracking-[0.16em] uppercase text-[#E8A33D]/90">
          वैदिक ज्योतिष एवं वास्तु &bull; Acharya Niraj Kumar
        </div>

        {/* Deliberate 1.35s Golden Progress Bar (Reaches 100% inside the 1400ms minimum window) */}
        <div className="mx-auto mt-3.5 h-1 w-40 sm:w-48 overflow-hidden rounded-full bg-[#FBF3E7]/15">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#C1662F] via-[#E8A33D] to-[#FFFDF9] shadow-[0_0_8px_rgba(232,163,61,0.8)]"
            style={{ animation: "aapkaProgressFill 1.35s cubic-bezier(0.22, 1, 0.36, 1) forwards" }}
          />
        </div>
      </div>
    </div>
  );
};
