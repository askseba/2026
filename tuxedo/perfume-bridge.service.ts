// File 1/3 (Phase 2): src/lib/services/perfume-bridge.service.ts
// ✅ COMPLETE FILE - Ready for copy-paste replacement
// ✅ CHANGE: Added JSDoc comments for price field clarification

// Perfume Bridge Service
// Unified interface for both local perfumes.ts and Fragella API
// Supports dual ID systems: '1', '2', '3' (local) and 'fragella-12345' (Fragella)

import { searchPerfumesWithCache, getPerfume } from '@/lib/services/perfume.service'
import { getIngredientsForNote } from '@/data/note-to-ingredient-map'
import { calculateSymptomMatchScore } from '@/lib/services/symptom.service'
import { calculateIngredientsSafetyScore } from '@/lib/services/ifra.service'
import { type UnifiedPerfume, type PerfumeNote, isPerfumeNote } from '@/types/unified-perfume'
import logger from '@/lib/logger'

// Import local perfumes from the data file
// This will be created separately
let localPerfumesCache: any[] = []

// Lazy load local perfumes to avoid circular dependencies
async function getLocalPerfumes() {
  if (localPerfumesCache.length === 0) {
    try {
      const { perfumes } = await import('@/lib/data/perfumes')
      localPerfumesCache = perfumes
    } catch (error) {
      logger.warn('Local perfumes file not found, using empty array')
      localPerfumesCache = []
    }
  }
  return localPerfumesCache
}

// ============================================
// CORE BRIDGE FUNCTIONS
// ============================================

/**
 * Unified search across both local and Fragella perfumes
 * @param query - Search query
 * @param options - Search options
 * @returns Array of unified perfumes from both sources
 */
export async function searchUnified(
  query: string,
  options: {
    includeLocal?: boolean
    includeFragella?: boolean
    limit?: number
  } = {}
): Promise<UnifiedPerfume[]> {
  const {
    includeLocal = true,
    includeFragella = true,
    limit = 20
  } = options

  const results: UnifiedPerfume[] = []
  const isEmptyQuery = !query || typeof query !== 'string' || !query.trim()
  const normalizedQuery = isEmptyQuery ? '' : query.toLowerCase().trim()

  // 1. Search in local perfumes.ts (if enabled)
  if (includeLocal) {
    try {
      const perfumes = await getLocalPerfumes()
      const localResults = isEmptyQuery
        ? perfumes.map((p: any) => ({ ...p, source: 'local' as const }))
        : perfumes
            .filter((p: any) =>
              p.name.toLowerCase().includes(normalizedQuery) ||
              p.brand.toLowerCase().includes(normalizedQuery)
            )
            .map((p: any) => ({ ...p, source: 'local' as const }))
      results.push(...localResults)
    } catch (error) {
      logger.error('Local perfume search failed:', error)
    }
  }

  // 2. Search in Fragella API (if enabled)
  if (includeFragella) {
    // Empty query: avoid "عطر" (can 404); use 'perfume' or try 'popular' then fallback
    const fragellaQuery = isEmptyQuery ? (limit > 100 ? 'popular' : 'perfume') : query.trim()
    let fragellaData: any = null

    try {
      fragellaData = await searchPerfumesWithCache(fragellaQuery, limit)
    } catch (error) {
      logger.warn('Fragella search failed:', error)
      if (isEmptyQuery && fragellaQuery !== 'perfume') {
        try {
          fragellaData = await searchPerfumesWithCache('perfume', limit)
          logger.info('Fragella fallback "perfume" succeeded')
        } catch (fallbackErr) {
          logger.error('Fragella fallback "perfume" failed:', fallbackErr)
        }
      }
    }

    if (fragellaData && typeof fragellaData === 'object') {
      let fragellaArray: any[] = []
      if (Array.isArray(fragellaData.results)) fragellaArray = fragellaData.results
      else if (Array.isArray(fragellaData)) fragellaArray = fragellaData
      if (isEmptyQuery && limit > 100 && fragellaArray.length === 0) {
        try {
          const fallback = await searchPerfumesWithCache('perfume', limit)
          fragellaArray = Array.isArray(fallback?.results) ? fallback.results : Array.isArray(fallback) ? fallback : []
        } catch {
          // ignore
        }
      }
      const fragellaResults = fragellaArray
        .map((item: any) => {
          const canonicalId = extractFragellaIdFromSearchItem(item)
          if (!canonicalId) {
            logger.warn('Fragella search item missing canonical ID, skipping', { name: item?.Name ?? item?.name })
            return null
          }
          return convertFragellaToUnified(item, canonicalId)
        })
        .filter((p): p is UnifiedPerfume => p !== null)
      results.push(...fragellaResults)
    }
  }

  // 3. Remove duplicates and limit
  const uniqueResults = deduplicatePerfumes(results)
  return uniqueResults.slice(0, limit)
}

/**
 * Get a single perfume by ID (supports both ID formats)
 * @param id - Perfume ID ('1', '2', or 'fragella-12345')
 * @returns Unified perfume or null
 */
export async function getPerfumeUnified(id: string): Promise<UnifiedPerfume | null> {
  // Validate ID
  if (!id || typeof id !== 'string') {
    return null
  }

  // Check if it's a local ID (numeric string)
  if (/^\d+$/.test(id)) {
    try {
      const perfumes = await getLocalPerfumes()
      const local = perfumes.find((p: any) => p.id === id)
      if (local) {
        return {
          ...local,
          source: 'local'
        }
      }
    } catch (error) {
      logger.error('Failed to get local perfume:', error)
    }
    return null
  }

  // Check if it's a Fragella ID (starts with 'fragella-')
  if (id.startsWith('fragella-')) {
    const fragellaId = id.replace('fragella-', '')
    if (!fragellaId) {
      return null
    }
    
    try {
      const fragellaData = await getPerfume(fragellaId)
      return convertFragellaToUnified(fragellaData, fragellaId)
    } catch (error) {
      logger.error('Failed to get Fragella perfume:', error)
      return null
    }
  }

  // Unknown ID format
  logger.warn(`Unknown ID format: ${id}`)
  return null
}

/**
 * Get multiple perfumes by IDs (batch operation)
 * @param ids - Array of perfume IDs (mixed formats supported)
 * @returns Array of unified perfumes
 */
export async function getPerfumesUnified(ids: string[]): Promise<UnifiedPerfume[]> {
  // Validate input
  if (!Array.isArray(ids) || ids.length === 0) {
    return []
  }

  const results = await Promise.all(
    ids.map(id => getPerfumeUnified(id))
  )
  
  return results.filter((p): p is UnifiedPerfume => p !== null)
}

// ============================================
// FRAGELLA CONVERSION
// ============================================

const URL_DERIVED_ID_BLOCKLIST = new Set([
  'en_us', 'ar_sa', 'perfume', 'fragrances', 'fragrance', 'eau-de-parfum', 'eau-de-toilette', 'parfums'
])

function isAcceptableUrlDerivedId(segment: string): boolean {
  if (!segment || segment.includes('?') || segment.includes('#')) return false
  const lower = segment.toLowerCase().trim()
  if (URL_DERIVED_ID_BLOCKLIST.has(lower)) return false
  if (lower.length < 2) return false
  return true
}

function safeDecodeURIComponent(s: string): string | null {
  try {
    return decodeURIComponent(s)
  } catch {
    return null
  }
}

/**
 * Extract verified canonical Fragella ID from a search result item only.
 * No fake IDs, no Brand+Name slugs, no idx-N. URL-derived only if clearly per-fragrance.
 */
export function extractFragellaIdFromSearchItem(item: any): string | null {
  if (!item || typeof item !== 'object') return null

  const directId =
    item.id ??
    item._id ??
    item.Id ??
    item.fragranceId ??
    item.fragrance_id ??
    item.slug ??
    item.Slug

  if (directId != null) {
    const value = String(directId).trim()
    if (value && !value.startsWith('idx-')) return value
  }

  const rawUrl =
    item['Purchase URL'] ??
    item.purchase_url ??
    item.url ??
    item.link ??
    item.href

  if (typeof rawUrl === 'string' && rawUrl.trim()) {
    const url = safeDecodeURIComponent(rawUrl.trim())
    if (url === null) return null
    const match = /\/fragrances\/([^/?#]+)/i.exec(url)
    if (match?.[1]) {
      const segment = safeDecodeURIComponent(match[1].trim())
      if (segment !== null && isAcceptableUrlDerivedId(segment)) return segment
    }
  }

  return null
}

/**
 * Convert Fragella API response to UnifiedPerfume format
 * @param fragellaData - Raw Fragella API data
 * @param fragellaId - Optional Fragella ID (if already extracted)
 * @returns UnifiedPerfume or null
 * 
 * ⚠️ IMPORTANT: Price field in UnifiedPerfume is for reference/filtering ONLY
 * Do NOT display price directly in UI - use "قارن الأسعار" button instead
 */
export function convertFragellaToUnified(
  fragellaData: any,
  fragellaId?: string
): UnifiedPerfume | null {
  if (!fragellaData || typeof fragellaData !== 'object') {
    return null
  }

  try {
    const name = fragellaData.name || fragellaData.Name || 'Unknown'
    const brand = fragellaData.brand?.name ?? fragellaData.brand ?? fragellaData.Brand ?? 'Unknown'
    const effectiveId =
      (typeof fragellaId === 'string' && fragellaId.trim() ? fragellaId.trim() : null) ??
      (fragellaData.id != null ? String(fragellaData.id).trim() : null) ??
      (fragellaData._id != null ? String(fragellaData._id).trim() : null) ??
      (fragellaData.Id != null ? String(fragellaData.Id).trim() : null) ??
      (fragellaData.fragranceId != null ? String(fragellaData.fragranceId).trim() : null) ??
      (fragellaData.fragrance_id != null ? String(fragellaData.fragrance_id).trim() : null) ??
      (fragellaData.slug != null ? String(fragellaData.slug).trim() : null) ??
      (fragellaData.Slug != null ? String(fragellaData.Slug).trim() : null)

    if (!effectiveId || effectiveId.startsWith('idx-')) {
      logger.warn('Fragella data missing canonical ID')
      return null
    }

    const cdnImage = fragellaData['Image URL'] || fragellaData['image_url'] || ''
    const fallbackImage = fragellaData.image || ''
    const rawImage = cdnImage || fallbackImage
    const image = (rawImage && typeof rawImage === 'string' && rawImage.trim() !== '' && rawImage !== 'null')
      ? rawImage.trim()
      : '/placeholder-perfume.svg'
    const price = fragellaData.price ?? fragellaData.Price ?? null
    
    return {
      id: `fragella-${effectiveId}`,
      fragellaId: String(effectiveId),
      name,
      brand: String(brand),
      image,
      description: fragellaData.description || '',
      
      /**
       * Reference price for internal filtering only
       * ⚠️ DO NOT DISPLAY IN UI - Use /api/prices/compare endpoint
       */
      price,
      originalPrice: fragellaData.original_price || null,
      
      // Default matching score - will be calculated by matching algorithm
      matchPercentage: 70,
      
      isSafe: true, // Will be calculated by IFRA
      status: 'safe',
      variant: undefined,
      
      // Extract notes for ingredient mapping
      families: extractFamilies(fragellaData),
      ingredients: extractIngredients(fragellaData),
      symptomTriggers: [], // Will be calculated by IFRA
      
      // Pyramid
      stages: extractPyramid(fragellaData),
      
      // Source tracking
      source: 'fragella'
    }
  } catch (error) {
    logger.error('Failed to convert Fragella data:', error)
    return null
  }
}

function normalizeFamily(f: string): string {
  const map: Record<string, string> = {
    'خشبي': 'woody',    'woody': 'woody',    'wood': 'woody',
    'شرقي': 'oriental', 'oriental': 'oriental', 'amber': 'oriental',
    'زهري': 'floral',   'floral': 'floral',  'flower': 'floral',
    'منعش': 'fresh',    'fresh': 'fresh',    'aquatic': 'fresh',
    'حمضيات': 'citrus', 'citrus': 'citrus',
    'برتقال': 'citrus', 'ليمون': 'citrus',
    'توابل': 'spicy',   'spicy': 'spicy',
    'سويتي': 'sweet',   'sweet': 'sweet',    'gourmand': 'sweet',
  }
  return map[f.toLowerCase().trim()] ?? f.toLowerCase().trim()
}

/**
 * Extract fragrance families from Fragella data
 */
function extractFamilies(fragellaData: any): string[] {
  const families: string[] = []
  const addAccords = (arr: unknown) => {
    if (!arr || !Array.isArray(arr)) return
    arr.forEach((a: any) => {
      if (typeof a === 'string') families.push(a)
      else if (a && typeof a === 'object' && a.name) families.push(a.name)
    })
  }
  addAccords(fragellaData.main_accords)
  addAccords(fragellaData['Main Accords'])
  if (fragellaData.olfactive_family && typeof fragellaData.olfactive_family === 'string') {
    families.push(fragellaData.olfactive_family)
  }
  return [...new Set(families)]
    .filter(f => f && typeof f === 'string' && f.trim())
    .map(normalizeFamily)
}

/**
 * Extract ingredients from Fragella notes using note-to-ingredient mapping
 */
function extractIngredients(fragellaData: any): string[] {
  const ingredients = new Set<string>()
  
  // Extract notes from pyramid (API can return string or {name, category?})
  const allNotes: Array<string | PerfumeNote> = []
  
  // Helper to safely extract notes (API can return string[] or PerfumeNote[])
  const extractNotesArray = (notes: unknown): Array<string | PerfumeNote> => {
    if (!notes) return []
    if (Array.isArray(notes)) return notes as Array<string | PerfumeNote>
    if (typeof notes === 'string') return [notes]
    return []
  }
  
  // Extract from all pyramid levels (snake_case or Fragella's Notes.Top/Middle/Base)
  allNotes.push(...extractNotesArray(fragellaData.top_notes))
  allNotes.push(...extractNotesArray(fragellaData.middle_notes))
  allNotes.push(...extractNotesArray(fragellaData.base_notes))
  const notesObj = fragellaData.Notes || fragellaData.notes
  if (notesObj && typeof notesObj === 'object') {
    allNotes.push(...extractNotesArray(notesObj.Top || notesObj.top))
    allNotes.push(...extractNotesArray(notesObj.Middle || notesObj.middle))
    allNotes.push(...extractNotesArray(notesObj.Base || notesObj.base))
  }
  allNotes.push(...extractNotesArray(fragellaData['General Notes'] || fragellaData.general_notes))
  
  // Map notes to ingredients
  for (const note of allNotes) {
    const noteName = typeof note === 'string' ? note : (note as { name?: string })?.name ?? null
    if (noteName && typeof noteName === 'string') {
      const noteIngredients = getIngredientsForNote(noteName)
      noteIngredients.forEach(ing => ingredients.add(ing))
    }
  }
  
  return Array.from(ingredients)
}

/**
 * Extract scent pyramid from Fragella data
 */
function extractPyramid(fragellaData: any): any[] | undefined {
  const notesObj = fragellaData.Notes || fragellaData.notes
  const top = fragellaData.top_notes ?? notesObj?.Top ?? notesObj?.top ?? []
  const middle = fragellaData.middle_notes ?? notesObj?.Middle ?? notesObj?.middle ?? []
  const base = fragellaData.base_notes ?? notesObj?.Base ?? notesObj?.base ?? []
  const hasNotes = (Array.isArray(top) && top.length) || (Array.isArray(middle) && middle.length) || (Array.isArray(base) && base.length)
  
  if (!hasNotes) return undefined
  
  return [
    { stage: 'top', stageAr: 'المقدمة', notes: extractNoteNames(top), duration: '15-30 دقيقة', color: '#FFE5B4' },
    { stage: 'heart', stageAr: 'القلب', notes: extractNoteNames(middle), duration: '2-4 ساعات', color: '#FFC0CB' },
    { stage: 'base', stageAr: 'القاعدة', notes: extractNoteNames(base), duration: '4-8 ساعات', color: '#DEB887' }
  ]
}

/**
 * Extract note names from Fragella notes array
 */
function extractNoteNames(notes: any): string[] {
  if (!notes) return []
  if (!Array.isArray(notes)) return []
  
  return notes
    .map((note): string | null => {
      if (typeof note === 'string') return note
      if (isPerfumeNote(note)) return note.name
      return null
    })
    .filter((name): name is string => Boolean(name))
}

// ============================================
// IFRA ENRICHMENT
// ============================================

/**
 * Enrich perfume with IFRA safety data
 * @param perfume - Unified perfume
 * @param userSymptoms - Optional user symptoms for personalized safety
 * @returns Enriched perfume with IFRA scores
 */
export async function enrichWithIFRA(
  perfume: UnifiedPerfume,
  userSymptoms: string[] = []
): Promise<UnifiedPerfume> {
  // Validate input
  if (!perfume || typeof perfume !== 'object') {
    throw new Error('Invalid perfume object')
  }

  // If local perfume, it already has symptomTriggers
  if (perfume.source === 'local') {
    const safetyData = calculateIngredientsSafetyScore(perfume.ingredients || [])
    
    return {
      ...perfume,
      ifraScore: safetyData.score,
      ifraWarnings: safetyData.warnings
    }
  }
  
  // If Fragella perfume, calculate IFRA data
  const ingredients = perfume.ingredients || []
  
  // Calculate IFRA safety score
  const safetyData = calculateIngredientsSafetyScore(ingredients)
  
  // Calculate symptom triggers if user symptoms provided
  let symptomTriggers: string[] = []
  if (Array.isArray(userSymptoms) && userSymptoms.length > 0) {
    const symptomAnalysis = calculateSymptomMatchScore(ingredients, userSymptoms)
    symptomTriggers = symptomAnalysis.triggers.flatMap(t => t.symptoms)
  }
  
  return {
    ...perfume,
    symptomTriggers,
    ifraScore: safetyData.score,
    ifraWarnings: safetyData.warnings,
    isSafe: safetyData.score >= 70 && symptomTriggers.length === 0
  }
}

/**
 * Batch enrich multiple perfumes with IFRA data
 */
export async function enrichBatchWithIFRA(
  perfumes: UnifiedPerfume[],
  userSymptoms: string[] = []
): Promise<UnifiedPerfume[]> {
  // Validate input
  if (!Array.isArray(perfumes)) {
    return []
  }

  return Promise.all(
    perfumes.map(p => enrichWithIFRA(p, userSymptoms))
  )
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Remove duplicate perfumes (prefer local over Fragella)
 */
function deduplicatePerfumes(perfumes: UnifiedPerfume[]): UnifiedPerfume[] {
  const seen = new Map<string, UnifiedPerfume>()

  for (const perfume of perfumes) {
    if (!perfume || !perfume.name || !perfume.brand) continue

    const key = perfume.id ?? `${perfume.name.toLowerCase()}|${perfume.brand.toLowerCase()}`
    const existing = seen.get(key)

    if (!existing) {
      seen.set(key, perfume)
      continue
    }

    // Prefer local over Fragella when same key appears twice
    if (perfume.source === 'local' && existing.source === 'fragella') {
      seen.set(key, perfume)
    }
  }

  return Array.from(seen.values())
}

/**
 * Check if ID is local format
 */
export function isLocalId(id: string): boolean {
  if (!id || typeof id !== 'string') return false
  return /^\d+$/.test(id)
}

/**
 * Check if ID is Fragella format
 */
export function isFragellaId(id: string): boolean {
  if (!id || typeof id !== 'string') return false
  return id.startsWith('fragella-')
}

/**
 * Convert local ID to Fragella ID (for migration)
 */
export function localIdToFragellaId(localId: string, fragellaId: string): string {
  return `fragella-${fragellaId}`
}

/**
 * Get source from ID
 */
export function getSourceFromId(id: string): 'local' | 'fragella' | 'unknown' {
  if (isLocalId(id)) return 'local'
  if (isFragellaId(id)) return 'fragella'
  return 'unknown'
}
