"use client";

import React, { useMemo } from "react";
import { sanitizeRichText } from "@/lib/content/sanitizeRichText";

interface SafeRichTextProps {
  html: string;
  className?: string;
}

/**
 * SafeRichText Component
 * Renders rich text safely on render, ensuring zero raw scripts, event handlers, or unsafe protocols.
 */
export function SafeRichText({ html, className = "" }: SafeRichTextProps) {
  const sanitized = useMemo(() => sanitizeRichText(html), [html]);

  return (
    <div
      className={`prose prose-amber max-w-none text-stone-800 ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
