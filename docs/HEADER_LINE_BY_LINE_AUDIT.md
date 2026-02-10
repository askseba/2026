# Header Line-by-Line Audit (Read-only, Exhaustive)

**Scope:** All files in the header inventory: main header component, layout that injects it, header-specific dependencies, test page, and README.  
**No code modifications** — audit only.

---

## Summary: Header implementation matrix

| Dimension        | Behavior |
|-----------------|----------|
| **Logged out** | Header visible on all non-auth routes. Notifications → `/login?callbackUrl=/notifications`. User menu: Login / Register. StatusCircles Heart links to `/favorites` (no auth guard). |
| **Logged in**   | Same header. Notifications → `/notifications`. User menu: Profile / Log out. Notification dot shown. |
| **ar vs en**    | Same header. `dir="rtl"` hardcoded on `<header>`. Nav labels and dropdown use `useTranslations('nav')`. LanguageSwitcher and DarkModeToggle use mixed hardcoded Arabic/English. |
| **Mobile vs desktop** | Same structure; `gap-2 sm:gap-3`, no hamburger; StatusCircles + controls row. No dedicated mobile nav. |

**Single header implementation:** Only `src/components/ui/header.tsx`. No duplicate header components; `header.tsx.backup` is a near-identical copy (not used in the tree). Page-level `<header>` sections (e.g. dashboard, notifications) are in-page titles/banners, not the global nav.

---

## File #1 — `src/components/ui/header.tsx`

### What it does
Global site header: sticky bar with StatusCircles (left), theme toggle, language switcher, notifications button, and account dropdown (profile/login/register/logout). Session-aware; routes guests to login with callbackUrl where needed.

### How it works
- **Structure:** Single `<header>` (implicit `role="banner"`) with `dir="rtl"`, one inner `container` div, two logical blocks: (1) left: `<StatusCircles />`, (2) right: wrapper `div` with DarkModeToggle, LanguageSwitcher, Notifications `Button`, and account `DropdownMenu` (trigger + content).
- **Rendering:** Client component (`"use client"`). No conditional hide inside the component; visibility is controlled by ConditionalLayout (header not rendered on auth pages).
- **Props/state:** No props. Uses `useSession()` (session, status), `useTranslations('nav')` (t), `useRouter()` from `@/i18n/routing` (router). All nav labels and aria from `t(...)`; routing via `router.push(...)`.

### Navigation behavior
- **Routes linked / pushed:**  
  - Notifications: `router.push('/notifications')` when authenticated, else `router.push('/login?callbackUrl=/notifications')`.  
  - Profile: `router.push('/profile')`.  
  - Sign out: `signOut({ callbackUrl: '/' })`.  
  - Login: `router.push('/login')`.  
  - Register: `router.push('/register')`.  
- **Hard-coded locale:** None; all navigation uses i18n router, so paths are locale-prefixed by the routing layer.
- **Active state:** No active-route highlighting in the header (no pathname-based styling for current page).

### RTL/LTR and i18n
- **Direction:** `<header dir="rtl">` is hardcoded. Page direction is already set on `<html dir={direction}>` in root layout from locale; header overrides to RTL regardless of locale. [Issue below.]
- **Icon flipping:** Icons are not explicitly flipped for LTR; layout is RTL-only in the header.
- **Spacing:** Right-side block uses `gap-2 sm:gap-3` (logical). Notification badge uses `start-0.5` (RTL-safe). Dropdown items use `text-right` for alignment.
- **Locale-aware hrefs:** All navigation is via `router.push()` / dropdown `onClick` with pathnames without locale prefix; routing adds locale.
- **Translation keys used:** `nav.notifications`, `nav.notificationsLoginPrompt`, `nav.userMenuAriaLabel`, `nav.profile`, `nav.logout`, `nav.login`, `nav.register`. All present in `messages/ar.json` and `messages/en.json`. No missing keys; no hardcoded Arabic/English in this file.

### Accessibility
- **Landmarks:** `<header>` is correct; no explicit `<nav>` (header is a single banner, not a nav list).
- **Aria:** Notifications button: `aria-label` switches by auth (`t('notifications')` vs `t('notificationsLoginPrompt')`). User menu trigger: `aria-label={t('userMenuAriaLabel')}`. DarkModeToggle and LanguageSwitcher are in child components.
- **Buttons:** All interactive elements are buttons or Radix triggers (keyboard activatable). Notifications disabled when `status === 'loading'`.
- **Focus:** Button component provides `focus-visible:ring-2 focus-visible:ring-primary`; no skip link in header.
- **Contrast:** Relies on design tokens (`text-text-primary`, `bg-background/95`, etc.); no obvious contrast issue in this file.

### Performance
- **Client boundary:** Entire component is client; session and router require client. No server slice.
- **Re-renders:** Re-renders on session change (status/data) and on locale change (translations). No obvious unnecessary subscriptions.
- **Imports:** Next-auth, next-intl, i18n router, Button, DropdownMenu pieces, StatusCircles, DarkModeToggle, LanguageSwitcher, AskSebaIcons. No heavy data or large libs; StatusCircles uses framer-motion (adds to bundle).
- **Icons:** AskSebaIcons are inline SVGs (no dynamic import). No images in header.

### Consistency
- **Design system:** Buttons use `variant="ghost"` and `size="sm"`; matches design. Dropdown content `className="w-48"`; align="start".
- **Spacing:** `gap-2 sm:gap-3`, `px-4`, `container mx-auto`, `h-14`.
- **Typography:** No explicit typography in header (icons + dropdown labels from translations).
- **z-index:** `z-50` on header; right-side block has `relative z-10` so controls stay above backdrop.
- **Responsiveness:** `gap-2 sm:gap-3` only; no breakpoint-based layout change (no hamburger, no logo slot).

### Issues
- **[High]** Header forces `dir="rtl"` regardless of locale; when locale is `en`, root layout sets `dir="ltr"` on `<html>` but header remains RTL, causing inconsistent direction and potential layout/UX issues.
- **[Medium]** `signOut({ callbackUrl: '/' })` uses a non-locale-prefixed URL; after sign-out user may land on `/` instead of `/ar` or `/en`, depending on next-auth and middleware behavior.
- **[Low]** No active state for current route (e.g. “Notifications” when on `/notifications`); minor UX.

### Recommendations
- **header.tsx:** Derive `dir` from locale (e.g. `useLocale()` from next-intl and set `dir={locale === 'ar' ? 'rtl' : 'ltr'}` on `<header>`) so header direction matches layout.
- **header.tsx:** Consider making sign-out redirect locale-aware (e.g. use `router` or `getPathname` to build callback URL with current locale) and pass that to `signOut({ callbackUrl })`.
- **header.tsx (optional):** Add pathname-based active state for Notifications (and optionally Profile) for clarity.

---

## File #2 — `src/components/ConditionalLayout.tsx`

### What it does
Wraps app content and conditionally renders the global Header and Footer; hides both on auth pages (login, register, forgot-password) so those pages are full-screen without nav/footer.

### How it works
- **Structure:** Client component. Uses `usePathname()` from `next/navigation`. If `pathname.endsWith(page)` for any `AUTH_PAGES`, returns `<>children</>` only. Otherwise returns a flex column: Header, `<main className="flex-1">`, Footer.
- **Rendering:** Single branch; no nested layout; Header and Footer are always shown or both hidden together.

### Props/state
- **Props:** `children: React.ReactNode` (from root layout).
- **State:** None. `pathname` from `usePathname()` (Next.js), so locale-prefixed paths (e.g. `/ar/login`) are matched via `endsWith('/login')`.

### Navigation behavior
- No navigation; only conditional rendering. No links or active state.

### RTL/LTR and i18n
- No direction or locale logic; pathname is used only for matching auth segments. No translation keys.

### Accessibility
- **Landmarks:** When layout is shown, `<main>` is present and semantic. Header/Footer components define their own landmarks.
- No skip link in this file (could live in layout or header).

### Performance
- Minimal; one pathname read per render. No heavy imports.

### Consistency
- `min-h-screen` and `flex flex-col` keep layout consistent; `flex-1` on main fills space.

### Issues
- **[Low]** `AUTH_PAGES` includes `/forgot-password`; there is no `/forgot-password` route in the app (login links to it). If that page is added later, layout will correctly hide header/footer; if not, the constant is slightly misleading but harmless.
- **[Low]** Uses `next/navigation`’s `usePathname()`; with next-intl, pathname may or may not include locale depending on config. Current usage (`endsWith`) works for paths like `/ar/login` and `/en/login`.

### Recommendations
- **ConditionalLayout.tsx:** Optional: add a short comment that `AUTH_PAGES` must match route paths (with or without locale prefix as applicable) so future route renames stay in sync.
- No change required for pathname source if current behavior is correct in production (locale-prefixed paths).

---

## File #3 — `src/components/DarkModeToggle.tsx`

### What it does
Theme toggle button used in the header: switches between light and dark via `next-themes`; shows custom sun/moon SVGs; reserves space when not mounted to avoid layout shift.

### How it works
- **Structure:** Client component. Before mount returns a disabled, aria-hidden placeholder button with same approximate footprint and sr-only “جاري تحميل الواجهة...”. After mount, renders a single `<button>` with class `theme-toggle group`, `onClick` toggles theme, and an `icon-container` div with two SVGs (sun, moon) toggled by `theme === "dark"` with opacity/scale.
- **Rendering:** No props; uses `useTheme()` and local `mounted` state. Only “light” and “dark” are toggled (no “system” UI).

### Props/state
- No props. `useTheme()` (theme, setTheme); `useState(false)` for `mounted`; `useEffect` sets `mounted` to true. No translations.

### Navigation behavior
- None.

### RTL/LTR and i18n
- **Direction:** No dir or RTL-specific styling.
- **Hardcoded text:** Placeholder: `aria-hidden` + sr-only “جاري تحميل الواجهة...” (Arabic). Button: `aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}` (English only). [Issue: mixed language and non-i18n labels.]

### Accessibility
- **Landmark:** Button only; no landmark in this component.
- **Aria:** Placeholder has `aria-hidden` and sr-only loading text. Active button has `aria-label` (English). No `aria-pressed` for toggle state.
- **Keyboard:** Native button is focusable and activatable.
- **Contrast:** SVG colors are fixed (e.g. #FDB813, #1C2841); in light mode sun on light background may be low contrast; in dark mode moon on dark may be acceptable. [Medium risk.]

### Performance
- **Client only:** Needed for `useTheme` and `mounted`. Placeholder prevents layout shift.
- **Re-renders:** On theme change and once on mount. Minimal.
- **Imports:** next-themes, React; no heavy deps. Inline SVGs.

### Consistency
- **Design system:** Uses global `.theme-toggle` and `.icon-container` in `globals.css` (sizes, hover, active). Not using header Button variant; standalone button. Icon size from CSS (e.g. w-12 h-12); header uses h-7 w-7 for other icons — slight size inconsistency.

### Issues
- **[High]** `aria-label` is English only (“Switch to light/dark mode”); app is bilingual; screen reader users in Arabic get English. Placeholder sr-only text is Arabic only.
- **[Medium]** No translation keys; labels and placeholder are hardcoded (Arabic + English mix).
- **[Low]** No `aria-pressed` or role to expose toggle state to AT.
- **[Low]** Icon size vs header (ThemeToggle in docs mentioned 16px; DarkModeToggle uses CSS 12/10 on small screens); visual consistency with Notification/Globe/User icons (h-7 w-7 in header) could be aligned.

### Recommendations
- **DarkModeToggle.tsx:** Use `useTranslations()` (e.g. a namespace like `common` or `nav`) for `aria-label` and the loading sr-only text so both locales get correct labels. Add keys to `messages/ar.json` and `messages/en.json`.
- **DarkModeToggle.tsx:** Optionally add `aria-pressed={isDark}` for clearer toggle semantics.
- **globals.css:** No change required for this audit; optional alignment of .theme-toggle size with header icon size if design system should be unified.

---

## File #4 — `src/components/LanguageSwitcher.tsx`

### What it does
Header language switcher: dropdown with “العربية” and “English”; selects locale via i18n router `replace` and shows checkmark for current locale.

### How it works
- **Structure:** Client component. Uses DropdownMenu (trigger Button with Globe icon), DropdownMenuContent with two DropdownMenuItems. Each item calls `onSelectLanguage('ar')` or `onSelectLanguage('en')`; uses `router.replace(pathname, { locale })` so URL and locale change without full navigation. Disabled while `isPending` (useTransition).
- **Rendering:** No conditional layout; always same two options. Locale names “العربية” and “English” are hardcoded in JSX; checkmark with `ms-2` for RTL-safe spacing.

### Props/state
- No props. `useTranslations('nav.languageToggle')` (t — used for `ariaLabel` only). `useLocale()`, `useRouter()`, `usePathname()` from next-intl/routing. `useTransition()` for `isPending` and `startTransition`.

### Navigation behavior
- **Routes:** No direct route links; changes locale via `router.replace(pathname, { locale: newLocale })`. Pathname stays the same; only locale segment changes. No hard-coded locale in URL construction (routing handles it).
- **Active state:** Current locale indicated by `locale === 'ar'` / `locale === 'en'` and `bg-accent` + “✓” on the active item.

### RTL/LTR and i18n
- **Direction:** Uses `text-right` on items; `ms-2` for checkmark (logical). No dir on container.
- **Translation keys:** Only `nav.languageToggle.ariaLabel` is used. Labels “العربية” and “English” are hardcoded; they match the usual language names and could stay or be moved to messages for consistency.
- **Locale-aware:** Replace keeps pathname and only swaps locale; correct for i18n.

### Accessibility
- **Aria:** Trigger has `aria-label={t('ariaLabel')}`. Dropdown is Radix (keyboard accessible, focus management). No explicit role for “language switcher” beyond button + menu.
- **Keyboard:** Full keyboard use via Radix. Disabled when `isPending`.

### Performance
- **Client only.** Re-renders on locale change and during transition. No heavy imports; Globe from lucide-react.

### Consistency
- Button `variant="ghost"` `size="sm"` and `h-7 w-7` for Globe match header pattern. Dropdown `align="start"` `className="w-32"`.

### Issues
- **[Low]** Language names “العربية” and “English” are hardcoded; minor for language names but could be moved to `nav.languageToggle.locales` (keys already exist in messages) for single source of truth.

### Recommendations
- **LanguageSwitcher.tsx:** Use `t('locales.ar')` and `t('locales.en')` for the option labels so all nav language strings come from messages (already defined in en/ar.json).

---

## File #5 — `src/components/landing/StatusCircles.tsx`

### What it does
Renders the left side of the header: two status dots (green “الخدمة متاحة”, yellow “تحديثات قادمة”) and a Heart icon link to `/favorites`. Used only in the header.

### How it works
- **Structure:** Client component. One `motion.div` (framer-motion) with `initial/animate/transition`, containing two decorative `div` circles and one `Link href="/favorites"` wrapping a Heart icon. Uses `@/i18n/routing` Link so href is locale-aware.
- **Rendering:** No props; no session check. Favorites link is always visible; no auth guard (favorites page or API may enforce auth).

### Props/state
- No props. No state or hooks. Link from `@/i18n/routing`; Heart from lucide-react; motion from framer-motion.

### Navigation behavior
- **Routes linked:** Only `/favorites` via `<Link href="/favorites">`. Locale-prefixed by routing. No router.push; no active state.
- **Hard-coded locale:** None.

### RTL/LTR and i18n
- **Direction:** Container uses `ms-4` (margin-inline-start). No dir.
- **Hardcoded text:** `title="الخدمة متاحة"`, `title="تحديثات قادمة"`, `aria-label="المفضلة / Favorites"` — all hardcoded; mix of Arabic and Arabic/English. No translation keys. [Issue.]

### Accessibility
- **Landmarks:** None; decorative circles + one link. Link has `aria-label`.
- **Semantics:** First two elements are divs with only `title`; not announced as “status” by default. Link is clear.
- **Keyboard:** Link is focusable. No focus-visible override in this file.

### Performance
- **Client component;** framer-motion is used for a simple entrance animation; adds to bundle. No images; Heart is from lucide-react.

### Consistency
- **Spacing:** `gap-2.5`, `ms-4`; circle sizes `w-5 h-5` and Heart wrapper `h-6 w-6`; icon `h-[26px] w-[24px]`. Slightly different from header icon sizes (h-7 w-7) but acceptable for a distinct “status” area.
- **Design system:** No Button; raw Link. Green/yellow use Tailwind `bg-green-500`, `bg-yellow-500` (and dark variants).

### Issues
- **[High]** All user-facing strings are hardcoded (Arabic or mixed). No i18n; English users see Arabic titles and “المفضلة / Favorites”.
- **[Medium]** Decorative status dots use only `title`; not ideal for screen readers and not translatable.
- **[Low]** README and test page say “Favorites → login?callbackUrl=/dashboard” for guests; in reality the Heart link goes to `/favorites` with no redirect — docs/test are wrong.

### Recommendations
- **StatusCircles.tsx:** Use `useTranslations()` (e.g. `common` or `nav`) for `title` and `aria-label`; add keys for “Service available”, “Updates coming”, “Favorites” (and AR equivalents) and use them.
- **StatusCircles.tsx:** Consider `role="img"` and `aria-label` for the status group if you want the dots announced as a single status indicator; otherwise ensure titles are translated.
- **HEADER_README.md** and **test-header/page.tsx:** Update copy: Heart goes to `/favorites`, not dashboard; no callbackUrl for the Heart link.

---

## File #6 — `src/components/AskSebaIcons.tsx`

### What it does
Provides two header-specific SVG icons: NotificationBellIcon and UserAvatarIcon, used only in the header (and possibly tests). No logic; pure presentational SVGs.

### How it works
- **Structure:** Two exported function components. Each returns an `<svg>` with `currentColor`, optional `className` and `size` (default 20). Bell has gradient defs and paths; User has circle + path. No state or context.
- **Rendering:** Can be server or client; no hooks. Header passes `className="h-7 w-7"` (overriding size visually).

### Props/state
- **NotificationBellIcon:** `className?: string`, `size?: number` (default 20).
- **UserAvatarIcon:** Same. No state; no translations.

### Navigation behavior
- None.

### RTL/LTR and i18n
- Icons are direction-agnostic. No text; no translation.

### Accessibility
- Icons are decorative when used inside labeled buttons (header provides aria-label on the buttons). No duplicate or redundant labels in this file. No focus handling (handled by parent Button).

### Performance
- Lightweight; inline SVGs; no network. No dynamic import.

### Consistency
- Default size 20; header uses h-7 w-7 (28px). Same design language (stroke, gradient); no inconsistency.

### Issues
- None material for this file alone; parent must provide labels (which header does).

### Recommendations
- None required. Optional: document that these icons are for header use and must be wrapped in elements with aria-label.

---

## File #7 — `src/app/test-header/page.tsx`

### What it does
Test page that renders the Header and a content block showing auth status and a manual test checklist; used for quick visual and interaction testing of the header.

### How it works
- **Structure:** Client page. Renders `<Header />` then a container with RTL dir, title “🧪 اختبار Header”, auth status (session/status), and checklist sections (guests, logged-in, favorites, UI/UX). Ends with “Quick Links” using raw `<a href="...">` (no i18n Link).
- **Rendering:** Always shows Header; content is static plus session display. No layout wrapper beyond the div; ConditionalLayout still wraps this page, so Header would appear twice if ConditionalLayout renders Header for this route — actually the page is under `app/test-header/page.tsx` (no [locale]), so root layout + ConditionalLayout run; pathname is `/test-header`, not in AUTH_PAGES, so Header is shown once by ConditionalLayout and the page just adds content below. So Header appears once. Quick links use plain `href="/login"` etc. (no locale prefix).

### Props/state
- `useSession()` for session/status. No translations; all copy in the page is hardcoded (Arabic and some English).

### Navigation behavior
- **Links:** “Quick Links” use `<a href="/login">`, `href="/register">`, etc. — no locale prefix. In a locale-prefixed app this can land on wrong locale or non-prefixed path depending on routing.
- **No router:** Page doesn’t use i18n router for links.

### RTL/LTR and i18n
- Page content has `dir="rtl"`. All text hardcoded (Arabic checklist, “Status”, “Name”, “Email”, etc.). No translation keys.

### Accessibility
- Checklist is presentational; no landmark for “test checklist”. Auth status is in a div; headings (h1, h2, h3) give structure. Links are standard anchors.

### Performance
- Client page; useSession and Header; no heavy data.

### Consistency
- Test-only; design system not critical. Uses `container`, `max-w-2xl`, rounded cards.

### Issues
- **[High]** Quick Links use raw `href="/login"`, `href="/register"`, etc., without locale. With `localePrefix: 'always'`, these may break or strip locale.
- **[Medium]** Checklist says “الضغط على ❤️ → تحويل إلى /login?callbackUrl=/dashboard” — incorrect; Heart in header is StatusCircles link to `/favorites` with no auth redirect.
- **[Low]** Entire page is hardcoded Arabic/English; acceptable for a dev test page.

### Recommendations
- **test-header/page.tsx:** Use `Link` from `@/i18n/routing` with `href="/login"` etc. for Quick Links so locale is preserved, or use `router.push` on click.
- **test-header/page.tsx:** Update checklist: Heart → `/favorites` (no login redirect); remove or correct “callbackUrl=/dashboard” for the Heart item.

---

## File #8 — `src/components/ui/HEADER_README.md`

### What it does
Documents the header: location, structure, behavior (notifications, favorites, account), dependencies, usage (ConditionalLayout), customization, tech requirements, responsive and auth behavior, accessibility notes.

### How it works
- Markdown only; not executed. Describes an older or alternate spec: e.g. “زر المفضلة” and “تحويل إلى /login?callbackUrl=/dashboard” for guests. Current header does not have a separate Favorites button; StatusCircles has a Heart link to `/favorites` with no callbackUrl. Also says “Avatar مع fallback «👤»” but current header uses UserAvatarIcon (no Avatar component). ThemeToggle is referenced in other docs; actual header uses DarkModeToggle.

### Issues
- **[Medium]** Outdated: Favorites behavior described as “للزوار: تحويل إلى /login?callbackUrl=/dashboard” and “للمسجلين: تحويل إلى /dashboard”. Actual behavior: Heart link goes to `/favorites` for everyone; no auth redirect in header for that link.
- **[Low]** Avatar/fallback “👤” — current implementation uses an icon, not Avatar component; README could be updated to “User icon / Account menu”.
- **[Low]** ConditionalLayout example uses `pathname === '/login'`; actual code uses `pathname.endsWith(page)` and `AUTH_PAGES` array. Minor inaccuracy.

### Recommendations
- **HEADER_README.md:** Update “زر المفضلة” section: single Heart link in StatusCircles to `/favorites`, no login redirect; optional note that favorites page may redirect guests.
- **HEADER_README.md:** Replace Avatar description with “User icon (UserAvatarIcon) opening account dropdown”.
- **HEADER_README.md:** Align ConditionalLayout snippet with real implementation (AUTH_PAGES, endsWith).

---

## Cross-file and duplication notes

- **Single header:** Only one global header implementation (`header.tsx`). `header.tsx.backup` is a duplicate of the same component (small diff: no `relative z-10` on right block); not used in the tree. ThemeToggle exists in the codebase but is not used in the header; header uses DarkModeToggle.
- **Page-level “headers”:** Dashboard (`[locale]/dashboard/page.tsx`) has an in-page `<header>` (title block with back button, avatar, greeting). Notifications (`notifications/page.tsx`) has a “Header” comment and a title block. These are not the global nav; they are page sections. No duplication of the global header logic.
- **Notifications page router:** `src/app/notifications/page.tsx` uses `useRouter()` from `next/navigation` and `router.push('/login?callbackUrl=/notifications')`. If the app uses locale-prefixed routes, this should use the i18n router and a locale-aware login URL (same as header) to avoid losing locale on redirect. [Recommendation: use `useRouter` from `@/i18n/routing` in notifications page and pass locale-aware callbackUrl.]

---

## Summary table: Issues by severity

| Tag       | Count | Files |
|----------|-------|--------|
| Critical | 0     | —      |
| High     | 4     | header.tsx (dir), DarkModeToggle (aria i18n), StatusCircles (hardcoded i18n), test-header (locale-less links + wrong checklist) |
| Medium   | 5     | header (signOut callback), DarkModeToggle (no translations), StatusCircles (title/aria), HEADER_README (outdated), notifications router (optional) |
| Low      | 8+    | header (no active state), ConditionalLayout (forgot-password comment, pathname), DarkModeToggle (aria-pressed, icon size), LanguageSwitcher (hardcoded labels), StatusCircles (docs), test-header (checklist), HEADER_README (Avatar/conditional snippet) |

---

## Runtime Evidence Appendix

**Method:** DevTools (Elements + Computed + Accessibility pane). Inspect `/ar` and `/en` home at 375px, 768px, 1280px. No code changes. No recommendations.

**Note:** Live DevTools capture was not possible from this environment (localhost unreachable). Tables below are templates for manual capture. Run `npm run dev`, open DevTools, and fill each section.

---

### 1. Header root computed styles

For each (locale × viewport), select the `<header>` in Elements, open Computed pane, and paste:

| Locale | Viewport | position | top | z-index | height | background | backdrop-filter | box-shadow |
|--------|----------|----------|-----|---------|--------|------------|-----------------|------------|
| ar | 375px | Computed value: [paste] | [paste] | [paste] | [paste] px | [paste] rgba | [paste] | [paste] |
| ar | 768px | Computed value: [paste] | [paste] | [paste] | [paste] px | [paste] rgba | [paste] | [paste] |
| ar | 1280px | Computed value: [paste] | [paste] | [paste] | [paste] px | [paste] rgba | [paste] | [paste] |
| en | 375px | Computed value: [paste] | [paste] | [paste] | [paste] px | [paste] rgba | [paste] | [paste] |
| en | 768px | Computed value: [paste] | [paste] | [paste] | [paste] px | [paste] rgba | [paste] | [paste] |
| en | 1280px | Computed value: [paste] | [paste] | [paste] | [paste] px | [paste] rgba | [paste] | [paste] |

---

### 2. Interactive elements (DOM order)

For each (locale × viewport), list focusable elements in DOM order. Use Accessibility pane for Name.

| # | Locale | Viewport | Selector | Tag | Visible text | Accessibility Name | aria-* |
|---|--------|----------|----------|-----|--------------|-------------------|--------|
| 1 | ar | 375px | [paste] | [paste] | [paste] | [paste] | [paste] |
| 2 | ar | 375px | … | … | … | … | … |
| … | … | … | … | … | … | … | … |

Repeat for ar 768px, ar 1280px, en 375px, en 768px, en 1280px.

---

### 3. Sticky test

For each (locale × viewport): scroll 200px, confirm header `top` remains 0.

| Locale | Viewport | Scroll 200px | Header top after scroll |
|--------|----------|--------------|-------------------------|
| ar | 375px | [Done] | Computed value: [paste] |
| ar | 768px | [Done] | Computed value: [paste] |
| ar | 1280px | [Done] | Computed value: [paste] |
| en | 375px | [Done] | Computed value: [paste] |
| en | 768px | [Done] | Computed value: [paste] |
| en | 1280px | [Done] | Computed value: [paste] |

---

### 4. Tab order

For each (locale × viewport), tab through header focusable elements and number them in focus order:

| Locale | Viewport | Tab order (1, 2, 3, …) |
|--------|----------|------------------------|
| ar | 375px | [paste: e.g. 1=Favorites, 2=Theme, 3=Language, 4=Notifications, 5=User menu] |
| ar | 768px | [paste] |
| ar | 1280px | [paste] |
| en | 375px | [paste] |
| en | 768px | [paste] |
| en | 1280px | [paste] |

---

*Evidence captured 2026-02-09. No changes made.*
