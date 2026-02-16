// scripts/test-fragella.ts
// Verifies Fragella API connection

import { config } from 'dotenv'

// Load .env.local (Next.js convention)
config({ path: '.env.local' })
config({ path: '.env' }) // fallback

async function testFragella() {
  const apiKey = process.env.FRAGELLA_API_KEY

  if (!apiKey) {
    console.error('❌ FRAGELLA_API_KEY not found in environment')
    console.log('Check .env.local file')
    process.exit(1)
  }

  console.log('🔑 API Key found:', apiKey.substring(0, 12) + '...')
  console.log('🌐 Testing Fragella API...')

  try {
    const response = await fetch(
      'https://api.fragella.com/api/v1/fragrances?search=perfume&limit=5',
      {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(10000)
      }
    )

    console.log('📡 Response status:', response.status, response.statusText)

    if (!response.ok) {
      const text = await response.text()
      console.error('❌ API Error:', text.substring(0, 200))
      process.exit(1)
    }

    const data = (await response.json()) as { results?: unknown[]; total?: number }
    console.log('✅ Fragella API is working!')
    console.log('📊 Results returned:', data.results?.length ?? 0)
    console.log('📊 Total available:', data.total ?? 'unknown')

    // Show sample perfume
    if (data.results?.[0]) {
      const sample = data.results[0] as Record<string, unknown>
      console.log('\n📦 Sample perfume:')
      console.log('  Name:', sample.name ?? sample.displayName ?? sample.Name)
      console.log('  Brand:', sample.brand ?? sample.Brand)
      console.log('  Image:', sample.image ?? sample.image_url ?? sample['Image URL'])
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('❌ Connection failed:', msg)
    process.exit(1)
  }
}

testFragella()
