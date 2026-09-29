"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AstrologerStateStore, AstrologerStatus } from "@/lib/store/astrologerStore";
import {
  Wallet,
  Menu,
  X,
  PhoneCall,
  Compass,
  FileText,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Globe,
  ChevronDown,
  Calculator,
  Gem,
  Calendar,
  Sun,
  Moon,
  Star,
  Flame,
} from "lucide-react";
import { UserButton, useUser } from "@/components/auth/ClerkAuthWrapper";
import { useLanguage } from "@/context/LanguageContext";
import { useCurrentUserRole } from "@/lib/auth/roleContext";
import { CallbackRequestModal } from "@/components/consult/CallbackRequestModal";

type DropdownKey = "horoscope" | "kundli" | "panchang" | "content" | null;

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { isAstrologer } = useCurrentUserRole();
  const { isLoaded, isSignedIn, user } = useUser();

  const [mounted, setMounted] = useState(false);
  const [walletBalance, setWalletBalance] = useState(250);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [status, setStatus] = useState<AstrologerStatus>("AVAILABLE");
  const [callbackModalOpen, setCallbackModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<DropdownKey>(null);
  const [mobileAccordion, setMobileAccordion] = useState<DropdownKey>("horoscope");

  const navRef = useRef<HTMLElement | null>(null);

  const isAuthenticatedUser = Boolean(mounted && isLoaded && isSignedIn && user);
  const isHi = language === "hi" || pathname?.startsWith("/hi");

  const syncState = () => {
    setWalletBalance(AstrologerStateStore.getWalletBalance());
    setStatus(AstrologerStateStore.getStatus());
  };

  useEffect(() => {
    setMounted(true);
    syncState();
    window.addEventListener("astro_state_changed", syncState);
    const interval = setInterval(syncState, 2000);
    return () => {
      window.removeEventListener("astro_state_changed", syncState);
      clearInterval(interval);
    };
  }, []);

  // Close dropdowns when navigating
  useEffect(() => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close desktop dropdown when clicking outside header
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const panchangHref = isHi ? "/hi/panchang" : "/panchang";
  const panchangTomorrowHref = isHi ? "/hi/panchang/tomorrow" : "/panchang/tomorrow";
  const horoscopeHref = isHi ? "/hi/horoscope" : "/horoscope";

  // 1. Horoscope Dropdown Items
  const horoscopeItems = [
    {
      label: isHi ? "दैनिक राशिफल (Daily Horoscope)" : "Daily Horoscope (Chandra Rashi)",
      desc: isHi
        ? "चन्द्र गोचर, नक्षत्र एवं ताराबल आधारित १२ राशियों का फल"
        : "Authentic Moon-sign transit forecasts & domain scores",
      href: horoscopeHref,
      icon: Sparkles,
    },
    {
      label: isHi ? "१२ वैदिक राशियाँ (Zodiac Signs Hub)" : "Zodiac Signs Hub (12 Rashis)",
      desc: isHi
        ? "सभी १२ राशियों के स्वामी, तत्व, स्वभाव एवं इष्ट देव"
        : "Explore traits, ruling planets & elements for all 12 signs",
      href: "/zodiac-signs",
      icon: Star,
    },
    {
      label: isHi ? "चन्द्र राशि कैलकुलेटर (Moon Sign)" : "Moon Sign Calculator",
      desc: isHi
        ? "जन्म विवरण से अपनी सटीक वैदिक जन्म राशि और नक्षत्र जानें"
        : "Find your exact Vedic Chandra Rashi & Nakshatra from birth details",
      href: "/moon-sign-calculator",
      icon: Moon,
    },
    {
      label: isHi ? "सूर्य राशि एवं अंक ज्योतिष" : "Sun Sign & Numerology Calculators",
      desc: isHi
        ? "सूर्य राशि एवं मूलांक-भाग्यांक गणना"
        : "Calculate your Surya Rashi & Vedic Numerology life path",
      href: "/sun-sign-calculator",
      icon: Sun,
    },
  ];

  // 2. Kundli & Matching Dropdown Items
  const kundliMatchingItems = [
    {
      label: isHi ? "जन्म कुंडली निर्माण (Kundli Generator)" : "Free Kundli Generator",
      desc: isHi
        ? "लग्न चार्ट, नवमांश, विंशोत्तरी दशा एवं ग्रह स्थिति"
        : "Full Lagna chart, Navamsha, planetary degrees & Dasha periods",
      href: "/kundli-generator",
      icon: FileText,
    },
    {
      label: isHi ? "कुंडली मिलान (Kundli Matching)" : "Kundli Matching (Guna Milan)",
      desc: isHi
        ? "अष्टकूट ३६ गुण मिलान एवं मांगलिक दोष विश्लेषण"
        : "36-point Ashtakoota marriage compatibility & Manglik check",
      href: "/kundli-matching",
      icon: HeartHandshake,
    },
    {
      label: isHi ? "प्रेम अनुकूलता (Love Calculator)" : "Love Compatibility Calculator",
      desc: isHi
        ? "राशि एवं नाम के आधार पर संबंध सामंजस्य"
        : "Check relationship harmony & cosmic bond score",
      href: "/love-calculator",
      icon: Calculator,
    },
    {
      label: isHi ? "फ्लेम्स कैलकुलेटर (FLAMES)" : "FLAMES Relationship Calculator",
      desc: isHi
        ? "नाम अक्षरों से मित्रता और संबंध विश्लेषण"
        : "Classic name-based relationship & bond analyzer",
      href: "/flames-calculator",
      icon: Flame,
    },
  ];

  // 3. Panchang & Festivals Dropdown Items
  const panchangFestivalItems = [
    {
      label: isHi ? "आज का पंचांग (Daily Panchang)" : "Today's Vedic Panchang",
      desc: isHi
        ? "तिथि, नक्षत्र, योग, करण, राहुकाल एवं चौघड़िया समयरेखा"
        : "Tithi, Nakshatra, Rahu Kaal, Abhijit Muhurat & 24h Choghadiya",
      href: panchangHref,
      icon: Calendar,
    },
    {
      label: isHi ? "कल का पंचांग (Tomorrow's Panchang)" : "Tomorrow's Panchang",
      desc: isHi
        ? "आगामी दिन के शुभ मुहूर्त एवं चौघड़िया की पूर्व जानकारी"
        : "Plan ahead with tomorrow's sunrise, tithi & auspicious timings",
      href: panchangTomorrowHref,
      icon: Sun,
    },
    {
      label: isHi ? "व्रत एवं त्यौहार कैलेंडर (Festivals)" : "Hindu Festival & Vrat Calendar",
      desc: isHi
        ? "एकादशी, पूर्णिमा, अमावस्या एवं प्रमुख सनातन पर्व सूची"
        : "Upcoming Ekadashi, Purnima, Sankranti & major Hindu festivals",
      href: "/festivals",
      icon: Sparkles,
    },
  ];

  // 4. Content Dropdown Items (Blog, Reels, Vastu & Gemstones)
  const contentItems = [
    {
      label: isHi ? "ज्योतिष लेख (Vedic Blog)" : "Astrology Blog & Guides",
      desc: isHi
        ? "ग्रह गोचर, शास्त्रीय उपाय एवं पर्व विशेषांक लेख"
        : "In-depth articles on planetary transits, remedies & scriptures",
      href: "/blog",
      icon: BookOpen,
    },
    {
      label: isHi ? "आध्यात्मिक रील्स (Astro Reels)" : "Astro Reels & Short Videos",
      desc: isHi
        ? "आचार्य जी के संक्षिप्त ज्योतिषीय एवं वास्तु सूत्र"
        : "Bite-sized daily Vedic wisdom & remedies by Acharya Ji",
      href: "/reels",
      icon: Sparkles,
    },
    {
      label: isHi ? "वास्तु शास्त्र (Vastu Shastra)" : "Vastu Shastra & Devta Vastu",
      desc: isHi
        ? "भवन, कार्यालय एवं ४५ देवता ऊर्जा क्षेत्र मार्गदर्शन"
        : "45-Devta energy mapping for homes, offices & factories",
      href: "/vastu",
      icon: Compass,
    },
    {
      label: isHi ? "प्रमाणित रत्न (Gemstones)" : "Natural Vedic Gemstones",
      desc: isHi
        ? "लग्न अनुसार अभिमंत्रित एवं प्रमाणित रत्न मार्गदर्शन"
        : "Guide to lab-certified planetary gemstones energized by mantra",
      href: "/gemstones",
      icon: Gem,
    },
  ];

  const isHoroscopeActive =
    pathname?.includes("/horoscope") ||
    pathname?.startsWith("/zodiac-signs") ||
    pathname === "/moon-sign-calculator" ||
    pathname === "/sun-sign-calculator" ||
    pathname === "/numerology-calculator";

  const isKundliActive =
    pathname?.startsWith("/kundli") ||
    pathname === "/love-calculator" ||
    pathname === "/flames-calculator";

  const isPanchangActive =
    pathname?.includes("/panchang") || pathname?.startsWith("/festivals");

  const isServicesActive = pathname?.startsWith("/services");

  const isContentActive =
    pathname?.startsWith("/blog") ||
    pathname?.startsWith("/reels") ||
    pathname?.startsWith("/vastu") ||
    pathname?.startsWith("/gemstones");

  const renderDesktopDropdown = (
    key: Exclude<DropdownKey, null>,
    label: string,
    isActive: boolean,
    items: {
      label: string;
      desc: string;
      href: string;
      icon: React.ComponentType<{ className?: string }>;
    }[],
    isSecondary = false
  ) => {
    const isOpen = openDropdown === key;
    return (
      <div
        className="relative"
        onMouseEnter={() => setOpenDropdown(key)}
        onMouseLeave={() => setOpenDropdown(null)}
      >
        <button
          type="button"
          onClick={() => setOpenDropdown(isOpen ? null : key)}
          aria-expanded={isOpen}
          className={`flex items-center gap-1 py-1.5 border-b-2 transition-colors cursor-pointer ${
            isSecondary ? "text-xs sm:text-[13px]" : "text-sm"
          } ${
            isActive || isOpen
              ? "border-[#7B2D26] font-semibold text-[#7B2D26]"
              : isSecondary
              ? "border-transparent font-normal text-[#6E5545] hover:text-[#7B2D26]"
              : "border-transparent font-medium text-[#4A3525] hover:text-[#7B2D26]"
          }`}
        >
          <span>{label}</span>
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-150 ${
              isOpen ? "rotate-180 text-[#7B2D26]" : "text-[#8C7565]"
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute left-0 top-full pt-2.5 w-80 z-50">
            <div className="rounded-2xl border border-[#E8D8C3] border-t-2 border-t-[#E8A33D] bg-[#FFFDF9] p-2 shadow-[0_14px_34px_rgba(59,42,30,0.14)] ring-1 ring-[#7B2D26]/5">
              {items.map((item) => {
                const Icon = item.icon;
                const itemActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpenDropdown(null)}
                    className={`flex items-start gap-3 rounded-xl p-2.5 transition-colors group ${
                      itemActive ? "bg-[#FBF3E7]" : "hover:bg-[#FBF3E7]"
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                        itemActive
                          ? "bg-[#7B2D26] text-[#FBF3E7] border-[#7B2D26]"
                          : "bg-[#FBF3E7] text-[#7B2D26] border-[#E8D8C3] group-hover:bg-[#7B2D26] group-hover:text-[#FBF3E7] group-hover:border-[#7B2D26]"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#3B2A1E] group-hover:text-[#7B2D26] transition-colors">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-[#6E5545] leading-snug mt-0.5">
                        {item.desc}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <header
        ref={navRef}
        className="sticky top-0 z-40 border-b border-[#E8D8C3] bg-[#FFFDF9]/95 backdrop-blur-md shadow-[0_2px_10px_rgba(59,42,30,0.05)]"
      >
        {/* Slim Offer-Only Utility Strip (Strictly for the 50% off offer — zero online/availability status duplication) */}
        <div className="bg-[#7B2D26] px-4 py-1 text-center text-[11px] font-medium text-[#FBF3E7]">
          <Link
            href="/consult"
            className="inline-flex items-center justify-center gap-1.5 hover:underline"
          >
            <span className="font-bold text-[#E8A33D]">
              {isHi ? "प्रथम परामर्श पर 50% छूट:" : "50% Off First Consultation:"}
            </span>
            <span>
              {isHi
                ? "आचार्य नीरज कुमार जी से सीधा 1-on-1 वैदिक ज्योतिष एवं वास्तु परामर्श"
                : "Direct 1-on-1 Vedic Jyotish & Vastu guidance with Acharya Niraj Kumar"}
            </span>
            <span className="font-bold text-[#E8A33D]">&rarr;</span>
          </Link>
        </div>

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8 gap-4">
          {/* 1. Left: Brand Identity + Single Compact "Online" Indicator (Shown Once) */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="/images/logo.png"
                alt="Aapka Astro"
                className="h-10 w-10 object-contain rounded-xl border border-[#C1662F]/30 bg-[#7B2D26] p-1 shadow-sm group-hover:scale-105 transition-transform"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-temple text-lg sm:text-xl font-bold tracking-wider text-[#7B2D26]">
                    AAPKA<span className="text-[#C1662F]">ASTRO</span>
                  </span>
                  {/* Single Compact Online Indicator (Pulsing Dot + "Online" Text — Not Repeated Elsewhere) */}
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                      status === "AVAILABLE"
                        ? "bg-[#6B8E5A]/12 border-[#6B8E5A]/40 text-[#2A4720]"
                        : status === "BUSY"
                        ? "bg-[#E8A33D]/15 border-[#E8A33D]/40 text-[#7B2D26]"
                        : "bg-[#E8D8C3]/50 border-[#E8D8C3] text-[#6E5545]"
                    }`}
                    title={
                      status === "AVAILABLE"
                        ? "Acharya Niraj Kumar is currently online"
                        : status === "BUSY"
                        ? "Acharya Niraj Kumar is currently in a consultation"
                        : "Acharya Niraj Kumar is currently offline"
                    }
                  >
                    <span className="relative flex h-2 w-2">
                      {status !== "OFFLINE" && (
                        <span
                          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                            status === "AVAILABLE" ? "bg-[#6B8E5A]" : "bg-[#E8A33D]"
                          }`}
                        />
                      )}
                      <span
                        className={`relative inline-flex rounded-full h-2 w-2 ${
                          status === "AVAILABLE"
                            ? "bg-[#6B8E5A]"
                            : status === "BUSY"
                            ? "bg-[#E8A33D]"
                            : "bg-[#8C7565]"
                        }`}
                      />
                    </span>
                    <span>
                      {status === "AVAILABLE"
                        ? isHi
                          ? "ऑनलाइन"
                          : "Online"
                        : status === "BUSY"
                        ? isHi
                          ? "परामर्श में"
                          : "In Session"
                        : isHi
                        ? "ऑफलाइन"
                        : "Offline"}
                    </span>
                  </span>
                </div>
                <div className="text-[11px] text-[#6E5545] font-medium tracking-wide">
                  Acharya Niraj Kumar &bull; Jyotish &amp; Vastu
                </div>
              </div>
            </Link>
          </div>

          {/* 2. Center: 5 Grouped Top-Level Navigation Items (3 Core Dropdowns + Services Direct Link + Secondary Content Dropdown) */}
          <nav
            aria-label="Main Navigation"
            className="hidden lg:flex items-center gap-6 xl:gap-7"
          >
            {/* Group 1: Horoscope (Dropdown) */}
            {renderDesktopDropdown(
              "horoscope",
              isHi ? "राशिफल" : "Horoscope",
              Boolean(isHoroscopeActive),
              horoscopeItems
            )}

            {/* Group 2: Kundli & Matching (Dropdown) */}
            {renderDesktopDropdown(
              "kundli",
              isHi ? "कुंडली एवं मिलान" : "Kundli & Matching",
              Boolean(isKundliActive),
              kundliMatchingItems
            )}

            {/* Group 3: Panchang & Festivals (Dropdown) */}
            {renderDesktopDropdown(
              "panchang",
              isHi ? "पंचांग एवं पर्व" : "Panchang & Festivals",
              Boolean(isPanchangActive),
              panchangFestivalItems
            )}

            {/* Group 4: Services (Direct Link) */}
            <Link
              href="/services"
              className={`text-sm py-1.5 border-b-2 transition-colors ${
                isServicesActive
                  ? "border-[#7B2D26] font-semibold text-[#7B2D26]"
                  : "border-transparent font-medium text-[#4A3525] hover:text-[#7B2D26]"
              }`}
            >
              {isHi ? "सेवाएँ" : "Services"}
            </Link>

            {/* Subtle vertical divider before lightweight Content dropdown */}
            <span className="h-3.5 w-px bg-[#E8D8C3]" aria-hidden="true" />

            {/* Group 5: Content (Collapsed Blog, Reels, Vastu & Gemstones — Lightweight Secondary Dropdown) */}
            {renderDesktopDropdown(
              "content",
              isHi ? "लेख एवं रील्स" : "Content",
              Boolean(isContentActive),
              contentItems,
              true
            )}
          </nav>

          {/* 3. Right Cluster: Small Pill हिंदी Toggle (Just Before Account Controls) + Account Controls + Standalone Consult CTA */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            {/* हिंदी Language Toggle — Small, Clearly-Styled Pill Positioned Consistently Before Account Controls */}
            <button
              type="button"
              onClick={() => setLanguage(language === "en" ? "hi" : "en")}
              className="inline-flex items-center gap-1 rounded-full border border-[#E8D8C3] bg-[#FBF3E7] hover:bg-[#F5E6D0] hover:border-[#C1662F]/50 px-2.5 py-1 text-xs font-bold text-[#7B2D26] transition-colors cursor-pointer"
              title="Switch Language (English / हिन्दी)"
            >
              <Globe className="h-3 w-3 text-[#C1662F]" />
              <span className="font-hindi leading-none">
                {language === "en" ? "हिन्दी" : "EN"}
              </span>
            </button>

            {/* STRICT AUTH STATE (Positioned right after Language Pill, before Consult CTA) */}
            {isAuthenticatedUser ? (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/wallet"
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#5A4332] hover:text-[#7B2D26] transition-colors"
                  title="Your Aapka Astro Wallet Balance"
                >
                  <Wallet className="h-3.5 w-3.5 text-[#C1662F]" />
                  <span className="font-mono font-semibold text-[#7B2D26]">₹{walletBalance}</span>
                </Link>

                <div className="flex items-center gap-2">
                  <Link
                    href="/account"
                    className="hidden xl:inline text-xs font-medium text-[#5A4332] hover:text-[#7B2D26] transition-colors"
                  >
                    {isHi ? "मेरा खाता" : t("nav_my_account")}
                  </Link>
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "h-7 w-7 rounded-full border border-[#E8D8C3]",
                      },
                    }}
                  />
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center px-1.5 py-1 text-xs font-medium text-[#5A4332] hover:text-[#7B2D26] transition-colors"
              >
                {isHi ? "लॉग इन" : t("nav_sign_in")}
              </Link>
            )}

            {/* CONSULT — Standalone, Most-Prominent High-Contrast CTA Button (Not a Dropdown) */}
            {status !== "OFFLINE" ? (
              <Link
                href="/consult"
                className="inline-flex items-center gap-2 rounded-xl bg-[#7B2D26] hover:bg-[#5E201A] text-[#FFFDF9] border-2 border-[#E8A33D] px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-extrabold tracking-wide shadow-[0_4px_14px_rgba(123,45,38,0.28)] hover:shadow-[0_6px_18px_rgba(123,45,38,0.38)] transition-all"
              >
                <PhoneCall className="h-4 w-4 text-[#E8A33D] shrink-0" />
                <span>{isHi ? "लाइव परामर्श" : t("nav_live_consult")}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setCallbackModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#7B2D26] hover:bg-[#5E201A] text-[#FFFDF9] border-2 border-[#E8A33D] px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-extrabold tracking-wide shadow-[0_4px_14px_rgba(123,45,38,0.28)] transition-all cursor-pointer"
              >
                <PhoneCall className="h-4 w-4 text-[#E8A33D]" />
                <span>{isHi ? "परामर्श बुक करें" : "Consult Now"}</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
              className="rounded-lg border border-[#E8D8C3] bg-[#FBF3E7] p-2 text-[#3B2A1E] lg:hidden hover:bg-[#E8D8C3]"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer — Tap-to-Open Temple-Styled Dropdown Accordions */}
        {mobileMenuOpen && (
          <div className="border-t border-[#E8D8C3] bg-[#FFFDF9] px-4 py-4 lg:hidden max-h-[85vh] overflow-y-auto space-y-3">
            {/* Standalone Primary Mobile Consult CTA */}
            <Link
              href="/consult"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl bg-[#7B2D26] border-2 border-[#E8A33D] px-4 py-3 text-sm font-bold text-[#FFFDF9] shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <PhoneCall className="h-4 w-4 text-[#E8A33D]" />
                <span>
                  {isHi
                    ? "आचार्य जी से लाइव परामर्श (50% छूट)"
                    : "Live Consult with Acharya Ji (50% Off)"}
                </span>
              </div>
              <span className="rounded bg-[#E8A33D] px-2 py-0.5 text-[11px] font-bold text-[#3B2A1E]">
                50% OFF
              </span>
            </Link>

            {/* Mobile Tap-to-Expand Temple-Styled Dropdown Groups */}
            {(
              [
                {
                  key: "horoscope" as const,
                  title: isHi ? "राशिफल (Horoscope)" : "Horoscope",
                  items: horoscopeItems,
                },
                {
                  key: "kundli" as const,
                  title: isHi ? "कुंडली एवं मिलान (Kundli & Matching)" : "Kundli & Matching",
                  items: kundliMatchingItems,
                },
                {
                  key: "panchang" as const,
                  title: isHi ? "पंचांग एवं पर्व (Panchang & Festivals)" : "Panchang & Festivals",
                  items: panchangFestivalItems,
                },
                {
                  key: "content" as const,
                  title: isHi ? "लेख एवं रील्स (Content)" : "Content (Blog & Reels)",
                  items: contentItems,
                },
              ]
            ).map((group) => {
              const expanded = mobileAccordion === group.key;
              return (
                <div
                  key={group.key}
                  className="rounded-xl border border-[#E8D8C3] bg-[#FBF3E7]/50 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setMobileAccordion(expanded ? null : group.key)
                    }
                    className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-xs font-bold text-[#3B2A1E] hover:bg-[#FBF3E7]"
                  >
                    <span>{group.title}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-[#7B2D26] transition-transform ${
                        expanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expanded && (
                    <div className="border-t border-[#E8D8C3] bg-[#FFFDF9] p-2 space-y-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-start gap-2.5 rounded-lg p-2 hover:bg-[#FBF3E7]"
                          >
                            <Icon className="h-4 w-4 text-[#7B2D26] mt-0.5 shrink-0" />
                            <div>
                              <div className="text-xs font-bold text-[#3B2A1E]">
                                {item.label}
                              </div>
                              <div className="text-[11px] text-[#6E5545]">
                                {item.desc}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Direct Link: Services */}
            <Link
              href="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] px-3.5 py-2.5 text-xs font-bold text-[#7B2D26]"
            >
              <span>{isHi ? "वैदिक सेवाएँ एवं पूजा (Services)" : "Services (Puja, Vastu & Remedies)"}</span>
              <span>&rarr;</span>
            </Link>

            {/* Mobile Auth Footer */}
            <div className="border-t border-[#E8D8C3] pt-3">
              {isAuthenticatedUser ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UserButton />
                    <Link
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs font-bold text-[#3B2A1E]"
                    >
                      {isHi ? "मेरा खाता" : t("nav_my_account")}
                    </Link>
                  </div>
                  <Link
                    href="/wallet"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-1.5 rounded-lg border border-[#E8D8C3] bg-[#FBF3E7] px-3 py-1.5 text-xs font-bold text-[#7B2D26]"
                  >
                    <Wallet className="h-3.5 w-3.5 text-[#C1662F]" />
                    <span className="font-mono font-black">₹{walletBalance}</span>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center rounded-lg border border-[#7B2D26] px-3 py-2 text-xs font-bold text-[#7B2D26]"
                  >
                    {isHi ? "लॉग इन" : t("nav_sign_in")}
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center rounded-lg bg-[#7B2D26] px-3 py-2 text-xs font-bold text-[#FBF3E7]"
                  >
                    {isHi ? "खाता बनाएँ" : "Sign Up"}
                  </Link>
                </div>
              )}

              {isAstrologer && (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-2 flex items-center gap-2 rounded-lg border border-[#7B2D26]/20 bg-[#7B2D26]/10 px-3 py-2 text-xs font-bold text-[#7B2D26]"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Operator Cockpit</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Callback / Notify Me Modal */}
      <CallbackRequestModal
        isOpen={callbackModalOpen}
        onClose={() => setCallbackModalOpen(false)}
        astrologerStatus={status}
      />
    </>
  );
};
