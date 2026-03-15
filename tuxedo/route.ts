import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import type { PerfumeForMatching, ScoredPerfume } from '@/lib/matching'
import { calculateMatchScores } from '@/lib/matching'
import { getResultsLimit, getBlurredCount, getUserTierInfo, checkTestLimit, incrementTestCount } from '@/lib/gating'
import type { SubscriptionTier } from '@prisma/client'
import { searchUnified, enrichWithIFRA, convertFragellaToUnified } from '@/lib/services/perfume-bridge.service'
import { getPerfume } from '@/lib/services/perfume.service'
import { ifraService } from '@/lib/services/ifra.service'
import { getIngredientsForNote } from '@/data/note-to-ingredient-map'

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

    // --- Step A: Extract liked perfume info from the pool they came from ---
    const likedIds = prefs.likedPerfumeIds ?? []

    // ── Direct fetch liked perfumes by ID ──
    const likedPerfumesData: any[] = []
    for (const id of likedIds) {
      try {
        if (id.startsWith('fragella-')) {
          const fragellaId = id.replace('fragella-', '')
          const raw = await getPerfume(fragellaId)
          const converted = convertFragellaToUnified(raw, fragellaId)
          if (converted) likedPerfumesData.push(converted)
        } else {
          // local perfume ID (numeric string like '1', '2')
          const { perfumes: localData } = await import('@/lib/data/perfumes')
          const local = (localData as any[]).find(p => p.id === id)
          if (local) likedPerfumesData.push({
            ...local,
            source: 'local' as const,
            isSafe: true
          })
        }
      } catch (e) {
        console.warn(`[match] Failed to fetch liked perfume ${id}:`, e)
      }
    }

    const likedPerfumesFamilies: string[] = []
    const likedBrands: string[] = []

    // --- Step B: Build pool using multiple small targeted searches ---
    const apiKey = process.env.FRAGELLA_API_KEY ?? ''
    let basePerfumes: any[] = []
    const poolQuery = (body.seedSearchQuery ?? '').trim()

    if (apiKey) {
      try {
        // 1. General search first
        const general = await searchUnified(poolQuery || 'perfume', {
          includeFragella: true,
          includeLocal: false,
          limit: 300
        })
        basePerfumes.push(...general)

        // Find liked perfumes in general results
        for (const id of likedIds) {
          const found = general.find((p: any) => p.id === id)
          if (found) {
            if (found.families?.length) likedPerfumesFamilies.push(...found.families)
            if (found.brand && found.brand !== 'Unknown') likedBrands.push(found.brand)
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
        const categoryQueries = ['woody', 'floral', 'citrus', 'oud', 'fresh', 'sweet', 'spicy', 'musk']
        for (const q of categoryQueries) {
          try {
            const r = await searchUnified(q, { includeFragella: true, includeLocal: false, limit: 50 })
            basePerfumes.push(...r)
          } catch {
            /* skip */
          }
        }

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
            const newFams = found.families.filter((f: string) => !likedPerfumesFamilies.includes(f))
            likedPerfumesFamilies.push(...newFams)
          }
        }

        // ── Safety normalization pass on pool ──
        // (backup for any families that bypassed perfume-bridge)
        const normalizeFamilyRoute = (f: string): string => {
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
              .map(normalizeFamilyRoute)
              .filter((f: string) => !likedPerfumesFamilies.includes(f))

            likedPerfumesFamilies.push(...newFams)
          }
        }

        console.log('[match] DNA:', {
          likedFetched: likedPerfumesData.length,
          familiesFound: likedPerfumesFamilies.length,
          unique: [...new Set(likedPerfumesFamilies)]
        })

        basePerfumes = basePerfumes.map((p: any) => ({
          ...p,
          families: (p.families ?? []).map(normalizeFamilyRoute)
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

    const visible = scored.slice(0, limit)
    const blurred = scored.slice(limit, limit + blurredCount).map((p) => ({
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

    return NextResponse.json(response)
  } catch (err) {
    console.error('Match API error:', err)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
