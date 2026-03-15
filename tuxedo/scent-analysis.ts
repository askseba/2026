// Scent Profile Analysis
// Calculates user's scent profile based on liked perfumes

import { getPerfumeById, type Perfume } from './data/perfumes'

// Scent families with their colors (matching RadarChart)
export interface ScentFamily {
  name: string
  color: string
  keywords: string[] // Keywords to identify this family in descriptions
}

export const SCENT_FAMILIES: ScentFamily[] = [
  {
    name: 'فلورال',
    color: 'var(--color-safe-green)',
    keywords: ['ورد', 'ياسمين', 'زهر', 'فلورال', 'flower', 'rose', 'jasmine', 'floral', 'زعفران']
  },
  {
    name: 'خشبي',
    color: 'var(--color-warning-amber)',
    keywords: ['خشب', 'صندل', 'أرز', 'عود', 'wood', 'sandalwood', 'cedar', 'oud', 'woody', 'أخشاب']
  },
  {
    name: 'حمضيات',
    color: 'var(--color-danger-red)',
    keywords: ['ليمون', 'برتقال', 'برغموت', 'جريب فروت', 'citrus', 'lemon', 'orange', 'bergamot', 'grapefruit', 'حمضيات']
  },
  {
    name: 'شرقي',
    color: 'var(--color-google-blue)',
    keywords: ['عنبر', 'مسك', 'لبان', 'شرقي', 'oriental', 'amber', 'musk', 'frankincense', 'عنبر']
  },
  {
    name: 'منعش',
    color: 'var(--color-accent-purple)',
    keywords: ['لافندر', 'نعناع', 'منعش', 'fresh', 'lavender', 'mint', 'aquatic', 'منعش']
  },
  {
    name: 'توابل',
    color: 'var(--color-accent-pink)',
    keywords: ['فلفل', 'زنجبيل', 'قرنفل', 'توابل', 'spicy', 'pepper', 'ginger', 'clove', 'spice', 'تبغ']
  }
]

// Mapping of perfume IDs to their primary scent families
// This is a more accurate approach than parsing descriptions
const PERFUME_FAMILIES_MAP: Record<string, string[]> = {
  // Bleu de Chanel - حمضيات + خشبي
  '1': ['حمضيات', 'خشبي'],
  // Aventus - حمضيات + منعش
  '2': ['حمضيات', 'منعش'],
  // Oud Wood - خشبي + شرقي
  '3': ['خشبي', 'شرقي'],
  // Sauvage - منعش + توابل
  '4': ['منعش', 'توابل'],
  // Terre d'Hermès - حمضيات + خشبي
  '5': ['حمضيات', 'خشبي'],
  // Flowerbomb - فلورال
  '6': ['فلورال'],
  // Black Opium - سويتي (not in our families, but we'll map to شرقي)
  '7': ['شرقي'],
  // Noir - توابل + شرقي
  '8': ['توابل', 'شرقي'],
  // Baccarat Rouge - شرقي + توابل
  '9': ['شرقي', 'توابل'],
  // Santal 33 - خشبي
  '10': ['خشبي'],
  // Creed Aventus - حمضيات + منعش
  '11': ['حمضيات', 'منعش'],
  // Amouage - شرقي + فلورال
  '12': ['شرقي', 'فلورال'],
  // Byredo - سويتي (map to شرقي)
  '13': ['شرقي'],
  // Diptyque - فلورال + شرقي
  '14': ['فلورال', 'شرقي'],
  // Penhaligon - منعش + فلورال
  '15': ['منعش', 'فلورال'],
  // Maison Margiela - خشبي + توابل
  '16': ['خشبي', 'توابل'],
  // Kilian - شرقي
  '17': ['شرقي'],
  // Roja - شرقي + خشبي
  '18': ['شرقي', 'خشبي'],
  // Xerjoff - شرقي + خشبي
  '19': ['شرقي', 'خشبي']
}

/**
 * Analyzes perfume description to extract scent families
 * Falls back to keywords matching if no direct mapping exists
 */
function extractFamiliesFromPerfume(perfume: Perfume): string[] {
  // First, check if we have a direct mapping
  if (PERFUME_FAMILIES_MAP[perfume.id]) {
    return PERFUME_FAMILIES_MAP[perfume.id]
  }

  // Fallback: analyze description
  const description = (perfume.description || '').toLowerCase()
  const foundFamilies: string[] = []

  for (const family of SCENT_FAMILIES) {
    const hasKeyword = family.keywords.some(keyword => 
      description.includes(keyword.toLowerCase())
    )
    if (hasKeyword) {
      foundFamilies.push(family.name)
    }
  }

  // If no families found, return a default (منعش)
  return foundFamilies.length > 0 ? foundFamilies : ['منعش']
}

/**
 * Calculates scent profile based on liked perfume IDs
 * Returns radar chart data with percentages (0-100)
 */
export interface RadarPoint {
  name: string
  score: number
  color: string
}

export function calculateScentProfile(likedIds: string[]): RadarPoint[] {
  // If no liked perfumes, return balanced default data
  if (likedIds.length === 0) {
    return SCENT_FAMILIES.map(family => ({
      name: family.name,
      score: 50, // Balanced default
      color: family.color
    }))
  }

  // Get all liked perfumes
  const likedPerfumes = likedIds
    .map(id => getPerfumeById(id))
    .filter((p): p is Perfume => p !== undefined)

  // Count occurrences of each family
  const familyCounts: Record<string, number> = {}
  
  // Initialize all families to 0
  SCENT_FAMILIES.forEach(family => {
    familyCounts[family.name] = 0
  })

  // Count families from each perfume
  likedPerfumes.forEach(perfume => {
    const families = extractFamiliesFromPerfume(perfume)
    families.forEach(familyName => {
      if (familyCounts[familyName] !== undefined) {
        familyCounts[familyName] += 1
      }
    })
  })

  // Calculate percentages
  const totalOccurrences = Object.values(familyCounts).reduce((sum, count) => sum + count, 0)
  
  // If no occurrences found, return balanced default
  if (totalOccurrences === 0) {
    return SCENT_FAMILIES.map(family => ({
      name: family.name,
      score: 50,
      color: family.color
    }))
  }

  // Convert counts to percentages (0-100)
  // Normalize to ensure good visual distribution
  const maxCount = Math.max(...Object.values(familyCounts))
  const minCount = Math.min(...Object.values(familyCounts))
  const range = maxCount - minCount || 1 // Avoid division by zero

  return SCENT_FAMILIES.map(family => {
    const count = familyCounts[family.name]
    // Normalize: scale from [minCount, maxCount] to [30, 100]
    // This ensures all values are visible and meaningful
    const normalizedScore = range > 0
      ? 30 + ((count - minCount) / range) * 70
      : 50
    
    return {
      name: family.name,
      score: Math.round(normalizedScore),
      color: family.color
    }
  })
}

import { getPerfumeById, type Perfume } from './data/perfumes'

// Scent families with their colors (matching RadarChart)
export interface ScentFamily {
  name: string
  color: string
  keywords: string[]
}

export const SCENT_FAMILIES: ScentFamily[] = [
  {
    name: 'زهري',
    color: 'var(--color-apple-green)',
    keywords: ['ورد', 'ياسمين', 'فل', 'زنبق', 'وردة', 'rose', 'jasmine', 'floral']
  },
  {
    name: 'خشبي',
    color: 'var(--color-sunny-orange)',
    keywords: ['عود', 'صندل', 'أرز', 'خشب', 'wood', 'oud', 'sandalwood', 'cedar']
  },
  {
    name: 'شرقي',
    color: 'var(--color-google-blue)',
    keywords: ['عنبر', 'مسك', 'لبان', 'شرقي', 'oriental', 'amber', 'musk', 'frankincense', 'عنبر']
  },
  {
    name: 'منعش',
    color: 'var(--color-ocean-blue)',
    keywords: ['حمضي', 'برتقال', 'ليمون', 'منعش', 'citrus', 'bergamot', 'lemon', 'orange']
  },
  {
    name: 'حار',
    color: 'var(--color-hot-red)',
    keywords: ['فلفل', 'بهارات', 'توابل', 'spicy', 'pepper', 'cardamom', 'cinnamon']
  },
  {
    name: 'سويتي',
    color: 'var(--color-violet)',
    keywords: ['فانيليا', 'سكر', 'كراميل', 'حلو', 'sweet', 'vanilla', 'gourmand', 'caramel']
  }
]

/**
 * Analyze a perfume's description and notes to estimate its scent family distribution.
 * Returns a map of ScentFamily.name -> score (0-100).
 */
export function analyzePerfumeScentFamilies(perfumeId: string): Record<string, number> {
  const perfume = getPerfumeById(perfumeId)
  if (!perfume) {
    return SCENT_FAMILIES.reduce((acc, family) => {
      acc[family.name] = 0
      return acc
    }, {} as Record<string, number>)
  }

  const text = [
    perfume.name,
    perfume.description,
    ...(perfume.families || []),
    ...(perfume.ingredients || [])
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  const scores: Record<string, number> = {}

  for (const family of SCENT_FAMILIES) {
    let score = 0
    for (const keyword of family.keywords) {
      const k = keyword.toLowerCase()
      if (text.includes(k)) {
        score += 20
      }
    }
    scores[family.name] = Math.min(score, 100)
  }

  return scores
}

export interface RadarPoint {
  name: string
  score: number
  color: string
}

/**
 * Build radar chart data for a perfume's scent profile.
 */
export function buildScentRadarData(perfumeId: string): RadarPoint[] {
  const scores = analyzePerfumeScentFamilies(perfumeId)

  return SCENT_FAMILIES.map(family => ({
    name: family.name,
    score: scores[family.name] ?? 0,
    color: family.color
  }))
}

