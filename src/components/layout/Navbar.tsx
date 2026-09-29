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
} from "lucide-react";
import { UserButton, useUser } from "@/components/auth/ClerkAuthWrapper";
import { useLanguage } from "@/context/LanguageContext";
import { useCurrentUserRole } from "@/lib/auth/roleContext";
import { CallbackRequestModal } from "@/components/consult/CallbackRequestModal";

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
  const [openDropdown, setOpenDropdown] = useState<"tools" | "explore" | null>(null);

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

  // Close desktop dropdowns when clicking outside or navigating
  useEffect(() => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  }, [pathname]);

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
  const horoscopeHref = isHi ? "/hi/horoscope" : "/horoscope";

  const kundliToolsItems = [
    {
      label: isHi ? "जन्म कुंडली (Free Kundli)" : "Free Janam Kundli",
      desc: isHi ? "विंशोत्तरी दशा एवं षोडशवर्ग कुंडली" : "Birth chart, Vimshottari Dasha & divisional charts",
      href: "/kundli-generator",
      icon: FileText,
    },
    {
      label: isHi ? "कुंडली मिलान (Kundli Matching)" : "Kundli Matching (Guna Milan)",
      desc: isHi ? "अष्टकूट ३६ गुण एवं मांगलिक दोष विचार" : "Ashtakoota 36-point marriage compatibility",
      href: "/kundli-matching",
      icon: HeartHandshake,
    },
    {
      label: isHi ? "चन्द्र राशि कैलकुलेटर" : "Moon Sign (Chandra Rashi) Calculator",
      desc: isHi ? "जन्म समय से अपनी सटीक वैदिक राशि जानें" : "Find your exact Vedic Rashi & Nakshatra Pada",
      href: "/calculators/moon-sign",
      icon: Calculator,
    },
  ];

  const exploreItems = [
    {
      label: isHi ? "वैदिक ज्योतिष एवं वास्तु सेवाएँ" : "Vedic Services & Vastu Audits",
      desc: isHi ? "कुंडली विश्लेषण, देवता वास्तु एवं मुहूर्त" : "1-on-1 consultations, Devta Vastu & personal Muhurat",
      href: "/services",
      icon: Compass,
    },
    {
      label: isHi ? "प्रमाणित रत्न (Gemstones)" : "Certified Natural Gemstones",
      desc: isHi ? "राशि एवं लग्न अनुसार अभिमंत्रित रत्न" : "Lab-certified planetary ratnas energized by Acharya Ji",
      href: "/gemstones",
      icon: Gem,
    },
    {
      label: isHi ? "ज्योतिष लेख (Blog)" : "Astrology Articles & Guides",
      desc: isHi ? "ग्रह गोचर, पर्व एवं शास्त्रीय ज्ञान" : "In-depth Vedic transits, festivals & remedies",
      href: "/blog",
      icon: BookOpen,
    },
    {
      label: isHi ? "आध्यात्मिक रील्स (Reels)" : "Spiritual Reels & Shorts",
      desc: isHi ? "आचार्य जी के संक्षिप्त ज्योतिषीय सूत्र" : "Short daily astrological insights by Acharya Ji",
      href: "/reels",
      icon: Sparkles,
    },
  ];

  const isToolsActive = kundliToolsItems.some((item) => pathname === item.href);
  const isExploreActive = exploreItems.some((item) => pathname?.startsWith(item.href));

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

          {/* 2. Center: Grouped, Breathable Top-Level Navigation (Plain Text Links, Lighter Weight) */}
          <nav
            aria-label="Main Navigation"
            className="hidden lg:flex items-center gap-7 xl:gap-9"
          >
            <Link
              href={panchangHref}
              className={`text-sm transition-colors py-1.5 border-b-2 ${
                pathname?.includes("/panchang")
                  ? "border-[#7B2D26] font-semibold text-[#7B2D26]"
                  : "border-transparent font-medium text-[#5A4332] hover:text-[#7B2D26]"
              }`}
            >
              {isHi ? "दैनिक पंचांग" : t("nav_panchang")}
            </Link>

            <Link
              href={horoscopeHref}
              className={`text-sm transition-colors py-1.5 border-b-2 ${
                pathname?.includes("/horoscope")
                  ? "border-[#7B2D26] font-semibold text-[#7B2D26]"
                  : "border-transparent font-medium text-[#5A4332] hover:text-[#7B2D26]"
              }`}
            >
              {isHi ? "दैनिक राशिफल" : t("nav_horoscope")}
            </Link>

            {/* Grouped Dropdown 1: Kundli & Tools */}
            <div
              className="relative"
              onMouseEnter={() => setOpenDropdown("tools")}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === "tools" ? null : "tools")}
                aria-expanded={openDropdown === "tools"}
                className={`flex items-center gap-1 text-sm transition-colors py-1.5 border-b-2 cursor-pointer ${
                  isToolsActive || openDropdown === "tools"
                    ? "border-[#7B2D26] font-semibold text-[#7B2D26]"
                    : "border-transparent font-medium text-[#5A4332] hover:text-[#7B2D26]"
                }`}
              >
                <span>{isHi ? "कुंडली एवं गणना" : "Kundli & Tools"}</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-150 ${
                    openDropdown === "tools" ? "rotate-180 text-[#7B2D26]" : "text-[#8C7565]"
                  }`}
                />
              </button>

              {openDropdown === "tools" && (
                <div className="absolute left-0 top-full pt-2 w-76 z-50">
                  <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-2 shadow-xl">
                    {kundliToolsItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-[#FBF3E7] transition-colors group"
                        >
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#7B2D26]/10 text-[#7B2D26] group-hover:bg-[#7B2D26] group-hover:text-[#FBF3E7] transition-colors">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-[#3B2A1E] group-hover:text-[#7B2D26]">
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

            {/* Grouped Dropdown 2: Explore (Services, Gemstones, Blog, Reels) */}
            <div
              className="relative"
              onMouseEnter={() => setOpenDropdown("explore")}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === "explore" ? null : "explore")}
                aria-expanded={openDropdown === "explore"}
                className={`flex items-center gap-1 text-sm transition-colors py-1.5 border-b-2 cursor-pointer ${
                  isExploreActive || openDropdown === "explore"
                    ? "border-[#7B2D26] font-semibold text-[#7B2D26]"
                    : "border-transparent font-medium text-[#5A4332] hover:text-[#7B2D26]"
                }`}
              >
                <span>{isHi ? "सेवाएँ एवं ज्ञान" : "Services & More"}</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-150 ${
                    openDropdown === "explore" ? "rotate-180 text-[#7B2D26]" : "text-[#8C7565]"
                  }`}
                />
              </button>

              {openDropdown === "explore" && (
                <div className="absolute left-0 top-full pt-2 w-80 z-50">
                  <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-2 shadow-xl">
                    {exploreItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-[#FBF3E7] transition-colors group"
                        >
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#7B2D26]/10 text-[#7B2D26] group-hover:bg-[#7B2D26] group-hover:text-[#FBF3E7] transition-colors">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-[#3B2A1E] group-hover:text-[#7B2D26]">
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
          </nav>

          {/* 3. Right Cluster: Quiet Secondary Controls + Unmissable Primary Conversion CTA */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Quiet Plain-Text Language Switch */}
            <button
              type="button"
              onClick={() => setLanguage(language === "en" ? "hi" : "en")}
              className="inline-flex items-center gap-1 px-1.5 py-1 text-xs font-medium text-[#6E5545] hover:text-[#7B2D26] transition-colors cursor-pointer"
              title="Toggle Language (English / हिन्दी)"
            >
              <Globe className="h-3.5 w-3.5 text-[#8C7565]" />
              <span className="font-hindi">{language === "en" ? "हिन्दी" : "EN"}</span>
            </button>

            {/* STRICT AUTH STATE (Quiet text/avatar so nothing competes with the primary CTA) */}
            {isAuthenticatedUser ? (
              <div className="flex items-center gap-3">
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

            {/* PRIMARY CONVERSION ACTION: Solid High-Contrast Filled Button (Single Most Prominent Element) */}
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

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-[#E8D8C3] bg-[#FFFDF9] px-4 py-4 lg:hidden max-h-[85vh] overflow-y-auto space-y-4">
            {/* Primary Mobile CTA */}
            <Link
              href="/consult"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl bg-[#7B2D26] px-4 py-3 text-sm font-bold text-[#FBF3E7] shadow-sm"
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

            {/* Core Daily Vedic Links */}
            <div className="grid grid-cols-2 gap-2">
              <Link
                href={panchangHref}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] px-3.5 py-2.5 text-xs font-bold text-[#7B2D26]"
              >
                {isHi ? "दैनिक पंचांग" : "Daily Panchang"}
              </Link>
              <Link
                href={horoscopeHref}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] px-3.5 py-2.5 text-xs font-bold text-[#7B2D26]"
              >
                {isHi ? "दैनिक राशिफल" : "Daily Horoscope"}
              </Link>
            </div>

            {/* Kundli & Tools Group */}
            <div>
              <div className="px-1 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-[#6E5545]">
                {isHi ? "कुंडली एवं गणना" : "Kundli & Calculators"}
              </div>
              <div className="space-y-1">
                {kundliToolsItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-bold text-[#3B2A1E] hover:bg-[#FBF3E7]"
                    >
                      <Icon className="h-4 w-4 text-[#7B2D26]" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Services & Explore Group */}
            <div>
              <div className="px-1 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-[#6E5545]">
                {isHi ? "सेवाएँ एवं ज्ञान" : "Services & Explore"}
              </div>
              <div className="space-y-1">
                {exploreItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-bold text-[#3B2A1E] hover:bg-[#FBF3E7]"
                    >
                      <Icon className="h-4 w-4 text-[#7B2D26]" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

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
