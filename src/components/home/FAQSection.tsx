"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { MandalaDivider } from "@/components/ui/MandalaDivider";

import { PLACEHOLDER_ASTROLOGER, ADMIN_CONFIGURABLE_PRICING, FIRST_CONSULTATION_OFFER } from "@/config/placeholderContent";

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // {/* PLACEHOLDER: replace with real content */}
  const faqs = [
    {
      q: "How does the consultation booking and connection process work?",
      a: `Consultations with ${PLACEHOLDER_ASTROLOGER.displayName} follow a simple, transparent, real-world flow: you book and pay the flat consultation fee online → you immediately receive your confirmation on screen and via email containing your official booking reference and direct WhatsApp contact details (+91 93112 15564) → Acharya Niraj Kumar or his sanctum desk coordinates the exact time and connects with you via WhatsApp call or Google Meet, as you prefer or as arranged. Because Acharya Ji consults personally without third-party interns, every session is a genuine 1-on-1 private reading without requiring any complex in-app software or call plugins.`,
    },
    {
      q: "What happens if Acharya Ji is offline or currently in a consultation when I book?",
      a: `Acharya Ji's real-time desk presence (Online, In Consultation, or Offline) is shown on the consultation page as an honest indicator of how quickly he can connect. Even if he is currently in a session or offline for sacred rituals, you can complete your booking and immediately receive your confirmation with WhatsApp contact details. You can tap the one-touch WhatsApp link to reserve the next available window, or his sanctum desk will contact your registered phone number to confirm the exact consultation time.`,
    },
    {
      q: "How does consultation booking and fee payment work?",
      a: "Consultations are offered on a transparent flat-fee, pay-per-booking model. For your first Astro consultation, you receive a special promotional flat fee of ₹1,051/- (Regular ₹2,100 — 50% discount). Vaastu Consultations are flat ₹15,000/- (Regular ₹25,000). You simply select your consultation type, provide your intake details, and complete checkout securely via UPI, Cards, or Net Banking. Upon payment, you receive instant confirmation on screen and by email with a direct WhatsApp link to coordinate your session. There are zero surprise per-minute debits or hidden talktime deductions.",
    },
    {
      q: "How accurate is the free Janam Kundli calculator on this website?",
      a: "Our calculator is built on the rigorous Swiss Ephemeris astronomical model and Lahiri (Chitra Paksha) Ayanamsa — the gold standard recognized by Indian Vedic universities. It calculates planetary longitudes, Bhavas, Navamsha, and Vimshottari Mahadasha down to exact degrees and minutes.",
    },
    {
      q: "Are the recommended gemstones genuine and certified?",
      a: "Yes. Every gemstone recommended and shipped by Aapka Astro is 100% natural, unheated, and untreated. Each piece is accompanied by an individual identification certificate from government-recognized gemological testing laboratories (like IGI/GTL) and energized with proper Vedic Prana Pratishtha.",
    },
    {
      q: "Can I consult about Vastu without demolishing my current house structure?",
      a: `Absolutely. ${PLACEHOLDER_ASTROLOGER.displayName} specializes in non-demolition Vastu remedies. By utilizing elemental balancing (Pancha Tattva), directional metal tapes, consecrated Vedic yantras, and specific natural remedies, directional defects are balanced effectively without structural damage.`,
    },
  ];

  return (
    <section className="border-t border-[#E8D8C3] bg-[#FBF3E7] py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E8D8C3] bg-[#FFFDF9] px-3.5 py-1 text-xs font-bold text-[#7B2D26] mb-3">
            <HelpCircle className="h-3.5 w-3.5 text-[#E8A33D]" />
            <span>TRANSPARENCY &amp; INTEGRITY</span>
          </div>
          <h2 className="font-temple text-3xl sm:text-4xl font-bold text-[#7B2D26] tracking-tight">
            Frequently Asked Questions
          </h2>
          <MandalaDivider className="my-4" />
          <p className="text-[#6E5545] text-sm">
            Everything you need to know regarding our single-astrologer consultation model, WhatsApp/Meet coordination, and remedies.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="overflow-hidden rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] shadow-sm transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between p-5 text-left text-sm font-bold text-[#3B2A1E] hover:text-[#7B2D26] transition-colors"
                >
                  <span className="pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-[#C1662F] transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-[#E8D8C3] bg-[#FBF3E7]/40 px-5 pb-5 pt-3 text-xs sm:text-sm text-[#6E5545] leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
