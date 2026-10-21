"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, PlusCircle, FileText } from "lucide-react";
import { useUser } from "@/components/auth/ClerkAuthWrapper";
import { ClientConsultationStatusView } from "@/components/consult/ClientConsultationStatusView";
import ConsultPageComponent from "@/app/consult/page";

export default function AccountConsultPage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isUserLoaded && !user) {
      window.location.replace("/login?redirect_url=/account/consult");
    }
  }, [isUserLoaded, user]);

  const loadBooking = useCallback(async () => {
    try {
      const email = user?.primaryEmailAddress?.emailAddress;
      const params = new URLSearchParams();
      if (email) params.set("userEmail", email);
      if (user?.id) params.set("userId", user.id);
      const qs = params.toString() ? `?${params.toString()}` : "";

      const res = await fetch(`/api/booking/status${qs}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.booking) {
        setActiveBooking(data.booking);
      } else {
        setActiveBooking(null);
      }
    } catch {
      setActiveBooking(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  useEffect(() => {
    const sync = () => {
      loadBooking();
    };
    window.addEventListener("aapka_booking_updated", sync);
    return () => {
      window.removeEventListener("aapka_booking_updated", sync);
    };
  }, [loadBooking]);

  return (
    <div className="bg-[#FBF3E7] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation & Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7B2D26] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Account Dashboard</span>
          </Link>

          {activeBooking && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowBookingForm((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7B2D26] bg-[#FFFDF9] border border-[#E8D8C3] px-3.5 py-1.5 rounded-xl hover:bg-[#FAF5EE] transition-all cursor-pointer"
              >
                <PlusCircle className="h-3.5 w-3.5 text-[#C1662F]" />
                <span>{showBookingForm ? "View Active Consultation Status" : "Book Another Consultation"}</span>
              </button>

              <Link
                href="/account/history"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6E5545] hover:text-[#7B2D26]"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Past Remedies &amp; History</span>
              </Link>
            </div>
          )}
        </div>

        {/* Content: Show Consultation Status View or New Booking Intake */}
        {showBookingForm || !activeBooking ? (
          <div>
            <div className="mb-6 rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-4 text-center">
              <p className="text-xs font-semibold text-[#7B2D26]">
                {activeBooking
                  ? "Booking an additional consultation slot. Your existing active consultation remains safely coordinated."
                  : "Book your 1-on-1 consultation with Acharya Niraj Kumar."}
              </p>
            </div>
            <ConsultPageComponent />
          </div>
        ) : (
          <ClientConsultationStatusView
            booking={activeBooking}
            onBookNew={() => setShowBookingForm(true)}
          />
        )}
      </div>
    </div>
  );
}
