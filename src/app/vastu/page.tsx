"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  CheckCircle2,
  UploadCloud,
  Home,
  Building,
  Factory,
} from "lucide-react";
import { PLACEHOLDER_ASTROLOGER } from "@/config/placeholderContent";

const VastuPage: React.FC = () => {
  const [propertyType, setPropertyType] = useState<"residential" | "commercial" | "industrial">("residential");
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [city, setCity] = useState("New Delhi");
  const [areaSqFt, setAreaSqFt] = useState("1800");
  const [specificConcern, setSpecificConcern] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const vastuServices = [
    {
      type: "residential",
      title: "Residential Vastu Shastra",
      hindi: "आवासीय वास्तु परामर्श",
      icon: Home,
      price: "₹2,499",
      ideal: "Apartments, Villas, Independent Houses, Duplexes",
      highlights: [
        "Main Entrance (Simha Dwar) energy analysis",
        "Kitchen (Agni Kon) & Master Bedroom (Nairutya Kon) balancing",
        "Children study room & concentration enhancement",
        "Zero-demolition non-invasive metallic strip & pyramid remedies",
      ],
    },
    {
      type: "commercial",
      title: "Corporate & Retail Vastu",
      hindi: "व्यावसायिक एवं कॉर्पोरेट वास्तु",
      icon: Building,
      price: "₹4,999",
      ideal: "Offices, Showrooms, Clinics, Retail Outlets",
      highlights: [
        "Promoter / Director seating orientation for authority & clarity",
        "Cash counter & Accounts department placement for steady liquidity",
        "Staff productivity and conflict mitigation in open floors",
        "Client conversion acceleration through directional enhancements",
      ],
    },
    {
      type: "industrial",
      title: "Industrial & Factory Vastu",
      hindi: "औद्योगिक एवं फैक्ट्री वास्तु",
      icon: Factory,
      price: "₹9,999",
      ideal: "Manufacturing Plants, Warehouses, Processing Units",
      highlights: [
        "Heavy machinery alignment in South-West stability zones",
        "Transformer & Boiler placement in precise Fire sector",
        "Raw material vs Finished goods movement flow",
        "Labor harmony and prevention of sudden breakdown patterns",
      ],
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-[#FBF3E7] py-8 lg:py-16 min-h-screen text-[#3B2A1E]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E8D8C3] bg-[#FFFDF9] px-3.5 py-1 text-xs font-semibold text-[#7B2D26] shadow-sm mb-3 font-temple">
            <Compass className="h-3.5 w-3.5 text-[#C1662F]" />
            <span>AUTHENTIC VEDIC VASTU SHASTRA</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold font-temple text-[#7B2D26] tracking-tight">
            Scientific Non-Demolition Vastu Audits
          </h1>
          {/* PLACEHOLDER: replace with real content */}
          <p className="mt-3 text-[#7D6B5D] text-sm sm:text-base leading-relaxed font-body">
            Align your living and working space with cosmic magnetic fields. Correct doshas without tearing down walls using {PLACEHOLDER_ASTROLOGER.displayName}&apos;s proven elemental remedies.
          </p>
        </div>

        {/* 3 Packages Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {vastuServices.map((srv) => {
            const Icon = srv.icon;
            const isSelected = propertyType === srv.type;
            return (
              <div
                key={srv.type}
                onClick={() => setPropertyType(srv.type as any)}
                className={`cursor-pointer rounded-2xl border p-6 flex flex-col justify-between transition-all ${
                  isSelected
                    ? "border-2 border-[#7B2D26] bg-[#FFFDF9] shadow-lg ring-2 ring-[#7B2D26]/10"
                    : "border-[#E8D8C3] bg-[#FFFDF9] hover:border-[#D4C3B3] shadow-sm"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl font-bold ${
                        isSelected ? "bg-[#7B2D26] text-white" : "bg-[#FAF1E4] text-[#7B2D26]"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-xl font-bold font-temple text-[#7B2D26]">{srv.price}</span>
                  </div>

                  <h3 className="text-lg font-bold font-temple text-[#3B2A1E]">{srv.title}</h3>
                  <div className="text-xs text-[#C1662F] font-semibold mb-2">{srv.hindi}</div>
                  <div className="text-[11px] text-[#7D6B5D] mb-4 italic font-body">Best for: {srv.ideal}</div>

                  <ul className="space-y-2 border-t border-[#E8D8C3] pt-4 text-xs text-[#6B5A4E] font-body">
                    {srv.highlights.map((h, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#6B8E5A] shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E8D8C3]">
                  <span
                    className={`block w-full text-center rounded-xl py-2.5 text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-[#7B2D26] text-white shadow-sm"
                        : "border border-[#D4C3B3] bg-[#FAF5EE] text-[#3B2A1E] hover:bg-[#F3E7D3]"
                    }`}
                  >
                    {isSelected ? "Selected Package ✓" : "Select Package"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Audit Booking & Floor Plan Upload Form */}
        <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 md:p-10 shadow-md">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <h2 className="text-2xl font-bold font-temple text-[#7B2D26]">Book Your Vastu Audit with Acharya Ji</h2>
            <p className="text-xs sm:text-sm text-[#7D6B5D] mt-1 font-body">
              Submit your property details and floor plan. Acharya Ji personally performs the directional degree review and provides your detailed remedy roadmap.
            </p>
          </div>

          {submitted ? (
            <div className="rounded-2xl border border-[#6B8E5A]/40 bg-[#FAF1E4] p-8 text-center max-w-lg mx-auto">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#6B8E5A] text-white">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold font-temple text-[#7B2D26]">Vastu Audit Request Received!</h3>
              {/* PLACEHOLDER: replace with real content */}
              <p className="text-xs text-[#6B5A4E] mt-2 leading-relaxed font-body">
                Thank you, {userName}. {PLACEHOLDER_ASTROLOGER.displayName}&apos;s team has received your property details for{" "}
                <strong className="text-[#3B2A1E] capitalize">{propertyType} Vastu</strong>. Our desk will contact you within 2 hours at <strong className="text-[#3B2A1E]">{userPhone}</strong> to confirm your directional layout.
              </p>
              <div className="mt-6">
                <Link
                  href="/consult"
                  className="rounded-xl bg-[#7B2D26] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#64231D] shadow-sm transition-all"
                >
                  Book Direct Consultation with Acharya Ji Now
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-4 text-xs font-body">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#3B2A1E] font-semibold mb-1.5">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Verma"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full rounded-xl border border-[#D4C3B3] bg-[#FAF5EE] p-3 text-[#3B2A1E] focus:border-[#7B2D26] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#3B2A1E] font-semibold mb-1.5">Contact Number (WhatsApp)</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full rounded-xl border border-[#D4C3B3] bg-[#FAF5EE] p-3 text-[#3B2A1E] focus:border-[#7B2D26] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#3B2A1E] font-semibold mb-1.5">Property City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border border-[#D4C3B3] bg-[#FAF5EE] p-3 text-[#3B2A1E] focus:border-[#7B2D26] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#3B2A1E] font-semibold mb-1.5">Approx. Area (Sq. Ft)</label>
                  <input
                    type="text"
                    required
                    value={areaSqFt}
                    onChange={(e) => setAreaSqFt(e.target.value)}
                    className="w-full rounded-xl border border-[#D4C3B3] bg-[#FAF5EE] p-3 text-[#3B2A1E] focus:border-[#7B2D26] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#3B2A1E] font-semibold mb-1.5">Selected Audit</label>
                  <input
                    type="text"
                    disabled
                    value={propertyType.toUpperCase()}
                    className="w-full rounded-xl border border-[#D4C3B3] bg-[#FAF1E4] p-3 text-[#7B2D26] font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#3B2A1E] font-semibold mb-1.5">
                  Describe Main Concerns / Observed Symptoms
                </label>
                <textarea
                  rows={3}
                  required
                  value={specificConcern}
                  onChange={(e) => setSpecificConcern(e.target.value)}
                  placeholder="e.g. Constant medical expenses, business deal cancellations, negative vibes in bedroom..."
                  className="w-full rounded-xl border border-[#D4C3B3] bg-[#FAF5EE] p-3 text-[#3B2A1E] placeholder-[#7D6B5D] focus:border-[#7B2D26] focus:outline-none leading-relaxed"
                />
              </div>

              {/* Upload Floor Plan */}
              <div>
                <label className="block text-[#3B2A1E] font-semibold mb-1.5">
                  Upload Floor Plan / Layout Map (Optional)
                </label>
                <div className="rounded-2xl border-2 border-dashed border-[#D4C3B3] bg-[#FAF5EE] p-6 text-center hover:border-[#7B2D26] transition-colors cursor-pointer">
                  <UploadCloud className="mx-auto h-8 w-8 text-[#C1662F] mb-2" />
                  <span className="font-semibold text-[#3B2A1E] block">Drag &amp; drop floor plan or browse</span>
                  <span className="text-[11px] text-[#7D6B5D]">Accepts PDF, JPG, PNG up to 15MB</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#7B2D26] py-4 font-bold text-white text-sm shadow-md hover:bg-[#64231D] transition-all"
              >
                Submit Vastu Audit Request &rarr;
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default VastuPage;
