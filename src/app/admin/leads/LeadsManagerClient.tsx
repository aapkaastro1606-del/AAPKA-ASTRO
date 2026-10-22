"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Download,
  Trash2,
  RefreshCw,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  User,
  ExternalLink,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
} from "lucide-react";
import { DiyaIcon } from "@/components/ui/DiyaIcon";
import { AdminHelpPanel } from "@/components/admin/AdminHelpPanel";
import { DataStateTableRow, parseFetchError, DataStateError } from "@/components/admin/DataStateView";

interface KundliLeadItem {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  gender: string;
  dob: string;
  timeOfBirth: string;
  placeOfBirth: string;
  latitude?: number | null;
  longitude?: number | null;
  sourcePage: string;
  userId?: string | null;
  consentGiven: boolean;
  consentText: string;
  consentVersion: string;
  consentTimestamp: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    name?: string | null;
  } | null;
}

interface LeadsManagerClientProps {
  userEmail: string;
}

export default function LeadsManagerClient({ userEmail }: LeadsManagerClientProps) {
  const [leads, setLeads] = useState<KundliLeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const [stats, setStats] = useState({ total: 0, todayCount: 0 });
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Delete modal state
  const [deletingLead, setDeletingLead] = useState<KundliLeadItem | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fetchError, setFetchError] = useState<DataStateError | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setNotice(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      params.set("page", String(page));
      params.set("pageSize", "25");

      setFetchError(null);
      const res = await fetch(`/api/admin/leads?${params.toString()}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const err = parseFetchError(res, errData);
        setFetchError(err);
        setLeads([]);
        setNotice({ type: "error", text: err.message || "Failed to load leads." });
        return;
      }

      const data = await res.json();

      if (data.success) {
        setLeads(data.leads || []);
        setTotalLeads(data.total || 0);
        setTotalPages(data.totalPages || 1);
        if (data.stats) {
          setStats(data.stats);
        }
        setFetchError(null);
      } else {
        const err = parseFetchError(res, data);
        setFetchError(err);
        setLeads([]);
        setNotice({ type: "error", text: data.message || "Failed to load leads." });
      }
    } catch (err: any) {
      setFetchError({ status: 500, message: "Could not load. Retry." });
      setLeads([]);
      setNotice({ type: "error", text: "Network error loading leads." });
    } finally {
      setLoading(false);
    }
  }, [search, startDate, endDate, page]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleExportCsv = async () => {
    setExporting(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/leads/export");
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Export failed");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `aapka-astro-kundli-leads-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setNotice({
        type: "success",
        text: "CSV export generated and downloaded. Action recorded in tamper-evident AuditLog.",
      });
    } catch (err: any) {
      setNotice({ type: "error", text: err.message || "Failed to export CSV." });
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteOnRequest = async () => {
    if (!deletingLead) return;
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: deletingLead.id,
          reason: deleteReason.trim() || "Seeker requested data erasure / withdrawal of consent",
        }),
      });
      const data = await res.json();

      if (data.success) {
        setNotice({
          type: "success",
          text: `Lead for "${deletingLead.name}" permanently deleted. Action logged in AuditLog.`,
        });
        setDeletingLead(null);
        setDeleteReason("");
        fetchLeads();
      } else {
        setNotice({ type: "error", text: data.message || "Failed to delete lead." });
      }
    } catch (err: any) {
      setNotice({ type: "error", text: "Network error deleting lead." });
    } finally {
      setDeleteLoading(false);
    }
  };

  const buildWhatsAppConsultationUrl = (lead: KundliLeadItem) => {
    const cleanPhone = lead.phone.replace(/[^\d]/g, "");
    const greeting = encodeURIComponent(
      `Pranam ${lead.name} Ji! This is Acharya Niraj Kumar's sanctum desk (Aapka Astro). We noted your Janam Kundli calculated for ${lead.placeOfBirth}. How may Acharya Ji guide your life path or planetary remedies?`
    );
    return `https://wa.me/${cleanPhone}?text=${greeting}`;
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] py-8 px-4 sm:px-6 lg:px-8 text-[#3B2A1E]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Breadcrumb & Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8D8C3] pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7B2D26] hover:text-[#C1662F] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Admin Home
            </Link>
            <span className="text-[#C5A880]">&bull;</span>
            <Link
              href="/admin/staff"
              className="text-xs font-semibold text-[#6E5545] hover:text-[#7B2D26] transition-colors"
            >
              Staff Permissions
            </Link>
            <span className="text-[#C5A880]">&bull;</span>
            <span className="text-xs font-bold text-[#7B2D26]">Free Kundli Leads</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-[#6E5545]">
              Logged in as Owner: <strong className="text-[#7B2D26]">{userEmail}</strong>
            </span>
          </div>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FBF3E7] p-6 rounded-2xl border border-[#E8D8C3]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7B2D26]/10 text-[#7B2D26] text-xs font-bold uppercase tracking-wider">
              <DiyaIcon size={14} />
              Owner Sanctum Vault
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-temple text-[#7B2D26]">
              Free Kundli Leads &amp; Consents
            </h1>
            <p className="text-xs text-[#6E5545] max-w-2xl leading-relaxed">
              Real-time directory of seekers who generated free Janam Kundlis with explicit opt-in
              consent. Strictly for manual coordination by Acharya Ji&apos;s desk — zero automated
              marketing messages.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCsv}
              disabled={exporting || leads.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7B2D26] text-[#FBF3E7] text-xs font-bold hover:bg-[#64221C] transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>{exporting ? "Generating CSV..." : "Export Leads to CSV"}</span>
            </button>
            <button
              onClick={fetchLeads}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#E8D8C3] bg-white text-[#6E5545] text-xs font-medium hover:bg-[#FBF3E7] transition-all cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* How-To Help Panel for Non-Technical Owner */}
        <AdminHelpPanel
          title="How to manage and follow up with Kundli leads"
          steps={[
            {
              title: "What are these leads?",
              description: "These are seekers who generated a free Kundli chart on www.aapkaastro.com and opted in with their name, phone, and birth details.",
            },
            {
              title: "Export to CSV",
              description: "Click 'Export Leads to CSV' at any time to download an Excel-compatible spreadsheet of phone numbers and birth charts.",
            },
            {
              title: "Follow up with seekers",
              description: "Acharya Ji's sanctum desk can message seekers via WhatsApp to offer personalized 1-on-1 consultations or gemstone recommendations.",
            },
          ]}
          tip="Lead details are protected. Only the Platform Owner can view or export seeker contact numbers."
          defaultExpanded={true}
        />

        {/* Status / Audit Notice */}
        {notice && (
          <div
            className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 ${
              notice.type === "success"
                ? "bg-[#F5F7F2] border-[#6B8E5A]/40 text-[#2A4720]"
                : "bg-[#FDF2F0] border-[#E0A899] text-[#7B2D26]"
            }`}
          >
            <div className="flex items-center gap-2">
              {notice.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-[#6B8E5A]" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-[#C1662F]" />
              )}
              <span className="font-medium">{notice.text}</span>
            </div>
            <button
              onClick={() => setNotice(null)}
              className="text-xs underline hover:opacity-80"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#6E5545]">
              Total Leads Captured
            </div>
            <div className="text-2xl font-bold font-temple text-[#7B2D26] mt-1">
              {stats.total.toLocaleString()}
            </div>
            <div className="text-[10px] text-[#A3681F] mt-0.5">Deduplicated by phone</div>
          </div>

          <div className="p-4 rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#6E5545]">
              Today&apos;s New Seekers
            </div>
            <div className="text-2xl font-bold font-temple text-[#7B2D26] mt-1">
              {stats.todayCount.toLocaleString()}
            </div>
            <div className="text-[10px] text-[#6B8E5A] mt-0.5">Vedic ephemeris requests</div>
          </div>

          <div className="p-4 rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#6E5545]">
              Consent Standard
            </div>
            <div className="text-2xl font-bold font-temple text-[#2A4720] mt-1 flex items-center gap-1.5">
              <ShieldCheck className="h-6 w-6 text-[#6B8E5A]" />
              100% Opt-in
            </div>
            <div className="text-[10px] text-[#6E5545] mt-0.5">DPDPA 2023 &amp; GDPR compliant</div>
          </div>

          <div className="p-4 rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#6E5545]">
              Spam Policy
            </div>
            <div className="text-2xl font-bold font-temple text-[#7B2D26] mt-1">
              Zero Bots
            </div>
            <div className="text-[10px] text-[#6E5545] mt-0.5">Honeypot + velocity checked</div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-[#FFFDF9] p-4 rounded-xl border border-[#E8D8C3] flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6E5545]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by seeker name, phone, email, or birthplace..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#E8D8C3] bg-[#FBF3E7] text-xs text-[#3B2A1E] focus:outline-none focus:border-[#7B2D26]"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#6E5545] font-medium">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="py-2 px-3 rounded-lg border border-[#E8D8C3] bg-[#FBF3E7] text-xs text-[#3B2A1E] focus:outline-none focus:border-[#7B2D26]"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#6E5545] font-medium">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="py-2 px-3 rounded-lg border border-[#E8D8C3] bg-[#FBF3E7] text-xs text-[#3B2A1E] focus:outline-none focus:border-[#7B2D26]"
            />
          </div>

          {(search || startDate || endDate) && (
            <button
              onClick={() => {
                setSearch("");
                setStartDate("");
                setEndDate("");
                setPage(1);
              }}
              className="text-xs text-[#7B2D26] underline hover:text-[#C1662F] cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Leads Table */}
        <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8D8C3] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FBF3E7] border-b border-[#E8D8C3] text-[11px] font-bold uppercase tracking-wider text-[#6E5545]">
                <tr>
                  <th className="py-3 px-4">Seeker</th>
                  <th className="py-3 px-4">WhatsApp / Phone</th>
                  <th className="py-3 px-4">Birth Details</th>
                  <th className="py-3 px-4">Consent Record</th>
                  <th className="py-3 px-4">Captured</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8D8C3]">
                <DataStateTableRow
                  colSpan={6}
                  loading={loading}
                  error={fetchError}
                  isEmpty={leads.length === 0}
                  onRetry={fetchLeads}
                  loadingMessage="Loading verified Kundli leads from PostgreSQL database..."
                  emptyView={
                    <td colSpan={6} className="py-12 text-center text-xs text-[#6E5545]">
                      No Kundli leads matching your filters.
                    </td>
                  }
                >
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-[#FBF3E7]/40 transition-colors">
                      {/* Seeker Name & Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#7B2D26] flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-[#C1662F]" />
                          {lead.name}
                        </div>
                        <div className="text-[11px] text-[#6E5545] capitalize mt-0.5">
                          {lead.gender} &bull; {lead.email || "No email provided"}
                        </div>
                        {lead.userId && (
                          <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#6B8E5A]/15 text-[#2A4720]">
                            Registered Seeker
                          </span>
                        )}
                      </td>

                      {/* Phone & Direct WhatsApp Action */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-[#3B2A1E]">
                          {lead.phone}
                        </div>
                        <a
                          href={buildWhatsAppConsultationUrl(lead)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#6B8E5A] hover:text-[#2A4720] mt-1"
                        >
                          <Phone className="h-3 w-3" />
                          <span>Message on WhatsApp</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </td>

                      {/* Birth Details */}
                      <td className="py-3.5 px-4 text-[#6E5545]">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Calendar className="h-3 w-3 text-[#A3681F]" />
                          <span>{new Date(lead.dob).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                          <span className="text-[#C5A880]">&bull;</span>
                          <Clock className="h-3 w-3 text-[#A3681F]" />
                          <span>{lead.timeOfBirth}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-[#3B2A1E] font-medium mt-1 truncate max-w-[220px]">
                          <MapPin className="h-3 w-3 text-[#7B2D26] shrink-0" />
                          <span className="truncate">{lead.placeOfBirth}</span>
                        </div>
                      </td>

                      {/* Consent Record */}
                      <td className="py-3.5 px-4 text-[#6E5545]">
                        <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2A4720]">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#6B8E5A]" />
                          <span>Consent Given ({lead.consentVersion})</span>
                        </div>
                        <div className="text-[10px] text-[#6E5545] mt-0.5">
                          {new Date(lead.consentTimestamp).toLocaleString("en-IN", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </div>
                      </td>

                      {/* Created At */}
                      <td className="py-3.5 px-4 text-[11px] text-[#6E5545]">
                        <div>
                          {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-[10px] text-[#A3681F]">
                          {lead.sourcePage}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setDeletingLead(lead)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E0A899] text-[#7B2D26] hover:bg-[#FDF2F0] text-[11px] font-semibold transition-colors cursor-pointer"
                          title="Seeker Right to Erasure / Delete Lead"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </DataStateTableRow>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-[#E8D8C3] bg-[#FBF3E7] flex flex-wrap items-center justify-between gap-4 text-xs">
            <span className="text-[#6E5545]">
              Showing <strong>{leads.length}</strong> of <strong>{totalLeads}</strong> leads
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-[#E8D8C3] bg-white font-medium text-[#3B2A1E] hover:bg-[#FBF3E7] disabled:opacity-50 cursor-pointer"
              >
                Previous
              </button>
              <span className="text-[#6E5545] font-semibold">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-[#E8D8C3] bg-white font-medium text-[#3B2A1E] hover:bg-[#FBF3E7] disabled:opacity-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete on Request Modal (Right to Erasure) */}
      {deletingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#FFFDF9] border border-[#E8D8C3] p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-[#7B2D26]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDF2F0]">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-temple text-lg font-bold">Delete Lead (Right to Erasure)</h3>
                <p className="text-xs text-[#6E5545]">DPDPA 2023 &bull; GDPR Compliance</p>
              </div>
            </div>

            <div className="text-xs text-[#6E5545] space-y-2 bg-[#FBF3E7] p-3.5 rounded-xl border border-[#E8D8C3]">
              <p>
                You are permanently deleting all stored coordinates for seeker:{" "}
                <strong className="text-[#7B2D26]">{deletingLead.name}</strong> ({deletingLead.phone}).
              </p>
              <p className="text-[11px] text-[#A3681F]">
                This action is irreversible and will be logged in PostgreSQL AuditLog.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3B2A1E] mb-1">
                Reason for Deletion
              </label>
              <input
                type="text"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="e.g. Seeker requested erasure via WhatsApp"
                className="w-full rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] px-3 py-2 text-xs text-[#3B2A1E] focus:outline-none focus:border-[#7B2D26]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeletingLead(null);
                  setDeleteReason("");
                }}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl border border-[#E8D8C3] text-xs font-semibold text-[#6E5545] hover:bg-[#FBF3E7]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteOnRequest}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl bg-[#7B2D26] text-xs font-bold text-[#FBF3E7] hover:bg-[#64221C] disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Permanently Delete Lead"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
