/**
 * Test script for /api/health/perfume-data endpoint
 * Run: node scripts/test-perfume-health.js
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

async function testPerfumeHealth() {
  console.log('🧪 Testing /api/health/perfume-data\n')
  
  try {
    const response = await fetch(`${BASE_URL}/api/health/perfume-data`)
    const data = await response.json()
    
    console.log('✅ Response Status:', response.status)
    console.log('📊 Response Data:', JSON.stringify(data, null, 2))
    
    // Test Case 1: Status is healthy
    if (data.status === 'healthy') {
      console.log('\n✅ TEST 1 PASSED: Status is healthy')
    } else {
      console.log('\n❌ TEST 1 FAILED: Status should be "healthy"')
    }
    
    // Test Case 2: Source is valid
    const validSources = ['fragella+ifra', 'fallback']
    if (validSources.includes(data.source)) {
      console.log('✅ TEST 2 PASSED: Source is valid (' + data.source + ')')
    } else {
      console.log('❌ TEST 2 FAILED: Source should be "fragella+ifra" or "fallback"')
    }
    
    // Test Case 3: Required fields present
    const requiredFields = ['status', 'source', 'fragellaCacheCount', 'fragellaPerfumeCount', 'localPerfumeCount', 'fallbackPct', 'recommendation']
    const missingFields = requiredFields.filter(field => !(field in data))
    
    if (missingFields.length === 0) {
      console.log('✅ TEST 3 PASSED: All required fields present')
    } else {
      console.log('❌ TEST 3 FAILED: Missing fields:', missingFields.join(', '))
    }
    
    // Summary
    console.log('\n📈 Summary:')
    console.log(`   Source: ${data.source}`)
    console.log(`   Fragella Cache: ${data.fragellaCacheCount}`)
    console.log(`   Fragella Perfumes: ${data.fragellaPerfumeCount}`)
    console.log(`   Local Perfumes: ${data.localPerfumeCount}`)
    console.log(`   Fallback %: ${(data.fallbackPct * 100).toFixed(1)}%`)
    console.log(`   Recommendation: ${data.recommendation}`)
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

// Run tests
testPerfumeHealth().catch(console.error)
