// src/lib/fragrance/getDisplayFamilies.ts
import type { FamilyKey } from "./families";
import { normalizeFamilyKey } from "./normalizeFamily";
import { FAMILY_PRIORITY } from "./familyPriority";

export function getDisplayFamilies(
  rawFamilies: string[] | undefined | null
): FamilyKey[] {
  const normalized = (rawFamilies ?? []).map(normalizeFamilyKey);

  // De-dupe while preserving priority ordering
  const set = new Set<FamilyKey>(normalized);

  // Ensure default if nothing valid
  if (set.size === 0) return ["default"];

  // Sort by explicit priority
  const ordered = FAMILY_PRIORITY.filter((k) => set.has(k));
  return ordered.length > 0 ? ordered : ["default"];
}
