"use client";

import React, { useState } from "react";
import { LocationResult } from "@/lib/services/locationService";
import { LocationAutocomplete } from "./LocationAutocomplete";
import { KundliData } from "@/lib/astrology/types";
import { calculateKundli } from "@/lib/astrology/chartCalculations";
import { Calendar, Clock, User, Phone } from "lucide-react";
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
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [birthDate, setBirthDate] = useState("1995-10-24");
  const [birthTime, setBirthTime] = useState("14:35");

  React.useEffect(() => {
    if (user?.fullName && !name) {
      setName(user.fullName);
    }
  }, [user, name]);

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
  const [isCalculating, setIsCalculating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      phone: phone.trim() || undefined,
      userId: user?.id || undefined,
    };

    setTimeout(() => {
      const kundli = calculateKundli(calculationInput);
      onCalculated(kundli);
      setIsCalculating(false);

      // Persist lead directly in Neon PostgreSQL database
      fetch("/api/kundli/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: calculationInput,
          tier: "free",
        }),
      }).catch((err) => console.warn("Background lead capture note:", err));
    }, 350);
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

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Name & Gender */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3B2A1E] mb-1.5">
              Full Name
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

        {/* Mobile / WhatsApp Number (Lead Capture) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#3B2A1E] mb-1.5 flex items-center justify-between">
            <span>Mobile / WhatsApp Number</span>
            <span className="text-[10px] text-[#A3681F] font-normal">To receive Kundli highlights &amp; muhurat</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#6E5545]">
              <Phone className="h-4 w-4" />
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="w-full rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] pl-10 pr-4 py-2.5 text-xs text-[#3B2A1E] focus:border-[#7B2D26] focus:outline-none transition-all font-medium"
            />
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3B2A1E] mb-1.5">
              Date of Birth
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
              Time of Birth
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
          label="Place of Birth (Worldwide Search)"
          placeholder="Search any city, town, or village (e.g. Noida, London, Ayodhya)..."
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={isCalculating}
          className="w-full rounded-xl bg-[#7B2D26] py-3.5 px-6 font-bold text-[#FBF3E7] shadow-sm hover:bg-[#64221C] transition-all active:scale-[0.99] text-xs flex items-center justify-center gap-2"
        >
          <DiyaIcon size={16} />
          <span>{isCalculating ? "Computing Vedic Ephemeris..." : "Generate Free Janam Kundli"}</span>
        </button>
      </form>
    </div>
  );
};
