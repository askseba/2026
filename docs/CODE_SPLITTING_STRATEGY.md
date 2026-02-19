# 📦 Code Splitting Strategy - Ask Seba

**Date:** January 29, 2026  
**Project:** f9-new (Ask Seba)  
**Analysis Duration:** ~60 minutes (3 tasks)  
**Strategy Version:** 1.0

---

## 🎯 Executive Summary

> **TL;DR for Leadership:** This strategy identifies **~415 KB** of savings (≈30% client bundle reduction) achievable in **3 weeks** with **~26–34 hours** of engineering effort. Week 1 targets the highest-ROI quick wins (~220 KB, 6–8 hours).

### Current State
- **Total Client Bundle:** 1.36 MB (`.next/static/chunks`, 40 chunks)
- **Total Server Bundle:** 30.69 MB (normal for Next.js SSR)
- **Combined Total:** 32.05 MB
- **Initial Load:** ~600–700 KB estimated (shared + polyfills + CSS)
- **Routes Analyzed:** 22 static pages (all prerendered)
- **Performance:** Needs improvement (estimated FCP ~2.0s, LCP ~2.5s on 3G)

### Optimization Potential
- **Total Identified Savings:** ~415 KB client bundle reduction (initial load focused)
- **Percentage Improvement:** ~30% smaller initial client JS
- **Implementation Effort:** ~26–34 hours over 3 weeks
- **Risk Level:** Low (staged rollout, clear rollback, isolated changes)

### Priority Breakdown
- **Must Do (ROI > 3.0):** 4 items → ~216 KB (Week 1)
- **Should Do (ROI 2.0–3.0):** 6 items → ~170–200 KB (Weeks 2–3)  
- **Consider (ROI 1.0–2.0):** 7 items → ~95–120 KB (optional, Week 3+)

### Top 3 Immediate Actions (Start This Week)
1. **PriceComparisonTable** (1 hour) → Dynamic import, below-fold, Premium-only, ROI 5.15.
2. **Sentry defer init** (3 hours) → ~175 KB off initial load (all routes), ROI 3.33.
3. **Step3Allergy** (2 hours) → Route-level lazy loading for `/quiz/step3-allergy`, ROI 3.05.

### Expected Performance Impact
```
Current:  Initial ~600–700 KB, FCP ~2.0s, LCP ~2.5s
Week 1:   Initial ~400–500 KB, FCP ~1.8s (−10%), LCP ~2.2s (−12%)
Week 2:   Initial ~350–450 KB, FCP ~1.6s (−20%), LCP ~2.0s (−20%)
Week 3:   Initial ~250–350 KB, FCP ~1.4s (−30%), LCP ~1.8s (−28%)
```

**Recommended Start:** Implement PriceComparisonTable (≤1h), then Sentry defer (3h), then Step3Allergy (2h) and PostHog idle defer (2h) = **8 hours for ~220 KB reduction** in Week 1.

---

## 📊 Part 1: Current Bundle Analysis

> **Source:** `bundle_analysis.md` (Task 1, ~18 minutes)

### Build Statistics

**Build Command:**
```bash
npm run build
```

**Build & Framework:**
- **Framework:** Next.js 16.1.1 (App Router, Turbopack)
- **Build Time:** ~23 seconds total
  - Compilation: 20.4s
  - runAfterProductionCompile: 1.5s
  - Static page generation (22 routes): 1.1s
- **Static Pages:** 22
- **Dynamic/API Routes:** 0 (not relevant for this analysis)

### Bundle Breakdown
- **Client Bundle:** 1,387.59 KB (1.36 MB, 40 chunks)
- **Server Bundle:** 31,431.20 KB (30.69 MB)
- **Combined Total:** 32,818.79 KB (32.05 MB)
- **Smallest Client Chunk:** 0.65 KB (`9ccb5d66256cd124.js`)
- **Largest Client Chunk:** 218.69 KB (`bf3998032f1c986e.js`)
- **Average Client Chunk Size:** ~34.7 KB (excluding CSS)
- **CSS Bundle:** 99.32 KB (`000f56888738a101.css`)

### Routes Overview

All 22 routes are prerendered as static content:

- **High-traffic / critical (10+ routes):**  
  `/`, `/quiz`, `/quiz/step1-favorites`, `/quiz/step2-disliked`, `/quiz/step3-allergy`, `/login`, `/register`, `/dashboard`, `/profile`, `/results`, `/pricing`
- **Medium traffic:**  
  `/faq`, `/feedback`, `/notifications`, `/settings`, `/pricing/success`
- **Low traffic / support:**  
  `/about`, `/privacy`, `/_not-found`, `/sitemap.xml`, `/test-header`, `/test-input`

**Key Point:** Route-level sizes are not directly output by Turbopack; all routes share large shared/vendor chunks.

### Top 10 Largest Client Chunks

| Rank | Chunk | Size (KB) | Type | Notes |
|------|-------|-----------|------|-------|
| 1 | `bf3998032f1c986e.js` | 218.69 | Shared | React/Next core + major shared UI + part of `framer-motion` / Radix |
| 2 | `f2a86efe9c48190d.js` | 111.63 | Shared | Results grid, quiz flow, gated/upsell components |
| 3 | `a6dad97d9634a72d.js` | 109.96 | Polyfill | Browser polyfills (all routes) |
| 4 | `1b1107ada0a83f0e.js` | 108.69 | Shared | Layout + landing UI (Hero, CTA, FAQ, marketing) |
| 5 | `000f56888738a101.css` | 99.32 | CSS | Global Tailwind/CSS styles |
| 6 | `2c04281adb4d4c51.js` | 83.88 | Page/Shared | Feature chunk (results/quiz/dashboard mix) |
| 7 | `74ef24011fad5e25.js` | 59.25 | Page/Shared | Feature chunk |
| 8 | `8c029294fd197b8a.js` | 55.79 | Page/Shared | Feature chunk |
| 9 | `ff57af7c31cc8c85.js` | 41.29 | Page/Shared | Feature chunk |
| 10 | `53887e1ef227fa63.js` | 32.92 | Shared | Shared utilities/context |

**Key Findings:**
1. **4 chunks >100 KB** (~549 KB) are dominated by shared vendor/framework code (React/Next, `framer-motion`, Radix, icons).
2. **Polyfills (110 KB)** are still included for all browsers; there may be savings from modern browser targeting.
3. **Feature chunks (50–85 KB)** serve results, quiz, dashboard, etc., but still always couple with the large shared chunks.
4. **Initial shared JS (root main files)**:
   - `c70f03dbebe79848.js` – 2.84 KB
   - `731808a65790ac6c.js` – 29.43 KB
   - `1b1107ada0a83f0e.js` – 108.69 KB
   - `bf3998032f1c986e.js` – 218.69 KB
   - `53887e1ef227fa63.js` – 32.92 KB
   - `turbopack-1aee6371775c3860.js` – 10.42 KB  
   → **Estimated initial JS (excluding CSS/polyfills): ~403 KB**, plus ~110 KB polyfills and ~100 KB CSS.

### Heavy Dependencies (Client-Facing)

From `package.json` + code usage:

| Package | Est. Size | Usage | Splitting Candidate? |
|---------|-----------|-------|----------------------|
| `framer-motion` | ~150 KB | 20+ files (landing, quiz, results, feedback, profile, charts) | ✅ Yes (switch to `/m`, reduce usage) |
| `@sentry/nextjs` | ~175–200 KB | Global monitoring (via config) | ✅ Yes (lazy/deferred init) |
| `posthog-js` | ~100 KB | Analytics | ✅ Already dynamic import; can defer further |
| `@radix-ui/*` | ~200–300 KB total | UI primitives (tooltip, dialog, dropdown, etc.) | ⚠️ Partial candidate (per-component splitting) |
| `lucide-react` | ~80 KB | Icons across app | ⚠️ Partial (ensure tree-shaking, per-icon imports) |
| `next-auth` | ~100 KB | Authentication flows | ⚠️ Keep, but ensure only on auth routes |

**Conclusion:** The main win is **reducing what enters the global shared chunks**, especially `framer-motion` and Sentry, and then lazily loading route-specific heavy UIs.

---

## 🔍 Part 2: Component Inventory (What to Split)

> **Source:** `component_inventory.md` (Task 2, ~25 minutes)

### Components Analyzed

- **Large components (>100 lines):** 15
- **Total candidates (P0/P1/P2):** 14 components
- **Heavy dependencies touched:** `framer-motion`, `@sentry/nextjs` (config-level), `posthog-js`

### Top 15 Largest Components (by LOC)

| # | Component | Path | Lines | Est. Size | Routes | Priority |
|---|-----------|------|-------|-----------|--------|----------|
| 1 | ResultsPage (gated) | `app/results/page.tsx` | ~401 | ~35–40 KB | `/results` | P0 |
| 2 | Step3Allergy | `components/quiz/Step3Allergy.tsx` | ~274 | ~22–27 KB | `/quiz/step3-allergy` | P0 |
| 3 | Quiz Step2 | `app/quiz/step2-disliked/page.tsx` | ~272 | ~22–27 KB | `/quiz/step2-disliked` | P0 |
| 4 | Quiz Step1 | `app/quiz/step1-favorites/page.tsx` | ~255 | ~20–25 KB | `/quiz/step1-favorites` | P0 |
| 5 | FeedbackPage | `app/feedback/page.tsx` | ~248 | ~20–24 KB | `/feedback` | P0 |
| 6 | PerfumeTimeline | `components/ui/PerfumeTimeline.tsx` | ~215 | ~18–22 KB | (future results/dashboard) | P1 |
| 7 | MobileFilterModal | `components/ui/MobileFilterModal.tsx` | ~214 | ~18–22 KB | `/results` (mobile only) | P2 |
| 8 | Dashboard | `app/dashboard/page.tsx` | ~202 | ~17–20 KB | `/dashboard` | P1 (vendor-focused) |
| 9 | AdminModal | `components/AdminModal.tsx` | ~200 | ~16–19 KB | `/feedback` (admin only) | P2 |
|10 | ResultsContent | `components/results/ResultsContent.tsx` | ~198 | ~16–19 KB | `/results` (legacy/partial) | P1 |
|11 | ProfilePage | `app/profile/page.tsx` | ~160 | ~13–16 KB | `/profile` | P1 |
|12 | RadarChart | `components/ui/RadarChart.tsx` | ~151 | ~12–15 KB | `/dashboard` | P1 (already lazy) |
|13 | PerfumeCard | `components/ui/PerfumeCard.tsx` | ~147 | ~12–14 KB | `/results` + grids | P2 |
|14 | PriceComparisonTable | `components/ui/PriceComparisonTable.tsx` | ~144 | ~11–14 KB | `/results` (Premium) | P1 |
|15 | HeroSection | `components/landing/HeroSection.tsx` | ~127 | ~10–12 KB | `/` | P0 |

### P0: High-Priority, High-ROI Components

**Summary (from inventory + priority matrix):**
- **Components:** `ResultsPage`, `Step3Allergy`, `Quiz Step1`, `Quiz Step2`, `FeedbackPage`, `HeroSection`
- **Total Savings (P0 only):** ~115–160 KB
- **Effort:** ~12–16 hours

**Key Patterns:**
- Large **route-specific pages** where heavy below-fold sections and optional features are bundled into the main chunk.
- `framer-motion` usage that can either be simplified or moved to the lighter `/m` entrypoint.

### P1: Medium-Priority Components

**Components:**
- `PriceComparisonTable` (`/results`, Premium-only, below-fold)
- `PerfumeTimeline` (future results/dashboard usage)
- `ResultsContent` (legacy/partial results content)
- `ProfilePage` (`/profile`)

**Total P1 Savings:** ~50–65 KB  
**Total P1 Effort:** ~6–7 hours

### P2: Low-Priority / Already Optimized

**Components:**
- `MobileFilterModal` (already dynamic, mobile-only)
- `AdminModal` (already dynamic, admin-only)
- `PerfumeCard` (core shared card, should stay shared)
- `TestimonialsCarousel` (marketing; good candidate but smaller impact)

**Total P2 Savings:** ~15–25 KB  
**Total P2 Effort:** ~8–10 hours  
**Reason for P2:** Either already lazily loaded or risk of over-splitting with little gain.

### Heavy Dependency Deep Dive (from inventory)

**`framer-motion` (~150 KB estimated):**
- **Used in (~20+ files):**
  - Landing: `HeroSection`, `QuestionsSection`, `CTASection`, `TestimonialsCarousel`
  - App pages: profile, dashboard, feedback, FAQ, privacy, about, pricing/success, pricing, results
  - Components: `RadarChart`, `button`, `TestHistory`, `SpeedometerGauge`, `ShareButton`, `FeedbackModal`, `FeedbackCard`, `PriceComparisonTable`, `PerfumeTimeline`, `SymptomCard`, `Step3Allergy`, `ResultsContent`, `UpsellCard`
- **Strategy:**
  - Use **`framer-motion/m`** where only `motion`/`AnimatePresence` is needed.
  - Remove framer-motion entirely on low-traffic informational pages where CSS transitions suffice.
  - Lazy-load below-fold motion-heavy widgets (testimonials, timeline, etc.).

**`@sentry/nextjs` (~175–200 KB):**
- Integrated via Next.js config; not visible in `src` imports.
- Likely included in global client bundle.
- Strategy is to **defer client SDK initialization** via a small client bootstrap component.

**`posthog-js` (~100 KB):**
- Already dynamically imported in `posthog-client`.
- We will additionally **defer initialization** to browser idle time (`requestIdleCallback` or timeout) to avoid contention.

---

## 🎯 Part 3: Priority Matrix & ROI Analysis

> **Source:** `priority_matrix.md` (Task 3, ~20 minutes)

### ROI Methodology

**Impact Formula:**
```text
Impact = (Size Weight × 0.4) + (Route Weight × 0.3) + (User Weight × 0.3)

Where:
- Size Weight = min(KB saved / 100, 10)
- Route Weight: High = 10, Medium = 7, Low = 4
- User Weight: All = 10, Authenticated = 7, Few = 4
```

**ROI Formula:**
```text
ROI = Impact / Effort

Effort Score:
1 = <1 hour
2 = 1–2 hours
3 = 2–4 hours
4 = 4–8 hours
5 = 1–2 days
```

### Impact Scores (from matrix)

| Component | Savings (KB) | Route Traffic | User Scope | Impact |
|-----------|--------------|---------------|------------|--------|
| ResultsPage | ~50 | High | Auth | 5.30 |
| Step3Allergy | ~22 | High | All | 6.09 |
| Quiz Step1 | ~17 | High | All | 6.07 |
| Quiz Step2 | ~17 | High | All | 6.07 |
| FeedbackPage | ~17 | Medium | Few | 3.37 |
| HeroSection | ~12 | High | All | 6.05 |
| PriceComparisonTable | ~12 | High | Auth (Premium) | 5.15 |
| PerfumeTimeline | ~17 | Medium | Few | 3.37 |
| ResultsContent | ~17 | High | Auth | 5.17 |
| ProfilePage | ~9 | High | Auth | 5.14 |
| MobileFilterModal | ~3 | Medium | Few | 3.39 |
| AdminModal | ~2 | Low | Few | 2.41 |
| PerfumeCard | ~5 | High | Auth | 5.15 |
| TestimonialsCarousel | ~11 | Medium | Few | 3.41 |
| Sentry defer init | ~175 | High | All | 10.00 |
| PostHog extra defer | ~7 | High | All | 6.07 |
| framer-motion/m | ~100 | High | All | 10.00 |

### Effort Scores (from matrix)

| Component | Effort | Notes |
|-----------|--------|-------|
| ResultsPage | 3 | Multi-subsection refactor, gating tweaks |
| Step3Allergy | 2 | Add `dynamic` + loading skeleton |
| Quiz Step1 | 3 | Extract and lazy-load selected list |
| Quiz Step2 | 3 | Same as Step1, shared component |
| FeedbackPage | 2 | `framer-motion/m` + minor tweaks |
| HeroSection | 3 | Animation simplification + `/m` |
| PriceComparisonTable | 1 | Simple `dynamic` import |
| PerfumeTimeline | 2 | Dynamic where used |
| ResultsContent | 2 | Lazy section in results |
| ProfilePage | 2 | Optional lazy sections |
| MobileFilterModal | 2 | Already lazy; small tweaks only |
| AdminModal | 2 | Already lazy; little to gain |
| PerfumeCard | 4 | Complex shared UI; not ideal to split |
| TestimonialsCarousel | 2 | Dynamic import in marketing |
| Sentry defer init | 3 | Client bootstrap + config |
| PostHog extra defer | 2 | Wrap in idle/timeout |
| framer-motion/m | 5 | Cross-cutting import changes, regression risk |

### Complete ROI Ranking

| Rank | Item | Impact | Effort | ROI | Category |
|------|------|--------|--------|-----|----------|
| 1 | PriceComparisonTable | 5.15 | 1 | **5.15** | Must Do |
| 2 | Sentry defer init | 10.00 | 3 | **3.33** | Must Do |
| 3 | Step3Allergy | 6.09 | 2 | **3.05** | Must Do |
| 4 | PostHog extra defer | 6.07 | 2 | **3.04** | Must Do |
| 5 | ResultsContent | 5.17 | 2 | 2.59 | Should Do |
| 6 | ProfilePage | 5.14 | 2 | 2.57 | Should Do |
| 7 | Quiz Step1 | 6.07 | 3 | 2.02 | Should Do |
| 8 | Quiz Step2 | 6.07 | 3 | 2.02 | Should Do |
| 9 | HeroSection | 6.05 | 3 | 2.02 | Should Do |
|10 | framer-motion/m | 10.00 | 5 | 2.00 | Should Do |
|11 | ResultsPage | 5.30 | 3 | 1.77 | Consider |
|12 | TestimonialsCarousel | 3.41 | 2 | 1.71 | Consider |
|13 | MobileFilterModal | 3.39 | 2 | 1.70 | Consider |
|14 | FeedbackPage | 3.37 | 2 | 1.69 | Consider |
|15 | PerfumeTimeline | 3.37 | 2 | 1.69 | Consider |
|16 | PerfumeCard | 5.15 | 4 | 1.29 | Consider |
|17 | AdminModal | 2.41 | 2 | 1.21 | Consider |

### ROI Buckets

- **Must Do (ROI > 3.0):** 4 items  
  - Total impact: ~216 KB (12 + 175 + 22 + 7)  
  - Total effort: ~8 hours  
  - Average ROI: ~3.6  

- **Should Do (ROI 2.0–3.0):** 6 items  
  - Total impact: ~170–200 KB  
  - Total effort: ~17 hours  
  - Average ROI: ~2.2–2.5  

- **Consider (ROI 1.0–2.0):** 7 items  
  - Total impact: ~95–120 KB  
  - Total effort: ~17 hours  
  - Average ROI: ~1.5–1.8  

- **Skip (ROI < 1.0):** 0 items  

---

## 🗓️ Part 4: Implementation Roadmap (3 Weeks)

This roadmap is **implementation-ready**: each week has specific tasks, code patterns, and success criteria.

### Week 1: Quick Wins (Must Do)

**Goal:** Maximum ROI with minimum risk  
**Target:** ~200–220 KB reduction  
**Time Budget:** 6–8 hours  

#### Items

| Priority | Item | ROI | Effort | Impact (KB) | Type |
|----------|------|-----|--------|-------------|------|
| 1 | PriceComparisonTable | 5.15 | 1h | ~12 | Component split |
| 2 | Sentry defer init | 3.33 | 3h | ~175 | Dependency defer |
| 3 | Step3Allergy | 3.05 | 2h | ~22 | Component split |
| 4 | PostHog extra defer | 3.04 | 2h | ~7 | Dependency defer |

#### 1. PriceComparisonTable – Dynamic, Below-Fold, Tier-Gated

**Context:**  
- Component: `src/components/ui/PriceComparisonTable.tsx`  
- Used only on `/results`, and only for **Premium** users, and only when price data is available. It is strictly below the initial viewport.

**Implementation (in `app/results/page.tsx` or equivalent):**
```typescript
import dynamic from 'next/dynamic'

const PriceComparisonTable = dynamic(
  () => import('@/components/ui/PriceComparisonTable').then(m => m.PriceComparisonTable),
  {
    ssr: false,
    loading: () => (
      <div className="h-[200px] w-full animate-pulse rounded-lg bg-muted" />
    ),
  },
)

// ...
{user?.tier === 'premium' && perfume.priceComparison && (
  <section aria-label="Price comparison" className="mt-6">
    <PriceComparisonTable data={perfume.priceComparison} />
  </section>
)}
```

**Notes:**
- This guarantees the heavy comparison UI only loads for Premium users.
- The skeleton reserves space to avoid CLS.

#### 2. Sentry Defer – Client SDK Initialization After Load

**Context:**  
- `@sentry/nextjs` is in dependencies and likely integrated globally; we want to keep server-side error tracking intact but **defer client bundle cost**.

**Implementation:**

Create `src/lib/SentryClientInit.tsx`:
```typescript
'use client'

import { useEffect } from 'react'

export function SentryClientInit() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return

    const onLoad = () => {
      import('@sentry/nextjs').then((Sentry) => {
        Sentry.init({
          // Reuse your existing Sentry config here
          dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
          tracesSampleRate: 0.2,
          replaysSessionSampleRate: 0.0,
          replaysOnErrorSampleRate: 1.0,
        })
      })
    }

    if (document.readyState === 'complete') {
      onLoad()
    } else {
      window.addEventListener('load', onLoad, { once: true })
    }
  }, [])

  return null
}
```

Wire it in `app/layout.tsx` (root client shell or in a `ClientProviders` wrapper):
```typescript
// app/layout.tsx
import type { ReactNode } from 'react'
import { SentryClientInit } from '@/lib/SentryClientInit'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* other providers */}
        {children}
        <SentryClientInit />
      </body>
    </html>
  )
}
```

**Result:** Sentry client bundle loads **after** the page has finished loading, removing ~175 KB from the critical path.

#### 3. Step3Allergy – Route-Level Dynamic Import

**Context:**  
- Component: `src/components/quiz/Step3Allergy.tsx` (~274 lines, `framer-motion` heavy).
- Route: `/quiz/step3-allergy`.
- Only relevant after user completes steps 1 and 2.

**Implementation in `app/quiz/step3-allergy/page.tsx`:**
```typescript
import dynamic from 'next/dynamic'

const Step3Allergy = dynamic(
  () =>
    import('@/components/quiz/Step3Allergy').then((m) => ({
      default: m.Step3Allergy,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    ),
  },
)

export default function Step3AllergyPage() {
  return <Step3Allergy />
}
```

#### 4. PostHog – Idle-Time Defer

**Context:**  
- `posthog-js` is already dynamically imported in `src/lib/posthog-client.ts`.
- We want to ensure it only initializes when the browser is idle.

**Implementation (update `posthog-client.ts`):**
```typescript
let posthog: any = null

async function initPosthogReal() {
  if (posthog) return
  const mod = await import('posthog-js')
  posthog = mod.default
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY ?? '', {
    api_host: 'https://app.posthog.com',
  })
}

export function initPosthogSafely() {
  if (typeof window === 'undefined') return
  if ('requestIdleCallback' in window) {
    ;(window as any).requestIdleCallback(() => {
      void initPosthogReal()
    })
  } else {
    setTimeout(() => {
      void initPosthogReal()
    }, 2000)
  }
}
```

**Week 1 Deliverables:**
- [ ] `PriceComparisonTable` lazy-loaded and gated.
- [ ] `Step3Allergy` route dynamically imports the heavy component.
- [ ] PostHog initialization deferred to idle.
- [ ] Sentry client initialization deferred to post-load in production.
- [ ] Production-like build run with bundle diff reported.
- [ ] Lighthouse (mobile) run before/after with metrics captured.

**Week 1 Success Criteria:**
- **Bundle reduction:** ≥ 200 KB.
- **FCP change:** improved or unchanged (no regressions).
- **No functional regressions** in `/results`, `/quiz`, analytics, or error logging.

---

### Week 2: High-Impact Components (Should Do)

**Goal:** Tackle medium-complexity components on critical routes.  
**Target:** +75–100 KB reduction (cumulative ≈300 KB).  
**Time Budget:** 10–12 hours.

#### Items

| Priority | Item | ROI | Effort | Impact (KB) | Type |
|----------|------|-----|--------|-------------|------|
| 5 | ResultsContent | 2.59 | 2h | ~17 | Component split |
| 6 | ProfilePage | 2.57 | 2h | ~9 | Component split |
| 7 | Quiz Step1 | 2.02 | 3h | ~17 | Component split |
| 8 | Quiz Step2 | 2.02 | 3h | ~17 | Component split |
| 9 | HeroSection | 2.02 | 3h | ~12 | Vendor/animation tuning |

#### 5. ResultsContent – Sub-Section Lazy Load

**Context:**  
- `components/results/ResultsContent.tsx` (~198 lines) is or was used as the main results grid content.

**Pattern:** Lazy-load `ResultsContent` inside `ResultsPage` after gating logic:
```typescript
const ResultsContent = dynamic(
  () => import('@/components/results/ResultsContent').then((m) => m.ResultsContent),
  {
    ssr: false,
    loading: () => (
      <div className="mt-8 space-y-4">
        <div className="h-6 w-40 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    ),
  },
)
```

#### 6. ProfilePage – Optional Sections

Split advanced sections (e.g., preference history, advanced settings) into lazy-loaded components, using Pattern 1 (route-specific lazy loading) with skeletons.

#### 7–8. Quiz Step1 & Step2 – Selected List Below-Fold

Create a shared `SelectedPerfumeList` component and load it dynamically:
```typescript
const SelectedPerfumeList = dynamic(
  () => import('@/components/quiz/SelectedPerfumeList'),
  {
    ssr: false,
    loading: () => (
      <div className="mt-6 h-32 animate-pulse rounded-lg bg-muted" />
    ),
  },
)

{selectedPerfumes.length > 0 && (
  <SelectedPerfumeList
    perfumes={selectedPerfumes}
    onRemove={handleRemovePerfume}
  />
)}
```

#### 9. HeroSection – framer-motion/m + Simpler Animations

- Replace:
  ```typescript
  import { motion, useMotionValue, useTransform } from 'framer-motion'
  ```
  with:
  ```typescript
  import { m as motion, useMotionValue, useTransform } from 'framer-motion/m'
  ```
- Reduce particle counts / keyframe complexity to keep CPU and bundle footprint reasonable while preserving “wow” factor.

**Week 2 Deliverables:**
- [ ] `ResultsContent` lazy-loaded from `ResultsPage` (or confirmed unused and removed).
- [ ] `ProfilePage` split into lazy sub-sections where beneficial.
- [ ] Quiz Steps 1 & 2 use a shared dynamically imported `SelectedPerfumeList`.
- [ ] `HeroSection` uses `framer-motion/m` and simplified animations.
- [ ] Regression tests and Lighthouse runs updated.

**Week 2 Success Criteria:**
- **Cumulative reduction:** ≥ 275–300 KB vs baseline.
- **FCP:** trending towards ~1.6s (mobile).
- **LCP:** trending towards ~2.0s or better.
- **No UX regressions** in quiz or results flows.

---

### Week 3: Vendor Tuning & Long-Tail Items (Consider + framer-motion/m)

**Goal:** Finish vendor optimizations and long-tail components.  
**Target:** Additional ~120–150 KB (cumulative ~415 KB).  
**Time Budget:** 10–14 hours.

#### Items

| Priority | Item | ROI | Effort | Impact (KB) | Type |
|----------|------|-----|--------|-------------|------|
| 10 | framer-motion/m adoption | 2.00 | 5h | ~100 | Vendor refactor |
| 11 | ResultsPage optional sections | 1.77 | 3h | ~50 | Component splits |
| 12 | FeedbackPage | 1.69 | 2h | ~17 | Vendor tuning |
| 13 | PerfumeTimeline (if used) | 1.69 | 2h | ~17 | Lazy widget |
| 14 | TestimonialsCarousel | 1.71 | 2h | ~11 | Lazy widget |

#### 10. Global framer-motion/m Refactor

**Steps:**
1. Search for `from 'framer-motion'`.
2. For simple usages (motion + AnimatePresence, no advanced layout/drag features):
   ```typescript
   // Before
   import { motion, AnimatePresence } from 'framer-motion'

   // After
   import { m as motion, AnimatePresence } from 'framer-motion/m'
   ```
3. For complex usages (drag, layout, scroll-based features), either:
   - Keep using `framer-motion`, or
   - Isolate in a small dynamically imported subcomponent.

#### 11–14. Remaining Component Splits

- `ResultsPage`: lazy-load **blurred teasers**, **upsell cards**, or **secondary recommendations** using below-fold and conditional patterns.
- `FeedbackPage`: move decorative animations to `/m` and consider dynamic import for lower-priority pieces.
- `PerfumeTimeline` & `TestimonialsCarousel`: only load when scrolled into view on marketing or results pages.

**Week 3 Deliverables:**
- [ ] `framer-motion/m` adopted where applicable.
- [ ] Optional sections of results and marketing widgets lazily loaded.
- [ ] Monitoring (Core Web Vitals / Lighthouse CI) enabled and green.

**Week 3 Success Criteria:**
- **Cumulative savings:** ≥ 400 KB (≈30% of original client bundle).
- **FCP:** ~1.4s or better.
- **LCP:** ~1.8–2.0s or better.
- **Client bundle size:** < 1.0 MB (gzipped) with initial JS ~250–350 KB.

---

## ⚠️ Part 5: Risk Assessment & Mitigation

### Implementation Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Lazy components break due to missing props/context | Medium | High | Add integration tests; keep logic in same module when possible; use TypeScript strictly |
| CLS from loading states/skeletons | Medium | Medium | Use fixed heights, aspect ratios, reserved space; test on mobile with slow 3G |
| Sentry/PostHog initialization failures | Low | High | Wrap with try/catch; preserve server-side logging; monitor error rates after release |
| Over-splitting → request waterfalls | Low | Medium | Prefer splitting by logical sections, not per-button; use `next/dynamic` prefetch and intersection observer for anticipatory loads |
| framer-motion/m incompatibilities | Low | High | Start with low-risk components; regression test animations; keep fallback imports for complex cases |

### Rollback Plan

**If performance or stability regresses:**
1. **Immediate:**
   - Revert the last feature branch deploy (e.g., via Vercel or CI rollback).
   - Turn off any new feature flags related to lazy loads.
2. **Diagnosis:**
   - Inspect Lighthouse/CWV trends before/after.
   - Review error logs (Sentry) for new client exceptions.
   - Reproduce flows on `/`, `/quiz`, `/results`, `/dashboard`, `/feedback`.
3. **Fix & Redeploy:**
   - Reintroduce critical components as eager imports if necessary.
   - Reduce scope of vendor refactor (e.g., revert `/m` only on problematic pages).
   - Re-deploy and monitor again.

**Monitoring Triggers:**
- FCP **increase > 100 ms** vs baseline → investigate.
- LCP **increase > 200 ms** → investigate / possible rollback.
- CLS **increase > 0.05** → rollback UI changes immediately.
- Error rate **increase > 1%** (client errors/session) → rollback Sentry/PostHog changes.

---

## 📈 Part 6: Expected Performance Impact (Before/After)

### Baseline (From Bundle Analysis)

```text
Client bundle: 1.36 MB
Server bundle: 30.69 MB
Initial load JS: ~600–700 KB (incl. shared chunks + polyfills)
FCP: ~2.0 s (3G, estimated)
LCP: ~2.5 s (3G, estimated)
CLS: Unknown (assumed acceptable)
```

### After Week 1 (Must Do)

```text
Client bundle: ~1.14 MB (−220 KB, −16%)
Initial load JS: ~400–500 KB
FCP: ~1.8 s (−200 ms, −10%)
LCP: ~2.2 s (−300 ms, −12%)
```

### After Week 2 (Must Do + Should Do)

```text
Client bundle: ~1.06 MB (−300 KB, −22%)
Initial load JS: ~350–450 KB
FCP: ~1.6 s (−400 ms, −20%)
LCP: ~2.0 s (−500 ms, −20%)
```

### After Week 3 (Full Plan)

```text
Client bundle: ~0.95 MB (−415 KB, −30%)
Initial load JS: ~250–350 KB
FCP: ~1.4 s (−600 ms, −30%)
LCP: ~1.8 s (−700 ms, −28%)
```

**Notes:**
- Estimates assume gzipped transfer over ~750 KB/s 3G-equivalent link.
- Real improvements depend on caching, hardware, and network conditions.
- CLS is expected to stay stable or improve with disciplined skeletons and reserved space.

---

## ✅ Part 7: Success Metrics & KPIs

### Quantitative Metrics

**Bundle Size:**
- **Target:** Client bundle < 1.0 MB; initial JS < 400 KB.
- **Stretch:** Client bundle < 0.95 MB; initial JS < 300 KB.
- **Minimum Success:** ≥ 300 KB reduction vs 1.36 MB baseline.

**Core Web Vitals (Real User Monitoring):**
- **FCP:** < 1.5 s (Good) on mobile.
- **LCP:** < 2.5 s (Good) on mobile.
- **CLS:** < 0.1 (Good).
- **TTI:** < 3.5 s; **TBT:** < 200 ms in Lighthouse.

**Synthetic (Lighthouse):**
- Performance (Mobile): > 90.
- Performance (Desktop): > 95.

### Qualitative Metrics

**User Experience:**
- [ ] Users perceive faster loading on `/` and `/results`.
- [ ] Quiz flow remains smooth with no “flashy” jumps when steps load.
- [ ] No loss of functionality in results, profile, or dashboard.
- [ ] No new visual glitches or layout jumps due to skeletons.

**Developer Experience:**
- [ ] Clear, repeatable patterns for adding new lazy-loaded sections.
- [ ] CI enforces bundle size budgets.
- [ ] Docs exist for when to use `dynamic`, below-fold patterns, and `/m`.

---

## 🚀 Part 8: Implementation Handoff

### Prerequisites (Before Week 1)

- [ ] Review this strategy document as a team.
- [ ] Baseline metrics: Lighthouse reports for `/`, `/quiz`, `/results`, `/dashboard`.
- [ ] Set up bundle size tracking (e.g., `bundlesize` or `next-bundle-analyzer` in CI).
- [ ] Set up Lighthouse CI in GitHub Actions.
- [ ] Create feature branch: `feat/code-splitting-week1`.
- [ ] Align on rollback procedure and monitoring dashboards.

### Per-Component Checklist

For **each** component/feature you split:
1. [ ] Confirm it is a good candidate (below-fold, conditional, or route-specific).
2. [ ] Add a loading skeleton with fixed height/space.
3. [ ] Implement `next/dynamic` (with `ssr: false` where appropriate).
4. [ ] Add error handling (error boundary or fallback UI if needed).
5. [ ] Test slow 3G in dev tools for loading transitions.
6. [ ] Update or add unit/integration tests (mock dynamic imports).
7. [ ] Run `npm run build` and capture bundle diff.
8. [ ] Run Lighthouse (mobile) on key routes; document scores.
9. [ ] Write a concise PR description including KB savings and screenshots.
10. [ ] Get review from at least one other engineer.

### Daily Progress Template

```text
Code Splitting Progress – Day X
✅ Completed: [Component/Task] – ~[N] KB reduction
🔄 In Progress: [Component/Task] – ETA [hours]
⏳ Blocked: [Issue] – Owner: [Name]
📊 Metrics: Total reduction so far: [N] KB; Current FCP/LCP snapshots
```

### Weekly Review

End of each week:
- Run full Lighthouse suite (mobile + desktop).
- Capture bundle size (client, initial chunks) vs baseline.
- Review Core Web Vitals in production (if enough traffic).
- Demo key flows: `/`, `/quiz`, `/results`, `/dashboard`, `/feedback`.
- Decide whether to move to next week’s items or stabilize further.

---

## 📋 Part 9: Implementation Patterns (Reference)

These patterns come directly from `component_inventory.md` and are the **standard playbook** for future code splitting.

### Pattern 1: Route-Specific Lazy Loading

**Use case:** Component only used on a single route (e.g., `Step3Allergy`, `PerfumeTimeline` widget).

```typescript
// Before
import { Step3Allergy } from '@/components/quiz/Step3Allergy'

// After
import dynamic from 'next/dynamic'

const Step3Allergy = dynamic(
  () => import('@/components/quiz/Step3Allergy').then((m) => m.Step3Allergy),
  {
    ssr: false,
    loading: () => <div className="min-h-[300px]" />,
  },
)
```

### Pattern 2: Below-Fold Lazy Loading (Scroll-Based)

**Use case:** Heavy sections not visible on initial render (selected lists, additional insights, testimonials).

```typescript
import dynamic from 'next/dynamic'
import { useInView } from 'react-intersection-observer'

const BelowFoldSection = dynamic(
  () => import('./BelowFoldSection'),
  { ssr: false },
)

export function Page() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px',
  })

  return (
    <div>
      {/* Above-fold content */}
      <div ref={ref} />
      {inView && <BelowFoldSection />}
    </div>
  )
}
```

### Pattern 3: Conditional / Tier-Based Loading

**Use case:** Premium, admin, or feature-flagged content (PriceComparisonTable, AdminModal, Upsell).

```typescript
const AdminModal = dynamic(
  () => import('@/components/AdminModal'),
  { ssr: false },
)

function FeedbackPage() {
  const isAdmin = /* ... */
  const [open, setOpen] = useState(false)

  return (
    <>
      {isAdmin && (
        <button onClick={() => setOpen(true)}>Open Admin Panel</button>
      )}
      {isAdmin && open && (
        <AdminModal onClose={() => setOpen(false)} />
      )}
    </>
  )
}
```

### Pattern 4: Deferred Third-Party Scripts (Analytics/Monitoring)

**Use case:** Sentry, PostHog, additional analytics, chat widgets, etc.

```typescript
'use client'

import { useEffect } from 'react'

export function DeferredThirdParty() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const load = () => {
      if ('requestIdleCallback' in window) {
        ;(window as any).requestIdleCallback(() => {
          import('third-party-sdk').then((sdk) => {
            sdk.init({ /* config */ })
          })
        })
      } else {
        setTimeout(() => {
          import('third-party-sdk').then((sdk) => {
            sdk.init({ /* config */ })
          })
        }, 2000)
      }
    }

    if (document.readyState === 'complete') {
      load()
    } else {
      window.addEventListener('load', load, { once: true })
    }
  }, [])

  return null
}
```

### Pattern 5: framer-motion Tree-Shaking

**Use case:** Any component using only basic `motion`/`AnimatePresence`.

```typescript
// Before
import { motion, AnimatePresence } from 'framer-motion'

// After
import { m as motion, AnimatePresence } from 'framer-motion/m'
```

---

## 📚 Part 10: Appendices

### Appendix A: ROI Calculation Example – PriceComparisonTable

**Inputs:**
- Size saved: 12 KB → Size weight = 0.12.
- Route: `/results` (High traffic among authenticated) → Route weight = 10.
- Users: Premium tier subset (Auth, not all) → User weight = 7.

**Impact:**
```text
Impact = (0.12 × 0.4) + (10 × 0.3) + (7 × 0.3)
       = 0.048 + 3 + 2.1
       ≈ 5.15
```

**Effort:**
- Dynamic import + skeleton + tests ≈ 1 hour → Effort = 1.

**ROI:**
```text
ROI = 5.15 / 1 = 5.15
```

### Appendix B: Bundle Analysis Raw Highlights

From `bundle_analysis.md`:
- Total client chunks: 40 (JS + 1 CSS).
- Total client size: 1.36 MB.
- Largest chunk: `bf3998032f1c986e.js` – 218.69 KB.
- Four chunks >100 KB: total ~549 KB.
- Polyfills: `a6dad97d9634a72d.js` – 109.96 KB.
- Server bundle: 30.69 MB (dominated by `@prisma/client` and server logic).

### Appendix C: Component Inventory Raw Highlights

From `component_inventory.md`:
- Largest files:
  - `results/page.tsx`: ~401 LOC (~35–40 KB).
  - `Step3Allergy.tsx`: ~274 LOC (~22–27 KB).
  - Quiz steps and feedback: ~248–272 LOC each.
- `framer-motion` used in ~20+ files; main optimization lever.
- `PostHog` already dynamically imported; minimal further gains.

### Appendix D: Monitoring & Tools Setup

**Lighthouse CI (GitHub Actions) Example:**

```yaml
name: Lighthouse CI

on:
  pull_request:
    branches: [ main ]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - run: npm run start -- --port=3000 &
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/quiz
            http://localhost:3000/results
            http://localhost:3000/dashboard
          budgetPath: ./lighthouse-budget.json
```

**Bundle Size Tracking (example using `bundlesize`):**

```json
{
  "bundlesize": [
    {
      "path": ".next/static/chunks/*.js",
      "maxSize": "220 kB"
    }
  ]
}
```

**Performance Monitoring Options:**
- Next.js / Vercel Analytics (Web Vitals).
- Google Analytics + `web-vitals` integration.
- PostHog user timing events for FCP/LCP proxies.

---

## 🎯 Final Checklist

- [x] Bundle analysis included (Task 1 data).
- [x] Component inventory included (Task 2 data).
- [x] Priority matrix and ROI rankings included (Task 3).
- [x] 3-week roadmap with concrete steps and code examples.
- [x] Risk assessment and rollback plan documented.
- [x] Before/after performance estimates described.
- [x] Implementation patterns and reference snippets added.
- [x] Handoff and monitoring setup instructions included.
- [x] Document is **standalone** – no external files needed for context.

---

## 📞 Support & Questions

- **Technical lead:** [Name]  
- **Project manager:** [Name]  
- **Slack channel:** `#code-splitting-optimization`

**How to give feedback:**
- Comment directly in this document.
- Open Git issues tagged `perf:code-splitting`.
- Raise suggestions in the next retrospective.

---

**Strategy Status:** ✅ Ready for Implementation  
**Next Action:** Review with team → Start Week 1 (PriceComparisonTable + Sentry defer + Step3Allergy + PostHog idle defer)

**Estimated Timeline:**
- Week 1 start: [Fill in start date]  
- Week 2 start: [Week 1 start + 7 days]  
- Week 3 start: [Week 1 start + 14 days]  
- Final review: [Week 1 start + 21 days]  

---

**Document Version:** 1.0  
**Last Updated:** January 29, 2026  
**Total Length:** ~100–150 KB (strategy + references)

