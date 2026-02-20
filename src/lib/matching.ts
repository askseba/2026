// src/lib/matching.ts
// Dynamic Matching Algorithm for Ask Seba
// Implements Jaccard Similarity + Weighted Scoring (Taste 70% + Safety 30%)

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface PerfumeForMatching {
  id: string
  name: string
  brand: string
  image: string
  description: string | null
  price: number | null
  families: string[]
  ingredients: string[]
  symptomTriggers: string[]
  isSafe: boolean | undefined // P0 #1.1: now allows undefined (enrichment failed)
  status: string
  variant: string | null
  scentPyramid: {
    top: string[]
    heart: string[]
    base: string[]
  } | null
}

export interface UserPreferenceForMatching {
  likedPerfumesFamilies: string[]  // Flattened families from liked perfumes
  dislikedPerfumeIds: string[]
  allergyProfile: {
    symptoms: string[]
    families: string[]
    ingredients: string[]
  }
}

/**
 * P0 #1.3: matchStatus is now computed inside calculateMatchScores.
 * P1 #4: exclusionReason is backward-compatible — callers that read it
 * as a string will still see a readable string; callers that check for
 * .key will get structured data.
 */
export type ExclusionReason =
  | string
  | { key: string; params?: Record<string, string> }
  | null

export interface ScoredPerfume extends PerfumeForMatching {
  finalScore: number
  tasteScore: number
  safetyScore: number
  isExcluded: boolean
  exclusionReason: ExclusionReason
  /** P0 #1.3: Computed match status */
  matchStatus: 'excellent' | 'good' | 'fair' | 'poor'
  /** IFRA safety score (0–100); added by enrichWithIFRA */
  ifraScore?: number
  /** Enriched symptom triggers; may override base */
  ifraWarnings?: string[]
  /** Data source: 'local' | 'fragella' */
  source?: string
  /** Fragella API ID (for fragella-sourced perfumes) */
  fragellaId?: string
  /** P0 #1.1: true when IFRA enrichment failed for this perfume */
  enrichmentFailed?: boolean
  /** Display name (may differ from name for localized results) */
  displayName?: string
}

// ============================================
// CORE ALGORITHMS
// ============================================

/**
 * Calculates the Jaccard similarity index between two sets.
 * Jaccard Index = |A ∩ B| / |A ∪ B|
 *
 * @example
 * setA = {'Woody', 'Aromatic', 'Spicy'}
 * setB = {'Woody', 'Citrus'}
 * intersection = {'Woody'} → size = 1
 * union = {'Woody', 'Aromatic', 'Spicy', 'Citrus'} → size = 4
 * Jaccard = 1/4 = 0.25
 */
export function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 0

  const intersection = new Set([...setA].filter(x => setB.has(x)))
  const union = new Set([...setA, ...setB])

  if (union.size === 0) return 0
  return intersection.size / union.size
}

/**
 * Calculates the Taste Score based on shared scent families.
 * Uses Jaccard similarity between perfume families and user's "Scent DNA"
 *
 * @param perfumeFamilies - The families of the perfume being scored
 * @param userScentDNA - Set of families from user's liked perfumes
 * @returns Score from 0-100
 */
export function calculateTasteScore(
  perfumeFamilies: string[],
  userScentDNA: Set<string>
): number {
  if (userScentDNA.size === 0) {
    // No preferences yet - return neutral score
    return 50
  }

  const perfumeSet = new Set(perfumeFamilies.map(f => f.toLowerCase()))
  const userSet = new Set([...userScentDNA].map(f => f.toLowerCase()))

  const similarity = jaccardSimilarity(perfumeSet, userSet)
  return Math.round(similarity * 100)
}

/**
 * P1 #22: Graduated safety scoring.
 * Instead of binary 0/100, calculates based on number of conflicting items.
 * 1 conflict = 75, 2 = 50, 3+ = 0.
 *
 * P1 #4: exclusionReason uses i18n key with backward-compatible string.
 */
export function calculateSafetyScore(
  perfumeIngredients: string[],
  perfumeSymptomTriggers: string[],
  userAllergies: {
    symptoms: string[]
    families: string[]
    ingredients: string[]
  }
): { score: number; reason: ExclusionReason } {
  const perfumeIngredientsSet = new Set(perfumeIngredients.map(i => i.toLowerCase()))
  const perfumeTriggersSet = new Set(perfumeSymptomTriggers.map(t => t.toLowerCase()))

  let conflictCount = 0
  let firstReason: ExclusionReason = null

  // Check for symptom triggers
  for (const symptom of userAllergies.symptoms) {
    if (perfumeTriggersSet.has(symptom.toLowerCase())) {
      conflictCount++
      if (!firstReason) {
        firstReason = { key: 'results.exclusion.causeSymptom', params: { symptom } }
      }
    }
  }

  // Check for allergic ingredients
  for (const ingredient of userAllergies.ingredients) {
    if (perfumeIngredientsSet.has(ingredient.toLowerCase())) {
      conflictCount++
      if (!firstReason) {
        firstReason = { key: 'results.exclusion.causeIngredient', params: { ingredient } }
      }
    }
  }

  if (conflictCount === 0) {
    return { score: 100, reason: null }
  }

  // P1 #22: Graduated scoring
  let score: number
  if (conflictCount === 1) {
    score = 75
  } else if (conflictCount === 2) {
    score = 50
  } else {
    score = 0
  }

  return { score, reason: firstReason }
}

/**
 * Calculates the final weighted match score.
 * Formula: (Taste * 0.7) + (Safety * 0.3)
 */
export function calculateFinalMatchScore(
  tasteScore: number,
  safetyScore: number
): number {
  const TASTE_WEIGHT = 0.7
  const SAFETY_WEIGHT = 0.3

  const finalScore = (tasteScore * TASTE_WEIGHT) + (safetyScore * SAFETY_WEIGHT)
  return Math.round(finalScore)
}

/**
 * Builds the user's "Scent DNA" from their liked perfumes.
 * This is a unique set of all families from perfumes they liked.
 */
export function buildUserScentDNA(likedPerfumesFamilies: string[]): Set<string> {
  return new Set(likedPerfumesFamilies.map(f => f.toLowerCase()))
}

/**
 * P0 #1.3: Derives matchStatus from finalScore.
 */
function deriveMatchStatus(finalScore: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (finalScore >= 80) return 'excellent'
  if (finalScore >= 60) return 'good'
  if (finalScore >= 40) return 'fair'
  return 'poor'
}

// ============================================
// MAIN MATCHING FUNCTION
// ============================================

/**
 * The main function to calculate match scores for all perfumes.
 *
 * @param perfumes - All perfumes from database
 * @param userPreference - User's preferences and allergies
 * @returns Sorted array of scored perfumes (highest score first)
 */
export function calculateMatchScores(
  perfumes: PerfumeForMatching[],
  userPreference: UserPreferenceForMatching
): ScoredPerfume[] {
  // Build user's Scent DNA from liked perfumes
  const userScentDNA = buildUserScentDNA(userPreference.likedPerfumesFamilies)

  // Score each perfume
  const scoredPerfumes: ScoredPerfume[] = perfumes.map(perfume => {
    // Check if perfume is in disliked list
    if (userPreference.dislikedPerfumeIds.includes(perfume.id)) {
      return {
        ...perfume,
        finalScore: 0,
        tasteScore: 0,
        safetyScore: 0,
        isExcluded: true,
        exclusionReason: { key: 'results.exclusion.disliked' },
        matchStatus: 'poor' as const
      }
    }

    // Check for family allergies (exclude entire families)
    const perfumeFamiliesLower = perfume.families.map(f => f.toLowerCase())
    const allergyFamiliesLower = userPreference.allergyProfile.families.map(f => f.toLowerCase())

    for (const family of allergyFamiliesLower) {
      if (perfumeFamiliesLower.includes(family)) {
        return {
          ...perfume,
          finalScore: 0,
          tasteScore: 0,
          safetyScore: 0,
          isExcluded: true,
          exclusionReason: { key: 'results.exclusion.allergyFamily', params: { family } },
          matchStatus: 'poor' as const
        }
      }
    }

    // Calculate Taste Score
    const tasteScore = calculateTasteScore(perfume.families, userScentDNA)

    // Calculate Safety Score (P1 #22: now graduated)
    const { score: safetyScore, reason: safetyReason } = calculateSafetyScore(
      perfume.ingredients,
      perfume.symptomTriggers,
      userPreference.allergyProfile
    )

    // If safety score is 0, mark as excluded but still include in results with warning
    if (safetyScore === 0) {
      const finalScore = Math.round(tasteScore * 0.7) // Only taste score, no safety bonus
      return {
        ...perfume,
        finalScore,
        tasteScore,
        safetyScore: 0,
        isExcluded: false, // Show but with warning
        exclusionReason: safetyReason,
        matchStatus: deriveMatchStatus(finalScore)
      }
    }

    // Calculate Final Score
    const finalScore = calculateFinalMatchScore(tasteScore, safetyScore)

    return {
      ...perfume,
      finalScore,
      tasteScore,
      safetyScore,
      isExcluded: false,
      exclusionReason: null,
      matchStatus: deriveMatchStatus(finalScore)
    }
  })

  // Sort by final score (descending), then by name (ascending) for ties
  return scoredPerfumes
    .filter(p => !p.isExcluded) // Remove excluded perfumes from results
    .sort((a, b) => {
      if (b.finalScore !== a.finalScore) {
        return b.finalScore - a.finalScore
      }
      return a.name.localeCompare(b.name, 'ar')
    })
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * P1 #17: Get match status — label is now an i18n key, not hardcoded Arabic.
 */
export function getMatchStatus(finalScore: number): {
  labelKey: string
  status: 'excellent' | 'good' | 'fair' | 'poor'
} {
  if (finalScore >= 80) {
    return { labelKey: 'results.matchStatus.excellent', status: 'excellent' }
  } else if (finalScore >= 60) {
    return { labelKey: 'results.matchStatus.good', status: 'good' }
  } else if (finalScore >= 40) {
    return { labelKey: 'results.matchStatus.fair', status: 'fair' }
  } else {
    return { labelKey: 'results.matchStatus.poor', status: 'poor' }
  }
}
