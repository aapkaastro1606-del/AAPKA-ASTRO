"use client";

import React, { useState, useEffect } from "react";
import { SignIn, useAuth, useClerk } from "@clerk/nextjs";
import { MandalaDivider } from "@/components/ui/MandalaDivider";
import { ShieldCheck, CheckCircle2, Lock, Loader2, AlertTriangle, LogOut } from "lucide-react";

export function LoginClient({
  targetUrl,
  serverSessionValid,
}: {
  targetUrl: string;
  serverSessionValid: boolean;
}) {
  const { isSignedIn, isLoaded } = useAuth();
  const { signOut } = useClerk();
  const [mounted, setMounted] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Log diagnostic event when browser holds a session but server does not recognize it
  useEffect(() => {
    if (isLoaded && isSignedIn && !serverSessionValid) {
      fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "SESSION_SYNC_MISMATCH",
          targetUrl,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {});
    }
  }, [isLoaded, isSignedIn, serverSessionValid, targetUrl]);

  const handleSignOutAndRetry = async () => {
    try {
      setSigningOut(true);
      await signOut();
      const canonicalHost =
        typeof window !== "undefined" && window.location.hostname === "aapkaastro.com"
          ? "https://www.aapkaastro.com"
          : "";
      window.location.href = `${canonicalHost}/login?redirect_url=${encodeURIComponent(targetUrl)}`;
    } catch {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#FBF3E7] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-body">
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

        {/* Content Container */}
        <div className="flex justify-center min-h-[420px] items-center">
          {!mounted || !isLoaded ? (
            <div className="flex flex-col items-center justify-center p-8 text-[#7B2D26] space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#C1662F]" />
              <span className="text-xs font-semibold text-[#6E5545]">
                Connecting to Seeker Sanctuary...
              </span>
            </div>
          ) : isSignedIn && !serverSessionValid ? (
            /* Browser says signed in, but server session is not recognized.
               Show clear message with "Sign out and try again" button. Never loop! */
            <div className="flex flex-col items-center justify-center p-8 bg-[#FFFDF9] rounded-2xl border-2 border-amber-300 shadow-md w-full text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#7B2D26] font-temple">
                  Session Out of Sync
                </h3>
                <p className="text-xs text-[#6E5545] mt-1.5 leading-relaxed">
                  Your browser holds an existing session, but our server could not verify it with our security provider.
                  This happens if cookies are blocked, expired, or running across environments.
                </p>
              </div>

              <button
                onClick={handleSignOutAndRetry}
                disabled={signingOut}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#7B2D26] hover:bg-[#64221C] text-[#FFFDF9] px-6 py-2.5 text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-75"
              >
                {signingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#E8A33D]" />
                ) : (
                  <LogOut className="h-4 w-4 text-[#E8A33D]" />
                )}
                <span>{signingOut ? "Signing Out..." : "Sign out and try again"}</span>
              </button>
            </div>
          ) : (
            /* Standard Clerk SignIn flow styled with site's theme */
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
              <Lock className="h-3.5 w-3.5 text-[#C1662F] shrink-0" />
              <span>Birth details and astrological charts remain strictly confidential</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
