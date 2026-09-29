"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ClientAccountStore } from "@/lib/store/clientAccountStore";
import { PLACEHOLDER_ASTROLOGER, PLACEHOLDER_CONTACT_INFO } from "@/config/placeholderContent";
import { MandalaDivider } from "@/components/ui/MandalaDivider";
import { DiyaIcon } from "@/components/ui/DiyaIcon";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  PhoneCall,
  Sparkles,
  MessageCircle,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    topic: "Kundli Consultation",
    message: "",
    preferredSlot: "Morning (10:00 AM - 01:00 PM)",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    ClientAccountStore.requestCallback({
      clientName: formData.name,
      phone: formData.phone,
      topic: formData.topic,
      preferredSlot: formData.preferredSlot,
    });

    setSubmitted(true);
  };

  return (
    <div className="bg-[#FBF3E7] text-[#3B2A1E]">
      {/* 1. Header Banner */}
      <section className="border-b border-[#E8D8C3] bg-[#7B2D26] py-16 sm:py-20 text-[#FBF3E7]">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E8A33D]/30 bg-[#64221C] px-4 py-1 text-xs font-bold text-[#E8A33D] mb-4">
            <DiyaIcon size={14} />
            <span>SACRED SANCTUARY HELPLINE</span>
          </div>

          <h1 className="font-temple text-3xl sm:text-5xl font-bold tracking-tight text-[#FBF3E7]">
            Connect with Aapka Astro
          </h1>

          <p className="mt-3 text-sm sm:text-base text-[#FBF3E7]/80 max-w-2xl mx-auto font-body">
            Have questions regarding consultations, Vastu audits, or certified gemstones? We are here to guide you with complete transparency.
          </p>
        </div>
      </section>

      {/* 2. Contact Grid & Callback Form */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left: Contact Information */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#C1662F]">
                  Reach Out Directly
                </span>
                <h2 className="font-temple text-2xl sm:text-3xl font-bold text-[#7B2D26] mt-1">
                  Our Office &amp; Contact Desk
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-[#6E5545] leading-relaxed">
                  Direct 1-on-1 consultations and Vedic advisory services.
                </p>
              </div>

              <div className="space-y-6 text-xs sm:text-sm">
                <div className="flex items-start gap-4 rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 shadow-sm">
                  <MapPin className="h-5 w-5 text-[#7B2D26] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-[#7B2D26]">Office Address</h4>
                    <p className="text-[#6E5545] mt-1 leading-relaxed">
                      Unit No. A-1212 D, Tower A, Spectrum@Metro Phase 1, Sector 75, Noida, G.B. Nagar - U.P. 201301
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 shadow-sm">
                  <Phone className="h-5 w-5 text-[#6B8E5A] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-[#7B2D26]">Official Helpline &amp; WhatsApp</h4>
                    <p className="text-[#6E5545] mt-1">
                      <a href={`tel:${PLACEHOLDER_CONTACT_INFO.phoneRaw}`} className="hover:text-[#7B2D26] font-semibold">
                        {PLACEHOLDER_CONTACT_INFO.phone}
                      </a>
                    </p>
                    <span className="text-[11px] text-[#6B8E5A] font-semibold block mt-0.5">
                      {PLACEHOLDER_CONTACT_INFO.operatingHours}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 shadow-sm">
                  <Mail className="h-5 w-5 text-[#E8A33D] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-[#7B2D26]">Official Inquiries</h4>
                    <p className="text-[#6E5545] mt-1">
                      <a href={`mailto:${PLACEHOLDER_CONTACT_INFO.email}`} className="hover:text-[#7B2D26] font-semibold">
                        {PLACEHOLDER_CONTACT_INFO.email}
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Instant WhatsApp link */}
              <div className="rounded-2xl border border-[#6B8E5A]/40 bg-[#F4F9F2] p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-6 w-6 text-[#6B8E5A]" />
                  <div className="text-xs">
                    <span className="font-bold text-[#2A4720] block">Prefer WhatsApp?</span>
                    <span className="text-[#4F6D40]">Direct consultation desk: {PLACEHOLDER_CONTACT_INFO.whatsapp}</span>
                  </div>
                </div>
                <a
                  href={PLACEHOLDER_CONTACT_INFO.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-[#6B8E5A] px-4 py-2 text-xs font-bold text-white hover:bg-[#58754a] transition-all"
                >
                  Message
                </a>
              </div>
            </div>

            {/* Right: Callback / Consultation Intake Form */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-8 sm:p-10 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C1662F] mb-1">
                  <Sparkles className="h-4 w-4 text-[#E8A33D]" />
                  <span>Personalized Service Intake</span>
                </div>
                <h3 className="font-temple text-2xl font-bold text-[#7B2D26]">
                  Request an Astrological Callback
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-[#6E5545]">
                  Leave your details. Our coordination desk will reach out within 2 hours with the next available slot.
                </p>

                {submitted ? (
                  <div className="mt-8 rounded-2xl border border-[#6B8E5A]/40 bg-[#F4F9F2] p-8 text-center space-y-3">
                    <CheckCircle2 className="h-12 w-12 text-[#6B8E5A] mx-auto" />
                    <h4 className="font-temple text-xl font-bold text-[#2A4720]">
                      Namaste {formData.name}, Request Received!
                    </h4>
                    <p className="text-xs sm:text-sm text-[#4F6D40] max-w-md mx-auto">
                      Your inquiry regarding <strong>{formData.topic}</strong> has been logged. Our desk will contact you at <strong>{formData.phone}</strong> during {formData.preferredSlot}.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="mt-4 text-xs font-bold text-[#7B2D26] underline"
                    >
                      Submit Another Query
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#3B2A1E] mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Aarav Sharma"
                          className="w-full rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] px-4 py-2.5 text-xs text-[#3B2A1E] focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#3B2A1E] mb-1">
                          WhatsApp / Mobile Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 93112 15564"
                          className="w-full rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] px-4 py-2.5 text-xs text-[#3B2A1E] focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#3B2A1E] mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="your.email@example.com"
                          className="w-full rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] px-4 py-2.5 text-xs text-[#3B2A1E] focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#3B2A1E] mb-1">
                          Primary Service of Interest
                        </label>
                        <select
                          value={formData.topic}
                          onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                          className="w-full rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] px-4 py-2.5 text-xs text-[#3B2A1E] focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                        >
                          <option value="Kundli Consultation">Kundli &amp; Horoscope Reading</option>
                          <option value="Vastu Audit">Vastu Consultancy (Home/Office)</option>
                          <option value="Gemstone Recommendation">Natural Certified Gemstones</option>
                          <option value="Live Urgent Consultation">Live 1-on-1 Consultation</option>
                          <option value="Other Vedic Query">Other Astrological Inquiry</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#3B2A1E] mb-1">
                        Preferred Time for Callback
                      </label>
                      <select
                        value={formData.preferredSlot}
                        onChange={(e) => setFormData({ ...formData, preferredSlot: e.target.value })}
                        className="w-full rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] px-4 py-2.5 text-xs text-[#3B2A1E] focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                      >
                        <option value="Morning (10:00 AM - 01:00 PM)">Morning (10:00 AM - 01:00 PM IST)</option>
                        <option value="Afternoon (02:00 PM - 05:00 PM)">Afternoon (02:00 PM - 05:00 PM IST)</option>
                        <option value="Evening (05:00 PM - 08:00 PM)">Evening (05:00 PM - 08:00 PM IST)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#3B2A1E] mb-1">
                        Brief Note / Specific Query (Optional)
                      </label>
                      <textarea
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Mention any specific birth date, life dilemma, or property details..."
                        className="w-full rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] px-4 py-2.5 text-xs text-[#3B2A1E] focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-xl bg-[#7B2D26] py-3.5 text-xs sm:text-sm font-bold text-[#FBF3E7] hover:bg-[#96372E] transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Send className="h-4 w-4 text-[#E8A33D]" />
                      <span>Submit Callback Request</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
