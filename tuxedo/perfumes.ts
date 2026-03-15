// Unified data layer for Ask Seba PWA
// Single source of truth for all perfume and user data

import { TimelineStage } from '@/components/ui/PerfumeTimeline'

export interface Perfume {
  id: string
  name: string
  brand: string
  image: string
  score?: number // Match percentage (0-100)
  matchPercentage?: number // Alias for score
  status?: 'safe' | 'warning' | 'danger'
  price?: number
  originalPrice?: number | null
  description?: string
  isSafe?: boolean
  variant?: 'on-sale' | 'just-arrived'
  // NEW: For allergy filtering
  families?: string[] // e.g., ['floral', 'woody', 'citrus']
  ingredients?: string[] // e.g., ['jasmine', 'rose', 'oud']
  symptomTriggers?: string[] // e.g., ['sneeze', 'headache'] - symptoms this perfume may cause
  stages?: TimelineStage[] // Timeline stages for perfume (top, middle, base notes)
}

export interface RadarDataPoint {
  label: string
  value: number
  color?: string
}

export interface UserStats {
  totalMatches: number
  savedPerfumes: number
  searches: number
  samples: number
}

// All perfumes database with families, ingredients, and symptom triggers
export const perfumes: Perfume[] = [
  // Featured / Bestsellers
  {
    id: '1',
    name: 'Bleu de Chanel',
    brand: 'Chanel',
    image: 'https://picsum.photos/seed/perfume-1/300/400',
    score: 92,
    matchPercentage: 92,
    status: 'safe',
    price: 450,
    isSafe: true,
    description: 'عطر فاخر يجمع بين الحمضيات والأخشاب',
    families: ['citrus', 'woody'],
    ingredients: ['bergamot', 'sandalwood', 'lavender'],
    symptomTriggers: []
  },
  {
    id: '2',
    name: 'Aventus',
    brand: 'Creed',
    image: 'https://picsum.photos/seed/perfume-2/300/400',
    score: 88,
    matchPercentage: 88,
    status: 'safe',
    price: 550,
    isSafe: true,
    description: 'عطر ملكي بلمسات من الأناناس والبرغموت',
    families: ['citrus', 'woody'],
    ingredients: ['bergamot', 'patchouli', 'musk'],
    symptomTriggers: []
  },
  {
    id: '3',
    name: 'Oud Wood',
    brand: 'Tom Ford',
    image: 'https://picsum.photos/seed/perfume-3/300/400',
    score: 85,
    matchPercentage: 85,
    status: 'safe',
    price: 650,
    isSafe: true,
    description: 'مزيج فاخر من العود والورد',
    families: ['woody', 'floral'],
    ingredients: ['oud', 'rose', 'sandalwood'],
    symptomTriggers: ['headache'] // Strong oud can cause headaches
  },
  {
    id: '4',
    name: 'Sauvage',
    brand: 'Dior',
    image: 'https://picsum.photos/seed/perfume-4/300/400',
    score: 87,
    matchPercentage: 87,
    status: 'safe',
    price: 480,
    isSafe: true,
    description: 'عطر قوي بلمسات من الفلفل والبرغموت',
    families: ['spicy', 'citrus'],
    ingredients: ['pepper', 'bergamot', 'amber'],
    symptomTriggers: ['sneeze'] // Spicy notes can trigger sneezing
  },
  {
    id: '5',
    name: 'Terre d\'Hermès',
    brand: 'Hermès',
    image: 'https://picsum.photos/seed/perfume-5/300/400',
    score: 90,
    matchPercentage: 90,
    status: 'safe',
    price: 520,
    isSafe: true,
    description: 'عطر ترابي بلمسات من البرتقال والفلين',
    families: ['citrus', 'woody'],
    ingredients: ['bergamot', 'sandalwood', 'patchouli'],
    symptomTriggers: []
  },
  
  // Disliked
  {
    id: '6',
    name: 'Flowerbomb',
    brand: 'Viktor & Rolf',
    image: 'https://picsum.photos/seed/perfume-6/300/400',
    score: 45,
    matchPercentage: 45,
    status: 'danger',
    price: 380,
    isSafe: false,
    description: 'عطر زهري قوي قد لا يناسب الجميع',
    families: ['floral', 'gourmand'],
    ingredients: ['jasmine', 'rose', 'vanilla'],
    symptomTriggers: ['sneeze', 'headache', 'nausea'] // Very strong floral
  },
  {
    id: '7',
    name: 'Black Opium',
    brand: 'YSL',
    image: 'https://picsum.photos/seed/perfume-7/300/400',
    score: 38,
    matchPercentage: 38,
    status: 'danger',
    price: 420,
    isSafe: false,
    description: 'عطر حلو قوي بلمسات من الفانيليا والقهوة',
    families: ['gourmand', 'floral'],
    ingredients: ['vanilla', 'jasmine', 'amber'],
    symptomTriggers: ['headache', 'nausea'] // Very sweet and heavy
  },
  
  // Wishlist
  {
    id: '8',
    name: 'Noir',
    brand: 'Tom Ford',
    image: 'https://picsum.photos/seed/perfume-8/300/400',
    score: 82,
    matchPercentage: 82,
    status: 'warning',
    price: 680,
    isSafe: true,
    variant: 'just-arrived',
    description: 'عطر ليلي فاخر بلمسات من التوابل',
    families: ['spicy', 'leather'],
    ingredients: ['pepper', 'leather', 'vanilla'],
    symptomTriggers: ['sneeze']
  },
  {
    id: '9',
    name: 'Baccarat Rouge',
    brand: 'Maison Francis',
    image: 'https://picsum.photos/seed/perfume-9/300/400',
    score: 75,
    matchPercentage: 75,
    status: 'warning',
    price: 750,
    isSafe: true,
    variant: 'just-arrived',
    description: 'عطر فاخر بلمسات من الزعفران والعنبر',
    families: ['floral', 'woody'],
    ingredients: ['jasmine', 'amber', 'sandalwood'],
    symptomTriggers: []
  },
  {
    id: '10',
    name: 'Santal 33',
    brand: 'Le Labo',
    image: 'https://picsum.photos/seed/perfume-10/300/400',
    score: 88,
    matchPercentage: 88,
    status: 'safe',
    price: 620,
    isSafe: true,
    description: 'عطر خشبي بلمسات من الصندل والفانيليا',
    families: ['woody', 'gourmand'],
    ingredients: ['sandalwood', 'vanilla', 'leather'],
    symptomTriggers: []
  },
  {
    id: '11',
    name: 'Creed Aventus',
    brand: 'Creed',
    image: 'https://picsum.photos/seed/perfume-11/300/400',
    score: 90,
    matchPercentage: 90,
    status: 'safe',
    price: 580,
    isSafe: true,
    description: 'نسخة محدودة من Aventus الكلاسيكي',
    families: ['citrus', 'woody'],
    ingredients: ['bergamot', 'patchouli', 'musk'],
    symptomTriggers: []
  },
  {
    id: '12',
    name: 'Amouage',
    brand: 'Amouage',
    image: 'https://picsum.photos/seed/perfume-12/300/400',
    score: 85,
    matchPercentage: 85,
    status: 'safe',
    price: 720,
    isSafe: true,
    description: 'عطر عماني فاخر بلمسات من اللبان والورد',
    families: ['floral', 'woody'],
    ingredients: ['rose', 'oud', 'amber'],
    symptomTriggers: ['headache'] // Heavy oriental
  },
  {
    id: '13',
    name: 'Byredo',
    brand: 'Byredo',
    image: 'https://picsum.photos/seed/perfume-13/300/400',
    score: 80,
    matchPercentage: 80,
    status: 'warning',
    price: 590,
    isSafe: true,
    variant: 'just-arrived',
    description: 'عطر سويدي معاصر بلمسات من الفانيليا',
    families: ['gourmand', 'woody'],
    ingredients: ['vanilla', 'sandalwood', 'musk'],
    symptomTriggers: []
  },
  {
    id: '14',
    name: 'Diptyque',
    brand: 'Diptyque',
    image: 'https://picsum.photos/seed/perfume-14/300/400',
    score: 78,
    matchPercentage: 78,
    status: 'warning',
    price: 540,
    isSafe: true,
    variant: 'just-arrived',
    description: 'عطر فرنسي بلمسات من الورد والمسك',
    families: ['floral'],
    ingredients: ['rose', 'musk', 'jasmine'],
    symptomTriggers: ['sneeze', 'rash'] // Floral can cause skin reactions
  },
  {
    id: '15',
    name: 'Penhaligon',
    brand: 'Penhaligon',
    image: 'https://picsum.photos/seed/perfume-15/300/400',
    score: 83,
    matchPercentage: 83,
    status: 'safe',
    price: 650,
    isSafe: true,
    description: 'عطر بريطاني كلاسيكي بلمسات من الخزامى',
    families: ['floral', 'citrus'],
    ingredients: ['lavender', 'bergamot', 'musk'],
    symptomTriggers: []
  },
  {
    id: '16',
    name: 'Maison Margiela',
    brand: 'MM',
    image: 'https://picsum.photos/seed/perfume-16/300/400',
    score: 77,
    matchPercentage: 77,
    status: 'warning',
    price: 580,
    isSafe: true,
    variant: 'just-arrived',
    description: 'عطر معاصر بلمسات من الجلد والتبغ',
    families: ['leather', 'spicy'],
    ingredients: ['leather', 'pepper', 'patchouli'],
    symptomTriggers: ['sneeze', 'nausea'] // Leather can be heavy
  },
  {
    id: '17',
    name: 'Kilian',
    brand: 'Kilian',
    image: 'https://picsum.photos/seed/perfume-17/300/400',
    score: 81,
    matchPercentage: 81,
    status: 'safe',
    price: 690,
    isSafe: true,
    description: 'عطر فاخر بلمسات من الفانيليا والكاكاو',
    families: ['gourmand'],
    ingredients: ['vanilla', 'amber', 'musk'],
    symptomTriggers: []
  },
  {
    id: '18',
    name: 'Roja',
    brand: 'Roja',
    image: 'https://picsum.photos/seed/perfume-18/300/400',
    score: 79,
    matchPercentage: 79,
    status: 'warning',
    price: 850,
    isSafe: true,
    variant: 'just-arrived',
    description: 'عطر فاخر بلمسات من العود والورد',
    families: ['woody', 'floral'],
    ingredients: ['oud', 'rose', 'amber'],
    symptomTriggers: ['headache']
  },
  {
    id: '19',
    name: 'Xerjoff',
    brand: 'Xerjoff',
    image: 'https://picsum.photos/seed/perfume-19/300/400',
    score: 84,
    matchPercentage: 84,
    status: 'safe',
    price: 780,
    isSafe: true,
    description: 'عطر إيطالي فاخر بلمسات من العود والمسك',
    families: ['woody'],
    ingredients: ['oud', 'musk', 'sandalwood'],
    symptomTriggers: []
  }
]

// Helper functions
export function getPerfumeById(id: string): Perfume | undefined {
  return perfumes.find(p => p.id === id)
}

export function getPerfumesByStatus(status: 'safe' | 'warning' | 'danger'): Perfume[] {
  return perfumes.filter(p => p.status === status)
}

export function getFeaturedPerfumes(limit: number = 3): Perfume[] {
  return perfumes
    .filter(p => p.score && p.score >= 85)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, limit)
}

export function getFavoritesPerfumes(): Perfume[] {
  return perfumes.filter(p => 
    ['1', '2', '3', '4', '5'].includes(p.id)
  )
}

export function getDislikedPerfumes(): Perfume[] {
  return perfumes.filter(p => 
    ['6', '7'].includes(p.id)
  )
}

export function getWishlistPerfumes(): Perfume[] {
  return perfumes.filter(p => 
    ['8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'].includes(p.id)
  )
}

// Radar chart data
export const defaultRadarData: RadarDataPoint[] = [
  { label: 'خشبي', value: 85 },
  { label: 'شرقي', value: 75 },
  { label: 'زهري', value: 30 },
  { label: 'حمضيات', value: 45 },
  { label: 'حار', value: 60 },
  { label: 'سويتي', value: 70 }
]

// User stats
export const defaultUserStats: UserStats = {
  totalMatches: 23,
  savedPerfumes: 12,
  searches: 45,
  samples: 3
}

// Calculate status from score
export function calculateStatus(score: number): 'safe' | 'warning' | 'danger' {
  if (score >= 90) return 'safe'
  if (score >= 80) return 'warning'
  return 'danger'
}

// Normalize perfume data (ensure score and matchPercentage are synced)
export function normalizePerfume(perfume: Perfume): Perfume {
  const score = perfume.score ?? perfume.matchPercentage ?? 0
  const matchPercentage = perfume.matchPercentage ?? perfume.score ?? 0
  
  return {
    ...perfume,
    score,
    matchPercentage,
    status: perfume.status ?? calculateStatus(score),
    isSafe: perfume.isSafe ?? score >= 80,
    stages: perfume.stages ?? getDefaultStages({ 
      ...perfume, 
      score, 
      status: perfume.status ?? calculateStatus(score) 
    })
  }
}

/**
 * إنشاء stages افتراضية للعطر بناءً على البيانات المتاحة
 */
export function getDefaultStages(perfume: Perfume): TimelineStage[] {
  const baseScore = perfume.score ?? 85
  const baseStatus = perfume.status ?? 'safe'
  
  // استخدام ingredients إذا موجودة، وإلا استخدم قيم افتراضية
  const ingredients = perfume.ingredients || []
  const topNotes = ingredients.slice(0, 3).join(' • ') || 'برغموت • فلفل • ليمون'
  const middleNotes = ingredients.slice(3, 6).join(' • ') || 'لافندر • باتشولي • جيرانيوم'
  const baseNotes = ingredients.slice(6, 9).join(' • ') || 'أمبروكسان • أرز • فيتيفر'
  
  return [
    {
      score: baseScore,
      status: baseStatus,
      stageName: 'الافتتاحية',
      notes: topNotes
    },
    {
      score: Math.max(0, baseScore - 5),
      status: baseStatus,
      stageName: 'القلب',
      notes: middleNotes
    },
    {
      score: Math.min(100, baseScore + 5),
      status: baseStatus,
      stageName: 'القاعدة',
      notes: baseNotes
    }
  ]
}

// Unified data layer for Ask Seba PWA
// Single source of truth for all perfume and user data

import { TimelineStage } from '@/components/ui/PerfumeTimeline'

export interface Perfume {
  id: string
  name: string
  brand: string
  image: string
  score?: number // Match percentage (0-100)
  matchPercentage?: number // Alias for score
  status?: 'safe' | 'warning' | 'danger'
  price?: number
  originalPrice?: number | null
  description?: string
  isSafe?: boolean
  variant?: 'on-sale' | 'just-arrived'
  // NEW: For allergy filtering
  families?: string[] // e.g., ['floral', 'woody', 'citrus']
  ingredients?: string[] // e.g., ['jasmine', 'rose', 'oud']
  symptomTriggers?: string[] // e.g., ['sneeze', 'headache'] - symptoms this perfume may cause
  stages?: TimelineStage[] // Timeline stages for perfume (top, middle, base notes)
}

export interface RadarDataPoint {
  label: string
  value: number
  color?: string
}

export interface UserStats {
  totalMatches: number
  savedPerfumes: number
  searches: number
  samples: number
}

// All perfumes database with families, ingredients, and symptom triggers
export const perfumes: Perfume[] = [
  // Featured / Bestsellers
  {
    id: '1',
    name: 'Bleu de Chanel',
    brand: 'Chanel',
    image: 'https://picsum.photos/seed/perfume-1/300/400',
    score: 92,
    matchPercentage: 92,
    status: 'safe',
    price: 450,
    isSafe: true,
    description: 'عطر فاخر يجمع بين الحمضيات والأخشاب',
    families: ['citrus', 'woody'],
    ingredients: ['bergamot', 'sandalwood', 'lavender'],
    symptomTriggers: []
  },
  {
    id: '2',
    name: 'Aventus',
    brand: 'Creed',
    image: 'https://picsum.photos/seed/perfume-2/300/400',
    score: 88,
    matchPercentage: 88,
    status: 'safe',
    price: 550,
    isSafe: true,
    description: 'عطر ملكي بلمسات من الأناناس والبرغموت',
    families: ['citrus', 'woody'],
    ingredients: ['bergamot', 'patchouli', 'musk'],
    symptomTriggers: []
  },
  {
    id: '3',
    name: 'Oud Wood',
    brand: 'Tom Ford',
    image: 'https://picsum.photos/seed/perfume-3/300/400',
    score: 85,
    matchPercentage: 85,
    status: 'safe',
    price: 650,
    isSafe: true,
    description: 'مزيج فاخر من العود والورد',
    families: ['woody', 'floral'],
    ingredients: ['oud', 'rose', 'sandalwood'],
    symptomTriggers: ['headache'] // Strong oud can cause headaches
  },
  {
    id: '4',
    name: 'Sauvage',
    brand: 'Dior',
    image: 'https://picsum.photos/seed/perfume-4/300/400',
    score: 87,
    matchPercentage: 87,
    status: 'safe',
    price: 480,
    isSafe: true,
    description: 'عطر قوي بلمسات من الفلفل والبرغموت',
    families: ['spicy', 'citrus'],
    ingredients: ['pepper', 'bergamot', 'amber'],
    symptomTriggers: ['sneeze'] // Spicy notes can trigger sneezing
  },
  {
    id: '5',
    name: 'Terre d\'Hermès',
    brand: 'Hermès',
    image: 'https://picsum.photos/seed/perfume-5/300/400',
    score: 90,
    matchPercentage: 90,
    status: 'safe',
    price: 520,
    isSafe: true,
    description: 'عطر ترابي بلمسات من البرتقال والفلين',
    families: ['citrus', 'woody'],
    ingredients: ['bergamot', 'sandalwood', 'patchouli'],
    symptomTriggers: []
  },
  
  // Disliked
  {
    id: '6',
    name: 'Flowerbomb',
    brand: 'Viktor & Rolf',
    image: 'https://picsum.photos/seed/perfume-6/300/400',
    score: 45,
    matchPercentage: 45,
    status: 'danger',
    price: 380,
    isSafe: false,
    description: 'عطر زهري قوي قد لا يناسب الجميع',
    families: ['floral', 'gourmand'],
    ingredients: ['jasmine', 'rose', 'vanilla'],
    symptomTriggers: ['sneeze', 'headache', 'nausea'] // Very strong floral
  },
  {
    id: '7',
    name: 'Black Opium',
    brand: 'YSL',
    image: 'https://picsum.photos/seed/perfume-7/300/400',
    score: 38,
    matchPercentage: 38,
    status: 'danger',
    price: 420,
    isSafe: false,
    description: 'عطر حلو قوي بلمسات من الفانيليا والقهوة',
    families: ['gourmand', 'floral'],
    ingredients: ['vanilla', 'jasmine', 'amber'],
    symptomTriggers: ['headache', 'nausea'] // Very sweet and heavy
  },
  
  // Wishlist
  {
    id: '8',
    name: 'Noir',
    brand: 'Tom Ford',
    image: 'https://picsum.photos/seed/perfume-8/300/400',
    score: 82,
    matchPercentage: 82,
    status: 'warning',
    price: 680,
    isSafe: true,
    variant: 'just-arrived',
    description: 'عطر ليلي فاخر بلمسات من التوابل',
    families: ['spicy', 'leather'],
    ingredients: ['pepper', 'leather', 'vanilla'],
    symptomTriggers: ['sneeze']
  },
  {
    id: '9',
    name: 'Baccarat Rouge',
    brand: 'Maison Francis',
    image: 'https://picsum.photos/seed/perfume-9/300/400',
    score: 75,
    matchPercentage: 75,
    status: 'warning',
    price: 750,
    isSafe: true,
    variant: 'just-arrived',
    description: 'عطر فاخر بلمسات من الزعفران والعنبر',
    families: ['floral', 'woody'],
    ingredients: ['jasmine', 'amber', 'sandalwood'],
    symptomTriggers: []
  },
  {
    id: '10',
    name: 'Santal 33',
    brand: 'Le Labo',
    image: 'https://picsum.photos/seed/perfume-10/300/400',
    score: 88,
    matchPercentage: 88,
    status: 'safe',
    price: 620,
    isSafe: true,
    description: 'عطر خشبي بلمسات من الصندل والفانيليا',
    families: ['woody', 'gourmand'],
    ingredients: ['sandalwood', 'vanilla', 'leather'],
    symptomTriggers: []
  },
  {
    id: '11',
    name: 'Creed Aventus',
    brand: 'Creed',
    image: 'https://picsum.photos/seed/perfume-11/300/400',
    score: 90,
    matchPercentage: 90,
    status: 'safe',
    price: 580,
    isSafe: true,
    description: 'نسخة محدودة من Aventus الكلاسيكي',
    families: ['citrus', 'woody'],
    ingredients: ['bergamot', 'patchouli', 'musk'],
    symptomTriggers: []
  },
  {
    id: '12',
    name: 'Amouage',
    brand: 'Amouage',
    image: 'https://picsum.photos/seed/perfume-12/300/400',
    score: 85,
    matchPercentage: 85,
    status: 'safe',
    price: 720,
    isSafe: true,
    description: 'عطر عماني فاخر بلمسات من اللبان والورد',
    families: ['floral', 'woody'],
    ingredients: ['rose', 'oud', 'amber'],
    symptomTriggers: ['headache'] // Heavy oriental
  },
  {
    id: '13',
    name: 'Byredo',
    brand: 'Byredo',
    image: 'https://picsum.photos/seed/perfume-13/300/400',
    score: 80,
    matchPercentage: 80,
    status: 'warning',
    price: 590,
    isSafe: true,
    variant: 'just-arrived',
    description: 'عطر سويدي معاصر بلمسات من الفانيليا',
    families: ['gourmand', 'woody'],
    ingredients: ['vanilla', 'sandalwood', 'musk'],
    symptomTriggers: []
  },
  {
    id: '14',
    name: 'Diptyque',
    brand: 'Diptyque',
    image: 'https://picsum.photos/seed/perfume-14/300/400',
    score: 78,
    matchPercentage: 78,
    status: 'warning',
    price: 540,
    isSafe: true,
    variant: 'just-arrived',
    description: 'عطر فرنسي بلمسات من الورد والمسك',
    families: ['floral'],
    ingredients: ['rose', 'musk', 'jasmine'],
    symptomTriggers: ['sneeze', 'rash'] // Floral can cause skin reactions
  },
  {
    id: '15',
    name: 'Penhaligon',
    brand: 'Penhaligon',
    image: 'https://picsum.photos/seed/perfume-15/300/400',
    score: 83,
    matchPercentage: 83,
    status: 'safe',
    price: 650,
    isSafe: true,
    description: 'عطر بريطاني كلاسيكي بلمسات من الخزامى',
    families: ['floral', 'citrus'],
    ingredients: ['lavender', 'bergamot', 'musk'],
    symptomTriggers: []
  },
  {
    id: '16',
    name: 'Maison Margiela',
    brand: 'MM',
    image: 'https://picsum.photos/seed/perfume-16/300/400',
    score: 77,
    matchPercentage: 77,
    status: 'warning',
    price: 580,
    isSafe: true,
    variant: 'just-arrived',
    description: 'عطر معاصر بلمسات من الجلد والتبغ',
    families: ['leather', 'spicy'],
    ingredients: ['leather', 'pepper', 'patchouli'],
    symptomTriggers: ['sneeze', 'nausea'] // Leather can be heavy
  },
  {
    id: '17',
    name: 'Kilian',
    brand: 'Kilian',
    image: 'https://picsum.photos/seed/perfume-17/300/400',
    score: 81,
    matchPercentage: 81,
    status: 'safe',
    price: 690,
    isSafe: true,
    description: 'عطر فاخر بلمسات من الفانيليا والكاكاو',
    families: ['gourmand'],
    ingredients: ['vanilla', 'amber', 'musk'],
    symptomTriggers: []
  },
  {
    id: '18',
    name: 'Roja',
    brand: 'Roja',
    image: 'https://picsum.photos/seed/perfume-18/300/400',
    score: 79,
    matchPercentage: 79,
    status: 'warning',
    price: 850,
    isSafe: true,
    variant: 'just-arrived',
    description: 'عطر فاخر بلمسات من العود والورد',
    families: ['woody', 'floral'],
    ingredients: ['oud', 'rose', 'amber'],
    symptomTriggers: ['headache']
  },
  {
    id: '19',
    name: 'Xerjoff',
    brand: 'Xerjoff',
    image: 'https://picsum.photos/seed/perfume-19/300/400',
    score: 84,
    matchPercentage: 84,
    status: 'safe',
    price: 780,
    isSafe: true,
    description: 'عطر إيطالي فاخر بلمسات من العود والمسك',
    families: ['woody'],
    ingredients: ['oud', 'musk', 'sandalwood'],
    symptomTriggers: []
  }
]

// Helper functions
export function getPerfumeById(id: string): Perfume | undefined {
  return perfumes.find(p => p.id === id)
}

export function getPerfumesByStatus(status: 'safe' | 'warning' | 'danger'): Perfume[] {
  return perfumes.filter(p => p.status === status)
}

export function getFeaturedPerfumes(limit: number = 3): Perfume[] {
  return perfumes
    .filter(p => p.score && p.score >= 85)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, limit)
}

export function getFavoritesPerfumes(): Perfume[] {
  return perfumes.filter(p => 
    ['1', '2', '3', '4', '5'].includes(p.id)
  )
}

export function getDislikedPerfumes(): Perfume[] {
  return perfumes.filter(p => 
    ['6', '7'].includes(p.id)
  )
}

export function getWishlistPerfumes(): Perfume[] {
  return perfumes.filter(p => 
    ['8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'].includes(p.id)
  )
}

// Radar chart data
export const defaultRadarData: RadarDataPoint[] = [
  { label: 'خشبي', value: 85 },
  { label: 'شرقي', value: 75 },
  { label: 'زهري', value: 30 },
  { label: 'حمضيات', value: 45 },
  { label: 'حار', value: 60 },
  { label: 'سويتي', value: 70 }
]

// User stats
export const defaultUserStats: UserStats = {
  totalMatches: 23,
  savedPerfumes: 12,
  searches: 45,
  samples: 3
}

// Calculate status from score
export function calculateStatus(score: number): 'safe' | 'warning' | 'danger' {
  if (score >= 90) return 'safe'
  if (score >= 80) return 'warning'
  return 'danger'
}

// Normalize perfume data (ensure score and matchPercentage are synced)
export function normalizePerfume(perfume: Perfume): Perfume {
  const score = perfume.score ?? perfume.matchPercentage ?? 0
  const matchPercentage = perfume.matchPercentage ?? perfume.score ?? 0
  
  return {
    ...perfume,
    score,
    matchPercentage,
    status: perfume.status ?? calculateStatus(score),
    isSafe: perfume.isSafe ?? score >= 80,
    stages: perfume.stages ?? getDefaultStages({ 
      ...perfume, 
      score, 
      status: perfume.status ?? calculateStatus(score) 
    })
  }
}

/**
 * إنشاء stages افتراضية للعطر بناءً على البيانات المتاحة
 */
export function getDefaultStages(perfume: Perfume): TimelineStage[] {
  const baseScore = perfume.score ?? 85
  const baseStatus = perfume.status ?? 'safe'
  
  // استخدام ingredients إذا موجودة، وإلا استخدم قيم افتراضية
  const ingredients = perfume.ingredients || []
  const topNotes = ingredients.slice(0, 3).join(' • ') || 'برغموت • فلفل • ليمون'
  const middleNotes = ingredients.slice(3, 6).join(' • ') || 'لافندر • باتشولي • جيرانيوم'
  const baseNotes = ingredients.slice(6, 9).join(' • ') || 'أمبروكسان • أرز • فيتيفر'
  
  return [
    {
      score: baseScore,
      status: baseStatus,
      stageName: 'الافتتاحية',
      notes: topNotes
    },
    {
      score: Math.max(0, baseScore - 5),
      status: baseStatus,
      stageName: 'القلب',
      notes: middleNotes
    },
    {
      score: Math.min(100, baseScore + 5),
      status: baseStatus,
      stageName: 'القاعدة',
      notes: baseNotes
    }
  ]
}

