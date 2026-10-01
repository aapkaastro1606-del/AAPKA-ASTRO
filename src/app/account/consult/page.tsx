"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, PlusCircle, FileText } from "lucide-react";
import { ClientAccountStore } from "@/lib/store/clientAccountStore";
import { ClientConsultationStatusView } from "@/components/consult/ClientConsultationStatusView";
import ConsultPageComponent from "@/app/consult/page";

export default function AccountConsultPage() {
  const [activeBooking, setActiveBooking] = useState<any>(() => ClientAccountStore.getActiveBooking());
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    const sync = () => {
      setActiveBooking(ClientAccountStore.getActiveBooking());
    };
    window.addEventListener("aapka_booking_updated", sync);
    return () => {
      window.removeEventListener("aapka_booking_updated", sync);
    };
  }, []);

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
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7B2D26] bg-[#FFFDF9] border border-[#E8D8C3] px-3.5 py-1.5 rounded-xl hover:bg-[#FAF5EE] transition-all"
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
            {!activeBooking && (
              <div className="mb-6">
                <ClientConsultationStatusView onBookNew={() => setShowBookingForm(true)} />
              </div>
            )}
            <div className="border-t border-[#E8D8C3]/60 pt-6">
              <div className="text-center max-w-xl mx-auto mb-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7B2D26]">
                  Schedule New Session
                </span>
                <h2 className="font-temple text-xl font-bold text-[#3B2A1E] mt-1">
                  Book 1-on-1 Consultation with Acharya Niraj Kumar
                </h2>
              </div>
              <ConsultPageComponent />
            </div>
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
