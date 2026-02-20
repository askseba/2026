import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/health/perfume-data
 * Health check endpoint for perfume data sources
 * Returns Fragella cache stats and fallback status
 */
export async function GET() {
  try {
    // Count Fragella cache entries
    const fragellaCacheCount = await prisma.fragellaCache.count()

    // Count Fragella perfumes in database
    const fragellaPerfumeCount = await prisma.fragellaPerfume.count()

    // Count local perfumes in DB (perfumes.ts has 19 hardcoded)
    const localPerfumeCount = await prisma.perfume.count()

    // Detect fallback state (no Fragella cache = likely using 19 local perfumes)
    const isUsingFallback = fragellaCacheCount === 0
    const status = isUsingFallback ? 'degraded' : 'healthy'

    // Determine source status
    const hasFragellaData = fragellaCacheCount > 0 || fragellaPerfumeCount > 0
    const source = hasFragellaData ? 'fragella+ifra' : 'fallback'

    // Recommendation based on data availability
    let recommendation = 'ENRICH_NEEDED'
    if (fragellaCacheCount > 100 || fragellaPerfumeCount > 100) {
      recommendation = 'PRODUCTION'
    } else if (fragellaCacheCount > 0 || fragellaPerfumeCount > 0) {
      recommendation = 'PARTIAL'
    } else {
      recommendation = 'Clear FragellaCache and verify FRAGELLA_API_KEY'
    }

    return NextResponse.json({
      status,
      source,
      fragellaCache: {
        count: fragellaCacheCount,
        warning: fragellaCacheCount === 0 ? 'No cached Fragella data - may be using fallback' : null
      },
      fragellaPerfumeCount,
      localPerfumes: {
        count: localPerfumeCount,
        warning: localPerfumeCount === 19 ? 'Exactly 19 perfumes - fallback file detected' : null
      },
      localPerfumeCount,
      recommendation,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[health/perfume-data] Error:', error)
    return NextResponse.json(
      {
        status: 'error',
        error: 'Failed to fetch perfume data health',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
