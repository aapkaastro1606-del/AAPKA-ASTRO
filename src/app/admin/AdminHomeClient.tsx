"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ExternalLink,
  Activity,
  PhoneCall,
  HelpCircle,
  FileText,
  CreditCard,
  Tag,
  Users,
  Video,
  BarChart3,
  Bot,
  UserCheck,
  ArrowRight,
  Clock,
  Sparkles,
  LayoutTemplate,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Flame,
  Scale,
  Award,
} from "lucide-react";
import { AdminHelpPanel } from "@/components/admin/AdminHelpPanel";

export interface ActivityItem {
  id: string;
  action: string;
  actorEmail: string;
  targetId?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface AdminHomeClientProps {
  user: {
    email: string;
    name?: string | null;
    isOwner: boolean;
    role: string;
    permissions: string[];
  };
  pendingApprovalsCount: number;
  unansweredChatCount: number;
  recentActivity: ActivityItem[];
}

interface HubTile {
  id: string;
  title: string;
  helpText: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  count?: number;
  section: string;
  ownerOnly?: boolean;
  accent: "amber" | "green" | "maroon" | "blue" | "purple";
}

export default function AdminHomeClient({
  user,
  pendingApprovalsCount,
  unansweredChatCount,
  recentActivity,
}: AdminHomeClientProps) {
  // Master list of plain-language tiles
  const allTiles: HubTile[] = [
    {
      id: "bookings",
      title: "See payments waiting for approval",
      helpText: "Check direct UPI receipts in your bank, approve bookings, and send meeting links.",
      href: "/admin/bookings",
      icon: CreditCard,
      count: pendingApprovalsCount,
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} Waiting` : undefined,
      section: "bookings",
      ownerOnly: true,
      accent: "maroon",
    },
    {
      id: "content-contact",
      title: "Change phone number & social links",
      helpText: "Update WhatsApp consultation number, phone, public contact email, sanctum address, and social links.",
      href: "/admin/content?tab=contact",
      icon: PhoneCall,
      section: "content",
      accent: "green",
    },
    {
      id: "content-faqs",
      title: "Edit FAQs & Questions",
      helpText: "Add, edit, hide, or delete frequently asked questions that visitors read on the website and chatbot.",
      href: "/admin/content?tab=faqs",
      icon: HelpCircle,
      section: "content",
      accent: "amber",
    },
    {
      id: "content-hero",
      title: "Homepage text & announcements",
      helpText: "Change hero headlines, trust metrics, hero carousel photos, and service cards.",
      href: "/admin/content?tab=hero",
      icon: LayoutTemplate,
      section: "content",
      accent: "blue",
    },
    {
      id: "content-about",
      title: "About page & credentials gallery",
      helpText: "Edit journey story sections, certificates from Bhartiya Vidya Bhawan, and photo gallery.",
      href: "/admin/content?tab=about",
      icon: Award,
      section: "content",
      accent: "amber",
    },
    {
      id: "content-reviews",
      title: "Client reviews & testimonials",
      helpText: "Manage seeker appreciation reviews with required consent notes and publication switch.",
      href: "/admin/content?tab=reviews",
      icon: MessageSquare,
      section: "content",
      accent: "purple",
    },
    {
      id: "content-popups",
      title: "Promotional & festival popups",
      helpText: "Manage the 50%-off first consultation welcome popup and seasonal festival blessings in one place.",
      href: "/admin/content?tab=popups",
      icon: Flame,
      section: "content",
      accent: "maroon",
    },
    {
      id: "media-library",
      title: "Media Library & Photos",
      helpText: "Upload site photos directly to Cloudflare R2, manage alt text, and inspect in-use images.",
      href: "/admin/media",
      icon: ImageIcon,
      section: "content",
      accent: "blue",
    },
    {
      id: "content-legal",
      title: "Legal policies & compliance",
      helpText: "Owner-only editor for Terms, Privacy, Refund, and Disclaimer with lawyer review flags.",
      href: "/admin/content?tab=legal",
      icon: Scale,
      section: "legal",
      ownerOnly: true,
      accent: "blue",
    },
    {
      id: "blog",
      title: "Add or edit blog posts",
      helpText: "Write new Vedic astrology articles, update guides, and publish horoscope blogs.",
      href: "/dashboard/blog",
      icon: FileText,
      section: "blog",
      accent: "maroon",
    },
    {
      id: "reels",
      title: "Curate Instagram reels",
      helpText: "Pin or hide video reels from @aapkaastrologer to feature on the homepage.",
      href: "/dashboard/reels",
      icon: Video,
      section: "reels",
      accent: "purple",
    },
    {
      id: "pricing",
      title: "Adjust consultation fees & discounts",
      helpText: "Change consultation prices, first-time seeker 50% offers, and festive promotions.",
      href: "/admin/pricing",
      icon: Tag,
      section: "pricing",
      ownerOnly: true,
      accent: "green",
    },
    {
      id: "leads",
      title: "View seeker leads & Kundlis",
      helpText: "See visitors who generated free Kundlis, filter phone numbers, and download CSV.",
      href: "/admin/leads",
      icon: Users,
      section: "leads",
      ownerOnly: true,
      accent: "blue",
    },
    {
      id: "analytics",
      title: "Platform intelligence & traffic",
      helpText: "Check visitor traffic counts, top consulted topics, and booking conversion health.",
      href: "/admin/analytics",
      icon: BarChart3,
      section: "analytics",
      accent: "amber",
    },
    {
      id: "knowledge",
      title: "AI Chatbot Knowledge & Answers",
      helpText: "Teach the assistant new answers, review unanswered questions, and update rules.",
      href: "/admin/knowledge",
      icon: Bot,
      count: unansweredChatCount,
      badge: unansweredChatCount > 0 ? `${unansweredChatCount} New Qs` : undefined,
      section: "knowledge",
      ownerOnly: true,
      accent: "purple",
    },
    {
      id: "staff",
      title: "Staff & Team Permissions",
      helpText: "Grant or remove assistant desk and content editing permissions for helpers.",
      href: "/admin/staff",
      icon: UserCheck,
      section: "staff",
      ownerOnly: true,
      accent: "maroon",
    },
    {
      id: "audit",
      title: "Audit Trail & Activity Log",
      helpText: "Inspect all administrative changes, price updates, approvals, and security events.",
      href: "/admin/audit",
      icon: Activity,
      section: "audit",
      ownerOnly: true,
      accent: "blue",
    },
  ];

  // Filter tiles based on user role and permissions
  const visibleTiles = allTiles.filter((tile) => {
    if (user.isOwner) return true;
    if (tile.ownerOnly) return false;
    return user.permissions.includes(tile.section);
  });

  const getTileAccentStyles = (accent: HubTile["accent"]) => {
    switch (accent) {
      case "maroon":
        return {
          bg: "bg-[#7B2D26]/5 hover:bg-[#7B2D26]/10",
          border: "border-[#7B2D26]/20 hover:border-[#7B2D26]",
          iconBg: "bg-[#7B2D26]/15 text-[#7B2D26]",
          badgeBg: "bg-[#7B2D26] text-white",
        };
      case "green":
        return {
          bg: "bg-[#4F6D40]/5 hover:bg-[#4F6D40]/10",
          border: "border-[#4F6D40]/20 hover:border-[#4F6D40]",
          iconBg: "bg-[#4F6D40]/15 text-[#4F6D40]",
          badgeBg: "bg-[#4F6D40] text-white",
        };
      case "blue":
        return {
          bg: "bg-sky-500/5 hover:bg-sky-500/10",
          border: "border-sky-500/20 hover:border-sky-600",
          iconBg: "bg-sky-500/15 text-sky-700",
          badgeBg: "bg-sky-700 text-white",
        };
      case "purple":
        return {
          bg: "bg-purple-500/5 hover:bg-purple-500/10",
          border: "border-purple-500/20 hover:border-purple-600",
          iconBg: "bg-purple-500/15 text-purple-700",
          badgeBg: "bg-purple-700 text-white",
        };
      case "amber":
      default:
        return {
          bg: "bg-[#E8A33D]/10 hover:bg-[#E8A33D]/20",
          border: "border-[#E8A33D]/30 hover:border-[#E8A33D]",
          iconBg: "bg-[#E8A33D]/25 text-[#7B2D26]",
          badgeBg: "bg-[#E8A33D] text-[#3B2A1E]",
        };
    }
  };

  const formatActionName = (action: string) => {
    switch (action) {
      case "PAYMENT_CLAIMED":
        return "Payment Claimed by Seeker";
      case "BOOKING_APPROVED":
        return "Booking Approved & Verified";
      case "BOOKING_SCHEDULED":
        return "Meeting Link Scheduled";
      case "BOOKING_REJECTED":
        return "Booking Rejected / Unverified";
      case "CONTENT_STUDIO_UPDATED":
        return "Site Content Updated";
      case "PRICING_UPDATED":
        return "Consultation Pricing Adjusted";
      case "PAYMENT_SETTINGS_UPDATED":
        return "Payment Settings Updated";
      case "STAFF_PERMISSION_GRANTED":
        return "Staff Permission Granted";
      case "STAFF_PERMISSION_REVOKED":
        return "Staff Permission Revoked";
      default:
        return action.replace(/_/g, " ");
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return "Recent";
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] py-8 px-4 sm:px-6 lg:px-8 text-[#3B2A1E]">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header & Actions Bar */}
        <header className="border-b border-[#E8D8C3] pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7B2D26]/10 text-[#7B2D26] text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Admin Control Centre</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-temple text-[#7B2D26]">
              {user.isOwner ? "Namaste, Acharya Ji" : "Aapka Astro Staff Desk"}
            </h1>
            <p className="text-xs sm:text-sm text-[#6E5545] mt-1">
              Manage website text, phone numbers, consultation bookings, and prices safely from your browser.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Live Site Link */}
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] hover:bg-[#F3E7D3] text-xs font-bold text-[#7B2D26] transition-colors shadow-xs"
              title="Open public website in a new tab"
            >
              <span>View live site</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>

            {/* Owner Only: Diagnostics Link */}
            {user.isOwner && (
              <Link
                href="/admin/diagnostics"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] hover:bg-[#FBF3E7] text-xs font-bold text-[#6E5545] hover:text-[#7B2D26] transition-colors shadow-xs"
                title="System health, database latency, and outage simulation"
              >
                <Activity className="h-3.5 w-3.5 text-[#4F6D40]" />
                <span>Diagnostics</span>
              </Link>
            )}

            {/* User Badge */}
            <div className="px-3 py-1.5 rounded-xl bg-[#7B2D26] text-white text-[11px] font-bold">
              {user.isOwner ? "Owner (Full Control)" : "Staff Member"}
            </div>
          </div>
        </header>

        {/* Action Required Banners */}
        {user.isOwner && pendingApprovalsCount > 0 && (
          <div className="p-4 rounded-2xl bg-[#FBF3E7] border-2 border-[#E8A33D] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-pulse-subtle">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#E8A33D]/20 text-[#7B2D26]">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#7B2D26]">
                  {pendingApprovalsCount} Consultation Payment{pendingApprovalsCount > 1 ? "s" : ""} Waiting for Approval
                </h2>
                <p className="text-xs text-[#6E5545] mt-0.5">
                  Seekers have submitted UPI transaction references (UTRs). Please confirm credit in your bank and approve them.
                </p>
              </div>
            </div>
            <Link
              href="/admin/bookings"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#7B2D26] hover:bg-[#60231E] text-white text-xs font-bold transition-colors shrink-0 shadow-xs"
            >
              <span>Review Payments</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {/* How-To Help Guide for Non-Technical Client */}
        <AdminHelpPanel
          title="How to manage your website"
          steps={[
            {
              title: "Click on any tile below",
              description: "Each tile opens an easy screen where you can add, edit, or hide what visitors see.",
            },
            {
              title: "Website Content & Contact details",
              description: "Use 'Change phone number & social links' or 'Edit FAQs' to change texts without editing any code.",
            },
            {
              title: "Checking Payments",
              description: "When a seeker books, open 'See payments waiting for approval', check your bank statement, and click Approve.",
            },
            {
              title: "Safely test changes",
              description: "After saving changes on any screen, click 'View live site' at the top to see them live on www.aapkaastro.com.",
            },
          ]}
          tip="You never need to edit code. Everything can be added, edited, hidden, or deleted safely through these tiles."
          defaultExpanded={true}
        />

        {/* Large Plain-Language Tiles Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-temple text-[#7B2D26] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#E8A33D]" />
              <span>Available Management Sections</span>
            </h2>
            <span className="text-xs text-[#6E5545]">
              Showing {visibleTiles.length} section{visibleTiles.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleTiles.map((tile) => {
              const styles = getTileAccentStyles(tile.accent);
              const Icon = tile.icon;

              return (
                <Link
                  key={tile.id}
                  href={tile.href}
                  className={`group relative rounded-2xl border p-5 transition-all shadow-xs flex flex-col justify-between ${styles.bg} ${styles.border}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2.5 rounded-xl ${styles.iconBg} transition-transform group-hover:scale-105`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      {tile.badge && (
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${styles.badgeBg} shadow-xs`}>
                          {tile.badge}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[#3B2A1E] group-hover:text-[#7B2D26] transition-colors font-temple">
                        {tile.title}
                      </h3>
                      <p className="text-xs text-[#6E5545] mt-1 leading-relaxed">
                        {tile.helpText}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-2 border-t border-[#E8D8C3]/50 flex items-center justify-between text-xs font-bold text-[#7B2D26] group-hover:translate-x-0.5 transition-transform">
                    <span>Open Editor</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Recent Platform Activity */}
        <section className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E8D8C3] pb-3">
            <div className="flex items-center gap-2 text-sm font-bold font-temple text-[#7B2D26]">
              <Clock className="h-4 w-4 text-[#E8A33D]" />
              <span>Recent Activity &amp; Audit Trail</span>
            </div>
            <span className="text-[11px] text-[#6E5545]">Live automatic log</span>
          </div>

          {recentActivity.length === 0 ? (
            <p className="text-xs text-[#6E5545] italic py-2">
              No recent changes recorded yet. Activity will appear here when you approve payments or update content.
            </p>
          ) : (
            <div className="divide-y divide-[#E8D8C3]/60">
              {recentActivity.map((item) => (
                <div key={item.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#3B2A1E]">
                        {formatActionName(item.action)}
                      </span>
                      {item.targetId && (
                        <span className="px-1.5 py-0.2 rounded bg-[#FBF3E7] text-[10px] text-[#6E5545] border border-[#E8D8C3]">
                          {item.targetId}
                        </span>
                      )}
                    </div>
                    {item.notes && (
                      <p className="text-[11px] text-[#6E5545] line-clamp-1">{item.notes}</p>
                    )}
                    <span className="text-[10px] text-[#8C7A6B]">
                      By {item.actorEmail}
                    </span>
                  </div>
                  <span className="shrink-0 text-[11px] text-[#8C7A6B] font-mono">
                    {formatTimeAgo(item.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
