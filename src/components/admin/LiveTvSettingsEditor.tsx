"use client";

import React, { useState, useEffect } from "react";
import {
  Tv,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Power,
  Calendar,
  MessageCircle,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Link as LinkIcon,
  Globe,
} from "lucide-react";
import {
  LiveTvBroadcastSettings,
  DEFAULT_LIVE_TV_SETTINGS,
  evaluateLiveTvStatus,
  LiveTvEvaluationResult,
} from "@/config/liveTvBroadcastConfig";

interface LiveTvSettingsEditorProps {
  initialSettings?: LiveTvBroadcastSettings;
  onSaved?: (settings: LiveTvBroadcastSettings) => void;
}

export function LiveTvSettingsEditor({
  initialSettings,
  onSaved,
}: LiveTvSettingsEditorProps) {
  const [settings, setSettings] = useState<LiveTvBroadcastSettings>(
    initialSettings || DEFAULT_LIVE_TV_SETTINGS
  );
  const [evaluation, setEvaluation] = useState<LiveTvEvaluationResult>(() =>
    evaluateLiveTvStatus(initialSettings || DEFAULT_LIVE_TV_SETTINGS)
  );
  const [activeLang, setActiveLang] = useState<"en" | "hi">("en");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/live-tv");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.settings) {
            setSettings(data.settings);
            setEvaluation(evaluateLiveTvStatus(data.settings));
          }
        }
      } catch {
        // Fall back
      }
    }
    load();
  }, []);

  const handleSave = async (customSettings?: LiveTvBroadcastSettings) => {
    const toSave = customSettings || settings;

    // Validate WhatsApp template starts with #KaalKiChaal
    if (
      !toSave.whatsappTemplate ||
      !toSave.whatsappTemplate.trim().startsWith("#KaalKiChaal")
    ) {
      setErrorMessage(
        "WhatsApp template must start with #KaalKiChaal so television queries can be filtered from payments."
      );
      return;
    }

    setIsSaving(true);
    setSaveSuccess(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/live-tv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toSave),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSettings(data.settings);
        setEvaluation(evaluateLiveTvStatus(data.settings));
        setSaveSuccess("Live TV settings saved successfully.");
        if (onSaved) onSaved(data.settings);
      } else {
        throw new Error(data.message || "Failed to save settings");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save TV settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReconfirm = async () => {
    setIsSaving(true);
    setSaveSuccess(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/live-tv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reconfirm" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSettings(data.settings);
        setEvaluation(evaluateLiveTvStatus(data.settings));
        setSaveSuccess("Programme reconfirmed active on air.");
        if (onSaved) onSaved(data.settings);
      } else {
        throw new Error(data.message || "Failed to reconfirm");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Reconfirmation failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const isExpired = evaluation.reconfirmationExpired;
  const isReconfirmationDue = evaluation.daysSinceLastReconfirmation >= 30;

  return (
    <div
      className="space-y-6 max-w-5xl"
      data-testid="live-tv-settings-editor"
    >
      {/* Top Banner / Reconfirmation Alert */}
      <div
        className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs ${
          isExpired
            ? "bg-red-50 border-red-300 text-red-900"
            : isReconfirmationDue
            ? "bg-amber-50 border-amber-300 text-amber-900"
            : "bg-[#FFFDF9] border-[#E8D8C3] text-[#5C4532]"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-[#7B2D26]/10 text-[#7B2D26] shrink-0 mt-0.5">
            <Tv className="w-5 h-5 text-[#7B2D26]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-temple text-sm sm:text-base font-bold text-[#7B2D26]">
                Television Broadcast: Kaal Ki Chaal on Live Times
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  evaluation.status === "LIVE_NOW"
                    ? "bg-red-600 text-white animate-pulse"
                    : "bg-[#7B2D26]/10 text-[#7B2D26]"
                }`}
              >
                {evaluation.status}
              </span>
            </div>
            <p className="text-xs text-[#6E5545] mt-1">
              {isExpired
                ? "Monthly reconfirmation lapsed (>37 days). Broadcast mentions are hidden automatically."
                : `Last confirmed ${evaluation.daysSinceLastReconfirmation} days ago. Owner monthly confirmation required.`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReconfirm}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#7B2D26] hover:bg-[#60231E] active:bg-[#4A140F] text-white font-bold text-xs shadow-xs transition-colors shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSaving ? "animate-spin" : ""}`} />
          <span>Reconfirm Programme is Active</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-[#4F6D40]/10 border border-[#4F6D40]/30 text-[#4F6D40] text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-300 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* SECTION 1: MASTER SWITCHES */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
        <div className="border-b border-stone-200 pb-3">
          <h3 className="text-sm font-bold text-[#7B2D26] uppercase tracking-wider">
            1. Master Owner Switches
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Quick switches controlling site-wide visibility and emergency suppression.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Switch A: Programme has ended */}
          <div className="p-4 rounded-xl border border-red-200 bg-red-50/40 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-red-800 flex items-center gap-1">
                  <Power className="w-3.5 h-3.5 text-red-700" />
                  Programme has ended
                </span>
                <input
                  type="checkbox"
                  checked={settings.programmeEnded}
                  onChange={(e) =>
                    setSettings({ ...settings, programmeEnded: e.target.checked })
                  }
                  className="h-4 w-4 rounded text-red-600 focus:ring-red-500"
                />
              </div>
              <p className="text-[11px] text-red-700/80">
                Hides every mention (popup, strip, About section) everywhere at once.
              </p>
            </div>
          </div>

          {/* Switch B: Not on air today */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-stone-900">Not on air today</span>
                <input
                  type="checkbox"
                  checked={settings.notOnAirToday}
                  onChange={(e) =>
                    setSettings({ ...settings, notOnAirToday: e.target.checked })
                  }
                  className="h-4 w-4 rounded text-[#7B2D26] focus:ring-[#7B2D26]"
                />
              </div>
              <p className="text-[11px] text-stone-500">
                Temporarily switches status badge to &ldquo;Not on air today&rdquo;.
              </p>
            </div>
            {settings.notOnAirToday && (
              <input
                type="text"
                placeholder="Optional return date (e.g. 2 Nov)"
                value={settings.returnDate || ""}
                onChange={(e) =>
                  setSettings({ ...settings, returnDate: e.target.value })
                }
                className="w-full text-xs p-1.5 rounded border border-stone-300 bg-white"
              />
            )}
          </div>

          {/* Switch C: Optional Home Strip */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-stone-900">Show Homepage Strip</span>
                <input
                  type="checkbox"
                  checked={settings.showHomeStrip}
                  onChange={(e) =>
                    setSettings({ ...settings, showHomeStrip: e.target.checked })
                  }
                  className="h-4 w-4 rounded text-[#7B2D26] focus:ring-[#7B2D26]"
                />
              </div>
              <p className="text-[11px] text-stone-500">
                Slim dismissible strip under announcement bar on homepage.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: IDENTITY & BROADCAST FRAMES / LOGO PERMISSION */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
        <div className="border-b border-stone-200 pb-3">
          <h3 className="text-sm font-bold text-[#7B2D26] uppercase tracking-wider">
            2. Channel Identity &amp; Logo Permission
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Safe by default: channel logo and broadcast frames are suppressed until written permission is confirmed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-stone-800 block mb-1">Channel Name</label>
            <input
              type="text"
              value={settings.channelName}
              onChange={(e) => setSettings({ ...settings, channelName: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
            />
          </div>

          <div>
            <label className="font-bold text-stone-800 block mb-1">Optional Proof Clips URL</label>
            <input
              type="url"
              placeholder="https://... (Leave blank if none)"
              value={settings.proofClipsUrl || ""}
              onChange={(e) => setSettings({ ...settings, proofClipsUrl: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
            />
          </div>

          <div className="md:col-span-2 p-4 rounded-xl border border-stone-200 bg-[#FAF5EE] space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-stone-900 block">
                  Channel Logo Written Permission Switch (channelLogoApproved)
                </span>
                <span className="text-[11px] text-stone-600 block">
                  Default OFF. Shows channel name as plain text until written permission from Live Times is confirmed.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.channelLogoApproved}
                onChange={(e) =>
                  setSettings({ ...settings, channelLogoApproved: e.target.checked })
                }
                className="h-4 w-4 rounded text-[#7B2D26] focus:ring-[#7B2D26]"
              />
            </div>

            {settings.channelLogoApproved && (
              <div className="pt-2 border-t border-[#E8D8C3]">
                <label className="font-bold text-stone-800 block mb-1">
                  Approved High-Resolution Logo URL
                </label>
                <input
                  type="text"
                  placeholder="/images/live-times-logo.png"
                  value={settings.channelLogoUrl || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, channelLogoUrl: e.target.value })
                  }
                  className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: WHATSAPP QUERY TEMPLATE */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
        <div className="border-b border-stone-200 pb-3">
          <h3 className="text-sm font-bold text-[#7B2D26] uppercase tracking-wider">
            3. WhatsApp Query Filter Template
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Must begin with #KaalKiChaal so television viewer questions can be separated from payment screenshots on the same number.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-stone-800 block mb-1">WhatsApp Number</label>
            <input
              type="text"
              value={settings.whatsappNumber}
              onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="font-bold text-stone-800 block mb-1">
              Prefilled Message Template (Must start with #KaalKiChaal)
            </label>
            <textarea
              rows={5}
              value={settings.whatsappTemplate}
              onChange={(e) => setSettings({ ...settings, whatsappTemplate: e.target.value })}
              className="w-full text-xs font-mono p-2.5 rounded-lg border border-stone-300 bg-white"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: EDITORIAL APPENDIX TEXTS (Bilingual English & Hindi) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#7B2D26] uppercase tracking-wider">
              4. Verified Editorial Texts (Appendix)
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Exact approved wording for Heading, Body, How to Ask, Consent, Where to Watch, and Disclaimer.
            </p>
          </div>

          <div className="inline-flex rounded-lg border border-stone-300 p-0.5 bg-stone-100 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveLang("en")}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeLang === "en" ? "bg-[#7B2D26] text-white" : "text-stone-700"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setActiveLang("hi")}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeLang === "hi" ? "bg-[#7B2D26] text-white" : "text-stone-700"
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>

        {activeLang === "en" ? (
          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-stone-800 block mb-1">Heading</label>
              <input
                type="text"
                value={settings.texts.heading.en}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    texts: {
                      ...settings.texts,
                      heading: { ...settings.texts.heading, en: e.target.value },
                    },
                  })
                }
                className="w-full text-xs p-2 rounded-lg border border-stone-300"
              />
            </div>

            <div>
              <label className="font-bold text-stone-800 block mb-1">Body Text</label>
              <textarea
                rows={3}
                value={settings.texts.body.en}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    texts: {
                      ...settings.texts,
                      body: { ...settings.texts.body, en: e.target.value },
                    },
                  })
                }
                className="w-full text-xs p-2 rounded-lg border border-stone-300"
              />
            </div>

            <div>
              <label className="font-bold text-stone-800 block mb-1">How to Ask</label>
              <textarea
                rows={2}
                value={settings.texts.howToAsk.en}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    texts: {
                      ...settings.texts,
                      howToAsk: { ...settings.texts.howToAsk, en: e.target.value },
                    },
                  })
                }
                className="w-full text-xs p-2 rounded-lg border border-stone-300"
              />
            </div>

            <div>
              <label className="font-bold text-stone-800 block mb-1">Consent Line</label>
              <textarea
                rows={2}
                value={settings.texts.consent.en}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    texts: {
                      ...settings.texts,
                      consent: { ...settings.texts.consent, en: e.target.value },
                    },
                  })
                }
                className="w-full text-xs p-2 rounded-lg border border-stone-300"
              />
            </div>

            <div>
              <label className="font-bold text-stone-800 block mb-1">Where to Watch</label>
              <textarea
                rows={2}
                value={settings.texts.whereToWatch.en}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    texts: {
                      ...settings.texts,
                      whereToWatch: { ...settings.texts.whereToWatch, en: e.target.value },
                    },
                  })
                }
                className="w-full text-xs p-2 rounded-lg border border-stone-300"
              />
            </div>

            <div>
              <label className="font-bold text-stone-800 block mb-1">Disclaimer</label>
              <input
                type="text"
                value={settings.texts.disclaimer.en}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    texts: {
                      ...settings.texts,
                      disclaimer: { ...settings.texts.disclaimer, en: e.target.value },
                    },
                  })
                }
                className="w-full text-xs p-2 rounded-lg border border-stone-300"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-stone-800 block mb-1">शीर्षक (Heading)</label>
              <input
                type="text"
                value={settings.texts.heading.hi}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    texts: {
                      ...settings.texts,
                      heading: { ...settings.texts.heading, hi: e.target.value },
                    },
                  })
                }
                className="w-full text-xs p-2 rounded-lg border border-stone-300"
              />
            </div>

            <div>
              <label className="font-bold text-stone-800 block mb-1">विवरण (Body)</label>
              <textarea
                rows={3}
                value={settings.texts.body.hi}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    texts: {
                      ...settings.texts,
                      body: { ...settings.texts.body, hi: e.target.value },
                    },
                  })
                }
                className="w-full text-xs p-2 rounded-lg border border-stone-300"
              />
            </div>

            <div>
              <label className="font-bold text-stone-800 block mb-1">प्रश्न कैसे भेजें (How to Ask)</label>
              <textarea
                rows={2}
                value={settings.texts.howToAsk.hi}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    texts: {
                      ...settings.texts,
                      howToAsk: { ...settings.texts.howToAsk, hi: e.target.value },
                    },
                  })
                }
                className="w-full text-xs p-2 rounded-lg border border-stone-300"
              />
            </div>

            <div>
              <label className="font-bold text-stone-800 block mb-1">सहमति (Consent)</label>
              <textarea
                rows={2}
                value={settings.texts.consent.hi}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    texts: {
                      ...settings.texts,
                      consent: { ...settings.texts.consent, hi: e.target.value },
                    },
                  })
                }
                className="w-full text-xs p-2 rounded-lg border border-stone-300"
              />
            </div>

            <div>
              <label className="font-bold text-stone-800 block mb-1">कहाँ देखें (Where to Watch)</label>
              <textarea
                rows={2}
                value={settings.texts.whereToWatch.hi}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    texts: {
                      ...settings.texts,
                      whereToWatch: { ...settings.texts.whereToWatch, hi: e.target.value },
                    },
                  })
                }
                className="w-full text-xs p-2 rounded-lg border border-stone-300"
              />
            </div>

            <div>
              <label className="font-bold text-stone-800 block mb-1">अस्वीकरण (Disclaimer)</label>
              <input
                type="text"
                value={settings.texts.disclaimer.hi}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    texts: {
                      ...settings.texts,
                      disclaimer: { ...settings.texts.disclaimer, hi: e.target.value },
                    },
                  })
                }
                className="w-full text-xs p-2 rounded-lg border border-stone-300"
              />
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => handleSave()}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#7B2D26] hover:bg-[#60231E] active:bg-[#4A140F] text-white font-bold text-xs shadow-md transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? "Saving Settings..." : "Save Television Settings"}</span>
        </button>
      </div>
    </div>
  );
}
