// src/components/ui/FamilyBadgeGroup.tsx
"use client";

import React from "react";
import type { LocaleKey } from "@/lib/fragrance/families";
import { getDisplayFamilies } from "@/lib/fragrance/getDisplayFamilies";
import { FAMILY_SYSTEM } from "@/lib/fragrance/families";

type Props = {
  families?: string[]; // raw from perfume.families
  locale: LocaleKey; // "ar" | "en"
  limit?: number; // default 3
};

export function FamilyBadgeGroup({
  families,
  locale,
  limit = 3,
}: Props) {
  const ordered = getDisplayFamilies(families);
  const visible = ordered.slice(0, limit);
  const remaining = Math.max(0, ordered.length - visible.length);

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((key) => {
        const spec = FAMILY_SYSTEM[key];
        const text = spec.names[locale];
        return (
          <span
            key={key}
            className="inline-flex items-center gap-2 rounded-full border shadow-sm bg-white/70 dark:bg-white/10 backdrop-blur text-xs px-2.5 py-1"
            style={{ borderColor: `${spec.color}33` }}
            title={text}
          >
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: spec.color }}
              aria-hidden="true"
            />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {text}
            </span>
          </span>
        );
      })}
      {remaining > 0 && (
        <span className="inline-flex items-center rounded-full border bg-white/70 dark:bg-white/10 text-xs px-2.5 py-1 text-gray-700 dark:text-gray-300">
          +{remaining}
        </span>
      )}
    </div>
  );
}
