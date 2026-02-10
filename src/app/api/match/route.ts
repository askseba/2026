import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import type { PerfumeForMatching, ScoredPerfume } from '@/lib/matching'
import { calculateMatchScores } from '@/lib/matching'
import { getResultsLimit, getBlurredCount, getUserTierInfo } from '@/lib/gating'
import type { SubscriptionTier } from '@prisma/client'
import { searchUnified, enrichWithIFRA } from '@/lib/services/perfume-bridge.service'

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

    const apiKey = process.env.FRAGELLA_API_KEY ?? ''
    let basePerfumes: any[] = []
    const poolQuery = (body.seedSearchQuery ?? '').trim()

    if (apiKey) {
      try {
        basePerfumes = await searchUnified(poolQuery || '', {
          includeFragella: true,
          includeLocal: true,
          limit: 2000
        })
        console.log(`[match] Fragella pool: ${basePerfumes.length} عطور`, poolQuery ? `(query: ${poolQuery})` : '')
      } catch (e) {
        console.warn('[match] Fragella failed:', e)
      }
    }

    if (basePerfumes.length === 0) {
      const { perfumes: fallbackPerfumes } = await import('@/lib/data/perfumes')
      basePerfumes = (fallbackPerfumes as any[]).map((p) => ({ ...p, source: 'local' }))
      console.log(`[match] Fallback to rawPerfumes: ${basePerfumes.length}`)
    }

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
            source: enriched.source ?? 'local'
          }
        } catch (enrichErr) {
          console.warn(`IFRA failed for ${perfume.id}:`, enrichErr)
          return toPerfumeForMatching(perfume)
        }
      })
    )

    const allPerfumes = enrichedPerfumes as (PerfumeForMatching & {
      ifraScore?: number
      symptomTriggers?: string[]
      ifraWarnings?: string[]
      source?: string
    })[]
    console.log(
      '[match] Final pool:',
      allPerfumes.length,
      'sample ifraScore:',
      allPerfumes[0]?.ifraScore
    )

    const likedIds = prefs.likedPerfumeIds ?? []
    const likedPerfumesFamilies: string[] = []
    for (const id of likedIds) {
      const p = allPerfumes.find((x) => x.id === id)
      if (p?.families?.length) likedPerfumesFamilies.push(...p.families)
    }

    const userPreference = {
      likedPerfumesFamilies,
      dislikedPerfumeIds: prefs.dislikedPerfumeIds ?? [],
      allergyProfile
    }

    const scored: ScoredPerfume[] = calculateMatchScores(allPerfumes, userPreference)

    let tier: Tier = 'GUEST'
    const session = await auth()
    if (session?.user?.id) {
      try {
        const tierInfo = await getUserTierInfo(session.user.id)
        tier = tierInfo.tier
      } catch {
        tier = 'FREE'
      }
    }
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
        source: p.source ?? 'local'
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
    return NextResponse.json(response)
  } catch (err) {
    console.error('Match API error:', err)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
