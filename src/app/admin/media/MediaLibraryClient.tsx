"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Copy,
  Trash2,
  Lock,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  Sparkles,
  ShieldCheck,
  Check,
  X,
  FileCheck,
} from "lucide-react";
import { AdminHelpPanel } from "@/components/admin/AdminHelpPanel";
import { CharacterCount } from "@/components/content/CharacterCount";
import { optimizeImageClient, OptimizationResult } from "@/lib/media/imageOptimizer";
import { StorageConfigStatus, MAX_IMAGE_SIZE_BYTES } from "@/lib/storage/r2PublicStorage";

export interface MediaAssetWithUsage {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  fileSize?: number | null;
  altTextEn?: string | null;
  altTextHi?: string | null;
  collection?: string | null;
  uploadedBy?: string | null;
  createdAt: string;
  inUse?: boolean;
  usedIn?: string[];
}

interface MediaLibraryClientProps {
  initialAssets: MediaAssetWithUsage[];
  storageConfig: StorageConfigStatus;
  canManage: boolean;
}

export default function MediaLibraryClient({
  initialAssets,
  storageConfig,
  canManage,
}: MediaLibraryClientProps) {
  const [assets, setAssets] = useState<MediaAssetWithUsage[]>(initialAssets);
  const [selectedCollection, setSelectedCollection] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [optimizedResult, setOptimizedResult] = useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [altTextEn, setAltTextEn] = useState("");
  const [altTextHi, setAltTextHi] = useState("");
  const [uploadCollection, setUploadCollection] = useState("gallery");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // In-use Delete warning modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    asset: MediaAssetWithUsage | null;
    isDeleting: boolean;
    error: string | null;
  }>({
    isOpen: false,
    asset: null,
    isDeleting: false,
    error: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Refresh assets
  const refreshAssets = async () => {
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      if (data.success && Array.isArray(data.assets)) {
        setAssets(data.assets);
      }
    } catch (e) {
      console.error("Failed to refresh media assets:", e);
    }
  };

  // Handle file selection and client-side optimization
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(null);

    const validMimes = ["image/jpeg", "image/png", "image/webp"];
    if (!validMimes.includes(file.type.toLowerCase())) {
      setUploadError("Invalid file type. Only JPG, PNG, and WebP images are permitted.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setUploadError("File size exceeds the 5 MB limit. Please select a smaller photo.");
      return;
    }

    setSelectedFile(file);
    setIsOptimizing(true);

    try {
      const result = await optimizeImageClient(file);
      setOptimizedResult(result);
    } catch (optErr: any) {
      console.warn("Client optimization error, using original file:", optErr);
      setOptimizedResult({
        blob: file,
        filename: file.name,
        mimeType: file.type,
        originalSize: file.size,
        optimizedSize: file.size,
        width: 0,
        height: 0,
        savingsPercent: 0,
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  // Execute direct-to-R2 upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !optimizedResult) return;

    if (!altTextEn.trim()) {
      setUploadError("Alt text (English) is required for accessibility and SEO.");
      return;
    }

    if (!storageConfig.isConfigured) {
      setUploadError(
        storageConfig.message ||
          "Cloudflare R2 Public Storage is not configured. Direct uploads are disabled."
      );
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);
    setUploadError(null);

    try {
      // Step 1: Request presigned PUT URL from server
      const presignedRes = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request_upload_url",
          filename: optimizedResult.filename,
          mimeType: optimizedResult.mimeType,
          fileSize: optimizedResult.optimizedSize,
          altTextEn: altTextEn.trim(),
          altTextHi: altTextHi.trim() || undefined,
          collection: uploadCollection,
        }),
      });

      const presignedData = await presignedRes.json();
      if (!presignedRes.ok || !presignedData.success) {
        throw new Error(presignedData.message || "Failed to generate upload URL.");
      }

      setUploadProgress(45);

      // Step 2: Direct browser-to-R2 PUT upload
      const uploadRes = await fetch(presignedData.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": optimizedResult.mimeType,
        },
        body: optimizedResult.blob,
      });

      if (!uploadRes.ok) {
        throw new Error(
          `Direct storage upload failed with status ${uploadRes.status}. Check R2 CORS settings.`
        );
      }

      setUploadProgress(80);

      // Step 3: Register media asset in database
      const confirmRes = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "confirm_upload",
          url: presignedData.publicUrl,
          filename: optimizedResult.filename,
          mimeType: optimizedResult.mimeType,
          fileSize: optimizedResult.optimizedSize,
          altTextEn: altTextEn.trim(),
          altTextHi: altTextHi.trim() || null,
          collection: uploadCollection,
        }),
      });

      const confirmData = await confirmRes.json();
      if (!confirmRes.ok || !confirmData.success) {
        throw new Error(confirmData.message || "Failed to register image in Media Library.");
      }

      setUploadProgress(100);
      setUploadSuccess("Photo uploaded and registered successfully in Media Library!");
      await refreshAssets();

      // Reset form after short delay
      setTimeout(() => {
        setIsUploadOpen(false);
        setSelectedFile(null);
        setOptimizedResult(null);
        setAltTextEn("");
        setAltTextHi("");
        setUploadProgress(0);
        setUploadSuccess(null);
      }, 1500);
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Upload failed. Please check network and storage configuration.");
    } finally {
      setIsUploading(false);
    }
  };

  // Copy Public CDN URL to clipboard
  const handleCopyUrl = (asset: MediaAssetWithUsage) => {
    navigator.clipboard.writeText(asset.url);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle safe delete
  const handleDeleteClick = (asset: MediaAssetWithUsage) => {
    setDeleteModal({
      isOpen: true,
      asset,
      isDeleting: false,
      error: null,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.asset) return;

    setDeleteModal((prev) => ({ ...prev, isDeleting: true, error: null }));

    try {
      const res = await fetch(`/api/admin/media?id=${encodeURIComponent(deleteModal.asset.id)}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        // Handled in-use conflict (409)
        throw new Error(data.message || "Failed to delete image.");
      }

      await refreshAssets();
      setDeleteModal({ isOpen: false, asset: null, isDeleting: false, error: null });
    } catch (err: any) {
      setDeleteModal((prev) => ({ ...prev, isDeleting: false, error: err.message }));
    }
  };

  // Filtered assets
  const filteredAssets = assets.filter((asset) => {
    const matchesCollection =
      selectedCollection === "all" || asset.collection === selectedCollection;
    const matchesSearch =
      searchQuery.trim() === "" ||
      asset.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.altTextEn && asset.altTextEn.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCollection && matchesSearch;
  });

  const collections = ["all", "gallery", "sanctum", "services", "hero", "credentials", "general"];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Admin Hub
              </Link>
              <span className="text-slate-600">/</span>
              <span className="text-xs text-slate-400 font-medium">Content Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1 flex items-center gap-3">
              <ImageIcon className="w-7 h-7 text-amber-400" />
              Media Library &amp; Photos
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Manage website imagery, certificates, and sanctum galleries with Cloudflare R2 public storage.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refreshAssets}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-medium border border-slate-700/60 transition-colors inline-flex items-center gap-1.5"
              title="Refresh media gallery"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <button
              onClick={() => setIsUploadOpen(true)}
              disabled={!canManage || !storageConfig.isConfigured}
              className={`px-4 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-2 transition-all shadow-md ${
                canManage && storageConfig.isConfigured
                  ? "bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-amber-950/40"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload Image
            </button>
          </div>
        </div>

        {/* How-to Help Panel for Non-Technical Users */}
        <AdminHelpPanel
          title="How to manage website photos &amp; media safely"
          steps={[
            "Upload JPG, PNG, or WebP images up to 5 MB directly from your browser to Cloudflare R2.",
            "Always enter descriptive English alt text — this helps visually impaired seekers and boosts Google ranking.",
            "Images are automatically optimized and converted to modern WebP to ensure fast page loading on mobile.",
            "Any photo currently displayed in the Hero banner, testimonials, or services is locked from accidental deletion.",
          ]}
          tip="If uploads are disabled, confirm that Cloudflare R2 public storage keys (R2_PUBLIC_BUCKET and API credentials) have been added to your production environment."
          defaultExpanded={!storageConfig.isConfigured}
        />

        {/* Storage Configuration Status Alert */}
        {!storageConfig.isConfigured ? (
          <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-900/60 text-rose-300 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-rose-200">
                  Cloudflare R2 Public Storage Not Configured
                </h3>
                <p className="text-xs text-rose-300/80 mt-0.5 leading-relaxed">
                  Direct uploads are currently disabled. Configure{" "}
                  <code className="text-rose-200 bg-rose-900/50 px-1.5 py-0.5 rounded text-[11px]">
                    R2_PUBLIC_BUCKET
                  </code>
                  ,{" "}
                  <code className="text-rose-200 bg-rose-900/50 px-1.5 py-0.5 rounded text-[11px]">
                    R2_PUBLIC_DOMAIN
                  </code>
                  , and S3 credentials in your Vercel Production environment variables.
                </p>
                {storageConfig.missing.length > 0 && (
                  <p className="text-[11px] text-rose-400 mt-1 font-mono">
                    Missing: {storageConfig.missing.join(", ")}
                  </p>
                )}
              </div>
            </div>
            <div className="shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-900/80 text-rose-200 border border-rose-700/50">
                Uploads Disabled
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-950/30 border border-emerald-800/60 rounded-xl p-3.5 sm:p-4 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-emerald-200 font-medium">
                Cloudflare R2 Public Storage Active
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-300 font-mono text-[11px]">
                Bucket: {storageConfig.publicBucket}
              </span>
            </div>
            <span className="text-[11px] text-emerald-400 font-medium hidden sm:inline">
              Browser-to-R2 direct upload ready (Max 5 MB)
            </span>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Collection Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {collections.map((col) => (
              <button
                key={col}
                onClick={() => setSelectedCollection(col)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                  selectedCollection === col
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                {col === "all" ? "All Photos" : col}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search filename or alt text..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition-colors"
            />
          </div>
        </div>

        {/* Media Grid */}
        {filteredAssets.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto mb-3">
              <ImageIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-medium text-slate-300">No media assets found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchQuery
                ? `No images match your search "${searchQuery}".`
                : "No photos uploaded yet in this category."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="group bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-xl overflow-hidden flex flex-col transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {/* Thumbnail Preview */}
                <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden flex items-center justify-center">
                  <img
                    src={asset.url}
                    alt={asset.altTextEn || asset.filename}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      // Fallback visual on broken image URL
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />

                  {/* Usage Badge */}
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    {asset.inUse ? (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-950/90 text-emerald-300 border border-emerald-700/60 shadow-sm backdrop-blur-sm"
                        title={`Currently in use in: ${asset.usedIn?.join(", ") || "Website"}`}
                      >
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        In Use
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-900/90 text-slate-400 border border-slate-700/60 backdrop-blur-sm">
                        Unused
                      </span>
                    )}
                  </div>

                  {/* Collection Tag */}
                  {asset.collection && (
                    <div className="absolute top-2 right-2">
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-900/80 text-amber-300/90 border border-amber-900/50 backdrop-blur-sm capitalize">
                        {asset.collection}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content & Metadata */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
                  <div>
                    <h4
                      className="text-xs font-semibold text-slate-200 truncate"
                      title={asset.filename}
                    >
                      {asset.filename}
                    </h4>
                    <p
                      className="text-[11px] text-slate-400 line-clamp-2 mt-0.5"
                      title={asset.altTextEn || "No alt text"}
                    >
                      <span className="text-slate-500 font-medium">Alt: </span>
                      {asset.altTextEn || "—"}
                    </p>
                    {asset.altTextHi && (
                      <p
                        className="text-[11px] text-amber-300/80 line-clamp-1 mt-0.5"
                        title={asset.altTextHi}
                      >
                        <span className="text-slate-500 font-medium">हिं: </span>
                        {asset.altTextHi}
                      </p>
                    )}
                  </div>

                  {/* Usage locations indicator */}
                  {asset.inUse && asset.usedIn && asset.usedIn.length > 0 && (
                    <div className="bg-emerald-950/40 border border-emerald-900/50 rounded p-1.5 text-[10px] text-emerald-300 leading-tight">
                      Used in: {asset.usedIn.join(", ")}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleCopyUrl(asset)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-amber-400 transition-colors"
                      title="Copy Public Image URL"
                    >
                      {copiedId === asset.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <a
                        href={asset.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                        title="View Full Resolution"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      {canManage && (
                        <button
                          onClick={() => handleDeleteClick(asset)}
                          className={`p-1 transition-colors ${
                            asset.inUse
                              ? "text-slate-600 hover:text-amber-400"
                              : "text-slate-500 hover:text-rose-400"
                          }`}
                          title={
                            asset.inUse
                              ? "Image is in use — click to see protected references"
                              : "Delete unused image"
                          }
                        >
                          {asset.inUse ? (
                            <Lock className="w-3.5 h-3.5 text-slate-500" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        {isUploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                    <Upload className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-white">Upload Image to Cloudflare R2</h3>
                </div>
                <button
                  onClick={() => setIsUploadOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {uploadError && (
                <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                  <span>{uploadSuccess}</span>
                </div>
              )}

              <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
                {/* File Picker / Dropzone */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">
                    Select Photo (JPG, PNG, or WebP up to 5 MB) *
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="w-full text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500/20 file:text-amber-300 hover:file:bg-amber-500/30 cursor-pointer bg-slate-950 border border-slate-800 rounded-lg p-2"
                    required
                  />
                </div>

                {/* Optimization details preview */}
                {isOptimizing && (
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Optimising image for high-speed mobile display...</span>
                  </div>
                )}

                {optimizedResult && !isOptimizing && (
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Resolution &amp; Size:</span>
                      <span className="text-emerald-400 font-medium">
                        {(optimizedResult.originalSize / 1024).toFixed(0)} KB →{" "}
                        {(optimizedResult.optimizedSize / 1024).toFixed(0)} KB (
                        {optimizedResult.savingsPercent}% lighter)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Format:</span>
                      <span className="text-slate-200 font-mono">
                        {optimizedResult.mimeType.replace("image/", "").toUpperCase()} (EXIF stripped)
                      </span>
                    </div>
                  </div>
                )}

                {/* Alt Text (English) - REQUIRED */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-medium">
                      Alt Text (English) <span className="text-rose-400">* Required</span>
                    </label>
                    <CharacterCount current={altTextEn.length} max={150} />
                  </div>
                  <input
                    type="text"
                    value={altTextEn}
                    onChange={(e) => setAltTextEn(e.target.value)}
                    placeholder="e.g., Acharya Niraj Kumar performing Vedic Hawan in Delhi"
                    maxLength={150}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/60"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Describe what is in the photo for visually impaired visitors and Google search bots.
                  </p>
                </div>

                {/* Alt Text (Hindi) - Optional */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-medium">Alt Text (Hindi) — Optional</label>
                    <CharacterCount current={altTextHi.length} max={150} />
                  </div>
                  <input
                    type="text"
                    value={altTextHi}
                    onChange={(e) => setAltTextHi(e.target.value)}
                    placeholder="उदा. आचार्य नीरज कुमार दिल्ली में वैदिक हवन करते हुए"
                    maxLength={150}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                {/* Target Collection */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Section</label>
                  <select
                    value={uploadCollection}
                    onChange={(e) => setUploadCollection(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500/60"
                  >
                    <option value="gallery">Official Gallery</option>
                    <option value="sanctum">Sanctum &amp; Temple</option>
                    <option value="services">Services &amp; Consultation</option>
                    <option value="hero">Hero Banners</option>
                    <option value="credentials">Certificates &amp; Degrees</option>
                    <option value="general">General Media</option>
                  </select>
                </div>

                {/* Progress Bar */}
                {isUploading && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-amber-400">
                      <span>Uploading directly to Cloudflare R2...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-500 h-1.5 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsUploadOpen(false)}
                    disabled={isUploading}
                    className="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      isUploading ||
                      !selectedFile ||
                      !altTextEn.trim() ||
                      !storageConfig.isConfigured
                    }
                    className={`px-5 py-2 rounded-lg font-semibold inline-flex items-center gap-2 ${
                      !isUploading &&
                      selectedFile &&
                      altTextEn.trim() &&
                      storageConfig.isConfigured
                        ? "bg-amber-600 hover:bg-amber-500 text-slate-950"
                        : "bg-slate-800 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        Upload Now
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation & In-Use Protection Modal */}
        {deleteModal.isOpen && deleteModal.asset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl ${
                    deleteModal.asset.inUse
                      ? "bg-amber-950/60 text-amber-400 border border-amber-800/80"
                      : "bg-rose-950/60 text-rose-400 border border-rose-800/80"
                  }`}
                >
                  {deleteModal.asset.inUse ? (
                    <Lock className="w-5 h-5" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {deleteModal.asset.inUse
                      ? "Image Protected: Currently In Use"
                      : "Permanently Delete Image?"}
                  </h3>
                  <p className="text-xs text-slate-400 truncate max-w-[260px]">
                    {deleteModal.asset.filename}
                  </p>
                </div>
              </div>

              {deleteModal.error && (
                <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs">
                  {deleteModal.error}
                </div>
              )}

              {deleteModal.asset.inUse ? (
                <div className="space-y-3 text-xs text-slate-300">
                  <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/50 space-y-1.5">
                    <p className="font-semibold text-amber-300">
                      Deletion is blocked to prevent broken images on your live website.
                    </p>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      This photo is currently referenced in:
                    </p>
                    <ul className="list-disc list-inside text-amber-200 font-mono text-[11px] space-y-0.5">
                      {deleteModal.asset.usedIn?.map((loc, idx) => (
                        <li key={idx}>{loc}</li>
                      )) || <li>Active website content</li>}
                    </ul>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    To delete this image, first replace or remove it from the corresponding section in
                    Content Studio.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 text-xs text-slate-300">
                  <p>
                    This image is confirmed <strong className="text-emerald-400">not in use</strong>{" "}
                    anywhere on the website.
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Are you sure you want to permanently delete it from the Media Library? This action
                    cannot be undone.
                  </p>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    setDeleteModal({ isOpen: false, asset: null, isDeleting: false, error: null })
                  }
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                >
                  {deleteModal.asset.inUse ? "Close" : "Cancel"}
                </button>
                {!deleteModal.asset.inUse && (
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    disabled={deleteModal.isDeleting}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md inline-flex items-center gap-1.5"
                  >
                    {deleteModal.isDeleting ? "Deleting..." : "Yes, Delete Photo"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
