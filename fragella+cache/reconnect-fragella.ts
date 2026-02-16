// scripts/reconnect-fragella.ts
// Script لحذف Cache المسموم وإعادة الاتصال بـ Fragella

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function reconnectFragella() {
  console.log('🔧 بدء إعادة الاتصال بـ Fragella...\n')

  try {
    // 1. حذف جميع entries من FragellaCache
    console.log('1️⃣ حذف Cache المسموم...')
    const deleted = await prisma.fragellaCache.deleteMany({})
    console.log(`   ✅ تم حذف ${deleted.count} cache entries\n`)

    // 2. التحقق من API Key
    console.log('2️⃣ التحقق من Fragella API Key...')
    const apiKey = process.env.FRAGELLA_API_KEY
    if (!apiKey) {
      console.error('   ❌ FRAGELLA_API_KEY مفقود في .env.local!')
      process.exit(1)
    }
    console.log(`   ✅ API Key موجود: ${apiKey.substring(0, 12)}...\n`)

    // 3. اختبار الاتصال بـ Fragella
    console.log('3️⃣ اختبار الاتصال بـ Fragella API...')
    const testUrl = 'https://api.fragella.com/api/v1/fragrances?search=perfume&limit=5'
    
    const response = await fetch(testUrl, {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.error(`   ❌ Fragella API فشل: ${response.status} ${response.statusText}`)
      const text = await response.text()
      console.error(`   الرد: ${text.substring(0, 200)}`)
      process.exit(1)
    }

    const data = await response.json()
    console.log(`   ✅ Fragella يعمل! وجد ${data.results?.length || 0} عطور`)
    console.log(`   📊 إجمالي النتائج المتاحة: ${data.total || 'غير محدد'}\n`)

    // 4. إحصائيات
    console.log('4️⃣ الإحصائيات:')
    const perfumeCount = await prisma.perfume.count()
    console.log(`   • عطور محلية في Database: ${perfumeCount}`)
    console.log(`   • عطور Fragella متاحة: ${data.total || '5000+'}`)
    console.log(`   • Cache entries الحالية: 0 (تم التنظيف)\n`)

    console.log('✅ تم إعادة الاتصال بنجاح!')
    console.log('🔄 أعد تشغيل السيرفر: npm run dev\n')

  } catch (error) {
    console.error('❌ خطأ:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

reconnectFragella()
