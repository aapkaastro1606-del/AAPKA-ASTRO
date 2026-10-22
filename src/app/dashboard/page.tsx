"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AstrologerStateStore, AstrologerStatus } from "@/lib/store/astrologerStore";
import { PLACEHOLDER_ASTROLOGER } from "@/config/placeholderContent";
import {
  ShieldCheck,
  PhoneCall,
  Video,
  Users,
  DollarSign,
  BookOpen,
  Film,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Calendar,
  Tag,
  BarChart3,
  UserCheck,
  MessageCircle,
  FileText,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useCurrentUserRole } from "@/lib/auth/roleContext";

interface RealBooking {
  id: string;
  bookingId: string;
  userName: string;
  userPhone: string;
  userEmail?: string | null;
  productType: string;
  format: string;
  totalCost: number;
  lockedAmount?: number;
  bookingStatus: string;
  paymentStatus: string;
  scheduledSlot?: string | null;
  meetingLink?: string | null;
  concern?: string | null;
  createdAt: string;
  intakeDetails?: any;
}

export default function AstrologerDashboardPage() {
  const router = useRouter();
  const { isOwner, isAdmin, isAstrologer, hasPermission } = useCurrentUserRole();
  const [status, setStatus] = useState<AstrologerStatus>("AVAILABLE");
  const [presenceUpdating, setPresenceUpdating] = useState(false);
  const [bookings, setBookings] = useState<RealBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingFilter, setBookingFilter] = useState<"ALL" | "CONFIRMED" | "SCHEDULED" | "COMPLETED">("ALL");
  const [runningCron, setRunningCron] = useState(false);
  const [cronReport, setCronReport] = useState<any>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // 1. Fetch Authoritative Presence from PostgreSQL
  const fetchPresence = useCallback(async () => {
    try {
      const res = await fetch("/api/astrologer/presence");
      if (res.ok) {
        const data = await res.json();
        if (data?.status) {
          setStatus(data.status);
          AstrologerStateStore.setStatus(data.status);
        }
      }
    } catch {
      setStatus(AstrologerStateStore.getStatus());
    }
  }, []);

  // 2. Fetch Real Bookings from PostgreSQL
  const fetchRealBookings = useCallback(async () => {
    if (!isOwner && !isAdmin && !hasPermission("consultations")) return;
    setLoadingBookings(true);
    try {
      const res = await fetch("/api/admin/bookings?status=ALL");
      if (res.ok) {
        const data = await res.json();
        if (data?.success && Array.isArray(data.bookings)) {
          setBookings(data.bookings);
        }
      }
    } catch (err) {
      console.error("Failed to fetch live bookings:", err);
    } finally {
      setLoadingBookings(false);
    }
  }, [isOwner, isAdmin, hasPermission]);

  useEffect(() => {
    fetchPresence();
    fetchRealBookings();

    const interval = setInterval(() => {
      fetchPresence();
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchPresence, fetchRealBookings]);

  // 3. Mutate Presence in PostgreSQL
  const handleStatusChange = async (newStatus: AstrologerStatus) => {
    setStatus(newStatus);
    setPresenceUpdating(true);
    try {
      const res = await fetch("/api/astrologer/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        AstrologerStateStore.setStatus(newStatus);
        window.dispatchEvent(new Event("astro_state_changed"));
      }
    } catch (e) {
      console.error("Presence update failed:", e);
    } finally {
      setPresenceUpdating(false);
    }
  };

  // 4. Update Booking State in PostgreSQL
  const handleUpdateBookingState = async (bookingId: string, action: "schedule" | "complete") => {
    setActionFeedback(null);
    try {
      const bodyPayload: any = { action, bookingId };
      if (action === "schedule") {
        bodyPayload.scheduledSlot = "Tomorrow at 4:00 PM IST";
        bodyPayload.meetingLink = "WhatsApp call";
      }

      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });
      const data = await res.json();
      if (data.success) {
        setActionFeedback(`Booking ${bookingId} updated successfully.`);
        fetchRealBookings();
      } else {
        setActionFeedback(`Update failed: ${data.message || "Unknown error"}`);
      }
    } catch (err: any) {
      setActionFeedback(`Request error: ${err.message}`);
    }
  };

  // 5. Daily Automation Trigger
  const handleRunAutomation = async () => {
    setRunningCron(true);
    try {
      const res = await fetch("/api/cron/daily-astrology");
      const data = await res.json();
      setCronReport(data.report || data);
    } catch (e: any) {
      alert(`Automation Trigger: ${e.message || "Executed with in-memory fallback."}`);
    } finally {
      setRunningCron(false);
    }
  };

  // 6. Calculate authentic real revenue from PostgreSQL sessions
  const paidConfirmedSessions = bookings.filter((b) =>
    ["CONFIRMED", "SCHEDULED", "COMPLETED"].includes(b.bookingStatus)
  );

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyRevenue = paidConfirmedSessions
    .filter((b) => new Date(b.createdAt) >= startOfMonth)
    .reduce((sum, b) => sum + (b.totalCost || b.lockedAmount || 0), 0);

  // Filter Bookings by Tab
  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === "ALL") return true;
    if (bookingFilter === "CONFIRMED") return b.bookingStatus === "CONFIRMED";
    if (bookingFilter === "SCHEDULED") return b.bookingStatus === "SCHEDULED";
    if (bookingFilter === "COMPLETED") return b.bookingStatus === "COMPLETED";
    return true;
  });

  return (
    <div className="bg-[#FBF3E7] text-[#3B2A1E] min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Top Cockpit Header */}
        <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={PLACEHOLDER_ASTROLOGER.avatarUrl}
              alt={PLACEHOLDER_ASTROLOGER.displayName}
              className="h-16 w-16 rounded-2xl object-cover border-2 border-[#7B2D26] shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-temple text-2xl font-bold text-[#7B2D26]">Platform Control Desk</span>
                {isOwner && (
                  <span className="rounded-md bg-[#7B2D26] px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                    Site Owner
                  </span>
                )}
                {!isOwner && isAstrologer && (
                  <span className="rounded-md bg-[#C1662F] px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                    Astrologer Console
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6E5545]">
                {isOwner
                  ? "Unrestricted Site Owner Console • Full control across all platform sections"
                  : "Single-Astrologer Control Desk • Manage your live presence and client consultations"}
              </p>
            </div>
          </div>

          {/* Real-time Presence Broadcaster (Syncs to PostgreSQL in Real-Time) */}
          {(isOwner || isAstrologer || isAdmin) && (
            <div className="flex items-center gap-3 bg-[#FAF5EE] p-3 rounded-2xl border border-[#E8D8C3]">
              <span className="text-xs font-bold text-[#3B2A1E]">Broadcaster Status:</span>
              <div className="flex items-center gap-1.5">
                {[
                  { id: "AVAILABLE", label: "Available", color: "bg-[#6B8E5A]" },
                  { id: "BUSY", label: "Busy", color: "bg-[#E8A33D]" },
                  { id: "BREAK", label: "Break", color: "bg-[#C1662F]" },
                  { id: "OFFLINE", label: "Offline", color: "bg-stone-500" },
                ].map((btn) => (
                  <button
                    key={btn.id}
                    type="button"
                    disabled={presenceUpdating}
                    onClick={() => handleStatusChange(btn.id as AstrologerStatus)}
                    className={`rounded-xl px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                      status === btn.id
                        ? `${btn.color} text-white shadow-xs scale-105`
                        : "bg-[#FFFDF9] text-[#6E5545] border border-[#E8D8C3] hover:text-[#3B2A1E]"
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div className="rounded-2xl bg-amber-50 border border-amber-300 p-4 text-xs font-bold text-amber-900 flex items-center justify-between">
            <span>{actionFeedback}</span>
            <button
              type="button"
              onClick={() => setActionFeedback(null)}
              className="text-amber-800 underline text-[11px]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Management Tool Navigation Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {hasPermission("earnings") && (
            <Link
              href="/dashboard/earnings"
              className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 shadow-sm hover:border-[#7B2D26] hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6B8E5A]/15 text-[#6B8E5A]">
                  <DollarSign className="h-5 w-5" />
                </div>
                <span className="font-mono text-xs font-bold text-[#6B8E5A]">
                  +₹{monthlyRevenue.toLocaleString("en-IN")}
                </span>
              </div>
              <h3 className="font-temple text-sm font-bold text-[#7B2D26] group-hover:text-[#C1662F]">
                Earnings &amp; Payouts
              </h3>
              <p className="text-[11px] text-[#6E5545] mt-0.5">Real-time consultation revenue</p>
            </Link>
          )}

          {hasPermission("blog") && (
            <Link
              href="/dashboard/blog"
              className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 shadow-sm hover:border-[#7B2D26] hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7B2D26]/10 text-[#7B2D26]">
                  <BookOpen className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold text-[#7B2D26]">Editor</span>
              </div>
              <h3 className="font-temple text-sm font-bold text-[#7B2D26] group-hover:text-[#C1662F]">
                Vedic Blog Writer
              </h3>
              <p className="text-[11px] text-[#6E5545] mt-0.5">Create &amp; schedule articles</p>
            </Link>
          )}

          {hasPermission("reels") && (
            <Link
              href="/dashboard/reels"
              className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 shadow-sm hover:border-[#7B2D26] hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C1662F]/15 text-[#C1662F]">
                  <Film className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold text-[#C1662F]">Auto-Sync</span>
              </div>
              <h3 className="font-temple text-sm font-bold text-[#7B2D26] group-hover:text-[#C1662F]">
                Instagram Reels
              </h3>
              <p className="text-[11px] text-[#6E5545] mt-0.5">Pin, unpin &amp; curate reels</p>
            </Link>
          )}

          {hasPermission("clients") && (
            <Link
              href="/dashboard/clients"
              className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 shadow-sm hover:border-[#7B2D26] hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8A33D]/20 text-[#7B2D26]">
                  <Users className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold text-[#7B2D26]">CRM</span>
              </div>
              <h3 className="font-temple text-sm font-bold text-[#7B2D26] group-hover:text-[#C1662F]">
                Client Directory
              </h3>
              <p className="text-[11px] text-[#6E5545] mt-0.5">Past seekers &amp; Kundlis</p>
            </Link>
          )}

          {hasPermission("pricing") && (
            <Link
              href="/admin/pricing"
              className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 shadow-sm hover:border-[#7B2D26] hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6B8E5A]/15 text-[#6B8E5A]">
                  <Tag className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold text-[#6B8E5A]">Flat Fees</span>
              </div>
              <h3 className="font-temple text-sm font-bold text-[#7B2D26] group-hover:text-[#C1662F]">
                Flat Consultation Rates
              </h3>
              <p className="text-[11px] text-[#6E5545] mt-0.5">Configure flat fees &amp; promos</p>
            </Link>
          )}

          {hasPermission("analytics") && (
            <Link
              href="/admin/analytics"
              className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 shadow-sm hover:border-[#7B2D26] hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7B2D26]/10 text-[#7B2D26]">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold text-[#7B2D26]">Insights</span>
              </div>
              <h3 className="font-temple text-sm font-bold text-[#7B2D26] group-hover:text-[#C1662F]">
                Intelligence Analytics
              </h3>
              <p className="text-[11px] text-[#6E5545] mt-0.5">Real traffic &amp; telemetry</p>
            </Link>
          )}

          {isOwner && (
            <Link
              href="/admin/team"
              className="rounded-2xl border-2 border-[#7B2D26]/30 bg-[#FFFDF9] p-5 shadow-sm hover:border-[#7B2D26] hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7B2D26] text-white">
                  <UserCheck className="h-5 w-5" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-white bg-[#7B2D26] px-1.5 py-0.5 rounded">
                  Owner
                </span>
              </div>
              <h3 className="font-temple text-sm font-bold text-[#7B2D26] group-hover:text-[#C1662F]">
                Team Access
              </h3>
              <p className="text-[11px] text-[#6E5545] mt-0.5">Manage staff sections &amp; audit</p>
            </Link>
          )}
        </div>

        {/* Daily Automation Status & Manual Trigger Widget */}
        {(isOwner || isAdmin || hasPermission("analytics")) && (
          <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#7B2D26]/10 text-[#7B2D26]">
                  <Calendar className="h-6 w-6 text-[#7B2D26]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-temple text-base font-bold text-[#7B2D26]">
                      Daily Ephemeris &amp; Horoscope Automation
                    </h3>
                    <span className="rounded-full bg-[#6B8E5A]/15 border border-[#6B8E5A]/40 px-2 py-0.5 text-[10px] font-bold text-[#2A4720]">
                      Scheduled Daily (00:00 UTC)
                    </span>
                  </div>
                  <p className="text-xs text-[#6E5545] mt-0.5">
                    Computes 5 limbs of Panchang, 12 Rashi daily horoscopes, and caches to PostgreSQL.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={runningCron}
                onClick={handleRunAutomation}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7B2D26] px-4 py-2.5 text-xs font-bold text-[#FFFDF9] hover:bg-[#63231E] transition-all shadow-sm disabled:opacity-60 shrink-0 cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${runningCron ? "animate-spin" : ""}`} />
                <span>{runningCron ? "Executing Automation..." : "Run Daily Automation Now"}</span>
              </button>
            </div>

            {/* Execution Result Log */}
            {cronReport && (
              <div className="mt-4 rounded-2xl bg-[#FBF3E7] p-4 border border-[#E8D8C3] text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-[#E8D8C3] pb-2 font-bold">
                  <span className="text-[#7B2D26]">Latest Run Execution Status</span>
                  <span className="text-[#2A4720] font-mono">{cronReport.timestamp}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div>
                    <span className="text-[#A89080] text-[10px] block uppercase font-bold">Panchang Status</span>
                    <span className="font-bold text-[#2A4720]">{cronReport.panchangStatus}</span>
                  </div>
                  <div>
                    <span className="text-[#A89080] text-[10px] block uppercase font-bold">Horoscopes Pre-computed</span>
                    <span className="font-bold text-[#3B2A1E]">{cronReport.signsCalculatedCount} / 12 Signs</span>
                  </div>
                  <div>
                    <span className="text-[#A89080] text-[10px] block uppercase font-bold">Database Cached</span>
                    <span className="font-bold text-[#3B2A1E]">
                      {cronReport.databasePersisted ? "Yes (PostgreSQL)" : "Fallback (In-Memory)"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#A89080] text-[10px] block uppercase font-bold">Tithi Active</span>
                    <span className="font-bold text-[#7B2D26]">{cronReport.panchangSummary?.tithi || "Computed"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Confirmed & Paid Consultation Bookings (Real-Time from PostgreSQL) */}
        {(isOwner || isAstrologer || hasPermission("consultations")) && (
          <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#E8D8C3]">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="font-temple text-xl font-bold text-[#7B2D26] flex items-center gap-2">
                    <Users className="h-5 w-5 text-[#C1662F]" />
                    <span>Confirmed &amp; Paid Consultation Bookings</span>
                  </h2>
                  <span className="rounded-full bg-[#6B8E5A]/15 border border-[#6B8E5A]/30 px-2.5 py-0.5 text-xs font-bold text-[#2A4720]">
                    {bookings.length} Total
                  </span>
                </div>
                <p className="text-xs text-[#6E5545] mt-1">
                  Client bookings confirmed with upfront payment (synced in real-time from PostgreSQL database). Coordinate via 1-click WhatsApp or phone call.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/admin/bookings"
                  className="rounded-xl border border-[#7B2D26] bg-[#FFFDF9] hover:bg-[#FAF5EE] px-3.5 py-2 text-xs font-bold text-[#7B2D26] transition-all shadow-xs flex items-center gap-1.5"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-[#C1662F]" />
                  <span>Open Full Owner Queue</span>
                </Link>

                <button
                  type="button"
                  onClick={fetchRealBookings}
                  disabled={loadingBookings}
                  className="rounded-xl border border-[#E8D8C3] bg-[#FAF5EE] hover:bg-[#E8D8C3] px-3.5 py-2 text-xs font-bold text-[#3B2A1E] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loadingBookings ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {[
                { id: "ALL", label: "All Bookings", count: bookings.length },
                {
                  id: "CONFIRMED",
                  label: "Confirmed",
                  count: bookings.filter((b) => b.bookingStatus === "CONFIRMED").length,
                },
                {
                  id: "SCHEDULED",
                  label: "Scheduled",
                  count: bookings.filter((b) => b.bookingStatus === "SCHEDULED").length,
                },
                {
                  id: "COMPLETED",
                  label: "Completed",
                  count: bookings.filter((b) => b.bookingStatus === "COMPLETED").length,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setBookingFilter(tab.id as any)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    bookingFilter === tab.id
                      ? "bg-[#7B2D26] text-white shadow-xs"
                      : "bg-[#FAF5EE] text-[#6E5545] border border-[#E8D8C3] hover:text-[#3B2A1E]"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] rounded-full px-1.5 py-0.2 ${
                      bookingFilter === tab.id ? "bg-white/20 text-white" : "bg-[#E8D8C3] text-[#3B2A1E]"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {loadingBookings ? (
              <div className="py-12 text-center text-[#6E5545] space-y-2">
                <RefreshCw className="h-8 w-8 text-[#7B2D26] animate-spin mx-auto opacity-70" />
                <p className="text-xs font-bold">Loading real-time bookings from PostgreSQL...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="py-12 text-center text-[#6E5545] space-y-2">
                <Clock className="h-10 w-10 text-[#C1662F] mx-auto opacity-50" />
                <p className="text-sm font-medium">No bookings found in this category.</p>
                <p className="text-xs">
                  Real client consultation bookings will appear here instantly as soon as they are submitted.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((item) => {
                  const cleanedPhone = (item.userPhone || "").replace(/[^0-9]/g, "");
                  const productName =
                    item.productType === "vaastu"
                      ? "Vaastu Consultation"
                      : item.productType === "kundli_pdf"
                      ? "Kundli PDF Report"
                      : "Astro Consultation";

                  const whatsappMsg = `Pranam ${item.userName}, this is Acharya Niraj Kumar connecting regarding your booked ${productName} (Ref: ${item.bookingId}). Please let me know if you are ready for our consultation session via WhatsApp Call or Google Meet.`;
                  const whatsappHref = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(whatsappMsg)}`;

                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-[#E8D8C3] bg-[#FBF3E7] p-5 sm:p-6 flex flex-col lg:flex-row items-start justify-between gap-5 transition-all hover:border-[#7B2D26]/40 hover:shadow-xs"
                    >
                      {/* Left: Client Contact Details & Consultation Context */}
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#7B2D26] bg-[#FFFDF9] px-2.5 py-1 rounded border border-[#E8D8C3]">
                            {item.bookingId}
                          </span>
                          <span className="rounded-md bg-[#6B8E5A]/15 text-[#2A4720] border border-[#6B8E5A]/30 px-2 py-0.5 text-[10px] font-bold">
                            ₹{(item.totalCost || item.lockedAmount || 0).toLocaleString("en-IN")}
                          </span>
                          <span className="rounded-md bg-[#FFFDF9] px-2 py-0.5 text-[10px] font-bold text-[#C1662F] border border-[#E8D8C3] uppercase">
                            {productName}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              item.bookingStatus === "COMPLETED"
                                ? "bg-[#6B8E5A]/20 text-[#2A4720] border border-[#6B8E5A]/30"
                                : item.bookingStatus === "SCHEDULED"
                                ? "bg-blue-100 text-blue-800 border border-blue-300"
                                : item.bookingStatus === "CONFIRMED"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : "bg-amber-100 text-amber-800 border border-amber-300"
                            }`}
                          >
                            Status: {item.bookingStatus === "CONFIRMED" ? "Awaiting Session" : item.bookingStatus}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-temple text-base font-bold text-[#3B2A1E]">
                            {item.userName || "Seeker"}
                          </h3>
                          <div className="text-xs text-[#6E5545] space-x-2 mt-0.5">
                            <span>Phone: <strong>{item.userPhone || "Not provided"}</strong></span>
                            {item.userEmail && <span>&bull; {item.userEmail}</span>}
                            <span>&bull; Format: <strong>{item.format || "WhatsApp Call"}</strong></span>
                          </div>
                          {item.scheduledSlot && (
                            <div className="text-xs font-bold text-blue-900 mt-1">
                              Confirmed Slot: <span className="bg-blue-100 px-2 py-0.5 rounded">{item.scheduledSlot}</span>
                              {item.meetingLink && <span className="text-stone-600 font-normal ml-2">({item.meetingLink})</span>}
                            </div>
                          )}
                        </div>

                        {item.concern && (
                          <div className="bg-[#FFFDF9] rounded-xl p-3 border border-[#E8D8C3]/80 text-xs">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C1662F] block mb-1">
                              Client Query / Focus:
                            </span>
                            <p className="text-[#3B2A1E] font-medium leading-relaxed">{item.concern}</p>
                          </div>
                        )}
                      </div>

                      {/* Right: Direct Outreach CTAs & State Controls */}
                      <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-between gap-3 w-full lg:w-auto shrink-0">
                        {/* Direct Outreach CTAs */}
                        <div className="flex flex-col gap-2 w-full">
                          <a
                            href={whatsappHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-xl bg-[#25D366] hover:bg-[#20ba5a] px-4 py-2 text-xs font-bold text-white transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span>Reach Out on WhatsApp</span>
                          </a>

                          {cleanedPhone && (
                            <a
                              href={`tel:${cleanedPhone}`}
                              className="rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] hover:bg-[#FAF5EE] px-4 py-2 text-xs font-bold text-[#3B2A1E] transition-all flex items-center justify-center gap-1.5"
                            >
                              <PhoneCall className="h-3.5 w-3.5 text-[#7B2D26]" />
                              <span>Call Seeker</span>
                            </a>
                          )}
                        </div>

                        {/* Booking State Progression Controls */}
                        {isOwner && (
                          <div className="pt-2 border-t border-[#E8D8C3]/60 w-full text-right">
                            <span className="text-[10px] uppercase font-bold text-[#6E5545] block mb-1">
                              Quick State Update:
                            </span>
                            <div className="flex items-center justify-end gap-1.5">
                              {item.bookingStatus !== "SCHEDULED" && item.bookingStatus !== "COMPLETED" && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateBookingState(item.bookingId, "schedule")}
                                  className="rounded-lg bg-[#E8A33D]/20 text-[#C1662F] hover:bg-[#E8A33D]/30 border border-[#E8A33D]/40 px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer"
                                >
                                  &rarr; Set Scheduled
                                </button>
                              )}

                              {item.bookingStatus !== "COMPLETED" && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateBookingState(item.bookingId, "complete")}
                                  className="rounded-lg bg-[#6B8E5A] text-white hover:bg-[#58754a] px-2.5 py-1 text-[11px] font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                  <span>Mark Completed</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
