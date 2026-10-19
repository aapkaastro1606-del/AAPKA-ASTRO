"use client";

import React, { useState, useEffect } from "react";
import { X, History, RotateCcw, Clock, User, CheckCircle2, AlertCircle } from "lucide-react";

interface Revision {
  id: string;
  revisionNumber: number;
  collection: string;
  key: string;
  status: string;
  sortOrder: number;
  dataEn: any;
  dataHi: any;
  changeSummary: string | null;
  createdBy: string | null;
  createdAt: string;
}

interface RevisionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  collection: string;
  itemKey: string;
  itemTitle: string;
  onRestored: () => void;
}

export function RevisionHistoryModal({
  isOpen,
  onClose,
  collection,
  itemKey,
  itemTitle,
  onRestored,
}: RevisionHistoryModalProps) {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (isOpen && collection && itemKey) {
      loadRevisions();
    }
  }, [isOpen, collection, itemKey]);

  const loadRevisions = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/admin/content?action=revisions&collection=${collection}&key=${itemKey}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.revisions)) {
        setRevisions(json.revisions);
      } else {
        setRevisions([]);
      }
    } catch {
      setStatusMessage({ type: "error", text: "Failed to load revision history." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (revision: Revision) => {
    if (
      !confirm(
        `Are you sure you want to restore Revision #${revision.revisionNumber} from ${new Date(
          revision.createdAt
        ).toLocaleString()}? This will update the live item to this snapshot.`
      )
    ) {
      return;
    }

    setIsRestoring(true);
    setRestoringId(revision.id);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "restore_revision",
          revisionId: revision.id,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to restore revision.");
      }

      setStatusMessage({
        type: "success",
        text: `Successfully restored Revision #${revision.revisionNumber}!`,
      });

      onRestored();
      await loadRevisions();
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to restore revision." });
    } finally {
      setIsRestoring(false);
      setRestoringId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-[#FFFDF9] border border-[#E8DCC4] rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8DCC4] bg-[#FDF8EE]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-[#7B2D26]">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">Revision History</h3>
              <p className="text-xs text-stone-600 truncate max-w-md">{itemTitle} ({itemKey})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div
            className={`px-6 py-2.5 text-xs font-semibold flex items-center gap-2 border-b ${
              statusMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-stone-500 flex flex-col items-center justify-center gap-2">
              <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
              <span>Loading past revisions...</span>
            </div>
          ) : revisions.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-500 bg-stone-50 rounded-lg border border-dashed border-stone-200">
              No historical revisions found for this item yet. A snapshot is recorded on every save.
            </div>
          ) : (
            <div className="space-y-3">
              {revisions.map((rev, index) => {
                const isLatest = index === 0;
                return (
                  <div
                    key={rev.id}
                    className={`p-4 rounded-lg border transition-all ${
                      isLatest
                        ? "bg-amber-50/50 border-amber-300"
                        : "bg-white border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-900">
                            Revision #{rev.revisionNumber}
                          </span>
                          {isLatest && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                              Current Active
                            </span>
                          )}
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              rev.status === "PUBLISHED"
                                ? "bg-emerald-100 text-emerald-800"
                                : rev.status === "DRAFT"
                                ? "bg-sky-100 text-sky-800"
                                : "bg-stone-200 text-stone-700"
                            }`}
                          >
                            {rev.status}
                          </span>
                        </div>

                        <p className="text-xs text-stone-700 italic">
                          "{rev.changeSummary || "Snapshot recorded"}"
                        </p>

                        <div className="flex items-center gap-4 text-[11px] text-stone-500 pt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-stone-400" />
                            {new Date(rev.createdAt).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {rev.createdBy && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-stone-400" />
                              {rev.createdBy}
                            </span>
                          )}
                        </div>
                      </div>

                      {!isLatest && (
                        <button
                          type="button"
                          onClick={() => handleRestore(rev)}
                          disabled={isRestoring}
                          className="px-3 py-1.5 text-xs font-semibold rounded-md bg-stone-900 text-white hover:bg-[#7B2D26] transition-colors flex items-center gap-1.5 shrink-0 shadow-sm disabled:opacity-50"
                        >
                          <RotateCcw className={`w-3.5 h-3.5 ${isRestoring && restoringId === rev.id ? "animate-spin" : ""}`} />
                          <span>Restore</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E8DCC4] bg-[#FDF8EE] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-md bg-stone-200 text-stone-700 hover:bg-stone-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
