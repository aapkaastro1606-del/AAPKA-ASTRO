"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SignIn, useAuth } from "@clerk/nextjs";
import { MandalaDivider } from "@/components/ui/MandalaDivider";
import { ShieldCheck, CheckCircle2, Lock, Loader2, ArrowRight } from "lucide-react";

function getSafeRedirectUrl(rawUrl: string | null): string {
  if (!rawUrl) return "/account";
  try {
    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
      const parsed = new URL(rawUrl);
      if (
        parsed.hostname === "aapkaastro.com" ||
        parsed.hostname === "www.aapkaastro.com" ||
        parsed.hostname === "localhost" ||
        parsed.hostname.endsWith(".aapkaastro.com")
      ) {
        return parsed.pathname + parsed.search + parsed.hash;
      }
      return "/account";
    }
    if (rawUrl.startsWith("/")) {
      return rawUrl;
    }
  } catch {
    // fallback
  }
  return "/account";
}

export function LoginClient() {
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect_url");
  const targetUrl = getSafeRedirectUrl(rawRedirect);

  const { isSignedIn, isLoaded } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const timer = setTimeout(() => {
        window.location.replace(targetUrl);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, isSignedIn, targetUrl]);

  return (
    <div className="min-h-[85vh] bg-[#FBF3E7] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Sacred Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7B2D26] text-[#E8A33D] font-temple text-2xl shadow-sm mb-3">
            ॐ
          </div>
          <h1 className="font-temple text-2xl sm:text-3xl font-bold text-[#7B2D26]">
            Seeker Sanctuary Sign-In
          </h1>
          <p className="mt-2 text-xs text-[#6E5545]">
            Access your sacred Vedic consultations &amp; Janam Kundli records
          </p>
          <div className="flex justify-center my-3">
            <MandalaDivider className="w-24 text-[#C1662F]" />
          </div>
        </div>

        {/* Clerk Sign-In Component Container */}
        <div className="flex justify-center min-h-[420px] items-center">
          {!mounted || !isLoaded ? (
            <div className="flex flex-col items-center justify-center p-8 text-[#7B2D26] space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#C1662F]" />
              <span className="text-xs font-semibold text-[#6E5545]">
                Connecting to Seeker Sanctuary...
              </span>
            </div>
          ) : isSignedIn ? (
            <div className="flex flex-col items-center justify-center p-8 text-[#7B2D26] space-y-4 text-center bg-[#FFFDF9] rounded-2xl border border-[#E8D8C3] shadow-sm w-full">
              <Loader2 className="h-8 w-8 animate-spin text-[#6B8E5A]" />
              <div>
                <span className="text-base font-bold text-[#7B2D26] block">
                  Signed In Successfully
                </span>
                <span className="text-xs text-[#6E5545] mt-1 block">
                  Redirecting to your account dashboard...
                </span>
              </div>
              <a
                href={targetUrl}
                className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#7B2D26] hover:bg-[#64221C] text-[#FFFDF9] px-5 py-2.5 text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <span>Proceed to {targetUrl.includes("consult") ? "My Bookings" : targetUrl.includes("admin") ? "Admin Panel" : "Account"}</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          ) : (
            <SignIn
              routing="path"
              path="/login"
              signUpUrl="/signup"
              forceRedirectUrl={targetUrl}
              fallbackRedirectUrl={targetUrl}
              appearance={{
                variables: {
                  colorPrimary: "#7B2D26",
                  colorForeground: "#3B2A1E",
                  colorBackground: "#FFFDF9",
                  borderRadius: "0.75rem",
                },
                elements: {
                  rootBox: "w-full",
                  card: "border border-[#E8D8C3] shadow-xl bg-[#FFFDF9] rounded-2xl w-full",
                  formButtonPrimary:
                    "bg-[#7B2D26] hover:bg-[#64221C] text-[#FBF3E7] font-bold text-sm shadow-sm py-2.5",
                  socialButtonsBlockButton:
                    "border border-[#E8D8C3] bg-[#FFFDF9] hover:bg-[#FBF3E7] text-[#3B2A1E] font-medium py-2",
                  headerTitle: "font-temple text-[#7B2D26] text-xl font-bold",
                  headerSubtitle: "text-xs text-[#6E5545]",
                  footerActionLink: "text-[#7B2D26] hover:text-[#64221C] font-bold",
                },
              }}
            />
          )}
        </div>

        {/* Sacred Trust Guarantee Footnote */}
        <div className="mt-8 rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9]/80 p-4 text-xs text-[#6E5545]">
          <div className="flex items-center gap-2 font-bold text-[#7B2D26] mb-2">
            <ShieldCheck className="h-4 w-4" />
            <span>Sacred Seeker Guarantee</span>
          </div>
          <ul className="space-y-1.5 text-[11px]">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#6B8E5A] shrink-0" />
              <span>Sign in seamlessly via Google or your verified email</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#6B8E5A] shrink-0" />
              <span>Unified Single Sign-On across Aapka Astro, Viar &amp; DOW</span>
            </li>
            <li className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-[#C1662F] shrink-0" />
              <span>Birth details and astrological charts remain strictly confidential</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
