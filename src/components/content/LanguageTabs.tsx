"use client";

import React from "react";
import { AlertCircle, Copy } from "lucide-react";

interface LanguageTabsProps {
  currentLanguage: "en" | "hi";
  onLanguageChange: (lang: "en" | "hi") => void;
  isHindiMissing?: boolean;
  onCopyEnglishToHindi?: () => void;
  className?: string;
}

export function LanguageTabs({
  currentLanguage,
  onLanguageChange,
  isHindiMissing = false,
  onCopyEnglishToHindi,
  className = "",
}: LanguageTabsProps) {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3 mb-4 ${className}`}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onLanguageChange("en")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
            currentLanguage === "en"
              ? "bg-[#7B2D26] text-white shadow-sm"
              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          }`}
        >
          <span>English (EN)</span>
        </button>

        <button
          type="button"
          onClick={() => onLanguageChange("hi")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
            currentLanguage === "hi"
              ? "bg-[#7B2D26] text-white shadow-sm"
              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          }`}
        >
          <span>हिन्दी (Hindi)</span>
          {isHindiMissing && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Hindi translation missing" />
          )}
        </button>
      </div>

      <div className="flex items-center gap-2">
        {isHindiMissing && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Hindi missing (falls back to English)</span>
          </div>
        )}

        {currentLanguage === "hi" && isHindiMissing && onCopyEnglishToHindi && (
          <button
            type="button"
            onClick={onCopyEnglishToHindi}
            className="text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors border border-stone-200"
            title="Copy English text as starting baseline"
          >
            <Copy className="w-3.5 h-3.5 text-stone-500" />
            <span>Copy English baseline</span>
          </button>
        )}
      </div>
    </div>
  );
}
