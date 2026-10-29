"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Tv,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Power,
  Calendar,
  ShieldAlert,
} from "lucide-react";
import {
  LiveTvBroadcastSettings,
  DEFAULT_LIVE_TV_SETTINGS,
  evaluateLiveTvStatus,
  LiveTvEvaluationResult,
  RECONFIRMATION_GRACE_DAYS,
} from "@/config/liveTvBroadcastConfig";

interface OwnerLiveTvControlCardProps {
  initialSettings?: LiveTvBroadcastSettings;
}

export function OwnerLiveTvControlCard({
  initialSettings,
}: OwnerLiveTvControlCardProps) {
  const [settings, setSettings] = useState<LiveTvBroadcastSettings>(
    initialSettings || DEFAULT_LIVE_TV_SETTINGS
  );
  const [evaluation, setEvaluation] = useState<LiveTvEvaluationResult>(() =>
    evaluateLiveTvStatus(initialSettings || DEFAULT_LIVE_TV_SETTINGS)
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [returnDateInput, setReturnDateInput] = useState(settings.returnDate || "");
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/live-tv");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
          setEvaluation(evaluateLiveTvStatus(data.settings));
          setReturnDateInput(data.settings.returnDate || "");
        }
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettingField = async (updates: Partial<LiveTvBroadcastSettings>) => {
    setSaving(true);
    setNotification(null);
    try {
      const res = await fetch("/api/admin/live-tv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSettings(data.settings);
        setEvaluation(evaluateLiveTvStatus(data.settings));
        setNotification({
          type: "success",
          message: "TV broadcast settings updated and saved.",
        });
      } else {
        throw new Error(data.message || "Failed to save TV settings");
      }
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "Could not update settings. Please retry.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReconfirm = async () => {
    setSaving(true);
    setNotification(null);
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
        setNotification({
          type: "success",
          message: "Confirmed: Kaal Ki Chaal is active on Live Times. Monthly check reset.",
        });
      } else {
        throw new Error(data.message || "Failed to reconfirm");
      }
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "Reconfirmation failed.",
      });
    } finally {
      setSaving(false);
    }
  };

  const isReconfirmationDue = evaluation.daysSinceLastReconfirmation >= 30;
  const isExpired = evaluation.reconfirmationExpired;

  return (
    <div
      className="p-5 sm:p-6 rounded-3xl bg-[#FFFDF9] border-2 border-[#E8D8C3] shadow-md space-y-5"
      data-testid="owner-live-tv-control-card"
    >
      {/* Header with Title and Current Live Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8D8C3] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#7B2D26] text-[#E8A33D] shadow-xs">
            <Tv className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold font-temple text-[#7B2D26]">
                Live on Television Control (Kaal Ki Chaal)
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E8A33D]/20 text-[#7B2D26] border border-[#E8A33D]/40">
                Owner Only
              </span>
            </div>
            <p className="text-xs text-[#6E5545] mt-0.5">
              Live Times broadcast schedule: Daily 8:00 AM – 8:30 AM IST • Role: Guest Astrologer
            </p>
          </div>
        </div>

        {/* Live Status Indicator */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border shadow-xs ${
              evaluation.status === "LIVE_NOW"
                ? "bg-red-600 border-red-300 text-white animate-pulse"
                : evaluation.status === "ENDED" || evaluation.status === "UNCONFIRMED"
                ? "bg-stone-200 border-stone-300 text-stone-700"
                : evaluation.status === "OFF_TODAY"
                ? "bg-amber-100 border-amber-300 text-amber-900"
                : "bg-[#7B2D26]/10 border-[#7B2D26]/30 text-[#7B2D26]"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>
              {evaluation.status === "LIVE_NOW"
                ? "Live now on Live Times"
                : evaluation.status === "UPCOMING_TODAY"
                ? "Today at 8:00 AM IST"
                : evaluation.status === "TOMORROW"
                ? "Tomorrow at 8:00 AM IST"
                : evaluation.status === "OFF_TODAY"
                ? "Not on air today"
                : evaluation.status === "ENDED"
                ? "Programme Ended (Hidden)"
                : "Unconfirmed (Hidden)"}
            </span>
          </span>
        </div>
      </div>

      {notification && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            notification.type === "success"
              ? "bg-[#4F6D40]/10 text-[#4F6D40] border border-[#4F6D40]/30"
              : "bg-red-50 text-red-700 border border-red-300"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Monthly Reconfirmation Banner */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
          isExpired
            ? "bg-red-50 border-red-300 text-red-800"
            : isReconfirmationDue
            ? "bg-amber-50 border-amber-300 text-amber-900"
            : "bg-[#FAF5EE] border-[#E8D8C3] text-[#6E5545]"
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold">
            {isExpired ? (
              <ShieldAlert className="h-4 w-4 text-red-600" />
            ) : isReconfirmationDue ? (
              <AlertCircle className="h-4 w-4 text-amber-600" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-[#4F6D40]" />
            )}
            <span>
              {isExpired
                ? "Action Required: Reconfirmation Window Expired"
                : isReconfirmationDue
                ? "Monthly Check: Is 'Kaal Ki Chaal' still on air?"
                : "Monthly Reconfirmation Active"}
            </span>
          </div>
          <p className="text-[11px] leading-relaxed">
            {isExpired
              ? "Because 7 days passed without monthly reconfirmation, television mentions are automatically hidden. Click below to restore when on air."
              : isReconfirmationDue
              ? `Last reconfirmed ${evaluation.daysSinceLastReconfirmation} days ago. Please reconfirm within 7 days to keep television broadcast content active on the site.`
              : `Last reconfirmed ${evaluation.daysSinceLastReconfirmation} days ago. Programme continues active until the channel says otherwise.`}
          </p>
        </div>

        <button
          type="button"
          onClick={handleReconfirm}
          disabled={saving}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#7B2D26] hover:bg-[#60231E] active:bg-[#4A140F] text-white font-bold text-xs shadow-xs transition-colors shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${saving ? "animate-spin" : ""}`} />
          <span>Reconfirm Programme is Active</span>
        </button>
      </div>

      {/* Owner Switches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Switch 1: Not on air today */}
        <div className="p-4 rounded-2xl border border-[#E8D8C3] bg-[#FAF5EE] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#7B2D26] block">
                Not on air today
              </span>
              <span className="text-[11px] text-[#6E5545] block">
                Temporarily changes status badge to &ldquo;Not on air today&rdquo;
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notOnAirToday}
                onChange={(e) => updateSettingField({ notOnAirToday: e.target.checked })}
                disabled={saving}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7B2D26]"></div>
            </label>
          </div>

          {settings.notOnAirToday && (
            <div className="pt-2 border-t border-[#E8D8C3] flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#C1662F] shrink-0" />
              <input
                type="text"
                placeholder="Optional return date (e.g. 2 Nov)"
                value={returnDateInput}
                onChange={(e) => setReturnDateInput(e.target.value)}
                onBlur={() => updateSettingField({ returnDate: returnDateInput })}
                className="w-full text-xs p-2 rounded-lg border border-[#E8D8C3] bg-white text-[#3B2A1E] focus:outline-none focus:ring-1 focus:ring-[#7B2D26]"
              />
            </div>
          )}
        </div>

        {/* Switch 2: Programme has ended */}
        <div className="p-4 rounded-2xl border border-red-200 bg-red-50/40 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-red-800 flex items-center gap-1.5">
                <Power className="h-3.5 w-3.5 text-red-700" />
                <span>Programme has ended</span>
              </span>
              <span className="text-[11px] text-red-700/80 block">
                Immediately hides every broadcast mention, popup, and section everywhere at once
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.programmeEnded}
                onChange={(e) => {
                  if (
                    e.target.checked &&
                    !window.confirm(
                      "Are you sure Kaal Ki Chaal has ended? This will hide the popup, home strip, and About page broadcast section across the entire website."
                    )
                  ) {
                    return;
                  }
                  updateSettingField({ programmeEnded: e.target.checked });
                }}
                disabled={saving}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-700"></div>
            </label>
          </div>
          {settings.programmeEnded && (
            <p className="text-[10px] text-red-700 font-semibold pt-1">
              • Broadcast content is completely suppressed across the entire site.
            </p>
          )}
        </div>
      </div>

      {/* Footer Navigation to Content Studio Full TV Editor */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#E8D8C3] text-xs">
        <span className="text-[#6E5545] text-[11px]">
          Edit WhatsApp template, schedule, channel logo approval &amp; texts in Content Studio.
        </span>
        <Link
          href="/admin/content?tab=tv"
          className="inline-flex items-center gap-1.5 font-bold text-[#7B2D26] hover:text-[#5E1E18] underline"
        >
          <span>Open Full TV Settings in Content Studio</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
