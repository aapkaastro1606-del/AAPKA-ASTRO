"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Lock,
  RefreshCw,
  Info,
  Activity,
} from "lucide-react";
import {
  STAFF_SECTIONS,
  StaffSection,
  StaffMemberRecord,
} from "@/lib/auth/staffPermissions";

export default function StaffManagementClient() {
  const [staffList, setStaffList] = useState<StaffMemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form state
  const [targetEmail, setTargetEmail] = useState("");
  const [selectedSections, setSelectedSections] = useState<StaffSection[]>(["blog"]);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/staff");
      const data = await res.json();
      if (data.success && data.staff) {
        setStaffList(data.staff);
      } else {
        setMsg({ type: "error", text: data.message || "Failed to load staff list." });
      }
    } catch (e: any) {
      setMsg({ type: "error", text: e.message || "Failed to connect to staff API." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleToggleSection = (sectionId: StaffSection) => {
    if (sectionId === "staff") return; // Staff management cannot be delegated to non-owners
    setSelectedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((s) => s !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleSavePermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmail.trim()) {
      setMsg({ type: "error", text: "Please enter a valid employee email address." });
      return;
    }

    setSaving(true);
    setMsg(null);

    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: targetEmail.trim().toLowerCase(),
          sections: selectedSections,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: "success", text: data.message });
        setTargetEmail("");
        setSelectedSections(["blog"]);
        if (data.staff) setStaffList(data.staff);
      } else {
        setMsg({ type: "error", text: data.message || "Failed to update permissions." });
      }
    } catch (e: any) {
      setMsg({ type: "error", text: e.message || "Failed to update permissions." });
    } finally {
      setSaving(false);
    }
  };

  const handleRevokeStaff = async (emailToRevoke: string) => {
    if (
      !confirm(
        `Are you sure you want to revoke all site permissions for ${emailToRevoke}?`
      )
    ) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/staff?email=${encodeURIComponent(emailToRevoke)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: "success", text: data.message });
        if (data.staff) setStaffList(data.staff);
      } else {
        setMsg({ type: "error", text: data.message || "Failed to revoke permissions." });
      }
    } catch (e: any) {
      setMsg({ type: "error", text: e.message || "Error revoking permissions." });
    } finally {
      setSaving(false);
    }
  };

  const handleEditExisting = (member: StaffMemberRecord) => {
    if (member.isOwner) return;
    setTargetEmail(member.email);
    setSelectedSections(member.sections.filter((s) => s !== "staff"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-[#FBF3E7] text-[#3B2A1E] min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#6E5545] mb-1">
              <Link href="/dashboard" className="hover:underline">
                Dashboard
              </Link>
              <span>/</span>
              <Link href="/admin" className="hover:underline">
                Admin
              </Link>
              <span>/</span>
              <span className="font-bold text-[#7B2D26]">Staff Permissions</span>
            </div>
            <h1 className="font-temple text-2xl sm:text-3xl font-bold text-[#7B2D26] flex items-center gap-2.5">
              <ShieldCheck className="h-7 w-7 text-[#7B2D26]" />
              <span>Per-Section Staff Permissions</span>
            </h1>
            <p className="text-xs text-[#6E5545] mt-1">
              Grant specific employees access to only individual sections (e.g., Blog or Instagram Reels curation) without giving full site access.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/diagnostics"
              className="rounded-xl border border-[#7B2D26] bg-[#7B2D26] px-3.5 py-2 text-xs font-bold text-[#FFFDF9] hover:bg-[#64221C] transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Activity className="h-3.5 w-3.5 text-[#E8A33D]" />
              <span>System Diagnostics</span>
            </Link>
            <button
              type="button"
              onClick={fetchStaff}
              disabled={loading}
              className="rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] px-3.5 py-2 text-xs font-bold text-[#6E5545] hover:text-[#3B2A1E] hover:border-[#7B2D26] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Cost & Isolation Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-[#6B8E5A]/40 bg-[#F4F9F2] p-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-[#2A4720] shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-[#2A4720] block">Zero Extra Cost Architecture</span>
              <span className="text-[#4F6D40]">
                Stored in your site&apos;s free Neon/PostgreSQL database (<code>staff_permissions</code> table). Does not require paid Clerk Organizations plans or add-ons.
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-[#C1662F] shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-[#7B2D26] block">Strict Per-Site Isolation</span>
              <span className="text-[#6E5545]">
                Staff granted access here operate strictly within Aapka Astro. They receive zero access to your other platforms unless explicitly configured there.
              </span>
            </div>
          </div>
        </div>

        {/* Status Message Alert */}
        {msg && (
          <div
            className={`rounded-2xl p-4 text-xs flex items-center justify-between border ${
              msg.type === "success"
                ? "bg-[#F4F9F2] border-[#6B8E5A] text-[#2A4720]"
                : "bg-[#FFF1F0] border-[#E57373] text-[#7B2D26]"
            }`}
          >
            <div className="flex items-center gap-2">
              {msg.type === "success" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span>{msg.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setMsg(null)}
              className="text-xs font-bold underline ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Grant / Update Form */}
        <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-[#E8D8C3] pb-4">
            <h2 className="font-temple text-lg font-bold text-[#7B2D26] flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-[#C1662F]" />
              <span>Grant or Edit Staff Member Access</span>
            </h2>
            <p className="text-xs text-[#6E5545] mt-0.5">
              Enter the employee&apos;s email and check the exact sections they are allowed to operate.
            </p>
          </div>

          <form onSubmit={handleSavePermissions} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-[#3B2A1E] mb-1.5 uppercase tracking-wider">
                Employee Email Address
              </label>
              <input
                type="email"
                required
                placeholder="e.g. editor@aapkaastro.com"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                className="w-full sm:max-w-md rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] px-4 py-2.5 text-xs text-[#3B2A1E] focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3B2A1E] mb-2 uppercase tracking-wider">
                Select Authorized Sections
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {STAFF_SECTIONS.filter((s) => !s.ownerOnly).map((section) => {
                  const isChecked = selectedSections.includes(section.id);
                  return (
                    <label
                      key={section.id}
                      onClick={() => handleToggleSection(section.id)}
                      className={`cursor-pointer rounded-2xl border p-4 transition-all flex items-start gap-3 ${
                        isChecked
                          ? "border-[#7B2D26] bg-[#7B2D26]/5 shadow-xs"
                          : "border-[#E8D8C3] bg-[#FFFDF9] hover:bg-[#FBF3E7]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 h-4 w-4 rounded text-[#7B2D26] focus:ring-[#7B2D26]"
                      />
                      <div className="space-y-0.5">
                        <div className="font-bold text-xs text-[#3B2A1E] flex items-center gap-1.5">
                          <span>{section.name}</span>
                        </div>
                        <p className="text-[11px] text-[#6E5545]">{section.description}</p>
                        <code className="text-[10px] text-[#7B2D26] font-mono block mt-1">
                          {section.path}
                        </code>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#7B2D26] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#63231E] transition-all shadow-sm disabled:opacity-60 flex items-center gap-2"
              >
                {saving && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>Save Staff Permissions</span>
              </button>
              {targetEmail && (
                <button
                  type="button"
                  onClick={() => {
                    setTargetEmail("");
                    setSelectedSections(["blog"]);
                  }}
                  className="rounded-xl border border-[#E8D8C3] px-4 py-2.5 text-xs font-semibold text-[#6E5545] hover:bg-[#FBF3E7]"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Current Active Staff Table */}
        <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8D8C3] pb-4">
            <div>
              <h2 className="font-temple text-lg font-bold text-[#7B2D26]">
                Configured Staff &amp; Roles ({staffList.length})
              </h2>
              <p className="text-xs text-[#6E5545] mt-0.5">
                Overview of all accounts authorized to access administrative desk tools.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8D8C3] text-[#A89080] uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">User / Email</th>
                  <th className="py-3 px-4">Role Tier</th>
                  <th className="py-3 px-4">Granted Sections</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8D8C3]">
                {staffList.map((member) => (
                  <tr key={member.email} className="hover:bg-[#FBF3E7]/50 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-[#3B2A1E]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{member.email}</span>
                        {member.isOwner && (
                          <span className="rounded-full bg-[#7B2D26] px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                            Site Owner
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {member.isOwner ? (
                        <span className="font-bold text-[#7B2D26]">Platform Administrator</span>
                      ) : (
                        <span className="font-medium text-[#C1662F]">Scoped Staff Operator</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {member.isOwner ? (
                        <span className="rounded-md bg-[#6B8E5A]/15 text-[#2A4720] border border-[#6B8E5A]/40 px-2 py-0.5 text-[10px] font-bold">
                          Unrestricted (All Sections)
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {member.sections.map((sec) => (
                            <span
                              key={sec}
                              className="rounded-md bg-[#FFFDF9] border border-[#E8D8C3] px-2 py-0.5 text-[10px] font-medium text-[#7B2D26]"
                            >
                              {sec}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {member.isOwner ? (
                        <span className="text-[11px] text-[#A89080] italic">Protected</span>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditExisting(member)}
                            className="rounded-lg border border-[#E8D8C3] px-2.5 py-1 text-[11px] font-semibold text-[#7B2D26] hover:bg-[#FBF3E7]"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRevokeStaff(member.email)}
                            className="rounded-lg border border-red-200 px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Revoke</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
