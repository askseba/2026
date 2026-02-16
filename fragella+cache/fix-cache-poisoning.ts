// src/lib/services/perfume.service.ts
// FIX: منع تخزين fallback results في FragellaCache

// ===== الإصلاح المطلوب =====

// 🔍 ابحث عن دالة searchPerfumesWithCache (حوالي line 176)
// استبدل الكود الحالي بهذا:

export async function searchPerfumesWithCache(
  query: string,
  limit: number
): Promise<FragellaSearchResponse> {
  const cacheKey = `search:${query || 'popular'}:${limit}`

  try {
    // 1. محاولة قراءة من Cache
    const cached = await prisma.fragellaCache.findUnique({
      where: { key: cacheKey }
    })

    if (cached) {
      const now = new Date()
      if (cached.expiresAt > now) {
        console.log(`[INFO] ✅ Cache HIT: ${cacheKey}`)
        return cached.results as FragellaSearchResponse
      }
      // Cache منتهي - حذفه
      await prisma.fragellaCache.delete({ where: { key: cacheKey } })
    }

    console.log(`[INFO] ❌ Cache MISS: ${cacheKey}`)

    // 2. طلب جديد من Fragella
    const response = await searchPerfumes(query, limit)

    // ⚠️ الإصلاح الحرج: تحقق إذا كانت النتيجة من Fragella حقيقي
    const isFromFragella = response.results && response.results.length > 0
    const hasFragellaSource = response.source === 'fragella' // إذا كنت أضفت source flag
    
    // ❌ لا تخزن إذا:
    // - النتائج فارغة
    // - عدد النتائج = 19 بالضبط (حجم fallback المحلي)
    // - جاءت من searchLocalPerfumes
    const shouldCache = isFromFragella && 
                       response.results.length > 0 && 
                       response.results.length !== 19 // ⚠️ رقم سحري - حجم perfumes.ts

    if (shouldCache) {
      // ✅ نتائج حقيقية من Fragella - خزنها
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      await prisma.fragellaCache.upsert({
        where: { key: cacheKey },
        create: {
          key: cacheKey,
          results: response as any,
          expiresAt
        },
        update: {
          results: response as any,
          expiresAt
        }
      })

      console.log(`[INFO] 💾 Cache STORED: ${cacheKey} (${response.results.length} results)`)
    } else {
      // ⚠️ نتائج fallback - لا تخزن
      console.warn(`[WARN] 🚫 NOT CACHING: ${cacheKey} (fallback or empty results)`)
    }

    return response

  } catch (error) {
    console.error('[ERROR] searchPerfumesWithCache failed:', error)
    // لا تخزن الخطأ - ارجع fallback مباشرة بدون cache
    return await searchLocalPerfumes()
  }
}

// ===== تحسين إضافي =====

// 🔍 في دالة searchPerfumes (حوالي line 135)
// أضف source flag للنتائج:

export async function searchPerfumes(
  query: string = '',
  limit: number = 100
): Promise<FragellaSearchResponse> {
  const apiKey = process.env.FRAGELLA_API_KEY

  if (!apiKey) {
    console.warn('[Perfume Service] No FRAGELLA_API_KEY - using local fallback')
    const local = await searchLocalPerfumes()
    return { ...local, source: 'local' } // ⬅️ أضف source flag
  }

  try {
    const response = await fetch(
      `https://api.fragella.com/api/v1/fragrances?search=${query}&limit=${limit}`,
      {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(10000) // 10s timeout
      }
    )

    if (!response.ok) {
      console.error(`[Fragella API] ${response.status}: ${response.statusText}`)
      const local = await searchLocalPerfumes()
      return { ...local, source: 'local' } // ⬅️ أضف source flag
    }

    const data = await response.json()
    
    if (!data.results || !Array.isArray(data.results)) {
      console.error('[Fragella API] Invalid response shape')
      const local = await searchLocalPerfumes()
      return { ...local, source: 'local' } // ⬅️ أضف source flag
    }

    console.log(`[Fragella API] ✅ ${data.results.length} perfumes fetched`)
    return { ...data, source: 'fragella' } // ⬅️ أضف source flag

  } catch (error) {
    console.error('[Fragella API] Request failed:', error)
    const local = await searchLocalPerfumes()
    return { ...local, source: 'local' } // ⬅️ أضف source flag
  }
}

// ===== تحديث Type Definition =====

// أضف في types.ts أو في أعلى الملف:
export interface FragellaSearchResponse {
  results: any[]
  total?: number
  source?: 'fragella' | 'local' // ⬅️ أضف هذا
}
