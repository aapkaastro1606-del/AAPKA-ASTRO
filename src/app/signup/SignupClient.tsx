"use client";

import React from "react";
import { SignUp } from "@clerk/nextjs";
import { MandalaDivider } from "@/components/ui/MandalaDivider";
import { ShieldCheck, Gift, Sparkles } from "lucide-react";

export function SignupClient() {
  return (
    <div className="min-h-[85vh] bg-[#FBF3E7] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-body">
      <div className="w-full max-w-md">
        {/* Sacred Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7B2D26] text-[#E8A33D] font-temple text-2xl shadow-sm mb-3">
            ॐ
          </div>
          <h1 className="font-temple text-2xl sm:text-3xl font-bold text-[#7B2D26]">
            Begin Your Sacred Journey
          </h1>
          <p className="mt-2 text-xs text-[#6E5545]">
            Create your account for personalized Janam Kundli charts &amp; live consultations
          </p>
          <div className="flex justify-center my-3">
            <MandalaDivider className="w-24 text-[#C1662F]" />
          </div>
        </div>

        {/* Welcome Offer Banner */}
        <div className="mb-6 rounded-2xl border border-[#E8A33D] bg-[#E8A33D]/10 p-3.5 text-center text-xs text-[#7B2D26] font-medium flex items-center justify-center gap-2">
          <Gift className="h-4 w-4 text-[#C1662F] shrink-0" />
          <span>
            <strong>First Consultation Offer:</strong> 50% discount automatically applied to your first session!
          </span>
        </div>

        {/* Clerk Sign-Up Component Container */}
        <div className="flex justify-center min-h-[460px] items-center">
          <SignUp
            routing="path"
            path="/signup"
            signInUrl="/login"
            forceRedirectUrl="/account"
            fallbackRedirectUrl="/account"
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
        </div>

        {/* Reassurance Features */}
        <div className="mt-8 grid grid-cols-2 gap-3 text-center text-xs text-[#6E5545]">
          <div className="rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] p-3 shadow-xs">
            <div className="flex justify-center mb-1">
              <Sparkles className="h-4 w-4 text-[#E8A33D]" />
            </div>
            <p className="font-bold text-[#7B2D26]">Zero SMS Spam</p>
            <p className="text-[10px] text-[#6E5545] mt-0.5">Direct Google / Email login</p>
          </div>
          <div className="rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] p-3 shadow-xs">
            <div className="flex justify-center mb-1">
              <ShieldCheck className="h-4 w-4 text-[#6B8E5A]" />
            </div>
            <p className="font-bold text-[#7B2D26]">100% Confidential</p>
            <p className="text-[10px] text-[#6E5545] mt-0.5">End-to-end private readings</p>
          </div>
        </div>
      </div>
    </div>
  );
}
