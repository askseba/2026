// scripts/clear-fragella-cache.ts
// Clears poisoned Fragella cache to force fresh API fetches

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearCache() {
  try {
    console.log('🧹 Clearing FragellaCache...')
    const result = await prisma.fragellaCache.deleteMany({})
    console.log(`✅ Deleted ${result.count} cache entries`)

    // Verify it's empty
    const remaining = await prisma.fragellaCache.count()
    console.log(`📊 Remaining entries: ${remaining}`)

    if (remaining === 0) {
      console.log('✅ Cache successfully cleared!')
    } else {
      console.error('⚠️ Some entries remain')
    }
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

clearCache()
