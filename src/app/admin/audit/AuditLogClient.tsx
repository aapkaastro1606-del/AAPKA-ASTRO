"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  Search,
  Filter,
  Clock,
  User,
  Activity,
  RefreshCw,
  FileText,
  AlertCircle,
  Tag,
  CreditCard,
  Layers,
} from "lucide-react";
import { AdminHelpPanel } from "@/components/admin/AdminHelpPanel";

export interface AuditLogItem {
  id: string;
  action: string;
  actorEmail: string;
  targetId?: string | null;
  targetType?: string | null;
  notes?: string | null;
  createdAt: string;
}

interface AuditLogClientProps {
  initialLogs: AuditLogItem[];
  ownerEmail: string;
}

export default function AuditLogClient({ initialLogs, ownerEmail }: AuditLogClientProps) {
  const [logs, setLogs] = useState<AuditLogItem[]>(initialLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAction, setSelectedAction] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(false);

  const refreshLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/audit?limit=100");
      const data = await res.json();
      if (data.success && Array.isArray(data.logs)) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error("Failed to refresh audit logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchQuery === "" ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.notes && log.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.targetId && log.targetId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesAction =
      selectedAction === "ALL" ||
      log.action.toUpperCase().includes(selectedAction.toUpperCase());

    return matchesSearch && matchesAction;
  });

  const formatActionName = (action: string) => {
    return action
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getActionBadge = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes("APPROVE") || act.includes("PUBLISH")) {
      return "bg-[#EAF5EA] text-[#2E7D32] border-[#C8E6C9]";
    }
    if (act.includes("REJECT") || act.includes("DELETE") || act.includes("REVOKE")) {
      return "bg-[#FDF2F2] text-[#D32F2F] border-[#FFCDD2]";
    }
    if (act.includes("RESTORE") || act.includes("PRICE") || act.includes("PAYMENT")) {
      return "bg-[#FFF8E1] text-[#F57F17] border-[#FFE082]";
    }
    return "bg-[#FBF3E7] text-[#7B2D26] border-[#E8D8C3]";
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] py-8 px-4 sm:px-6 lg:px-8 text-[#3B2A1E]">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E8D8C3] pb-5">
          <div className="space-y-1">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7B2D26] hover:underline mb-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Admin Home
            </Link>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#7B2D26]/10 text-[#7B2D26]">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-temple text-[#7B2D26]">
                  Audit Trail &amp; Activity Log
                </h1>
                <p className="text-xs text-[#6E5545]">
                  Owner Security View &bull; Recording who changed what, and when across Aapka Astro
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#EAF5EA] text-[#2E7D32] border border-[#C8E6C9]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Owner Authenticated ({ownerEmail})
            </span>
            <button
              onClick={refreshLogs}
              disabled={isLoading}
              className="px-3.5 py-1.5 rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] text-xs font-bold text-[#7B2D26] hover:bg-[#FBF3E7] transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* How-To Help Panel */}
        <AdminHelpPanel
          title="How to read the platform audit trail"
          steps={[
            "Every administrative operation—approving UPI transactions, changing consultation pricing, saving content drafts, publishing updates, and modifying staff permissions—is permanently written to this audit log.",
            "Review Actor Email to verify which team member or system process executed the action.",
            "Inspect the Target ID and Target Type to see the exact entity affected (session ID, content collection, or pricing key).",
            "Use the Filter tabs to isolate Pricing, Payments, or Content changes quickly.",
            "All records are immutable and wrapped in server-side database transactions.",
          ]}
          tip="Only you (the Owner) can access this page. Staff members receive a 403 Forbidden if they attempt to view audit logs."
        />

        {/* Filter Bar */}
        <div className="p-4 rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C7A6B]" />
              <input
                type="text"
                placeholder="Search by action, email, or details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E8D8C3] bg-[#FBF3E7]/40 text-xs text-[#3B2A1E] focus:outline-none focus:ring-2 focus:ring-[#7B2D26]/30 font-medium"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { label: "All Events", value: "ALL" },
                { label: "Content", value: "CONTENT" },
                { label: "Pricing", value: "PRICE" },
                { label: "Payments", value: "PAYMENT" },
                { label: "Staff", value: "STAFF" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setSelectedAction(tab.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    selectedAction === tab.value
                      ? "bg-[#7B2D26] text-white shadow-xs"
                      : "bg-[#FBF3E7] text-[#6E5545] hover:bg-[#E8D8C3]/50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E8D8C3] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#7B2D26]" />
              <span className="text-xs font-bold font-temple text-[#7B2D26]">
                Recorded Operations ({filteredLogs.length})
              </span>
            </div>
            <span className="text-[11px] text-[#6E5545]">Latest events first</span>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <AlertCircle className="h-8 w-8 text-[#8C7A6B] mx-auto opacity-50" />
              <p className="text-xs text-[#6E5545]">No audit logs match your search criteria.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#E8D8C3]/60">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-[#FBF3E7]/30 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs">
                  <div className="space-y-1.5 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getActionBadge(log.action)}`}>
                        {formatActionName(log.action)}
                      </span>
                      {log.targetType && (
                        <span className="px-2 py-0.5 rounded-md bg-[#FBF3E7] text-[10px] font-bold text-[#6E5545] border border-[#E8D8C3]">
                          {log.targetType}
                        </span>
                      )}
                      {log.targetId && (
                        <span className="font-mono text-[11px] text-[#8C7A6B]">
                          ID: {log.targetId}
                        </span>
                      )}
                    </div>

                    {log.notes && (
                      <p className="text-xs text-[#3B2A1E] leading-relaxed">
                        {log.notes}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-[#8C7A6B]">
                      <span className="flex items-center gap-1 font-medium">
                        <User className="h-3 w-3" />
                        {log.actorEmail}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 text-left sm:text-right text-[11px] text-[#8C7A6B] font-mono">
                    {new Date(log.createdAt).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
