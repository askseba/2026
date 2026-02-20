// src/lib/constants/symptomLabels.ts
// P2 #22: Centralized symptom translation dictionary.
// Replaces the temporary SYMPTOM_LABELS_AR in SafetyBlocker.tsx.

export interface SymptomEntry {
  ar: string
  en: string
}

/**
 * Canonical symptom labels — keys are lowercase English identifiers
 * matching what comes from the allergy/IFRA pipeline.
 */
export const SYMPTOM_LABELS: Record<string, SymptomEntry> = {
  sneeze:                { ar: "عطاس",                  en: "Sneezing" },
  headache:              { ar: "صداع",                   en: "Headache" },
  "skin rash":           { ar: "طفح جلدي",              en: "Skin rash" },
  "runny nose":          { ar: "سيلان أنف",             en: "Runny nose" },
  "watery eyes":         { ar: "دموع العين",            en: "Watery eyes" },
  nausea:                { ar: "غثيان",                  en: "Nausea" },
  dizziness:             { ar: "دوخة",                   en: "Dizziness" },
  "breathing difficulty": { ar: "صعوبة تنفس",           en: "Breathing difficulty" },
  itching:               { ar: "حكة",                    en: "Itching" },
  cough:                 { ar: "سعال",                   en: "Cough" },
  "throat irritation":   { ar: "تهيج الحلق",            en: "Throat irritation" },
  "chest tightness":     { ar: "ضيق الصدر",             en: "Chest tightness" },
  "eye irritation":      { ar: "تهيج العين",            en: "Eye irritation" },
  "contact dermatitis":  { ar: "التهاب جلدي تلامسي",    en: "Contact dermatitis" },
  "asthma trigger":      { ar: "نوبة ربو",              en: "Asthma trigger" },
}

/**
 * Translate a symptom name to the given locale.
 * Falls back to the raw symptom string (capitalized) if not found.
 *
 * @example translateSymptom("sneeze", "ar") → "عطاس"
 * @example translateSymptom("unknown thing", "en") → "Unknown thing"
 */
export function translateSymptom(
  symptom: string,
  locale: "ar" | "en"
): string {
  const key = symptom.toLowerCase().trim()
  const entry = SYMPTOM_LABELS[key]

  if (entry) {
    return entry[locale]
  }

  // Fallback: capitalize first letter, return as-is
  if (!symptom) return symptom
  return symptom.charAt(0).toUpperCase() + symptom.slice(1)
}
