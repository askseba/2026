import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildSearchUrl } from '@/lib/buildSearchUrl'
import { STORE_DISPLAY_ORDER } from '@/lib/searchPatterns'

export interface StorePriceResponse {
  id: string
  name: string
  logo: string
  price: number | null
  available: boolean
  url: string
  searchUrl: string
  lastUpdated: string | null
  priceSource: 'db' | 'none'
}

/** GET /api/prices/compare?perfumeId=...&name=...&brand=... */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const perfumeId = searchParams.get('perfumeId') ?? ''
    const name = searchParams.get('name') ?? ''
    const brand = searchParams.get('brand') ?? ''

    if (!perfumeId) {
      return NextResponse.json(
        { error: 'perfumeId is required' },
        { status: 400 }
      )
    }

    let stores: Awaited<ReturnType<typeof prisma.store.findMany>>
    let prices: Awaited<ReturnType<typeof prisma.price.findMany>>
    try {
      ;[stores, prices] = await Promise.all([
        prisma.store.findMany({ where: { isActive: true } }),
        prisma.price.findMany({ where: { perfumeId } }),
      ])
    } catch (dbError) {
      console.error('[prices/compare] DB error:', dbError)
      return NextResponse.json(
        {
          error: 'Failed to fetch prices',
          detail:
            process.env.NODE_ENV === 'development' && dbError instanceof Error
              ? dbError.message
              : undefined,
        },
        { status: 500 }
      )
    }

    const priceByStoreId = new Map(prices.map((p) => [p.storeId, p]))

    const displayOrderIndex = (slug: string): number => {
      const i = STORE_DISPLAY_ORDER.indexOf(slug)
      return i === -1 ? 999 : i
    }

    const items: StorePriceResponse[] = stores.map((store) => {
      const priceRecord = priceByStoreId.get(store.id)
      const hasRealPrice =
        priceRecord != null && priceRecord.price > 0
      const searchUrl = buildSearchUrl(
        store.slug,
        name,
        brand,
        store.affiliateUrl
      )
      const updated = priceRecord?.updatedAt ?? null
      const lastUpdated = updated ? new Date(updated).toISOString() : null

      return {
        id: store.slug,
        name: store.name,
        logo: `/stores/${store.slug}.svg`,
        price: hasRealPrice ? priceRecord!.price : null,
        available: true,
        url: hasRealPrice ? store.affiliateUrl : searchUrl,
        searchUrl,
        lastUpdated,
        priceSource: hasRealPrice ? 'db' : 'none',
      }
    })

    const withPrice = items.filter((s) => s.price !== null)
    const withoutPrice = items.filter((s) => s.price === null)

    withPrice.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
    withoutPrice.sort(
      (a, b) => displayOrderIndex(a.id) - displayOrderIndex(b.id)
    )

    const storesSorted = [...withPrice, ...withoutPrice]

    return NextResponse.json({
      stores: storesSorted,
      totalWithPrice: withPrice.length,
      totalStores: stores.length,
    })
  } catch (error) {
    console.error('[prices/compare] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    )
  }
}
