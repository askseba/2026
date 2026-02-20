// src/lib/fragrance/families.ts

export type FamilyKey =
  | "floral"
  | "citrus"
  | "woody"
  | "oriental"
  | "fresh"
  | "gourmand"
  | "spicy"
  | "leather"
  | "musky"
  | "powdery"
  | "green"
  | "aquatic"
  | "amber"
  | "aldehydic"
  | "chypre" // P1: Added as independent classic family
  | "default";

export type LocaleKey = "ar" | "en";

export interface FamilySpec {
  key: FamilyKey;
  color: string; // hex
  names: Record<LocaleKey, string>;
  descriptions?: Partial<Record<LocaleKey, string>>;
  icon: "lineart"; // placeholder contract (define ReactComponent later)
}

export const FAMILY_SYSTEM: Record<FamilyKey, FamilySpec> = {
  floral: {
    key: "floral",
    color: "#E91E63",
    names: { ar: "زهري", en: "Floral" },
    descriptions: {
      ar: "روائح الأزهار والورود الطبيعية",
      en: "Natural flower and petal scents",
    },
    icon: "lineart",
  },
  citrus: {
    key: "citrus",
    color: "#FFA000",
    names: { ar: "حمضيات", en: "Citrus" },
    descriptions: {
      ar: "روائح الليمون والبرغموت والبرتقال",
      en: "Lemon, bergamot, and orange notes",
    },
    icon: "lineart",
  },
  woody: {
    key: "woody",
    color: "#795548",
    names: { ar: "خشبي", en: "Woody" },
    descriptions: {
      ar: "صندل وأرز وعود",
      en: "Sandalwood, cedar, and oud",
    },
    icon: "lineart",
  },
  oriental: {
    key: "oriental",
    color: "#9C27B0",
    names: { ar: "شرقي", en: "Oriental" },
    descriptions: {
      ar: "دافئ وغامض وتوابل",
      en: "Warm, mysterious spices",
    },
    icon: "lineart",
  },
  fresh: {
    key: "fresh",
    color: "#0288D1",
    names: { ar: "منعش", en: "Fresh" },
    icon: "lineart",
  },
  gourmand: {
    key: "gourmand",
    color: "#EC407A",
    // P1 #15: Fixed Arabic name from "جورماند" to "حلويات"
    names: { ar: "حلويات", en: "Gourmand" },
    icon: "lineart",
  },
  spicy: {
    key: "spicy",
    color: "#D84315",
    names: { ar: "حار", en: "Spicy" },
    icon: "lineart",
  },
  leather: {
    key: "leather",
    color: "#3E2723",
    names: { ar: "جلدي", en: "Leather" },
    icon: "lineart",
  },
  musky: {
    key: "musky",
    color: "#90A4AE",
    names: { ar: "مسكي", en: "Musky" },
    icon: "lineart",
  },
  powdery: {
    key: "powdery",
    color: "#F8BBD0",
    names: { ar: "بودري", en: "Powdery" },
    icon: "lineart",
  },
  green: {
    key: "green",
    color: "#2E7D32",
    names: { ar: "عشبي", en: "Green" },
    icon: "lineart",
  },
  aquatic: {
    key: "aquatic",
    color: "#0288D1",
    names: { ar: "مائي", en: "Aquatic" },
    icon: "lineart",
  },
  amber: {
    key: "amber",
    color: "#FF8F00",
    names: { ar: "عنبر", en: "Amber" },
    icon: "lineart",
  },
  aldehydic: {
    key: "aldehydic",
    color: "#B0BEC5",
    names: { ar: "ألدهيدي", en: "Aldehydic" },
    // P1 #14: Added missing description
    descriptions: {
      ar: "رائحة صابونية أنيقة",
      en: "Elegant, soapy character",
    },
    icon: "lineart",
  },
  // P1: chypre as independent classic family (bergamot + oakmoss + patchouli + labdanum)
  chypre: {
    key: "chypre",
    color: "#8B7355",
    names: { ar: "شيبر", en: "Chypre" },
    descriptions: {
      ar: "برغموت وطحلب البلوط وباتشولي",
      en: "Bergamot, oakmoss, and patchouli",
    },
    icon: "lineart",
  },
  default: {
    key: "default",
    color: "#94A3B8",
    names: { ar: "غير مصنّف", en: "Uncategorized" },
    icon: "lineart",
  },
};
