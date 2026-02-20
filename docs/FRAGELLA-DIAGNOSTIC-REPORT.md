# FRAGELLA API DIAGNOSTIC REPORT

**Date:** 2026-02-06  
**Status:** ✅ **RESOLVED** — Fragella API is now being called and returning results.

---

## === FRAGELLA DIAGNOSTIC REPORT ===

### .env.local
| Item | Result |
|------|--------|
| **Exists** | YES |
| **FRAGELLA_API_KEY** | PRESENT |
| **Value (first 10)** | `1d46163bd9` |

---

### perfume.service.ts
| Item | Result |
|------|--------|
| **Checks API key** | YES — in `searchPerfumes` and `getPerfume` |
| **Fallback behavior** | If no API key → `searchLocalPerfumes()` |
| **Logging** | Uses `logger.warn`, `logger.info` |

**Relevant code (lines 127–133):**
```typescript
const apiKey = process.env.FRAGELLA_API_KEY
if (!apiKey) {
  logger.warn('⚠️ FRAGELLA_API_KEY not set, using local search fallback')
  return searchLocalPerfumes(query, limit)
}
```

---

### perfume-bridge.service.ts
| Item | Result |
|------|--------|
| **Calls Fragella** | YES — via `searchPerfumesWithCache(query)` when `includeFragella` is true |
| **Merge logic** | Combines local + Fragella results, deduplicates (prefers local) |

---

### Environment loading
| Item | Result |
|------|--------|
| **next.config.ts** | No explicit `env:` block — Next.js loads `.env.local` automatically |
| **Key accessible** | YES — diagnostic showed `API Key exists: true` |

---

### Console logs (after diagnostic)

```
=== FRAGELLA DIAGNOSTIC ===
Query: dior
API Key exists: true
API Key (first 10): 1d46163bd9
========================
[INFO] 🔄 Cache MISS - fetching: search:dior
=== FRAGELLA API RESPONSE ===
Status: 200 OK
=============================
=== FRAGELLA UNEXPECTED SHAPE ===
Has results? false
Keys: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19']
===============================
```

---

## ROOT CAUSE

1. **Response format mismatch**  
   The Fragella API returns an **array** `[{...}, {...}]`, but the code expected `{ results: [...] }`. The array’s numeric keys (`'0'`, `'1'`, …) were treated as object keys, so `'results' in raw` was false.

2. **Field name mismatch**  
   Fragella uses PascalCase: `Name`, `Brand`, `"Image URL"` instead of `name`, `brand`, `image_url`. The bridge also expected an `id` on each item, but the API does not always include it.

---

## FIXES APPLIED

### 1. perfume.service.ts — accept array format

```typescript
// Fragella may return array directly: [{...}, {...}]
if (Array.isArray(raw)) {
  logger.info(`Fragella API: Found ${raw.length} results (array format)`)
  return { results: raw } as SearchResultsResponse
}
```

### 2. perfume-bridge.service.ts — handle Fragella format

- **Field mapping:** `Name` → `name`, `Brand` → `brand`, `"Image URL"` → `image`, `Price` → `price`
- **Fallback ID:** When `id` is missing, use `idx-${index}` for search results
- **Notes structure:** Support `Notes.Top`, `Notes.Middle`, `Notes.Base` (Fragella format)
- **Families:** Support `"Main Accords"` (PascalCase)

---

## VERIFICATION

**Test command:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/perfumes/search?q=dior"
```

**Result:** 20 perfumes (1 local + 19 Fragella), including:
- Sauvage (local)
- Dior Dior Dior for women (Fragella)
- Miss Dior for women (Fragella)
- Dior Homme 2005 for men (Fragella)
- etc.

---

## CACHE CLEAR UTILITY

There is no `/api/cache/clear` endpoint. Use:

```bash
node scripts/clear-fragella-cache.js
```

This clears the `FragellaCache` table so new searches hit the Fragella API instead of cached data.

---

## SUMMARY

| Before | After |
|--------|-------|
| API called but response shape rejected | Array format handled correctly |
| `convertFragellaToUnified` returned null (missing id) | Fallback `idx-${index}` used when id absent |
| PascalCase fields not read | `Name`, `Brand`, `"Image URL"` mapped |
| Only local results shown | Local + Fragella results merged |
