"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Tv, MessageCircle, ArrowRight, ShieldCheck, Sparkles, ExternalLink } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import {
  DEFAULT_LIVE_TV_SETTINGS,
  LiveTvBroadcastSettings,
  evaluateLiveTvStatus,
  LiveTvEvaluationResult,
  buildLiveTvWhatsAppUrl,
} from "@/config/liveTvBroadcastConfig";

interface LiveTvAboutSectionProps {
  initialSettings?: LiveTvBroadcastSettings;
  mockDate?: Date | string;
}

export function LiveTvAboutSection({
  initialSettings,
  mockDate,
}: LiveTvAboutSectionProps) {
  const [settings, setSettings] = useState<LiveTvBroadcastSettings>(
    initialSettings || DEFAULT_LIVE_TV_SETTINGS
  );
  const [evaluation, setEvaluation] = useState<LiveTvEvaluationResult>(() =>
    evaluateLiveTvStatus(initialSettings || DEFAULT_LIVE_TV_SETTINGS, mockDate)
  );

  const { language } = useLanguage();
  const isHindi = language === "hi";

  useEffect(() => {
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

  // If programme has ended or monthly reconfirmation lapsed, render nothing
  if (!evaluation.isVisible) {
    return null;
  }

  const texts = settings.texts;
  const whatsappUrl = buildLiveTvWhatsAppUrl(settings);
  const statusLabel = isHindi ? evaluation.labelHi : evaluation.labelEn;
  const roleText = isHindi ? settings.role.hi : settings.role.en;
  const astrologerName = isHindi ? settings.astrologerName.hi : settings.astrologerName.en;

  return (
    <section
      id="live-on-television"
      className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-[#E8D8C3] bg-gradient-to-b from-[#FFFDF9] via-[#FAF3EA] to-[#FFFDF9]"
      data-testid="live-tv-about-section"
    >
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border-2 border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-10 shadow-md space-y-6">
          {/* Header Row: Status & Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8D8C3] pb-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E8A33D]/60 bg-[#FAF3EA] px-3.5 py-1 text-xs font-bold text-[#7B2D26] mb-3">
                <Tv className="w-3.5 h-3.5 text-[#E8A33D]" />
                <span>
                  {roleText}: {astrologerName}
                </span>
                <span className="text-[#6E5545]">•</span>
                <span className="text-[#C1662F]">{statusLabel}</span>
              </div>

              <h2 className="font-temple text-2xl sm:text-3xl font-bold text-[#7B2D26]">
                {isHindi ? texts.heading.hi : texts.heading.en}
              </h2>
            </div>

            {/* Channel Badge (Text-only unless approved) */}
            <div className="shrink-0 flex items-center gap-2">
              {settings.channelLogoApproved && settings.channelLogoUrl ? (
                <Image
                  src={settings.channelLogoUrl}
                  alt={settings.channelName}
                  width={120}
                  height={36}
                  className="h-9 object-contain"
                />
              ) : (
                <div className="px-4 py-2 rounded-xl bg-[#FAF3EA] border border-[#E8D8C3] text-center">
                  <span className="font-serif text-sm font-black tracking-wider text-[#3B2A1E]">
                    {settings.channelName}
                  </span>
                  <span className="block text-[10px] text-[#6E5545] font-semibold">
                    Television News
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Body Narrative from Appendix */}
          <p className="text-sm sm:text-base text-[#5C4532] leading-relaxed font-body">
            {isHindi ? texts.body.hi : texts.body.en}
          </p>

          {/* Two-Column Cards: How to Ask & Where to Watch */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* How to Ask */}
            <div className="rounded-2xl border border-[#E8A33D]/60 bg-[#FAF3EA] p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7B2D26]">
                  <MessageCircle className="w-4 h-4 text-[#25D366] fill-[#25D366]" />
                  <span>{isHindi ? "प्रश्न कैसे भेजें (निःशुल्क)" : "How to Ask a Question (Free)"}</span>
                </div>
                <p className="text-xs sm:text-sm text-[#5C4532] leading-relaxed">
                  {isHindi ? texts.howToAsk.hi : texts.howToAsk.en}
                </p>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20BA5C] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>{isHindi ? "WhatsApp पर प्रश्न भेजें (#KaalKiChaal)" : "Send WhatsApp Question (#KaalKiChaal)"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Where to Watch */}
            <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7B2D26]">
                  <Tv className="w-4 h-4 text-[#7B2D26]" />
                  <span>{isHindi ? "कहाँ देखें" : "Where to Watch"}</span>
                </div>
                <p className="text-xs sm:text-sm text-[#5C4532] leading-relaxed">
                  {isHindi ? texts.whereToWatch.hi : texts.whereToWatch.en}
                </p>
              </div>

              {/* Optional Proof Clip Link */}
              {settings.proofClipsUrl ? (
                <div className="pt-2">
                  <a
                    href={settings.proofClipsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7B2D26] hover:underline"
                  >
                    <span>{isHindi ? "कार्यक्रम के क्लिप देखें" : "Watch clips of the programme"}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : null}
            </div>
          </div>

          {/* Consent Statement & Disclaimer */}
          <div className="rounded-2xl bg-[#FAF5EE] border border-[#E8D8C3] p-4 text-xs text-[#6E5545] space-y-2">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#6B8E5A] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#3B2A1E] font-bold">
                  {isHindi ? "सहमति सूचना: " : "Consent & Broadcast Notice: "}
                </strong>
                <span>{isHindi ? texts.consent.hi : texts.consent.en}</span>{" "}
                <Link
                  href="/privacy-policy"
                  className="text-[#7B2D26] font-bold hover:underline"
                >
                  {isHindi ? "गोपनीयता नीति पढ़ें" : "Read Privacy Policy"}
                </Link>
              </div>
            </div>

            <div className="border-t border-[#E8D8C3]/80 pt-2 text-[11px] text-[#6E5545]/90">
              <span className="font-semibold">{isHindi ? "अस्वीकरण: " : "Disclaimer: "}</span>
              <span>{isHindi ? texts.disclaimer.hi : texts.disclaimer.en}</span>{" "}
              <Link href="/consult" className="font-bold text-[#7B2D26] hover:underline">
                {isHindi ? "व्यक्तिगत परामर्श बुक करें →" : "Book personal consultation →"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
