# Results Page — Complete Dependency Analysis

## STEP 1: Component Tree

```
page.tsx (src/app/[locale]/results/page.tsx)
  ├── imports from: next, next-intl/server, @/components/results/ResultsContent
  └── renders: ResultsContent

ResultsContent (src/components/results/ResultsContent.tsx)
  ├── imports from: react, framer-motion, lucide-react, next-intl, @/components/ui/button, @/contexts/QuizContext,
  │                 @/lib/matching (ScoredPerfume), @/lib/utils/api-helpers (safeFetch), @/components/ui/UpsellCard,
  │                 @/components/ui/BackButton, @/components/results/CompareBottomSheet, @/components/results/IngredientsSheet,
  │                 @/components/results/MatchSheet, @/components/results/ResultsGrid, @/lib/logger
  └── renders: BackButton, motion.div (hero, compare bar), ResultsGrid, IngredientsSheet (conditional),
                MatchSheet (conditional), CompareBottomSheet, UpsellCard (conditional)

ResultsGrid (src/components/results/ResultsGrid.tsx)
  ├── imports from: framer-motion, @/components/ui/PerfumeCard, @/components/ui/UpsellCard, @/components/ui/BlurredTeaserCard,
  │                 @/lib/matching (ScoredPerfume), @/lib/classnames (cn)
  └── renders: motion.div, PerfumeCard (per perfume), UpsellCard (mid-grid conditional), BlurredTeaserCard (conditional)

PerfumeCard (src/components/ui/PerfumeCard.tsx)
  ├── imports from: react, next/image, lucide-react, @/components/ui/RadarGauge, next-intl, @/lib/matching (ScoredPerfume)
  └── renders: div, Image, RadarGauge, buttons (ingredients / match / price)

RadarGauge (src/components/ui/RadarGauge.tsx)
  ├── imports from: @/lib/utils (cn)
  └── renders: div, svg (gauge), span, optional breakdown divs

UpsellCard (src/components/ui/UpsellCard.tsx)
  ├── imports from: lucide-react, framer-motion, next/link, next-intl
  └── renders: motion.div, Link

BlurredTeaserCard (src/components/ui/BlurredTeaserCard.tsx)
  ├── imports from: react, lucide-react, next-auth/react (signIn), @/i18n/routing (useRouter), next-intl
  └── renders: div, button

Button (src/components/ui/button.tsx)
  ├── imports from: class-variance-authority, @/lib/utils (cn), framer-motion, next/link, react, lucide-react
  └── renders: motion.div + Link | motion.div + button

BackButton (src/components/ui/BackButton.tsx)
  ├── imports from: @/i18n/routing (useRouter, Link), next-intl, lucide-react, @/lib/utils (cn)
  └── renders: Link | button

IngredientsSheet (src/components/results/IngredientsSheet.tsx)
  ├── imports from: react, next/image, framer-motion, lucide-react, next-intl, @/lib/classnames, @/lib/matching (ScoredPerfume),
  │                 @/utils/scentGradients (getGradientForFamilies, generateGradientStyle)
  └── renders: AnimatePresence, motion.div (backdrop, sheet), PyramidSection (internal), Image, buttons

MatchSheet (src/components/results/MatchSheet.tsx)
  ├── imports from: react, next/image, framer-motion, lucide-react, next-intl, @/components/ui/RadarGauge,
  │                 @/utils/safetyProtocol (getMatchStatusWithSafety), @/lib/classnames, @/lib/matching (ScoredPerfume)
  └── renders: AnimatePresence, motion.div (backdrop, sheet), Image, RadarGauge, status badge, score breakdown

CompareBottomSheet (src/components/results/CompareBottomSheet.tsx)
  ├── imports from: react, next-intl, next/image, framer-motion, lucide-react, @/components/ui/button, @/components/SafetyBlocker,
  │                 @/lib/classnames, @/lib/matching (ScoredPerfume), @/utils/safetyProtocol (canShowPurchaseLinks),
  │                 @/types/api (fetchPrices, PriceApiResponse, StorePriceData)
  └── renders: AnimatePresence, motion.div (backdrop, sheet), StoreCard (internal), PremiumGate (internal),
                PriceHubContent (internal), ProductCompareContent (internal), SafetyBlocker (conditional), Button

SafetyBlocker (src/components/SafetyBlocker.tsx)
  ├── imports from: @/lib/matching (ScoredPerfume), @/utils/safetyProtocol (SafetyCheckResult)
  └── renders: div (warning UI)
```

---

## STEP 2: Type Definitions (Complete Graph)

```
ResultsContent uses:
  - ScoredPerfume (from @/lib/matching)
  - BlurredItem (local interface)
  - MatchResponse (local interface)
  - ActiveSheet (local type)

ResultsGrid uses:
  - ScoredPerfume (from @/lib/matching)
  - BlurredItem (local interface)
  - ResultsGridProps (local interface extending ScoredPerfume with displayName, onShowIngredients, onShowMatch, onPriceCompare)

PerfumeCard uses:
  - ScoredPerfume (from @/lib/matching)
  - PerfumeCardProps (local interface)

IngredientsSheet uses:
  - ScoredPerfume (from @/lib/matching)
  - PyramidSectionProps (local)
  - IngredientsSheetProps (local)

MatchSheet uses:
  - ScoredPerfume (from @/lib/matching)
  - MatchSheetProps (local)

CompareBottomSheet uses:
  - ScoredPerfume (from @/lib/matching)
  - CompareMode, CompareBottomSheetProps (local)
  - StorePriceData, PriceApiResponse (from @/types/api)

SafetyBlocker uses:
  - ScoredPerfume (from @/lib/matching)
  - SafetyCheckResult (from @/utils/safetyProtocol)

--- Type chain ---

ScoredPerfume (src/lib/matching.ts)
  └── extends PerfumeForMatching (same file)
      └── fields: id, name, brand, image, description, price, families, ingredients, symptomTriggers, isSafe, status, variant, scentPyramid
      └── + finalScore, tasteScore, safetyScore, isExcluded, exclusionReason, ifraScore?, ifraWarnings?, source?, fragellaId?

PerfumeForMatching (src/lib/matching.ts) — no further type imports

SafetyCheckResult (src/utils/safetyProtocol.ts)
  └── canPurchase, warningLevel, message, reason? — no external types

StorePriceData, PriceApiResponse (src/types/api.ts)
  └── no external type imports
```

---

## STEP 3: Utility Functions (All Used)

| File | Used by | Exports used |
|------|---------|--------------|
| `src/utils/scentGradients.ts` | IngredientsSheet | getGradientForFamilies, generateGradientStyle, GradientColors (type) |
| `src/utils/safetyProtocol.ts` | MatchSheet, CompareBottomSheet, SafetyBlocker | canShowPurchaseLinks, getMatchStatusWithSafety, SafetyCheckResult (type) |
| `src/lib/matching.ts` | ResultsContent, ResultsGrid, PerfumeCard, IngredientsSheet, MatchSheet, CompareBottomSheet, SafetyBlocker | ScoredPerfume (type), PerfumeForMatching (type) |
| `src/lib/utils/api-helpers.ts` | ResultsContent | safeFetch |
| `src/lib/logger.ts` | ResultsContent | default logger |
| `src/lib/classnames.ts` | ResultsGrid, IngredientsSheet, MatchSheet, CompareBottomSheet | cn |
| `src/lib/utils.ts` | Button, BackButton, RadarGauge | cn |

---

## STEP 4: Styling Files

- **src/app/globals.css** — CSS variables (:root, .dark), @theme inline (Tailwind semantic tokens), @keyframes slideDown, slideUp, rotate-icon, **mesh-flow** (used by scentGradients generateGradientStyle).
- **tailwind.config.ts** — content paths, darkMode: 'class', theme.extend (colors: surface, cream-bg, primary, safe-green, etc.; boxShadow; borderRadius; minHeight min-touch).
- **cn()** — from `src/lib/classnames.ts` or `src/lib/utils.ts` (clsx + tailwind-merge). No CSS modules. No separate style utilities file beyond these.

---

## STEP 5: i18n Analysis (Complete Keys)

| Component | useTranslations namespace | Keys used |
|-----------|---------------------------|-----------|
| page.tsx (generateMetadata) | getTranslations('results') | metadata.title, metadata.description |
| ResultsContent | 'results' | backToDashboard, hero.badge, hero.title, hero.description, heroExcellent, heroGood, heroFair, compare.title, compare.count, compare.subtitle, compare.cancel, compare.action, errorMessage, retry, errorDefault, poorMatch |
| ResultsGrid | t passed from parent ('results') | poorMatch, blurred.hiddenPerfume |
| PerfumeCard | 'results.card' | topMatch, ingredientsBtn, matchBtn, pricesBtn |
| UpsellCard | 'results.upsell' | title, avgMatch, featureUnlimited, featureAlerts, ctaWithPrice |
| BlurredTeaserCard | 'results.blurred' | guestMessage, freeMessage, guestCta, freeCta, title, avgMatchLabel |
| BackButton | 'common' | back, backAriaLabel |
| IngredientsSheet | 'results.ingredients' | sheetTitle, pyramid.title, pyramid.top, pyramid.topHint, pyramid.heart, pyramid.heartHint, pyramid.base, pyramid.baseHint, ingredientsTitle, familiesTitle, safetyTitle, safeLabel, warningLabel, ifraScore, warningsTitle, triggersTitle |
| MatchSheet | 'results.match' | sheetTitle, tasteLabel, tasteHint, tastePercentage, safetyLabel, safetyHint, safetyPercentage, overallLabel, statusDesc.{excellent|good|fair|poor|unsafe}, perfumeFamilies |
| CompareBottomSheet | 'results.compare' | sheetTitle, close, verifiedPrice, checkAvailability, exploreIn, tempError, retryButton, loading, noStores, premiumGateTitle, premiumGateDesc, premiumGateButton, matchLabel, safeLabel, warningLabel, familiesLabel, ingredientsLabel |

Namespaces: **results**, **results.ingredients**, **results.match**, **results.compare**, **results.card**, **results.upsell**, **results.blurred**, **common**.

---

## STEP 6: State Management & Contexts

- **QuizContext** (`src/contexts/QuizContext.tsx`) — ResultsContent uses `useQuiz()` for quizData (step1_liked, step2_disliked, step3_allergy). Provider is in root layout (layout.tsx).
- **Local state in ResultsContent:** useState for scoredPerfumes, blurredItems, tier, isLoading, error, compareIds, activeSheet, selectedPerfume. Callbacks: openSheet, closeSheet, fetchResults, toggleCompare.
- No zustand/redux. No other context consumed by Results tree.

---

## STEP 7: API & Data Fetching

- **ResultsContent:** POST `/api/match` via safeFetch (body: preferences). Response: success, perfumes (ScoredPerfume[]), blurredItems, tier.
- **CompareBottomSheet (PriceHubContent):** GET `/api/v1/prices/:perfumeId` via fetchPrices() from `@/types/api`. Returns PriceApiResponse.  
  **Note:** No `src/app/api/v1/prices/` route found in repo; client expects this endpoint (may be external or to be added).
- **API route used by Results:** `src/app/api/match/route.ts` (POST). Depends on auth, gating, perfume-bridge.service, matching, lib/data/perfumes (fallback).

---

## STEP 8: Assets & Public Files

- **/placeholder-perfume.svg** — used by PerfumeCard, IngredientsSheet, MatchSheet, CompareBottomSheet (image fallback).
- **/og-results.jpg** — referenced in page generateMetadata openGraph.images.
- **next/image** — used in PerfumeCard, IngredientsSheet, MatchSheet, CompareBottomSheet (no direct image imports in source).
- Fonts: applied in root layout (Noto_Sans_Arabic, Manrope, Cormorant_Garamond) — not specific to Results.

---

## FINAL OUTPUT (JSON)

See `RESULTS_PAGE_DEPENDENCY_ANALYSIS.json` (same directory).

---

## Notes

1. **matchStatus:** MatchSheet uses getMatchStatusWithSafety(perfume), which reads `perfume.matchStatus`. ScoredPerfume and the /api/match response do not define matchStatus; safetyProtocol casts and falls back to "fair" if undefined. For consistent status labels, consider adding matchStatus to the API response (e.g. from getMatchStatus(perfume.finalScore) in matching.ts).
2. **Price API:** fetchPrices() calls `/api/v1/prices/:perfumeId`. There is no `api/v1/prices` route in the repo; either implement it or point the client at an existing prices API and update types/api.ts.
3. **cn():** Results components use `@/lib/classnames`; Button/BackButton/RadarGauge use `@/lib/utils`. Both export the same cn() implementation; for refactors you can standardize on one.
4. **Layout:** Results page is under [locale]; layout.tsx (root) provides QuizProvider, NextIntlClientProvider, SessionProvider, ThemeProvider, etc. The [locale] layout only wraps with NextIntlClientProvider and setRequestLocale.
