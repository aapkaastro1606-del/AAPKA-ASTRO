"use client";

import React, { useState, useEffect } from "react";
import { Tv, MessageCircle, X, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import {
  DEFAULT_LIVE_TV_SETTINGS,
  LiveTvBroadcastSettings,
  evaluateLiveTvStatus,
  LiveTvEvaluationResult,
  buildLiveTvWhatsAppUrl,
} from "@/config/liveTvBroadcastConfig";

export const LIVE_TV_STRIP_STORAGE_KEY = "aapka_live_tv_strip_dismissed";

interface LiveTvHomeStripProps {
  initialSettings?: LiveTvBroadcastSettings;
  mockDate?: Date | string;
}

export function LiveTvHomeStrip({
  initialSettings,
  mockDate,
}: LiveTvHomeStripProps) {
  const [settings, setSettings] = useState<LiveTvBroadcastSettings>(
    initialSettings || DEFAULT_LIVE_TV_SETTINGS
  );
  const [evaluation, setEvaluation] = useState<LiveTvEvaluationResult>(() =>
    evaluateLiveTvStatus(initialSettings || DEFAULT_LIVE_TV_SETTINGS, mockDate)
  );
  const [isDismissed, setIsDismissed] = useState(true);
  const { language } = useLanguage();
  const isHindi = language === "hi";

  useEffect(() => {
    // Check local storage dismissal
    try {
      const dismissed = sessionStorage.getItem(LIVE_TV_STRIP_STORAGE_KEY);
      if (!dismissed) {
        setIsDismissed(false);
      }
    } catch {
      setIsDismissed(false);
    }

    // Fetch verified settings
    let isCancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/live-tv");
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && data.success && data.settings) {
            setSettings(data.settings);
            setEvaluation(evaluateLiveTvStatus(data.settings, mockDate));
          }
        }
      } catch {
        // Fall back
      }
    }
    load();
    return () => {
      isCancelled = true;
    };
  }, [mockDate]);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem(LIVE_TV_STRIP_STORAGE_KEY, "true");
    } catch {
      // Ignore
    }
  };

  // Only render if Owner switched it on and programme is not ended/unconfirmed
  if (isDismissed || !settings.showHomeStrip || !evaluation.isVisible) {
    return null;
  }

  const statusLabel = isHindi ? evaluation.labelHi : evaluation.labelEn;
  const programmeName = isHindi
    ? settings.programmeName.hi
    : settings.programmeName.en;
  const whatsappUrl = buildLiveTvWhatsAppUrl(settings);

  return (
    <div
      className="relative z-20 w-full bg-gradient-to-r from-[#4A140F] via-[#7B2D26] to-[#4A140F] text-[#FBF3E7] border-b border-[#E8A33D]/40 px-3 py-1.5 sm:px-4 text-xs font-medium shadow-sm"
      data-testid="live-tv-home-strip"
    >
      <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
              evaluation.status === "LIVE_NOW"
                ? "bg-red-600 text-white animate-pulse ring-1 ring-red-300"
                : "bg-[#2D0B08] text-[#E8A33D] border border-[#E8A33D]/40"
            }`}
          >
            <Tv className="w-3 h-3" />
            <span>{statusLabel}</span>
          </span>

          <span className="text-[11px] sm:text-xs font-semibold text-[#FBF3E7]/90">
            {settings.channelName} • <span className="font-temple font-bold">{programmeName}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E8A33D] hover:text-white underline underline-offset-2 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#25D366] fill-[#25D366]" />
            <span>{isHindi ? "WhatsApp पर प्रश्न पूछें (#KaalKiChaal)" : "How to ask (#KaalKiChaal)"}</span>
            <ArrowRight className="w-3 h-3" />
          </a>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss television strip"
            className="p-1 rounded text-[#FBF3E7]/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
