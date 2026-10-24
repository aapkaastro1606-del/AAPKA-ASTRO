"use client";

import React, { useState } from "react";
import { RotateCcw, Check, Cookie } from "lucide-react";
import { CONSENT_STORAGE_KEY } from "@/lib/analytics/trackEvent";

export function CookiePreferenceResetButton() {
  const [resetDone, setResetDone] = useState(false);

  const handleReset = () => {
    try {
      localStorage.removeItem(CONSENT_STORAGE_KEY);
    } catch {}

    // Dispatch event to re-open consent banner
    window.dispatchEvent(new CustomEvent("aapka:open-cookie-preferences"));

    setResetDone(true);
    setTimeout(() => setResetDone(false), 3000);
  };

  return (
    <button
      type="button"
      onClick={handleReset}
      className="inline-flex items-center gap-2 rounded-xl bg-[#7B2D26] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#64221C] transition-all shadow-xs shrink-0 cursor-pointer"
    >
      {resetDone ? (
        <>
          <Check className="h-4 w-4 text-emerald-300" />
          <span>Preferences Reset!</span>
        </>
      ) : (
        <>
          <RotateCcw className="h-4 w-4" />
          <span>Change Cookie Preferences</span>
        </>
      )}
    </button>
  );
}
