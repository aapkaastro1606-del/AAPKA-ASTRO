"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LocationResult } from "@/lib/services/locationService";
import { LocationAutocomplete } from "./LocationAutocomplete";
import { KundliData } from "@/lib/astrology/types";
import { calculateKundli } from "@/lib/astrology/chartCalculations";
import { Calendar, Clock, User, Phone, Mail, AlertCircle, ShieldCheck } from "lucide-react";
import { DiyaIcon } from "@/components/ui/DiyaIcon";
import { useUser } from "@/components/auth/ClerkAuthWrapper";

interface KundliFormProps {
  onCalculated: (data: KundliData) => void;
  className?: string;
}

export const KundliForm: React.FC<KundliFormProps> = ({ onCalculated, className = "" }) => {
  const { user } = useUser();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [birthDate, setBirthDate] = useState("1995-10-24");
  const [birthTime, setBirthTime] = useState("14:35");

  // Anti-Spam protection: Honeypot & Form Velocity tracking
  const [honeypot, setHoneypot] = useState("");
  const [formRenderedAt] = useState<number>(() => Date.now());

  // Explicit, unticked consent checkbox per DPDP / GDPR requirements
  const [consentGiven, setConsentGiven] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  React.useEffect(() => {
    if (user?.fullName && !name) {
      setName(user.fullName);
    }
    if (user?.primaryEmailAddress?.emailAddress && !email) {
      setEmail(user.primaryEmailAddress.emailAddress);
    }
  }, [user, name, email]);

  const [selectedLocation, setSelectedLocation] = useState<LocationResult>({
    id: "in-new-delhi",
    name: "New Delhi",
    displayName: "New Delhi, Delhi, India",
    state: "Delhi",
    country: "India",
    countryCode: "IN",
    latitude: 28.6139,
    longitude: 77.209,
    timezone: 5.5,
    timezoneId: "Asia/Kolkata",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Validate phone number
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      setErrorMessage("Please enter your WhatsApp or mobile number to receive your chart summary.");
      return;
    }

    const digitsOnly = trimmedPhone.replace(/[^\d]/g, "");
    if (digitsOnly.length < 10) {
      setErrorMessage("Please enter a valid mobile number with at least 10 digits.");
      return;
    }

    // 2. Validate explicit consent checkbox (Mandatory)
    if (!consentGiven) {
      setErrorMessage(
        "Please tick the consent checkbox below to generate your free chart and receive astrological consultation updates."
      );
      return;
    }

    setIsCalculating(true);

    const calculationInput = {
      name: name.trim() || "Seeker",
      gender,
      birthDate,
      birthTime,
      birthPlace: selectedLocation.displayName,
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      timezone: selectedLocation.timezone,
      phone: trimmedPhone,
      email: email.trim() || undefined,
      userId: user?.id || undefined,
    };

    try {
      // 3. Capture Free Kundli Lead with consent and anti-spam verification
      const leadRes = await fetch("/api/kundli/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: calculationInput.name,
          phone: calculationInput.phone,
          email: calculationInput.email || null,
          gender: calculationInput.gender,
          birthDate: calculationInput.birthDate,
          birthTime: calculationInput.birthTime,
          birthPlace: calculationInput.birthPlace,
          latitude: calculationInput.latitude,
          longitude: calculationInput.longitude,
          timezone: calculationInput.timezone,
          sourcePage: typeof window !== "undefined" ? window.location.pathname : "/kundli-generator",
          userId: calculationInput.userId || null,
          consentGiven: true,
          consentText:
            "I agree to be contacted about consultations and services, and I can withdraw consent any time.",
          consentVersion: "v1.0",
          website_hp: honeypot,
          formRenderedAt,
        }),
      });

      const leadData = await leadRes.json();

      if (!leadRes.ok || !leadData.success) {
        setErrorMessage(
          leadData.message || "Unable to process chart request. Please check your details and try again."
        );
        setIsCalculating(false);
        return;
      }

      // 4. Compute astronomical chart and deliver to parent component
      const kundli = calculateKundli(calculationInput);
      onCalculated(kundli);

      // Save calculated snapshot to DB in background
      fetch("/api/kundli/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: calculationInput,
          chartData: kundli,
          action: "save",
          tier: "free",
        }),
      }).catch((err) => console.warn("[KundliForm] Background chart save note:", err));
    } catch (err: any) {
      console.error("[KundliForm] Submission error:", err);
      setErrorMessage("A network error occurred while generating your Kundli. Please try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div
      className={`rounded-2xl border-2 border-[#E8D8C3] bg-[#FFFDF9] p-6 md:p-8 shadow-sm ${className}`}
    >
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E8D8C3]">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7B2D26] text-[#E8A33D] shadow-sm">
          <DiyaIcon size={22} />
        </div>
        <div>
          <h3 className="font-temple text-xl font-bold text-[#7B2D26] tracking-tight">
            Free Janam Kundli
          </h3>
          <p className="text-xs text-[#6E5545]">
            Authentic Lahiri Ephemeris &bull; Precise Lagna &amp; Planetary Degrees
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3.5 rounded-xl bg-[#FDF2F0] border border-[#E0A899] text-[#7B2D26] text-xs flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-[#C1662F] shrink-0 mt-0.5" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Anti-spam honeypot (hidden from human seekers, filled by bots) */}
        <input
          type="text"
          name="website_hp"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
        />

        {/* Name & Gender */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3B2A1E] mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#6E5545]">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                className="w-full rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] pl-10 pr-4 py-2.5 text-xs text-[#3B2A1E] focus:border-[#7B2D26] focus:outline-none transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3B2A1E] mb-1.5">
              Gender
            </label>
            <div className="grid grid-cols-2 gap-1 rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] p-1">
              <button
                type="button"
                onClick={() => setGender("male")}
                className={`rounded-lg py-1.5 text-xs font-bold transition-all ${
                  gender === "male"
                    ? "bg-[#7B2D26] text-[#FBF3E7] shadow-sm"
                    : "text-[#6E5545] hover:text-[#3B2A1E]"
                }`}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => setGender("female")}
                className={`rounded-lg py-1.5 text-xs font-bold transition-all ${
                  gender === "female"
                    ? "bg-[#7B2D26] text-[#FBF3E7] shadow-sm"
                    : "text-[#6E5545] hover:text-[#3B2A1E]"
                }`}
              >
                Female
              </button>
            </div>
          </div>
        </div>

        {/* Contact Coordinates: WhatsApp/Phone (Required) & Email (Optional) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3B2A1E] mb-1.5 flex items-center justify-between">
              <span>WhatsApp / Mobile Number *</span>
              <span className="text-[10px] text-[#A3681F] font-normal">To receive chart highlights</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#6E5545]">
                <Phone className="h-4 w-4" />
              </div>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] pl-10 pr-4 py-2.5 text-xs text-[#3B2A1E] focus:border-[#7B2D26] focus:outline-none transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3B2A1E] mb-1.5 flex items-center justify-between">
              <span>Email Address</span>
              <span className="text-[10px] text-[#6E5545] font-normal">Optional</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#6E5545]">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. seeker@example.com"
                className="w-full rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] pl-10 pr-4 py-2.5 text-xs text-[#3B2A1E] focus:border-[#7B2D26] focus:outline-none transition-all font-medium"
              />
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3B2A1E] mb-1.5">
              Date of Birth *
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#6E5545]">
                <Calendar className="h-4 w-4" />
              </div>
              <input
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] pl-10 pr-4 py-2.5 text-xs text-[#3B2A1E] focus:border-[#7B2D26] focus:outline-none transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3B2A1E] mb-1.5">
              Time of Birth *
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#6E5545]">
                <Clock className="h-4 w-4" />
              </div>
              <input
                type="time"
                required
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] pl-10 pr-4 py-2.5 text-xs text-[#3B2A1E] focus:border-[#7B2D26] focus:outline-none transition-all font-medium"
              />
            </div>
          </div>
        </div>

        {/* Birth Place with Worldwide Geocoding Autocomplete */}
        <LocationAutocomplete
          value={selectedLocation.displayName}
          onSelect={setSelectedLocation}
          label="Place of Birth (Worldwide Search) *"
          placeholder="Search any city, town, or village (e.g. Noida, London, Ayodhya)..."
        />

        {/* Explicit Unticked Consent Checkbox */}
        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer group select-none">
            <input
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => {
                setConsentGiven(e.target.checked);
                if (errorMessage) setErrorMessage(null);
              }}
              className="mt-0.5 h-4 w-4 rounded border-[#E8D8C3] text-[#7B2D26] focus:ring-[#7B2D26] accent-[#7B2D26] cursor-pointer"
            />
            <span className="text-[11px] sm:text-xs text-[#6E5545] leading-relaxed">
              I agree to be contacted about consultations and services, and I can withdraw consent
              any time. Read our{" "}
              <Link
                href="/privacy-policy#kundli-leads"
                target="_blank"
                className="text-[#7B2D26] font-semibold underline hover:text-[#C1662F]"
              >
                Privacy Policy
              </Link>
              .
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isCalculating}
          className="w-full rounded-xl bg-[#7B2D26] py-3.5 px-6 font-bold text-[#FBF3E7] shadow-sm hover:bg-[#64221C] transition-all active:scale-[0.99] text-xs flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
        >
          <DiyaIcon size={16} />
          <span>{isCalculating ? "Computing Vedic Ephemeris..." : "Generate Free Janam Kundli"}</span>
        </button>

        <div className="text-center">
          <span className="text-[10px] text-[#A3681F] inline-flex items-center gap-1 font-medium">
            <ShieldCheck className="h-3 w-3 text-[#6B8E5A]" />
            Strict Privacy Guarantee &bull; Zero Spam &bull; No Automated Marketing
          </span>
        </div>
      </form>
    </div>
  );
};
