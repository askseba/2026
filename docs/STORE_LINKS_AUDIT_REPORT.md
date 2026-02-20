# Store Links Audit Report
**Date:** 2026-02-12  
**Auditor:** Senior Next.js/TypeScript Engineer  
**Scope:** Merchant URLs, store definitions, and "Go to store" UI wiring

---

## Executive Summary

✅ **Store URLs exist** in the codebase, but they are **hardcoded mock data** that is **NOT connected to the database**.  
⚠️ **Critical Gap:** Database has 7 real stores with affiliate URLs, but UI uses 11 hardcoded mock stores.  
✅ **UI is wired correctly** - clicking "Go to store" navigates to URLs when `available=true`.  
❌ **No API integration** - stores are static mock data, not fetched from `/api/prices/compare` (endpoint referenced but not implemented).

---

## 1. Store Definition Location(s)

### Primary Location: `src/components/results/CompareBottomSheet.tsx`

**File:** `src/components/results/CompareBottomSheet.tsx`  
**Lines:** 27-49  
**Constant Name:** `MOCKSTORES`  
**Type:** `StorePrice[]`

```typescript
// Lines 27-34: Interface definition
interface StorePrice {
  id: string
  name: string
  logo: string
  price: number
  available: boolean
  url: string  // ✅ URL is required in type
}

// Lines 36-49: Mock stores array
const MOCKSTORES: StorePrice[] = [
  { id: 'fragrancex', name: 'FragranceX', logo: '/stores/fragrancex.svg', price: 299, available: true, url: 'https://www.fragrancex.com' },
  { id: 'niceone', name: 'Nice One', logo: '/stores/niceone.svg', price: 315, available: true, url: 'https://www.niceonesa.com' },
  { id: 'goldenscent', name: 'Golden Scent', logo: '/stores/goldenscent.svg', price: 330, available: true, url: 'https://www.goldenscent.com' },
  { id: 'noon', name: 'Noon', logo: '/stores/noon.svg', price: 345, available: true, url: 'https://www.noon.com' },
  { id: 'amazon-sa', name: 'Amazon SA', logo: '/stores/amazon.svg', price: 355, available: true, url: 'https://www.amazon.sa' },
  { id: 'sephora', name: 'Sephora', logo: '/stores/sephora.svg', price: 390, available: true, url: 'https://www.sephora.sa' },
  { id: 'faces', name: 'Faces', logo: '/stores/faces.svg', price: 399, available: true, url: 'https://www.faces.com' },
  { id: 'namshi', name: 'Namshi', logo: '/stores/namshi.svg', price: 410, available: true, url: 'https://www.namshi.com' },
  { id: 'selfridges', name: 'Selfridges', logo: '/stores/selfridges.svg', price: 420, available: true, url: 'https://www.selfridges.com' },
  { id: 'ounass', name: 'Ounass', logo: '/stores/ounass.svg', price: 450, available: false, url: 'https://www.ounass.sa' },
  { id: 'beautyglam', name: 'Beauty Glam', logo: '/stores/beautyglam.svg', price: 460, available: true, url: 'https://www.beautyglam.sa' },
  { id: 'perfumesa', name: 'Perfume SA', logo: '/stores/perfumesa.svg', price: 485, available: true, url: 'https://www.perfumesa.com' }
]
```

### Secondary Location: Database (NOT USED IN UI)

**File:** `prisma/seed.ts`  
**Lines:** 457-507  
**Model:** `Store` (Prisma schema)  
**Database Table:** `stores`

**Note:** Database has 7 stores with `affiliateUrl`, but these are **NOT used** in the UI component. The UI uses hardcoded `MOCKSTORES` instead.

---

## 2. Store Count

### Mock Stores (Used in UI)
**Total:** 11 stores  
**Available:** 10 stores (`available: true`)  
**Unavailable:** 1 store (`available: false` - Ounass)

### Database Stores (Not Used)
**Total:** 7 stores (from `prisma/seed.ts`)  
**Active:** 7 stores (`isActive: true`)

**Mismatch:** UI uses 11 different stores than what's in the database.

---

## 3. Individual Store Details

### Mock Stores (MOCKSTORES)

| ID | Name | URL | Available | Used in `<a href>` | Notes |
|---|---|---|---|---|---|
| `fragrancex` | FragranceX | `https://www.fragrancex.com` | ✅ Yes | ✅ Yes (line 116) | Real URL |
| `niceone` | Nice One | `https://www.niceonesa.com` | ✅ Yes | ✅ Yes | Real URL |
| `goldenscent` | Golden Scent | `https://www.goldenscent.com` | ✅ Yes | ✅ Yes | Real URL |
| `noon` | Noon | `https://www.noon.com` | ✅ Yes | ✅ Yes | Real URL |
| `amazon-sa` | Amazon SA | `https://www.amazon.sa` | ✅ Yes | ✅ Yes | Real URL |
| `sephora` | Sephora | `https://www.sephora.sa` | ✅ Yes | ✅ Yes | Real URL |
| `faces` | Faces | `https://www.faces.com` | ✅ Yes | ✅ Yes | Real URL (note: DB has `faces.sa`) |
| `namshi` | Namshi | `https://www.namshi.com` | ✅ Yes | ✅ Yes | Real URL |
| `selfridges` | Selfridges | `https://www.selfridges.com` | ✅ Yes | ✅ Yes | Real URL |
| `ounass` | Ounass | `https://www.ounass.sa` | ❌ No | ⚠️ Disabled | Real URL but `available=false` |
| `beautyglam` | Beauty Glam | `https://www.beautyglam.sa` | ✅ Yes | ✅ Yes | Real URL |
| `perfumesa` | Perfume SA | `https://www.perfumesa.com` | ✅ Yes | ✅ Yes | Real URL |

### Database Stores (NOT Used in UI)

| Name | Slug | Affiliate URL | Active |
|---|---|---|---|
| FACES وجوه | `faces` | `https://www.faces.sa/?utm_source=askseba` | ✅ |
| Nice One نايس ون | `niceone` | `https://niceonesa.com/?utm_source=askseba` | ✅ |
| Golden Scent قولدن سنت | `goldenscent` | `https://www.goldenscent.com/?utm_source=askseba` | ✅ |
| السلطان للعطور | `sultan` | `https://sultanperfumes.net/?utm_source=askseba` | ✅ |
| لوجا ستور | `lojastore` | `https://lojastoregt.com/?utm_source=askseba` | ✅ |
| فانيلا للعطور | `vanilla` | `https://vanilla.sa/?utm_source=askseba` | ✅ |
| أوناس السعودية | `ounass-sa` | `https://saudi.ounass.com/?utm_source=askseba` | ✅ |

---

## 4. UI Wiring Analysis

### "Go to Store" Button Implementation

**File:** `src/components/results/CompareBottomSheet.tsx`  
**Component:** `StoreRow` (lines 79-135)  
**Lines:** 115-132

```typescript
<a
  href={store.available ? store.url : undefined}  // Line 116: Conditional href
  target="_blank"
  rel="noopener noreferrer"
  className={cn(
    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition',
    store.available
      ? 'bg-text-primary dark:bg-white hover:opacity-80 text-white dark:text-surface'
      : 'bg-gray-200 dark:bg-surface-muted cursor-not-allowed text-gray-400'  // Line 123: Disabled styling
  )}
  aria-label={t('goToStore', { store: store.name })}  // Line 125: Accessibility label
>
```

### Gating Logic

✅ **Correctly Implemented:**
- When `store.available === true`: `href={store.url}` → Link is clickable
- When `store.available === false`: `href={undefined}` → Link is disabled (no navigation)
- Visual feedback: Disabled stores have gray background and `cursor-not-allowed`
- Accessibility: `aria-label` includes store name

### Usage Flow

1. **Trigger:** User clicks "Compare Prices" button on `PerfumeCard` (line 218 in `PerfumeCard.tsx`)
2. **State:** Sets `compareMode='price-hub'` and opens `CompareBottomSheet`
3. **Render:** `PriceHubContent` component renders `StoreRow` for each store (line 205)
4. **Navigation:** Clicking store row button navigates to `store.url` if `available=true`

**File:** `src/components/results/CompareBottomSheet.tsx`  
- Line 290-294: `onPriceCompare` callback sets price hub mode
- Line 204-206: Stores are rendered in `PriceHubContent`
- Line 115-132: `StoreRow` renders clickable link

---

## 5. Placeholder Patterns

### ✅ No Placeholder URLs Found

All URLs in `MOCKSTORES` are **real merchant URLs**:
- No patterns like `https://${store.id}.com`
- No `example.com` or `placeholder.com` domains
- No template strings or interpolation

**However:** URLs are **hardcoded** and don't match database stores.

---

## 6. Type vs. Implementation Mismatch

### ✅ Type Definition Matches Implementation

**Interface (lines 27-34):**
```typescript
interface StorePrice {
  id: string
  name: string
  logo: string
  price: number
  available: boolean
  url: string  // ✅ Required field
}
```

**Implementation:** All 11 stores in `MOCKSTORES` have `url` field present. ✅

**No type mismatches found.**

---

## 7. Gating/Availability Logic

### Availability-Based Navigation

**Location:** `src/components/results/CompareBottomSheet.tsx:116`

```typescript
href={store.available ? store.url : undefined}
```

**Behavior:**
- ✅ `available: true` → `href` is set → Link navigates
- ❌ `available: false` → `href` is `undefined` → Link disabled (no navigation)

**Visual Indicators:**
- Available: Dark background, white icon, hover effects
- Unavailable: Gray background, gray icon, `cursor-not-allowed`

**Example:** `ounass` store has `available: false`, so clicking it does nothing.

---

## 8. Database vs. UI Disconnect

### Critical Finding: Two Separate Store Systems

1. **Database Stores** (`prisma/seed.ts:457-507`)
   - 7 stores with `affiliateUrl` (includes UTM tracking)
   - Stored in `stores` table
   - **NOT used in UI**

2. **UI Stores** (`CompareBottomSheet.tsx:36-49`)
   - 11 hardcoded stores with `url`
   - Used in `PriceHubContent` component
   - **NOT connected to database**

### Missing API Endpoint

**Referenced but NOT implemented:**
- Documentation mentions `/api/prices/compare?perfumeId={id}` (see `prisma/check-data.ts:27`)
- **No route file exists** at `src/app/api/prices/compare/route.ts`
- UI does not fetch store data from API

---

## 9. Minimal Safe Change Proposal

### To Add New Stores (Current Mock System)

**File:** `src/components/results/CompareBottomSheet.tsx`  
**Location:** Lines 36-49

**Steps:**
1. Add new store object to `MOCKSTORES` array
2. Follow existing format:
   ```typescript
   {
     id: 'unique-id',           // Unique string identifier
     name: 'Store Name',         // Display name
     logo: '/stores/logo.svg',   // Path to logo (must exist in public/stores/)
     price: 299,                 // Price in SAR
     available: true,            // Availability flag
     url: 'https://store.com'    // Merchant URL
   }
   ```
3. Ensure logo file exists at `public/stores/{id}.svg`
4. No other changes needed - UI will automatically include it

**Example:**
```typescript
const MOCKSTORES: StorePrice[] = [
  // ... existing stores ...
  { id: 'newstore', name: 'New Store', logo: '/stores/newstore.svg', price: 350, available: true, url: 'https://newstore.sa' }
]
```

### To Connect to Database (Recommended Future Change)

**Required Changes:**

1. **Create API Route:** `src/app/api/prices/compare/route.ts`
   ```typescript
   // Fetch stores + prices from database
   // Return StorePrice[] format matching interface
   ```

2. **Update Component:** `src/components/results/CompareBottomSheet.tsx`
   - Replace `MOCKSTORES` with API fetch
   - Use `useEffect` + `useState` to load stores
   - Map database `Store.affiliateUrl` → `StorePrice.url`

3. **Map Database Schema to UI:**
   - `Store.affiliateUrl` → `StorePrice.url`
   - `Store.name` → `StorePrice.name`
   - `Store.slug` → `StorePrice.id`
   - `Price.price` → `StorePrice.price`
   - Determine `available` from stock status or price existence

**Files to Modify:**
- `src/app/api/prices/compare/route.ts` (CREATE)
- `src/components/results/CompareBottomSheet.tsx` (MODIFY lines 36-158)

---

## 10. Summary Checklist

- [x] Store URLs exist in codebase
- [x] Count: 11 mock stores (UI), 7 database stores (unused)
- [x] File path: `src/components/results/CompareBottomSheet.tsx:36-49`
- [x] Constant name: `MOCKSTORES`
- [x] UI wired correctly: `<a href>` uses `store.url` when `available=true`
- [x] Gating logic: `href={store.available ? store.url : undefined}`
- [x] No placeholder URLs (all real merchant URLs)
- [x] No type mismatches (all stores have `url` field)
- [x] **Issue:** Mock stores not connected to database
- [x] **Issue:** API endpoint `/api/prices/compare` not implemented

---

## Recommendations

1. **Short-term:** Add stores to `MOCKSTORES` array (follow format above)
2. **Long-term:** Implement `/api/prices/compare` endpoint and connect UI to database
3. **Migration:** Map database stores to `StorePrice` format and replace mock data
4. **Testing:** Verify all store URLs are valid and affiliate links work

---

**End of Report**
