export interface StorePriceData {
  id: string
  name: string
  logoUrl?: string
  price: number | null
  currency: string
  url: string
  inStock: boolean
  lastUpdated: string
  affiliateCode?: string
  verified: boolean
}

export interface PriceApiResponse {
  success: boolean
  data: {
    perfumeId: string
    updatedAt: string
    currency: 'SAR' | 'USD' | 'EUR'
    stores: StorePriceData[]
  }
  error?: {
    code: string
    message: string
  }
}

/**
 * Fetches prices for a perfume from GET /api/v1/prices/:perfumeId
 * On fetch error, returns success=false with error code "FETCH_ERROR" and empty stores array.
 */
export async function fetchPrices(
  perfumeId: string
): Promise<PriceApiResponse> {
  try {
    const response = await fetch(`/api/v1/prices/${perfumeId}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch prices'
    return {
      success: false,
      data: {
        perfumeId,
        updatedAt: new Date().toISOString(),
        currency: 'SAR',
        stores: []
      },
      error: {
        code: 'FETCH_ERROR',
        message
      }
    }
  }
}
