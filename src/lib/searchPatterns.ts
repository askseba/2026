/**
 * Store search URL patterns. Use {query} as placeholder; replace with
 * encodeURIComponent(perfumeBrand + ' ' + perfumeName) when building URLs.
 */

export const STORE_SEARCH_PATTERNS: Record<string, string> = {
  niceone: 'https://niceonesa.com/search?type=product&q={query}&utm_source=askseba',
  goldenscent: 'https://www.goldenscent.com/catalogsearch/result/?q={query}&utm_source=askseba',
  faces: 'https://www.faces.sa/search?q={query}&utm_source=askseba',
  'ounass-sa': 'https://saudi.ounass.com/search?q={query}&utm_source=askseba',
  sultan: 'https://sultanperfumes.net/?s={query}&utm_source=askseba',
  lojastore: 'https://lojastoregt.com/?s={query}&utm_source=askseba',
  vanilla: 'https://vanilla.sa/?s={query}&utm_source=askseba',
}

export const STORE_DISPLAY_ORDER: string[] = [
  'goldenscent',
  'niceone',
  'faces',
  'ounass-sa',
  'sultan',
  'vanilla',
  'lojastore',
]
