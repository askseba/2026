// src/lib/constants/noteImages.ts
import type { NoteKey } from "./notes.en";
import { NOTE_FILES_EN } from "./notes.en";

export interface NoteImageAsset {
  src: string;
  width: number;
  height: number;
}

export const NOTE_IMAGES: Record<NoteKey, NoteImageAsset> = Object.fromEntries(
  Object.entries(NOTE_FILES_EN).map(([key, file]) => [
    key,
    { src: `/images/notes/${file}`, width: 207, height: 260 },
  ])
) as Record<NoteKey, NoteImageAsset>;
