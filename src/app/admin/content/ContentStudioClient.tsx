"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  PhoneCall,
  HelpCircle,
  LayoutTemplate,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Share2,
  Star,
  ShieldCheck,
  RefreshCw,
  X,
} from "lucide-react";
import { AdminHelpPanel } from "@/components/admin/AdminHelpPanel";
import {
  ContentStudioData,
  FaqItem,
  ContactInfoConfig,
  SocialLinksConfig,
  HeroBannerConfig,
  ReviewItem,
} from "@/lib/services/contentStudioService";

interface ContentStudioClientProps {
  initialContent: ContentStudioData;
  canManage: boolean;
}

export default function ContentStudioClient({
  initialContent,
  canManage,
}: ContentStudioClientProps) {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "contact";

  const [activeTab, setActiveTab] = useState<"contact" | "faqs" | "hero" | "reviews">(
    initialTab as any
  );

  const [content, setContent] = useState<ContentStudioData>(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // FAQ Modal state
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [faqFormQuestion, setFaqFormQuestion] = useState("");
  const [faqFormAnswer, setFaqFormAnswer] = useState("");
  const [faqFormCategory, setFaqFormCategory] = useState("general");
  const [faqFormActive, setFaqFormActive] = useState(true);

  // Review Modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);
  const [reviewFormName, setReviewFormName] = useState("");
  const [reviewFormCity, setReviewFormCity] = useState("");
  const [reviewFormService, setReviewFormService] = useState("Vedic Astrology");
  const [reviewFormRating, setReviewFormRating] = useState(5);
  const [reviewFormText, setReviewFormText] = useState("");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["contact", "faqs", "hero", "reviews"].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  // Handle Save
  const handleSave = async (updatedData?: Partial<ContentStudioData>) => {
    if (!canManage) {
      alert("Permission Denied: MANAGE access required to edit site content.");
      return;
    }

    setIsSaving(true);
    setSaveSuccess(null);
    setErrorMessage(null);

    const payload = updatedData ? { ...content, ...updatedData } : content;

    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to save content.");
      }

      setContent(json.content);
      setSaveSuccess("Changes saved successfully! Your website is updated.");
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  // FAQ Handlers
  const handleOpenAddFaq = () => {
    setEditingFaq(null);
    setFaqFormQuestion("");
    setFaqFormAnswer("");
    setFaqFormCategory("general");
    setFaqFormActive(true);
    setIsFaqModalOpen(true);
  };

  const handleOpenEditFaq = (faq: FaqItem) => {
    setEditingFaq(faq);
    setFaqFormQuestion(faq.q);
    setFaqFormAnswer(faq.a);
    setFaqFormCategory(faq.category || "general");
    setFaqFormActive(faq.isActive);
    setIsFaqModalOpen(true);
  };

  const handleSaveFaqModal = () => {
    if (!faqFormQuestion.trim() || !faqFormAnswer.trim()) {
      alert("Please provide both a question and an answer.");
      return;
    }

    let updatedFaqs: FaqItem[];
    if (editingFaq) {
      updatedFaqs = content.faqs.map((f) =>
        f.id === editingFaq.id
          ? {
              ...f,
              q: faqFormQuestion.trim(),
              a: faqFormAnswer.trim(),
              category: faqFormCategory,
              isActive: faqFormActive,
            }
          : f
      );
    } else {
      const newFaq: FaqItem = {
        id: `faq-${Date.now()}`,
        q: faqFormQuestion.trim(),
        a: faqFormAnswer.trim(),
        category: faqFormCategory,
        isActive: faqFormActive,
        sortOrder: content.faqs.length + 1,
      };
      updatedFaqs = [newFaq, ...content.faqs];
    }

    const updated = { ...content, faqs: updatedFaqs };
    setContent(updated);
    setIsFaqModalOpen(false);
    handleSave(updated);
  };

  const handleToggleFaq = (id: string) => {
    const updatedFaqs = content.faqs.map((f) =>
      f.id === id ? { ...f, isActive: !f.isActive } : f
    );
    const updated = { ...content, faqs: updatedFaqs };
    setContent(updated);
    handleSave(updated);
  };

  const handleDeleteFaq = (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    const updatedFaqs = content.faqs.filter((f) => f.id !== id);
    const updated = { ...content, faqs: updatedFaqs };
    setContent(updated);
    handleSave(updated);
  };

  // Review Handlers
  const handleOpenAddReview = () => {
    setEditingReview(null);
    setReviewFormName("");
    setReviewFormCity("");
    setReviewFormService("Astro Consultation");
    setReviewFormRating(5);
    setReviewFormText("");
    setIsReviewModalOpen(true);
  };

  const handleOpenEditReview = (r: ReviewItem) => {
    setEditingReview(r);
    setReviewFormName(r.clientName);
    setReviewFormCity(r.city);
    setReviewFormService(r.service);
    setReviewFormRating(r.stars);
    setReviewFormText(r.text);
    setIsReviewModalOpen(true);
  };

  const handleSaveReviewModal = () => {
    if (!reviewFormName.trim() || !reviewFormText.trim()) {
      alert("Please enter the client name and review text.");
      return;
    }

    const currentReviews = content.reviews || [];
    let updatedReviews: ReviewItem[];

    if (editingReview) {
      updatedReviews = currentReviews.map((r) =>
        r.id === editingReview.id
          ? {
              ...r,
              clientName: reviewFormName.trim(),
              city: reviewFormCity.trim() || "Verified Seeker",
              service: reviewFormService,
              stars: reviewFormRating,
              text: reviewFormText.trim(),
            }
          : r
      );
    } else {
      const newReview: ReviewItem = {
        id: `rev-${Date.now()}`,
        clientName: reviewFormName.trim(),
        city: reviewFormCity.trim() || "Verified Seeker",
        service: reviewFormService,
        stars: reviewFormRating,
        text: reviewFormText.trim(),
        verified: true,
        isActive: true,
      };
      updatedReviews = [newReview, ...currentReviews];
    }

    const updated = { ...content, reviews: updatedReviews };
    setContent(updated);
    setIsReviewModalOpen(false);
    handleSave(updated);
  };

  const handleToggleReview = (id: string) => {
    const currentReviews = content.reviews || [];
    const updatedReviews = currentReviews.map((r) =>
      r.id === id ? { ...r, isActive: !r.isActive } : r
    );
    const updated = { ...content, reviews: updatedReviews };
    setContent(updated);
    handleSave(updated);
  };

  const handleDeleteReview = (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    const currentReviews = content.reviews || [];
    const updatedReviews = currentReviews.filter((r) => r.id !== id);
    const updated = { ...content, reviews: updatedReviews };
    setContent(updated);
    handleSave(updated);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] py-8 px-4 sm:px-6 lg:px-8 text-[#3B2A1E]">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Breadcrumb & Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7B2D26] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Admin Home</span>
          </Link>

          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#6E5545] hover:text-[#7B2D26]"
          >
            <span>View live site</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Page Header */}
        <header className="border-b border-[#E8D8C3] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8A33D]/20 text-[#7B2D26] text-xs font-bold uppercase tracking-wider mb-2">
              <LayoutTemplate className="h-3.5 w-3.5" />
              <span>Content Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-temple text-[#7B2D26]">
              Website Content Manager
            </h1>
            <p className="text-xs sm:text-sm text-[#6E5545] mt-1">
              Add, edit, hide, or delete what visitors see on www.aapkaastro.com without touching code.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={isSaving || !canManage}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7B2D26] hover:bg-[#60231E] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save All Changes</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Toast Alerts */}
        {saveSuccess && (
          <div className="p-3.5 rounded-xl bg-[#E8F5E9] border border-[#81C784] text-xs text-[#2E7D32] flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#2E7D32]" />
            <span className="font-bold">{saveSuccess}</span>
          </div>
        )}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-[#FFEBEE] border border-[#E57373] text-xs text-[#C62828] flex items-center gap-2 shadow-xs">
            <AlertCircle className="h-4 w-4 shrink-0 text-[#C62828]" />
            <span className="font-bold">{errorMessage}</span>
          </div>
        )}

        {/* Editor Tabs Navigation */}
        <div className="flex items-center gap-2 border-b border-[#E8D8C3] overflow-x-auto pb-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("contact")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeTab === "contact"
                ? "border-[#7B2D26] bg-[#FBF3E7] text-[#7B2D26]"
                : "border-transparent text-[#6E5545] hover:text-[#7B2D26]"
            }`}
          >
            <PhoneCall className="h-4 w-4" />
            <span>Phone &amp; Social Links</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("faqs")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeTab === "faqs"
                ? "border-[#7B2D26] bg-[#FBF3E7] text-[#7B2D26]"
                : "border-transparent text-[#6E5545] hover:text-[#7B2D26]"
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            <span>FAQs ({content.faqs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("hero")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeTab === "hero"
                ? "border-[#7B2D26] bg-[#FBF3E7] text-[#7B2D26]"
                : "border-transparent text-[#6E5545] hover:text-[#7B2D26]"
            }`}
          >
            <LayoutTemplate className="h-4 w-4" />
            <span>Hero &amp; Announcement</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeTab === "reviews"
                ? "border-[#7B2D26] bg-[#FBF3E7] text-[#7B2D26]"
                : "border-transparent text-[#6E5545] hover:text-[#7B2D26]"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Seeker Reviews ({content.reviews?.length || 0})</span>
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: CONTACT & SOCIAL LINKS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "contact" && (
          <div className="space-y-6">
            <AdminHelpPanel
              title="How to update contact details & social channels"
              steps={[
                {
                  title: "WhatsApp & Phone",
                  description: "Enter your official numbers. When seekers click WhatsApp on the website, this number opens automatically.",
                },
                {
                  title: "Public Support Email",
                  description: "This email is displayed on the website footer and contact page. The Owner's private login address is never shown.",
                },
                {
                  title: "Social Links",
                  description: "Paste your Instagram profile, YouTube channel, and Facebook page URLs.",
                },
                {
                  title: "Click Save All Changes",
                  description: "Once saved, the live website footer and contact pages update immediately.",
                },
              ]}
              tip="Check the 'View live site' link in the top bar to verify how your updated numbers look to visitors."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Phone & WhatsApp Card */}
              <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-[#7B2D26] font-temple flex items-center gap-2">
                  <PhoneCall className="h-4 w-4 text-[#E8A33D]" />
                  <span>Phone &amp; WhatsApp Coordination</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-[#3B2A1E] mb-1">
                      WhatsApp Display Number
                    </label>
                    <input
                      type="text"
                      value={content.contact.whatsapp}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          contact: { ...content.contact, whatsapp: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-[#E8D8C3] p-2.5 bg-white text-xs text-[#3B2A1E] focus:outline-none focus:border-[#7B2D26]"
                      placeholder="+91 93112 15564"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#3B2A1E] mb-1">
                      Direct WhatsApp Link
                    </label>
                    <input
                      type="text"
                      value={content.contact.whatsappLink}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          contact: { ...content.contact, whatsappLink: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-[#E8D8C3] p-2.5 bg-white text-xs text-[#3B2A1E] focus:outline-none focus:border-[#7B2D26]"
                      placeholder="https://wa.me/919311215564"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#3B2A1E] mb-1">
                      Sanctum Phone (Dialing)
                    </label>
                    <input
                      type="text"
                      value={content.contact.phone}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          contact: { ...content.contact, phone: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-[#E8D8C3] p-2.5 bg-white text-xs text-[#3B2A1E] focus:outline-none focus:border-[#7B2D26]"
                      placeholder="+91 931-121-5564"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#3B2A1E] mb-1">
                      Operating Consultation Hours
                    </label>
                    <input
                      type="text"
                      value={content.contact.operatingHours}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          contact: { ...content.contact, operatingHours: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-[#E8D8C3] p-2.5 bg-white text-xs text-[#3B2A1E] focus:outline-none focus:border-[#7B2D26]"
                      placeholder="Monday – Sunday: 7:00 AM – 11:00 PM IST"
                    />
                  </div>
                </div>
              </div>

              {/* Office & Public Email Card */}
              <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-[#7B2D26] font-temple flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-[#E8A33D]" />
                  <span>Public Email &amp; Sanctum Office Address</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-[#3B2A1E] mb-1">
                      Public Support Email (Displayed on site)
                    </label>
                    <input
                      type="email"
                      value={content.contact.email}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          contact: { ...content.contact, email: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-[#E8D8C3] p-2.5 bg-white text-xs text-[#3B2A1E] focus:outline-none focus:border-[#7B2D26]"
                      placeholder="contact@aapkaastro.com"
                    />
                    <p className="text-[11px] text-[#6E5545] mt-1">
                      The Owner&apos;s private login address is kept private and will not be scraped.
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-[#3B2A1E] mb-1">
                      Office / Sanctum Address
                    </label>
                    <textarea
                      rows={3}
                      value={content.contact.address}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          contact: { ...content.contact, address: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-[#E8D8C3] p-2.5 bg-white text-xs text-[#3B2A1E] focus:outline-none focus:border-[#7B2D26]"
                      placeholder="Unit No. A-1212 D, Tower A, Spectrum@Metro Phase 1, Sector 75, Noida..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media Links Card */}
            <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-[#7B2D26] font-temple">
                Official Social Media Channels
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {/* Instagram */}
                <div className="space-y-2 p-3 rounded-xl bg-[#FBF3E7]/40 border border-[#E8D8C3]">
                  <span className="font-bold text-[#7B2D26] block">Instagram</span>
                  <div>
                    <label className="text-[11px] text-[#6E5545] block">Handle</label>
                    <input
                      type="text"
                      value={content.social.instagram.handle}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          social: {
                            ...content.social,
                            instagram: { ...content.social.instagram, handle: e.target.value },
                          },
                        })
                      }
                      className="w-full rounded-lg border border-[#E8D8C3] p-1.5 bg-white text-xs"
                      placeholder="@aapkaastrologer"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#6E5545] block">URL</label>
                    <input
                      type="text"
                      value={content.social.instagram.url}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          social: {
                            ...content.social,
                            instagram: { ...content.social.instagram, url: e.target.value },
                          },
                        })
                      }
                      className="w-full rounded-lg border border-[#E8D8C3] p-1.5 bg-white text-xs"
                      placeholder="https://www.instagram.com/aapkaastrologer/"
                    />
                  </div>
                </div>

                {/* YouTube */}
                <div className="space-y-2 p-3 rounded-xl bg-[#FBF3E7]/40 border border-[#E8D8C3]">
                  <span className="font-bold text-[#7B2D26] block">YouTube</span>
                  <div>
                    <label className="text-[11px] text-[#6E5545] block">Handle</label>
                    <input
                      type="text"
                      value={content.social.youtube.handle}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          social: {
                            ...content.social,
                            youtube: { ...content.social.youtube, handle: e.target.value },
                          },
                        })
                      }
                      className="w-full rounded-lg border border-[#E8D8C3] p-1.5 bg-white text-xs"
                      placeholder="@aapkaastro7900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#6E5545] block">URL</label>
                    <input
                      type="text"
                      value={content.social.youtube.url}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          social: {
                            ...content.social,
                            youtube: { ...content.social.youtube, url: e.target.value },
                          },
                        })
                      }
                      className="w-full rounded-lg border border-[#E8D8C3] p-1.5 bg-white text-xs"
                      placeholder="https://www.youtube.com/@aapkaastro7900"
                    />
                  </div>
                </div>

                {/* Facebook */}
                <div className="space-y-2 p-3 rounded-xl bg-[#FBF3E7]/40 border border-[#E8D8C3]">
                  <span className="font-bold text-[#7B2D26] block">Facebook</span>
                  <div>
                    <label className="text-[11px] text-[#6E5545] block">Handle</label>
                    <input
                      type="text"
                      value={content.social.facebook.handle}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          social: {
                            ...content.social,
                            facebook: { ...content.social.facebook, handle: e.target.value },
                          },
                        })
                      }
                      className="w-full rounded-lg border border-[#E8D8C3] p-1.5 bg-white text-xs"
                      placeholder="@aapkaastro"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#6E5545] block">URL</label>
                    <input
                      type="text"
                      value={content.social.facebook.url}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          social: {
                            ...content.social,
                            facebook: { ...content.social.facebook, url: e.target.value },
                          },
                        })
                      }
                      className="w-full rounded-lg border border-[#E8D8C3] p-1.5 bg-white text-xs"
                      placeholder="https://www.facebook.com/aapkaastro"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: FREQUENTLY ASKED QUESTIONS (FAQS) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "faqs" && (
          <div className="space-y-6">
            <AdminHelpPanel
              title="How to manage Frequently Asked Questions"
              steps={[
                {
                  title: "Add a question",
                  description: "Click 'Add New FAQ' button on the right. Enter the question seekers often ask and the clear answer.",
                },
                {
                  title: "Hide an FAQ without deleting",
                  description: "Click the Eye icon on any FAQ to hide it immediately from visitors. Click again to show it.",
                },
                {
                  title: "Edit an answer",
                  description: "Click the Edit button to update wording or add details.",
                },
                {
                  title: "Delete an FAQ",
                  description: "Click the Trash icon if a question is no longer relevant.",
                },
              ]}
              tip="Active questions appear on the homepage FAQ accordion. Hidden questions are kept safe here in case you want to show them again later."
            />

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#7B2D26] font-temple">
                  Questions Displayed to Seekers ({content.faqs.filter((f) => f.isActive).length} Active / {content.faqs.length} Total)
                </h3>
                <p className="text-xs text-[#6E5545]">
                  Click the Eye icon to hide any FAQ instantly from the public homepage.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddFaq}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#7B2D26] hover:bg-[#60231E] text-white text-xs font-bold transition-colors shadow-xs"
              >
                <Plus className="h-4 w-4" />
                <span>Add New FAQ</span>
              </button>
            </div>

            {/* FAQs List */}
            <div className="space-y-3">
              {content.faqs.map((faq, idx) => (
                <div
                  key={faq.id || idx}
                  className={`p-4 rounded-2xl border transition-all shadow-xs ${
                    faq.isActive
                      ? "border-[#E8D8C3] bg-[#FFFDF9]"
                      : "border-gray-200 bg-gray-50/70 opacity-75"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-[#3B2A1E]">
                          {idx + 1}. {faq.q}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FBF3E7] text-[#7B2D26] border border-[#E8D8C3]">
                          {faq.category || "General"}
                        </span>
                        {faq.isActive ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">
                            Visible
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-200 text-gray-700">
                            Hidden from site
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#6E5545] leading-relaxed pt-1">
                        {faq.a}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                      {/* Hide/Show Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleFaq(faq.id)}
                        className={`p-2 rounded-lg border text-xs font-bold transition-colors ${
                          faq.isActive
                            ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                            : "border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        title={faq.isActive ? "Click to hide from website" : "Click to show on website"}
                      >
                        {faq.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditFaq(faq)}
                        className="p-2 rounded-lg border border-[#E8D8C3] bg-[#FBF3E7] hover:bg-[#F3E7D3] text-[#7B2D26] transition-colors"
                        title="Edit question & answer"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteFaq(faq.id)}
                        className="p-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 transition-colors"
                        title="Delete question permanently"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: HOMEPAGE HERO & ANNOUNCEMENTS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "hero" && (
          <div className="space-y-6">
            <AdminHelpPanel
              title="How to manage homepage headlines & announcement banner"
              steps={[
                {
                  title: "Top Headline & Tagline",
                  description: "This is the very first thing visitors read on the homepage. Keep it inspiring, clear, and authentic.",
                },
                {
                  title: "Subheadline / Bio Overview",
                  description: "A 2-3 sentence overview of Acharya Niraj Kumar's 20+ years corporate and Vedic background.",
                },
                {
                  title: "Announcement Banner",
                  description: "Turn this ON during festivals like Navratri, Diwali, or when you have a special blessing to announce. Turn it OFF when finished.",
                },
              ]}
              tip="The announcement banner appears prominently across the top of the homepage when enabled."
            />

            <div className="rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 sm:p-6 space-y-5 shadow-xs">
              <h3 className="text-sm font-bold text-[#7B2D26] font-temple">
                Homepage Hero Text &amp; Identity
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#3B2A1E] mb-1">
                    Hero Badge Text (Above Headline)
                  </label>
                  <input
                    type="text"
                    value={content.hero.badgeText}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: { ...content.hero, badgeText: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-[#E8D8C3] p-2.5 bg-white text-xs text-[#3B2A1E] focus:outline-none focus:border-[#7B2D26]"
                    placeholder="20+ Years Mastery • Certified Jyotish Acharya"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#3B2A1E] mb-1">
                    Main Headline
                  </label>
                  <input
                    type="text"
                    value={content.hero.headline}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: { ...content.hero, headline: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-[#E8D8C3] p-2.5 bg-white text-xs text-[#3B2A1E] focus:outline-none focus:border-[#7B2D26] font-temple text-sm"
                    placeholder="Where Spiritual Science Meets Corporate Insight"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#3B2A1E] mb-1">
                    Subheadline / Philosophy Statement
                  </label>
                  <textarea
                    rows={3}
                    value={content.hero.subheadline}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: { ...content.hero, subheadline: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-[#E8D8C3] p-2.5 bg-white text-xs text-[#3B2A1E] focus:outline-none focus:border-[#7B2D26] leading-relaxed"
                    placeholder="Deep traditional learning and rare corporate leadership experience..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block font-bold text-[#3B2A1E] mb-1">
                      Experience Years Text
                    </label>
                    <input
                      type="text"
                      value={content.hero.experienceYears}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hero: { ...content.hero, experienceYears: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-[#E8D8C3] p-2 bg-white text-xs"
                      placeholder="20+"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#3B2A1E] mb-1">
                      Consultations Completed Text
                    </label>
                    <input
                      type="text"
                      value={content.hero.consultationsCount}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hero: { ...content.hero, consultationsCount: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-[#E8D8C3] p-2 bg-white text-xs"
                      placeholder="15,000+ Consultations"
                    />
                  </div>
                </div>
              </div>

              {/* Announcement Banner Section */}
              <div className="border-t border-[#E8D8C3] pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#7B2D26]">
                      Special Announcement Banner
                    </h4>
                    <p className="text-[11px] text-[#6E5545]">
                      Display a prominent notification bar across the top of the website.
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={content.hero.announcementEnabled}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hero: { ...content.hero, announcementEnabled: e.target.checked },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7B2D26]"></div>
                    <span className="ml-2 text-xs font-bold text-[#7B2D26]">
                      {content.hero.announcementEnabled ? "Enabled (Live)" : "Disabled (Hidden)"}
                    </span>
                  </label>
                </div>

                {content.hero.announcementEnabled && (
                  <div className="p-4 rounded-xl bg-[#FBF3E7] border border-[#E8A33D] space-y-3">
                    <div>
                      <label className="block font-bold text-[#3B2A1E] mb-1">
                        Banner Announcement Text
                      </label>
                      <input
                        type="text"
                        value={content.hero.announcementText || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            hero: { ...content.hero, announcementText: e.target.value },
                          })
                        }
                        className="w-full rounded-xl border border-[#E8D8C3] p-2.5 bg-white text-xs"
                        placeholder="Festive Blessing: Receive an abhimantrit 5-Mukhi Rudraksh on every consultation."
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#3B2A1E] mb-1">
                        Banner Button Link (Optional)
                      </label>
                      <input
                        type="text"
                        value={content.hero.announcementLink || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            hero: { ...content.hero, announcementLink: e.target.value },
                          })
                        }
                        className="w-full rounded-xl border border-[#E8D8C3] p-2.5 bg-white text-xs"
                        placeholder="/consult"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: SEEKER REVIEWS & TESTIMONIALS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            <AdminHelpPanel
              title="How to manage seeker reviews & testimonials"
              steps={[
                {
                  title: "Add real seeker reviews",
                  description: "Click 'Add Seeker Review' to record genuine appreciation from clients with their permission.",
                },
                {
                  title: "Hide or show reviews",
                  description: "Click the Eye icon on any testimonial to hide it from the homepage without deleting it.",
                },
                {
                  title: "Edit details",
                  description: "Click the Edit button to correct typing errors or update city and service name.",
                },
              ]}
              tip="Only active reviews with 4 or 5 stars appear on the public homepage. Placeholder reviews can be replaced anytime with authentic feedback."
            />

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#7B2D26] font-temple">
                  Seeker Words of Appreciation ({(content.reviews || []).filter((r) => r.isActive).length} Active / {(content.reviews || []).length} Total)
                </h3>
                <p className="text-xs text-[#6E5545]">
                  Manage reviews displayed on the homepage testimonials grid.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddReview}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#7B2D26] hover:bg-[#60231E] text-white text-xs font-bold transition-colors shadow-xs"
              >
                <Plus className="h-4 w-4" />
                <span>Add Seeker Review</span>
              </button>
            </div>

            {/* Reviews List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(content.reviews || []).map((review) => (
                <div
                  key={review.id}
                  className={`p-4 rounded-2xl border transition-all shadow-xs flex flex-col justify-between ${
                    review.isActive
                      ? "border-[#E8D8C3] bg-[#FFFDF9]"
                      : "border-gray-200 bg-gray-50/70 opacity-70"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[#E8A33D]">
                        {[...Array(review.stars || 5)].map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleReview(review.id)}
                          className={`p-1.5 rounded-lg border text-xs ${
                            review.isActive
                              ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                              : "border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                          title={review.isActive ? "Hide from website" : "Show on website"}
                        >
                          {review.isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditReview(review)}
                          className="p-1.5 rounded-lg border border-[#E8D8C3] bg-[#FBF3E7] hover:bg-[#F3E7D3] text-[#7B2D26]"
                          title="Edit review"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteReview(review.id)}
                          className="p-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700"
                          title="Delete review permanently"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-[#3B2A1E] italic leading-relaxed">
                      &ldquo;{review.text}&rdquo;
                    </p>
                  </div>

                  <div className="pt-3 mt-2 border-t border-[#E8D8C3]/50 flex items-center justify-between text-[11px]">
                    <div>
                      <strong className="text-[#7B2D26] block">{review.clientName}</strong>
                      <span className="text-[#6E5545]">{review.city}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[#C1662F] font-bold block">{review.service}</span>
                      <span className="text-[10px] text-green-700 flex items-center gap-0.5 justify-end">
                        <ShieldCheck className="h-3 w-3" /> Verified Seeker
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MODAL: ADD / EDIT FAQ */}
        {/* ------------------------------------------------------------- */}
        {isFaqModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 border border-[#E8D8C3]">
              <div className="flex items-center justify-between border-b border-[#E8D8C3] pb-3">
                <h3 className="text-sm font-bold text-[#7B2D26] font-temple">
                  {editingFaq ? "Edit Frequently Asked Question" : "Add New Question"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsFaqModalOpen(false)}
                  className="p-1 text-[#6E5545] hover:text-[#7B2D26]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-[#3B2A1E] mb-1">
                    Question *
                  </label>
                  <input
                    type="text"
                    value={faqFormQuestion}
                    onChange={(e) => setFaqFormQuestion(e.target.value)}
                    className="w-full rounded-xl border border-[#E8D8C3] p-2.5 text-xs text-[#3B2A1E] focus:outline-none focus:border-[#7B2D26]"
                    placeholder="e.g. Can I consult about Vastu without structural changes?"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#3B2A1E] mb-1">
                    Answer *
                  </label>
                  <textarea
                    rows={4}
                    value={faqFormAnswer}
                    onChange={(e) => setFaqFormAnswer(e.target.value)}
                    className="w-full rounded-xl border border-[#E8D8C3] p-2.5 text-xs text-[#3B2A1E] focus:outline-none focus:border-[#7B2D26] leading-relaxed"
                    placeholder="Explain the answer in clear, friendly words..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#3B2A1E] mb-1">
                      Category
                    </label>
                    <select
                      value={faqFormCategory}
                      onChange={(e) => setFaqFormCategory(e.target.value)}
                      className="w-full rounded-xl border border-[#E8D8C3] p-2.5 text-xs bg-white text-[#3B2A1E]"
                    >
                      <option value="general">General</option>
                      <option value="booking">Booking &amp; Calls</option>
                      <option value="pricing">Pricing &amp; UPI</option>
                      <option value="vastu">Devta Vastu</option>
                      <option value="gemstones">Gemstones</option>
                      <option value="tools">Online Calculators</option>
                    </select>
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-[#3B2A1E]">
                      <input
                        type="checkbox"
                        checked={faqFormActive}
                        onChange={(e) => setFaqFormActive(e.target.checked)}
                        className="rounded border-[#E8D8C3] text-[#7B2D26] focus:ring-[#7B2D26]"
                      />
                      <span>Visible on live website</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8D8C3]">
                <button
                  type="button"
                  onClick={() => setIsFaqModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E8D8C3] text-xs font-bold text-[#6E5545] hover:bg-[#FBF3E7]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveFaqModal}
                  className="px-4 py-2 rounded-xl bg-[#7B2D26] hover:bg-[#60231E] text-white text-xs font-bold shadow-xs"
                >
                  {editingFaq ? "Update FAQ" : "Add FAQ"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MODAL: ADD / EDIT REVIEW */}
        {/* ------------------------------------------------------------- */}
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 border border-[#E8D8C3]">
              <div className="flex items-center justify-between border-b border-[#E8D8C3] pb-3">
                <h3 className="text-sm font-bold text-[#7B2D26] font-temple">
                  {editingReview ? "Edit Seeker Review" : "Add Authentic Seeker Review"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="p-1 text-[#6E5545] hover:text-[#7B2D26]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#3B2A1E] mb-1">
                      Client / Seeker Name *
                    </label>
                    <input
                      type="text"
                      value={reviewFormName}
                      onChange={(e) => setReviewFormName(e.target.value)}
                      className="w-full rounded-xl border border-[#E8D8C3] p-2.5 text-xs text-[#3B2A1E]"
                      placeholder="e.g. Priya Sharma"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#3B2A1E] mb-1">
                      City / Location
                    </label>
                    <input
                      type="text"
                      value={reviewFormCity}
                      onChange={(e) => setReviewFormCity(e.target.value)}
                      className="w-full rounded-xl border border-[#E8D8C3] p-2.5 text-xs text-[#3B2A1E]"
                      placeholder="e.g. Noida / Mumbai"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#3B2A1E] mb-1">
                      Consultation Service
                    </label>
                    <select
                      value={reviewFormService}
                      onChange={(e) => setReviewFormService(e.target.value)}
                      className="w-full rounded-xl border border-[#E8D8C3] p-2.5 text-xs bg-white text-[#3B2A1E]"
                    >
                      <option value="Astro Consultation">Astro Consultation</option>
                      <option value="Vaastu Consultation">Vaastu Consultation</option>
                      <option value="Kundli Analysis">Kundli Analysis</option>
                      <option value="Gemstone Recommendation">Gemstone Recommendation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#3B2A1E] mb-1">
                      Rating (Stars)
                    </label>
                    <select
                      value={reviewFormRating}
                      onChange={(e) => setReviewFormRating(Number(e.target.value))}
                      className="w-full rounded-xl border border-[#E8D8C3] p-2.5 text-xs bg-white text-[#3B2A1E]"
                    >
                      <option value={5}>5 Stars (★★★★★)</option>
                      <option value={4}>4 Stars (★★★★☆)</option>
                      <option value={3}>3 Stars (★★★☆☆)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#3B2A1E] mb-1">
                    Seeker Feedback / Testimonial *
                  </label>
                  <textarea
                    rows={4}
                    value={reviewFormText}
                    onChange={(e) => setReviewFormText(e.target.value)}
                    className="w-full rounded-xl border border-[#E8D8C3] p-2.5 text-xs text-[#3B2A1E] leading-relaxed"
                    placeholder="Enter what the seeker shared about their consultation..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8D8C3]">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E8D8C3] text-xs font-bold text-[#6E5545] hover:bg-[#FBF3E7]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveReviewModal}
                  className="px-4 py-2 rounded-xl bg-[#7B2D26] hover:bg-[#60231E] text-white text-xs font-bold shadow-xs"
                >
                  {editingReview ? "Update Review" : "Add Review"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
