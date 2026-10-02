"use client";

import React from "react";
import Link from "next/link";
import { Lock, Award, Heart, Phone, Mail, MapPin, ShieldCheck, GraduationCap, ExternalLink } from "lucide-react";
import { MandalaDivider } from "@/components/ui/MandalaDivider";
import { PLACEHOLDER_ASTROLOGER, PLACEHOLDER_SOCIAL_LINKS, PLACEHOLDER_CONTACT_INFO } from "@/config/placeholderContent";

// Social Icons as direct SVG components
const InstagramIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-4" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const YoutubeIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-4" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <polygon points="10 15 15 12 10 9 10 15" />
  </svg>
);

const FacebookIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-4" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#E8D8C3] bg-[#7B2D26] text-[#FBF3E7] text-xs">
      {/* Trust Marks Banner: Tailored for Solo Practitioner */}
      {/* PLACEHOLDER: replace with real content */}
      <div className="border-b border-[#FBF3E7]/15 bg-[#64221C] py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <Award className="h-6 w-6 text-[#E8A33D] mb-1.5" />
              <span className="font-temple font-bold text-[#FBF3E7]">Certified Vedic Astrologer</span>
              <span className="text-[11px] text-[#FBF3E7]/70">Bhartiya Vidya Bhawan &bull; 20+ Yrs</span>
            </div>
            <div className="flex flex-col items-center">
              <Lock className="h-6 w-6 text-[#E8A33D] mb-1.5" />
              <span className="font-temple font-bold text-[#FBF3E7]">100% Confidential Consultations</span>
              <span className="text-[11px] text-[#FBF3E7]/70">Strict Privacy &bull; Direct With Acharya Ji</span>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck className="h-6 w-6 text-[#E8A33D] mb-1.5" />
              <span className="font-temple font-bold text-[#FBF3E7]">Secure Payments via Razorpay</span>
              <span className="text-[11px] text-[#FBF3E7]/70">256-Bit SSL &bull; UPI, Cards, NetBanking</span>
            </div>
            <div className="flex flex-col items-center">
              <Heart className="h-6 w-6 text-[#E8A33D] mb-1.5" />
              <span className="font-temple font-bold text-[#FBF3E7]">15,000+ Natal Charts Analyzed</span>
              <span className="text-[11px] text-[#FBF3E7]/70">Across 32 Countries &bull; Zero Gimmicks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ecosystem Cross-Promotion Banner: Our Other Services (Viar.in Academy) */}
      <div className="border-b border-[#FBF3E7]/15 bg-[#541B16] py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8A33D]/20 text-[#E8A33D] border border-[#E8A33D]/40 font-temple">
                Ecosystem &amp; Lineage
              </span>
              <span className="text-xs text-[#FBF3E7]/70 font-semibold font-temple">Our Other Services</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#FFFDF9] font-temple">
              Want to Learn Vedic Astrology Yourself? Explore Viar.in Academy
            </h3>
            <p className="text-xs text-[#FBF3E7]/80 mt-1 max-w-2xl font-body">
              Looking to study classical Jyotish, understand chart synthesis, and earn verifiable certifications?
              Join live interactive cohorts taught personally by Acharya Niraj Kumar at Vihangam Institute of Astrology and Research (Viar.in).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="https://viar.in"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#E8A33D] hover:bg-[#D5912C] text-[#3B2A1E] inline-flex items-center gap-2 transition-all shadow-md"
            >
              <GraduationCap className="w-4 h-4 text-[#7B2D26]" />
              <span>Visit Viar.in Academy</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#3B2A1E]" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Col 1: Brand Info & Social Row */}
          <div className="space-y-3 md:col-span-2">
            <Link href="/" className="inline-block rounded-xl bg-[#FFFDF9] px-3.5 py-2 border border-[#E8A33D]/30 shadow-sm hover:shadow-md transition-shadow">
              <img
                src="/images/logo.png"
                alt="Aapka Astro - Aligning Your Destiny"
                className="h-10 sm:h-11 w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-[#FBF3E7]/90 font-semibold font-temple">
              {PLACEHOLDER_ASTROLOGER.tagline}
            </p>
            <p className="text-xs text-[#FBF3E7]/80 leading-relaxed font-body">
              India&apos;s sacred sanctuary for authentic Vedic astrology, Janampatri analysis, and non-demolition Devta &amp; Energy Vastu Shastra. Consultations conducted personally by {PLACEHOLDER_ASTROLOGER.displayName}.
            </p>

            {/* Social Links Row */}
            <div className="pt-2">
              <div className="text-[11px] font-bold text-[#E8A33D] uppercase tracking-wider mb-2 font-temple">
                Connect With Acharya Ji
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={PLACEHOLDER_SOCIAL_LINKS.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram (@aapkaastrologer)"
                  title="Follow on Instagram @aapkaastrologer"
                  className="rounded-lg bg-[#64221C] p-2 text-[#FBF3E7] hover:bg-[#E8A33D] hover:text-[#3B2A1E] transition-colors"
                >
                  <InstagramIcon className="h-4 w-4" />
                </a>
                <a
                  href={PLACEHOLDER_SOCIAL_LINKS.youtube.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube (@aapkaastro7900)"
                  title="Watch Vedic Discourses on YouTube @aapkaastro7900"
                  className="rounded-lg bg-[#64221C] p-2 text-[#FBF3E7] hover:bg-[#E8A33D] hover:text-[#3B2A1E] transition-colors"
                >
                  <YoutubeIcon className="h-4 w-4" />
                </a>
                <a
                  href={PLACEHOLDER_SOCIAL_LINKS.facebook.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook (@aapkaastro)"
                  title="Connect on Facebook @aapkaastro"
                  className="rounded-lg bg-[#64221C] p-2 text-[#FBF3E7] hover:bg-[#E8A33D] hover:text-[#3B2A1E] transition-colors"
                >
                  <FacebookIcon className="h-4 w-4" />
                </a>
              </div>
              <div className="text-[10px] text-[#FBF3E7]/50 mt-1 italic">
                Official handles: Instagram ({PLACEHOLDER_SOCIAL_LINKS.instagram.handle}) &bull; YouTube ({PLACEHOLDER_SOCIAL_LINKS.youtube.handle}) &bull; Facebook ({PLACEHOLDER_SOCIAL_LINKS.facebook.handle})
              </div>
            </div>
          </div>

          {/* Col 2: Free Calculators & Tools */}
          <div>
            <h4 className="font-temple text-xs font-bold uppercase tracking-wider text-[#E8A33D] mb-3">
              Free Calculators &amp; Hubs
            </h4>
            <ul className="space-y-1.5 text-[#FBF3E7]/80 text-[11px]">
              <li>
                <Link href="/kundli-generator" className="hover:text-[#E8A33D] transition-colors">
                  Janam Kundli Generator
                </Link>
              </li>
              <li>
                <Link href="/kundli-matching" className="hover:text-[#E8A33D] transition-colors">
                  Kundli Milan (36 Guna)
                </Link>
              </li>
              <li>
                <Link href="/love-calculator" className="hover:text-[#E8A33D] transition-colors">
                  Love &amp; Compatibility
                </Link>
              </li>
              <li>
                <Link href="/flames-calculator" className="hover:text-[#E8A33D] transition-colors">
                  FLAMES Calculator
                </Link>
              </li>
              <li>
                <Link href="/moon-sign-calculator" className="hover:text-[#E8A33D] transition-colors">
                  Moon Sign (चन्द्र राशि)
                </Link>
              </li>
              <li>
                <Link href="/sun-sign-calculator" className="hover:text-[#E8A33D] transition-colors">
                  Sun Sign (Surya Rashi)
                </Link>
              </li>
              <li>
                <Link href="/numerology-calculator" className="hover:text-[#E8A33D] transition-colors">
                  Numerology (Bhagyank)
                </Link>
              </li>
              <li>
                <Link href="/zodiac-signs" className="hover:text-[#E8A33D] transition-colors font-medium text-[#E8A33D]/90">
                  12 Zodiac Signs Guide
                </Link>
              </li>
              <li>
                <Link href="/festivals" className="hover:text-[#E8A33D] transition-colors font-medium text-[#E8A33D]/90">
                  Hindu Festival Calendar
                </Link>
              </li>
              <li>
                <Link href="/panchang" className="hover:text-[#E8A33D] transition-colors">
                  Daily Vedic Panchang
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Company & Trust (Prominently Styled with Large, Legible Direct Links) */}
          <div className="rounded-2xl border border-[#FBF3E7]/15 bg-[#64221C]/60 p-4 shadow-sm">
            <h4 className="font-temple text-xs sm:text-sm font-bold uppercase tracking-wider text-[#E8A33D] mb-3 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#E8A33D]" />
              <span>Company &amp; Trust</span>
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/about"
                  className="group flex items-center gap-2 text-xs sm:text-[13px] font-bold text-[#FFFDF9] hover:text-[#E8A33D] transition-colors"
                >
                  <span className="text-[#E8A33D] font-bold group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                  <span>About Us (Acharya Ji Bio)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="group flex items-center gap-2 text-xs sm:text-[13px] font-bold text-[#FFFDF9] hover:text-[#E8A33D] transition-colors"
                >
                  <span className="text-[#E8A33D] font-bold group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                  <span>Contact Us (Office &amp; Help)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="group flex items-center gap-2 text-xs sm:text-[13px] font-bold text-[#FFFDF9] hover:text-[#E8A33D] transition-colors"
                >
                  <span className="text-[#E8A33D] font-bold group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                  <span>Terms of Service</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="group flex items-center gap-2 text-xs sm:text-[13px] font-bold text-[#FFFDF9] hover:text-[#E8A33D] transition-colors"
                >
                  <span className="text-[#E8A33D] font-bold group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                  <span>Privacy &amp; Data Protection</span>
                </Link>
              </li>
              <li>
                <a
                  href="https://viar.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 text-xs sm:text-[13px] font-bold text-[#E8A33D] hover:text-[#FFFDF9] transition-colors"
                >
                  <span className="text-[#E8A33D] font-bold group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                  <span>Viar.in (Astrology Academy)</span>
                  <ExternalLink className="h-3 w-3 text-[#E8A33D]" />
                </a>
              </li>
              <li className="pt-1.5 border-t border-[#FBF3E7]/15">
                <Link href="/pricing-policy" className="text-xs text-[#FBF3E7]/85 hover:text-[#E8A33D] transition-colors pl-3.5 block">
                  Transparent Pricing Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-xs text-[#FBF3E7]/85 hover:text-[#E8A33D] transition-colors pl-3.5 block">
                  Refund &amp; Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/testimonials" className="text-xs text-[#FBF3E7]/85 hover:text-[#E8A33D] transition-colors pl-3.5 block">
                  Verified Seeker Testimonials
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="text-xs text-[#FBF3E7]/85 hover:text-[#E8A33D] transition-colors pl-3.5 block">
                  Astrology &amp; Vastu Disclaimer
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Office */}
          <div>
            <h4 className="font-temple text-xs font-bold uppercase tracking-wider text-[#E8A33D] mb-3">
              Contact &amp; Office
            </h4>
            <ul className="space-y-2.5 text-[#FBF3E7]/80 text-[11px]">
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-[#E8A33D]" />
                <a href={`tel:${PLACEHOLDER_CONTACT_INFO.phoneRaw}`} className="hover:text-[#E8A33D] transition-colors font-medium">
                  {PLACEHOLDER_CONTACT_INFO.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-[#E8A33D]" />
                <a href={`mailto:${PLACEHOLDER_CONTACT_INFO.email}`} className="hover:text-[#E8A33D] transition-colors font-medium">
                  {PLACEHOLDER_CONTACT_INFO.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#E8A33D] mt-0.5 shrink-0" />
                <span>{PLACEHOLDER_CONTACT_INFO.sanctumCity}</span>
              </li>
            </ul>

            <div className="mt-3.5">
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#E8A33D] hover:bg-[#D4922F] text-[#3B2A1E] px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm hover:shadow-md"
              >
                <span>Open Contact &amp; Help Desk</span>
                <span className="font-bold">&rarr;</span>
              </Link>
            </div>

            <div className="mt-4 rounded-lg border border-[#FBF3E7]/15 bg-[#64221C] p-2.5">
              <div className="text-[10px] text-[#FBF3E7]/70">Secure Payment Gateways:</div>
              <div className="mt-1 flex flex-wrap gap-1 font-mono text-[9px] font-bold text-[#FBF3E7]">
                <span className="rounded bg-[#7B2D26] px-1.5 py-0.5">Razorpay</span>
                <span className="rounded bg-[#7B2D26] px-1.5 py-0.5">UPI</span>
                <span className="rounded bg-[#7B2D26] px-1.5 py-0.5">GPay</span>
                <span className="rounded bg-[#7B2D26] px-1.5 py-0.5">PhonePe</span>
                <span className="rounded bg-[#7B2D26] px-1.5 py-0.5">Cards</span>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle Mandala Divider */}
        <MandalaDivider className="my-8 opacity-40" />

        {/* Copyright & Bottom Legal Bar */}
        <div className="text-xs text-[#FBF3E7]/80 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-[#FBF3E7]/10 pt-4">
          <p>
            &copy; {new Date().getFullYear()} Aapka Astro (aapkaastro.com). Preserving authentic Vedic Jyotish &amp; Vastu traditions with complete confidentiality.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 font-medium">
            <Link href="/about" className="hover:text-[#E8A33D] text-[#FFFDF9] font-bold underline underline-offset-4">About Us</Link>
            <span className="text-[#E8A33D]">&bull;</span>
            <Link href="/contact" className="hover:text-[#E8A33D] text-[#FFFDF9] font-bold underline underline-offset-4">Contact Us</Link>
            <span className="text-[#E8A33D]">&bull;</span>
            <Link href="/terms" className="hover:text-[#E8A33D] text-[#FFFDF9] font-bold underline underline-offset-4">Terms of Service</Link>
            <span className="text-[#E8A33D]">&bull;</span>
            <Link href="/privacy-policy" className="hover:text-[#E8A33D] text-[#FFFDF9] font-bold underline underline-offset-4">Privacy Policy</Link>
            <span className="text-[#E8A33D]">&bull;</span>
            <a
              href="https://viar.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#E8A33D] text-[#E8A33D] font-bold underline underline-offset-4 inline-flex items-center gap-1"
            >
              <span>Viar.in Academy</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
            <span>&bull;</span>
            <Link href="/pricing-policy" className="hover:text-[#E8A33D] text-[#FBF3E7]/80">Pricing Policy</Link>
            <span>&bull;</span>
            <Link href="/refund-policy" className="hover:text-[#E8A33D] text-[#FBF3E7]/80">Refund Policy</Link>
            <span>&bull;</span>
            <Link href="/disclaimer" className="hover:text-[#E8A33D] text-[#FBF3E7]/80">Disclaimer</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
