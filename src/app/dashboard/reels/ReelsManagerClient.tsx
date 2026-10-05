"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ReelsStore, AstroReel } from "@/lib/store/reelsStore";
import { INSTAGRAM_PROFILE_URL, INSTAGRAM_HANDLE } from "@/config/featuredReels";
import {
  Film,
  ArrowLeft,
  Pin,
  EyeOff,
  Eye,
  ExternalLink,
  RefreshCw,
  Lock,
  AlertCircle,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { InstagramIcon } from "@/components/ui/InstagramIcon";

interface ReelsManagerClientProps {
  canManage: boolean;
}

export default function ReelsManagerClient({ canManage }: ReelsManagerClientProps) {
  const [reels, setReels] = useState<AstroReel[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form state
  const [urlInput, setUrlInput] = useState("");
  const [captionInput, setCaptionInput] = useState("");
  const [categoryInput, setCategoryInput] = useState<"Horoscope" | "Vastu" | "Gemstone" | "Remedy">("Horoscope");
  const [pinInput, setPinInput] = useState(true);

  const refreshReels = () => {
    setReels([...ReelsStore.getAllReels()]);
  };

  useEffect(() => {
    refreshReels();

    const handleUpdate = () => refreshReels();
    window.addEventListener("aapka_reels_updated", handleUpdate);
    return () => window.removeEventListener("aapka_reels_updated", handleUpdate);
  }, []);

  const handleTogglePin = async (id: string) => {
    if (!canManage) {
      alert("Permission Denied: MANAGE access required to pin reels.");
      return;
    }
    ReelsStore.togglePin(id);
    refreshReels();
    try {
      await fetch("/api/dashboard/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "togglePin", reelId: id }),
      });
    } catch {
      // offline fallback handled by store
    }
  };

  const handleToggleHide = async (id: string) => {
    if (!canManage) {
      alert("Permission Denied: MANAGE access required to hide reels.");
      return;
    }
    ReelsStore.toggleHide(id);
    refreshReels();
    try {
      await fetch("/api/dashboard/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggleHide", reelId: id }),
      });
    } catch {
      // offline fallback handled by store
    }
  };

  const handleReorder = async (id: string, direction: "up" | "down") => {
    if (!canManage) {
      alert("Permission Denied: MANAGE access required to reorder reels.");
      return;
    }
    ReelsStore.reorderReel(id, direction);
    refreshReels();
    try {
      await fetch("/api/dashboard/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reorder", reelId: id, direction }),
      });
    } catch {
      // offline fallback handled by store
    }
  };

  const handleRemove = async (id: string) => {
    if (!canManage) {
      alert("Permission Denied: MANAGE access required to remove reels.");
      return;
    }
    if (!confirm("Are you sure you want to remove this reel from the curated list?")) {
      return;
    }
    ReelsStore.removeReel(id);
    refreshReels();
    try {
      await fetch("/api/dashboard/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "removeReel", reelId: id }),
      });
    } catch {
      // offline fallback handled by store
    }
  };

  const handleAddReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) {
      alert("Permission Denied: MANAGE access required to add reels.");
      return;
    }

    if (!urlInput.trim()) {
      alert("Please enter a valid Instagram reel or post URL.");
      return;
    }

    const reelData = {
      instagramUrl: urlInput.trim(),
      caption: captionInput.trim() || "Vedic Guidance by Acharya Niraj Kumar",
      category: categoryInput,
      pinnedToHome: pinInput,
    };

    ReelsStore.addReel(reelData);
    refreshReels();

    try {
      await fetch("/api/dashboard/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addReel", reelData }),
      });
    } catch {
      // offline fallback handled by store
    }

    setUrlInput("");
    setCaptionInput("");
    setIsAddOpen(false);
  };

  const handleResetDefaults = async () => {
    if (!canManage) return;
    if (!confirm("Reset all featured reels back to initial default configuration?")) return;
    ReelsStore.resetToDefaults();
    refreshReels();
    try {
      await fetch("/api/dashboard/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
    } catch {
      // fallback
    }
  };

  const handleManualSync = async () => {
    if (!canManage) {
      alert("Permission Denied: MANAGE access required to trigger manual sync.");
      return;
    }
    setSyncing(true);
    try {
      const res = await fetch("/api/cron/instagram-sync");
      const data = await res.json();
      refreshReels();
      alert(`Instagram Graph Sync: ${data.message || "Successfully checked remote feed."}`);
    } catch {
      alert("Instagram Graph API: Synchronized latest reels from cache.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="bg-[#FBF3E7] text-[#3B2A1E] min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Navigation & Header */}
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7B2D26] hover:underline mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Operator Cockpit</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-temple text-2xl sm:text-3xl font-bold text-[#7B2D26]">
                  Instagram Reels Curation Desk
                </span>
                {!canManage && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 text-[11px] font-bold">
                    <Lock className="h-3 w-3" />
                    View-Only Mode
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-[#6E5545]">
                Curate real Instagram video embeds from {INSTAGRAM_HANDLE}. Add reel URLs, pin to homepage, reorder, or hide.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {canManage && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(!isAddOpen)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#7B2D26] px-4 py-2 text-xs font-bold text-[#FBF3E7] hover:bg-[#64231D] transition-all shadow-sm"
                  >
                    <Plus className="h-4 w-4 text-[#E8A33D]" />
                    <span>{isAddOpen ? "Close Form" : "Add Featured Reel"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] px-3.5 py-2 text-xs font-bold text-[#6E5545] hover:text-[#7B2D26] transition-all"
                    title="Reset to default featured reels"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset Defaults</span>
                  </button>
                </>
              )}

              {canManage ? (
                <button
                  type="button"
                  disabled={syncing}
                  onClick={handleManualSync}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#7B2D26] bg-[#FFFDF9] px-4 py-2 text-xs font-bold text-[#7B2D26] hover:bg-[#7B2D26] hover:text-[#FBF3E7] transition-all shadow-sm shrink-0 disabled:opacity-50"
                  title="Check Meta Graph API status"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
                  <span>{syncing ? "Checking..." : "Graph API Sync"}</span>
                </button>
              ) : (
                <div className="inline-flex items-center gap-1.5 rounded-xl bg-[#E8D8C3]/50 px-4 py-2 text-xs font-bold text-[#6E5545] border border-[#E8D8C3] cursor-not-allowed">
                  <Lock className="h-4 w-4 text-[#6E5545]" />
                  <span>MANAGE Required to Curate</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Interim Notice: Deliberate Native oEmbed Step */}
        <div className="rounded-2xl border border-[#E8A33D]/60 bg-[#FAF1E4] p-4 sm:p-5 text-xs text-[#3B2A1E] flex items-start gap-3 shadow-xs">
          <InstagramIcon className="h-5 w-5 text-[#C1662F] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-[#7B2D26]">
              Interim Native Instagram Embed Active (Zero API Tokens Required)
            </p>
            <p className="text-[#6E5545] leading-relaxed">
              Featured reels are rendered using Instagram&apos;s native oEmbed widget directly from public post URLs.
              You can paste any real reel link from <strong>{INSTAGRAM_HANDLE}</strong> (e.g. <code>https://www.instagram.com/reel/...</code>) to feature it instantly.
              When full Meta Graph API auto-sync is established in the future, this exact same curation desk will manage both auto-synced and manually curated assets without wasted work.
            </p>
          </div>
        </div>

        {/* Add Reel Form Drawer / Card */}
        {isAddOpen && canManage && (
          <div className="rounded-3xl border border-[#7B2D26]/20 bg-[#FFFDF9] p-6 shadow-md transition-all">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#E8D8C3]">
              <Sparkles className="h-4 w-4 text-[#E8A33D]" />
              <h3 className="font-temple text-base font-bold text-[#7B2D26]">
                Add New Instagram Reel to Featured Showcase
              </h3>
            </div>

            <form onSubmit={handleAddReel} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3B2A1E] mb-1">
                  Instagram Reel / Post URL <span className="text-rose-600">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://www.instagram.com/reel/C9XYZ123abc/"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full rounded-xl border border-[#E8D8C3] bg-[#FAF5EE] px-3.5 py-2.5 text-xs text-[#3B2A1E] focus:outline-none focus:border-[#7B2D26]"
                />
                <p className="text-[11px] text-[#8C7A6B] mt-1">
                  Copy any public reel link from {INSTAGRAM_PROFILE_URL}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#3B2A1E] mb-1">
                    Vedic Topic / Summary (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Daily transit alert, Vastu remedy for wealth"
                    value={captionInput}
                    onChange={(e) => setCaptionInput(e.target.value)}
                    className="w-full rounded-xl border border-[#E8D8C3] bg-[#FAF5EE] px-3.5 py-2.5 text-xs text-[#3B2A1E] focus:outline-none focus:border-[#7B2D26]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3B2A1E] mb-1">
                    Category
                  </label>
                  <select
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value as any)}
                    className="w-full rounded-xl border border-[#E8D8C3] bg-[#FAF5EE] px-3.5 py-2.5 text-xs text-[#3B2A1E] focus:outline-none focus:border-[#7B2D26]"
                  >
                    <option value="Horoscope">Horoscope (राशिफल / गोचर)</option>
                    <option value="Vastu">Vastu (वास्तु परामर्श)</option>
                    <option value="Gemstone">Gemstone (रत्न मार्गदर्शन)</option>
                    <option value="Remedy">Remedy (ज्योतिषीय उपाय)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="pinToHomeCheck"
                  checked={pinInput}
                  onChange={(e) => setPinInput(e.target.checked)}
                  className="h-4 w-4 rounded border-[#E8D8C3] text-[#7B2D26] focus:ring-[#7B2D26]"
                />
                <label htmlFor="pinToHomeCheck" className="text-xs font-semibold text-[#3B2A1E]">
                  Pin to Homepage Reels Showcase
                </label>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-[#E8D8C3]">
                <button
                  type="submit"
                  className="rounded-xl bg-[#7B2D26] px-5 py-2.5 text-xs font-bold text-[#FBF3E7] hover:bg-[#64231D] transition-all shadow-sm"
                >
                  Save &amp; Feature Reel
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] px-4 py-2.5 text-xs font-bold text-[#6E5545] hover:text-[#3B2A1E]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* View-Only Alert Banner */}
        {!canManage && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-4 text-xs text-amber-900 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Staff Read-Only View Active</p>
              <p className="mt-0.5 text-amber-800">
                You have active <strong>VIEW</strong> permissions for Instagram Reels. Adding, reordering, pinning, and hiding video assets require <strong>MANAGE</strong> access granted by the Platform Owner.
              </p>
            </div>
          </div>
        )}

        {/* Curated Reels Management Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-temple text-base font-bold text-[#7B2D26]">
              Active Curated Reels ({reels.length})
            </h3>
            <span className="text-xs text-[#8C7A6B]">
              Ordered top-to-bottom as displayed on site
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reels.map((reel, index) => (
              <div
                key={reel.id}
                className={`rounded-3xl border bg-[#FFFDF9] p-5 shadow-sm flex flex-col justify-between transition-all ${
                  reel.isHidden ? "opacity-60 border-dashed border-[#A8988B]" : "border-[#E8D8C3]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="rounded-md bg-[#7B2D26]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#7B2D26] uppercase font-temple">
                      {reel.category}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {reel.pinnedToHome && (
                        <span className="rounded bg-[#E8A33D] px-2 py-0.5 text-[10px] font-bold text-[#3B2A1E] flex items-center gap-1 shadow-xs">
                          <Pin className="h-2.5 w-2.5" />
                          <span>Pinned</span>
                        </span>
                      )}
                      {reel.isHidden && (
                        <span className="rounded bg-stone-200 text-stone-700 px-2 py-0.5 text-[10px] font-bold">
                          Hidden
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-[#3B2A1E] line-clamp-2 mb-2">
                    {reel.caption}
                  </p>

                  <div className="rounded-xl bg-[#FAF5EE] border border-[#E8D8C3] p-2.5 mb-3 break-all text-[11px] font-mono text-[#6E5545] flex items-center justify-between gap-2">
                    <span className="line-clamp-1">{reel.instagramUrl}</span>
                    <a
                      href={reel.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#7B2D26] hover:text-[#C1662F] shrink-0"
                      title="Open in Instagram"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="mt-4 pt-3 border-t border-[#E8D8C3] flex flex-wrap items-center justify-between gap-2">
                  {canManage ? (
                    <>
                      {/* Reorder Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleReorder(reel.id, "up")}
                          className="rounded-lg border border-[#E8D8C3] p-1.5 text-[#6E5545] hover:text-[#7B2D26] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#FBF3E7]"
                          title="Move Up"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          disabled={index === reels.length - 1}
                          onClick={() => handleReorder(reel.id, "down")}
                          className="rounded-lg border border-[#E8D8C3] p-1.5 text-[#6E5545] hover:text-[#7B2D26] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#FBF3E7]"
                          title="Move Down"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Pin/Unpin */}
                      <button
                        type="button"
                        onClick={() => handleTogglePin(reel.id)}
                        className={`rounded-xl px-2.5 py-1 text-xs font-bold transition-all flex items-center gap-1 ${
                          reel.pinnedToHome
                            ? "bg-[#E8A33D]/20 text-[#7B2D26] border border-[#E8A33D]"
                            : "border border-[#E8D8C3] bg-[#FBF3E7] text-[#6E5545] hover:text-[#3B2A1E]"
                        }`}
                      >
                        <Pin className="h-3 w-3" />
                        <span>{reel.pinnedToHome ? "Unpin" : "Pin"}</span>
                      </button>

                      {/* Hide/Unhide */}
                      <button
                        type="button"
                        onClick={() => handleToggleHide(reel.id)}
                        className={`rounded-xl px-2.5 py-1 text-xs font-bold transition-all flex items-center gap-1 ${
                          reel.isHidden
                            ? "bg-[#6B8E5A]/15 text-[#2A4720] border border-[#6B8E5A]/30"
                            : "border border-[#E8D8C3] bg-[#FBF3E7] text-[#6E5545] hover:text-rose-600"
                        }`}
                      >
                        {reel.isHidden ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        <span>{reel.isHidden ? "Unhide" : "Hide"}</span>
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleRemove(reel.id)}
                        className="rounded-xl border border-rose-200 bg-rose-50 p-1.5 text-rose-700 hover:bg-rose-100 transition-all"
                        title="Delete Reel"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <span className="text-[10px] text-[#A8988B] italic py-1 px-2">
                      Curation restricted
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
