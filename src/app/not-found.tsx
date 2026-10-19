import React from "react";
import Link from "next/link";
import { Compass, Home, PhoneCall, Sparkles, Calendar, FileText, ArrowRight, BookOpen } from "lucide-react";
import { MandalaDivider } from "@/components/ui/MandalaDivider";

export const metadata = {
  title: "404 - Celestial Coordinates Not Found | Aapka Astro",
  description: "The requested celestial path could not be found. Explore our authentic Vedic astrology consultations, Daily Panchang, and Janam Kundli.",
};

export default function NotFound() {
  const quickLinks = [
    {
      title: "Sanctum Homepage",
      description: "Return to the main astrological sanctuary",
      href: "/",
      icon: Home,
    },
    {
      title: "Book Consultation",
      description: "Direct 1-on-1 guidance with Acharya Niraj Kumar",
      href: "/consult",
      icon: PhoneCall,
    },
    {
      title: "Daily Panchang",
      description: "Today's Tithi, Nakshatra, Shubh Muhurat & Choghadiya",
      href: "/panchang",
      icon: Calendar,
    },
    {
      title: "Free Janam Kundli",
      description: "Instant Vedic birth chart calculation & planetary tables",
      href: "/kundli",
      icon: Sparkles,
    },
    {
      title: "Vedic Services",
      description: "Horoscope analysis, Devta Vaastu & Gemstones",
      href: "/services",
      icon: Compass,
    },
    {
      title: "Vedic Wisdom Blog",
      description: "Authentic astrological articles and remedial guides",
      href: "/blog",
      icon: BookOpen,
    },
  ];

  return (
    <div className="min-h-[80vh] bg-[#FBF3E7] text-[#3B2A1E] flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        {/* Vedic Sacred Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#E8D8C3] bg-[#FFFDF9] px-4 py-1.5 text-xs font-bold text-[#7B2D26] mb-6 shadow-xs">
          <span className="text-[#E8A33D]">ॐ</span>
          <span>CELESTIAL COORDINATES NOT FOUND</span>
          <span className="text-[#E8A33D]">ॐ</span>
        </div>

        {/* 404 Large Display */}
        <div className="relative inline-block mb-4">
          <span className="font-temple text-7xl sm:text-9xl font-black text-[#7B2D26]/10 select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <Compass className="h-16 w-16 sm:h-20 sm:w-20 text-[#7B2D26] animate-pulse" />
          </div>
        </div>

        <h1 className="font-temple text-3xl sm:text-4xl lg:text-5xl font-black text-[#7B2D26] tracking-tight">
          Lost Among the Constellations
        </h1>

        <p className="mt-4 text-sm sm:text-base text-[#6E5545] max-w-xl mx-auto leading-relaxed">
          The planetary alignment for this path could not be located in our cosmic charts. The page may have moved, expired, or never existed in this astrological realm.
        </p>

        <div className="my-8 flex justify-center">
          <MandalaDivider opacity={0.35} />
        </div>

        {/* Recommended Sanctum Destinations */}
        <div className="text-left mb-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#6E5545] text-center mb-6">
            Recommended Astrological Destinations
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-4 shadow-xs hover:border-[#7B2D26] hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-xl bg-[#FBF3E7] text-[#7B2D26] flex items-center justify-center shrink-0 group-hover:bg-[#7B2D26] group-hover:text-[#FFFDF9] transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[#7B2D26] group-hover:text-[#96372E]">
                        {link.title}
                      </div>
                      <p className="text-[11px] text-[#6E5545] mt-0.5 line-clamp-2">
                        {link.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-[#C1662F] group-hover:translate-x-1 transition-transform">
                    <span>Visit page</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Direct Helpline / WhatsApp */}
        <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 max-w-md mx-auto shadow-xs">
          <p className="text-xs text-[#6E5545] mb-3">
            Looking for a specific consultation or having trouble finding a page?
          </p>
          <a
            href="https://wa.me/919311215564?text=Pranam%20Acharya%20Ji%2C%20I%20am%20looking%20for%20assistance%20on%20aapkaastro.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-[#25D366] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#1EBE5D] transition-all shadow-xs"
          >
            <span>Connect with Sanctum on WhatsApp (+91 93112 15564)</span>
          </a>
        </div>
      </div>
    </div>
  );
}
