import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home, Lock } from "lucide-react";

export interface AccessDeniedViewProps {
  sectionTitle?: string;
  message?: string;
  userEmail?: string | null;
  userRole?: string | null;
  returnHref?: string;
  returnLabel?: string;
}

export default function AccessDeniedView({
  sectionTitle = "Restricted Area",
  message = "You don't have access to this section. This management screen is restricted to authorized team members.",
  userEmail,
  userRole,
  returnHref = "/account",
  returnLabel = "Back to My Account",
}: AccessDeniedViewProps) {
  return (
    <div className="min-h-[70vh] bg-[#FFFDF9] flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="max-w-md w-full bg-white rounded-2xl border border-stone-200/80 shadow-xl overflow-hidden text-center">
        {/* Sacred header bar */}
        <div className="h-2 bg-gradient-to-r from-[#7B2D26] via-[#B8860B] to-[#7B2D26]" />

        <div className="p-6 sm:p-8">
          {/* Spiritual Shield Icon */}
          <div className="w-16 h-16 rounded-full bg-[#7B2D26]/10 border border-[#7B2D26]/20 flex items-center justify-center mx-auto mb-5 text-[#7B2D26]">
            <ShieldAlert className="w-8 h-8" />
          </div>

          {/* Heading */}
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#7B2D26] mb-2 tracking-tight">
            You don't have access to this section
          </h1>

          {/* Section badge */}
          {sectionTitle && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-700 mb-4">
              <Lock className="w-3 h-3 text-stone-500" />
              <span>{sectionTitle}</span>
            </div>
          )}

          {/* Detailed reason */}
          <p className="text-sm text-stone-600 leading-relaxed mb-6">
            {message}
          </p>

          {/* Account snapshot */}
          {(userEmail || userRole) && (
            <div className="bg-stone-50 rounded-xl p-3 mb-6 border border-stone-200/60 text-xs text-stone-600 flex items-center justify-between">
              <span className="font-mono truncate max-w-[200px]">{userEmail || "Signed In"}</span>
              <span className="px-2 py-0.5 rounded-md bg-[#7B2D26]/10 text-[#7B2D26] font-bold uppercase tracking-wider text-[10px]">
                {userRole || "CLIENT"}
              </span>
            </div>
          )}

          {/* Action buttons — never causes a redirect loop */}
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
            <Link
              href={returnHref}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#7B2D26] text-white text-xs font-bold hover:bg-[#682520] transition-all shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{returnLabel}</span>
            </Link>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold hover:bg-stone-200 transition-all"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
          </div>

          {/* Spiritual blessing footnote */}
          <p className="mt-8 text-[11px] text-stone-500 border-t border-stone-100 pt-4">
            If you believe this is an error, please contact the Platform Owner to update your permissions.
          </p>
        </div>
      </div>
    </div>
  );
}
