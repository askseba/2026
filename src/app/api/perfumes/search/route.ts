import { NextRequest, NextResponse } from 'next/server'
import { searchUnified } from '@/lib/services/perfume-bridge.service'
import logger from '@/lib/logger'

/** GET /api/perfumes/search?q=...&limit=... - Used by Quiz Step 1, Step 2, SearchPerfumeBar */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') ?? searchParams.get('query') ?? ''
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 50)

    if (!q || typeof q !== 'string' || !q.trim()) {
      return NextResponse.json(
        { success: true, data: [], perfumes: [], total: 0 },
        { status: 200 }
      )
    }

    const results = await searchUnified(q.trim(), { limit })
    const data = results.map((p) => ({
      id: p.id,
      _id: p.id,
      name: p.name,
      brand: p.brand,
      image: p.image ?? (p as { imageUrl?: string }).imageUrl ?? '',
      source: p.source ?? 'local',
      fragellaId: (p as { fragellaId?: string }).fragellaId,
    }))

    return NextResponse.json({
      success: true,
      data,
      perfumes: data,
      total: data.length,
    })
  } catch (error) {
    logger.error('Perfume search API error:', error)
    return NextResponse.json(
      { success: false, error: 'Search failed', data: [], perfumes: [] },
      { status: 500 }
    )
  }
}

/** POST /api/perfumes/search - Optional body { query, limit } for compatibility */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const query = (body.query ?? body.q ?? '').toString().trim()
    const limit = Math.min(Number(body.limit) || 20, 50)

    if (!query) {
      return NextResponse.json(
        { success: true, data: [], perfumes: [], total: 0 },
        { status: 200 }
      )
    }

    const results = await searchUnified(query, { limit })
    const data = results.map((p) => ({
      id: p.id,
      _id: p.id,
      name: p.name,
      brand: p.brand,
      image: p.image ?? (p as { imageUrl?: string }).imageUrl ?? '',
      source: p.source ?? 'local',
      fragellaId: (p as { fragellaId?: string }).fragellaId,
    }))

    return NextResponse.json({
      success: true,
      data,
      perfumes: data,
      total: data.length,
    })
  } catch (error) {
    logger.error('Perfume search API error:', error)
    return NextResponse.json(
      { success: false, error: 'Search failed', data: [], perfumes: [] },
      { status: 500 }
    )
  }
}
