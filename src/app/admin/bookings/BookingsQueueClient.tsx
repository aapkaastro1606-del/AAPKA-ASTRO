"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminHelpPanel } from "@/components/admin/AdminHelpPanel";
import { useSession } from "@/components/auth/ClerkAuthWrapper";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Search,
  RefreshCw,
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  Video,
  FileText,
  DollarSign,
  Send,
  ExternalLink,
  MessageCircle,
  Settings,
  AlertCircle,
  RotateCcw,
  Check,
  Eye,
} from "lucide-react";
import { DiyaIcon } from "@/components/ui/DiyaIcon";
import { DataStateView, parseFetchError, DataStateError } from "@/components/admin/DataStateView";

interface BookingItem {
  id: string;
  bookingId: string;
  clientId: string;
  userName: string;
  userPhone: string;
  userEmail?: string | null;
  productType: string;
  format: string;
  concern?: string | null;
  amount: number;
  isFirstTimeAstro: boolean;
  bookingStatus: string;
  paymentStatus: string;
  bankCreditConfirmed: boolean;
  utr?: string | null;
  preferredDay?: string | null;
  preferredTimeWindow?: string | null;
  scheduledSlot?: string | null;
  meetingLink?: string | null;
  approvedAt?: string | null;
  approvedBy?: string | null;
  rejectionReason?: string | null;
  refundedAt?: string | null;
  refundNotes?: string | null;
  intakeDetails?: any;
  emailStatus?: string | null;
  emailError?: string | null;
  createdAt: string;
  expiresAt?: string | null;
}

interface PaymentSettingsData {
  upiId: string;
  payeeName: string;
  qrImageUrl?: string | null;
  whatsappNumber: string;
  whatsappConfirmed: boolean;
  unpaidExpiryDays: number;
}

export default function BookingsQueueClient({ userEmail }: { userEmail: string }) {
  const { session } = useSession();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modals state
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [bankConfirmedCheckbox, setBankConfirmedCheckbox] = useState(false);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledSlotInput, setScheduledSlotInput] = useState("");
  const [meetingLinkInput, setMeetingLinkInput] = useState("WhatsApp call");

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");

  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundNotesInput, setRefundNotesInput] = useState("");

  // Payment Settings Drawer
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettingsData>({
    upiId: "9311215564@okbizaxis",
    payeeName: "Aapka Astro",
    qrImageUrl: "",
    whatsappNumber: "+91 93112 15564",
    whatsappConfirmed: false,
    unpaidExpiryDays: 2,
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [fetchError, setFetchError] = useState<DataStateError | null>(null);

  const getAuthHeaders = (): Record<string, string> => {
    return { "Content-Type": "application/json" };
  };

  const fetchBookings = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/admin/bookings?status=${activeTab}&search=${encodeURIComponent(search)}`, { headers });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const err = parseFetchError(res, errData);
        setFetchError(err);
        setBookings([]);
        setFeedback({ type: "error", text: err.message || "Failed to load bookings queue." });
        return;
      }

      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings || []);
        setCounts(data.counts || {});
        setFetchError(null);
      } else {
        const err = parseFetchError(res, data);
        setFetchError(err);
        setBookings([]);
        setFeedback({ type: "error", text: data.message || "Failed to load bookings queue." });
      }
    } catch (e: any) {
      setFetchError({ status: 500, message: "Could not load. Retry." });
      setBookings([]);
      setFeedback({ type: "error", text: e.message || "Failed to reach bookings API." });
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentSettings = async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/admin/payment-settings", { headers });
      if (!res.ok) {
        setFeedback({ type: "error", text: "Could not load payment routing settings. Retry." });
        return;
      }
      const data = await res.json();
      if (data.success && data.settings) {
        setPaymentSettings(data.settings);
      }
    } catch (e: any) {
      setFeedback({ type: "error", text: "Could not load payment routing settings. Retry." });
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchPaymentSettings();
  }, [activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings();
  };

  // Action: Approve Payment
  const handleApprove = async () => {
    if (!selectedBooking) return;
    if (!bankConfirmedCheckbox) {
      alert('You must confirm: "I have confirmed this amount is credited in my bank or UPI app and the reference matches."');
      return;
    }

    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          action: "approve",
          bookingId: selectedBooking.bookingId,
          bankCreditConfirmed: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: "success",
          text: `Booking ${selectedBooking.bookingId} approved successfully! ${data.firstTimeConflictWarning || ""}`,
        });
        setShowApproveModal(false);
        setBankConfirmedCheckbox(false);
        fetchBookings();
      } else {
        setFeedback({ type: "error", text: data.message || "Approval failed." });
      }
    } catch (e: any) {
      setFeedback({ type: "error", text: e.message || "Approval request failed." });
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Schedule Consultation
  const handleSchedule = async () => {
    if (!selectedBooking) return;
    if (!scheduledSlotInput.trim() || !meetingLinkInput.trim()) {
      alert("Please enter both the scheduled time slot and meeting link.");
      return;
    }

    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          action: "schedule",
          bookingId: selectedBooking.bookingId,
          scheduledSlot: scheduledSlotInput.trim(),
          meetingLink: meetingLinkInput.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: "success",
          text: `Booking ${selectedBooking.bookingId} scheduled. Confirmation email sent to seeker.`,
        });
        setShowScheduleModal(false);
        fetchBookings();
      } else {
        setFeedback({ type: "error", text: data.message || "Scheduling failed." });
      }
    } catch (e: any) {
      setFeedback({ type: "error", text: e.message || "Scheduling request failed." });
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Owner Cancel
  const handleOwnerCancel = async (booking: BookingItem) => {
    const reason = prompt(`Cancel booking ${booking.bookingId}? Enter reason:`, "Cancelled by Owner");
    if (reason === null) return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          action: "cancel",
          bookingId: booking.bookingId,
          reason: reason.trim() || "Cancelled by Owner",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", text: `Booking ${booking.bookingId} cancelled.` });
        fetchBookings();
      } else {
        setFeedback({ type: "error", text: data.message || "Failed to cancel booking." });
      }
    } catch (e: any) {
      setFeedback({ type: "error", text: e.message || "Cancel request failed." });
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Complete
  const handleComplete = async (booking: BookingItem) => {
    if (!confirm(`Mark consultation ${booking.bookingId} as COMPLETED?`)) return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          action: "complete",
          bookingId: booking.bookingId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", text: `Consultation ${booking.bookingId} marked as COMPLETED.` });
        fetchBookings();
      } else {
        setFeedback({ type: "error", text: data.message || "Failed to mark completed." });
      }
    } catch (e: any) {
      setFeedback({ type: "error", text: e.message || "Complete request failed." });
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Reject
  const handleReject = async () => {
    if (!selectedBooking) return;
    if (!rejectionReasonInput.trim()) {
      alert("A rejection reason is required.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          action: "reject",
          bookingId: selectedBooking.bookingId,
          reason: rejectionReasonInput.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", text: `Booking ${selectedBooking.bookingId} rejected.` });
        setShowRejectModal(false);
        setRejectionReasonInput("");
        fetchBookings();
      } else {
        setFeedback({ type: "error", text: data.message || "Rejection failed." });
      }
    } catch (e: any) {
      setFeedback({ type: "error", text: e.message || "Rejection request failed." });
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Refund
  const handleRefund = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          action: "refund",
          bookingId: selectedBooking.bookingId,
          notes: refundNotesInput.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", text: `Booking ${selectedBooking.bookingId} marked as refunded.` });
        setShowRefundModal(false);
        setRefundNotesInput("");
        fetchBookings();
      } else {
        setFeedback({ type: "error", text: data.message || "Refund failed." });
      }
    } catch (e: any) {
      setFeedback({ type: "error", text: e.message || "Refund request failed." });
    } finally {
      setActionLoading(false);
    }
  };

  // Save Payment Settings
  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/payment-settings", {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify(paymentSettings),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: "success",
          text: "Payment settings updated and audit-logged. Security alert dispatched to Owner email.",
        });
        setShowSettingsModal(false);
      } else {
        setFeedback({ type: "error", text: data.message || "Failed to update payment settings." });
      }
    } catch (e: any) {
      setFeedback({ type: "error", text: e.message || "Save payment settings failed." });
    } finally {
      setSettingsSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAYMENT_CLAIMED":
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-purple-100 text-purple-800 border border-purple-300 animate-pulse">Payment Claimed (Verify Now)</span>;
      case "PENDING_PAYMENT":
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-300">Pending Payment</span>;
      case "CONFIRMED":
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">Payment Confirmed</span>;
      case "SCHEDULED":
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-300">Consultation Scheduled</span>;
      case "COMPLETED":
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-stone-100 text-stone-700 border border-stone-300">Completed</span>;
      case "REJECTED":
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-300">Rejected</span>;
      case "CANCELLED":
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-300">Cancelled / Refunded</span>;
      case "EXPIRED":
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-gray-100 text-gray-500 border border-gray-300">Expired</span>;
      default:
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-stone-100 text-stone-700">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF3E7] text-[#3B2A1E] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8D8C3] pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/admin" className="text-xs font-bold text-[#7B2D26] hover:underline flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" />
                Admin Home
              </Link>
              <span className="text-[#6E5545]">/</span>
              <span className="text-xs font-bold text-[#6E5545]">Owner Verification Queue</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#7B2D26] text-[#E8A33D] flex items-center justify-center shadow-sm">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-temple text-2xl sm:text-3xl font-black text-[#7B2D26]">
                  UPI Verification &amp; Booking Queue
                </h1>
                <p className="text-xs text-[#6E5545]">
                  Reconcile bank credits, prevent duplicate UTRs, schedule consultation links, and audit all actions.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#7B2D26] bg-[#FFFDF9] border border-[#E8D8C3] rounded-xl hover:bg-[#FAF5EE] transition-all shadow-xs"
            >
              <Settings className="h-4 w-4 text-[#C1662F]" />
              <span>Payment Routing Settings</span>
            </button>

            <button
              type="button"
              onClick={fetchBookings}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#FFFDF9] bg-[#7B2D26] rounded-xl hover:bg-[#64221C] transition-all shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Queue</span>
            </button>
          </div>
        </div>

        {/* How-To Help Panel for Non-Technical Owner */}
        <AdminHelpPanel
          title="How to verify payments and schedule consultations"
          steps={[
            {
              title: "Step 1: Verify payment in your bank",
              description: "Look at the 12-digit UTR submitted by the seeker. Open your UPI or Axis Bank app to confirm that the funds were received in your account.",
            },
            {
              title: "Step 2: Click 'Approve'",
              description: "Once funds are confirmed in your bank, click Approve. This updates the booking to CONFIRMED and emails the seeker their receipt.",
            },
            {
              title: "Step 3: Schedule Slot & Meeting Link",
              description: "Click 'Schedule Slot' to set the consultation time and paste the Google Meet or WhatsApp link. An email is dispatched to the seeker automatically.",
            },
            {
              title: "If payment did not arrive",
              description: "Click 'Reject' with an explanation (e.g. 'UTR not found in bank statement'). The seeker is notified to contact WhatsApp support.",
            },
          ]}
          tip="Your bank or UPI statement is the sole definitive proof of payment. Only approve when funds physically appear in your bank account."
          defaultExpanded={true}
        />

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 text-xs sm:text-sm font-medium ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                : "bg-rose-50 border-rose-300 text-rose-900"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">{feedback.text}</div>
            <button type="button" onClick={() => setFeedback(null)} className="text-stone-400 hover:text-stone-700">
              &times;
            </button>
          </div>
        )}

        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E8D8C3] pb-3">
          {[
            { id: "ALL", label: "All Bookings" },
            { id: "PAYMENT_CLAIMED", label: "Needs Verification", alert: true },
            { id: "PENDING_PAYMENT", label: "Awaiting Seeker Payment" },
            { id: "CONFIRMED", label: "Confirmed (Ready to Schedule)" },
            { id: "SCHEDULED", label: "Scheduled Sessions" },
            { id: "COMPLETED", label: "Completed" },
            { id: "REJECTED", label: "Rejected" },
            { id: "CANCELLED", label: "Cancelled" },
          ].map((tab) => {
            const count = counts[tab.id] || 0;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
                  isActive
                    ? "bg-[#7B2D26] text-[#FFFDF9] shadow-sm"
                    : tab.alert && count > 0
                    ? "bg-purple-100 text-purple-900 border border-purple-300 hover:bg-purple-200"
                    : "bg-[#FFFDF9] text-[#6E5545] border border-[#E8D8C3] hover:bg-[#FAF5EE]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 text-[10px] rounded-full font-black ${
                    isActive
                      ? "bg-[#64221C] text-[#E8A33D]"
                      : tab.alert && count > 0
                      ? "bg-purple-700 text-white"
                      : "bg-[#E8D8C3] text-[#3B2A1E]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#6E5545]" />
            <input
              type="text"
              placeholder="Search by Booking ID, Seeker Name, Phone, UTR..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] py-2 pl-9 pr-3 text-xs text-[#3B2A1E] focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold text-[#FFFDF9] bg-[#7B2D26] rounded-xl hover:bg-[#64221C]"
          >
            Search
          </button>
        </form>

        {/* Bookings Queue List */}
        <DataStateView
          loading={loading}
          error={fetchError}
          isEmpty={bookings.length === 0}
          onRetry={fetchBookings}
          loadingMessage="Loading verification queue from PostgreSQL database..."
          emptyView={
            <div className="p-12 rounded-2xl border border-dashed border-[#E8D8C3] bg-[#FFFDF9] text-center max-w-lg mx-auto">
              <CheckCircle2 className="h-10 w-10 text-[#6B8E5A] mx-auto mb-2" />
              <h3 className="font-temple text-base font-bold text-[#7B2D26]">Queue is Up to Date</h3>
              <p className="text-xs text-[#6E5545] mt-1">
                No bookings found matching filter <span className="font-bold font-mono">[{activeTab}]</span>.
              </p>
            </div>
          }
        >
          <div className="space-y-4">
            {bookings.map((booking) => {
              const cleanPhone = (booking.userPhone || "").replace(/[^0-9]/g, "");
              const waClientLink = `https://wa.me/${cleanPhone}`;

              return (
                <div
                  key={booking.id}
                  className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 sm:p-6 shadow-xs hover:border-[#C1662F] transition-all space-y-4"
                >
                  {/* Top Bar: Booking Ref, Product Type, Status, Price */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8D8C3]/60 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-black text-[#7B2D26] bg-[#FBF3E7] px-2.5 py-1 rounded-lg border border-[#E8A33D]/40">
                        {booking.bookingId}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#6E5545]/10 text-[#6E5545] uppercase">
                        {booking.productType === "vaastu"
                          ? "Vaastu Consultation"
                          : booking.productType === "kundli_pdf"
                          ? "Kundli Full PDF"
                          : "Astro Consultation"}
                      </span>
                      <span className="text-xs text-[#6E5545] flex items-center gap-1">
                        <Video className="h-3.5 w-3.5 text-[#C1662F]" />
                        <span>{booking.format}</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-right">
                        <div className="font-mono text-base font-black text-[#7B2D26]">
                          ₹{booking.amount.toLocaleString("en-IN")}
                        </div>
                        {booking.isFirstTimeAstro && (
                          <span className="text-[10px] text-[#6B8E5A] font-bold block">
                            ★ 50% First-Time Seeker Rate
                          </span>
                        )}
                      </div>
                      <div>{getStatusBadge(booking.bookingStatus)}</div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    {/* Seeker Information */}
                    <div className="space-y-1 bg-[#FAF5EE] p-3 rounded-xl border border-[#E8D8C3]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E5545] block">
                        Seeker Contact
                      </span>
                      <div className="font-bold text-[#3B2A1E] text-sm">{booking.userName}</div>
                      <div className="flex items-center gap-1.5 text-[#6E5545]">
                        <Phone className="h-3 w-3 text-[#7B2D26]" />
                        <span className="font-mono">{booking.userPhone}</span>
                        <a
                          href={waClientLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#25D366] hover:underline inline-flex items-center gap-0.5 ml-2 font-bold"
                        >
                          <MessageCircle className="h-3 w-3" /> WhatsApp
                        </a>
                      </div>
                      {booking.userEmail && (
                        <div className="flex flex-wrap items-center gap-1.5 text-[#6E5545]">
                          <Mail className="h-3 w-3 text-[#7B2D26]" />
                          <span>{booking.userEmail}</span>
                          {booking.emailStatus === "FAILED" && (
                            <span
                              title={booking.emailError || "Email delivery failed"}
                              className="inline-flex items-center gap-1 rounded bg-rose-100 text-rose-800 border border-rose-300 px-1.5 py-0.5 text-[9px] font-bold"
                            >
                              <AlertCircle className="h-2.5 w-2.5 text-rose-600" />
                              <span>email failed</span>
                            </span>
                          )}
                        </div>
                      )}
                      <div className="text-[10px] text-[#6E5545] pt-1">
                        Booked: {new Date(booking.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
                      </div>
                    </div>

                    {/* Preferences & Schedule */}
                    <div className="space-y-1 bg-[#FAF5EE] p-3 rounded-xl border border-[#E8D8C3]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E5545] block">
                        Preferences &amp; Slot
                      </span>
                      <div>
                        <strong>Requested Day:</strong> {booking.preferredDay || "Earliest"}
                      </div>
                      <div>
                        <strong>Window:</strong> {booking.preferredTimeWindow || "Morning"}
                      </div>
                      {booking.scheduledSlot ? (
                        <div className="mt-2 pt-1 border-t border-[#E8D8C3] text-blue-900 font-bold">
                          <span>Confirmed: </span>
                          <span className="bg-blue-100 px-2 py-0.5 rounded">{booking.scheduledSlot}</span>
                          <div className="text-[11px] font-normal text-blue-800 mt-1 truncate">
                            Link: {booking.meetingLink}
                          </div>
                        </div>
                      ) : (
                        <div className="text-amber-800 text-[11px] mt-1 font-semibold">
                          Awaiting Owner Scheduling
                        </div>
                      )}
                    </div>

                    {/* Payment Proof & UTR */}
                    <div className="space-y-1 bg-[#FAF5EE] p-3 rounded-xl border border-[#E8D8C3]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E5545] block">
                        Bank Credit &amp; UTR
                      </span>
                      <div>
                        <strong>Submitted UTR:</strong>{" "}
                        {booking.utr ? (
                          <span className="font-mono font-bold text-[#7B2D26] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300">
                            {booking.utr}
                          </span>
                        ) : (
                          <span className="text-stone-500 italic">None provided (check WhatsApp)</span>
                        )}
                      </div>
                      <div>
                        <strong>Bank Confirmed:</strong>{" "}
                        {booking.bankCreditConfirmed ? (
                          <span className="text-emerald-700 font-bold">✓ Confirmed in Bank</span>
                        ) : (
                          <span className="text-amber-700 font-bold">Pending Reconcile</span>
                        )}
                      </div>
                      {booking.approvedBy && (
                        <div className="text-[10px] text-stone-500">
                          Approved by: {booking.approvedBy} on {new Date(booking.approvedAt!).toLocaleDateString()}
                        </div>
                      )}
                      {booking.rejectionReason && (
                        <div className="text-rose-700 font-semibold text-[11px] mt-1">
                          Reason: {booking.rejectionReason}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Intake Metadata Preview */}
                  {booking.intakeDetails && (
                    <div className="bg-[#FFFDF9] border border-dashed border-[#E8D8C3] p-3 rounded-xl text-xs space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#7B2D26] block">
                        Intake Dossier:
                      </span>
                      {booking.productType === "vaastu" && booking.intakeDetails.propertyDetails ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[#6E5545]">
                          <div><strong>Type:</strong> {booking.intakeDetails.propertyDetails.propertyType || "N/A"}</div>
                          <div><strong>City:</strong> {booking.intakeDetails.propertyDetails.city || "N/A"}</div>
                          <div><strong>Area:</strong> {booking.intakeDetails.propertyDetails.areaSqFt || "N/A"} sq ft</div>
                          <div><strong>Facing:</strong> {booking.intakeDetails.propertyDetails.facing || "N/A"}</div>
                        </div>
                      ) : booking.intakeDetails.birthDetails ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[#6E5545]">
                          <div><strong>Gender:</strong> {booking.intakeDetails.birthDetails.gender || "N/A"}</div>
                          <div><strong>DOB:</strong> {booking.intakeDetails.birthDetails.dob || "N/A"}</div>
                          <div><strong>Time:</strong> {booking.intakeDetails.birthDetails.timeOfBirth || "N/A"}</div>
                          <div><strong>Place:</strong> {booking.intakeDetails.birthDetails.placeOfBirth || "N/A"}</div>
                        </div>
                      ) : null}
                      {booking.concern && (
                        <div className="pt-1 text-[#3B2A1E]">
                          <strong>Primary Query:</strong> {booking.concern}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E8D8C3]/40">
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                          `Pranam ${booking.userName}, regarding your ${
                            booking.productType === "vaastu" ? "Vaastu" : "Astro"
                          } booking (ID: ${booking.bookingId})...`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-white font-bold text-xs hover:bg-[#20ba5a] transition-all shadow-xs"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>Message Seeker on WhatsApp</span>
                      </a>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* APPROVE ACTION */}
                      {(booking.bookingStatus === "PAYMENT_CLAIMED" || booking.bookingStatus === "PENDING_PAYMENT") && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setBankConfirmedCheckbox(false);
                              setShowApproveModal(true);
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-[#6B8E5A] text-white font-bold text-xs hover:bg-[#5A794B] shadow-xs flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Verify &amp; Approve Payment</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowRejectModal(true);
                            }}
                            className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 font-bold text-xs hover:bg-rose-50"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {/* SCHEDULE ACTION */}
                      {booking.bookingStatus === "CONFIRMED" && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setScheduledSlotInput(
                              `${booking.preferredDay || "Tomorrow"} at 4:00 PM IST`
                            );
                            setMeetingLinkInput(
                              booking.format.includes("Google")
                                ? "https://meet.google.com/new"
                                : "WhatsApp call"
                            );
                            setShowScheduleModal(true);
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-blue-700 text-white font-bold text-xs hover:bg-blue-800 shadow-xs flex items-center gap-1.5"
                        >
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Assign Slot &amp; Meeting Link</span>
                        </button>
                      )}

                      {/* RESCHEDULE / COMPLETE ACTIONS */}
                      {booking.bookingStatus === "SCHEDULED" && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setScheduledSlotInput(booking.scheduledSlot || "");
                              setMeetingLinkInput(booking.meetingLink || "WhatsApp call");
                              setShowScheduleModal(true);
                            }}
                            className="px-3 py-1.5 rounded-lg border border-blue-300 text-blue-700 font-bold text-xs hover:bg-blue-50"
                          >
                            Update Slot / Link
                          </button>

                          <button
                            type="button"
                            onClick={() => handleComplete(booking)}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 shadow-xs flex items-center gap-1.5"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Mark Completed</span>
                          </button>
                        </>
                      )}

                      {/* OWNER CANCEL ACTION */}
                      {booking.bookingStatus !== "COMPLETED" && booking.bookingStatus !== "CANCELLED" && (
                        <button
                          type="button"
                          onClick={() => handleOwnerCancel(booking)}
                          className="px-2.5 py-1.5 text-stone-500 hover:text-rose-700 text-xs font-semibold"
                        >
                          Cancel
                        </button>
                      )}

                      {/* REFUND ACTION */}
                      {(booking.bookingStatus === "CONFIRMED" || booking.bookingStatus === "SCHEDULED") && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowRefundModal(true);
                          }}
                          className="px-2.5 py-1.5 text-stone-500 hover:text-rose-700 text-xs font-semibold"
                        >
                          Mark Refunded
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </DataStateView>
      </div>

      {/* MODAL 1: APPROVE PAYMENT */}
      {showApproveModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl border-2 border-[#E8D8C3] bg-[#FFFDF9] p-6 shadow-2xl space-y-4">
            <h3 className="font-temple text-lg font-bold text-[#7B2D26]">
              Bank Credit Verification &bull; {selectedBooking.bookingId}
            </h3>
            <p className="text-xs text-[#6E5545] leading-relaxed">
              Screenshots can be edited; the actual bank account or UPI application credit record is the only true proof.
            </p>

            <div className="bg-[#FBF3E7] p-4 rounded-xl border border-[#E8D8C3] text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#6E5545]">Seeker:</span>
                <span className="font-bold">{selectedBooking.userName} ({selectedBooking.userPhone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E5545]">Expected Credit:</span>
                <span className="font-mono font-bold text-base text-[#7B2D26]">₹{selectedBooking.amount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E5545]">Submitted UTR:</span>
                <span className="font-mono font-bold">{selectedBooking.utr || "None submitted"}</span>
              </div>
              {selectedBooking.isFirstTimeAstro && (
                <div className="text-[11px] text-[#6B8E5A] font-semibold pt-1 border-t border-[#E8D8C3]">
                  ★ Server will re-validate first-time eligibility upon confirmation.
                </div>
              )}
            </div>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-amber-300 bg-amber-50 cursor-pointer">
              <input
                type="checkbox"
                checked={bankConfirmedCheckbox}
                onChange={(e) => setBankConfirmedCheckbox(e.target.checked)}
                className="mt-1 h-4 w-4 rounded text-[#7B2D26] focus:ring-[#7B2D26]"
              />
              <span className="text-xs font-bold text-[#3B2A1E] leading-snug">
                I have confirmed this amount is credited in my bank or UPI app and the reference matches.
              </span>
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 text-xs font-bold text-[#6E5545] hover:text-[#3B2A1E]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={!bankConfirmedCheckbox || actionLoading}
                className="px-5 py-2 text-xs font-bold text-white bg-[#6B8E5A] rounded-xl hover:bg-[#5A794B] disabled:opacity-50"
              >
                {actionLoading ? "Verifying..." : "Confirm & Approve Booking"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SCHEDULE CONSULTATION */}
      {showScheduleModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl border-2 border-[#E8D8C3] bg-[#FFFDF9] p-6 shadow-2xl space-y-4">
            <h3 className="font-temple text-lg font-bold text-[#7B2D26]">
              Assign Slot &amp; Meeting Link &bull; {selectedBooking.bookingId}
            </h3>
            <p className="text-xs text-[#6E5545]">
              The user will see this confirmed slot in "My Account" and receive an email with direct links.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#3B2A1E] block mb-1">
                  Confirmed Time Slot (e.g. "Tomorrow at 4:00 PM IST"):
                </label>
                <input
                  type="text"
                  value={scheduledSlotInput}
                  onChange={(e) => setScheduledSlotInput(e.target.value)}
                  className="w-full rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] p-2.5 text-xs text-[#3B2A1E] focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                />
              </div>

              <div>
                <label className="font-bold text-[#3B2A1E] block mb-1">
                  Meeting Link or Mode (Google Meet URL or "WhatsApp call"):
                </label>
                <input
                  type="text"
                  value={meetingLinkInput}
                  onChange={(e) => setMeetingLinkInput(e.target.value)}
                  className="w-full rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] p-2.5 text-xs text-[#3B2A1E] focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 text-xs font-bold text-[#6E5545] hover:text-[#3B2A1E]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSchedule}
                disabled={actionLoading}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-700 rounded-xl hover:bg-blue-800 disabled:opacity-50"
              >
                {actionLoading ? "Scheduling..." : "Save & Notify Seeker"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: REJECT BOOKING */}
      {showRejectModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl border-2 border-[#E8D8C3] bg-[#FFFDF9] p-6 shadow-2xl space-y-4">
            <h3 className="font-temple text-lg font-bold text-rose-800">
              Reject Booking &bull; {selectedBooking.bookingId}
            </h3>
            <p className="text-xs text-[#6E5545]">
              Please provide a clear reason for the rejection (e.g. "Amount not found in bank statement", "Incorrect UTR reference").
            </p>

            <textarea
              rows={3}
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              placeholder="Enter mandatory rejection reason..."
              className="w-full rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] p-2.5 text-xs text-[#3B2A1E] focus:outline-none focus:ring-2 focus:ring-rose-800"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-xs font-bold text-[#6E5545]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={actionLoading}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-700 rounded-xl hover:bg-rose-800 disabled:opacity-50"
              >
                {actionLoading ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: REFUND BOOKING */}
      {showRefundModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl border-2 border-[#E8D8C3] bg-[#FFFDF9] p-6 shadow-2xl space-y-4">
            <h3 className="font-temple text-lg font-bold text-[#7B2D26]">
              Record Refund &bull; {selectedBooking.bookingId}
            </h3>
            <p className="text-xs text-[#6E5545]">
              Note the direct UPI refund reference or reason for audit trail:
            </p>

            <input
              type="text"
              value={refundNotesInput}
              onChange={(e) => setRefundNotesInput(e.target.value)}
              placeholder="e.g. Refunded ₹1,051 via GPay to seeker account"
              className="w-full rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] p-2.5 text-xs text-[#3B2A1E]"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRefundModal(false)}
                className="px-4 py-2 text-xs font-bold text-[#6E5545]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRefund}
                disabled={actionLoading}
                className="px-5 py-2 text-xs font-bold text-white bg-slate-700 rounded-xl hover:bg-slate-800 disabled:opacity-50"
              >
                {actionLoading ? "Saving..." : "Record Refund"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: PAYMENT SETTINGS DRAWER */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl border-2 border-[#E8D8C3] bg-[#FFFDF9] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#E8D8C3] pb-3">
              <h3 className="font-temple text-lg font-bold text-[#7B2D26] flex items-center gap-2">
                <Settings className="h-5 w-5 text-[#C1662F]" />
                <span>Owner Payment Routing Settings</span>
              </h3>
              <button type="button" onClick={() => setShowSettingsModal(false)} className="text-stone-400 hover:text-stone-700 text-lg">
                &times;
              </button>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Security Protection:</strong> Every change to these settings is audit-logged in PostgreSQL and an instant security alert email is dispatched to your registered address ({userEmail}).
              </div>
            </div>

            <form onSubmit={handleSavePaymentSettings} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#3B2A1E] block mb-1">Official Receiver UPI ID:</label>
                <input
                  type="text"
                  value={paymentSettings.upiId}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, upiId: e.target.value })}
                  placeholder="e.g. 9311215564@okbizaxis"
                  className="w-full rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] p-2.5 text-xs font-mono font-bold text-[#7B2D26]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-[#3B2A1E] block mb-1">Payee Name (as verified in UPI app):</label>
                <input
                  type="text"
                  value={paymentSettings.payeeName}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, payeeName: e.target.value })}
                  placeholder="e.g. Aapka Astro"
                  className="w-full rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] p-2.5 text-xs text-[#3B2A1E]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-[#3B2A1E] block mb-1">WhatsApp Number for Payment Proofs:</label>
                <input
                  type="text"
                  value={paymentSettings.whatsappNumber}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, whatsappNumber: e.target.value })}
                  placeholder="+91 93112 15564"
                  className="w-full rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] p-2.5 text-xs text-[#3B2A1E]"
                  required
                />
              </div>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-[#E8D8C3] bg-[#FAF5EE] cursor-pointer">
                <input
                  type="checkbox"
                  checked={paymentSettings.whatsappConfirmed}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, whatsappConfirmed: e.target.checked })}
                  className="h-4 w-4 rounded text-[#7B2D26] focus:ring-[#7B2D26]"
                />
                <span className="text-xs font-bold text-[#3B2A1E]">
                  I confirm this WhatsApp number is active and monitored for payment proofs.
                </span>
              </label>

              <div>
                <label className="font-bold text-[#3B2A1E] block mb-1">Optional Static Fallback QR Image URL:</label>
                <input
                  type="text"
                  value={paymentSettings.qrImageUrl || ""}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, qrImageUrl: e.target.value })}
                  placeholder="https://... (Optional fallback image)"
                  className="w-full rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] p-2.5 text-xs text-[#3B2A1E]"
                />
              </div>

              <div>
                <label className="font-bold text-[#3B2A1E] block mb-1">Unpaid Booking Expiry (in Days):</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={paymentSettings.unpaidExpiryDays}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, unpaidExpiryDays: Number(e.target.value) })}
                  className="w-full rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] p-2.5 text-xs font-mono font-bold text-[#3B2A1E]"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E8D8C3]">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 text-xs font-bold text-[#6E5545]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={settingsSaving}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#7B2D26] rounded-xl hover:bg-[#64221C] disabled:opacity-50"
                >
                  {settingsSaving ? "Saving & Logging..." : "Save Settings & Dispatch Alert"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
