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
  isSafe: boolean
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

export interface ScoredPerfume extends PerfumeForMatching {
  finalScore: number
  tasteScore: number
  safetyScore: number
  isExcluded: boolean
  exclusionReason: string | null
  /** IFRA safety score (0–100); added by enrichWithIFRA */
  ifraScore?: number
  /** Enriched symptom triggers; may override base */
  ifraWarnings?: string[]
  /** Data source: 'local' | 'fragella' */
  source?: string
  /** Fragella API ID (for fragella-sourced perfumes) */
  fragellaId?: string
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
 * Uses a blended score to reduce penalty from large user Scent DNA:
 * - overlapScore = intersection / perfumeSet.size (how much of the perfume is covered by preferences)
 * - jaccard = intersection / union
 * - blended = overlapScore * 0.7 + jaccard * 0.3
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

  const intersection = new Set([...perfumeSet].filter(x => userSet.has(x)))
  const union = new Set([...perfumeSet, ...userSet])

  const overlapScore =
    perfumeSet.size === 0 ? 0 : intersection.size / perfumeSet.size
  const jaccard = union.size === 0 ? 0 : intersection.size / union.size
  const blended = overlapScore * 0.7 + jaccard * 0.3

  return Math.round(blended * 100)
}

export function calculateSafetyScore(
  perfumeIngredients: string[],
  perfumeSymptomTriggers: string[],
  userAllergies: {
    symptoms: string[]
    families: string[]
    ingredients: string[]
  },
  ifraScore?: number
): { score: number; reason: string | null } {
  const perfumeIngredientsSet = new Set(perfumeIngredients.map(i => i.toLowerCase()))
  const perfumeTriggersSet = new Set(perfumeSymptomTriggers.map(t => t.toLowerCase()))

  // Check for symptom triggers — hard penalty
  for (const symptom of userAllergies.symptoms) {
    if (perfumeTriggersSet.has(symptom.toLowerCase())) {
      return { score: 0, reason: `يسبب ${symptom}` }
    }
  }

  // Check for allergic ingredients — hard penalty
  for (const ingredient of userAllergies.ingredients) {
    if (perfumeIngredientsSet.has(ingredient.toLowerCase())) {
      return { score: 0, reason: `يحتوي على ${ingredient}` }
    }
  }

  // If ifraScore is available, use it as the safety score (0-100 gradient)
  // This reflects allergen/sensitizer count from IFRA enrichment
  if (ifraScore !== undefined && ifraScore !== null) {
    const reason = ifraScore < 70 ? 'يحتوي على مواد قد تسبب حساسية' : null
    return { score: ifraScore, reason }
  }

  // Default: fully safe
  return { score: 100, reason: null }
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
        exclusionReason: 'في قائمة العطور غير المفضلة'
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
          exclusionReason: `ينتمي لعائلة ${family} المسببة للحساسية`
        }
      }
    }
    
    // Calculate Taste Score
    const tasteScore = calculateTasteScore(perfume.families, userScentDNA)
    
    // Calculate Safety Score
    const { score: safetyScore, reason: safetyReason } = calculateSafetyScore(
      perfume.ingredients,
      perfume.symptomTriggers,
      userPreference.allergyProfile,
      (perfume as any).ifraScore
    )
    
    // If safety score is 0, mark as excluded but still include in results with warning
    if (safetyScore === 0) {
      return {
        ...perfume,
        finalScore: Math.round(tasteScore * 0.7), // Only taste score, no safety bonus
        tasteScore,
        safetyScore: 0,
        isExcluded: false, // Show but with warning
        exclusionReason: safetyReason
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
      exclusionReason: null
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
 * Get match status label based on score
 */
export function getMatchStatus(finalScore: number): {
  label: string
  status: 'excellent' | 'good' | 'fair' | 'poor'
} {
  if (finalScore >= 80) {
    return { label: 'ممتاز', status: 'excellent' }
  } else if (finalScore >= 60) {
    return { label: 'جيد جداً', status: 'good' }
  } else if (finalScore >= 40) {
    return { label: 'مقبول', status: 'fair' }
  } else {
    return { label: 'ضعيف', status: 'poor' }
  }
}
