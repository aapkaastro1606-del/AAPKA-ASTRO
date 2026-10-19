"use client";

import React from "react";

interface CharacterCountProps {
  current: number;
  max: number;
  className?: string;
}

export function CharacterCount({ current, max, className = "" }: CharacterCountProps) {
  const isNearLimit = current >= max * 0.85 && current <= max;
  const isOverLimit = current > max;

  return (
    <span
      className={`text-xs font-mono transition-colors ${
        isOverLimit
          ? "text-red-600 font-bold"
          : isNearLimit
          ? "text-amber-600 font-medium"
          : "text-stone-400"
      } ${className}`}
    >
      {current} / {max} chars
    </span>
  );
}
