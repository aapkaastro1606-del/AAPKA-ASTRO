"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";

export interface HelpStep {
  title?: string;
  description: string;
}

export interface AdminHelpPanelProps {
  title?: string;
  steps: (string | HelpStep)[];
  tip?: string;
  defaultExpanded?: boolean;
}

export const AdminHelpPanel: React.FC<AdminHelpPanelProps> = ({
  title = "How to use this page",
  steps,
  tip,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="rounded-xl border border-[#E8D8C3] bg-[#FBF3E7]/70 shadow-xs overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left hover:bg-[#FBF3E7] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#E8A33D]/20 text-[#7B2D26]">
            <HelpCircle className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-[#7B2D26] font-temple">
              {title}
            </h3>
            <p className="text-[11px] text-[#6E5545]">
              Quick guide for managing this section safely without touching code.
            </p>
          </div>
        </div>
        <div className="text-[#7B2D26] p-1">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-[#E8D8C3]/60 space-y-3">
          <ol className="list-decimal pl-5 space-y-1.5 text-xs text-[#5A4332] leading-relaxed">
            {steps.map((step, idx) => {
              if (typeof step === "string") {
                return (
                  <li key={idx}>
                    <span>{step}</span>
                  </li>
                );
              }
              return (
                <li key={idx}>
                  {step.title && <strong className="text-[#3B2A1E]">{step.title}: </strong>}
                  <span>{step.description}</span>
                </li>
              );
            })}
          </ol>

          {tip && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[#FFFDF9] border border-[#E8D8C3] text-[11px] text-[#7B2D26]">
              <Lightbulb className="h-4 w-4 text-[#E8A33D] shrink-0 mt-0.5" />
              <span>
                <strong>Tip: </strong>
                {tip}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
