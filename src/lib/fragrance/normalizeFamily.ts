// src/lib/fragrance/normalizeFamily.ts
import type { FamilyKey } from "./families";

const FAMILY_ALIASES: Record<string, FamilyKey> = {
  // ── Original aliases (unchanged) ──
  floral: "floral",
  flowers: "floral",
  citrus: "citrus",
  woody: "woody",
  woods: "woody",
  oriental: "oriental",
  ambery: "oriental",
  fresh: "fresh",
  gourmand: "gourmand",
  spicy: "spicy",
  spices: "spicy",
  leather: "leather",
  musky: "musky",
  musk: "musky",
  powdery: "powdery",
  green: "green",
  aquatic: "aquatic",
  marine: "aquatic",
  amber: "amber",
  aldehydic: "aldehydic",
  aldehyde: "aldehydic",

  // ── P1 #20: Missing Fragella aliases ──
  chypre: "chypre",       // Independent classic family (not oriental)
  fougere: "fresh",       // Fougere → fresh (lavender/coumarin → fresh category)
  "fougère": "fresh",     // With accent
  aromatic: "fresh",      // Aromatic herbs → fresh
  fruity: "citrus",       // Fruity → citrus (closest match)
  "white floral": "floral",
  balsamic: "amber",
  animalic: "musky",
  ozonic: "aquatic",
  tobacco: "spicy",
  earthy: "woody",
  resinous: "amber",
  herbal: "green",
  "sweet": "gourmand",

  // ── P1 #19: Arabic aliases ──
  "زهري": "floral",
  "خشبي": "woody",
  "شرقي": "oriental",
  "حمضيات": "citrus",
  "منعش": "fresh",
  "حلويات": "gourmand",
  "جورماند": "gourmand",
  "حار": "spicy",
  "جلدي": "leather",
  "مسكي": "musky",
  "بودري": "powdery",
  "عشبي": "green",
  "مائي": "aquatic",
  "عنبر": "amber",
  "شيبر": "chypre",
};

export function normalizeFamilyKey(
  raw: string | null | undefined
): FamilyKey {
  if (!raw) return "default";
  const cleaned = raw.toLowerCase().trim();
  return FAMILY_ALIASES[cleaned] || "default";
}
