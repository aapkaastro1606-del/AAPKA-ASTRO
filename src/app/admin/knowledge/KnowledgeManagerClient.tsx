"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminHelpPanel } from "@/components/admin/AdminHelpPanel";
import { DataStateView, parseFetchError, DataStateError } from "@/components/admin/DataStateView";
import {
  BookOpen,
  HelpCircle,
  PlusCircle,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Search,
  Filter,
  Check,
  X,
  Sparkles,
  Shield,
  Clock,
  Send,
} from "lucide-react";

interface KnowledgeEntry {
  id: string;
  question: string;
  answer: string;
  language: "en" | "hi" | "hinglish";
  category: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UnansweredQuestion {
  id: string;
  question: string;
  language: string;
  count: number;
  resolved: boolean;
  lastAskedAt: string;
  createdAt: string;
}

interface Props {
  currentUserEmail: string | null;
}

export default function KnowledgeManagerClient({ currentUserEmail }: Props) {
  const [activeTab, setActiveTab] = useState<"entries" | "unanswered">("entries");
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [unanswered, setUnanswered] = useState<UnansweredQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [fetchError, setFetchError] = useState<DataStateError | null>(null);

  // Search & filter
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formQuestion, setFormQuestion] = useState("");
  const [formAnswer, setFormAnswer] = useState("");
  const [formLanguage, setFormLanguage] = useState<"en" | "hi" | "hinglish">("en");
  const [formCategory, setFormCategory] = useState("general");
  const [formPublished, setFormPublished] = useState(true);
  const [convertingQuestionId, setConvertingQuestionId] = useState<string | null>(null);

  const loadAll = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [resEntries, resUnanswered] = await Promise.all([
        fetch("/api/admin/knowledge"),
        fetch("/api/admin/knowledge/unanswered"),
      ]);

      if (!resEntries.ok) {
        const errData = await resEntries.json().catch(() => ({}));
        const err = parseFetchError(resEntries, errData);
        setFetchError(err);
        setEntries([]);
        return;
      }
      if (!resUnanswered.ok) {
        const errData = await resUnanswered.json().catch(() => ({}));
        const err = parseFetchError(resUnanswered, errData);
        setFetchError(err);
        return;
      }

      const dataEntries = await resEntries.json();
      const dataUnanswered = await resUnanswered.json();

      if (dataEntries.success) {
        setEntries(dataEntries.entries || []);
      } else {
        const err = parseFetchError(resEntries, dataEntries);
        setFetchError(err);
        setEntries([]);
        return;
      }

      if (dataUnanswered.success) {
        setUnanswered(dataUnanswered.questions || []);
      }
      setFetchError(null);
    } catch (err: any) {
      setFetchError({ status: 500, message: "Could not load. Retry." });
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEntries = () => loadAll();
  const fetchUnanswered = () => loadAll();

  useEffect(() => {
    loadAll();
  }, []);

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim() || !formAnswer.trim()) {
      setMsg({ type: "error", text: "Question and Answer are required." });
      return;
    }

    setSaving(true);
    setMsg(null);

    try {
      if (editingId) {
        // Update
        const res = await fetch("/api/admin/knowledge", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingId,
            question: formQuestion.trim(),
            answer: formAnswer.trim(),
            language: formLanguage,
            category: formCategory,
            published: formPublished,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Failed to update entry");
        setMsg({ type: "success", text: "Knowledge entry updated successfully!" });
      } else {
        // Create
        const res = await fetch("/api/admin/knowledge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: formQuestion.trim(),
            answer: formAnswer.trim(),
            language: formLanguage,
            category: formCategory,
            published: formPublished,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Failed to create entry");

        // If converting an unanswered question, mark it resolved
        if (convertingQuestionId) {
          await fetch("/api/admin/knowledge/unanswered", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "resolve", id: convertingQuestionId }),
          });
          setConvertingQuestionId(null);
        }

        setMsg({ type: "success", text: "New knowledge entry published to AI Assistant!" });
      }

      // Reset form
      setShowForm(false);
      setEditingId(null);
      setFormQuestion("");
      setFormAnswer("");
      await loadAll();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "An error occurred while saving." });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this knowledge entry?")) return;
    try {
      const res = await fetch(`/api/admin/knowledge?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete");
      setMsg({ type: "success", text: "Entry deleted successfully." });
      await fetchEntries();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Failed to delete entry." });
    }
  };

  const handleTogglePublish = async (entry: KnowledgeEntry) => {
    try {
      const res = await fetch("/api/admin/knowledge", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: entry.id,
          published: !entry.published,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      await fetchEntries();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
    }
  };

  const handleStartEdit = (entry: KnowledgeEntry) => {
    setEditingId(entry.id);
    setFormQuestion(entry.question);
    setFormAnswer(entry.answer);
    setFormLanguage(entry.language);
    setFormCategory(entry.category);
    setFormPublished(entry.published);
    setConvertingQuestionId(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleConvertQuestion = (q: UnansweredQuestion) => {
    setEditingId(null);
    setConvertingQuestionId(q.id);
    setFormQuestion(q.question);
    setFormAnswer("");
    setFormLanguage((q.language as any) || "en");
    setFormCategory("faq");
    setFormPublished(true);
    setActiveTab("entries");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResolveQuestion = async (id: string) => {
    try {
      const res = await fetch("/api/admin/knowledge/unanswered", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resolve", id }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: "success", text: "Question marked as resolved." });
        await fetchUnanswered();
      }
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
    }
  };

  const handleRetentionCleanup = async () => {
    try {
      const res = await fetch("/api/admin/knowledge/unanswered", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cleanup" }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: "success", text: data.message });
        await fetchUnanswered();
      }
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
    }
  };

  const filteredEntries = entries.filter((e) => {
    const matchesSearch =
      e.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === "all" || e.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-[#FFFDF9] py-10 px-4 sm:px-6 lg:px-8 text-[#3B2A1E]">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#7B2D26] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Admin Home
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/pricing"
              className="text-xs text-[#6E5545] hover:text-[#7B2D26] px-2.5 py-1 rounded-md border border-[#E8D8C3]"
            >
              Pricing Desk
            </Link>
            <Link
              href="/admin/team"
              className="text-xs text-[#6E5545] hover:text-[#7B2D26] px-2.5 py-1 rounded-md border border-[#E8D8C3]"
            >
              Team Access
            </Link>
            <Link
              href="/admin/diagnostics"
              className="text-xs text-[#6E5545] hover:text-[#7B2D26] px-2.5 py-1 rounded-md border border-[#E8D8C3]"
            >
              Diagnostics
            </Link>
          </div>
        </div>

        {/* Header */}
        <div className="border-b border-[#E8D8C3] pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7B2D26]/10 text-[#7B2D26] text-xs font-bold uppercase tracking-wider mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              AI Assistant Knowledge Desk
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-temple text-[#7B2D26]">
              Grounding &amp; Knowledge Base Console
            </h1>
            <p className="text-xs text-[#6E5545] mt-1">
              Owner-only management console ({currentUserEmail}). Teach the AI Assistant verified answers without code.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingId(null);
              setConvertingQuestionId(null);
              setFormQuestion("");
              setFormAnswer("");
              setShowForm(!showForm);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#7B2D26] text-white text-xs font-bold hover:bg-[#60231D] transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            {showForm ? "Close Form" : "New Knowledge Entry"}
          </button>
        </div>

        {/* How-To Help Panel for Non-Technical Owner */}
        <AdminHelpPanel
          title="How to teach the AI chatbot new answers"
          steps={[
            {
              title: "What is this page for?",
              description: "This allows you to teach the website AI assistant verified answers about your services, remedies, or rules without writing code.",
            },
            {
              title: "Add a new answer",
              description: "Click 'New Knowledge Entry'. Enter the question seekers ask and your authentic answer. The assistant learns it instantly.",
            },
            {
              title: "Unanswered Questions Tab",
              description: "Check the 'Unanswered Questions' tab below to see what seekers asked that the assistant couldn't answer. Click 'Teach Answer' to add it.",
            },
          ]}
          tip="The AI assistant is strictly grounded. It will only give answers you have verified and will never invent remedies or fees."
          defaultExpanded={true}
        />

        {/* Status Message */}
        {msg && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
              msg.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {msg.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{msg.text}</span>
            </div>
            <button onClick={() => setMsg(null)} className="text-xs opacity-60 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-[#E8D8C3] shadow-xs">
            <span className="text-[11px] font-semibold text-[#6E5545] uppercase tracking-wider block">
              Published Knowledge Entries
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-[#7B2D26]">
                {entries.filter((e) => e.published).length}
              </span>
              <span className="text-xs text-[#6E5545]">/ {entries.length} total</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E8D8C3] shadow-xs">
            <span className="text-[11px] font-semibold text-[#6E5545] uppercase tracking-wider block">
              Unanswered Questions Pending
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-amber-700">
                {unanswered.filter((q) => !q.resolved).length}
              </span>
              <span className="text-xs text-[#6E5545]">logged from visitors</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E8D8C3] shadow-xs">
            <span className="text-[11px] font-semibold text-[#6E5545] uppercase tracking-wider block">
              Privacy &amp; Data Safeguard
            </span>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-[#6E5545]">
              <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>PII stripped &bull; 30-day retention</span>
            </div>
          </div>
        </div>

        {/* Create / Edit Form Drawer */}
        {showForm && (
          <form
            onSubmit={handleSaveEntry}
            className="p-6 rounded-2xl bg-white border-2 border-[#7B2D26]/20 shadow-md space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#E8D8C3] pb-3">
              <h2 className="text-base font-bold font-temple text-[#7B2D26] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                {editingId
                  ? "Edit Knowledge Entry"
                  : convertingQuestionId
                  ? "Convert Visitor Query to Verified Knowledge"
                  : "Add New Grounded Knowledge Entry"}
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-xs text-[#6E5545] hover:text-[#7B2D26]"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#3B2A1E] mb-1">
                  Visitor Question / Query Pattern *
                </label>
                <input
                  type="text"
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder="e.g. Can Acharya Ji consult for business partnership disputes?"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8D8C3] focus:outline-hidden focus:border-[#7B2D26] bg-[#FFFDF9]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3B2A1E] mb-1">
                  Authoritative Grounded Answer *
                </label>
                <textarea
                  value={formAnswer}
                  onChange={(e) => setFormAnswer(e.target.value)}
                  placeholder="Provide the exact factual answer. Prices will automatically be reinforced from live data."
                  rows={4}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8D8C3] focus:outline-hidden focus:border-[#7B2D26] bg-[#FFFDF9]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#3B2A1E] mb-1">Language</label>
                  <select
                    value={formLanguage}
                    onChange={(e: any) => setFormLanguage(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8D8C3] focus:outline-hidden focus:border-[#7B2D26] bg-white"
                  >
                    <option value="en">English (en)</option>
                    <option value="hi">Hindi (hi)</option>
                    <option value="hinglish">Hinglish</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3B2A1E] mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8D8C3] focus:outline-hidden focus:border-[#7B2D26] bg-white"
                  >
                    <option value="general">General</option>
                    <option value="services">Services</option>
                    <option value="pricing">Pricing &amp; Offers</option>
                    <option value="acharya">Acharya Credentials</option>
                    <option value="vaastu">Devta Vaastu</option>
                    <option value="faq">FAQ</option>
                    <option value="legal">Policies &amp; Legal</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="publishedCheck"
                    checked={formPublished}
                    onChange={(e) => setFormPublished(e.target.checked)}
                    className="h-4 w-4 rounded-sm border-[#E8D8C3] text-[#7B2D26] focus:ring-[#7B2D26]"
                  />
                  <label htmlFor="publishedCheck" className="text-xs font-semibold text-[#3B2A1E]">
                    Publish to Live AI Assistant
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-[#7B2D26] text-white text-xs font-bold hover:bg-[#60231D] disabled:opacity-50 transition-colors shadow-xs"
              >
                {saving ? "Saving..." : editingId ? "Update Entry" : "Save & Publish"}
              </button>
            </div>
          </form>
        )}

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-[#E8D8C3]">
          <button
            onClick={() => setActiveTab("entries")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "entries"
                ? "border-[#7B2D26] text-[#7B2D26]"
                : "border-transparent text-[#6E5545] hover:text-[#3B2A1E]"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Knowledge Entries ({entries.length})
          </button>
          <button
            onClick={() => setActiveTab("unanswered")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "unanswered"
                ? "border-[#7B2D26] text-[#7B2D26]"
                : "border-transparent text-[#6E5545] hover:text-[#3B2A1E]"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Unanswered / Low-Confidence Queries ({unanswered.filter((q) => !q.resolved).length})
          </button>
        </div>

        {/* TAB 1: Knowledge Entries */}
        {activeTab === "entries" && (
          <div className="space-y-4">
            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#6E5545]" />
                <input
                  type="text"
                  placeholder="Search entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E8D8C3] focus:outline-hidden focus:border-[#7B2D26] bg-white"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-[#6E5545]" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-[#E8D8C3] bg-white text-[#3B2A1E]"
                >
                  <option value="all">All Categories</option>
                  <option value="services">Services</option>
                  <option value="pricing">Pricing</option>
                  <option value="acharya">Acharya Credentials</option>
                  <option value="vaastu">Devta Vaastu</option>
                  <option value="faq">FAQ</option>
                  <option value="general">General</option>
                </select>
                <button
                  onClick={fetchEntries}
                  className="p-2 rounded-xl border border-[#E8D8C3] bg-white hover:bg-[#FBF3E7] text-[#6E5545]"
                  title="Refresh"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Entries List */}
            <DataStateView
              loading={loading}
              error={fetchError}
              isEmpty={filteredEntries.length === 0}
              onRetry={loadAll}
              loadingMessage="Loading knowledge base..."
              emptyView={
                <div className="p-8 rounded-2xl bg-white border border-[#E8D8C3] text-center space-y-2">
                  <p className="text-xs font-semibold text-[#6E5545]">
                    No custom knowledge entries match your filter.
                  </p>
                  <p className="text-[11px] text-[#8C7464]">
                    The AI Assistant currently uses verified static site files and live database pricing. You can add specialized Q&amp;A pairs here!
                  </p>
                </div>
              }
            >
              <div className="space-y-3">
                {filteredEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 rounded-2xl bg-white border border-[#E8D8C3] shadow-xs space-y-2 hover:border-[#7B2D26]/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#FBF3E7] text-[#7B2D26]">
                            {entry.category}
                          </span>
                          <span className="text-[10px] text-[#8C7464] uppercase font-mono">
                            {entry.language}
                          </span>
                          <button
                            onClick={() => handleTogglePublish(entry)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                              entry.published
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-neutral-100 text-neutral-600"
                            }`}
                          >
                            {entry.published ? "● Published" : "○ Draft"}
                          </button>
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-[#3B2A1E]">
                          {entry.question}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleStartEdit(entry)}
                          className="p-1.5 rounded-lg text-[#6E5545] hover:text-[#7B2D26] hover:bg-[#FBF3E7]"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="p-1.5 rounded-lg text-[#6E5545] hover:text-red-700 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-[#6E5545] leading-relaxed bg-[#FFFDF9] p-3 rounded-xl border border-[#E8D8C3]/60">
                      {entry.answer}
                    </p>
                  </div>
                ))}
              </div>
            </DataStateView>
          </div>
        )}

        {/* TAB 2: Unanswered & Low-Confidence Queries */}
        {activeTab === "unanswered" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#FBF3E7] border border-[#E8A33D]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#7B2D26]">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Privacy Disclosure &amp; 30-Day Retention:</strong>
                  <p className="text-[11px] text-[#6E5545] mt-0.5">
                    Visitor questions that the AI was uncertain about are logged here so you can teach the assistant new answers. All emails and phone numbers are automatically masked before saving. Questions are kept for 30 days per our Privacy Policy.
                  </p>
                </div>
              </div>

              <button
                onClick={handleRetentionCleanup}
                className="shrink-0 px-3 py-1.5 rounded-lg border border-[#7B2D26]/40 text-[#7B2D26] hover:bg-[#7B2D26] hover:text-white text-xs font-bold transition-colors"
              >
                Run 30-Day Cleanup
              </button>
            </div>

            <DataStateView
              loading={loading}
              error={fetchError}
              isEmpty={unanswered.length === 0}
              onRetry={loadAll}
              loadingMessage="Loading logged queries..."
              emptyView={
                <div className="p-8 rounded-2xl bg-white border border-[#E8D8C3] text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="text-xs font-semibold text-[#6E5545]">
                    No unanswered or low-confidence questions logged!
                  </p>
                  <p className="text-[11px] text-[#8C7464]">
                    When visitors ask queries that don't match the current knowledge base, they will appear here with frequency counts.
                  </p>
                </div>
              }
            >
              <div className="rounded-2xl bg-white border border-[#E8D8C3] overflow-hidden shadow-xs">
                <div className="divide-y divide-[#E8D8C3]">
                  {unanswered.map((q) => (
                    <div
                      key={q.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FFFDF9] transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#7B2D26]/10 text-[#7B2D26]">
                            Asked {q.count} {q.count === 1 ? "time" : "times"}
                          </span>
                          <span className="text-[10px] text-[#8C7464] uppercase font-mono">
                            {q.language}
                          </span>
                          <span className="text-[10px] text-[#8C7464] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(q.lastAskedAt).toLocaleDateString()}
                          </span>
                          {q.resolved && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Resolved
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-[#3B2A1E]">
                          {q.question}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleConvertQuestion(q)}
                          className="px-3 py-1.5 rounded-xl bg-[#7B2D26] text-white text-xs font-bold hover:bg-[#60231D] transition-colors flex items-center gap-1.5"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          Create Entry
                        </button>
                        {!q.resolved && (
                          <button
                            onClick={() => handleResolveQuestion(q.id)}
                            className="px-3 py-1.5 rounded-xl border border-[#E8D8C3] text-[#6E5545] hover:bg-[#FBF3E7] text-xs font-semibold transition-colors"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DataStateView>
          </div>
        )}
      </div>
    </div>
  );
}
