// src/lib/constants/noteSynonyms.ts
// Normalization map: raw API note names → canonical NoteKey

export const NOTE_SYNONYMS: Record<string, string> = {
  // ── Original 6 entries (unchanged) ──
  "cedar wood": "cedar",
  "cedar-wood": "cedar",
  "cedarwood": "cedar",
  "oud wood": "oud",
  "oudh": "oud",
  "agarwood": "oud",
  "sandle wood": "sandalwood",
  "sandal": "sandalwood",

  // ── P1 #18: Fragella common spellings ──
  // Rose variants
  "rose absolute": "rose",
  "rose de mai": "rose",
  "bulgarian rose": "rose",
  "damask rose": "rose",
  "turkish rose": "taif_rose",
  "taif rose": "taif_rose",

  // Jasmine variants
  "jasmine absolute": "jasmine",
  "jasmine sambac": "jasmine",
  "indian jasmine": "jasmine",

  // Musk variants
  "white musk": "white_musk",
  "musk white": "white_musk",
  "clean musk": "musk",

  // Oud & incense variants
  "agar wood": "oud",
  "incense olibanum": "frankincense",
  "olibanum": "frankincense",

  // Common alternative names
  "tonka": "tonka_bean",
  "tonka beans": "tonka_bean",
  "black pepper": "pepper",
  "pink pepper berry": "pink_pepper",
  "pink peppercorn": "pink_pepper",
  "neroli oil": "neroli",
  "orange blossom": "neroli",
  "tuberose absolute": "tuberose",
  "benzoin resinoid": "benzoin",
  "benzoin siam": "benzoin",
  "ambergris": "ambergris",
  "grey amber": "ambergris",
  "guaiacwood": "guaiac_wood",
  "guaiac": "guaiac_wood",
  "patchouly": "patchouli",
  "vetyver": "vetiver",
  "cocoa": "cacao",
  "ylang": "jasmine", // Close enough for matching purposes
  "iris root": "iris",
  "orris": "iris",
  "orris root": "iris",

  // ── P1 #19: Arabic note names ──
  "ورد": "rose",
  "ياسمين": "jasmine",
  "مسك": "musk",
  "عود": "oud",
  "صندل": "sandalwood",
  "لبان": "frankincense",
  "بخور": "incense",
  "هيل": "cardamom",
  "قرفة": "cinnamon",
  "زعفران": "saffron",
  "فانيلا": "vanilla",
  "عنبر": "amber",
  "برغموت": "bergamot",
  "ليمون": "lemon",
  "نعناع": "mint",
  "قهوة": "coffee",
  "شوكولاتة": "chocolate",
  "جلد": "leather",
  "فلفل": "pepper",
  "زنجبيل": "ginger",
  "لافندر": "lavender",
  "أرز": "cedar",
  "بنفسج": "violet",
  "سوسن": "iris",
  "جاوي": "benzoin",
  "مسك أبيض": "white_musk",
  "ورد الطائف": "taif_rose",
  "دهن العود": "dahn_al_oud",
  "عنبر بحري": "ambergris",
};

export function normalizeNoteKey(raw: string): string {
  const cleaned = raw
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
  return NOTE_SYNONYMS[cleaned] || cleaned;
}
