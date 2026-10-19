"use client";

import React from "react";
import { AlertTriangle, Trash2, EyeOff, X } from "lucide-react";

interface PermanentDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
  onHideInstead?: () => void;
  itemTitle: string;
  itemType?: string;
}

export function PermanentDeleteModal({
  isOpen,
  onClose,
  onConfirmDelete,
  onHideInstead,
  itemTitle,
  itemType = "item",
}: PermanentDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-[#FFFDF9] border border-red-200 rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-red-50 border-b border-red-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-red-950">Confirm Permanent Delete</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-stone-700 leading-relaxed">
            Are you sure you want to permanently delete this {itemType}?
          </p>
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold text-stone-900 line-clamp-2">
            "{itemTitle}"
          </div>

          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
            <EyeOff className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Recommended alternative:</span> You can <strong>Hide</strong> this {itemType} instead of deleting it. Hidden items disappear from visitors immediately but remain safely stored so you can re-publish them anytime.
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-[#FDF8EE] border-t border-[#E8DCC4] flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold rounded-md bg-stone-200 text-stone-700 hover:bg-stone-300 transition-colors"
          >
            Cancel
          </button>

          {onHideInstead && (
            <button
              type="button"
              onClick={() => {
                onHideInstead();
                onClose();
              }}
              className="px-3.5 py-2 text-xs font-semibold rounded-md bg-amber-600 text-white hover:bg-amber-700 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Hide Instead</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onConfirmDelete();
              onClose();
            }}
            className="px-3.5 py-2 text-xs font-semibold rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Permanently Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
