/**
 * Startup validation for Fragella API connection
 * Logs warnings when Fragella is unavailable (app will use local fallback)
 */
export async function validateFragellaOnStartup(): Promise<boolean> {
  const apiKey = process.env.FRAGELLA_API_KEY

  if (!apiKey) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('⚠️  FRAGELLA_API_KEY IS MISSING!')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.warn('App will use 19 local perfumes as fallback')
    return false
  }

  console.log('🔑 Fragella API Key detected')

  try {
    const response = await fetch(
      'https://api.fragella.com/api/v1/fragrances?search=test&limit=1',
      {
        headers: { 'x-api-key': apiKey },
        signal: AbortSignal.timeout(5000)
      }
    )

    if (response.ok) {
      console.log('✅ Fragella connection validated at startup')
      return true
    } else {
      console.error(`⚠️  Fragella API returned ${response.status}`)
      console.warn('App will use local fallback')
      return false
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('⚠️  Fragella connection check failed:', msg)
    console.warn('App will use local fallback')
    return false
  }
}
