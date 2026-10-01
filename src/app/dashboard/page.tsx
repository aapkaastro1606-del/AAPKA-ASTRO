"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AstrologerStateStore,
  AstrologerStatus,
  QueueItem,
  ConfirmedBookingItem,
  ActiveSession,
} from "@/lib/store/astrologerStore";
import { AdminStore } from "@/lib/store/adminStore";
import { PLACEHOLDER_ASTROLOGER } from "@/config/placeholderContent";
import { MandalaDivider } from "@/components/ui/MandalaDivider";
import { DiyaIcon } from "@/components/ui/DiyaIcon";
import {
  ShieldCheck,
  PhoneCall,
  Video,
  MessageSquare,
  Users,
  DollarSign,
  BookOpen,
  Film,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Settings,
  RefreshCw,
  Calendar,
  Tag,
  BarChart3,
  UserCheck,
  MessageCircle,
  FileText,
} from "lucide-react";
import { useCurrentUserRole } from "@/lib/auth/roleContext";

export default function AstrologerDashboardPage() {
  const router = useRouter();
  const { isOwner, isAdmin, isAstrologer, hasPermission } = useCurrentUserRole();
  const [status, setStatus] = useState<AstrologerStatus>("AVAILABLE");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [confirmedBookings, setConfirmedBookings] = useState<ConfirmedBookingItem[]>(() =>
    AstrologerStateStore.getConfirmedBookings()
  );
  const [bookingFilter, setBookingFilter] = useState<"ALL" | "CONFIRMED" | "AWAITING_SESSION" | "COMPLETED">("ALL");
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [runningCron, setRunningCron] = useState(false);
  const [cronReport, setCronReport] = useState<any>(null);
  const analytics = AdminStore.getAnalytics();

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

  const sync = () => {
    setStatus(AstrologerStateStore.getStatus());
    setQueue(AstrologerStateStore.getQueue());
    setActiveSession(AstrologerStateStore.getActiveSession());
    setConfirmedBookings(AstrologerStateStore.getConfirmedBookings());
  };

  useEffect(() => {
    sync();
    window.addEventListener("astro_state_changed", sync);
    window.addEventListener("aapka_booking_updated", sync);
    const interval = setInterval(sync, 2000);
    return () => {
      window.removeEventListener("astro_state_changed", sync);
      window.removeEventListener("aapka_booking_updated", sync);
      clearInterval(interval);
    };
  }, []);

  const handleStatusChange = (newStatus: AstrologerStatus) => {
    AstrologerStateStore.setStatus(newStatus);
    setStatus(newStatus);
  };

  const handleUpdateBookingState = (id: string, newState: "CONFIRMED" | "AWAITING_SESSION" | "COMPLETED") => {
    AstrologerStateStore.updateBookingState(id, newState);
    setConfirmedBookings(AstrologerStateStore.getConfirmedBookings());
  };

  const handleRemoveBooking = (id: string) => {
    AstrologerStateStore.removeConfirmedBooking(id);
    setConfirmedBookings(AstrologerStateStore.getConfirmedBookings());
  };

  const handleSimulateNewBooking = () => {
    const newBooking: ConfirmedBookingItem = {
      id: `bk-${Date.now()}`,
      bookingId: `AA-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: `usr_${Date.now()}`,
      userName: "Rahul Sengupta",
      userPhone: "+91 98200 11223",
      userEmail: "rahul.sengupta@example.com",
      productId: "astro",
      productName: "Astro Consultation",
      format: "WhatsApp Call / Google Meet",
      concern: "Career progression, foreign settlement yog, and Saturn Sade Sati remedies",
      amountPaid: 1051,
      paymentStatus: "PAID",
      bookingState: "CONFIRMED",
      bookedAt: new Date().toISOString(),
      preferredSlot: "Today • Immediate Next Window",
      birthDetails: {
        name: "Rahul Sengupta",
        gender: "male",
        birthDate: "1991-11-12",
        birthTime: "10:15",
        birthPlace: "Kolkata, WB",
        latitude: 22.5726,
        longitude: 88.3639,
        timezone: 5.5,
      },
    };
    AstrologerStateStore.addConfirmedBooking(newBooking);
    sync();
  };

  const filteredBookings = confirmedBookings.filter((b) => {
    if (bookingFilter === "ALL") return true;
    return b.bookingState === bookingFilter;
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
              <div className="flex items-center gap-2">
                <h1 className="font-temple text-2xl font-bold text-[#7B2D26]">
                  {isOwner
                    ? "Platform Control Desk"
                    : isAstrologer
                    ? `${PLACEHOLDER_ASTROLOGER.displayName} Cockpit`
                    : "Staff Operator Console"}
                </h1>
                <span className="rounded-md bg-[#7B2D26] px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                  {isOwner
                    ? "Site Owner"
                    : isAdmin
                    ? "Platform Admin"
                    : isAstrologer
                    ? "Astrologer Admin"
                    : "Staff Operator"}
                </span>
              </div>
              <p className="text-xs text-[#6E5545] mt-0.5">
                {isOwner
                  ? "Unrestricted Site Owner Console • Full control across all platform sections"
                  : isAstrologer
                  ? "Single-Astrologer Control Desk • Manage your live presence and client consultations"
                  : "Scoped Employee Desk • Access granted to your assigned site sections"}
              </p>
            </div>
          </div>

          {/* Real-time Presence Broadcaster Toggle (Only if consultations permitted) */}
          {(isOwner || isAdmin || isAstrologer || hasPermission("consultations")) && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-[#FBF3E7] p-2.5 rounded-2xl border border-[#E8D8C3]">
              <span className="text-xs font-bold text-[#6E5545] px-2">Broadcaster Status:</span>
              <div className="flex rounded-xl bg-[#FFFDF9] p-1 border border-[#E8D8C3] gap-1">
                {[
                  { id: "AVAILABLE", label: "Available", color: "bg-[#6B8E5A] text-white" },
                  { id: "BUSY", label: "Busy", color: "bg-[#E8A33D] text-[#3B2A1E]" },
                  { id: "BREAK", label: "Break", color: "bg-[#C1662F] text-white" },
                  { id: "OFFLINE", label: "Offline", color: "bg-[#A8988B] text-white" },
                ].map((btn) => (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={() => handleStatusChange(btn.id as AstrologerStatus)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                      status === btn.id
                        ? `${btn.color} shadow-sm`
                        : "text-[#6E5545] hover:text-[#3B2A1E]"
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active Session Callout (if active and consultation permitted) */}
        {activeSession && (isOwner || isAdmin || isAstrologer || hasPermission("consultations")) && (
          <div className="rounded-3xl border-2 border-[#6B8E5A] bg-[#F4F9F2] p-6 shadow-md flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6B8E5A] text-white animate-pulse">
                <PhoneCall className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2A4720]">
                  LIVE CONSULTATION IN PROGRESS
                </span>
                <h3 className="font-temple text-lg font-bold text-[#2A4720]">
                  Active with {activeSession.userName} ({activeSession.type.toUpperCase()})
                </h3>
                <p className="text-xs text-[#4F6D40]">
                  Session ID: {activeSession.id} • Consultation: Flat Pre-Paid (No per-minute debits)
                </p>
              </div>
            </div>

            <Link
              href={`/dashboard/session/${activeSession.id}`}
              className="rounded-xl bg-[#2A4720] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#1f3517] transition-all shadow-md"
            >
              Open Workbench &rarr;
            </Link>
          </div>
        )}

        {/* Management Tool Navigation Cards (Filtered by per-section permissions) */}
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
                  +₹{analytics.monthlyRevenue.toLocaleString("en-IN")}
                </span>
              </div>
              <h3 className="font-temple text-sm font-bold text-[#7B2D26] group-hover:text-[#C1662F]">
                Earnings &amp; Payouts
              </h3>
              <p className="text-[11px] text-[#6E5545] mt-0.5">Daily &amp; monthly revenue</p>
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
                <span className="text-[10px] font-bold text-[#6B8E5A]">Rates</span>
              </div>
              <h3 className="font-temple text-sm font-bold text-[#7B2D26] group-hover:text-[#C1662F]">
                Pricing &amp; Rates
              </h3>
              <p className="text-[11px] text-[#6E5545] mt-0.5">Configure per-min fees</p>
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
              <p className="text-[11px] text-[#6E5545] mt-0.5">Funnels &amp; volume data</p>
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

        {/* Daily Automation Status & Manual Trigger Widget (Only for Owner/Admin/Analytics) */}
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
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7B2D26] px-4 py-2.5 text-xs font-bold text-[#FFFDF9] hover:bg-[#63231E] transition-all shadow-sm disabled:opacity-60 shrink-0"
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
                    <span className="font-bold text-[#3B2A1E]">{cronReport.databasePersisted ? "Yes (PostgreSQL)" : "Fallback (In-Memory)"}</span>
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

        {/* Confirmed & Paid Consultation Bookings (Only for Consultations operator or Owner/Admin) */}
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
                    {confirmedBookings.length} Total
                  </span>
                </div>
                <p className="text-xs text-[#6E5545] mt-1">
                  Client bookings confirmed with upfront payment. Reach out directly via WhatsApp call or Google Meet at the arranged slot.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto">
                <button
                  type="button"
                  onClick={handleSimulateNewBooking}
                  className="rounded-xl border border-[#E8D8C3] bg-[#FAF5EE] hover:bg-[#E8D8C3] px-3.5 py-2 text-xs font-bold text-[#7B2D26] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>+ Simulate Paid Booking</span>
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {[
                { id: "ALL", label: "All Bookings", count: confirmedBookings.length },
                {
                  id: "CONFIRMED",
                  label: "Confirmed",
                  count: confirmedBookings.filter((b) => b.bookingState === "CONFIRMED").length,
                },
                {
                  id: "AWAITING_SESSION",
                  label: "Awaiting Session",
                  count: confirmedBookings.filter((b) => b.bookingState === "AWAITING_SESSION").length,
                },
                {
                  id: "COMPLETED",
                  label: "Completed",
                  count: confirmedBookings.filter((b) => b.bookingState === "COMPLETED").length,
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

            {filteredBookings.length === 0 ? (
              <div className="py-12 text-center text-[#6E5545] space-y-2">
                <Clock className="h-10 w-10 text-[#C1662F] mx-auto opacity-50" />
                <p className="text-sm font-medium">No bookings in this category.</p>
                <p className="text-xs">
                  Incoming paid consultation bookings will appear here instantly with full client contact details.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((item) => {
                  const cleanedPhone = item.userPhone.replace(/[^0-9]/g, "");
                  const whatsappMsg = `Pranam ${item.userName}, this is Acharya Niraj Kumar connecting regarding your booked ${item.productName} (Ref: ${item.bookingId}). Please let me know if you are ready for our consultation session via WhatsApp Call or Google Meet.`;
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
                            PAID: Flat ₹{item.amountPaid.toLocaleString("en-IN")}
                          </span>
                          <span className="rounded-md bg-[#FFFDF9] px-2 py-0.5 text-[10px] font-bold text-[#C1662F] border border-[#E8D8C3] uppercase">
                            {item.productName}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              item.bookingState === "COMPLETED"
                                ? "bg-[#6B8E5A]/20 text-[#2A4720] border border-[#6B8E5A]/30"
                                : item.bookingState === "AWAITING_SESSION"
                                ? "bg-[#E8A33D]/20 text-[#C1662F] border border-[#E8A33D]/30"
                                : "bg-[#7B2D26]/10 text-[#7B2D26] border border-[#7B2D26]/20"
                            }`}
                          >
                            State:{" "}
                            {item.bookingState === "CONFIRMED"
                              ? "Confirmed"
                              : item.bookingState === "AWAITING_SESSION"
                              ? "Awaiting Session"
                              : "Completed"}
                          </span>
                        </div>

                        {/* Client Identity & Phone */}
                        <div>
                          <h3 className="font-temple text-lg font-bold text-[#7B2D26]">
                            {item.userName}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-[#6E5545] mt-1 font-body">
                            <span className="font-bold text-[#3B2A1E]">
                              Phone: <span className="font-mono text-[#7B2D26] font-bold">{item.userPhone}</span>
                            </span>
                            {item.userEmail && <span>&bull; {item.userEmail}</span>}
                            <span>
                              &bull; Preferred Slot:{" "}
                              <strong>{item.preferredSlot || "Immediate Next Window"}</strong>
                            </span>
                            <span>
                              &bull; Format: <strong>{item.format}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Consultation Topic / Concern */}
                        <div className="bg-[#FFFDF9] p-3 rounded-xl border border-[#E8D8C3] text-xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#C1662F] block mb-0.5">
                            Client&apos;s Focus &amp; Question:
                          </span>
                          <p className="text-[#3B2A1E] font-medium leading-relaxed">{item.concern}</p>
                          {item.birthDetails && (
                            <p className="text-[11px] text-[#6E5545] mt-1.5 pt-1.5 border-t border-[#E8D8C3]/50">
                              Born: <strong>{item.birthDetails.birthDate}</strong> at{" "}
                              <strong>{item.birthDetails.birthTime}</strong> ({item.birthDetails.birthPlace})
                            </p>
                          )}
                          {item.propertyDetails && (
                            <p className="text-[11px] text-[#6E5545] mt-1.5 pt-1.5 border-t border-[#E8D8C3]/50">
                              Property: <strong>{item.propertyDetails.propertyType}</strong> (
                              {item.propertyDetails.propertyLocation})
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Direct Outreach CTAs & State Controls (Direct Outreach & Status Actions) */}
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

                          <a
                            href={`tel:${cleanedPhone}`}
                            className="rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] hover:bg-[#FAF5EE] px-4 py-2 text-xs font-bold text-[#3B2A1E] transition-all flex items-center justify-center gap-1.5"
                          >
                            <PhoneCall className="h-3.5 w-3.5 text-[#7B2D26]" />
                            <span>Call {item.userPhone}</span>
                          </a>

                          <Link
                            href={`/dashboard/session/${item.id}`}
                            className="rounded-xl border border-[#E8D8C3] bg-[#FAF5EE] hover:bg-[#E8D8C3] px-4 py-2 text-xs font-bold text-[#7B2D26] transition-all flex items-center justify-center gap-1.5"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span>Open Chart &amp; Remedies</span>
                          </Link>
                        </div>

                        {/* Booking State Progression Controls */}
                        <div className="pt-2 border-t border-[#E8D8C3]/60 w-full text-right">
                          <span className="text-[10px] uppercase font-bold text-[#6E5545] block mb-1">
                            Update State:
                          </span>
                          <div className="flex items-center justify-end gap-1.5">
                            {item.bookingState !== "AWAITING_SESSION" && item.bookingState !== "COMPLETED" && (
                              <button
                                type="button"
                                onClick={() => handleUpdateBookingState(item.id, "AWAITING_SESSION")}
                                className="rounded-lg bg-[#E8A33D]/20 text-[#C1662F] hover:bg-[#E8A33D]/30 border border-[#E8A33D]/40 px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer"
                              >
                                &rarr; Awaiting Session
                              </button>
                            )}

                            {item.bookingState !== "COMPLETED" && (
                              <button
                                type="button"
                                onClick={() => handleUpdateBookingState(item.id, "COMPLETED")}
                                className="rounded-lg bg-[#6B8E5A] text-white hover:bg-[#58754a] px-2.5 py-1 text-[11px] font-bold transition-all shadow-xs cursor-pointer"
                              >
                                &check; Mark Completed
                              </button>
                            )}

                            {item.bookingState === "COMPLETED" && (
                              <button
                                type="button"
                                onClick={() => handleUpdateBookingState(item.id, "CONFIRMED")}
                                className="text-[11px] text-[#7D6B5D] hover:underline cursor-pointer"
                              >
                                Reset to Confirmed
                              </button>
                            )}
                          </div>
                        </div>
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
