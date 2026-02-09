# BACK BUTTON DIAGNOSTIC REPORT
**Date:** 2026-02-09  
**Scope:** `src/app` (active routes only; `_archived` and `manus-audit-ready` excluded)  
**Total Routes Analyzed:** 22 (UI page routes from ROUTES.md + root not-found)

---

## EXECUTIVE SUMMARY

| Metric | Count |
|--------|--------|
| **Routes WITH back button** | 9 (41%) |
| **Routes WITHOUT back button** | 11 (50%) |
| **Redirect-only / N/A** | 2 (settings, home) |
| **Implementation patterns found** | 4 (Link to fixed route, `router.back()`, `router.push()` explicit, Link “back to home”) |
| **Critical issues** | 3 |
| **Medium issues** | 6 |
| **Minor issues** | 5 |

---

## DETAILED FINDINGS

### 1. COMPLETE INVENTORY

| # | Route | Back button? | Implementation | Destination | File (exact line) |
|---|--------|--------------|----------------|-------------|-------------------|
| 1 | `/[locale]` | N/A | — | — | Home |
| 2 | `/[locale]/about` | ✅ Yes | `<Link href="/profile">` | `/profile` | `src/app/[locale]/about/page.tsx` 121–127 |
| 3 | `/[locale]/dashboard` | ❌ No | — | — | — |
| 4 | `/[locale]/faq` | ✅ Yes | `<Link href="/profile">` | `/profile` | `src/app/[locale]/faq/page.tsx` 34–40 |
| 5 | `/[locale]/favorites` | ✅ Yes | `<Link href={…}>` (FavoritesContent) | `/dashboard` or `/` | `src/components/favorites/FavoritesContent.tsx` 27–33 |
| 6 | `/[locale]/feedback` | ❌ No | — | — | — |
| 7 | `/[locale]/login` | ❌ No | — | — | — |
| 8 | `/[locale]/privacy` | ✅ Yes | `<button onClick={handleBack}>` `router.back()` | Previous page | `src/app/[locale]/privacy/page.tsx` 56–63 |
| 9 | `/[locale]/profile` | ❌ No | — | Hub | — |
| 10 | `/[locale]/register` | ❌ No | — | — | — |
| 11 | `/[locale]/results` | ❌ No | — | — | — |
| 12 | `/[locale]/settings` | Redirect | — | → `/profile` | — |
| 13 | `/[locale]/quiz` | ✅ Yes | `<Link href="/">` (QuizLandingContent) | `/` | `src/components/quiz/QuizLandingContent.tsx` 27–30 |
| 14 | `/[locale]/quiz/step1-favorites` | ❌ No | — | — | — |
| 15 | `/[locale]/quiz/step2-disliked` | ✅ Yes | `<Button onClick={() => router.back()}>` | Previous page | `src/app/[locale]/quiz/step2-disliked/page.tsx` 217–224 |
| 16 | `/[locale]/quiz/step3-allergy` | ✅ Yes | `<button onClick={onBack}>` → `router.push('/quiz/step2-disliked')` | `/quiz/step2-disliked` | `src/components/quiz/Step3Allergy.tsx` 234–241; page 72–76 |
| 17 | `/[locale]/not-found` | ✅ Yes | `<Link href="/">` (backHome) | `/` | `src/app/[locale]/not-found.tsx` 25–26 |
| 18 | `/notifications` | ❌ No | — | — | — |
| 19 | `/pricing` | ❌ No | — | — | — |
| 20 | `/pricing/success` | CTA only | `<button onClick={() => router.push('/')}>` | `/` | `src/app/pricing/success/page.tsx` 114–119 |
| 21 | Root `/not-found` | ✅ Yes | `<Link href="/ar">` | `/ar` | `src/app/not-found.tsx` 23–24 |
| 22 | Test pages (test-header, test-input) | ❌ No | — | — | — |

**Additional back-like controls (components):**
- **UpsellCard** (`src/components/ui/UpsellCard.tsx` ~120): Link with `ArrowLeft` (no RTL flip, no aria-label in snippet).
- **UpgradePrompt** (`src/components/ui/UpgradePrompt.tsx` ~58): Button/link with `ArrowLeft` + `mr-2` (no RTL flip).

---

### 2. PATTERN BREAKDOWN

| Pattern | Description | Used on | Files |
|--------|-------------|--------|--------|
| **A** | `<Link href="/profile">` + ArrowLeft + text | About, FAQ | `about/page.tsx`, `faq/page.tsx` |
| **B** | `<Link href="…">` (dynamic: /dashboard or /) + ArrowLeft | Favorites | `FavoritesContent.tsx` |
| **C** | `<button onClick={() => router.back()}>` + ArrowLeft + aria-label | Privacy | `privacy/page.tsx` |
| **D** | `<Button onClick={() => router.back()}>` + **ChevronRight** + text (no aria-label) | Quiz step 2 | `step2-disliked/page.tsx` |
| **E** | `<button onClick={onBack}>` → `router.push('/quiz/step2-disliked')` + ChevronRight + `rtl:rotate-180` + goBack + hardcoded aria-label | Quiz step 3 | `Step3Allergy.tsx` |
| **F** | `<Link href="/">` + ChevronLeft + hardcoded "العودة" | Quiz landing | `QuizLandingContent.tsx` |
| **G** | `<Link href="/">` (backHome / browseQuiz) | [locale] not-found | `not-found.tsx` |
| **H** | `<Link href="/ar">` (hardcoded locale) | Root not-found | `app/not-found.tsx` |

**Inconsistencies:**
- **Icon:** ArrowLeft (about, faq, privacy, FavoritesContent, UpsellCard, UpgradePrompt) vs ChevronRight (step2, step3) vs ChevronLeft (quiz landing).
- **Action:** Fixed route (Link) vs history (router.back()) vs explicit route (router.push).
- **Copy:** "الرجوع للملف الشخصي" / "Back to profile" vs "رجوع" / "Back" vs "العودة" (hardcoded) vs "Back to home" / backHome.

---

### 3. IDENTIFIED ISSUES

#### Critical
1. **Root `not-found` hardcoded to `/ar`**  
   - `src/app/not-found.tsx` uses `<Link href="/ar">` and Arabic-only copy ("العودة للرئيسية", "تصفح العطور", etc.). Ignores locale; English (or other) users get wrong locale and RTL.
2. **Step 2 back icon wrong in LTR**  
   - `step2-disliked/page.tsx` uses `ChevronRight` for “Back” with no `rtl:rotate-180`. In LTR, “back” should point left; arrow points right.
3. **Quiz landing back: hardcoded Arabic and no RTL flip**  
   - `QuizLandingContent.tsx`: text "العودة" is hardcoded; `ChevronLeft` has `mr-2` only, so in RTL the arrow does not flip. Inconsistent with i18n and RTL.

#### Medium
4. **Missing aria-label on back links/buttons**  
   - About (121–127), FAQ (34–40), FavoritesContent (27–33), QuizLandingContent (27–30), Step2 back button (217–224): no `aria-label`. Privacy and Step3 back have aria-labels (Privacy: `t('backAriaLabel')`, Step3: hardcoded Arabic).
5. **Missing back buttons on deep/secondary pages**  
   - Feedback, Notifications, Pricing, Results: no in-page back. User may rely only on header/browser. Dashboard and Profile are hubs (no back is a design choice).
6. **Step 3 back: hardcoded Arabic aria-label**  
   - `Step3Allergy.tsx` line 236: `aria-label="العودة للخطوة السابقة"`. Not using translations; breaks English/other locales.
7. **Text inconsistency**  
   - "الرجوع للملف الشخصي" / "Back to profile" (about, faq, privacy) vs "رجوع" / "Back" (step2) vs "العودة" (quiz landing) vs "Back to home" (not-found). Inconsistent UX and i18n.
8. **RTL: ArrowLeft never flipped**  
   - Privacy, About, FAQ, FavoritesContent use `ArrowLeft` with no `rtl:rotate-180`. In RTL, “back” is typically right-pointing; arrow stays left.
9. **Header `dir="rtl"` hardcoded**  
   - `src/components/ui/header.tsx` line 39: `<header dir="rtl">`. Header is always RTL regardless of locale; affects layout and any future back in header.

#### Minor
10. **Focus styles**  
   - Global `*:focus-visible` in `globals.css` (105–108) gives outline; individual back controls not audited for focus visibility. Button/Link from design system likely get it; custom buttons should be verified.
11. **Step 1 quiz: no back**  
   - step1-favorites has only “Next”. Users coming from quiz landing can only go forward or leave via header/browser. Optional UX improvement.
12. **Pricing success: no explicit “Back”**  
   - Single CTA “ابدأ استخدام Ask Seba” → `/`. No “Back to pricing” or “Back to profile”; acceptable but different from other flows.
13. **FavoritesContent back: conditional copy**  
   - Authenticated: “Back to Dashboard” / “لوحة التحكم”; unauthenticated: “Back to home” / “العودة للرئيسية”. Clear but different from “Back to profile” on about/faq.
14. **UpsellCard / UpgradePrompt**  
   - Use ArrowLeft with no RTL flip and no aria-label in the snippets reviewed; shared component audit recommended.

---

### 4. COMPONENT ARCHITECTURE

- **No shared BackButton component.** Each page/component implements its own (Link or button + icon + text).
- **Routing:** `@/i18n/routing` (`useRouter`, `Link`) used in [locale] app and many components; `next/navigation` in `/pricing`, `/pricing/success`, `/notifications`.
- **Icons:** Lucide `ArrowLeft`, `ChevronLeft`, `ChevronRight` used inconsistently for “back”.
- **Translations:**  
  - `privacy.backButton`, `privacy.backAriaLabel`  
  - `about.backToProfile`, `faq.backToProfile`  
  - `favorites.backToDashboard`, `favorites.backToHome`  
  - `quiz.step2.backButton`  
  - `notFound.backHome`, `notFound.browseQuiz`  
  - `content.common.goBack` (Step3, content/index.ts)
- **Dependencies:** Changing back behavior touches page components, shared components (FavoritesContent, QuizLandingContent, Step3Allergy), and possibly header if a global back is added. No central layout “back slot” today.

---

### 5. DESIGN SYSTEM ANALYSIS

- **Position:** Back controls are top-left of content (about, faq, privacy, favorites, step2, step3) or in CTA group (quiz landing, not-found). No fixed header back; position is consistent for in-content backs.
- **Style:** Mix of plain link style (about, faq, favorites: `flex items-center gap-2 … hover:text-brand-gold`) and outline Button (step2, not-found). Privacy uses a button with same visual weight as a link. Step3 uses custom bordered button. Not a single component or token.
- **Icon size:** Mostly `w-5 h-5`; UpgradePrompt uses `w-6 h-6`.
- **Spacing:** `gap-2`, `mb-6` common; step2 uses `ms-2` on icon; QuizLandingContent uses `mr-2` (LTR-only margin).
- **Touch:** Privacy and FAQ use `min-h-[44px] min-w-[44px]` or `touch-manipulation`; not applied everywhere.

---

### 6. QUIZ FLOW MAP

```
[locale]/quiz (landing)
  → Back: Link "/" (العودة) — Pattern F
  → Start: Link "/quiz/step1-favorites"

[locale]/quiz/step1-favorites
  → Back: none
  → Next: Button → step2-disliked

[locale]/quiz/step2-disliked
  → Back: Button router.back() — Pattern D (ChevronRight, no aria-label)
  → Next: Button → step3-allergy
  → Skip: button → step3-allergy

[locale]/quiz/step3-allergy (Step3Allergy component)
  → Back: button onBack → router.push('/quiz/step2-disliked') — Pattern E (ChevronRight + rtl:rotate-180, hardcoded aria)
  → Next: level or → results
```

**Observations:** Step 2 uses history back; step 3 uses explicit push to step 2. So step 3 → step 2 works; step 2 → step 1 depends on history (no direct link from step 2 to step 1). Step 1 has no back; users rely on browser or header.

---

### 7. RECOMMENDATIONS (HIGH-LEVEL ONLY)

1. **Introduce a shared BackButton (or BackLink) component** with: destination type (history vs href), optional href, icon (single source), RTL flip, aria-label from translations, and consistent styling/touch target.
2. **Fix root not-found** to use locale-aware routing and translated strings (e.g. same approach as [locale]/not-found).
3. **Unify icon semantics for back:** one icon (e.g. ArrowLeft) with `rtl:rotate-180` everywhere, or ChevronRight with `rtl:rotate-180` where “back” is on the right in RTL.
4. **Add aria-labels** to every back control from a single set of keys (e.g. backAriaLabel / backToProfileAriaLabel).
5. **Replace hardcoded Arabic** in QuizLandingContent (“العودة”) and Step3Allergy (aria-label) with translation keys.
6. **Consider back buttons** for Feedback, Notifications, Pricing, and Results (or document that header/browser back is intentional).
7. **Review header** for hardcoded `dir="rtl"` and align with locale/layout direction.
8. **Audit UpsellCard and UpgradePrompt** for RTL and aria-labels if they act as primary back/exit.

---

## RISK ASSESSMENT

Before changing back behavior, consider:

- **Layout/header:** Header is RTL-hardcoded; any global “back” in header would inherit that. Locale-based direction may require layout/header changes.
- **Quiz flow:** Step 2 uses `router.back()`; step 3 uses `router.push('/quiz/step2-disliked')`. Changing step 3 to `router.back()` could change behavior when arriving from other entry points; any change should preserve “step 3 → step 2” and not break step 2 → step 1 when history exists.
- **i18n:** Several namespaces (privacy, about, faq, favorites, quiz, notFound, content) and both JSON messages and `content` object; new keys or shared keys must stay in sync.
- **Non-locale routes:** `/notifications`, `/pricing`, `/pricing/success`, root `not-found` live outside `[locale]`; they don’t use `@/i18n/routing` and some use hardcoded Arabic. Unifying back behavior may require moving them under locale or adding locale detection and shared components.

---

## NEXT STEPS

- **Ready for implementation prompt:** Yes, with the above risks and recommendations in mind.
- **Blockers:** None that prevent a phased implementation (e.g. fix root not-found and RTL/aria first, then introduce shared BackButton and add missing backs).

---

## APPENDIX: CODE SNIPPETS (CURRENT BEHAVIOR)

**Privacy (pattern C)** — `src/app/[locale]/privacy/page.tsx` 56–63:
```tsx
<button
  type="button"
  onClick={handleBack}
  aria-label={t('backAriaLabel')}
  className="flex items-center gap-2 ..."
>
  <ArrowLeft className="w-5 h-5" aria-hidden />
  <span>{t('backButton')}</span>
</button>
```

**Step 2 (pattern D)** — `src/app/[locale]/quiz/step2-disliked/page.tsx` 217–224:
```tsx
<Button
  variant="outline"
  onClick={() => startTransition(() => router.back())}
  disabled={isPending}
  className="flex-1 py-6"
>
  <ChevronRight className="w-5 h-5 ms-2" />
  {t('step2.backButton')}
</Button>
```

**Step 3 (pattern E)** — `src/components/quiz/Step3Allergy.tsx` 234–241:
```tsx
<button
  onClick={onBack}
  aria-label="العودة للخطوة السابقة"
  className="min-h-[44px] ..."
>
  <ChevronRight className="w-5 h-5 inline ms-2 rtl:rotate-180" aria-hidden="true" />
  {content.common.goBack}
</button>
```

**Quiz landing (pattern F)** — `src/components/quiz/QuizLandingContent.tsx` 27–30:
```tsx
<Link href="/">
  <ChevronLeft className="h-5 w-5 mr-2" />
  العودة
</Link>
```

**Root not-found (pattern H)** — `src/app/not-found.tsx` 22–24:
```tsx
<Button asChild variant="primary" size="lg" className="w-full">
  <Link href="/ar">العودة للرئيسية</Link>
</Button>
```
