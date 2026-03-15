// Unified Perfume Types
// Type definitions for the bridge layer between local and Fragella perfumes

import { Perfume } from '@/lib/data/perfumes'

/**
 * Fragella API note object (string or object with name/category)
 */
export interface PerfumeNote {
  name: string
  category?: string
}

/** Type guard for PerfumeNote object */
export function isPerfumeNote(obj: unknown): obj is PerfumeNote {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'name' in obj &&
    typeof (obj as PerfumeNote).name === 'string'
  )
}

/**
 * Source of the perfume data
 */
export type PerfumeSource = 'local' | 'fragella'

/**
 * Unified Perfume interface
 * Extends the base Perfume type with source tracking and IFRA enrichment
 */
export interface UnifiedPerfume extends Perfume {
  /**
   * Data source identifier
   * - 'local': From perfumes.ts (IDs: '1', '2', '3', ...)
   * - 'fragella': From Fragella API (IDs: 'fragella-12345', ...)
   */
  source: PerfumeSource
  
  /**
   * Original Fragella ID (without 'fragella-' prefix)
   * Only present for Fragella-sourced perfumes
   */
  fragellaId?: string
  
  /**
   * IFRA safety score (0-100)
   * Calculated based on ingredient safety
   * - 80-100: Safe
   * - 60-79: Generally safe
   * - 40-59: Use with caution
   * - 0-39: Not recommended
   */
  ifraScore?: number
  
  /**
   * IFRA warnings
   * Array of Arabic warning messages about specific ingredients
   */
  ifraWarnings?: string[]
  
  /**
   * Whether this perfume is safe for the user
   * Based on IFRA score and symptom triggers
   */
  isSafe: boolean
  
  /**
   * Symptom triggers for this perfume
   * List of symptoms this perfume may cause
   */
  symptomTriggers?: string[]
}

/**
 * Search options for unified search
 */
export interface UnifiedSearchOptions {
  /**
   * Include local perfumes.ts in search
   * @default true
   */
  includeLocal?: boolean
  
  /**
   * Include Fragella API in search
   * @default true
   */
  includeFragella?: boolean
  
  /**
   * Maximum number of results to return
   * @default 50
   */
  limit?: number
  
  /**
   * Search query string
   */
  query?: string
}

/**
 * Unified search result
 */
export interface UnifiedSearchResult {
  /**
   * Local perfumes matching the query
   */
  local: UnifiedPerfume[]
  
  /**
   * Fragella perfumes matching the query
   */
  fragella: UnifiedPerfume[]
  
  /**
   * Total count of results
   */
  total: number
}

// Unified Perfume Types
// Type definitions for the bridge layer between local and Fragella perfumes

import { Perfume } from '@/lib/data/perfumes'

/**
 * Fragella API note object (string or object with name/category)
 */
export interface PerfumeNote {
  name: string
  category?: string
}

/** Type guard for PerfumeNote object */
export function isPerfumeNote(obj: unknown): obj is PerfumeNote {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'name' in obj &&
    typeof (obj as PerfumeNote).name === 'string'
  )
}

/**
 * Source of the perfume data
 */
export type PerfumeSource = 'local' | 'fragella'

/**
 * Unified Perfume interface
 * Extends the base Perfume type with source tracking and IFRA enrichment
 */
export interface UnifiedPerfume extends Perfume {
  /**
   * Data source identifier
   * - 'local': From perfumes.ts (IDs: '1', '2', '3', ...)
   * - 'fragella': From Fragella API (IDs: 'fragella-12345', ...)
   */
  source: PerfumeSource
  
  /**
   * Original Fragella ID (without 'fragella-' prefix)
   * Only present for Fragella-sourced perfumes
   */
  fragellaId?: string
  
  /**
   * IFRA safety score (0-100)
   * Calculated based on ingredient safety
   * - 80-100: Safe
   * - 60-79: Generally safe
   * - 40-59: Use with caution
   * - 0-39: Not recommended
   */
  ifraScore?: number
  
  /**
   * IFRA warnings
   * Array of Arabic warning messages about specific ingredients
   */
  ifraWarnings?: string[]
  
  /**
   * Whether this perfume is safe for the user
   * Based on IFRA score and symptom triggers
   */
  isSafe: boolean
  
  /**
   * Symptom triggers for this perfume
   * List of symptoms this perfume may cause
   */
  symptomTriggers?: string[]
}

/**
 * Search options for unified search
 */
export interface UnifiedSearchOptions {
  /**
   * Include local perfumes.ts in search
   * @default true
   */
  includeLocal?: boolean
  
  /**
   * Include Fragella API in search
   * @default true
   */
  includeFragella?: boolean
  
  /**
   * Maximum number of results to return
   * @default 50
   */
  limit?: number
  
  /**
   * Search query string
   */
  query?: string
}

/**
 * Unified search result
 */
export interface UnifiedSearchResult {
  /**
   * Local perfumes matching the query
   */
  local: UnifiedPerfume[]
  
  /**
   * Fragella perfumes matching the query
   */
  fragella: UnifiedPerfume[]
  
  /**
   * Total count of results
   */
  total: number
}

