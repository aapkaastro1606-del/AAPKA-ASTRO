"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { BlogStore, BlogPost } from "@/lib/store/blogStore";
import { PLACEHOLDER_ASTROLOGER } from "@/config/placeholderContent";
import {
  BookOpen,
  Plus,
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  Calendar,
  Save,
  X,
  Lock,
  AlertCircle,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Sparkles,
} from "lucide-react";

const VEDIC_COVER_PRESETS = [
  {
    label: "Planetary Transits",
    icon: "🪐",
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Kundli & Horoscopes",
    icon: "🔮",
    url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Vastu Shastra",
    icon: "🏛️",
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Vedic Gemstones",
    icon: "💎",
    url: "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Panchang & Muhurata",
    icon: "🪔",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Vedic Remedies",
    icon: "🕉️",
    url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
  },
];

interface BlogManagerClientProps {
  canManage: boolean;
}

export default function BlogManagerClient({ canManage }: BlogManagerClientProps) {
  const [posts, setPosts] = useState<BlogPost[]>(() => BlogStore.getAllPosts());
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (JPEG, PNG, or WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        // Optimize to max 1200px width/height while maintaining aspect ratio
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85);
          if (editingPost) {
            setEditingPost({ ...editingPost, coverImage: compressedBase64 });
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleCreateNew = () => {
    if (!canManage) {
      alert("Permission Denied: MANAGE access level is required to author articles.");
      return;
    }
    setEditingPost({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      category: "Vedic Astrology",
      author: PLACEHOLDER_ASTROLOGER.displayName,
      authorAvatar: PLACEHOLDER_ASTROLOGER.avatarUrl,
      coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
      publishedAt: new Date().toISOString().split("T")[0],
      readTime: "5 min read",
      tags: ["Jyotish", "Remedies"],
      status: "published",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (post: BlogPost) => {
    if (!canManage) {
      alert("Permission Denied: MANAGE access level is required to edit articles.");
      return;
    }
    setEditingPost({ ...post });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!canManage) {
      alert("Permission Denied: MANAGE access level is required to delete articles.");
      return;
    }
    if (!confirm("Are you sure you want to delete this article?")) return;

    try {
      const res = await fetch(`/api/dashboard/blog?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setStatusMsg({ type: "error", text: data.message || "Failed to delete article." });
        return;
      }
      BlogStore.deletePost(id);
      setPosts(BlogStore.getAllPosts());
      setStatusMsg({ type: "success", text: "Article deleted successfully." });
    } catch {
      BlogStore.deletePost(id);
      setPosts(BlogStore.getAllPosts());
    }
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) {
      alert("Permission Denied: MANAGE access level is required to save articles.");
      return;
    }
    if (!editingPost?.title || !editingPost?.content) {
      alert("Please provide at least a title and content.");
      return;
    }

    const slug =
      editingPost.slug ||
      editingPost.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const payload = {
      id: editingPost.id,
      title: editingPost.title,
      slug,
      excerpt: editingPost.excerpt || editingPost.title,
      content: editingPost.content,
      category: editingPost.category || "Vedic Astrology",
      author: editingPost.author || PLACEHOLDER_ASTROLOGER.displayName,
      authorAvatar: editingPost.authorAvatar || PLACEHOLDER_ASTROLOGER.avatarUrl,
      coverImage: editingPost.coverImage || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
      publishedAt: editingPost.publishedAt || new Date().toISOString().split("T")[0],
      readTime: editingPost.readTime || "5 min read",
      tags: editingPost.tags || ["Vedic"],
      status: editingPost.status || "published",
    };

    try {
      const res = await fetch("/api/dashboard/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatusMsg({ type: "error", text: data.message || "Failed to save article." });
        return;
      }
      BlogStore.savePost(payload as any);
      setPosts(BlogStore.getAllPosts());
      setIsModalOpen(false);
      setEditingPost(null);
      setStatusMsg({ type: "success", text: "Article saved and published successfully." });
    } catch {
      BlogStore.savePost(payload as any);
      setPosts(BlogStore.getAllPosts());
      setIsModalOpen(false);
      setEditingPost(null);
    }
  };

  return (
    <div className="bg-[#FBF3E7] text-[#3B2A1E] min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Navigation & Header */}
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7B2D26] hover:underline mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Operator Cockpit</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-temple text-2xl sm:text-3xl font-bold text-[#7B2D26]">
                  Vedic Journal &amp; Blog Editor
                </span>
                {!canManage && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 text-[11px] font-bold">
                    <Lock className="h-3 w-3" />
                    View-Only Mode
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-[#6E5545]">
                Author, schedule, and curate Jyotish treatises to educate seekers and drive organic search traffic.
              </p>
            </div>

            {canManage ? (
              <button
                type="button"
                onClick={handleCreateNew}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#7B2D26] px-5 py-2.5 text-xs font-bold text-[#FBF3E7] hover:bg-[#96372E] transition-all shadow-sm shrink-0"
              >
                <Plus className="h-4 w-4 text-[#E8A33D]" />
                <span>Write New Article</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 rounded-xl bg-[#E8D8C3]/50 px-4 py-2 text-xs font-bold text-[#6E5545] border border-[#E8D8C3] cursor-not-allowed">
                <Lock className="h-4 w-4 text-[#6E5545]" />
                <span>MANAGE Access Required to Publish</span>
              </div>
            )}
          </div>
        </div>

        {/* View-Only Notice Banner */}
        {!canManage && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-4 text-xs text-amber-900 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Staff Read-Only View Active</p>
              <p className="mt-0.5 text-amber-800">
                You have active <strong>VIEW</strong> permissions for the Vedic Journal. You can read and review articles.
                Creation, modification, and deletion are restricted to staff accounts with <strong>MANAGE</strong> access granted by the Platform Owner.
              </p>
            </div>
          </div>
        )}

        {statusMsg && (
          <div
            className={`rounded-2xl p-4 text-xs flex items-center justify-between ${
              statusMsg.type === "success"
                ? "bg-emerald-50 border border-emerald-300 text-emerald-900"
                : "bg-rose-50 border border-rose-300 text-rose-900"
            }`}
          >
            <span>{statusMsg.text}</span>
            <button
              onClick={() => setStatusMsg(null)}
              className="text-xs font-bold hover:underline ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Blog Posts Management Table */}
        <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E8D8C3] text-[#6E5545]">
                  <th className="pb-3 font-bold">Article Details</th>
                  <th className="pb-3 font-bold">Category</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold">Date</th>
                  <th className="pb-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8D8C3]">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-[#FBF3E7]/50">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="relative aspect-[16/10] w-16 h-10 sm:w-20 sm:h-12 rounded-xl overflow-hidden bg-[#3B2A1E] shrink-0 border border-[#E8D8C3] shadow-xs">
                          <img
                            src={post.coverImage || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80"}
                            alt={post.title}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80";
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-temple font-bold text-[#7B2D26] text-sm line-clamp-1">
                            {post.title}
                          </div>
                          <span className="text-[11px] text-[#6E5545] line-clamp-1">
                            slug: /{post.slug} • {post.readTime}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="rounded bg-[#FBF3E7] px-2 py-0.5 text-[11px] font-bold text-[#C1662F] border border-[#E8D8C3]">
                        {post.category}
                      </span>
                    </td>
                    <td className="py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          post.status === "published"
                            ? "bg-[#6B8E5A]/15 text-[#2A4720] border border-[#6B8E5A]/30"
                            : post.status === "scheduled"
                            ? "bg-[#E8A33D]/20 text-[#7B2D26] border border-[#E8A33D]/30"
                            : "bg-[#A8988B]/20 text-[#3B2A1E]"
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="py-4 text-[#6E5545]">{post.publishedAt}</td>
                    <td className="py-4 text-right space-x-2">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="rounded-lg p-1.5 text-[#6E5545] hover:text-[#7B2D26] inline-block"
                        title="View Public Post"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      {canManage ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleEdit(post)}
                            className="rounded-lg p-1.5 text-[#C1662F] hover:text-[#7B2D26]"
                            title="Edit Article"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(post.id)}
                            className="rounded-lg p-1.5 text-rose-500 hover:text-rose-700"
                            title="Delete Article"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <span
                          className="text-[10px] text-[#A8988B] italic inline-block py-1.5 px-2"
                          title="Read-only mode"
                        >
                          View only
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Editor Modal (only for canManage) */}
      {canManage && isModalOpen && editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E8D8C3] pb-4 mb-6">
              <h3 className="font-temple text-xl font-bold text-[#7B2D26]">
                {editingPost.id ? "Edit Article" : "Compose New Article"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#6E5545] hover:text-[#3B2A1E]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePost} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#3B2A1E] mb-1">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Navigating Saturn Retrograde: Astrological Analysis"
                  value={editingPost.title || ""}
                  onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                  className="w-full rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] p-2.5 text-xs text-[#3B2A1E] focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#3B2A1E] mb-1">Category</label>
                  <select
                    value={editingPost.category || "Vedic Astrology"}
                    onChange={(e) =>
                      setEditingPost({
                        ...editingPost,
                        category: e.target.value as BlogPost["category"],
                      })
                    }
                    className="w-full rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] p-2.5 text-xs text-[#3B2A1E] focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                  >
                    <option value="Vedic Astrology">Vedic Astrology</option>
                    <option value="Planetary Transits">Planetary Transits</option>
                    <option value="Vastu Shastra">Vastu Shastra</option>
                    <option value="Gemology">Gemology</option>
                    <option value="Remedies">Remedies</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#3B2A1E] mb-1">Publication Status</label>
                  <select
                    value={editingPost.status || "published"}
                    onChange={(e) =>
                      setEditingPost({
                        ...editingPost,
                        status: e.target.value as BlogPost["status"],
                      })
                    }
                    className="w-full rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] p-2.5 text-xs text-[#3B2A1E] focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                  >
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Article Cover Image Selection & Live Preview */}
              <div className="rounded-2xl border border-[#E8D8C3] bg-[#FAF5EE] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-[#3B2A1E]">
                    Article Cover Image
                  </label>
                  <span className="text-[10px] text-[#6E5545]">
                    Recommended 16:9 ratio (1200x675)
                  </span>
                </div>

                {/* Live Preview Canvas */}
                <div className="relative aspect-[16/9] w-full max-h-52 overflow-hidden rounded-xl border border-[#E8D8C3] bg-[#2A1D15] flex items-center justify-center shadow-inner group">
                  {editingPost.coverImage ? (
                    <>
                      <img
                        src={editingPost.coverImage}
                        alt="Article Cover Preview"
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3.5 py-1.5 rounded-lg bg-white/95 text-xs font-bold text-[#3B2A1E] hover:bg-white flex items-center gap-1.5 shadow-md cursor-pointer"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          <span>Change Image</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-white/70 p-4 text-center">
                      <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
                      <span className="text-xs font-semibold">No cover image selected</span>
                      <span className="text-[10px] text-white/50 mt-0.5">Upload a photo from your device or pick a preset below</span>
                    </div>
                  )}
                </div>

                {/* URL Input & Device File Upload */}
                <div className="space-y-2.5">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6E5545]" />
                      <input
                        type="text"
                        placeholder="Paste image link (https://... or /gallery/...)"
                        value={editingPost.coverImage || ""}
                        onChange={(e) =>
                          setEditingPost({ ...editingPost, coverImage: e.target.value })
                        }
                        className="w-full rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] py-2 pl-9 pr-3 text-xs text-[#3B2A1E] focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                      />
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-xl border border-[#7B2D26] bg-[#FFFDF9] px-3.5 py-2 text-xs font-bold text-[#7B2D26] hover:bg-[#7B2D26] hover:text-[#FBF3E7] transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                      title="Upload an image directly from your computer or phone"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload from Device</span>
                    </button>
                  </div>

                  {/* 1-Click Curated Vedic Presets */}
                  <div>
                    <span className="text-[10px] font-bold text-[#6E5545] uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-[#E8A33D]" />
                      <span>Or Pick a 1-Click Vedic Topic Preset:</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {VEDIC_COVER_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() =>
                            setEditingPost({ ...editingPost, coverImage: preset.url })
                          }
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all border flex items-center gap-1 cursor-pointer ${
                            editingPost.coverImage === preset.url
                              ? "bg-[#7B2D26] text-white border-[#7B2D26] shadow-xs"
                              : "bg-[#FFFDF9] text-[#6E5545] border-[#E8D8C3] hover:border-[#7B2D26] hover:text-[#7B2D26]"
                          }`}
                        >
                          <span>{preset.icon}</span>
                          <span>{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#3B2A1E] mb-1">Excerpt / Summary</label>
                <textarea
                  rows={2}
                  value={editingPost.excerpt || ""}
                  onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                  placeholder="Short introductory summary for search engines and cards..."
                  className="w-full rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] p-2.5 text-xs text-[#3B2A1E] focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#3B2A1E] mb-1">
                  Full Article Body (Markdown supported) *
                </label>
                <textarea
                  rows={8}
                  required
                  value={editingPost.content || ""}
                  onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                  placeholder="### Section Heading&#10;Write ancient treatise content, planetary remedies..."
                  className="w-full rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] p-3 font-mono text-xs text-[#3B2A1E] focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#E8D8C3]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-[#E8D8C3] px-4 py-2 font-semibold text-[#6E5545] hover:bg-[#FBF3E7]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#7B2D26] px-5 py-2 font-bold text-white hover:bg-[#96372E] shadow-sm flex items-center gap-1.5"
                >
                  <Save className="h-4 w-4 text-[#E8A33D]" />
                  <span>Save &amp; Publish Article</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
