# Cursor: Fix Fragella Disconnection - Implementation Guide

## 🎯 ROOT CAUSE IDENTIFIED

**Cache Poisoning**: When Fragella API fails (once), the fallback results (19 local perfumes) are stored in `FragellaCache` for 24 hours. All subsequent requests use this poisoned cache, making the app appear "disconnected" even though it was just one failure.

---

## 🚀 IMMEDIATE FIX (5 minutes)

### Step 1: Clear Poisoned Cache

**Option A: Using Prisma Studio (Recommended)**
```bash
npx prisma studio
```
1. Open `FragellaCache` table
2. Delete all records
3. Close Prisma Studio

**Option B: Using Script**
Create `scripts/clear-cache.ts`:
```typescript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function clearCache() {
  const result = await prisma.fragellaCache.deleteMany({})
  console.log(`Deleted ${result.count} cache entries`)
  await prisma.$disconnect()
}

clearCache()
```

Run:
```bash
npx tsx scripts/clear-cache.ts
```

**Option C: Direct SQL**
```sql
DELETE FROM FragellaCache;
```

### Step 2: Verify Fragella API

Test manually:
```bash
curl -H "x-api-key: YOUR_ACTUAL_KEY" \
  "https://api.fragella.com/api/v1/fragrances?search=perfume&limit=5"
```

Expected: JSON response with `results` array and `total` count.

If you get 401/403: API key is invalid or expired - get a new one from Fragella.

### Step 3: Restart Server

```bash
npm run dev
```

Check logs for:
```
[Fragella API] ✅ XXX perfumes fetched
[api/match] Fragella pool: XXX عطور  (should be >19)
```

---

## 🔧 PERMANENT FIX (20 minutes)

### Implementation: Prevent Caching Fallback Results

**File: `src/lib/services/perfume.service.ts`**

#### Change 1: Add `source` flag to response type

Find the `FragellaSearchResponse` interface (or create it):
```typescript
export interface FragellaSearchResponse {
  results: any[]
  total?: number
  source?: 'fragella' | 'local'  // ← Add this
}
```

#### Change 2: Tag responses with source

In `searchPerfumes()` function (around line 135-172):

**Before every `return` statement, add `.source`:**

```typescript
// When API key missing
if (!apiKey) {
  console.warn('[Perfume Service] No FRAGELLA_API_KEY - using local fallback')
  const local = await searchLocalPerfumes()
  return { ...local, source: 'local' }  // ← Add source
}

// When response fails
if (!response.ok) {
  console.error(`[Fragella API] ${response.status}: ${response.statusText}`)
  const local = await searchLocalPerfumes()
  return { ...local, source: 'local' }  // ← Add source
}

// When response shape is invalid
if (!data.results || !Array.isArray(data.results)) {
  console.error('[Fragella API] Invalid response shape')
  const local = await searchLocalPerfumes()
  return { ...local, source: 'local' }  // ← Add source
}

// Success case
console.log(`[Fragella API] ✅ ${data.results.length} perfumes fetched`)
return { ...data, source: 'fragella' }  // ← Add source

// In catch block
catch (error) {
  console.error('[Fragella API] Request failed:', error)
  const local = await searchLocalPerfumes()
  return { ...local, source: 'local' }  // ← Add source
}
```

#### Change 3: Only cache Fragella responses

In `searchPerfumesWithCache()` function (around line 176-228):

**Replace the caching logic after `searchPerfumes()` call:**

```typescript
console.log(`[INFO] ❌ Cache MISS: ${cacheKey}`)

// Fetch from Fragella
const response = await searchPerfumes(query, limit)

// ⚠️ CRITICAL FIX: Only cache real Fragella responses
const isFromFragella = response.source === 'fragella'
const hasResults = response.results && response.results.length > 0

if (isFromFragella && hasResults) {
  // ✅ Real Fragella data - cache it
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

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

  console.log(`[INFO] 💾 Cache STORED: ${cacheKey} (${response.results.length} results from Fragella)`)
} else {
  // ⚠️ Fallback or empty - DO NOT CACHE
  console.warn(`[WARN] 🚫 NOT CACHING: ${cacheKey} (source: ${response.source}, count: ${response.results?.length || 0})`)
}

return response
```

---

## 🛡️ PREVENTION MEASURES

### 1. Startup Validation

Add to `src/lib/services/perfume.service.ts` or create `src/lib/startup-checks.ts`:

```typescript
export async function validateFragellaConnection() {
  const apiKey = process.env.FRAGELLA_API_KEY
  
  if (!apiKey) {
    console.error('❌ FRAGELLA_API_KEY is missing!')
    return false
  }

  try {
    const response = await fetch(
      'https://api.fragella.com/api/v1/fragrances?search=test&limit=1',
      {
        headers: { 'x-api-key': apiKey },
        signal: AbortSignal.timeout(5000)
      }
    )

    if (response.ok) {
      console.log('✅ Fragella connection validated')
      return true
    } else {
      console.error(`❌ Fragella API returned ${response.status}`)
      return false
    }
  } catch (error) {
    console.error('❌ Fragella connection failed:', error)
    return false
  }
}
```

Call it in `src/app/api/match/route.ts` or on app startup.

### 2. Monitoring Endpoint

Enhance `/api/health/perfume-data`:

```typescript
export async function GET() {
  const fragellaCache = await prisma.fragellaCache.count()
  const localPerfumes = await prisma.perfume.count()
  
  // Check if we're stuck on fallback
  const isUsingFallback = fragellaCache === 0 || localPerfumes === 19
  
  return NextResponse.json({
    status: isUsingFallback ? 'degraded' : 'healthy',
    fragellaCache,
    localPerfumes,
    warning: isUsingFallback ? 'Using local fallback - Fragella may be disconnected' : null
  })
}
```

### 3. Alert on Fallback

Add to `/api/match/route.ts`:

```typescript
if (basePerfumes.length === 19) {
  console.error('⚠️ WARNING: Using 19 local perfumes - Fragella connection may be broken!')
}
```

---

## 🧪 TESTING

After implementing fixes:

1. **Clear cache again**:
   ```bash
   npx tsx scripts/clear-cache.ts
   ```

2. **Restart server**:
   ```bash
   npm run dev
   ```

3. **Check logs** - should see:
   ```
   [Fragella API] ✅ XXX perfumes fetched
   [INFO] 💾 Cache STORED: search:popular:2000 (XXX results from Fragella)
   [api/match] Fragella pool: XXX عطور
   ```

4. **Verify in browser**:
   - Results page should show more than 19 perfumes
   - Images should be from Fragella (different URLs than Unsplash)

5. **Test fallback doesn't cache**:
   - Temporarily break Fragella (wrong API key)
   - Make a request
   - Check logs: `[WARN] 🚫 NOT CACHING`
   - Verify no new cache entries in `FragellaCache` table

---

## 📋 CHECKLIST

- [ ] Clear current `FragellaCache`
- [ ] Verify `FRAGELLA_API_KEY` in `.env.local`
- [ ] Test Fragella API with curl
- [ ] Add `source` field to `FragellaSearchResponse` type
- [ ] Update all `return` statements in `searchPerfumes()` to include `source`
- [ ] Update `searchPerfumesWithCache()` to only cache when `source === 'fragella'`
- [ ] Add startup validation (optional but recommended)
- [ ] Enhance health check endpoint (optional)
- [ ] Add alert when pool size = 19 (optional)
- [ ] Test: Clear cache, restart, verify >19 perfumes
- [ ] Test: Break API key, verify fallback not cached
- [ ] Update broken image URLs in `src/lib/data/perfumes.ts` (secondary issue)

---

## ⚡ QUICK WINS

If you only have 5 minutes, do this:

1. Clear cache: `DELETE FROM FragellaCache;`
2. Add one line in `searchPerfumesWithCache()`:
   ```typescript
   const response = await searchPerfumes(query, limit)
   
   // Add this check:
   if (response.results.length <= 19) {
     console.warn('Skipping cache - appears to be fallback')
     return response
   }
   
   // ... existing cache logic
   ```
3. Restart server

This will work for now, but do the full fix when you have time.

---

## 🎯 SUCCESS CRITERIA

You'll know it's fixed when:
- ✅ Logs show `[api/match] Fragella pool: XXX عطور` where XXX > 100
- ✅ Results page shows many more than 19 perfumes
- ✅ Images are different (not the same 19 Unsplash URLs)
- ✅ After a Fragella failure, cache doesn't store fallback
- ✅ Next natural cache expiry, app automatically reconnects

**This is the 5th disconnection. After this fix, there should never be a 6th.**
