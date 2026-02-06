# Footer raw Markdown fix — source, cause, and fix

## 1) Source of footer text

| Source | Location | Role |
|--------|----------|------|
| **Translation messages** | `messages/en.json`, `messages/ar.json` under `"footer"` | All visible footer strings: nav labels, aria labels, legal text. |
| **Component** | `src/components/Footer.tsx` | Renders footer using `useTranslations('footer')` and (after fix) `t.rich('linksRich', …)`. |
| **Layout** | `src/components/ConditionalLayout.tsx` | Includes `<Footer />` on non-auth pages. |
| **Routing** | `src/i18n/routing.ts` | `Link` from `createNavigation(routing)` so `href="/about"` becomes `/en/about` or `/ar/about` by locale. |

Footer content is **not** server-provided; it is client-rendered from the above messages and component. No literal `[قصتنا](/ar/about)` string was found in the repo; the structure uses separate keys (`footer.links.about`, etc.) and explicit `<Link>` components.

---

## 2) Why it could render as “raw Markdown”

If a translation string contained **literal** Markdown, e.g. `"[قصتنا](/ar/about) [تساؤلات](/ar/faq)..."`, and that string was rendered with **plain** `t('someKey')` (no rich text), then:

- React would treat it as plain text and escape any HTML.
- The browser would show the characters as-is: `[قصتنا](/ar/about) ...` — i.e. “raw Markdown-like” text, not clickable links.

So the cause is: **translation contains link syntax, but the UI renders it as plain text** (no `t.rich` or component mapping). The current codebase already used separate `t('links.about')` and `<Link>`, so this scenario would only occur if a **single** key with Markdown-style text were introduced and rendered with `t()`.

---

## 3) Fix applied

- **Keep translations clean:** No Markdown in messages. New key `footer.linksRich` uses **tags** only, e.g. `<about>About</about> · <faq>FAQ</faq> ...`.
- **Real clickable links:** Footer nav now uses **`t.rich('linksRich', { ... })`** with custom tags mapped to **`<Link>`** from `@/i18n/routing` (next-intl navigation). Each tag (e.g. `about`, `faq`) is rendered as a Next.js `Link` with the correct `href` (`/about`, `/faq`, etc.).
- **Both locales, no hardcoded `/ar`:** `Link` is from `createNavigation(routing)`; `href="/about"` is resolved to `/en/about` or `/ar/about` by next-intl based on current locale. No `/ar` in code.
- **No `dangerouslySetInnerHTML`:** All link content is produced via `t.rich` and React elements; no raw HTML injection.
- **Footer `dir`:** Footer now uses `useLocale()` and sets `dir={locale === 'ar' ? 'rtl' : 'ltr'}` so direction matches the active locale.

---

## 4) Files changed

### `messages/en.json`

- **Added** under `footer`:
  - `"linksRich": "<about>About</about> · <faq>FAQ</faq> · <privacy>Privacy</privacy> · <feedback>Share your feedback</feedback>"`

### `messages/ar.json`

- **Added** under `footer`:
  - `"linksRich": "<about>قصتنا</about> · <faq>تساؤلات</faq> · <privacy>الخصوصية</privacy> · <feedback>شاركنا رأيك</feedback>"`

### `src/components/Footer.tsx`

- **Imports:** `useLocale` from `next-intl`.
- **Constants:** `linkClassName` extracted for reuse.
- **Locale/dir:** `const locale = useLocale()`, `const dir = locale === 'ar' ? 'rtl' : 'ltr'`, `<footer dir={dir} ...>`.
- **Nav:** Replaced four separate `<Link>` + `t('links.*')` with a single:
  - `t.rich('linksRich', { about: (chunks) => <Link href="/about" className={linkClassName}>{chunks}</Link>, faq: …, privacy: …, feedback: … })`
- **Existing** `footer.links.*` keys are unchanged and remain available for reuse elsewhere (e.g. aria, other components).

---

## 5) Manual test plan

1. **Start dev server:** `npm run dev` (or `pnpm dev`).
2. **English footer:**
   - Open **http://localhost:3000/en** (or your base URL with `/en`).
   - Scroll to footer.
   - Expect: “About · FAQ · Privacy · Share your feedback” as **clickable links**.
   - Click each: should go to `/en/about`, `/en/faq`, `/en/privacy`, `/en/feedback`.
   - Footer block should be LTR.
3. **Arabic footer:**
   - Open **http://localhost:3000/ar**.
   - Footer should show: “قصتنا · تساؤلات · الخصوصية · شاركنا رأيك” as **clickable links**.
   - Click each: should go to `/ar/about`, `/ar/faq`, `/ar/privacy`, `/ar/feedback`.
   - Footer block should be RTL.
4. **No raw Markdown:** On neither locale should you see literal `[قصتنا](/ar/about)` or similar; only links and separators.
5. **Copyright:** “© {year} Ask Seba …” (en) / “© {year} Ask Seba. جميع الحقوق محفوظة.” (ar) still rendered below the nav.

If any of these fail, check that the app is using the updated `Footer.tsx` and the latest `messages/en.json` and `messages/ar.json` (no cached build).
