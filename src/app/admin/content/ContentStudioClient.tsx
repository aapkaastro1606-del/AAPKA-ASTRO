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
  GripVertical,
  ChevronUp,
  ChevronDown,
  History,
  Sparkles,
  Link as LinkIcon,
  Globe,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import { AdminHelpPanel } from "@/components/admin/AdminHelpPanel";
import { CharacterCount } from "@/components/content/CharacterCount";
import { LanguageTabs } from "@/components/content/LanguageTabs";
import { RevisionHistoryModal } from "@/components/content/RevisionHistoryModal";
import { PermanentDeleteModal } from "@/components/content/PermanentDeleteModal";
import { SafeRichText } from "@/components/content/SafeRichText";
import {
  ContentStudioData,
  FaqItem,
  ContactInfoConfig,
  SocialLinksConfig,
  HeroBannerConfig,
  ReviewItem,
} from "@/lib/services/contentStudioService";

interface ExtendedFaqItem extends FaqItem {
  qHi?: string;
  aHi?: string;
  status?: "DRAFT" | "PUBLISHED" | "HIDDEN";
}

interface ExtendedReviewItem extends ReviewItem {
  clientNameHi?: string;
  cityHi?: string;
  serviceHi?: string;
  textHi?: string;
  status?: "DRAFT" | "PUBLISHED" | "HIDDEN";
}

interface ContentStudioClientProps {
  initialContent: ContentStudioData;
  canManage: boolean;
}

export default function ContentStudioClient({
  initialContent,
  canManage,
}: ContentStudioClientProps) {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "faqs";

  const [activeTab, setActiveTab] = useState<"faqs" | "contact" | "hero" | "reviews" | "social">(
    (initialTab as any) || "faqs"
  );

  const [content, setContent] = useState<ContentStudioData>(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Drag and drop sorting state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Revision Modal State
  const [revisionModal, setRevisionModal] = useState<{
    isOpen: boolean;
    collection: string;
    key: string;
    title: string;
  }>({
    isOpen: false,
    collection: "faqs",
    key: "",
    title: "",
  });

  // Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    collection: string;
    id: string;
    title: string;
  }>({
    isOpen: false,
    collection: "faqs",
    id: "",
    title: "",
  });

  // --------------------------------------------------------------------------
  // FAQ Modal & Bilingual State
  // --------------------------------------------------------------------------
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<ExtendedFaqItem | null>(null);
  const [faqFormLang, setFaqFormLang] = useState<"en" | "hi">("en");
  const [faqFormQEn, setFaqFormQEn] = useState("");
  const [faqFormAEn, setFaqFormAEn] = useState("");
  const [faqFormQHi, setFaqFormQHi] = useState("");
  const [faqFormAHi, setFaqFormAHi] = useState("");
  const [faqFormCategory, setFaqFormCategory] = useState("general");
  const [faqFormStatus, setFaqFormStatus] = useState<"DRAFT" | "PUBLISHED" | "HIDDEN">("PUBLISHED");

  // --------------------------------------------------------------------------
  // Review Modal & Bilingual State
  // --------------------------------------------------------------------------
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ExtendedReviewItem | null>(null);
  const [reviewFormLang, setReviewFormLang] = useState<"en" | "hi">("en");
  const [reviewFormNameEn, setReviewFormNameEn] = useState("");
  const [reviewFormCityEn, setReviewFormCityEn] = useState("");
  const [reviewFormServiceEn, setReviewFormServiceEn] = useState("Astro Consultation");
  const [reviewFormTextEn, setReviewFormTextEn] = useState("");
  const [reviewFormNameHi, setReviewFormNameHi] = useState("");
  const [reviewFormCityHi, setReviewFormCityHi] = useState("");
  const [reviewFormServiceHi, setReviewFormServiceHi] = useState("ज्योतिष परामर्श");
  const [reviewFormTextHi, setReviewFormTextHi] = useState("");
  const [reviewFormRating, setReviewFormRating] = useState(5);
  const [reviewFormVerified, setReviewFormVerified] = useState(true);
  const [reviewFormStatus, setReviewFormStatus] = useState<"DRAFT" | "PUBLISHED" | "HIDDEN">("PUBLISHED");

  // --------------------------------------------------------------------------
  // Hero Tab Bilingual State
  // --------------------------------------------------------------------------
  const [heroFormLang, setHeroFormLang] = useState<"en" | "hi">("en");
  const [heroBadgeEn, setHeroBadgeEn] = useState(content.hero.badgeText || "");
  const [heroHeadlineEn, setHeroHeadlineEn] = useState(content.hero.headline || "");
  const [heroSubheadlineEn, setHeroSubheadlineEn] = useState(content.hero.subheadline || "");
  const [heroBadgeHi, setHeroBadgeHi] = useState("20+ वर्षों का अनुभव • प्रमाणित ज्योतिष आचार्य");
  const [heroHeadlineHi, setHeroHeadlineHi] = useState("जहाँ आध्यात्मिक विज्ञान और आधुनिक जीवन का संगम होता है");
  const [heroSubheadlineHi, setHeroSubheadlineHi] = useState("15,000+ कुण्डली विश्लेषण और प्रामाणिक वैदिक मार्गदर्शन।");

  // --------------------------------------------------------------------------
  // Contact Tab Bilingual State
  // --------------------------------------------------------------------------
  const [contactFormLang, setContactFormLang] = useState<"en" | "hi">("en");
  const [contactAddressHi, setContactAddressHi] = useState("यूनिट नंबर A-1212 D, स्पेक्ट्रम@मेट्रो फेज़ 1, सेक्टर 75, नोएडा, उ.प्र. 201301");
  const [contactHoursHi, setContactHoursHi] = useState("सोमवार – रविवार: प्रातः 7:00 बजे से रात्रि 11:00 बजे IST");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["faqs", "contact", "hero", "reviews", "social"].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  // Reload studio data from backend
  const reloadData = async () => {
    try {
      const res = await fetch("/api/admin/content");
      const json = await res.json();
      if (json.success && json.content) {
        setContent(json.content);
      }
    } catch {
      // Ignored
    }
  };

  // Master Save Handler
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
      setSaveSuccess("Changes saved successfully! Revision snapshot recorded.");
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  // --------------------------------------------------------------------------
  // FAQ Handlers & Reordering
  // --------------------------------------------------------------------------
  const handleOpenAddFaq = () => {
    setEditingFaq(null);
    setFaqFormLang("en");
    setFaqFormQEn("");
    setFaqFormAEn("");
    setFaqFormQHi("");
    setFaqFormAHi("");
    setFaqFormCategory("general");
    setFaqFormStatus("PUBLISHED");
    setIsFaqModalOpen(true);
  };

  const handleOpenEditFaq = (faq: ExtendedFaqItem) => {
    setEditingFaq(faq);
    setFaqFormLang("en");
    setFaqFormQEn(faq.q);
    setFaqFormAEn(faq.a);
    setFaqFormQHi(faq.qHi || "");
    setFaqFormAHi(faq.aHi || "");
    setFaqFormCategory(faq.category || "general");
    setFaqFormStatus(faq.status || (faq.isActive ? "PUBLISHED" : "HIDDEN"));
    setIsFaqModalOpen(true);
  };

  const handleSaveFaqModal = () => {
    if (!faqFormQEn.trim() || !faqFormAEn.trim()) {
      alert("Please provide both an English question and answer.");
      return;
    }

    let updatedFaqs: ExtendedFaqItem[];
    const isActive = faqFormStatus === "PUBLISHED";

    if (editingFaq) {
      updatedFaqs = content.faqs.map((f) =>
        f.id === editingFaq.id
          ? {
              ...f,
              q: faqFormQEn.trim(),
              a: faqFormAEn.trim(),
              qHi: faqFormQHi.trim() || undefined,
              aHi: faqFormAHi.trim() || undefined,
              category: faqFormCategory,
              status: faqFormStatus,
              isActive,
            }
          : f
      );
    } else {
      const newFaq: ExtendedFaqItem = {
        id: `faq-${Date.now()}`,
        q: faqFormQEn.trim(),
        a: faqFormAEn.trim(),
        qHi: faqFormQHi.trim() || undefined,
        aHi: faqFormAHi.trim() || undefined,
        category: faqFormCategory,
        status: faqFormStatus,
        isActive,
        sortOrder: content.faqs.length + 1,
      };
      updatedFaqs = [newFaq, ...content.faqs];
    }

    const updated = { ...content, faqs: updatedFaqs };
    setContent(updated);
    setIsFaqModalOpen(false);
    handleSave(updated);
  };

  // Toggle Visibility ("Hide" instead of delete)
  const handleToggleFaq = (id: string) => {
    const updatedFaqs = content.faqs.map((f) =>
      f.id === id ? { ...f, isActive: !f.isActive } : f
    );
    const updated = { ...content, faqs: updatedFaqs };
    setContent(updated);
    handleSave(updated);
  };

  // Open Permanent Delete Confirmation
  const handlePromptDeleteFaq = (faq: FaqItem) => {
    setDeleteModal({
      isOpen: true,
      collection: "faqs",
      id: faq.id,
      title: faq.q,
    });
  };

  // Execute Permanent Delete
  const handleExecuteDeleteFaq = () => {
    const updatedFaqs = content.faqs.filter((f) => f.id !== deleteModal.id);
    const updated = { ...content, faqs: updatedFaqs };
    setContent(updated);
    handleSave(updated);
  };

  // Reorder FAQ: Move Up
  const handleMoveFaqUp = (index: number) => {
    if (index <= 0) return;
    const items = [...content.faqs];
    const temp = items[index];
    items[index] = items[index - 1];
    items[index - 1] = temp;
    items.forEach((item, idx) => (item.sortOrder = idx + 1));
    const updated = { ...content, faqs: items };
    setContent(updated);
    handleSave(updated);
  };

  // Reorder FAQ: Move Down
  const handleMoveFaqDown = (index: number) => {
    if (index >= content.faqs.length - 1) return;
    const items = [...content.faqs];
    const temp = items[index];
    items[index] = items[index + 1];
    items[index + 1] = temp;
    items.forEach((item, idx) => (item.sortOrder = idx + 1));
    const updated = { ...content, faqs: items };
    setContent(updated);
    handleSave(updated);
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDropFaq = (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }
    const items = [...content.faqs];
    const [draggedItem] = items.splice(draggedIndex, 1);
    items.splice(dropIndex, 0, draggedItem);
    items.forEach((item, idx) => (item.sortOrder = idx + 1));
    setDraggedIndex(null);
    const updated = { ...content, faqs: items };
    setContent(updated);
    handleSave(updated);
  };

  // --------------------------------------------------------------------------
  // Review Handlers
  // --------------------------------------------------------------------------
  const handleOpenAddReview = () => {
    setEditingReview(null);
    setReviewFormLang("en");
    setReviewFormNameEn("");
    setReviewFormCityEn("");
    setReviewFormServiceEn("Astro Consultation");
    setReviewFormRating(5);
    setReviewFormTextEn("");
    setReviewFormNameHi("");
    setReviewFormCityHi("");
    setReviewFormServiceHi("ज्योतिष परामर्श");
    setReviewFormTextHi("");
    setReviewFormVerified(true);
    setReviewFormStatus("PUBLISHED");
    setIsReviewModalOpen(true);
  };

  const handleOpenEditReview = (review: ExtendedReviewItem) => {
    setEditingReview(review);
    setReviewFormLang("en");
    setReviewFormNameEn(review.clientName);
    setReviewFormCityEn(review.city);
    setReviewFormServiceEn(review.service);
    setReviewFormRating(review.stars);
    setReviewFormTextEn(review.text);
    setReviewFormNameHi(review.clientNameHi || "");
    setReviewFormCityHi(review.cityHi || "");
    setReviewFormServiceHi(review.serviceHi || "");
    setReviewFormTextHi(review.textHi || "");
    setReviewFormVerified(review.verified);
    setReviewFormStatus(review.status || (review.isActive ? "PUBLISHED" : "HIDDEN"));
    setIsReviewModalOpen(true);
  };

  const handleSaveReviewModal = () => {
    if (!reviewFormNameEn.trim() || !reviewFormTextEn.trim()) {
      alert("Please provide the client name and review text.");
      return;
    }

    const currentReviews = content.reviews || [];
    let updatedReviews: ExtendedReviewItem[];
    const isActive = reviewFormStatus === "PUBLISHED";

    if (editingReview) {
      updatedReviews = currentReviews.map((r) =>
        r.id === editingReview.id
          ? {
              ...r,
              clientName: reviewFormNameEn.trim(),
              city: reviewFormCityEn.trim(),
              service: reviewFormServiceEn.trim(),
              stars: reviewFormRating,
              text: reviewFormTextEn.trim(),
              clientNameHi: reviewFormNameHi.trim() || undefined,
              cityHi: reviewFormCityHi.trim() || undefined,
              serviceHi: reviewFormServiceHi.trim() || undefined,
              textHi: reviewFormTextHi.trim() || undefined,
              verified: reviewFormVerified,
              status: reviewFormStatus,
              isActive,
            }
          : r
      );
    } else {
      const newReview: ExtendedReviewItem = {
        id: `rev-${Date.now()}`,
        clientName: reviewFormNameEn.trim(),
        city: reviewFormCityEn.trim(),
        service: reviewFormServiceEn.trim(),
        stars: reviewFormRating,
        text: reviewFormTextEn.trim(),
        clientNameHi: reviewFormNameHi.trim() || undefined,
        cityHi: reviewFormCityHi.trim() || undefined,
        serviceHi: reviewFormServiceHi.trim() || undefined,
        textHi: reviewFormTextHi.trim() || undefined,
        verified: reviewFormVerified,
        status: reviewFormStatus,
        isActive,
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

  const handlePromptDeleteReview = (review: ReviewItem) => {
    setDeleteModal({
      isOpen: true,
      collection: "testimonials",
      id: review.id,
      title: `${review.clientName} (${review.service})`,
    });
  };

  const handleExecuteDeleteReview = () => {
    const currentReviews = content.reviews || [];
    const updatedReviews = currentReviews.filter((r) => r.id !== deleteModal.id);
    const updated = { ...content, reviews: updatedReviews };
    setContent(updated);
    handleSave(updated);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-stone-900 pb-20">
      {/* Top Header */}
      <header className="border-b border-[#E8DCC4] bg-[#FDF8EE] sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Admin Hub</span>
            </Link>
            <div className="h-4 w-px bg-stone-300" />
            <div>
              <h1 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#7B2D26]" />
                Content Studio
              </h1>
              <p className="text-[11px] text-stone-500">
                Edit website text, FAQs, contact numbers, and reviews safely from your browser
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Owner Live Draft Preview Link */}
            <a
              href="/?previewDraft=true"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-amber-900 bg-amber-100/80 hover:bg-amber-200/80 border border-amber-300 px-3 py-1.5 rounded-lg transition-colors shadow-xs"
              title="Preview the live website including your DRAFT items (Owner Only)"
            >
              <Eye className="w-3.5 h-3.5 text-amber-800" />
              <span>Owner Draft Preview</span>
              <ExternalLink className="w-3 h-3 text-amber-700" />
            </a>

            <button
              onClick={() => handleSave()}
              disabled={isSaving || !canManage}
              className="flex items-center gap-1.5 text-xs font-semibold bg-[#7B2D26] hover:bg-[#60231E] text-white px-4 py-2 rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              <Save className={`w-3.5 h-3.5 ${isSaving ? "animate-spin" : ""}`} />
              <span>{isSaving ? "Saving..." : "Save All Changes"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Help Panel */}
        <AdminHelpPanel
          title="How to manage website content safely"
          steps={[
            "Click on any tab below (FAQs, Contact Details, Hero Announcement, or Reviews) to edit that section.",
            "Character counters show recommended lengths so text fits beautifully on mobile and desktop.",
            "Use English and Hindi tabs to provide bilingual content. If Hindi is missing, it falls back to English automatically.",
            "Click the Eye icon on any item to 'Hide' it from visitors without permanently deleting it.",
            "Every save records a revision snapshot. Click the Clock icon on any item to view or restore past versions with 1 click.",
          ]}
          tip="Save as Draft: Keep your work in progress. Only you as the Owner can view draft items using 'Owner Draft Preview'. Drag items by the grip handle to change list order."
        />

        {/* Notifications */}
        {saveSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveSuccess}</span>
            </div>
            <button onClick={() => setSaveSuccess(null)} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-900 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-red-700 hover:text-red-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-2">
          <button
            onClick={() => setActiveTab("faqs")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "faqs"
                ? "bg-[#7B2D26] text-white shadow-xs"
                : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Questions & Answers (FAQs)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-current">
              {content.faqs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("contact")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "contact"
                ? "bg-[#7B2D26] text-white shadow-xs"
                : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>Contact Details & Sanctum</span>
          </button>

          <button
            onClick={() => setActiveTab("hero")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "hero"
                ? "bg-[#7B2D26] text-white shadow-xs"
                : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
            }`}
          >
            <LayoutTemplate className="w-4 h-4" />
            <span>Hero & Announcement Banner</span>
          </button>

          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "reviews"
                ? "bg-[#7B2D26] text-white shadow-xs"
                : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Seeker Reviews & Testimonials</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-current">
              {(content.reviews || []).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("social")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "social"
                ? "bg-[#7B2D26] text-white shadow-xs"
                : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Social Channels</span>
          </button>

          <Link
            href="/admin/media"
            className="px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 shadow-xs"
          >
            <ImageIcon className="w-4 h-4 text-amber-700" />
            <span>Media Library &amp; Photos</span>
            <ExternalLink className="w-3 h-3 text-amber-600" />
          </Link>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* TAB 1: FAQs (Questions & Answers) */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === "faqs" && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-stone-900">Manage Website Questions & Answers</h2>
                <p className="text-xs text-stone-600">
                  Drag items by the grip handle to change order. Click the Eye icon to hide any FAQ without deleting it.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenAddFaq}
                  disabled={!canManage}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#7B2D26] text-white hover:bg-[#60231E] transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Question</span>
                </button>
              </div>
            </div>

            {/* FAQ List with Drag and Drop */}
            <div className="space-y-3">
              {content.faqs.map((faq, index) => {
                const isHidden = !faq.isActive;
                return (
                  <div
                    key={faq.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={() => handleDropFaq(index)}
                    className={`bg-white rounded-xl border p-4 transition-all flex items-start gap-3 shadow-xs ${
                      draggedIndex === index ? "opacity-50 border-amber-400 bg-amber-50/50" : "border-stone-200"
                    } ${isHidden ? "bg-stone-50/80 border-dashed opacity-80" : ""}`}
                  >
                    {/* Drag Handle & Reorder Arrows */}
                    <div className="flex flex-col items-center gap-1 pt-1 text-stone-400 shrink-0">
                      <div className="cursor-grab active:cursor-grabbing p-0.5 hover:text-stone-700" title="Drag to reorder">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleMoveFaqUp(index)}
                          disabled={index === 0}
                          className="p-0.5 hover:text-stone-900 disabled:opacity-20"
                          title="Move up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveFaqDown(index)}
                          disabled={index === content.faqs.length - 1}
                          className="p-0.5 hover:text-stone-900 disabled:opacity-20"
                          title="Move down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                          #{index + 1}
                        </span>
                        <span className="text-xs font-bold text-stone-900 leading-snug">
                          {faq.q}
                        </span>
                        {isHidden ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-stone-200 text-stone-700 flex items-center gap-1">
                            <EyeOff className="w-3 h-3" />
                            Hidden from Visitors
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            Live on Site
                          </span>
                        )}
                        {faq.category && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-amber-50 text-amber-800 border border-amber-200">
                            {faq.category}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-stone-600 line-clamp-2">
                        <SafeRichText html={faq.a} />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                      {/* Revision History */}
                      <button
                        type="button"
                        onClick={() =>
                          setRevisionModal({
                            isOpen: true,
                            collection: "faqs",
                            key: faq.id,
                            title: faq.q,
                          })
                        }
                        className="p-1.5 rounded-lg text-stone-500 hover:text-amber-800 hover:bg-amber-50 transition-colors"
                        title="View past revisions and restore with 1 click"
                      >
                        <History className="w-4 h-4" />
                      </button>

                      {/* Hide / Show Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleFaq(faq.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isHidden
                            ? "text-stone-400 hover:text-emerald-700 hover:bg-emerald-50"
                            : "text-emerald-700 hover:text-stone-500 hover:bg-stone-100"
                        }`}
                        title={isHidden ? "Unhide and make visible to visitors" : "Hide from visitors (keep saved)"}
                      >
                        {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditFaq(faq)}
                        className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                        title="Edit question and answer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handlePromptDeleteFaq(faq)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-700 hover:bg-red-50 transition-colors"
                        title="Permanently delete this question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 2: CONTACT DETAILS & SANCTUM */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === "contact" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Column */}
            <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-5">
              <div>
                <h2 className="text-sm font-bold text-stone-900">Sanctum Contact & Coordination Info</h2>
                <p className="text-xs text-stone-600">
                  Update phone, WhatsApp, email, and sanctum hours displayed across the website header and footer.
                </p>
              </div>

              {/* Language Tabs */}
              <LanguageTabs
                currentLanguage={contactFormLang}
                onLanguageChange={(l) => setContactFormLang(l)}
                isHindiMissing={false}
              />

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-stone-800">Direct Sanctum Phone Number</label>
                    <CharacterCount current={content.contact.phone.length} max={30} />
                  </div>
                  <input
                    type="text"
                    value={content.contact.phone}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        contact: { ...content.contact, phone: e.target.value },
                      })
                    }
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                    placeholder="+91 931-121-5564"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">Shown to callers on the website</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-stone-800">WhatsApp Number</label>
                    <CharacterCount current={content.contact.whatsapp.length} max={30} />
                  </div>
                  <input
                    type="text"
                    value={content.contact.whatsapp}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        contact: { ...content.contact, whatsapp: e.target.value },
                      })
                    }
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                    placeholder="+91 93112 15564"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-stone-800">WhatsApp Link (One-Touch URL)</label>
                    <span className="text-[11px] text-stone-400">Must start with https://wa.me/</span>
                  </div>
                  <input
                    type="text"
                    value={content.contact.whatsappLink}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        contact: { ...content.contact, whatsappLink: e.target.value },
                      })
                    }
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                    placeholder="https://wa.me/919311215564"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-stone-800">Public Helpdesk / Support Email</label>
                    <CharacterCount current={content.contact.email.length} max={50} />
                  </div>
                  <input
                    type="email"
                    value={content.contact.email}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        contact: { ...content.contact, email: e.target.value },
                      })
                    }
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                    placeholder="contact@aapkaastro.com"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    Public contact address (separate from your private Owner login address)
                  </p>
                </div>

                {contactFormLang === "en" ? (
                  <>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-stone-800">Sanctum Physical Address (English)</label>
                        <CharacterCount current={content.contact.address.length} max={250} />
                      </div>
                      <textarea
                        rows={3}
                        value={content.contact.address}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            contact: { ...content.contact, address: e.target.value },
                          })
                        }
                        className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-stone-800">Operating Hours (English)</label>
                        <CharacterCount current={content.contact.operatingHours.length} max={80} />
                      </div>
                      <input
                        type="text"
                        value={content.contact.operatingHours}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            contact: { ...content.contact, operatingHours: e.target.value },
                          })
                        }
                        className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-stone-800">Sanctum Physical Address (हिन्दी)</label>
                        <CharacterCount current={contactAddressHi.length} max={250} />
                      </div>
                      <textarea
                        rows={3}
                        value={contactAddressHi}
                        onChange={(e) => setContactAddressHi(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-stone-800">Operating Hours (हिन्दी)</label>
                        <CharacterCount current={contactHoursHi.length} max={80} />
                      </div>
                      <input
                        type="text"
                        value={contactHoursHi}
                        onChange={(e) => setContactHoursHi(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() =>
                    setRevisionModal({
                      isOpen: true,
                      collection: "contact",
                      key: "primary",
                      title: "Sanctum Contact Details",
                    })
                  }
                  className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1.5"
                >
                  <History className="w-3.5 h-3.5 text-stone-400" />
                  <span>Revision History</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={isSaving || !canManage}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#7B2D26] text-white hover:bg-[#60231E] transition-colors shadow-xs"
                >
                  Save Contact Info
                </button>
              </div>
            </div>

            {/* Live Preview Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#FDF8EE] p-5 rounded-xl border border-[#E8DCC4] shadow-xs space-y-4 sticky top-24">
                <div className="flex items-center justify-between border-b border-[#E8DCC4] pb-2">
                  <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#7B2D26]" />
                    Live Visitor Preview
                  </span>
                  <span className="text-[10px] font-mono text-stone-500 uppercase">
                    {contactFormLang} Preview
                  </span>
                </div>

                <div className="bg-white p-4 rounded-lg border border-stone-200 space-y-3 shadow-xs">
                  <div className="text-xs font-bold text-stone-900 border-b pb-2 flex items-center justify-between">
                    <span>Aapka Astro Sanctum Desk</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      Verified
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-stone-700">
                    <div className="flex items-center gap-2">
                      <PhoneCall className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="font-semibold">{content.contact.phone || "+91 931-121-5564"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="text-emerald-700 font-medium">WhatsApp: {content.contact.whatsapp}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{content.contact.email}</span>
                    </div>

                    <div className="pt-2 border-t text-[11px] text-stone-600">
                      <strong>Address:</strong>{" "}
                      {contactFormLang === "hi" ? contactAddressHi : content.contact.address}
                    </div>

                    <div className="text-[11px] text-stone-600">
                      <strong>Hours:</strong>{" "}
                      {contactFormLang === "hi" ? contactHoursHi : content.contact.operatingHours}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 3: HERO & ANNOUNCEMENT BANNER */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === "hero" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-5">
              <div>
                <h2 className="text-sm font-bold text-stone-900">Hero Section & Announcement Banner</h2>
                <p className="text-xs text-stone-600">
                  Update the main headlines, experience badge, consultations counter, and festive announcement bar.
                </p>
              </div>

              <LanguageTabs
                currentLanguage={heroFormLang}
                onLanguageChange={(l) => setHeroFormLang(l)}
                isHindiMissing={false}
              />

              <div className="space-y-4">
                {heroFormLang === "en" ? (
                  <>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-stone-800">Badge Text (English)</label>
                        <CharacterCount current={heroBadgeEn.length} max={60} />
                      </div>
                      <input
                        type="text"
                        value={heroBadgeEn}
                        onChange={(e) => {
                          setHeroBadgeEn(e.target.value);
                          setContent({
                            ...content,
                            hero: { ...content.hero, badgeText: e.target.value },
                          });
                        }}
                        className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                        placeholder="20+ Years Mastery • Certified Jyotish Acharya"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-stone-800">Headline Tagline (English)</label>
                        <CharacterCount current={heroHeadlineEn.length} max={100} />
                      </div>
                      <input
                        type="text"
                        value={heroHeadlineEn}
                        onChange={(e) => {
                          setHeroHeadlineEn(e.target.value);
                          setContent({
                            ...content,
                            hero: { ...content.hero, headline: e.target.value },
                          });
                        }}
                        className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                        placeholder="Where Spiritual Science Meets Corporate Insight"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-stone-800">Subheadline Bio (English)</label>
                        <CharacterCount current={heroSubheadlineEn.length} max={250} />
                      </div>
                      <textarea
                        rows={3}
                        value={heroSubheadlineEn}
                        onChange={(e) => {
                          setHeroSubheadlineEn(e.target.value);
                          setContent({
                            ...content,
                            hero: { ...content.hero, subheadline: e.target.value },
                          });
                        }}
                        className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-stone-800">Badge Text (हिन्दी)</label>
                        <CharacterCount current={heroBadgeHi.length} max={60} />
                      </div>
                      <input
                        type="text"
                        value={heroBadgeHi}
                        onChange={(e) => setHeroBadgeHi(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-stone-800">Headline Tagline (हिन्दी)</label>
                        <CharacterCount current={heroHeadlineHi.length} max={100} />
                      </div>
                      <input
                        type="text"
                        value={heroHeadlineHi}
                        onChange={(e) => setHeroHeadlineHi(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-stone-800">Subheadline Bio (हिन्दी)</label>
                        <CharacterCount current={heroSubheadlineHi.length} max={250} />
                      </div>
                      <textarea
                        rows={3}
                        value={heroSubheadlineHi}
                        onChange={(e) => setHeroSubheadlineHi(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                      />
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-stone-800">Experience Years</label>
                      <CharacterCount current={content.hero.experienceYears.length} max={10} />
                    </div>
                    <input
                      type="text"
                      value={content.hero.experienceYears}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hero: { ...content.hero, experienceYears: e.target.value },
                        })
                      }
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                      placeholder="20+"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-stone-800">Consultations Count</label>
                      <CharacterCount current={content.hero.consultationsCount.length} max={30} />
                    </div>
                    <input
                      type="text"
                      value={content.hero.consultationsCount}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hero: { ...content.hero, consultationsCount: e.target.value },
                        })
                      }
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                      placeholder="15,000+ Consultations"
                    />
                  </div>
                </div>

                {/* Announcement Bar Settings */}
                <div className="pt-4 border-t border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-stone-900">Festive Announcement Bar</h3>
                      <p className="text-[11px] text-stone-500">
                        Shows a slim top banner across all pages for festivals, discounts, or special announcements.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setContent({
                          ...content,
                          hero: {
                            ...content.hero,
                            announcementEnabled: !content.hero.announcementEnabled,
                          },
                        })
                      }
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        content.hero.announcementEnabled ? "bg-[#7B2D26]" : "bg-stone-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          content.hero.announcementEnabled ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {content.hero.announcementEnabled && (
                    <div className="space-y-3 pt-2 bg-stone-50 p-3.5 rounded-lg border border-stone-200">
                      <div>
                        <label className="text-xs font-semibold text-stone-800 block mb-1">
                          Announcement Message
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
                          className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300"
                          placeholder="Special Festive Blessing: Flat 50% Off First Consultation"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-stone-800 block mb-1">
                          Action Link URL (Optional)
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
                          className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300"
                          placeholder="/consult"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() =>
                    setRevisionModal({
                      isOpen: true,
                      collection: "hero",
                      key: "home-hero",
                      title: "Hero Banner Content",
                    })
                  }
                  className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1.5"
                >
                  <History className="w-3.5 h-3.5 text-stone-400" />
                  <span>Revision History</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={isSaving || !canManage}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#7B2D26] text-white hover:bg-[#60231E] transition-colors shadow-xs"
                >
                  Save Hero Content
                </button>
              </div>
            </div>

            {/* Live Preview Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#FDF8EE] p-5 rounded-xl border border-[#E8DCC4] shadow-xs space-y-4 sticky top-24">
                <div className="flex items-center justify-between border-b border-[#E8DCC4] pb-2">
                  <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#7B2D26]" />
                    Live Visitor Banner Preview
                  </span>
                  <span className="text-[10px] font-mono text-stone-500 uppercase">
                    {heroFormLang}
                  </span>
                </div>

                {/* Announcement Bar Preview */}
                {content.hero.announcementEnabled && (
                  <div className="bg-amber-900 text-amber-50 text-[11px] font-medium px-3 py-1.5 rounded-md text-center flex items-center justify-center gap-1.5 shadow-xs">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>{content.hero.announcementText || "Special Announcement Message"}</span>
                  </div>
                )}

                {/* Hero Card Preview */}
                <div className="bg-gradient-to-br from-[#7B2D26] to-[#4A1511] text-white p-5 rounded-xl shadow-md space-y-3">
                  <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-200 border border-amber-300/30">
                    {heroFormLang === "hi" ? heroBadgeHi : heroBadgeEn}
                  </div>

                  <h3 className="text-base font-extrabold text-white leading-snug">
                    {heroFormLang === "hi" ? heroHeadlineHi : heroHeadlineEn}
                  </h3>

                  <p className="text-xs text-stone-200 leading-relaxed">
                    {heroFormLang === "hi" ? heroSubheadlineHi : heroSubheadlineEn}
                  </p>

                  <div className="flex items-center gap-3 pt-2 text-xs border-t border-white/10">
                    <div>
                      <span className="font-bold text-amber-300">{content.hero.experienceYears}</span>
                      <span className="text-stone-300 text-[10px] block">Experience</span>
                    </div>
                    <div className="h-4 w-px bg-white/20" />
                    <div>
                      <span className="font-bold text-amber-300">{content.hero.consultationsCount}</span>
                      <span className="text-stone-300 text-[10px] block">Completed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 4: REVIEWS & TESTIMONIALS */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === "reviews" && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-stone-900">Manage Seeker Reviews & Testimonials</h2>
                <p className="text-xs text-stone-600">
                  Curate genuine seeker feedback. Click the Eye icon to hide any review without deleting it permanently.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenAddReview}
                  disabled={!canManage}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#7B2D26] text-white hover:bg-[#60231E] transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Seeker Review</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(content.reviews || []).map((review) => {
                const isHidden = !review.isActive;
                return (
                  <div
                    key={review.id}
                    className={`bg-white rounded-xl border p-4 transition-all flex flex-col justify-between shadow-xs ${
                      isHidden ? "bg-stone-50/80 border-dashed opacity-80" : "border-stone-200"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < review.stars ? "fill-amber-400 text-amber-400" : "text-stone-200"
                              }`}
                            />
                          ))}
                        </div>

                        {isHidden ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-stone-200 text-stone-700">
                            Hidden
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                            Live
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-stone-700 italic line-clamp-4 leading-relaxed">
                        "{review.text}"
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 mt-3 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-stone-900 flex items-center gap-1">
                          <span>{review.clientName}</span>
                          {review.verified && (
                            <span title="Verified Seeker">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-stone-500">
                          {review.city} • {review.service}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleReview(review.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isHidden
                              ? "text-stone-400 hover:text-emerald-700"
                              : "text-emerald-700 hover:text-stone-400"
                          }`}
                          title={isHidden ? "Unhide review" : "Hide from visitors"}
                        >
                          {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditReview(review)}
                          className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900"
                          title="Edit review"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handlePromptDeleteReview(review)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-red-700"
                          title="Permanently delete review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 5: SOCIAL CHANNELS */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === "social" && (
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs max-w-2xl space-y-5">
            <div>
              <h2 className="text-sm font-bold text-stone-900">Official Social Media Profiles</h2>
              <p className="text-xs text-stone-600">
                Configure your verified links for Instagram, YouTube, and Facebook.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">Instagram URL</label>
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
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300"
                  placeholder="https://www.instagram.com/aapkaastrologer/"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">YouTube Channel URL</label>
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
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300"
                  placeholder="https://www.youtube.com/@aapkaastro7900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">Facebook Page URL</label>
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
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300"
                  placeholder="https://www.facebook.com/aapkaastro"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => handleSave()}
                disabled={isSaving || !canManage}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#7B2D26] text-white hover:bg-[#60231E] transition-colors shadow-xs"
              >
                Save Social Links
              </button>
            </div>
          </div>
        )}
      </main>

      {/* -------------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT FAQ (With Bilingual Tabs & Live Accordion Preview) */}
      {/* -------------------------------------------------------------------- */}
      {isFaqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#FFFDF9] border border-[#E8DCC4] rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8DCC4] bg-[#FDF8EE]">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#7B2D26]" />
                <h3 className="text-sm font-bold text-stone-900">
                  {editingFaq ? "Edit Question & Answer" : "Add New Question & Answer"}
                </h3>
              </div>
              <button
                onClick={() => setIsFaqModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Two columns (Editor on left, Live Accordion Preview on right) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 overflow-y-auto flex-1">
              {/* Left Column: Form */}
              <div className="md:col-span-7 space-y-4">
                {/* Language Tabs */}
                <LanguageTabs
                  currentLanguage={faqFormLang}
                  onLanguageChange={(l) => setFaqFormLang(l)}
                  isHindiMissing={!faqFormQHi.trim() || !faqFormAHi.trim()}
                  onCopyEnglishToHindi={() => {
                    setFaqFormQHi(faqFormQEn);
                    setFaqFormAHi(faqFormAEn);
                  }}
                />

                {faqFormLang === "en" ? (
                  <>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-stone-800">
                          Question seekers ask (English)
                        </label>
                        <CharacterCount current={faqFormQEn.length} max={150} />
                      </div>
                      <input
                        type="text"
                        value={faqFormQEn}
                        onChange={(e) => setFaqFormQEn(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                        placeholder="e.g. How does the consultation booking and connection process work?"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-stone-800">
                          Detailed answer from Acharya Ji (English)
                        </label>
                        <CharacterCount current={faqFormAEn.length} max={1000} />
                      </div>
                      <textarea
                        rows={6}
                        value={faqFormAEn}
                        onChange={(e) => setFaqFormAEn(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7B2D26] leading-relaxed"
                        placeholder="Explain the process clearly. You may use formatting like bold text or links (https://, tel:, mailto:, wa.me/)."
                      />
                      <p className="text-[11px] text-stone-500 mt-1">
                        Safe rich text allowed: &lt;b&gt;, &lt;i&gt;, lists, and secure https/wa.me links.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-stone-800">
                          Question seekers ask (हिन्दी)
                        </label>
                        <CharacterCount current={faqFormQHi.length} max={150} />
                      </div>
                      <input
                        type="text"
                        value={faqFormQHi}
                        onChange={(e) => setFaqFormQHi(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                        placeholder="उदा. परामर्श बुकिंग और संपर्क की प्रक्रिया कैसे काम करती है?"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-stone-800">
                          Detailed answer from Acharya Ji (हिन्दी)
                        </label>
                        <CharacterCount current={faqFormAHi.length} max={1000} />
                      </div>
                      <textarea
                        rows={6}
                        value={faqFormAHi}
                        onChange={(e) => setFaqFormAHi(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7B2D26] leading-relaxed"
                        placeholder="विस्तारपूर्वक हिन्दी में उत्तर लिखें।"
                      />
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-bold text-stone-800 block mb-1">Category</label>
                    <select
                      value={faqFormCategory}
                      onChange={(e) => setFaqFormCategory(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white"
                    >
                      <option value="general">General</option>
                      <option value="booking">Consultation & Booking</option>
                      <option value="pricing">Pricing & Fees</option>
                      <option value="vastu">Devta Vastu</option>
                      <option value="gemstones">Certified Gemstones</option>
                      <option value="tools">Free Kundli Calculator</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-800 block mb-1">Publishing Status</label>
                    <select
                      value={faqFormStatus}
                      onChange={(e) => setFaqFormStatus(e.target.value as any)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white font-semibold"
                    >
                      <option value="PUBLISHED">Published (Live for Visitors)</option>
                      <option value="DRAFT">Draft (Owner Preview Only)</option>
                      <option value="HIDDEN">Hidden from Site</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Accordion Preview */}
              <div className="md:col-span-5 bg-[#FDF8EE] p-4 rounded-xl border border-[#E8DCC4] flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E8DCC4] pb-2">
                    <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-[#7B2D26]" />
                      Live Visitor Preview
                    </span>
                    <span className="text-[10px] font-mono text-stone-500 uppercase">
                      {faqFormLang}
                    </span>
                  </div>

                  {faqFormStatus === "DRAFT" && (
                    <div className="px-2.5 py-1 rounded bg-sky-100 text-sky-900 text-[10px] font-bold border border-sky-200 flex items-center gap-1">
                      <span>DRAFT PREVIEW — Visible only to Acharya Ji / Owner</span>
                    </div>
                  )}

                  {/* Accordion Card */}
                  <div className="bg-white rounded-lg border border-stone-200 p-3.5 shadow-xs space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-stone-900 leading-snug">
                        {faqFormLang === "hi" && faqFormQHi.trim()
                          ? faqFormQHi
                          : faqFormQEn || "Question will appear here as you type..."}
                      </h4>
                      <span className="text-stone-400 text-xs font-mono shrink-0">▼</span>
                    </div>

                    <div className="text-xs text-stone-700 leading-relaxed pt-2 border-t border-stone-100">
                      <SafeRichText
                        html={
                          faqFormLang === "hi" && faqFormAHi.trim()
                            ? faqFormAHi
                            : faqFormAEn || "Answer text and formatting will render here safely in real time."
                        }
                      />
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-stone-500 italic pt-4">
                  Formatted in exact accord with website font sizes and mobile layout.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#E8DCC4] bg-[#FDF8EE] flex items-center justify-between">
              <div className="text-xs text-stone-500">
                Status: <strong className="text-stone-800">{faqFormStatus}</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFaqModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-stone-200 text-stone-700 hover:bg-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveFaqModal}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#7B2D26] text-white hover:bg-[#60231E] shadow-xs"
                >
                  {faqFormStatus === "DRAFT" ? "Save as Draft" : "Save & Publish"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT REVIEW (With Bilingual Tabs & Live Card Preview) */}
      {/* -------------------------------------------------------------------- */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#FFFDF9] border border-[#E8DCC4] rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8DCC4] bg-[#FDF8EE]">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-[#7B2D26]" />
                <h3 className="text-sm font-bold text-stone-900">
                  {editingReview ? "Edit Seeker Review" : "Add New Seeker Review"}
                </h3>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 overflow-y-auto flex-1">
              {/* Form */}
              <div className="md:col-span-7 space-y-4">
                <LanguageTabs
                  currentLanguage={reviewFormLang}
                  onLanguageChange={(l) => setReviewFormLang(l)}
                  isHindiMissing={!reviewFormNameHi.trim() || !reviewFormTextHi.trim()}
                  onCopyEnglishToHindi={() => {
                    setReviewFormNameHi(reviewFormNameEn);
                    setReviewFormCityHi(reviewFormCityEn);
                    setReviewFormServiceHi(reviewFormServiceEn);
                    setReviewFormTextHi(reviewFormTextEn);
                  }}
                />

                {reviewFormLang === "en" ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-stone-800">Client Name</label>
                          <CharacterCount current={reviewFormNameEn.length} max={50} />
                        </div>
                        <input
                          type="text"
                          value={reviewFormNameEn}
                          onChange={(e) => setReviewFormNameEn(e.target.value)}
                          className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300"
                          placeholder="Priya Sharma"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-stone-800">City / Designation</label>
                          <CharacterCount current={reviewFormCityEn.length} max={60} />
                        </div>
                        <input
                          type="text"
                          value={reviewFormCityEn}
                          onChange={(e) => setReviewFormCityEn(e.target.value)}
                          className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300"
                          placeholder="New Delhi"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-stone-800">Consultation Service</label>
                        <CharacterCount current={reviewFormServiceEn.length} max={50} />
                      </div>
                      <input
                        type="text"
                        value={reviewFormServiceEn}
                        onChange={(e) => setReviewFormServiceEn(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300"
                        placeholder="Astro Consultation & Gemstones"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-stone-800">Review Text (English)</label>
                        <CharacterCount current={reviewFormTextEn.length} max={500} />
                      </div>
                      <textarea
                        rows={4}
                        value={reviewFormTextEn}
                        onChange={(e) => setReviewFormTextEn(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300"
                        placeholder="Write the seeker's feedback..."
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-stone-800">Client Name (हिन्दी)</label>
                          <CharacterCount current={reviewFormNameHi.length} max={50} />
                        </div>
                        <input
                          type="text"
                          value={reviewFormNameHi}
                          onChange={(e) => setReviewFormNameHi(e.target.value)}
                          className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-stone-800">City / Designation (हिन्दी)</label>
                          <CharacterCount current={reviewFormCityHi.length} max={60} />
                        </div>
                        <input
                          type="text"
                          value={reviewFormCityHi}
                          onChange={(e) => setReviewFormCityHi(e.target.value)}
                          className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-stone-800">Consultation Service (हिन्दी)</label>
                        <CharacterCount current={reviewFormServiceHi.length} max={50} />
                      </div>
                      <input
                        type="text"
                        value={reviewFormServiceHi}
                        onChange={(e) => setReviewFormServiceHi(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-stone-800">Review Text (हिन्दी)</label>
                        <CharacterCount current={reviewFormTextHi.length} max={500} />
                      </div>
                      <textarea
                        rows={4}
                        value={reviewFormTextHi}
                        onChange={(e) => setReviewFormTextHi(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300"
                      />
                    </div>
                  </>
                )}

                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-bold text-stone-800 block mb-1">Star Rating</label>
                    <select
                      value={reviewFormRating}
                      onChange={(e) => setReviewFormRating(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white"
                    >
                      <option value={5}>5 Stars (★★★★★)</option>
                      <option value={4}>4 Stars (★★★★☆)</option>
                      <option value={3}>3 Stars (★★★☆☆)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-800 block mb-1">Verified Seeker</label>
                    <label className="flex items-center gap-2 text-xs text-stone-700 pt-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reviewFormVerified}
                        onChange={(e) => setReviewFormVerified(e.target.checked)}
                        className="rounded border-stone-300 text-[#7B2D26]"
                      />
                      <span>Show Verified Badge</span>
                    </label>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-800 block mb-1">Status</label>
                    <select
                      value={reviewFormStatus}
                      onChange={(e) => setReviewFormStatus(e.target.value as any)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white font-semibold"
                    >
                      <option value="PUBLISHED">Published</option>
                      <option value="DRAFT">Draft</option>
                      <option value="HIDDEN">Hidden</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Card Preview */}
              <div className="md:col-span-5 bg-[#FDF8EE] p-4 rounded-xl border border-[#E8DCC4] flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E8DCC4] pb-2">
                    <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-[#7B2D26]" />
                      Live Visitor Card Preview
                    </span>
                    <span className="text-[10px] font-mono text-stone-500 uppercase">
                      {reviewFormLang}
                    </span>
                  </div>

                  <div className="bg-white rounded-lg border border-stone-200 p-4 shadow-xs space-y-2.5">
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < reviewFormRating ? "fill-amber-400 text-amber-400" : "text-stone-200"
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-xs text-stone-700 italic leading-relaxed">
                      "{reviewFormLang === "hi" && reviewFormTextHi.trim()
                        ? reviewFormTextHi
                        : reviewFormTextEn || "Feedback text will render here..."}"
                    </p>

                    <div className="pt-2 border-t text-xs">
                      <div className="font-bold text-stone-900 flex items-center gap-1">
                        <span>
                          {reviewFormLang === "hi" && reviewFormNameHi.trim()
                            ? reviewFormNameHi
                            : reviewFormNameEn || "Client Name"}
                        </span>
                        {reviewFormVerified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                      </div>
                      <div className="text-[10px] text-stone-500">
                        {reviewFormLang === "hi" && reviewFormCityHi.trim()
                          ? reviewFormCityHi
                          : reviewFormCityEn || "City"}{" "}
                        •{" "}
                        {reviewFormLang === "hi" && reviewFormServiceHi.trim()
                          ? reviewFormServiceHi
                          : reviewFormServiceEn || "Service"}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-stone-500 italic pt-4">
                  Displays live on the home page testimonials carousel.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#E8DCC4] bg-[#FDF8EE] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-stone-200 text-stone-700 hover:bg-stone-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveReviewModal}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#7B2D26] text-white hover:bg-[#60231E] shadow-xs"
              >
                Save Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* REVISION HISTORY MODAL */}
      {/* -------------------------------------------------------------------- */}
      <RevisionHistoryModal
        isOpen={revisionModal.isOpen}
        onClose={() => setRevisionModal({ ...revisionModal, isOpen: false })}
        collection={revisionModal.collection}
        itemKey={revisionModal.key}
        itemTitle={revisionModal.title}
        onRestored={reloadData}
      />

      {/* -------------------------------------------------------------------- */}
      {/* PERMANENT DELETE CONFIRMATION MODAL */}
      {/* -------------------------------------------------------------------- */}
      <PermanentDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirmDelete={() => {
          if (deleteModal.collection === "faqs") {
            handleExecuteDeleteFaq();
          } else if (deleteModal.collection === "testimonials") {
            handleExecuteDeleteReview();
          }
        }}
        onHideInstead={() => {
          if (deleteModal.collection === "faqs") {
            handleToggleFaq(deleteModal.id);
          } else if (deleteModal.collection === "testimonials") {
            handleToggleReview(deleteModal.id);
          }
        }}
        itemTitle={deleteModal.title}
        itemType={deleteModal.collection === "faqs" ? "Question" : "Review"}
      />
    </div>
  );
}
