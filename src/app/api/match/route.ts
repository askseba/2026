import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { validateFragellaOnStartup } from '@/lib/startup-checks'

// Run Fragella validation once when module loads
let fragellaValidated = false
validateFragellaOnStartup().then((valid) => {
  fragellaValidated = valid
})
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

const LOG = '[api/match]'

/** GET /api/match - Not supported; log and return 405 */
export async function GET() {
  try {
    console.log(`${LOG} GET request received (method not supported)`)
    return NextResponse.json(
      { success: false, error: 'Method not allowed. Use POST.' },
      { status: 405 }
    )
  } catch (error) {
    console.error(`${LOG} GET ERROR:`, error)
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

/** POST /api/match - Score perfumes by quiz preferences and return gated results */
export async function POST(request: Request) {
  try {
    console.log(`${LOG} POST request received`)
    const body = (await request.json()) as MatchRequestBody
    console.log(`${LOG} body:`, JSON.stringify({ hasPreferences: !!body?.preferences, seedSearchQuery: body?.seedSearchQuery }))
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
        console.log(`${LOG} Fragella pool: ${basePerfumes.length} عطور`, poolQuery ? `(query: ${poolQuery})` : '')

        // Alert when stuck on fallback (19 local perfumes)
        if (basePerfumes.length === 19) {
          console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
          console.error('⚠️  WARNING: USING 19 LOCAL PERFUMES')
          console.error('⚠️  Fragella connection may be broken!')
          console.error('⚠️  Check FragellaCache table and API key')
          console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        }
      } catch (e) {
        console.warn(`${LOG} Fragella failed:`, e)
      }
    }

    if (basePerfumes.length === 0) {
      const { perfumes: fallbackPerfumes } = await import('@/lib/data/perfumes')
      basePerfumes = (fallbackPerfumes as any[]).map((p) => ({ ...p, source: 'local' }))
      console.log(`${LOG} Fallback to rawPerfumes: ${basePerfumes.length}`)
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
            source: enriched.source ?? 'local',
            fragellaId: enriched.fragellaId
          }
        } catch (enrichErr) {
          console.warn(`IFRA failed for ${perfume.id}:`, enrichErr)
          const fallback = toPerfumeForMatching(perfume)
          return {
            ...fallback,
            fragellaId: perfume.fragellaId,
            source: perfume.source ?? 'local'
          }
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
      `${LOG} Final pool:`,
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
        source: p.source ?? 'local',
        fragellaId: p.fragellaId
      })),
      blurredItems: blurred,
      tier
    }
    console.log(`${LOG} before send:`, {
      visibleCount: visible.length,
      blurredCount: blurred.length,
      tier,
      poolSize: allPerfumes.length
    })
    console.log(`${LOG} response:`, {
      success: response.success,
      perfumesCount: response.perfumes.length,
      blurredItemsCount: response.blurredItems.length,
      tier: response.tier
    })
    return NextResponse.json(response)
  } catch (err) {
    console.error(`${LOG} ERROR:`, err)
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
