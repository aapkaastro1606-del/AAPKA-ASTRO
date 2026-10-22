"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@/components/auth/ClerkAuthWrapper";
import { PLACEHOLDER_ASTROLOGER } from "@/config/placeholderContent";
import { MandalaDivider } from "@/components/ui/MandalaDivider";
import { DiyaIcon } from "@/components/ui/DiyaIcon";
import {
  Star,
  ArrowLeft,
  Send,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export interface ReviewItem {
  id: string;
  clientName: string;
  service: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function AccountReviewsPage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [pastReviews, setPastReviews] = useState<ReviewItem[]>([]);
  const [completedConsultations, setCompletedConsultations] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [service, setService] = useState("Voice Call Consultation");
  const [comment, setComment] = useState("");
  const [consentPublic, setConsentPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isUserLoaded && !user) {
      window.location.replace("/login?redirect_url=/account/reviews");
    }
  }, [isUserLoaded, user]);

  const loadData = async () => {
    setLoadingData(true);
    setLoadError(null);
    try {
      // 1. Fetch user's completed consultations from DB
      const accountRes = await fetch("/api/account/data");
      const accountData = await accountRes.json();
      if (accountRes.ok && accountData.success) {
        const consults = (accountData.consultations || []).filter(
          (c: any) => c.status === "COMPLETED" || c.status === "CONFIRMED" || c.status === "SCHEDULED"
        );
        setCompletedConsultations(consults);
        if (consults.length > 0) {
          setSelectedSessionId(consults[0].id || consults[0].bookingId);
        }
      }

      // 2. Fetch reviews from PostgreSQL
      const reviewsRes = await fetch("/api/reviews");
      const reviewsData = await reviewsRes.json();
      if (reviewsRes.ok && reviewsData.success) {
        setPastReviews(reviewsData.reviews || []);
      }
    } catch (err: any) {
      setLoadError("Could not load consultation records and reviews. Please retry.");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const reviewerName = user?.fullName || user?.firstName || "Seeker";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    if (!selectedSessionId && completedConsultations.length === 0) {
      setSubmitError("A verified completed consultation is required before leaving a review.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: reviewerName,
          service,
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit review.");
      }

      setSubmitted(true);
      setComment("");
      // Refresh reviews list from server
      loadData();
    } catch (err: any) {
      setSubmitError(err.message || "Network error. Failed to record review in database.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FBF3E7] text-[#3B2A1E] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div>
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7B2D26] hover:underline mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Account Dashboard</span>
          </Link>

          <h1 className="font-temple text-2xl sm:text-3xl font-bold text-[#7B2D26]">
            Session Reviews &amp; Testimonials
          </h1>
          <p className="text-xs sm:text-sm text-[#6E5545] mt-1">
            Share your consultation feedback. Honest reflections guide fellow seekers on their spiritual path.
          </p>
        </div>

        {loadError && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-xs text-red-700 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span>{loadError}</span>
            </div>
            <button
              onClick={loadData}
              className="inline-flex items-center gap-1 font-bold text-red-800 underline hover:no-underline"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
          </div>
        )}

        {/* Review Form Card */}
        <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-8 sm:p-10 shadow-sm">
          {submitted ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="h-12 w-12 text-[#6B8E5A] mx-auto" />
              <h3 className="font-temple text-xl font-bold text-[#2A4720]">
                Thank You for Your Sacred Feedback!
              </h3>
              <p className="text-xs sm:text-sm text-[#4F6D40] max-w-md mx-auto">
                Your review has been securely saved to the database. It brings great joy to {PLACEHOLDER_ASTROLOGER.displayName} and assists others seeking authentic guidance.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-4 text-xs font-bold text-[#7B2D26] underline"
              >
                Submit another review
              </button>
            </div>
          ) : loadingData ? (
            <div className="text-center py-12 text-xs font-semibold text-[#6E5545]">
              Loading verified consultations ledger...
            </div>
          ) : completedConsultations.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <div className="h-14 w-14 rounded-full bg-[#FAF1E4] text-[#7B2D26] border border-[#E8D8C3] mx-auto flex items-center justify-center">
                <ShieldCheck className="h-7 w-7 text-[#7B2D26]" />
              </div>
              <h3 className="font-temple text-xl font-bold text-[#7B2D26]">
                Verified Consultation Required to Leave a Review
              </h3>
              <p className="text-xs sm:text-sm text-[#6E5545] max-w-lg mx-auto leading-relaxed">
                To uphold the sacred integrity of our reviews and ensure 100% genuine feedback for all spiritual seekers, reviews can only be submitted after completing a live consultation session with {PLACEHOLDER_ASTROLOGER.displayName}.
              </p>
              <div className="pt-2">
                <Link
                  href="/consult"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#7B2D26] px-6 py-3 text-xs font-bold text-white hover:bg-[#64231D] shadow-md transition-all"
                >
                  <span>Start Your First Consultation (50% Off)</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {submitError && (
                <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-700">
                  {submitError}
                </div>
              )}

              {/* Verified Session Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#C1662F] mb-1">
                  Select Verified Completed Session *
                </label>
                <select
                  value={selectedSessionId}
                  onChange={(e) => {
                    setSelectedSessionId(e.target.value);
                    const matched = completedConsultations.find((c: any) => (c.id || c.bookingId) === e.target.value);
                    if (matched) setService(matched.format || matched.mode || "Astro Consultation");
                  }}
                  className="w-full rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] p-3 text-xs font-semibold text-[#3B2A1E] focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                >
                  {completedConsultations.map((c: any) => (
                    <option key={c.id || c.bookingId} value={c.id || c.bookingId}>
                      {c.bookingId || c.id} • {c.format || c.mode || "Astro Consultation"} — Topic: &ldquo;{c.topic || c.concern || "Vedic Guidance"}&rdquo;
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-[#6B8E5A] font-semibold flex items-center gap-1 mt-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#6B8E5A]" />
                  <span>Verified session from your Aapka Astro database ledger</span>
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#C1662F] mb-2">
                  Rate Your Experience with {PLACEHOLDER_ASTROLOGER.displayName}
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          (hoverRating || rating) >= star
                            ? "fill-[#E8A33D] text-[#E8A33D]"
                            : "text-[#E8D8C3]"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-3 font-temple text-sm font-bold text-[#7B2D26]">
                    {rating === 5 && "Exceptional Vedic Clarity"}
                    {rating === 4 && "Very Insightful & Helpful"}
                    {rating === 3 && "Satisfactory"}
                    {rating === 2 && "Needs Improvement"}
                    {rating === 1 && "Unsatisfactory"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[#3B2A1E] mb-1">
                    Consultation Type
                  </label>
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] p-3 font-semibold text-[#3B2A1E] focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                  >
                    <option value="Voice Call Consultation">Voice Call Consultation</option>
                    <option value="Live Chat Consultation">Live Chat Consultation</option>
                    <option value="Video Call Consultation">Video Call Consultation</option>
                    <option value="Janam Kundli Reading">Janam Kundli Reading</option>
                    <option value="Vastu Audit">Vastu Audit</option>
                    <option value="Gemstone Recommendation">Gemstone Recommendation</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#3B2A1E] mb-1">
                    Reviewer Name
                  </label>
                  <input
                    type="text"
                    disabled
                    value={reviewerName}
                    className="w-full rounded-xl border border-[#E8D8C3] bg-[#E8D8C3]/30 p-3 font-semibold text-[#6E5545]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3B2A1E] mb-1">
                  Your Detailed Experience &amp; Remedial Impact *
                </label>
                <textarea
                  rows={4}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How did the session help you? Were the planetary timelines and remedies clear and effective?"
                  className="w-full rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] p-3 text-xs text-[#3B2A1E] focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consentPublic}
                  onChange={(e) => setConsentPublic(e.target.checked)}
                  className="rounded border-[#E8D8C3] text-[#7B2D26] focus:ring-[#7B2D26]"
                />
                <label htmlFor="consent" className="text-xs text-[#6E5545] cursor-pointer">
                  I consent to sharing this feedback on the public Aapka Astro Testimonials page with my initials or first name.
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-[#7B2D26] py-3.5 text-xs font-bold text-[#FBF3E7] hover:bg-[#96372E] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="h-4 w-4 text-[#E8A33D]" />
                <span>{submitting ? "Saving to Database..." : "Publish Honest Review"}</span>
              </button>
            </form>
          )}
        </div>

        {/* Past Reviews List */}
        {pastReviews.length > 0 && (
          <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-8 shadow-sm">
            <h3 className="font-temple text-xl font-bold text-[#7B2D26] mb-4">
              Previously Submitted Feedback
            </h3>
            <div className="space-y-4">
              {pastReviews.map((r) => (
                <div key={r.id} className="rounded-2xl border border-[#E8D8C3] bg-[#FBF3E7] p-5">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex text-[#E8A33D]">
                      {[...Array(r.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-[#E8A33D]" />
                      ))}
                    </div>
                    <span className="text-[11px] text-[#6E5545]">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : ""}
                    </span>
                  </div>
                  <p className="text-xs text-[#3B2A1E] leading-relaxed italic">
                    &ldquo;{r.comment}&rdquo;
                  </p>
                  <span className="mt-2 block text-[10px] font-bold text-[#C1662F]">
                    {r.service} • {r.clientName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
