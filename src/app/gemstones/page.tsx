"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Gem,
  ShieldCheck,
  PhoneCall,
} from "lucide-react";
import { PLACEHOLDER_ASTROLOGER, ADMIN_CONFIGURABLE_PRICING } from "@/config/placeholderContent";

const GemstonesPage: React.FC = () => {
  const [selectedPlanet, setSelectedPlanet] = useState<string>("all");
  const [cartCount, setCartCount] = useState(0);

  const gemstones = [
    {
      id: "yellow-sapphire",
      name: "Natural Yellow Sapphire (Pukhraj)",
      hindi: "प्राकृतिक पीला पुखराज",
      planet: "Jupiter (बृहस्पति)",
      planetKey: "jupiter",
      color: "Canary Golden Yellow",
      origin: "Ceylon (Sri Lanka)",
      price: 14500,
      ratti: "5.25 - 6.25 Ratti",
      lab: "IGI-GTL Govt. Lab Certified",
      benefits: "Wisdom, wealth, business expansion, marital bliss for women, higher education.",
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: "emerald",
      name: "Natural Zambian Emerald (Panna)",
      hindi: "प्राकृतिक जाम्बियन पन्ना",
      planet: "Mercury (बुध)",
      planetKey: "mercury",
      color: "Vibrant Deep Green",
      origin: "Zambia",
      price: 12800,
      ratti: "4.50 - 5.50 Ratti",
      lab: "Govt. Recognized Gem Lab",
      benefits: "Sharp intelligence, public speaking mastery, financial acumen, IT & commerce success.",
      image: "https://images.unsplash.com/photo-1615655406736-b37c4fabf923?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: "blue-sapphire",
      name: "Natural Blue Sapphire (Neelam)",
      hindi: "प्राकृतिक नीला नीलम",
      planet: "Saturn (शनि)",
      planetKey: "saturn",
      color: "Royal Cornflower Blue",
      origin: "Madagascar / Ceylon",
      price: 18900,
      ratti: "5.00 - 7.00 Ratti",
      lab: "Govt. Lab Certified & Tested",
      benefits: "Instant breakthroughs, discipline, judicial success, protection against severe accidents.",
      image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: "ruby",
      name: "Natural Burma Ruby (Manikya)",
      hindi: "प्राकृतिक बर्मा माणिक्य",
      planet: "Sun (सूर्य)",
      planetKey: "sun",
      color: "Pigeon Blood Crimson",
      origin: "Burma (Myanmar)",
      price: 16500,
      ratti: "4.00 - 5.25 Ratti",
      lab: "Govt. Authorized Gem Lab",
      benefits: "Executive authority, administrative promotions, fatherly health, immense vitality.",
      image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: "red-coral",
      name: "Italian Red Coral (Moonga)",
      hindi: "प्राकृतिक इटालियन मूंगा",
      planet: "Mars (मंगल)",
      planetKey: "mars",
      color: "Deep Triangular Red",
      origin: "Mediterranean (Italy)",
      price: 6800,
      ratti: "6.50 - 8.25 Ratti",
      lab: "IGI-GTL Lab Certified",
      benefits: "Courage, blood vitality, real estate success, overcoming laziness and debt burden.",
      image: "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: "pearl",
      name: "Natural South Sea Pearl (Moti)",
      hindi: "प्राकृतिक सच्चा मोती",
      planet: "Moon (चन्द्र)",
      planetKey: "moon",
      color: "Lustrous Milky White",
      origin: "South Sea",
      price: 5400,
      ratti: "7.00 - 9.00 Ratti",
      lab: "Govt. Gem Testing Lab",
      benefits: "Emotional tranquility, curing insomnia, strengthening maternal bond, mind control.",
      image: "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=500&q=80",
    },
  ];

  const filtered = selectedPlanet === "all"
    ? gemstones
    : gemstones.filter((g) => g.planetKey === selectedPlanet);

  const handleAddToCart = (name: string) => {
    setCartCount((c) => c + 1);
    alert(`${name} added to your sacred order! Our desk will coordinate your Vedic energization (Prana Pratishtha) details.`);
  };

  return (
    <div className="bg-[#FBF3E7] py-8 lg:py-16 min-h-screen text-[#3B2A1E]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E8D8C3] bg-[#FFFDF9] px-3.5 py-1 text-xs font-semibold text-[#7B2D26] shadow-sm mb-3 font-temple">
            <Gem className="h-3.5 w-3.5 text-[#C1662F]" />
            <span>100% UNHEATED &amp; UNTREATED</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold font-temple text-[#7B2D26] tracking-tight">
            Govt.-Certified Vedic Gemstones
          </h1>
          {/* PLACEHOLDER: replace with real content */}
          <p className="mt-3 text-[#7D6B5D] text-sm sm:text-base leading-relaxed font-body">
            Every gemstone recommended by {PLACEHOLDER_ASTROLOGER.displayName} is hand-selected, lab-certified for natural origin, and consecrated with individualized Vedic mantras before delivery.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12 text-xs font-semibold">
          {[
            { label: "All Gemstones", key: "all" },
            { label: "Jupiter (Pukhraj)", key: "jupiter" },
            { label: "Mercury (Panna)", key: "mercury" },
            { label: "Saturn (Neelam)", key: "saturn" },
            { label: "Sun (Manikya)", key: "sun" },
            { label: "Mars (Moonga)", key: "mars" },
            { label: "Moon (Moti)", key: "moon" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setSelectedPlanet(item.key)}
              className={`rounded-xl px-4 py-2 transition-all ${
                selectedPlanet === item.key
                  ? "bg-[#7B2D26] text-white font-bold shadow-sm"
                  : "border border-[#D4C3B3] bg-[#FAF5EE] text-[#3B2A1E] hover:bg-[#F3E7D3]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Gemstones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((gem) => (
            <div
              key={gem.id}
              className="group rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] overflow-hidden shadow-sm hover:border-[#D4C3B3] hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image & Lab Badge */}
                <div className="relative h-52 w-full overflow-hidden bg-[#FAF5EE]">
                  <img
                    src={gem.image}
                    alt={gem.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 rounded-lg bg-[#FAF5EE]/90 px-2.5 py-1 text-[10px] font-bold text-[#7B2D26] backdrop-blur-md border border-[#E8D8C3] flex items-center gap-1 shadow-sm font-temple">
                    <ShieldCheck className="h-3 w-3 text-[#6B8E5A]" />
                    <span>{gem.lab}</span>
                  </div>
                  <div className="absolute bottom-3 right-3 rounded-lg bg-[#3B2A1E]/80 px-2.5 py-1 text-[11px] font-mono font-bold text-white backdrop-blur-md">
                    {gem.origin}
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 space-y-3">
                  <div>
                    <h3 className="text-base font-bold font-temple text-[#3B2A1E] group-hover:text-[#7B2D26] transition-colors">
                      {gem.name}
                    </h3>
                    <div className="text-xs text-[#C1662F] font-semibold">{gem.hindi}</div>
                  </div>

                  <div className="text-xs text-[#6B5A4E] font-body">
                    <strong className="text-[#3B2A1E]">Ruler:</strong> {gem.planet}
                  </div>

                  <p className="text-xs text-[#7D6B5D] leading-relaxed line-clamp-2 font-body">
                    {gem.benefits}
                  </p>

                  <div className="rounded-xl border border-[#E8D8C3] bg-[#FAF5EE] p-2.5 text-[11px] flex justify-between text-[#6B5A4E]">
                    <span>Weight Range:</span>
                    <strong className="text-[#3B2A1E] font-mono">{gem.ratti}</strong>
                  </div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="border-t border-[#E8D8C3] p-6 pt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#7D6B5D] uppercase block font-semibold font-temple">Starting From</span>
                  <span className="text-xl font-bold font-temple text-[#7B2D26]">
                    ₹{gem.price.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Link
                    href="/consult"
                    className="rounded-xl border border-[#D4C3B3] bg-[#FAF5EE] px-3 py-2 text-xs font-semibold text-[#3B2A1E] hover:bg-[#F3E7D3] transition-all"
                    title="Ask Acharya Ji if this stone is suitable for your Lagna"
                  >
                    Check Suitability
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleAddToCart(gem.name)}
                    className="rounded-xl bg-[#7B2D26] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#64231D] shadow-sm transition-all"
                  >
                    Order
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Consult Banner for Gemstone Suitability */}
        <div className="mt-16 rounded-3xl border border-[#E8A33D]/60 bg-gradient-to-r from-[#7B2D26] via-[#64231D] to-[#3B2A1E] text-white p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div>
            <h3 className="text-xl font-bold font-temple">
              WARNING: Never wear a gemstone without Kundli verification
            </h3>
            {/* PLACEHOLDER: replace with real content */}
            <p className="text-xs sm:text-sm text-amber-100/80 mt-1 max-w-2xl leading-relaxed font-body">
              Wearing an incompatible gemstone for an enemy planet (such as Neelam or Moonga without proper house alignment) can trigger severe financial and health reversals. Let {PLACEHOLDER_ASTROLOGER.displayName} calculate your Shadbala before ordering.
            </p>
          </div>

          <Link
            href="/consult"
            className="shrink-0 rounded-xl bg-[#E8A33D] px-6 py-3.5 text-xs font-bold text-[#3B2A1E] hover:bg-[#d69330] shadow-md flex items-center gap-2 transition-all"
          >
            <PhoneCall className="h-4 w-4" />
            <span>Consult Acharya Ji First (Flat ₹1,051)</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GemstonesPage;
