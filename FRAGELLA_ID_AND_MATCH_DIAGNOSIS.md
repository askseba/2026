# Fragella search skip & /api/match likedFetched: 0 – Diagnosis (code + raw payloads)

**Diagnosis only. No fixes applied.**

---

## 1. Exact raw Fragella search item shape used by the bridge

The bridge consumes whatever `searchPerfumesWithCache` returns as `fragellaData.results` or `fragellaData` (array). That comes from `perfume.service.ts` → `searchPerfumes()` which normalizes the Fragella API response to `{ results: raw }` when the API returns an array.

**From Fragella API docs (GET /fragrances):**  
The documented search response does **not** include `id`, `_id`, `slug`, or `fragranceId`. Documented fields are:

- `Name`, `Brand`, `Year`, `rating`, `Country`, `Price`, `Image URL`, `Gender`, `Longevity`, `Sillage`, `Popularity`, `Price Value`, `Confidence`, `OilType`
- `General Notes`, `Main Accords`, `Main Accords Percentage`, `Notes`, `Image Fallbacks`, `Purchase URL`
- `Season Ranking`, `Occasion Ranking`

So the **exact raw shape** the bridge sees for each search item is that object: **no canonical id/slug field in the documented spec**. The bridge then runs:

```206:219:src/lib/services/perfume-bridge.service.ts
function extractFragellaIdFromSearchItem(item: any): string | null {
  if (!item || typeof item !== 'object') return null
  const id = item.id ?? item._id ?? item.Id ?? item.fragranceId ?? item.fragrance_id
  if (id != null && String(id).trim() !== '' && !String(id).startsWith('idx-')) {
    return String(id).trim()
  }
  // Some APIs return a URL like /fragrances/12345
  const url = item.url ?? item.link ?? item.href ?? item['Purchase URL']
  if (typeof url === 'string') {
    const match = /\/fragrances?\/([^/?]+)/i.exec(url)
    if (match?.[1]) return match[1]
  }
  return null
}
```

So in practice:

- If the **live** API adds `id`/`slug`/etc., that is what should be used; the docs don’t list it.
- Otherwise the **only** source of an “ID” is the path segment from `Purchase URL` (or `url`/`link`/`href`). If any of those are missing or don’t match `/fragrances?/([^/?]+)/i`, `extractFragellaIdFromSearchItem` returns `null` → bridge logs **"Fragella search item missing ID, skipping"** and filters the item out.

**Conclusion:** The bridge treats as “raw Fragella search item” an object with the documented fields above; it does **not** currently read a `slug` field. When no id-like field and no usable URL exist, every such item is skipped.

---

## 2. Which field should be the canonical perfume ID

- **Single-fragrance fetch** used by the app is:  
  `GET https://api.fragella.com/api/v1/fragrances/${fragellaId}`  
  So the canonical perfume ID is whatever the API accepts in that path (e.g. a slug or numeric id).

- **Documented search response** does not define an identifier field. In practice the only stable, per-fragrance identifier you can derive from the docs is:
  - **If the API returns it:** a dedicated field such as `slug` or `id` (to be confirmed with real response).
  - **Otherwise:** the **last path segment** of `Purchase URL` (or `url`/`link`/`href`) when it matches a pattern like `/fragrances/...`, **provided** that URL is per-fragrance (not per-brand). That segment may be URL-encoded (e.g. `Miss%20Dior`).

So the **canonical ID** should be, in order of preference:

1. A dedicated identifier from the API (e.g. `slug` or `id`) if present and stable.
2. Otherwise the path segment from `Purchase URL` (or equivalent) after decoding, with a sanity check that it’s not brand-only (to avoid duplicates).

---

## 3. Why current mapping produces `fragella-creed` and `fragella-Miss%20Dior` instead of stable real IDs

- **No id in response:** The bridge does not read `slug`. It only uses `item.id`, `_id`, `Id`, `fragranceId`, `fragrance_id`, or the URL path from `item.url` / `item.link` / `item.href` / `item['Purchase URL']`.
- **URL path as fallback:** The regex `/\/fragrances?\/([^/?]+)/i` captures the first path segment after `/fragrances/` or `/fragrance/`. That segment is used **as-is** (no decode). So:
  - If the URL is `.../fragrances/creed`, you get `effectiveId = "creed"` → `id: "fragella-creed"`. That is often a **brand** slug, so many different Creed perfumes can all get the same id.
  - If the URL is `.../fragrances/Miss%20Dior`, you get `effectiveId = "Miss%20Dior"` → `id: "fragella-Miss%20Dior"` (URL encoding kept).
- **Result:** IDs are not guaranteed to be per-fragrance or URL-decoded, so you see `fragella-creed` (likely brand-level, unstable) and `fragella-Miss%20Dior` (encoding not normalized).

---

## 4. Why React gets duplicate key `"fragella-creed"`

- **Dedupe in the bridge** is by `name|brand`, not by `id`:

```377:398:src/lib/services/perfume-bridge.service.ts
function deduplicatePerfumes(perfumes: UnifiedPerfume[]): UnifiedPerfume[] {
  const seen = new Map<string, UnifiedPerfume>()
  for (const perfume of perfumes) {
    if (!perfume || !perfume.name || !perfume.brand) continue
    const key = `${perfume.name.toLowerCase()}|${perfume.brand.toLowerCase()}`
    if (!seen.has(key)) {
      seen.set(key, perfume)
    } else {
      const existing = seen.get(key)!
      if (perfume.source === 'local' && existing.source === 'fragella') {
        seen.set(key, perfume)
      }
    }
  }
  return Array.from(seen.values())
}
```

- So two **different** Fragella items (e.g. “Aventus” and “Millésime”) can both get `id: "fragella-creed"` when the only ID source is a brand-level URL. They have different `name|brand` keys, so both pass dedupe and both end up in the list with the **same** `id` → React list key duplicate `"fragella-creed"`.

---

## 5. Why getPerfume depends on Prisma first and fails with P2024 / P1017 / P1001

- **getPerfume** always hits Prisma before the API:

```26:31:src/lib/services/perfume.service.ts
export async function getPerfume(fragellaId: string): Promise<unknown> {
  const now = new Date()
  const cached = await prisma.fragellaPerfume.findUnique({ where: { fragellaId } })
  if (cached && cached.expiresAt > now) {
    logger.info(`✅ CACHE HIT: ${cached.name}`)
    return parseJsonField(cached.payloadJson)
```

- If **Prisma is unreachable** (e.g. P1001: can’t reach DB, P1017: connection closed), `findUnique` throws and the function never reaches the `fetch(...)` call. There is no try/catch around the DB call that falls back to the direct Fragella API.
- **P2024** (“Record to update not found”) typically happens on **update**/upsert when the record doesn’t exist in a way Prisma didn’t expect; the only write in `getPerfume` is the `upsert` after a successful API fetch. So if the DB is in a bad state or the unique constraint doesn’t match, that upsert can throw P2024.

**Result:** When Prisma is down or misconfigured, every `getPerfume(fragellaId)` call throws → in `/api/match` the catch only warns and doesn’t push to `likedPerfumesData` → `likedFetched: 0` and no families from liked perfumes → `familiesFound: 0`.

---

## 6. Why /api/match ends with likedFetched: 0, familiesFound: 0

Two separate causes:

1. **getPerfume throws (e.g. Prisma down):**  
   For each `id` in `likedIds` that starts with `fragella-`, the route calls `getPerfume(fragellaId)`. If that throws (Prisma P1001/P1017 or upsert P2024), the catch does `console.warn` and does not push to `likedPerfumesData`. So `likedPerfumesData.length === 0` → `likedFetched: 0`. Families are then only from `likedPerfumesData` and from finding liked perfumes in the search pool; if no liked are fetched and none appear in the pool, `familiesFound: 0`.

2. **convertFragellaToUnified(raw) called without fragellaId:**  
   In the match route, when getPerfume succeeds you do:

```134:137:src/app/api/match/route.ts
        if (id.startsWith('fragella-')) {
          const fragellaId = id.replace('fragella-', '')
          const raw = await getPerfume(fragellaId)
          const converted = convertFragellaToUnified(raw)
```

   So `convertFragellaToUnified` is called with **one argument**. Then in the bridge:

```244:252:src/lib/services/perfume-bridge.service.ts
    const effectiveId =
      fragellaId ??
      fragellaData.id ??
      fragellaData._id ??
      (fallbackIndex !== undefined ? `idx-${fallbackIndex}` : null)
    if (!effectiveId) {
      logger.warn('Fragella data missing ID')
      return null
    }
```

   If the **detail** API response uses PascalCase and doesn’t include `id`/`_id` (or uses `slug` which the bridge doesn’t read), `effectiveId` is null and `convertFragellaToUnified` returns null. So even when `getPerfume` succeeds, the converted perfume is dropped and not pushed to `likedPerfumesData` → again `likedFetched: 0` and no families from that path.

---

## 7. Recommended minimum code changes (order, file-level only)

- **Do not** change scoring or IFRA logic.
- **Do not** change IFRA logic beyond what’s needed for the fallback below.

### a) Stable canonical perfume ID

**File: `src/lib/services/perfume-bridge.service.ts`**

- In **`extractFragellaIdFromSearchItem`**:  
  - Add `item.slug` (and if the API uses it, `item.Slug`) to the same priority chain as `id`/`_id`/`Id`/`fragranceId`/`fragrance_id`, and use it the same way (non-empty, not `idx-`).  
  - When deriving ID from the URL, use the **decoded** path segment (e.g. `decodeURIComponent(match[1])`) so you get `Miss Dior` instead of `Miss%20Dior` if the API expects that; only use the decoded value if it’s a single path segment (no `/`) to avoid injection.  
  - Optionally: if the only ID you have is the URL segment, consider rejecting segments that look like a brand-only slug (e.g. single word and same as `item.Brand` or `item.brand`) to reduce duplicates; this is heuristic and optional.

- In **`convertFragellaToUnified`**:  
  - When computing `effectiveId`, include `fragellaData.slug` (and `fragellaData.Slug` if applicable) in the fallback chain so that detail responses that only expose `slug` still produce a valid unified perfume.

### b) Dedupe keys in search results

**File: `src/lib/services/perfume-bridge.service.ts`**

- In **`deduplicatePerfumes`**:  
  - Dedupe by **`id`** (and optionally keep the current name|brand behavior as a secondary pass). For example: first build a `Map<string, UnifiedPerfume>` keyed by `perfume.id`; when an id is already seen, apply the same “prefer local over Fragella” rule and then keep a single entry per id. Emit `Array.from(seenById.values())`. That way React never sees duplicate keys.  
  - If you need to preserve “prefer local over Fragella” when the same perfume appears from both sources, ensure the id is consistent (e.g. local uses numeric id, Fragella uses `fragella-<slug>`) so one id wins.

### c) Graceful fallback when Prisma is down

**File: `src/lib/services/perfume.service.ts`**

- In **`getPerfume`**:  
  - Wrap the **entire** Prisma usage (findUnique + optional upsert) in try/catch.  
  - On catch (e.g. Prisma known error codes P1001, P1017, P2024, or any error from `prisma.fragellaPerfume.*`):  
    - If you have a stale in-memory/cache value for that `fragellaId`, you could return it (optional).  
    - Otherwise, **skip** the cache and call the Fragella API directly:  
      `fetch(\`https://api.fragella.com/api/v1/fragrances/${fragellaId}\`, { headers: { 'x-api-key': apiKey } })`,  
      then parse JSON and return the payload. Do **not** call `prisma.fragellaPerfume.upsert` in this fallback path (so you don’t throw again).  
  - This way, when Prisma is down, getPerfume still returns fragrance data and /api/match can populate `likedPerfumesData` and `familiesFound`.

**File: `src/app/api/match/route.ts`**

- When calling the bridge after getPerfume:  
  - Use **`convertFragellaToUnified(raw, fragellaId)`** (pass the second argument) so that even when the detail API response doesn’t include `id`/`_id`/`slug` in the shape the bridge reads, you still get a valid unified perfume and push it to `likedPerfumesData`.

---

## Summary table

| Issue | Cause | Where |
|-------|--------|--------|
| "Fragella search item missing ID, skipping" | Search items have no `id`/`_id`/… and no (or non-matching) URL; bridge doesn’t read `slug` | `extractFragellaIdFromSearchItem` (perfume-bridge.service.ts) |
| IDs like fragella-creed, fragella-Miss%20Dior | ID from URL path only; brand-level slug or encoded segment used as-is | Same + no decode |
| Duplicate key "fragella-creed" | Dedupe by name\|brand; multiple items share same id from brand-level URL | `deduplicatePerfumes` (perfume-bridge.service.ts) |
| getPerfume fails with P2024/P1017/P1001 | Prisma called first; no fallback to direct API on DB error | `getPerfume` (perfume.service.ts) |
| likedFetched: 0, familiesFound: 0 | getPerfume throws and/or convertFragellaToUnified(raw) returns null (no fragellaId passed) | match route (getPerfume + convertFragellaToUnified) + getPerfume (Prisma) |

All recommended changes are file-level only and leave scoring and IFRA logic unchanged.
