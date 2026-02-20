// src/components/ui/NoteTile.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { normalizeNoteKey } from "@/lib/constants/noteSynonyms";
import { NOTE_LABELS_AR } from "@/lib/constants/notes.ar";
import { NOTE_IMAGES } from "@/lib/constants/noteImages";
import type { NoteKey } from "@/lib/constants/notes.en";

interface NoteTileProps {
  noteName: string; // raw note string from API
  size?: "sm" | "md"; // default "md"
  locale?: "ar" | "en"; // default "ar"
}

const SIZE_CONFIG = {
  sm: {
    container: "gap-1.5 p-1.5",
    wrapper: "w-14 h-18 rounded-lg",
    icon: "w-6 h-6",
    label: "text-xs max-w-[72px]",
    imgSize: 56,
  },
  md: {
    container: "gap-2 p-2",
    wrapper: "w-20 h-24 rounded-xl",
    icon: "w-8 h-8",
    label: "text-sm max-w-[100px]",
    imgSize: 80,
  },
} as const;

export function NoteTile({
  noteName,
  size = "md",
  locale = "ar",
}: NoteTileProps) {
  // P1 #53: Track image load errors to show fallback
  const [imgError, setImgError] = useState(false);

  // 1. Normalize
  const key = normalizeNoteKey(noteName);

  // 2. Get label — skip empty labels (handles bedouin removal edge case)
  const arLabel = NOTE_LABELS_AR[key as NoteKey];
  const label =
    locale === "ar"
      ? (arLabel && arLabel.length > 0 ? arLabel : noteName)
      : noteName;

  // 3. Get image
  const asset = NOTE_IMAGES[key as NoteKey] ?? null;
  const hasValidImage = asset !== null && !imgError;

  const s = SIZE_CONFIG[size];

  return (
    <div className={`flex flex-col items-center ${s.container}`}>
      {hasValidImage ? (
        // 4. P1 #32: Converted <img> to next/image for WebP + srcSet
        <div
          className={`relative ${s.wrapper} bg-white border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden`}
        >
          <Image
            src={asset.src}
            alt={label}
            width={asset.width}
            height={asset.height}
            loading="lazy"
            className="object-contain w-full h-full p-1"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        // 5. Fallback with Sparkles icon
        <div
          className={`${s.wrapper} bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center`}
          role="img"
          aria-label={label}
        >
          {/* P2: aria-hidden on decorative icon */}
          <Sparkles
            className={`${s.icon} text-gray-400 dark:text-gray-500`}
            aria-hidden="true"
          />
        </div>
      )}

      {/* 6. Always show label below */}
      <span
        className={`${s.label} font-medium text-gray-700 dark:text-gray-300 text-center leading-tight truncate`}
        title={label}
      >
        {label}
      </span>
    </div>
  );
}

export default NoteTile;
