// src/components/ui/FamilyBadge.tsx
"use client";

import React from "react";
import type { LocaleKey } from "@/lib/fragrance/families";
import { FAMILY_SYSTEM } from "@/lib/fragrance/families";
import { normalizeFamilyKey } from "@/lib/fragrance/normalizeFamily";

type Props = {
  family: string; // raw from API/DB
  locale: LocaleKey; // "ar" | "en"
  size?: "sm" | "md";
};

export function FamilyBadge({ family, locale, size = "sm" }: Props) {
  const key = normalizeFamilyKey(family);
  const spec = FAMILY_SYSTEM[key];
  const text = spec.names[locale];

  const chip =
    size === "md" ? "text-sm px-3 py-1.5" : "text-xs px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border shadow-sm bg-white/70 dark:bg-white/10 backdrop-blur ${chip}`}
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
}
