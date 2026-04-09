import { normalizeFamily } from '@/lib/utils/family'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import type { PerfumeForMatching, ScoredPerfume } from '@/lib/matching'
import { calculateMatchScores, buildUserScentDNA } from '@/lib/matching'
import { getResultsLimit, getBlurredCount, getUserTierInfo, checkTestLimit, incrementTestCount } from '@/lib/gating'
import type { SubscriptionTier } from '@prisma/client'
import { searchUnified, enrichWithIFRA, convertFragellaToUnified } from '@/lib/services/perfume-bridge.service'
import { getPerfume } from '@/lib/services/perfume.service'
import { ifraService } from '@/lib/services/ifra.service'
import { getIngredientsForNote } from '@/data/note-to-ingredient-map'
import { prisma } from '@/lib/prisma'

// ── TestHistory write helper (non-critical: never throws) ──
async function saveTestHistory(params: {
  userId: string
  likedPerfumes: string[]
  dislikedPerfumes: string[]
  allergySymptoms: string[]
  allergyFamilies: string[]
  totalMatches: number
  topMatchId: string | null
  topMatchScore: number | null
  scentDNA: Record<string, number> | null
}): Promise<void> {
  try {
    await prisma.testHistory.create({
      data: {
        userId: params.userId,
        likedPerfumes: JSON.stringify(params.likedPerfumes),
        dislikedPerfumes: JSON.stringify(params.dislikedPerfumes),
        allergySymptoms: JSON.stringify(params.allergySymptoms),
        allergyFamilies: JSON.stringify(params.allergyFamilies),
        totalMatches: params.totalMatches,
        topMatchId: params.topMatchId,
        topMatchScore: params.topMatchScore,
        scentDNA: params.scentDNA ? JSON.stringify(params.scentDNA) : null,
      }
    })
    console.log('[match] TestHistory saved for user:', params.userId)
  } catch (err) {
    console.warn('[match] Failed to save TestHistory (non-critical):', err)
  }
}

const PRIORITY_BRANDS: string[] = [
  'Acqua di Parma','Alexandre J','Amouage','Amouroud','Arabian Oud',
  'Armani Beauty','Atelier Cologne','Attar Collection','Azzaro','Balmain',
  'BDK Parfums','Bond No. 9','Burberry','Bvlgari','Byredo',
  'Calvin Klein','Carner Barcelona','Carolina Herrera','Cartier','Chanel',
  'Chloé','Clive Christian','Coach','Coty','Creed',
  'Davidoff','Dior','Diptyque','Dolce & Gabbana','Elie Saab',
  'Essential Parfums','Estée Lauder','Ex Nihilo','Floris London','Frederic Malle',
  'Givenchy','Goldfield & Banks','Goutal Paris','Gucci','Guerlain',
  'Hermès','Hugo Boss','Initio Parfums Privés','Issey Miyake','Jean Paul Gaultier',
  'Jimmy Choo','Juliette Has a Gun','Kaj al Khalifa','Kenzo',"L'Artisan Parfumeur",
  'Lancôme','Le Labo','Loewe','Louis Vuitton','Lubin',
  'Maison Crivelli','Maison Francis Kurkdjian','Maison Margiela','Mancera','Memo Paris',
  'Molinard','Montale','Montblanc','Narciso Rodriguez','Nina Ricci',
  'Nishane','Ojar','Ormonde Jayne','Paco Rabanne','Parfums de Marly',
  'Parfums Nicolai',"Penhaligon's",'Perris Monte Carlo','Pierre Guillaume','Prada',
  'Profumum Roma','Ralph Lauren','Ramon Monegal','Roberto Cavalli','Roja Parfums',
  'Salvatore Ferragamo','Santa Maria Novella','Serge Lutens','Sospiro','Thameen London',
  'The House of Oud','Thierry Mugler','Thomas Kosmala','Tiziana Terenzi','Tom Ford',
  'Valentino','Versace','Viktor & Rolf','Widian','Xerjoff','Yves Saint Laurent'
]
const PRIORITY_BRANDS_LOWER = new Set(PRIORITY_BRANDS.map(b => b.toLowerCase().trim()))
function isPriorityBrand(brand: string): boolean {
  if (!brand) return false
  return PRIORITY_BRANDS_LOWER.has(brand.toLowerCase().trim())
}

// ═══════════════════════════════════════
// SIMILAR API HELPERS (Phase 1 — v3.2.1)
// ═══════════════════════════════════════

interface SimilarResult {
  Name: string
  Brand: string
  Year?: string
  rating?: string
  Country?: string
  'Image URL'?: string
  Gender?: string
  Price?: string
  OilType?: string
  Longevity?: string
  Sillage?: string
  Confidence?: string
  Popularity?: string
  'Price Value'?: string
  'General Notes'?: string[]
  'Main Accords'?: string[]
  'Main Accords Percentage'?: Record<string, string>
  Notes?: {
    Top?: Array<{name: string; imageUrl?: string}>
    Middle?: Array<{name: string; imageUrl?: string}>
    Base?: Array<{name: string; imageUrl?: string}>
  }
  'Season Ranking'?: Array<{name: string; score: number}>
  'Occasion Ranking'?: Array<{name: string; score: number}>
  'Purchase URL'?: string
  'Image Fallbacks'?: string[]
  SimilarityScore: number
}

interface SimilarApiResponse {
  similar_to: string
  similar_fragrances: SimilarResult[]
}

async function fetchSimilarPerfumes(
  perfumeName: string, apiKey: string, limit: number = 10
): Promise<SimilarResult[]> {
  try {
    const url = `https://api.fragella.com/api/v1/fragrances/similar?name=${encodeURIComponent(perfumeName)}&limit=${limit}`
    const response = await fetch(url, {
      headers: { 'x-api-key': apiKey },
      signal: AbortSignal.timeout(10000)
    })
    if (!response.ok) {
      console.warn(`[similar] API ${response.status} for "${perfumeName}"`)
      return []
    }
    const data = await response.json() as SimilarApiResponse
    return data.similar_fragrances ?? []
  } catch (error) {
    console.warn(`[similar] Failed for "${perfumeName}":`, error)
    return []
  }
}

function mapNotesToScentPyramid(notes: SimilarResult['Notes']): any[] | undefined {
  if (!notes) return undefined
  const top = notes.Top?.map(n => n.name) ?? []
  const middle = notes.Middle?.map(n => n.name) ?? []
  const base = notes.Base?.map(n => n.name) ?? []
  if (!top.length && !middle.length && !base.length) return undefined
  return [
    { stage: 'top', stageAr: 'المقدمة', notes: top, duration: '15-30 دقيقة', color: '#FFE5B4' },
    { stage: 'heart', stageAr: 'القلب', notes: middle, duration: '2-4 ساعات', color: '#FFC0CB' },
    { stage: 'base', stageAr: 'القاعدة', notes: base, duration: '4-8 ساعات', color: '#DEB887' }
  ]
}

// TODO: Update return type from `any` after purchaseUrl type migration is fully verified
function convertSimilarToScoredPerfume(
  item: SimilarResult, similarityScore: number, sourceLikedPerfume: string
): any {
  const name = item.Name ?? 'Unknown'
  const brand = item.Brand ?? 'Unknown'
  const slug = `${brand}-${name}`.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
  const allNotes: string[] = [
    ...(item['General Notes'] ?? []),
    ...(item.Notes?.Top?.map(n => n.name) ?? []),
    ...(item.Notes?.Middle?.map(n => n.name) ?? []),
    ...(item.Notes?.Base?.map(n => n.name) ?? [])
  ]
  const scentPyramid = mapNotesToScentPyramid(item.Notes)
  return {
    id: `fragella-${slug}`, name, brand,
    image: item['Image URL'] ?? '/placeholder-perfume.svg',
    description: null,
    price: item.Price ? parseFloat(item.Price) : null,
    families: [...new Set(item['Main Accords'] ?? [])],
    ingredients: allNotes,
    symptomTriggers: [], isSafe: true, status: 'safe',
    variant: item.OilType ?? null,
    scentPyramid, stages: scentPyramid,
    similarityScore, sourceLikedPerfume,
    source: 'fragella' as const, fragellaId: slug,
    popularity: item.Popularity ?? 'Unknown',
    confidence: item.Confidence ?? 'Unknown',
    priceValue: item['Price Value'] ?? 'unknown',
    purchaseUrl: item['Purchase URL'] ?? null,
    accordsPercentage: item['Main Accords Percentage'] ?? {},
    generalNotes: item['General Notes'] ?? [],
    notesPyramid: item.Notes ?? null,
    seasonRanking: item['Season Ranking'] ?? [],
    occasionRanking: item['Occasion Ranking'] ?? [],
    longevity: item.Longevity ?? null,
    sillage: item.Sillage ?? null,
    gender: item.Gender ?? null,
    rating: item.rating ? parseFloat(item.rating) : null,
    year: item.Year ?? null, country: item.Country ?? null,
    imageFallbacks: item['Image Fallbacks'] ?? [],
    tasteScore: 0, safetyScore: 100, finalScore: 0,
    isExcluded: false, exclusionReason: null,
    ifraScore: undefined, ifraWarnings: []
  }
}

const TOP_SEARCH_BRANDS = [
  'Chanel','Dior','Tom Ford','Creed','Amouage'
]
const BRAND_BATCH_SIZE = 5
const BRAND_BATCH_LIMIT = 100

type Tier = 'GUEST' | SubscriptionTier

interface MatchRequestBody {
  preferences: {
    likedPerfumeIds: string[]
    dislikedPerfumeIds: string[]
    allergyProfile: {
      symptoms?: string[]
      families?: string[]
      ingredients?: string[]
    }
  }
  /** Optional: search term for Fragella pool (e.g. "chanel"); empty = use "perfume"/"popular" */
  seedSearchQuery?: string
}

function toPerfumeForMatching(p: {
  id: string
  name: string
  brand: string
  image: string
  description?: string
  price?: number
  families?: string[]
  ingredients?: string[]
  symptomTriggers?: string[]
  isSafe?: boolean
  status?: string
  variant?: string
}): PerfumeForMatching {
  const families = p.families ?? []
  const ingredients = p.ingredients ?? []
  const symptomTriggers = p.symptomTriggers ?? []
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    image: p.image,
    description: p.description ?? null,
    price: p.price ?? null,
    families,
    ingredients,
    symptomTriggers,
    isSafe: p.isSafe ?? true,
    status: p.status ?? 'safe',
    variant: p.variant ?? null,
    scentPyramid: null
  }
}

/** POST /api/match - Score perfumes by quiz preferences and return gated results */
export async function POST(request: Request) {
  try {
    const __diagReqId = `match-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
    const body = (await request.json()) as MatchRequestBody
    const prefs = body?.preferences
    if (!prefs) {
      return NextResponse.json(
        { success: false, error: 'Missing preferences' },
        { status: 400 }
      )
    }

    const allergyProfile = {
      symptoms: prefs.allergyProfile?.symptoms ?? [],
      families: prefs.allergyProfile?.families ?? [],
      ingredients: prefs.allergyProfile?.ingredients ?? []
    }

    // Expand note-level ingredient names to chemical names
    // e.g. 'vanilla' → ['Vanillin', 'Ethyl Vanillin', 'Piperonal']
    const expandedIngredients: string[] = []
    for (const ing of allergyProfile.ingredients) {
      const chemicals = getIngredientsForNote(ing)
      if (chemicals.length > 0) {
        expandedIngredients.push(...chemicals)
      } else {
        // Keep original name as fallback (might be a chemical name already)
        expandedIngredients.push(ing)
      }
    }
    allergyProfile.ingredients = [...new Set(expandedIngredients)]
    console.log(
      `[match] Expanded allergy ingredients: ${allergyProfile.ingredients.length} chemicals from ${
        prefs.allergyProfile?.ingredients?.length ?? 0
      } notes`
    )

    // Resolve session and tier early to enforce FREE monthly test limit before heavy work
    const session = await auth()
    let tier: Tier = 'GUEST'
    if (session?.user?.id) {
      try {
        const tierInfo = await getUserTierInfo(session.user.id)
        tier = tierInfo.tier
      } catch {
        tier = 'FREE'
      }
    }

    // Enforce FREE monthly test limit (2 tests/month)
    if (tier === 'FREE' && session?.user?.id) {
      const limitResult = await checkTestLimit(session.user.id)
      if (!limitResult.canAccess) {
        return NextResponse.json(
          {
            success: false,
            error: 'monthly_limit_reached',
            message: limitResult.upgradeMessage ?? 'استنفذت الاختبارات الشهرية المجانية. اشترك للحصول على اختبارات غير محدودة بـ 15 ريال/شهر.'
          },
          { status: 403 }
        )
      }
    }

    // ═══ NEW: /similar-based matching (v3.2.1) ═══
    // Enable after: 1) valid API key 2) DIAG-0.1 confirmed 3) DIAG-0.2 confirmed
    const USE_SIMILAR_PATH = true

    if (USE_SIMILAR_PATH && process.env.FRAGELLA_API_KEY) {
      const similarApiKey = process.env.FRAGELLA_API_KEY
      console.log('[similar] Starting')

      const likedNames: Array<{id: string; name: string}> = []
      for (const id of (prefs.likedPerfumeIds ?? [])) {
        try {
          if (id.startsWith('fragella-')) {
            const searchTerm = id.replace('fragella-', '').replace(/-/g, ' ')
            const results = await searchUnified(searchTerm, {
              includeFragella: true, includeLocal: false, limit: 3
            })
            const found = results.find((p: any) => p.id === id) ?? results[0]
            if (found?.name) likedNames.push({ id, name: found.name })
          } else {
            const { perfumes: localData } = await import('@/lib/data/perfumes')
            const local = (localData as any[]).find(p => p.id === id)
            if (local?.name) likedNames.push({ id, name: local.name })
          }
        } catch { console.warn(`[similar] Name resolve failed: ${id}`) }
      }
      console.log('[similar] Names:', likedNames.map(l => l.name))

      if (likedNames.length > 0) {
        const allCandidates: any[] = []
        for (const liked of likedNames) {
          const results = await fetchSimilarPerfumes(liked.name, similarApiKey, 10)
          console.log(`[similar] "${liked.name}" → ${results.length} results`)
          for (const item of results) {
            allCandidates.push(
              convertSimilarToScoredPerfume(item, item.SimilarityScore, liked.name)
            )
          }
        }

        const seen = new Map<string, any>()
        for (const p of allCandidates) {
          const key = `${p.name.toLowerCase()}|${p.brand.toLowerCase()}`
          const existing = seen.get(key)
          if (!existing || p.similarityScore > existing.similarityScore) seen.set(key, p)
        }
        const candidates = Array.from(seen.values())
        console.log(`[similar] Deduped: ${candidates.length}`)

        const dislikedFamilies = new Set<string>()
        for (const disId of (prefs.dislikedPerfumeIds ?? []).slice(0, 2)) {
          try {
            const term = disId.replace('fragella-', '').replace(/-/g, ' ')
            const res = await searchUnified(term, { includeFragella: true, includeLocal: false, limit: 1 })
            ;(res[0]?.families ?? []).forEach((f: string) => dislikedFamilies.add(f.toLowerCase()))
          } catch {}
        }

        const likedNotes = new Set<string>()
        for (const c of allCandidates) {
          ;(c.generalNotes ?? []).forEach((n: string) => likedNotes.add(n.toLowerCase()))
        }

        const POP: Record<string, number> = {
          'Very high': 0.4, 'High': 0.2, 'Medium': 0,
          'Low': -0.2, 'Not popular': -0.4, 'Unknown': 0
        }
        const CONF: Record<string, number> = {
          'high': 0, 'medium': -0.1, 'low': -0.3, 'Unknown': -0.1
        }

        for (const p of candidates) {
          let s = p.similarityScore
          s += POP[p.popularity] ?? 0
          s += CONF[p.confidence] ?? 0
          if (isPriorityBrand(p.brand)) s += 0.2
          s -= (p.families ?? []).filter((f: string) => dislikedFamilies.has(f.toLowerCase())).length * 0.15
          s += Math.min((p.ingredients ?? []).filter((n: string) => likedNotes.has(n.toLowerCase())).length * 0.05, 0.3)
          p._rawScore = s
        }
        candidates.sort((a: any, b: any) => b._rawScore - a._rawScore)

        const userSymptoms = allergyProfile.symptoms ?? []
        for (const p of candidates) {
          try {
            const r = await ifraService.checkSafety(p.ingredients ?? [], userSymptoms)
            const SEV: Record<string, number> = { safe: 100, caution: 75, warning: 50, danger: 25 }
            p.ifraScore = Math.max(0, (SEV[r.severity] ?? 100) - Math.min(r.warnings.length * 5, 20))
            p.isSafe = r.isSafe
            p.ifraWarnings = r.warnings.map((w: any) => `${w.material}: ${w.symptom}`)
            p.safetyScore = p.ifraScore
          } catch {
            p.ifraScore = 50; p.isSafe = false; p.safetyScore = 50
          }
        }

        const maxR = candidates[0]?._rawScore ?? 1
        const minR = candidates[candidates.length - 1]?._rawScore ?? 0
        const rng = maxR - minR || 1
        for (const p of candidates) {
          p.tasteScore = Math.round(65 + ((p._rawScore - minR) / rng) * 33)
          p.finalScore = Math.round(p.tasteScore * 0.8 + p.safetyScore * 0.2)
        }
        candidates.sort((a: any, b: any) => b.finalScore - a.finalScore)

        const limit = getResultsLimit(tier)
        const blurredCount = getBlurredCount(tier)
        const visible = candidates.slice(0, limit)
        const blurred = candidates.slice(limit, limit + blurredCount).map((p: any) => ({
          id: p.id, matchScore: p.finalScore, familyHint: p.families?.[0] ?? 'عطر'
        }))

        console.log('[similar] Done:', {
          total: candidates.length, visible: visible.length,
          blurred: blurred.length, topScore: visible[0]?.finalScore,
          topName: visible[0]?.name, topBrand: visible[0]?.brand
        })

        if (tier === 'FREE' && session?.user?.id) await incrementTestCount(session.user.id)

        // V1: save TestHistory for authenticated users (fire-and-forget, non-critical)
        if (session?.user?.id) {
          void saveTestHistory({
            userId: session.user.id,
            likedPerfumes: prefs.likedPerfumeIds ?? [],
            dislikedPerfumes: prefs.dislikedPerfumeIds ?? [],
            allergySymptoms: allergyProfile.symptoms,
            allergyFamilies: allergyProfile.families,
            totalMatches: visible.length,
            topMatchId: visible[0]?.id ?? null,
            topMatchScore: visible[0]?.finalScore ?? null,
            scentDNA: null, // similar path: no DNA computed in V1
          })
        }

        return NextResponse.json({
          success: true,
          perfumes: visible.map((p: any) => ({
            ...p, source: 'fragella', ifraScore: p.ifraScore,
            symptomTriggers: p.symptomTriggers ?? [],
            ifraWarnings: p.ifraWarnings ?? [], fragellaId: p.fragellaId
          })),
          blurredItems: blurred, tier
        })
      }
      console.warn('[similar] No names resolved → fallback')
    }
    // ═══ OLD PATH (fallback — runs when USE_SIMILAR_PATH=false) ═══

    // --- Step A: Extract liked perfume info from the pool they came from ---
    const likedIds = prefs.likedPerfumeIds ?? []

    // ── Resolve liked perfumes: search-first, getPerfume as fallback ──
    const likedPerfumesData: any[] = []
    for (const id of likedIds) {
      try {
        if (id.startsWith('fragella-')) {
          const fragellaId = id.replace('fragella-', '')
          let found: any = null

          // Strategy 1: Search by name derived from slug
          // "creed-aventus" → search "creed aventus"
          const searchTerm = fragellaId.replace(/-/g, ' ')
          try {
            const searchResults = await searchUnified(searchTerm, {
              includeFragella: true,
              includeLocal: false,
              limit: 5
            })
            // Exact ID match
            found = searchResults.find((p: any) => p.id === id)
            // Fuzzy: first 3 slug segments
            if (!found) {
              const likedSlug = id.split('-').slice(0, 3).join('-')
              found = searchResults.find((p: any) => {
                if (!p.id) return false
                const pSlug = p.id.split('-').slice(0, 3).join('-')
                return pSlug.length > 4 && pSlug === likedSlug
              })
            }
            if (found) {
              console.log(`[match] Liked resolved via SEARCH: ${id} → families: ${found.families?.length ?? 0}`)
            }
          } catch (searchErr) {
            console.warn(`[match] Search for liked perfume failed: ${searchTerm}`, searchErr)
          }

          // Strategy 2: Fallback to getPerfume (works if API has real IDs)
          if (!found) {
            try {
              const raw = await getPerfume(fragellaId)
              const converted = convertFragellaToUnified(raw, fragellaId)
              if (converted) {
                found = converted
                console.log(`[match] Liked resolved via API: ${id} → families: ${converted.families?.length ?? 0}`)
              }
            } catch {
              console.warn(`[match] getPerfume fallback failed for ${id}`)
            }
          }

          if (found) {
            likedPerfumesData.push(found)
          } else {
          }
        } else {
          // local perfume ID (numeric string like '1', '2')
          const { perfumes: localData } = await import('@/lib/data/perfumes')
          const local = (localData as any[]).find(p => p.id === id)
          if (local) {
            likedPerfumesData.push({
              ...local,
              source: 'local' as const,
              isSafe: true
            })
          } else {
          }
        }
      } catch (e) {
        console.warn(`[match] Failed to resolve liked perfume ${id}:`, e)
      }
    }
    const likedPerfumesFamilies: string[] = []
    const likedBrands: string[] = []

    // Add families from resolved liked perfumes DIRECTLY
    // (don't wait for pool matching which may fail on ID mismatch)
    for (const p of likedPerfumesData) {
      if (Array.isArray(p.families) && p.families.length > 0) {
        likedPerfumesFamilies.push(...p.families)
        console.log('[DNA-DIRECT]', { id: p.id, families: p.families })
      }
      if (p.brand && p.brand !== 'Unknown') {
        likedBrands.push(p.brand)
      }
    }

    // --- Step B: Build pool using multiple small targeted searches ---
    const apiKey = process.env.FRAGELLA_API_KEY ?? ''
    let basePerfumes: any[] = []
    let userScentDNA: Set<string> = new Set()
    const poolQuery = (body.seedSearchQuery ?? '').trim()

    if (apiKey) {
      try {
        // 1. General search first
        const general = await searchUnified(poolQuery || 'perfume', {
          includeFragella: true,
          includeLocal: false,
          limit: 100
        })
        basePerfumes.push(...general)

        // Find liked perfumes in general results (offline-first resolution)
        for (const id of likedIds) {
          const likedSlug = id.replace('fragella-', '').split('-').slice(0, 3).join('-')
          const found = general.find((p: any) => {
            if (!p.id) return false
            if (p.id === id) return true
            const pSlug = p.id.split('-').slice(0, 3).join('-')
            return likedSlug.length > 4 && pSlug === likedSlug
          })
          if (found) {
            if (found.families?.length) {
              const newFams = (found.families as string[])
                .map(normalizeFamily)
                .filter((f: string) => !likedPerfumesFamilies.includes(f))
              likedPerfumesFamilies.push(...newFams)
            }
            if (found.brand && found.brand !== 'Unknown') likedBrands.push(found.brand)
            if (!likedPerfumesData.some((p: any) => p.id === found.id)) {
              likedPerfumesData.push(found)
              console.log(`[match] Liked resolved via POOL: ${id} → families: ${found.families?.length ?? 0}`)
            }
          }
        }

        // 2. Search by liked brands
        const uniqueBrands = [...new Set(likedBrands)].slice(0, 5)
        for (const brand of uniqueBrands) {
          try {
            const r = await searchUnified(brand, { includeFragella: true, includeLocal: false, limit: 100 })
            basePerfumes.push(...r)
          } catch {
            /* skip */
          }
        }

        // 3. Search by common categories for diversity
        const categoryQueries = ['woody', 'floral', 'citrus', 'oriental']
        for (const q of categoryQueries) {
          try {
            const r = await searchUnified(q, { includeFragella: true, includeLocal: false, limit: 50 })
            basePerfumes.push(...r)
          } catch {
            /* skip */
          }
        }

        // 4b. Priority brand targeted searches (batched to reduce API calls)
        const brandsToSearch = TOP_SEARCH_BRANDS.filter(b => !uniqueBrands.includes(b))
        for (let i = 0; i < brandsToSearch.length; i += BRAND_BATCH_SIZE) {
          const batch = brandsToSearch.slice(i, i + BRAND_BATCH_SIZE)
          for (const brand of batch) {
            try {
              const r = await searchUnified(brand, {
                includeFragella: true,
                includeLocal: false,
                limit: Math.floor(BRAND_BATCH_LIMIT / batch.length)
              })
              basePerfumes.push(...r)
            } catch {
              /* skip individual brand failure */
            }
          }
        }

        console.log('[PRIORITY] Brand search phase:', {
          brandsSearched: brandsToSearch.length,
          skippedAlreadyLiked: TOP_SEARCH_BRANDS.length - brandsToSearch.length,
          totalPoolAfterPriority: basePerfumes.length
        })

        // 4. Deduplicate by id
        const seen = new Set<string>()
        const deduped: any[] = []
        for (const p of basePerfumes) {
          if (p?.id && !seen.has(p.id)) {
            seen.add(p.id)
            deduped.push(p)
          }
        }
        basePerfumes = deduped

        // 5. Find any remaining liked perfumes in the full pool
        for (const id of likedIds) {
          const found = basePerfumes.find((p: any) => p.id === id)
          if (found?.families?.length) {
            const newFams = (found.families as string[])
              .map(normalizeFamily)
              .filter((f: string) => !likedPerfumesFamilies.includes(f))
            likedPerfumesFamilies.push(...newFams)
          }
        }

        // ── Build DNA by matching liked IDs against pool ──
        for (const likedId of likedIds) {
          const match = basePerfumes.find((p: any) => {
            if (!p.id || !likedId) return false
            if (p.id === likedId) return true

            // fuzzy fallback: first 3 slug segments must match
            const pSlug = p.id.split('-').slice(0, 3).join('-')
            const lSlug = likedId.split('-').slice(0, 3).join('-')
            return pSlug.length > 4 && pSlug === lSlug
          })

          if (match?.families?.length) {
            const newFams = (match.families as string[])
              .map(normalizeFamily)
              .filter((f: string) => !likedPerfumesFamilies.includes(f))

            likedPerfumesFamilies.push(...newFams)
          }
        }

        // Final normalization + dedup before DNA building
        const dedupedFamilies = [...new Set(likedPerfumesFamilies.map(normalizeFamily))]
        userScentDNA = buildUserScentDNA(dedupedFamilies)
        console.log('[DNA-FIX]', {
          rawCount: likedPerfumesFamilies.length,
          dedupedCount: dedupedFamilies.length,
          removed: likedPerfumesFamilies.length - dedupedFamilies.length,
          families: dedupedFamilies
        })

        basePerfumes = basePerfumes.map((p: any) => ({
          ...p,
          families: (p.families ?? []).map(normalizeFamily)
        }))

        // ── Add directly-fetched liked perfumes to pool ──
        const poolIds = new Set(basePerfumes.map((p: any) => p.id))
        for (const p of likedPerfumesData) {
          if (!poolIds.has(p.id)) {
            basePerfumes.push(p)
            poolIds.add(p.id)
          }
        }

        console.log(
          `[match] Smart pool: ${basePerfumes.length} perfumes, brands: ${JSON.stringify(uniqueBrands)}, liked families: ${likedPerfumesFamilies.length}`
        )
      } catch (e) {
        console.warn('[match] Pool building failed:', e)
      }
    }

    if (basePerfumes.length === 0) {
      const { perfumes: fallbackPerfumes } = await import('@/lib/data/perfumes')
      basePerfumes = (fallbackPerfumes as any[]).map((p: any) => ({ ...p, source: 'local' }))
      console.log(`[match] Fallback to local: ${basePerfumes.length}`)
    }

    // --- IFRA Enrichment (unchanged) ---
    const userSymptoms = prefs.allergyProfile?.symptoms ?? []
    const enrichedPerfumes = await Promise.all(
      basePerfumes.slice(0, 2000).map(async (perfume: any) => {
        try {
          const enriched = await enrichWithIFRA(perfume, userSymptoms)
          return {
            ...toPerfumeForMatching(enriched),
            ifraScore: enriched.ifraScore,
            symptomTriggers: enriched.symptomTriggers ?? [],
            ifraWarnings: enriched.ifraWarnings ?? [],
            source: enriched.source ?? 'local',
            fragellaId: enriched.fragellaId
          }
        } catch (enrichErr) {
          const fallback = toPerfumeForMatching(perfume)
          return { ...fallback, fragellaId: perfume.fragellaId, source: perfume.source ?? 'local' }
        }
      })
    )

    const allPerfumes = enrichedPerfumes as (PerfumeForMatching & {
      ifraScore?: number
      symptomTriggers?: string[]
      ifraWarnings?: string[]
      source?: string
      fragellaId?: string
    })[]
    console.log(
      '[match] Final pool:',
      allPerfumes.length,
      'sample ifraScore:',
      allPerfumes[0]?.ifraScore
    )
    // --- Real IFRA enrichment: checkSafety for all perfumes (before scoring) ---
    const SEVERITY_TO_SCORE: Record<string, number> = {
      safe: 100,
      caution: 75,
      warning: 50,
      danger: 25
    }
    const WARNING_PENALTY_PER = 5
    const WARNING_PENALTY_CAP = 20

    const ifraResults = await Promise.allSettled(
      allPerfumes.map((p) => ifraService.checkSafety(p.ingredients ?? [], userSymptoms))
    )

    for (let i = 0; i < allPerfumes.length; i++) {
      const p = allPerfumes[i]
      const settled = ifraResults[i]
      if (settled.status === 'fulfilled') {
        const r = settled.value
        let base = SEVERITY_TO_SCORE[r.severity] ?? 100
        const penalty = Math.min(r.warnings.length * WARNING_PENALTY_PER, WARNING_PENALTY_CAP)
        const ifraScore = Math.max(0, base - penalty)
        p.ifraScore = ifraScore
        p.isSafe = r.isSafe
        p.ifraWarnings = r.warnings.map((w) => `${w.material}: ${w.symptom}`)
      }
      // on rejection, leave existing ifraScore/isSafe/ifraWarnings from enrichWithIFRA
    }

    const ifraSample = allPerfumes.slice(0, 5).map((p) => ({
      id: p.id,
      name: p.name,
      ifraScore: p.ifraScore,
      isSafe: p.isSafe,
      warningCount: p.ifraWarnings?.length ?? 0
    }))
    console.log('[match] IFRA sample:', JSON.stringify(ifraSample))

    // --- Build user preference ---
    const userPreference = {
      likedPerfumesFamilies,
      dislikedPerfumeIds: prefs.dislikedPerfumeIds ?? [],
      allergyProfile
    }

    const scored: ScoredPerfume[] = calculateMatchScores(allPerfumes, userPreference)
    const allScores = scored.map((p: any) => p.finalScore).sort((a, b) => b - a)
    console.log('[match] score distribution:', {
      top5: allScores.slice(0, 5),
      bottom5: allScores.slice(-5),
      total: allScores.length
    })

    const limit = getResultsLimit(tier)
    const blurredCount = getBlurredCount(tier)

    // Priority brand preference: fill visible with priority brands first, then others
    // Both lists maintain score ordering
    const preferredScored = scored.filter(p => isPriorityBrand(p.brand))
    const otherScored = scored.filter(p => !isPriorityBrand(p.brand))

    const preferredSlice = preferredScored.slice(0, limit)
    const otherSlice = otherScored.slice(0, Math.max(0, limit - preferredSlice.length))
    const visible = [...preferredSlice, ...otherSlice]
      .slice(0, limit)
      .sort((a, b) => b.finalScore - a.finalScore)  // Re-sort by score

    // Blurred items from remaining scored perfumes not in visible
    const visibleIds = new Set(visible.map(p => p.id))
    const remaining = scored.filter(p => !visibleIds.has(p.id))
    const blurred = remaining.slice(0, blurredCount).map((p) => ({
      id: p.id,
      matchScore: p.finalScore,
      familyHint: p.families?.[0] ?? 'عطر'
    }))

    const response = {
      success: true,
      perfumes: visible.map((p: any) => ({
        ...p,
        ifraScore: p.ifraScore,
        symptomTriggers: p.symptomTriggers ?? [],
        ifraWarnings: p.ifraWarnings ?? [],
        source: p.source ?? 'local',
        fragellaId: p.fragellaId
      })),
      blurredItems: blurred,
      tier
    }
    console.log('[match] before send:', {
      visibleCount: visible.length,
      blurredCount: blurred.length,
      tier,
      poolSize: allPerfumes.length
    })
    console.log('[match] response:', {
      success: response.success,
      perfumesCount: response.perfumes.length,
      blurredItemsCount: response.blurredItems.length,
      tier: response.tier
    })

    // Consume one FREE monthly test after successful match
    if (tier === 'FREE' && session?.user?.id) {
      await incrementTestCount(session.user.id)
    }

    // V1: save TestHistory for authenticated users (fire-and-forget, non-critical)
    if (session?.user?.id) {
      const dnaEntries = [...userScentDNA].map(f => [f, 1] as [string, number])
      const scentDNAObj = dnaEntries.length > 0 ? Object.fromEntries(dnaEntries) : null
      void saveTestHistory({
        userId: session.user.id,
        likedPerfumes: prefs.likedPerfumeIds ?? [],
        dislikedPerfumes: prefs.dislikedPerfumeIds ?? [],
        allergySymptoms: allergyProfile.symptoms,
        allergyFamilies: allergyProfile.families,
        totalMatches: visible.length,
        topMatchId: visible[0]?.id ?? null,
        topMatchScore: visible[0]?.finalScore ?? null,
        scentDNA: scentDNAObj,
      })
    }

    return NextResponse.json(response)
  } catch (err: any) {
    console.error('Match API FULL ERROR:', {
      message: err?.message,
      name: err?.name,
      stack: err?.stack?.split('\n').slice(0, 5).join('\n')
    })
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
