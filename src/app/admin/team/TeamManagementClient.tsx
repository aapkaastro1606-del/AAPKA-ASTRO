"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminHelpPanel } from "@/components/admin/AdminHelpPanel";
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Lock,
  RefreshCw,
  Info,
  Calendar,
  Layers,
  Eye,
  SlidersHorizontal,
  History,
  ArrowLeft,
  XCircle,
} from "lucide-react";
import {
  StaffSection,
  AccessLevel,
  StaffMemberRecord,
  StaffAuditLog,
  STAFF_SECTIONS,
} from "@/lib/auth/staffPermissions";

interface Props {
  currentUserEmail: string | null;
  currentUserId: string | null;
}

export default function TeamManagementClient({ currentUserEmail }: Props) {
  const [staffList, setStaffList] = useState<StaffMemberRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<StaffAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Invitation / Grant Form state
  const [targetEmail, setTargetEmail] = useState("");
  const [selectedSection, setSelectedSection] = useState<StaffSection>("blog");
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<AccessLevel>("MANAGE");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/team");
      const data = await res.json();
      if (data.success) {
        setStaffList(data.staff || []);
        setAuditLogs(data.auditLogs || []);
      } else {
        setMsg({ type: "error", text: data.message || "Failed to load team data." });
      }
    } catch (e: any) {
      setMsg({ type: "error", text: e.message || "Failed to connect to team management API." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmail.trim() || !targetEmail.includes("@")) {
      setMsg({ type: "error", text: "Please enter a valid employee email address." });
      return;
    }

    setSaving(true);
    setMsg(null);

    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: targetEmail.trim().toLowerCase(),
          section: selectedSection,
          accessLevel: selectedAccessLevel,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMsg({ type: "success", text: data.message });
        setTargetEmail("");
        if (data.staff) setStaffList(data.staff);
        if (data.auditLogs) setAuditLogs(data.auditLogs);
      } else {
        setMsg({ type: "error", text: data.message || "Failed to grant access." });
      }
    } catch (e: any) {
      setMsg({ type: "error", text: e.message || "Failed to grant access." });
    } finally {
      setSaving(false);
    }
  };

  const handleRevokeGrant = async (grantId: string, email: string, section: string) => {
    if (!confirm(`Are you sure you want to revoke '${section}' access for ${email}?`)) {
      return;
    }

    setRevokingId(grantId);
    setMsg(null);

    try {
      const res = await fetch(`/api/admin/team?grantId=${encodeURIComponent(grantId)}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        setMsg({ type: "success", text: data.message });
        if (data.staff) setStaffList(data.staff);
        if (data.auditLogs) setAuditLogs(data.auditLogs);
      } else {
        setMsg({ type: "error", text: data.message || "Failed to revoke access." });
      }
    } catch (e: any) {
      setMsg({ type: "error", text: e.message || "Failed to revoke access." });
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeAllStaff = async (emailToRevoke: string) => {
    if (!confirm(`Are you sure you want to completely revoke all access for ${emailToRevoke}?`)) {
      return;
    }

    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch(`/api/admin/team?email=${encodeURIComponent(emailToRevoke)}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        setMsg({ type: "success", text: data.message });
        if (data.staff) setStaffList(data.staff);
        if (data.auditLogs) setAuditLogs(data.auditLogs);
      } else {
        setMsg({ type: "error", text: data.message || "Failed to revoke staff." });
      }
    } catch (e: any) {
      setMsg({ type: "error", text: e.message || "Failed to revoke staff." });
    } finally {
      setLoading(false);
    }
  };

  const availableSections = STAFF_SECTIONS.filter((s) => s.id !== "staff");

  return (
    <div className="min-h-screen bg-[#FBF3E7] text-[#3B2A1E] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E8D8C3] pb-6">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7B2D26] hover:underline mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Admin Home</span>
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="font-temple text-2xl sm:text-3xl font-bold text-[#7B2D26]">
                Team Access Management
              </h1>
              <span className="rounded-full bg-[#7B2D26] text-white px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
                Owner Only
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#6E5545] mt-1 max-w-2xl">
              Invite staff members by email, configure granular desk permissions with VIEW vs MANAGE access levels, and audit all security grants.
            </p>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#C1662F]/30 bg-[#FFFDF9] px-3.5 py-2 text-xs font-bold text-[#7B2D26] hover:bg-[#F3E5D0] transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* How-To Help Panel */}
        <AdminHelpPanel
          title="How to manage team access"
          steps={[
            {
              title: "What is this for?",
              description: "This allows you to give assistants access to individual sections like blog writing or reels without giving full site access.",
            },
            {
              title: "Access Levels",
              description: "VIEW permits seeing data; MANAGE permits saving changes, creating posts, or editing content.",
            },
          ]}
          tip="All permissions are checked server-side fail-closed. Sensitive owner sections (bookings, diagnostics, leads) remain strictly protected."
          defaultExpanded={false}
        />

        {/* Feedback message banner */}
        {msg && (
          <div
            className={`p-4 rounded-xl flex items-center justify-between gap-3 text-xs sm:text-sm border shadow-sm ${
              msg.type === "success"
                ? "bg-[#6B8E5A]/10 border-[#6B8E5A]/30 text-[#2D5A1E]"
                : "bg-[#7B2D26]/10 border-[#7B2D26]/30 text-[#7B2D26]"
            }`}
          >
            <div className="flex items-center gap-2">
              {msg.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-[#6B8E5A]" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0 text-[#7B2D26]" />
              )}
              <span>{msg.text}</span>
            </div>
            <button
              onClick={() => setMsg(null)}
              className="text-xs font-bold underline opacity-70 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Section 1: Invite Staff Member / Grant Access Form */}
        <div className="bg-[#FFFDF9] rounded-2xl border-2 border-[#E8D8C3] p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="h-9 w-9 rounded-xl bg-[#7B2D26]/10 text-[#7B2D26] flex items-center justify-center">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-temple text-lg font-bold text-[#7B2D26]">
                Invite Staff Member &amp; Grant Section Access
              </h2>
              <p className="text-xs text-[#6E5545]">
                Invited staff sign up or log in via the existing Clerk authentication flow. Their pre-granted desk permissions activate immediately upon first login.
              </p>
            </div>
          </div>

          <form onSubmit={handleGrantAccess} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              {/* Email Input */}
              <div className="md:col-span-5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3B2A1E] mb-1.5">
                  Employee Email Address
                </label>
                <input
                  type="email"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  placeholder="e.g. editor@aapkaastro.com"
                  required
                  className="w-full rounded-xl border border-[#C1662F]/30 bg-white px-3.5 py-2.5 text-xs text-[#3B2A1E] placeholder:text-[#9B8272] focus:border-[#7B2D26] focus:ring-1 focus:ring-[#7B2D26] outline-none"
                />
              </div>

              {/* Section Select */}
              <div className="md:col-span-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3B2A1E] mb-1.5">
                  Target Section / Desk
                </label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value as StaffSection)}
                  className="w-full rounded-xl border border-[#C1662F]/30 bg-white px-3.5 py-2.5 text-xs text-[#3B2A1E] focus:border-[#7B2D26] focus:ring-1 focus:ring-[#7B2D26] outline-none"
                >
                  {availableSections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.name} ({sec.path})
                    </option>
                  ))}
                </select>
              </div>

              {/* Access Level Picker */}
              <div className="md:col-span-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3B2A1E] mb-1.5">
                  Access Level
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAccessLevel("VIEW")}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold border transition-all ${
                      selectedAccessLevel === "VIEW"
                        ? "bg-[#6B8E5A] border-[#6B8E5A] text-white shadow-sm"
                        : "bg-white border-[#E8D8C3] text-[#6E5545] hover:border-[#6B8E5A]"
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>VIEW</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedAccessLevel("MANAGE")}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold border transition-all ${
                      selectedAccessLevel === "MANAGE"
                        ? "bg-[#7B2D26] border-[#7B2D26] text-white shadow-sm"
                        : "bg-white border-[#E8D8C3] text-[#6E5545] hover:border-[#7B2D26]"
                    }`}
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    <span>MANAGE</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-[11px] text-[#6E5545]">
                <Info className="h-3.5 w-3.5 text-[#C1662F] shrink-0" />
                <span>
                  <strong>VIEW</strong>: Read-only access to section records &amp; reports.{" "}
                  <strong>MANAGE</strong>: Full write, draft, edit, and publish authority.
                </span>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#7B2D26] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#5C1F1A] transition-all disabled:opacity-50"
              >
                <UserPlus className="h-4 w-4" />
                <span>{saving ? "Granting Access..." : "Grant Section Access"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: Current Staff & Granted Sections/Access Levels */}
        <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8D8C3] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-[#E8A33D]/20 text-[#7B2D26] flex items-center justify-center">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-temple text-base font-bold text-[#7B2D26]">
                  Current Staff &amp; Granted Access Levels
                </h2>
                <p className="text-xs text-[#6E5545]">
                  Active team members, authorized sections, and individual revoke controls.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#7B2D26]">
              {staffList.length} Active Account{staffList.length === 1 ? "" : "s"}
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-[#6E5545]">
              <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-[#7B2D26]" />
              Loading team permissions...
            </div>
          ) : staffList.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#6E5545] border border-dashed border-[#E8D8C3] rounded-xl">
              No staff members have been granted access yet. Use the invitation form above to grant access to an employee.
            </div>
          ) : (
            <div className="space-y-3">
              {staffList.map((member) => (
                <div
                  key={member.email}
                  className="rounded-xl border border-[#E8D8C3] bg-[#FCF8F2] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-[#C1662F]/40 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-[#3B2A1E]">
                        {member.email}
                      </span>
                      {member.isOwner ? (
                        <span className="inline-flex items-center gap-1 rounded bg-[#7B2D26] px-2 py-0.5 text-[10px] font-bold uppercase text-white tracking-wider">
                          <ShieldCheck className="h-3 w-3" /> Owner
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-[#6B8E5A]/20 text-[#2D5A1E] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                          Staff
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {member.isOwner ? (
                        <span className="text-xs italic text-[#7B2D26] font-medium">
                          Unrestricted bypass across all platform desks &amp; settings
                        </span>
                      ) : member.grants && member.grants.length > 0 ? (
                        member.grants.map((grant) => (
                          <span
                            key={grant.id || grant.section}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8D8C3] bg-white px-2.5 py-1 text-xs shadow-2xs"
                          >
                            <span className="font-bold text-[#3B2A1E]">{grant.section}</span>
                            <span
                              className={`rounded px-1.5 py-0.2 text-[9px] font-extrabold uppercase ${
                                grant.accessLevel === "MANAGE"
                                  ? "bg-[#E8A33D]/20 text-[#7B2D26] border border-[#E8A33D]/40"
                                  : "bg-[#6B8E5A]/20 text-[#2D5A1E] border border-[#6B8E5A]/30"
                              }`}
                            >
                              {grant.accessLevel}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleRevokeGrant(grant.id, member.email, grant.section)
                              }
                              disabled={revokingId === grant.id}
                              title={`Revoke ${grant.section}`}
                              className="text-[#9B8272] hover:text-[#7B2D26] transition-colors ml-0.5"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        ))
                      ) : member.sections && member.sections.length > 0 ? (
                        member.sections.map((sec) => (
                          <span
                            key={sec}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#E8D8C3] bg-white px-2 py-0.5 text-xs font-bold text-[#3B2A1E]"
                          >
                            <span>{sec}</span>
                            <span className="text-[9px] text-[#7B2D26] font-normal">(MANAGE)</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-[#9B8272] italic">No active grants</span>
                      )}
                    </div>
                  </div>

                  {!member.isOwner && (
                    <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                      <button
                        onClick={() => {
                          setTargetEmail(member.email);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="rounded-lg border border-[#C1662F]/30 bg-white px-3 py-1.5 text-xs font-bold text-[#7B2D26] hover:bg-[#F3E5D0] transition-colors"
                      >
                        + Grant Section
                      </button>
                      <button
                        onClick={() => handleRevokeAllStaff(member.email)}
                        className="rounded-lg border border-[#7B2D26]/20 bg-white px-3 py-1.5 text-xs font-bold text-[#7B2D26] hover:bg-[#7B2D26]/10 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Revoke All</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Simple Audit List (who granted what, to whom, and when) */}
        <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8D8C3] p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="h-8 w-8 rounded-lg bg-[#7B2D26]/10 text-[#7B2D26] flex items-center justify-center">
              <History className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-temple text-base font-bold text-[#7B2D26]">
                Security Audit Log &amp; Access History
              </h2>
              <p className="text-xs text-[#6E5545]">
                Pulling directly from <code>grantedByUserId</code>, <code>grantedAt</code>, and <code>revokedAt</code> records.
              </p>
            </div>
          </div>

          {auditLogs.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#6E5545] border border-dashed border-[#E8D8C3] rounded-xl">
              No grant or revocation logs recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E8D8C3] text-[11px] font-bold uppercase tracking-wider text-[#6E5545]">
                    <th className="py-2.5 px-3">Timestamp (When)</th>
                    <th className="py-2.5 px-3">Event</th>
                    <th className="py-2.5 px-3">To Whom</th>
                    <th className="py-2.5 px-3">What (Section &amp; Level)</th>
                    <th className="py-2.5 px-3">Who Granted</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3E5D0]">
                  {auditLogs.map((log) => {
                    const formattedDate = new Date(log.timestamp).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    });

                    return (
                      <tr key={log.id} className="hover:bg-[#FCF8F2] transition-colors">
                        <td className="py-3 px-3 font-mono text-[11px] text-[#6E5545] whitespace-nowrap">
                          {formattedDate}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {log.action === "GRANTED" ? (
                            <span className="inline-flex items-center gap-1 rounded bg-[#6B8E5A]/20 px-2 py-0.5 text-[10px] font-bold text-[#2D5A1E]">
                              <CheckCircle2 className="h-3 w-3" /> GRANTED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded bg-[#7B2D26]/20 px-2 py-0.5 text-[10px] font-bold text-[#7B2D26]">
                              <XCircle className="h-3 w-3" /> REVOKED
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono font-medium text-[#3B2A1E]">
                          {log.targetEmail}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#3B2A1E]">{log.section}</span>
                            <span
                              className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                                log.accessLevel === "MANAGE"
                                  ? "bg-[#E8A33D]/20 text-[#7B2D26]"
                                  : "bg-[#6B8E5A]/20 text-[#2D5A1E]"
                              }`}
                            >
                              {log.accessLevel}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-[#6E5545]">
                          {log.grantedByUserId || log.grantedBy || "Owner"}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {log.revokedAt ? (
                            <span className="text-[10px] text-[#7B2D26] font-medium">
                              Revoked at{" "}
                              {new Date(log.revokedAt).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#2D5A1E] font-medium">
                              Active
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
