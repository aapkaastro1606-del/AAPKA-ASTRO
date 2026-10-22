"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  PhoneCall,
  HelpCircle,
  LayoutTemplate,
  Tag,
  Users,
  Video,
  FileText,
  BarChart3,
  Bot,
  UserCheck,
  Activity,
  Image as ImageIcon,
  ShieldCheck,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import {
  getVisibleSidebarSections,
  SidebarItem,
} from "@/lib/auth/permissionPolicy";
import { ServerAuthResult } from "@/lib/auth/serverAuth";

export interface AdminSidebarProps {
  auth: {
    email?: string | null;
    isOwner: boolean;
    role?: string | null;
    permissions: string[];
  };
}

export default function AdminSidebar({ auth }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Derive visible sections strictly from the one permission policy
  const visibleItems = getVisibleSidebarSections(auth as ServerAuthResult);

  // Map icons to section IDs
  const getIcon = (id: string) => {
    switch (id) {
      case "bookings":
        return CreditCard;
      case "pricing":
        return Tag;
      case "leads":
        return Users;
      case "staff":
        return UserCheck;
      case "analytics":
        return BarChart3;
      case "blog":
        return FileText;
      case "reels":
        return Video;
      case "content":
        return LayoutTemplate;
      case "knowledge":
        return Bot;
      case "clients":
        return Users;
      case "earnings":
        return CreditCard;
      case "consultations":
        return PhoneCall;
      default:
        return LayoutTemplate;
    }
  };

  const isActive = (itemPath: string) => {
    if (itemPath === "/admin" && pathname === "/admin") return true;
    if (itemPath !== "/admin" && pathname.startsWith(itemPath)) return true;
    return false;
  };

  const renderNavLinks = () => (
    <div className="space-y-1">
      {/* Admin Hub Home Link (if Owner or has admin content/knowledge) */}
      {(auth.isOwner ||
        auth.permissions.includes("content") ||
        auth.permissions.includes("knowledge")) && (
        <Link
          href="/admin"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            pathname === "/admin"
              ? "bg-[#7B2D26] text-white shadow-xs"
              : "text-stone-700 hover:bg-stone-100"
          }`}
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              pathname === "/admin"
                ? "bg-white/20 text-white"
                : "bg-stone-200/60 text-stone-700"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="truncate">Admin Home</span>
        </Link>
      )}

      {/* Policy-derived section links */}
      {visibleItems.map((item) => {
        const Icon = getIcon(item.id);
        const active = isActive(item.path);

        return (
          <Link
            key={item.id}
            href={item.path}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              active
                ? "bg-[#7B2D26] text-white shadow-xs"
                : "text-stone-700 hover:bg-stone-100"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  active
                    ? "bg-white/20 text-white"
                    : "bg-stone-200/60 text-stone-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="truncate">{item.name}</span>
            </div>

            {item.ownerOnly && (
              <span
                className={`text-[9px] uppercase px-1.5 py-0.5 rounded-sm font-black tracking-wider shrink-0 ${
                  active ? "bg-white/20 text-amber-200" : "bg-amber-100 text-amber-800"
                }`}
              >
                Owner
              </span>
            )}
          </Link>
        );
      })}

      {/* Link to media library if content is granted */}
      {(auth.isOwner || auth.permissions.includes("content")) && (
        <Link
          href="/admin/media"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            pathname.startsWith("/admin/media")
              ? "bg-[#7B2D26] text-white shadow-xs"
              : "text-stone-700 hover:bg-stone-100"
          }`}
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              pathname.startsWith("/admin/media")
                ? "bg-white/20 text-white"
                : "bg-stone-200/60 text-stone-700"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </div>
          <span className="truncate">Media Library</span>
        </Link>
      )}

      {/* Link to audit trail if Owner */}
      {auth.isOwner && (
        <Link
          href="/admin/audit"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            pathname.startsWith("/admin/audit")
              ? "bg-[#7B2D26] text-white shadow-xs"
              : "text-stone-700 hover:bg-stone-100"
          }`}
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              pathname.startsWith("/admin/audit")
                ? "bg-white/20 text-white"
                : "bg-stone-200/60 text-stone-700"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
          </div>
          <span className="truncate">Audit Trail</span>
        </Link>
      )}
    </div>
  );

  return (
    <>
      {/* Top Banner on Mobile with Menu Toggle */}
      <div className="lg:hidden flex items-center justify-between bg-white border-b border-stone-200 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#7B2D26] text-white flex items-center justify-center font-bold text-sm">
            आ
          </div>
          <span className="font-serif font-bold text-[#7B2D26] text-sm">
            Aapka Astro Admin
          </span>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex">
          <div className="w-72 bg-white h-full p-4 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#7B2D26] text-white flex items-center justify-center font-bold text-sm">
                    आ
                  </div>
                  <span className="font-serif font-bold text-[#7B2D26] text-sm">
                    Aapka Astro
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 rounded-md text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {renderNavLinks()}
            </div>

            <div className="pt-4 border-t border-stone-100">
              <div className="text-[11px] text-stone-500 mb-2 truncate">
                {auth.email}
              </div>
              <Link
                href="/"
                className="flex items-center gap-2 text-xs font-semibold text-[#7B2D26] hover:underline"
              >
                <span>View Public Website</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="flex-1" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-stone-200/80 shrink-0 flex-col justify-between min-h-screen sticky top-0">
        <div>
          {/* Brand header */}
          <div className="p-4 border-b border-stone-100">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#7B2D26] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                आ
              </div>
              <div>
                <div className="font-serif font-bold text-[#7B2D26] text-sm leading-tight">
                  Aapka Astro
                </div>
                <div className="text-[10px] text-stone-400 font-medium">
                  {auth.isOwner ? "Owner Control Centre" : "Staff Portal"}
                </div>
              </div>
            </Link>
          </div>

          {/* Section links */}
          <div className="p-3 overflow-y-auto max-h-[calc(100vh-140px)]">
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-3 mb-2">
              Navigation
            </div>
            {renderNavLinks()}
          </div>
        </div>

        {/* Footer info & public link */}
        <div className="p-4 border-t border-stone-100 bg-stone-50/50">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-mono text-stone-600 truncate max-w-[140px]">
              {auth.email}
            </span>
            <span
              className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm ${
                auth.isOwner
                  ? "bg-[#7B2D26] text-white"
                  : "bg-stone-200 text-stone-700"
              }`}
            >
              {auth.isOwner ? "Owner" : auth.role || "Staff"}
            </span>
          </div>

          <Link
            href="/"
            className="flex items-center justify-between text-xs font-semibold text-[#7B2D26] hover:text-[#5c211c] pt-2 border-t border-stone-200/40"
          >
            <span>View Public Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>
    </>
  );
}
