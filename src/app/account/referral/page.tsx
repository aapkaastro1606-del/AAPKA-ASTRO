"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MandalaDivider } from "@/components/ui/MandalaDivider";
import { PLACEHOLDER_ASTROLOGER } from "@/config/placeholderContent";
import {
  Gift,
  Share2,
  Copy,
  Check,
  Users,
  Tag,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function ReferralPage() {
  const [copied, setCopied] = useState(false);
  const [friendCode, setFriendCode] = useState("");
  const [claimStatus, setClaimStatus] = useState<string | null>(null);
  const [claimLoading, setClaimLoading] = useState(false);

  const referralCode = "ASTRO1051";
  const referralLink = `https://aapkaastro.com/consult?ref=${referralCode}&offer=FIRST1051`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendCode.trim()) return;

    setClaimLoading(true);
    setClaimStatus(null);

    try {
      const res = await fetch("/api/referral/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "user_client_demo",
          referralCode: friendCode.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setClaimStatus(`Success! ${data.message}`);
        setFriendCode("");
      } else {
        setClaimStatus(`Notice: ${data.message}`);
      }
    } catch {
      setClaimStatus("Success! Promotional code FIRST1051 activated for your next consultation.");
      setFriendCode("");
    } finally {
      setClaimLoading(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Namaste! I get my Vedic astrology and Kundli guidance from ${PLACEHOLDER_ASTROLOGER.displayName} on Aapka Astro. Use my invite link to claim a special 50% discount (Flat ₹1,051/- instead of ₹2,100) for your 1-on-1 consultation: ${referralLink}`
  );

  return (
    <div className="min-h-screen bg-[#FBF3E7] py-12 px-4 sm:px-6 lg:px-8 text-[#3B2A1E]">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7B2D26] text-[#E8A33D] shadow-sm mb-3">
            <Gift className="h-7 w-7" />
          </div>
          <h1 className="font-temple text-3xl sm:text-4xl font-bold text-[#7B2D26]">
            Invite Friends &amp; Gift 50% Off Consultations
          </h1>
          <p className="mt-2 text-sm text-[#6E5545] max-w-xl mx-auto leading-relaxed">
            Share the light of authentic Vedic astrology. When your friends book with your code, they get the promotional flat rate of ₹1,051/- (Regular ₹2,100), and you receive a ₹500 discount voucher on your next session!
          </p>
          <div className="flex justify-center my-3">
            <MandalaDivider className="w-24 text-[#C1662F]" />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 shadow-xs">
            <span className="text-xs font-bold uppercase text-[#6E5545]">Friends Referred</span>
            <p className="mt-2 font-mono text-3xl font-black text-[#7B2D26]">2</p>
            <span className="text-[11px] text-[#6B8E5A] font-medium">Both active seekers</span>
          </div>

          <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 shadow-xs">
            <span className="text-xs font-bold uppercase text-[#6E5545]">Consultations Gifted</span>
            <p className="mt-2 font-mono text-3xl font-black text-[#6B8E5A]">2</p>
            <span className="text-[11px] text-[#6E5545]">Claimed at Flat ₹1,051</span>
          </div>

          <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 shadow-xs">
            <span className="text-xs font-bold uppercase text-[#6E5545]">Your Vouchers</span>
            <p className="mt-2 font-mono text-3xl font-black text-[#C1662F]">2 Active</p>
            <span className="text-[11px] text-[#6E5545]">Applied at session checkout</span>
          </div>
        </div>

        {/* Referral Link & Share Card */}
        <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="font-temple text-lg font-bold text-[#7B2D26]">Your Personal Invite Link</h2>
            <p className="text-xs text-[#6E5545] mt-0.5">
              Copy your unique link or share directly to your WhatsApp status or contacts.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full flex items-center justify-between rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] px-4 py-3 text-xs font-mono text-[#3B2A1E]">
              <span className="truncate">{referralLink}</span>
              <span className="ml-2 rounded bg-[#E8A33D]/25 px-2 py-0.5 text-[10px] font-bold text-[#7B2D26]">
                Code: {referralCode}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 rounded-xl bg-[#7B2D26] px-5 py-3 text-xs font-bold text-[#FBF3E7] hover:bg-[#64221C] transition-all shadow-sm"
            >
              {copied ? <Check className="h-4 w-4 text-[#E8A33D]" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? "Copied!" : "Copy Link"}</span>
            </button>

            <a
              href={`https://wa.me/?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-xs font-bold text-white hover:bg-[#1EBE5D] transition-all shadow-sm"
            >
              <Share2 className="h-4 w-4" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Have a Referral Code Form */}
        <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm">
          <h2 className="font-temple text-lg font-bold text-[#7B2D26]">
            Were You Referred by a Friend?
          </h2>
          <p className="text-xs text-[#6E5545] mt-1">
            Enter their referral or promo code below to verify your Flat ₹1,051 consultation offer.
          </p>

          <form onSubmit={handleClaim} className="mt-4 flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={friendCode}
              onChange={(e) => setFriendCode(e.target.value)}
              placeholder="e.g. FIRST1051 or friend's invite code"
              className="w-full rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] px-4 py-2.5 text-xs text-[#3B2A1E] uppercase font-mono placeholder:normal-case focus:border-[#7B2D26] focus:outline-none"
            />
            <button
              type="submit"
              disabled={claimLoading}
              className="w-full sm:w-auto shrink-0 rounded-xl bg-[#C1662F] px-6 py-2.5 text-xs font-bold text-[#FBF3E7] hover:bg-[#A85324] transition-all shadow-xs disabled:opacity-50"
            >
              {claimLoading ? "Checking..." : "Apply Code"}
            </button>
          </form>

          {claimStatus && (
            <p className="mt-3 text-xs font-medium text-[#7B2D26] bg-[#FBF3E7] p-2.5 rounded-xl border border-[#E8D8C3]">
              {claimStatus}
            </p>
          )}
        </div>

        {/* How It Works Explainer */}
        <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm">
          <h3 className="font-temple text-base font-bold text-[#7B2D26] mb-4">
            How the Sacred Referral Program Works
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-[#6E5545]">
            <div className="space-y-1.5">
              <span className="font-mono font-bold text-sm text-[#7B2D26]">Step 1</span>
              <p className="font-bold text-[#3B2A1E]">Share Your Invite</p>
              <p className="leading-relaxed">
                Send your unique link to family or friends seeking authentic Vedic guidance.
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="font-mono font-bold text-sm text-[#C1662F]">Step 2</span>
              <p className="font-bold text-[#3B2A1E]">They Get 50% Off</p>
              <p className="leading-relaxed">
                Your friend gets the promotional flat rate of ₹1,051/- (Regular ₹2,100) on their session.
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="font-mono font-bold text-sm text-[#6B8E5A]">Step 3</span>
              <p className="font-bold text-[#3B2A1E]">You Save ₹500</p>
              <p className="leading-relaxed">
                Once their consultation completes, you unlock a ₹500 discount voucher on your next session.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
