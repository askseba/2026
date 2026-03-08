# Link audit: Quiz and footer/nav (diagnostic only)

**Context:** App has locale routes `/ar/...` and `/en/...`. `/ [locale]/quiz` returns 404; only `/[locale]/quiz/step1-favorites` (and step2, step3) exist.

---

## Step 1 – Diagnostic table

### 1. Quiz-related links (all occurrences)

| File (relative to root) | Line(s) | Exact snippet | Valid? | Notes |
|-------------------------|--------|----------------|--------|--------|
| `src/app/[locale]/about/page.tsx` | 141–144 | `<Link href="/quiz" ...>` | **No** | Points to `/quiz` → 404; should be `/quiz/step1-favorites`. |
| `src/app/[locale]/about/page.tsx` | 253–255 | `<Link href={t('cta.button_href')} ...>` | **No** | Translation value is `/quiz`; same fix. |
| `src/app/[locale]/quiz/step1-favorites/page.tsx` | 148 | `<BackButton href="/quiz" ...>` | **No** | Back “to quiz intro” points to non-existent `/quiz`; use `"/"` (home) or keep intent with existing route. |
| `src/content/content.json` | 109 | `"button_href": "/quiz"` | **No** | Data source; about page uses `t('cta.button_href')` from messages, but content.json is inconsistent. |
| `messages/ar.json` | 183, 239, 353 | `"primaryCtaHref": "/quiz"`, `"primaryHref": "/quiz"`, `"button_href": "/quiz"` | **No** | Used by about (`cta.button_href`); hero keys unused in current code but wrong. |
| `messages/en.json` | 183, 239, 353 | Same keys as ar.json | **No** | Same as above. |
| `src/app/sitemap.ts` | 15 | `'/quiz'` in `staticPages` array | **No** | Sitemap lists `/quiz` which 404s; should be `/quiz/step1-favorites` or remove. |
| `src/app/[locale]/quiz/step2-disliked/page.tsx` | 220 | `router.push(\`/${locale}/quiz/step1-favorites\`)` | Review | Prefer `router.push('/quiz/step1-favorites')` so i18n router handles locale (avoids double-prefix risk). |
| `src/app/[locale]/not-found.tsx` | 29, 43 | `<Link href="/quiz/step1-favorites">` | **Yes** | Correct. |
| `src/components/NotFoundContent.tsx` | 36, 50 | `<Link href="/quiz/step1-favorites">` | **Yes** | Correct. |
| `src/components/quiz/QuizLandingContent.tsx` | 27 | `<Link href="/quiz/step1-favorites">` | **Yes** | Correct. |
| `src/components/landing/CTASection.tsx` | 62 | `router.push('/quiz/step1-favorites')` | **Yes** | Correct. |
| `src/hooks/useQuizStepGuard.ts` | 38, 49 | `router.push('/quiz/step1-favorites')`, `router.push('/quiz/step2-disliked')` | **Yes** | Correct. |
| `src/app/[locale]/quiz/step2-disliked/page.tsx` | 132, 141 | `router.push('/quiz/step3-allergy')` | **Yes** | Correct. |
| `src/app/[locale]/quiz/step3-allergy/page.tsx` | 76 | `router.push('/quiz/step2-disliked')` | **Yes** | Correct. |
| `src/components/TestHistory.tsx` | 86 | `router.push('/quiz/step1-favorites')` | **Yes** | Correct. |
| `src/app/_archived/pages/about/page.tsx` | 40, 151 | `href="/quiz"`, `href={data.cta.button_href}` | **No** | Archived; same issues if ever used. |
| `src/app/_archived/pages/quiz/step1-favorites/page.tsx` | 127 | `router.push('/quiz/step2-disliked')` | **Yes** | Archived. |
| `docs/archive/ui-snapshot/.../CTASection.tsx` | 60 | `router.push('/quiz')` | **No** | Archive/doc only. |

### 2. Footer / header / nav – About, FAQ, Privacy, Feedback

| File | Line(s) | Snippet | Valid? | Notes |
|------|--------|--------|--------|--------|
| `src/components/Footer.tsx` | 31, 36, 41, 46 | `<Link href="/about">`, `<Link href="/faq">`, `<Link href="/privacy">`, `<Link href="/feedback">` | **Yes** | Uses `Link` from `@/i18n/routing`; locale is added by next-intl → `/ar/about`, `/en/faq`, etc. No double locale. |
| `docs/archive/ui-snapshot/src/components/Footer.tsx` | 17, 23, 29, 35 | `href="/about"`, `/faq`, `/privacy`, `/feedback` | **Yes** | Archive; paths are locale-agnostic. |

**Conclusion (footer/nav):** No duplicated locale or wrong base path. About/FAQ/Privacy/Feedback resolve correctly to `/ar/...` and `/en/...`.

---

## Summary of required fixes (Step 2)

- **Quiz (invalid → valid):**
  - `src/app/[locale]/about/page.tsx`: both hero CTA and bottom CTA: use `/quiz/step1-favorites` (and fix translation/data so `button_href` is `/quiz/step1-favorites`).
  - `src/app/[locale]/quiz/step1-favorites/page.tsx`: `BackButton href="/quiz"` → `href="/"` (no `/quiz` page; “back to quiz intro” = home).
  - `messages/ar.json` and `messages/en.json`: set `primaryCtaHref`, `primaryHref`, and `about.cta.button_href` to `/quiz/step1-favorites`.
  - `src/content/content.json`: set `about.cta.button_href` to `/quiz/step1-favorites`.
  - `src/app/sitemap.ts`: replace `'/quiz'` with `'/quiz/step1-favorites'` (or remove if you don’t want that URL in sitemap).
  - `src/app/[locale]/quiz/step2-disliked/page.tsx`: use `router.push('/quiz/step1-favorites')` instead of `` `/${locale}/quiz/step1-favorites` ``.
- **Footer/About/FAQ/Privacy/Feedback:** No code changes needed.

---

## Step 2 – Fixes applied

| File | Before | After | Reason |
|------|--------|-------|--------|
| `src/app/[locale]/about/page.tsx` | `<Link href="/quiz"` | `<Link href="/quiz/step1-favorites"` | Hero CTA pointed to non-existent `/quiz`; existing route is `/quiz/step1-favorites`. |
| `src/app/[locale]/about/page.tsx` | (bottom CTA uses `t('cta.button_href')`) | — | Fixed via messages: `button_href` set to `/quiz/step1-favorites`. |
| `src/app/[locale]/quiz/step1-favorites/page.tsx` | `<BackButton href="/quiz"` | `<BackButton href="/"` | `/quiz` does not exist; “back to quiz intro” sends user to home. |
| `src/app/sitemap.ts` | `'/quiz'` in staticPages | `'/quiz/step1-favorites'` | Sitemap listed 404 URL; use existing route. |
| `src/app/[locale]/quiz/step2-disliked/page.tsx` | `router.push(\`/${locale}/quiz/step1-favorites\`)` | `router.push('/quiz/step1-favorites')` | Prefer locale-agnostic path so i18n router handles locale (avoids double-prefix). |
| `src/content/content.json` | `"button_href": "/quiz"` | `"button_href": "/quiz/step1-favorites"` | Align data with existing route. |
| `messages/ar.json` | `"primaryCtaHref"`, `"primaryHref"`, `about.cta.button_href`: `"/quiz"` | `"/quiz/step1-favorites"` | All quiz hrefs must point to existing route. |
| `messages/en.json` | Same keys `"/quiz"` | `"/quiz/step1-favorites"` | Same as ar. |
