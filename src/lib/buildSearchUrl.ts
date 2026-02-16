import { STORE_SEARCH_PATTERNS } from './searchPatterns'

/**
 * Builds a store search URL for a perfume. Uses store-specific patterns when
 * available; otherwise appends q and utm_source=askseba to fallbackUrl.
 */
export function buildSearchUrl(
  storeSlug: string,
  perfumeName: string,
  perfumeBrand: string,
  fallbackUrl: string
): string {
  const query = encodeURIComponent(`${perfumeBrand} ${perfumeName}`.trim())

  const pattern = STORE_SEARCH_PATTERNS[storeSlug]
  if (pattern) {
    return pattern.replace('{query}', query)
  }

  const params = `q=${query}&utm_source=askseba`
  if (!fallbackUrl) {
    return `?${params}`
  }
  const separator = fallbackUrl.includes('?') ? '&' : '?'
  return `${fallbackUrl}${separator}${params}`
}
