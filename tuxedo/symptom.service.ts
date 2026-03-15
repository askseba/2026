// src/lib/services/symptom.service.ts
// Symptom Analysis Service
// Handles symptom-ingredient matching and safety calculations

import { symptomMappings, getIngredientsForSymptom } from '@/data/symptom-mappings'

export interface SymptomTrigger {
  ingredient: string
  symptoms: string[]
  confidence: number
}

export interface SymptomMatchResult {
  hasMatch: boolean
  triggers: SymptomTrigger[]
  totalSymptoms: number
  score: number // 0-100, lower is more dangerous
}

/**
 * Calculate symptom match score for ingredients
 * @param ingredients - List of perfume ingredients
 * @param userSymptoms - List of user's allergy symptoms
 * @returns Symptom match result with triggers and score
 */
export function calculateSymptomMatchScore(
  ingredients: string[],
  userSymptoms: string[]
): SymptomMatchResult {
  // Validate inputs
  if (!Array.isArray(ingredients) || !Array.isArray(userSymptoms)) {
    return {
      hasMatch: false,
      triggers: [],
      totalSymptoms: 0,
      score: 100
    }
  }

  if (userSymptoms.length === 0) {
    return {
      hasMatch: false,
      triggers: [],
      totalSymptoms: 0,
      score: 100
    }
  }

  const triggers: SymptomTrigger[] = []

  // Check each ingredient against user symptoms
  for (const ingredient of ingredients) {
    const matchedMappings = symptomMappings.filter(mapping =>
      mapping.ingredients.some(ing => ing.toLowerCase() === ingredient.toLowerCase()) &&
      userSymptoms.includes(mapping.symptom)
    )

    if (matchedMappings.length > 0) {
      triggers.push({
        ingredient,
        symptoms: matchedMappings.map(m => m.symptomAr),
        confidence: Math.max(...matchedMappings.map(m => m.confidence))
      })
    }
  }

  // Calculate score
  // Base score: 100
  // -10 points per trigger
  // -5 extra points for high confidence triggers (>0.7)
  let score = 100
  for (const trigger of triggers) {
    score -= 10
    if (trigger.confidence > 0.7) {
      score -= 5
    }
  }
  score = Math.max(0, score)

  return {
    hasMatch: triggers.length > 0,
    triggers,
    totalSymptoms: new Set(triggers.flatMap(t => t.symptoms)).size,
    score
  }
}

/**
 * Get all ingredients that trigger user's symptoms
 * @param userSymptoms - List of user's symptoms
 * @returns List of ingredients to avoid
 */
export function getIngredientsToAvoid(userSymptoms: string[]): string[] {
  if (!Array.isArray(userSymptoms) || userSymptoms.length === 0) {
    return []
  }

  const ingredientsSet = new Set<string>()
  
  for (const symptom of userSymptoms) {
    const ingredients = getIngredientsForSymptom(symptom)
    ingredients.forEach(ing => ingredientsSet.add(ing))
  }

  return Array.from(ingredientsSet)
}

/**
 * Check if perfume is safe for user's symptoms
 * @param perfumeIngredients - Perfume ingredients
 * @param userSymptoms - User's symptoms
 * @returns Whether perfume is safe
 */
export function isPerfumeSafeForSymptoms(
  perfumeIngredients: string[],
  userSymptoms: string[]
): boolean {
  const result = calculateSymptomMatchScore(perfumeIngredients, userSymptoms)
  return !result.hasMatch && result.score >= 80
}

/**
 * Get symptom severity level
 */
export function getSymptomSeverity(symptom: string): 'mild' | 'moderate' | 'severe' {
  const severityMap: Record<string, 'mild' | 'moderate' | 'severe'> = {
    'skin_allergy': 'moderate',
    'redness': 'mild',
    'itching': 'mild',
    'irritation': 'moderate',
    'severe_irritation': 'severe',
    'burning_sensation': 'moderate',
    'swelling': 'severe',
    'breathing_difficulty': 'severe',
    'headache': 'mild',
    'dizziness': 'moderate',
    'nausea': 'moderate',
    'photosensitivity': 'moderate',
    'severe_allergy': 'severe',
    'banned': 'severe'
  }
  
  return severityMap[symptom] || 'moderate'
}

// src/lib/services/symptom.service.ts
// Symptom Analysis Service
// Handles symptom-ingredient matching and safety calculations

import { symptomMappings, getIngredientsForSymptom } from '@/data/symptom-mappings'

export interface SymptomTrigger {
  ingredient: string
  symptoms: string[]
  confidence: number
}

export interface SymptomMatchResult {
  hasMatch: boolean
  triggers: SymptomTrigger[]
  totalSymptoms: number
  score: number // 0-100, lower is more dangerous
}

/**
 * Calculate symptom match score for ingredients
 * @param ingredients - List of perfume ingredients
 * @param userSymptoms - List of user's allergy symptoms
 * @returns Symptom match result with triggers and score
 */
export function calculateSymptomMatchScore(
  ingredients: string[],
  userSymptoms: string[]
): SymptomMatchResult {
  // Validate inputs
  if (!Array.isArray(ingredients) || !Array.isArray(userSymptoms)) {
    return {
      hasMatch: false,
      triggers: [],
      totalSymptoms: 0,
      score: 100
    }
  }

  if (userSymptoms.length === 0) {
    return {
      hasMatch: false,
      triggers: [],
      totalSymptoms: 0,
      score: 100
    }
  }

  const triggers: SymptomTrigger[] = []

  // Check each ingredient against user symptoms
  for (const ingredient of ingredients) {
    const matchedMappings = symptomMappings.filter(mapping =>
      mapping.ingredients.some(ing => ing.toLowerCase() === ingredient.toLowerCase()) &&
      userSymptoms.includes(mapping.symptom)
    )

    if (matchedMappings.length > 0) {
      triggers.push({
        ingredient,
        symptoms: matchedMappings.map(m => m.symptomAr),
        confidence: Math.max(...matchedMappings.map(m => m.confidence))
      })
    }
  }

  // Calculate score
  // Base score: 100
  // -10 points per trigger
  // -5 extra points for high confidence triggers (>0.7)
  let score = 100
  for (const trigger of triggers) {
    score -= 10
    if (trigger.confidence > 0.7) {
      score -= 5
    }
  }
  score = Math.max(0, score)

  return {
    hasMatch: triggers.length > 0,
    triggers,
    totalSymptoms: new Set(triggers.flatMap(t => t.symptoms)).size,
    score
  }
}

/**
 * Get all ingredients that trigger user's symptoms
 * @param userSymptoms - List of user's symptoms
 * @returns List of ingredients to avoid
 */
export function getIngredientsToAvoid(userSymptoms: string[]): string[] {
  if (!Array.isArray(userSymptoms) || userSymptoms.length === 0) {
    return []
  }

  const ingredientsSet = new Set<string>()
  
  for (const symptom of userSymptoms) {
    const ingredients = getIngredientsForSymptom(symptom)
    ingredients.forEach(ing => ingredientsSet.add(ing))
  }

  return Array.from(ingredientsSet)
}

/**
 * Check if perfume is safe for user's symptoms
 * @param perfumeIngredients - Perfume ingredients
 * @param userSymptoms - User's symptoms
 * @returns Whether perfume is safe
 */
export function isPerfumeSafeForSymptoms(
  perfumeIngredients: string[],
  userSymptoms: string[]
): boolean {
  const result = calculateSymptomMatchScore(perfumeIngredients, userSymptoms)
  return !result.hasMatch && result.score >= 80
}

/**
 * Get symptom severity level
 */
export function getSymptomSeverity(symptom: string): 'mild' | 'moderate' | 'severe' {
  const severityMap: Record<string, 'mild' | 'moderate' | 'severe'> = {
    'skin_allergy': 'moderate',
    'redness': 'mild',
    'itching': 'mild',
    'irritation': 'moderate',
    'severe_irritation': 'severe',
    'burning_sensation': 'moderate',
    'swelling': 'severe',
    'breathing_difficulty': 'severe',
    'headache': 'mild',
    'dizziness': 'moderate',
    'nausea': 'moderate',
    'photosensitivity': 'moderate',
    'severe_allergy': 'severe',
    'banned': 'severe'
  }
  
  return severityMap[symptom] || 'moderate'
}

