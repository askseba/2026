# 🔍 UI/UX FORENSICS — الجزء المتبقي (Child Components + Legacy + A11y + Screenshots)

> **NO CODE CHANGES** — تحليل وتوثيق فقط  
> إكمال الفجوات الأربع المتبقية من التقرير السابق

---

## 1. CHILD COMPONENTS تفكيك كامل

### A) Child Components Table

| Component | Props | UI Elements | Conditions |
|-----------|-------|-------------|------------|
| **PerfumeCard** | `id`, `name`, `title`, `brand`, `finalScore`, `matchPercentage`, `image`, `imageUrl`, `description`, `isSafe`, `showCompare`, `isComparing`, `onCompare`, `rarity`, `stockStatus`, `variant`, `priority` | Badge "آمن تماماً", Score % badge, Exclusive badge, Image, Brand, Title, Description, "اكتشف المكونات" Button, Compare toggle Button (ArrowRightLeft), low-stock warning | `isSafe && displayScore >= 70` → safe badge; `rarity === 'exclusive'` → exclusive badge; `showCompare` → compare button; `stockStatus === 'low-stock'` → AlertCircle |
| **UpsellCard** | `position`, `remainingCount`, `averageMatch`, `onUpgrade` | Crown badge, "ترقية مميزة" label, "X عطور إضافية تطابقك تماماً", averageMatch %, 4 feature cards, pricing "15 ريال/شهر", Link "اشترك الآن" | `position === 'bottom'` → `col-span-full mt-12`; `position === 'mid-grid'` → `col-span-1`; `averageMatch` → optional text |
| **BlurredTeaserCard** | `title`, `brand`, `matchPercentage`, `matchRange`, `items`, `tier`, `userTier`, `onUpgrade` | Lock icon, 3 teaser mini-cards (items), "X عطر إضافي ينتظرك", message, matchRange %, CTA button | `items && items.length > 0` → multi-item layout (old interface); else → single card layout; `tier === 'GUEST'` → "سجّل الآن مجاناً" / signIn(); else → "اشترك بـ 15 ريال/شهر" / pricing |
| **SafetyWarnings** | `perfume`, `ifraScore`, `warnings`, `className` | Safety score card (label + score), progress bar, warnings list, symptomTriggers badges, IFRA info (if fragella), ingredients list | `ifraScore` → getSafetyLevel(80/60/40); `warnings.length > 0` → warnings section; `perfume.symptomTriggers?.length > 0` → symptom section; `perfume.source === 'fragella'` → IFRA info; `perfume.ingredients?.length > 0` → ingredients |

---

### B) Component Citations

#### PerfumeCard
- **Props & Conditions:** `src/components/ui/PerfumeCard.tsx:8-46`
  ```ts
  interface PerfumeCardProps { id, name?, title?, brand, finalScore?, matchPercentage?, ... }
  const displayScore = finalScore ?? matchPercentage ?? 0
  ```
- **Safe badge:** `src/components/ui/PerfumeCard.tsx:67-73`
  ```tsx
  {isSafe && displayScore >= 70 && (
    <div className="..."><ShieldCheck /> آمن تماماً</div>
  )}
  ```
- **Compare toggle:** `src/components/ui/PerfumeCard.tsx:128-143`
  ```tsx
  {showCompare && (
    <Button ... onClick={onCompare} aria-label="مقارنة"><ArrowRightLeft /></Button>
  )}
  ```

#### UpsellCard
- **Position logic:** `src/components/ui/UpsellCard.tsx:24`
  ```tsx
  className={`... ${position === 'bottom' ? 'col-span-full mt-12' : 'col-span-1'}`}
  ```
- **CTA text:** `src/components/ui/UpsellCard.tsx:121`
  ```tsx
  <span>اشترك الآن</span>
  ```
- **Mid vs Bottom:** ResultsContent L152-166 → mid-grid after index 4 for FREE; L194 → bottom always when tier !== PREMIUM

#### BlurredTeaserCard
- **matchRange calc:** `src/components/results/ResultsContent.tsx:191`
  ```tsx
  matchRange={`${Math.min(...blurredItems.map(i => i.matchScore))}-${Math.max(...blurredItems.map(i => i.matchScore))}%`}
  ```
- **Tier logic:** `src/components/ui/BlurredTeaserCard.tsx:44-51`
  ```tsx
  const currentTier = userTier?.toUpperCase() || tier || 'GUEST'
  const message = currentTier === 'GUEST' ? 'سجّل مجاناً...' : 'اشترك للوصول...'
  const ctaText = currentTier === 'GUEST' ? 'سجّل الآن مجاناً' : 'اشترك بـ 15 ريال/شهر'
  ```

#### SafetyWarnings
- **ifraScore rendering:** `src/components/SafetyWarnings.tsx:22-27`
  ```tsx
  const getSafetyLevel = (score) => {
    if (score >= 80) return { level: 'safe', ... }
    if (score >= 60) return { level: 'warning', ... }
    if (score >= 40) return { level: 'caution', ... }
    return { level: 'danger', ... }
  }
  ```
- **symptomTriggers:** `src/components/SafetyWarnings.tsx:127-147`
  ```tsx
  {perfume.symptomTriggers && perfume.symptomTriggers.length > 0 && (
    <div>... {perfume.symptomTriggers.map(...)}</div>
  )}
  ```
- **Note:** SafetyWarnings is **not imported** anywhere in the active app. Orphan component.

---

## 2. LEGACY RESULTS UI vs CURRENT

### Legacy vs Current Comparison

| Feature | Legacy (`ResultsGrid.tsx` + `_archived/pages/results`) | Current (`/[locale]/results` → ResultsContent) |
|---------|--------------------------------------------------------|-----------------------------------------------|
| **Filters** | ✅ `useResultsFilters` (matchPercentage, maxPrice, families) | ❌ None |
| **Search** | ✅ `searchQuery` client-side filter | ❌ None |
| **Pagination** | ✅ `itemsPerPage: 12`, page controls | ❌ None (all results in one grid) |
| **Test-limits banner** | ✅ `testLimits` for FREE tier (L271-279) | ❌ None |
| **Sidebar** | ✅ `lg:w-80` sidebar | ❌ None |
| **Empty state** | ✅ "لا توجد نتائج" + reset filters button | ❌ No explicit empty state |
| **Error state** | ✅ Dedicated error UI with retry | ❌ **No error UI** — `error` set but never rendered |
| **Locale** | ❌ RTL hardcoded | ✅ `dir={direction}` from locale |

### Status: **Legacy = DEAD / Current = ACTIVE**

- **Legacy:** `src/components/ResultsGrid.tsx` exports `ResultsPage` but **is not imported** anywhere. `src/app/_archived/pages/results/page.tsx` imports `ResultsContent`, not ResultsGrid. `_archived` does not generate routes (per `docs/ROUTES.md:56`).
- **Current:** `src/app/[locale]/results/page.tsx` → `ResultsContent` — this is the only active results route.

**Citation:** `docs/archive/20260201/docs-root-md/loading-states/LOADING_STATES_DIAGNOSTIC_v2.md:128` — *"ResultsGrid.tsx is not imported by the app"*.

---

## 3. STATES SCREENSHOTS MATRIX

| State | Trigger | Screenshot | Notes |
|-------|---------|------------|-------|
| **Loading** | `isLoading === true` | — | Full-page `LoadingSpinner` (type 3, size lg). `ResultsContent.tsx:77`. `role="status"` `aria-live="polite"` present. |
| **Error** | API fail / network offline | `results-state-error-offline.png` | App shows offline UI ("لا يوجد اتصال بالإنترنت") from network layer — not ResultsContent error. **Gap:** ResultsContent `error` (L64) never rendered; on API fail user would see blank grid. |
| **Empty** | `scoredPerfumes.length === 0` | — | No dedicated empty state. Grid is empty; BackButton + Hero + possibly BlurredTeaserCard + UpsellCard if tier !== PREMIUM. |
| **Guest** | `tier === 'GUEST'` | — | ~3 cards (API-dependent) + BlurredTeaserCard + UpsellCard bottom. No mid-grid UpsellCard. |
| **Free** | `tier === 'FREE'` | — | 6 visible + mid-grid UpsellCard after 4th card (L152) + BlurredTeaserCard + bottom UpsellCard. |
| **Premium** | `tier === 'PREMIUM'` | — | All results, no BlurredTeaserCard, no UpsellCard. |

**Screenshot captured:** `results-state-error-offline.png` (offline/network error state).

**Test instructions:** Loading: visit `/ar/results` with network throttling. Error: mock API 500 (or offline). Empty: mock API returns `perfumes: []`. Guest/Free/Premium: control API tier response — requires backend or mock.

---

## 4. A11Y / KEYBOARD NAV AUDIT

### Grep Results

| Pattern | Matches (src/) | Notes |
|---------|----------------|-------|
| `aria-` | login, DarkModeToggle, BackButton, Step3Allergy, faq, input, button, PerfumeCard (Compare only), SpeedometerGauge, ShareButton, FilterTabs, LoadingSpinner, etc. | Compare button has `aria-label="مقارنة"` |
| `role=` | Step3Allergy (checkbox), faq, FilterTabs, SpeedometerGauge, PerfumeTimeline, MobileFilterModal | PerfumeCard wrapper has no `role` |
| `tabindex` | useFocusTrap (for trap logic only) | No explicit tabindex on cards |
| `focus-visible` | button.tsx, BackButton, input, FilterTabs, PerfumeGrid, ThemeToggle, globals.css, classnames | PerfumeCard **lacks** focus-visible |
| `sr-only` | HeroSection (H1), DarkModeToggle | Minimal use |

### Keyboard Flow

1. **Tab through cards:** PerfumeCard is a `<div>` — **not focusable**. Only inner buttons ("اكتشف المكونات", Compare) receive focus.
2. **Compare:** Compare button has `aria-label="مقارنة"` (`PerfumeCard.tsx:138`).
3. **UpsellCard:** Link "اشترك الآن" is focusable (default Link behavior). No explicit `aria-label` on UpsellCard root.
4. **Back:** BackButton has `aria-label` and `focus-visible:ring` (`BackButton.tsx:64,72`).

### Screen Reader Gaps

- **Perfume names:** Card uses `<h3>` with `displayName` — readable.
- **Scores:** Score badge has no `aria-label`; numeric value in span only.
- **Safe status:** "آمن تماماً" badge has no `role`/`aria-label`; icon `ShieldCheck` lacks `aria-hidden` when decorative.

### A11y Gaps List

| Severity | Gap | File:Line | Excerpt |
|----------|-----|-----------|---------|
| **CRITICAL** | PerfumeCard root not focusable — cannot Tab to card | `PerfumeCard.tsx:64-65` | `<div className="group relative bg-white...">` — no `tabIndex`, no `role="button"` |
| **CRITICAL** | ResultsContent error state never rendered | `ResultsContent.tsx:40,63-64,77-80` | `setError('...')` but no `if (error) return <ErrorUI />` |
| **HIGH** | PerfumeCard lacks focus-visible ring | `PerfumeCard.tsx:64` | No `focus-visible:outline-none focus-visible:ring-2` on card |
| **HIGH** | UpsellCard Link no aria-label for "اشترك الآن" context | `UpsellCard.tsx:114-122` | `<Link href="/pricing">... <span>اشترك الآن</span></Link>` |
| **MEDIUM** | BlurredTeaserCard CTA button no aria-label | `BlurredTeaserCard.tsx:87-91` | `<button onClick={handleClick}>{ctaText}</button>` |
| **MEDIUM** | Score badge in PerfumeCard not announced | `PerfumeCard.tsx:83-86` | `<span>{displayScore}%</span>` — consider `aria-label` for region |

---

## OUTPUT SUMMARY

### A) Child Components Table — ✅ Above

### B) Legacy vs Current Comparison — ✅ Above  
Status: **Legacy = Dead**, **Current = Active**

### C) Screenshots Matrix — 6 states documented  
Screenshots require manual run: `npm run dev` → visit `/ar/results` with different API responses.

### D) A11y Gaps — ✅ Above  
2 CRITICAL, 2 HIGH, 2 MEDIUM

---

*Generated: Forensic analysis, no code changes applied.*
