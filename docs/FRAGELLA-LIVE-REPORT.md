# FRAGELLA LIVE TEST — REPORT

**Date:** 2026-02-06  
**Test:** `GET /api/perfumes/search?q=chanel`

---

## 1) Dev server

- **Status:** Running on **http://localhost:3000**
- Started via `npm run dev` (Next.js 16.1.1, webpack).
- Ready in ~3.2s.

---

## 2) API test

```bash
# Executed (PowerShell):
Invoke-WebRequest -Uri "http://localhost:3000/api/perfumes/search?q=chanel" -UseBasicParsing | ... | Set-Content fragella-test.json
```

- **Result:** `fragella-test.json` saved successfully (200, ~7.5s).

---

## 3) Analysis

### API response (excerpt)

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "_id": "1",
      "name": "Bleu de Chanel",
      "brand": "Chanel",
      "image": "https://images.unsplash.com/photo-1541643600914-78b084683601?w=300&h=400&fit=crop&crop=center",
      "source": "local"
    }
  ],
  "perfumes": [ ... same ... ],
  "total": 1
}
```

### First perfume

| Field       | Value |
|------------|--------|
| **name**   | Bleu de Chanel |
| **source** | local |
| **fragellaId** | *(absent)* |

### Total count

- **total:** `1`

---

## 4) Server logs (npm run dev)

Relevant lines from the dev server terminal:

```
○ Compiling /api/perfumes/search ...
[INFO] 🔄 Cache MISS - fetching: search:chanel
[INFO] Cache updated undefined
 GET /api/perfumes/search?q=chanel 200 in 6.7s (compile: 4.4s, render: 2.2s)
```

- Search ran with **cache MISS** for `search:chanel`, then cache was updated.
- No "Fragella" or "CACHE HIT" in these lines (first request after server start).

---

## 5) Database cache (FragellaCache)

Queried via Prisma: `FragellaCache.findMany({ take: 15 })`.

**Cache table:** **ROWS**

| key | expiresAt (UTC) |
|-----|------------------|
| search:rose | 2026-02-06T02:53:59.892Z |
| **search:chanel** | 2026-02-07T02:59:55.248Z |
| search:dio | 2026-02-06T03:27:35.413Z |
| search:di | 2026-02-06T03:27:35.416Z |
| search:dior | 2026-02-06T03:27:35.545Z |
| search:cr | 2026-02-06T03:27:48.138Z |
| search:شانيل | 2026-02-07T00:31:37.190Z |

- **Total rows:** 7  
- **search:chanel** is present and was written by this test (24h TTL).

**Prisma Studio:** Run `npx prisma studio --port 5556` and open **http://localhost:5556** → **FragellaCache** to inspect.

---

## 6) Summary

| Item | Result |
|------|--------|
| **API response** | `{ success: true, data: [...], perfumes: [...], total: 1 }` |
| **First perfume** | `{ name: "Bleu de Chanel", source: "local", fragellaId: (absent) }` |
| **Total count** | **1** |
| **Server logs** | Cache MISS for `search:chanel`, cache updated, GET 200 in 6.7s |
| **Cache table** | **ROWS** (7 entries, including `search:chanel`) |
| **STATUS** | **LOCAL-ONLY** (this response only contains local data; no Fragella results in payload) |
| **VOICE READY** | **YES** (`useVoiceSearch` + `voice-search-mapping.ts` with شانيل→Chanel; search API used with `q=`) |

---

### Notes

- The single result is from **local** (id `"1"`, `source: "local"`). Fragella cache and search path ran (cache miss then update), but the merged response for `q=chanel` only included the local match. So either Fragella API key is unset (local fallback) or Fragella returned no/empty results and the bridge kept only the local match.
- Voice search is wired: Arabic→English mapping (e.g. شانيل → Chanel) and fuzzy matching in `useVoiceSearch.ts`, and the search bar uses the same `/api/perfumes/search?q=...` API.
