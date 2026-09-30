"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AstrologerStateStore,
  AstrologerStatus,
  QueueItem,
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
} from "lucide-react";
import { useCurrentUserRole } from "@/lib/auth/roleContext";

export default function AstrologerDashboardPage() {
  const router = useRouter();
  const { isOwner, isAdmin, isAstrologer, hasPermission } = useCurrentUserRole();
  const [status, setStatus] = useState<AstrologerStatus>("AVAILABLE");
  const [queue, setQueue] = useState<QueueItem[]>([]);
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
  };

  useEffect(() => {
    sync();
    window.addEventListener("astro_state_changed", sync);
    const interval = setInterval(sync, 2000);
    return () => {
      window.removeEventListener("astro_state_changed", sync);
      clearInterval(interval);
    };
  }, []);

  const handleStatusChange = (newStatus: AstrologerStatus) => {
    AstrologerStateStore.setStatus(newStatus);
    setStatus(newStatus);
  };

  const handleAcceptQueueItem = (item: QueueItem) => {
    const session = AstrologerStateStore.startDirectSession({
      userName: item.userName,
      userPhone: item.userPhone,
      type: item.consultationType,
      birthDetails: item.birthDetails,
      concern: item.concern,
    });
    router.push(`/dashboard/session/${session.id}`);
  };

  const handleRemoveQueueItem = (id: string) => {
    AstrologerStateStore.removeFromQueue(id);
    setQueue(AstrologerStateStore.getQueue());
  };

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

        {/* Incoming Live Queue (Only for Consultations operator or Owner/Admin) */}
        {(isOwner || isAstrologer || hasPermission("consultations")) && (
          <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E8D8C3]">
              <div>
                <h2 className="font-temple text-xl font-bold text-[#7B2D26] flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#C1662F]" />
                  <span>Live Incoming Queue ({queue.length})</span>
                </h2>
                <p className="text-xs text-[#6E5545] mt-0.5">
                  Clients currently waiting to enter consultation with you.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  // Seed a demo queue item if empty for operator testing
                  AstrologerStateStore.addToQueue({
                    userName: "Devendra Verma",
                    userPhone: "+91 98111 22334",
                    consultationType: "voice",
                    concern: "Mahadasha change & business investment timing",
                    birthDetails: {
                      name: "Devendra Verma",
                      gender: "male",
                      birthDate: "1988-04-18",
                      birthTime: "06:45",
                      birthPlace: "Lucknow, UP",
                      latitude: 26.8467,
                      longitude: 80.9462,
                      timezone: 5.5,
                    },
                  });
                  sync();
                }}
                className="text-xs font-semibold text-[#C1662F] hover:underline"
              >
                + Simulate Incoming Seeker
              </button>
            </div>

            {queue.length === 0 ? (
              <div className="py-12 text-center text-[#6E5545] space-y-2">
                <Clock className="h-10 w-10 text-[#C1662F] mx-auto opacity-50" />
                <p className="text-sm font-medium">Queue is clear.</p>
                <p className="text-xs">Incoming consultation requests will appear here instantly with sound alert.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {queue.map((item, idx) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-[#E8D8C3] bg-[#FBF3E7] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7B2D26] text-white font-mono font-bold text-sm">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-temple text-base font-bold text-[#7B2D26]">
                            {item.userName}
                          </h4>
                          <span className="rounded-md bg-[#FFFDF9] px-2 py-0.5 text-[10px] font-bold text-[#C1662F] border border-[#E8D8C3] uppercase">
                            {item.consultationType}
                          </span>
                        </div>
                        <p className="text-xs text-[#6E5545] mt-1">
                          Concern: <strong>{item.concern}</strong>
                        </p>
                        <p className="text-[11px] text-[#6E5545]">
                          Born: {item.birthDetails.birthDate} at {item.birthDetails.birthTime} ({item.birthDetails.birthPlace})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveQueueItem(item.id)}
                        className="rounded-xl border border-[#E8D8C3] px-3 py-2 text-xs font-semibold text-[#6E5545] hover:bg-[#FFFDF9]"
                      >
                        Dismiss
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAcceptQueueItem(item)}
                        className="rounded-xl bg-[#6B8E5A] px-4 py-2 text-xs font-bold text-white hover:bg-[#58754a] transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <PhoneCall className="h-3.5 w-3.5" />
                        <span>Accept &amp; Connect</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
