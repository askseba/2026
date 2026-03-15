// src/lib/services/ifra.service.ts
// IFRA Materials Service - Phase 1
// Handles querying and validation of IFRA-regulated materials

import { prisma } from '@/lib/prisma'
import logger from '@/lib/logger'

export interface IfraMaterial {
  id: string
  name: string
  nameAr: string | null
  casNumber: string | null
  maxConcentration: number
  unit: string
  category: string
  euRegulation: string
  amendmentVersion: string
  productCategory: number
  symptoms: string
  description: string | null
  createdAt: Date
  updatedAt: Date
}

export interface SafetyCheckResult {
  isSafe: boolean
  warnings: SafetyWarning[]
  allergens: string[]
  severity: 'safe' | 'caution' | 'warning' | 'danger'
}

export interface SafetyWarning {
  material: string
  materialAr: string
  symptom: string
  symptomAr: string
  severity: 'mild' | 'moderate' | 'severe'
  maxConcentration: number
}

export class IFRAService {
  /**
   * Get IFRA material by name
   */
  async getMaterialByName(name: string): Promise<IfraMaterial | null> {
    try {
      return await prisma.ifraMaterial.findUnique({
        where: { name }
      })
    } catch (error) {
      logger.error('Error fetching IFRA material:', error)
      return null
    }
  }

  /**
   * Get IFRA material by CAS number
   */
  async getMaterialByCAS(casNumber: string): Promise<IfraMaterial | null> {
    try {
      return await prisma.ifraMaterial.findUnique({
        where: { casNumber }
      })
    } catch (error) {
      logger.error('Error fetching IFRA material by CAS:', error)
      return null
    }
  }

  /**
   * Get all allergens
   */
  async getAllAllergens(): Promise<IfraMaterial[]> {
    try {
      return await prisma.ifraMaterial.findMany({
        where: {
          category: 'allergen'
        },
        orderBy: {
          name: 'asc'
        }
      })
    } catch (error) {
      logger.error('Error fetching allergens:', error)
      return []
    }
  }

  /**
   * Get all sensitizers
   */
  async getAllSensitizers(): Promise<IfraMaterial[]> {
    try {
      return await prisma.ifraMaterial.findMany({
        where: {
          category: 'sensitizer'
        },
        orderBy: {
          name: 'asc'
        }
      })
    } catch (error) {
      logger.error('Error fetching sensitizers:', error)
      return []
    }
  }

  /**
   * Search materials by name (partial match)
   */
  async searchMaterials(query: string): Promise<IfraMaterial[]> {
    try {
      const lowerQuery = query.toLowerCase()
      return await prisma.ifraMaterial.findMany({
        where: {
          OR: [
            { name: { contains: lowerQuery } },
            { nameAr: { contains: query } }
          ]
        },
        orderBy: {
          name: 'asc'
        },
        take: 20
      })
    } catch (error) {
      logger.error('Error searching materials:', error)
      return []
    }
  }

  /**
   * Check if ingredients are safe based on user allergies
   */
  async checkSafety(
    ingredients: string[],
    userAllergies: string[] = []
  ): Promise<SafetyCheckResult> {
    try {
      // Get all IFRA data for the ingredients
      const materials = await prisma.ifraMaterial.findMany({
        where: {
          name: {
            in: ingredients
          }
        },
        include: {
          symptomMappings: true
        }
      })

      const warnings: SafetyWarning[] = []
      const allergens: string[] = []

      // Check each material
      for (const material of materials) {
        // Parse symptoms from JSON
        let symptoms: string[] = []
        try {
          symptoms = JSON.parse(material.symptoms)
        } catch {
          symptoms = []
        }

        // Check if any symptom matches user allergies
        const hasUserAllergy = userAllergies.some(allergy =>
          symptoms.includes(allergy)
        )

        if (hasUserAllergy || material.category === 'allergen') {
          allergens.push(material.name)
        }

        // Get symptom mappings
        for (const mapping of material.symptomMappings) {
          // Check if this symptom is in user's allergy profile
          if (userAllergies.includes(mapping.symptom)) {
            warnings.push({
              material: material.name,
              materialAr: material.nameAr || material.name,
              symptom: mapping.symptom,
              symptomAr: mapping.symptomAr,
              severity: mapping.severity as 'mild' | 'moderate' | 'severe',
              maxConcentration: material.maxConcentration
            })
          }
        }
      }

      // Determine overall severity
      let severity: 'safe' | 'caution' | 'warning' | 'danger' = 'safe'
      
      if (warnings.length === 0) {
        severity = 'safe'
      } else {
        const hasSevere = warnings.some(w => w.severity === 'severe')
        const hasModerate = warnings.some(w => w.severity === 'moderate')
        
        if (hasSevere) {
          severity = 'danger'
        } else if (hasModerate) {
          severity = 'warning'
        } else {
          severity = 'caution'
        }
      }

      return {
        isSafe: warnings.length === 0,
        warnings,
        allergens,
        severity
      }
    } catch (error) {
      logger.error('Error checking safety:', error)
      return {
        isSafe: false,
        warnings: [],
        allergens: [],
        severity: 'caution'
      }
    }
  }

  /**
   * Get symptom mappings for an ingredient
   */
  async getSymptomMappings(ingredientName: string) {
    try {
      return await prisma.symptomIngredientMapping.findMany({
        where: {
          ingredient: ingredientName
        },
        orderBy: {
          confidence: 'desc'
        }
      })
    } catch (error) {
      logger.error('Error fetching symptom mappings:', error)
      return []
    }
  }

  /**
   * Get all materials with their symptom mappings
   */
  async getAllMaterialsWithSymptoms() {
    try {
      return await prisma.ifraMaterial.findMany({
        include: {
          symptomMappings: {
            orderBy: {
              confidence: 'desc'
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      })
    } catch (error) {
      logger.error('Error fetching materials with symptoms:', error)
      return []
    }
  }
}

// Export singleton instance
export const ifraService = new IFRAService()

/**
 * Calculate safety score for a list of ingredients
 * Returns a score from 0-100 (100 = completely safe)
 * This is a synchronous wrapper that provides a basic safety score
 * For detailed analysis, use ifraService.checkSafety()
 */
export function calculateIngredientsSafetyScore(ingredients: string[]): {
  score: number
  allergenCount: number
  sensitizerCount: number
  restrictedCount: number
  warnings: string[]
} {
  // Basic implementation: return safe score by default
  // For production, this should query the database asynchronously
  // but since it's used synchronously in perfume-bridge, we return a safe default
  let allergenCount = 0
  let sensitizerCount = 0
  const restrictedCount = 0
  const warnings: string[] = []
  
  // Known common allergens (basic check)
  const knownAllergens = [
    'Limonene', 'Linalool', 'Geraniol', 'Citronellol', 'Eugenol',
    'Isoeugenol', 'Cinnamal', 'Coumarin', 'Farnesol', 'Citral',
    'Hexyl Cinnamal', 'Benzyl Alcohol', 'Benzyl Benzoate', 'Benzyl Salicylate',
    'Oakmoss Extract', 'Treemoss Extract'
  ]
  
  const knownSensitizers = [
    'Isoeugenol', 'Methyl 2-Octynoate', 'Clove Oil', 'Atranol', 'Chloroatranol'
  ]
  
  for (const ingredient of ingredients) {
    if (knownAllergens.some(a => a.toLowerCase() === ingredient.toLowerCase())) {
      allergenCount++
      warnings.push(`${ingredient} - مادة مسببة للحساسية`)
    } else if (knownSensitizers.some(s => s.toLowerCase() === ingredient.toLowerCase())) {
      sensitizerCount++
      warnings.push(`${ingredient} - مادة محسسة`)
    }
  }
  
  // Calculate score
  // Base score: 100
  // -5 points per allergen
  // -10 points per sensitizer
  // -15 points per restricted material
  let score = 100
  score -= allergenCount * 5
  score -= sensitizerCount * 10
  score -= restrictedCount * 15
  
  // Clamp to 0-100
  score = Math.max(0, Math.min(100, score))
  
  return {
    score,
    allergenCount,
    sensitizerCount,
    restrictedCount,
    warnings
  }
}
