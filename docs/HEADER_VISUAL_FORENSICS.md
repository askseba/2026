# Header Visual Forensics (Read-Only)

**Goal:** Measurement-based evidence of how the global header renders and behaves.  
**Method:** Code-derived logic (ConditionalLayout, header component, globals.css) and Tailwind class mapping to computed values. No code changes; no recommendations or fixes. For exact computed values at a given viewport/theme, use DevTools → Elements → select the `<header>` → Computed.

---

## 1. ConditionalLayout logic (source of truth)

**File:** `src/components/ConditionalLayout.tsx`

```ts
const AUTH_PAGES = ['/login', '/register', '/forgot-password']

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideLayout = AUTH_PAGES.some((page) => pathname.endsWith(page))

  if (hideLayout) {
    return <>{children}</>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
```

**Header presence rule:**

- **Shown:** When `pathname.endsWith(page)` is false for every `page` in `AUTH_PAGES`.
- **Hidden:** When pathname ends with `/login`, `/register`, or `/forgot-password` (e.g. `/en/login`, `/ar/register`).

Pathname comes from `usePathname()` (Next.js). For `[locale]` routes it is locale-prefixed (e.g. `/en`, `/ar/about`, `/en/quiz/step1-favorites`). For non-locale routes (e.g. `/notifications`) pathname is `/notifications` — none of these match `AUTH_PAGES`, so header is shown. Viewport does not affect this logic (no media queries or viewport checks in ConditionalLayout).

---

## 2. Header presence: route × locale × viewport

Viewport does not change header presence; the same rule applies at 320, 375, 768, 1024, and 1280 px.

| Route            | Path (example)              | Locale ar | Locale en | Why (ConditionalLayout)                    |
|-----------------|-----------------------------|-----------|-----------|--------------------------------------------|
| home            | /ar, /en                    | Shown     | Shown     | pathname does not end with auth segment    |
| about           | /ar/about, /en/about        | Shown     | Shown     | same                                       |
| faq             | /ar/faq, /en/faq            | Shown     | Shown     | same                                       |
| privacy         | /ar/privacy, /en/privacy    | Shown     | Shown     | same                                       |
| favorites       | /ar/favorites, /en/favorites| Shown     | Shown     | same                                       |
| notifications   | /notifications              | Shown     | Shown     | pathname `/notifications` ≠ auth           |
| quiz (landing)  | /ar/quiz, /en/quiz          | Shown     | Shown     | same                                       |
| step1           | /ar/quiz/step1-favorites, … | Shown     | Shown     | same                                       |
| step2           | /ar/quiz/step2-disliked, …  | Shown     | Shown     | same                                       |
| step3           | /ar/quiz/step3-allergy, …   | Shown     | Shown     | same                                       |
| results         | /ar/results, /en/results    | Shown     | Shown     | same                                       |
| profile         | /ar/profile, /en/profile    | Shown     | Shown     | same                                       |
| dashboard       | /ar/dashboard, /en/dashboard| Shown     | Shown     | same                                       |
| login           | /ar/login, /en/login        | Hidden    | Hidden    | pathname.endsWith('/login')                |
| register        | /ar/register, /en/register  | Hidden    | Hidden    | pathname.endsWith('/register')             |

**Viewports:** 320, 375, 768, 1024, 1280 — header presence is identical at all of these for each (route, locale) above.

**forgot-password:** No page exists under `src/app` for this path; the link in the login page points to `/forgot-password`. If that URL is ever rendered (e.g. redirect or future page), ConditionalLayout would hide the header because `pathname.endsWith('/forgot-password')` is in `AUTH_PAGES`.

---

## 3. Computed style snapshots (header root)

**Header element:** `src/components/ui/header.tsx` — the root `<header>`.

**Applied class string (source):**

```tsx
className="sticky top-0 z-50 h-14 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:supports-[backdrop-filter]:bg-surface-elevated/60"
```

**Derived computed values** from Tailwind defaults and `src/app/globals.css` tokens:

### 3.1 Layout / stacking

| Property   | Value        | Source (Tailwind/theme)     |
|-----------|---------------|-----------------------------|
| position  | sticky        | `sticky`                     |
| top       | 0px           | `top-0`                      |
| z-index   | 50            | `z-50`                       |
| height    | 56px          | `h-14` (14 × 4px)            |

### 3.2 Background (light mode)

| Condition                    | Property    | Computed value (derived)                    | Source token / class |
|-----------------------------|------------|---------------------------------------------|----------------------|
| No backdrop-filter support | background | rgba(255, 255, 255, 0.95)                   | `--color-background`: 255 255 255; `bg-background/95` |
| With backdrop-filter support| background | rgba(255, 255, 255, 0.6)                    | `supports-[backdrop-filter]:bg-background/60` |

### 3.3 Background (dark mode, `.dark` on root)

| Condition                    | Property    | Computed value (derived)   | Source token / class |
|-----------------------------|------------|-----------------------------|----------------------|
| No backdrop-filter support | background | (same as light if no dark bg without supports) — header uses dark only with `supports-[backdrop-filter]` for the /60 variant | — |
| With backdrop-filter support| background | rgba(10, 10, 10, 0.6)       | `--color-surface-elevated`: 10 10 10; `dark:supports-[backdrop-filter]:bg-surface-elevated/60` |

### 3.4 Backdrop and decoration

| Property       | Value (exact from Tailwind) | Note |
|----------------|-----------------------------|------|
| backdrop-filter| blur(8px)                   | Tailwind default for `backdrop-blur` (no suffix). Verify in DevTools: “Computed” for the header. |
| box-shadow    | none                        | No shadow class on `<header>`. |
| border        | none                        | No border class on `<header>`. |

**Note:** The header has `dir="rtl"` (hardcoded in JSX). No border or box-shadow in the component.

---

## 4. Sticky behavior evidence

**Layout structure (when header is shown):**

```tsx
<div className="flex flex-col min-h-screen">
  <Header />   <!-- sticky top-0 z-50 h-14 -->
  <main className="flex-1">
    {children}
  </main>
  <Footer />
</div>
```

- **Overlap:** The header is in normal flow with a fixed height (56px). When sticky, it stays at `top: 0` and scrolls with the page until it “sticks”; content below it is in `<main>`, so the first 56px of layout are reserved for the header. While stuck, the header overlaps the scrolling content (same 56px at top); there is no extra layout offset beyond that 56px.
- **Layout offset:** The header occupies 56px at the top; `<main>` starts below it. No additional padding/margin on the wrapper for the header.
- **Layout shift:** Theme is applied client-side (ThemeProvider, `class` on root). When the theme resolves (light/dark/system), `background` and `backdrop` classes can change (e.g. to `bg-background/60` and `dark:...bg-surface-elevated/60`). No structural layout change (height/position unchanged); only color/opacity can change after hydration, which may produce a brief visual flash, not a reflow of layout. Session change (login/logout) does not change header presence on the same route; on auth routes the header is not mounted, so no shift from header on transition to/from login/register.

---

## 5. Interaction evidence (dropdowns)

### 5.1 LanguageSwitcher dropdown

**File:** `src/components/LanguageSwitcher.tsx`

- **Trigger:** Button (ghost, sm) with Globe icon.
- **Content:** `DropdownMenuContent align="start" className="w-32"`.
- **Alignment:** `align="start"`. With RTL header (`dir="rtl"`), “start” is the right edge of the trigger; dropdown aligns to that side.
- **Overflow:** Content is `w-32` (128px), `overflow-hidden` on DropdownMenuContent (from `dropdown-menu.tsx`). No explicit collision boundary; Radix positions in viewport. At 320px viewport, the dropdown (128px wide) can extend past the left edge if triggered from the right side — alignment/overflow depend on Radix viewport collision behavior.

### 5.2 Account dropdown

**File:** `src/components/ui/header.tsx`

- **Trigger:** Button (ghost, sm) with UserAvatarIcon.
- **Content:** `DropdownMenuContent align="start" className="w-48"`.
- **Alignment:** `align="start"` (same as LanguageSwitcher; RTL start = right).
- **Overflow:** `w-48` (192px). Same as above: viewport-dependent; at 320px, opening from the right may cause overflow or repositioning by Radix.

**Shared dropdown behavior (from `src/components/ui/dropdown-menu.tsx`):**

- `DropdownMenuContent` uses `DropdownMenuPrimitive.Portal`, so content is rendered in a portal (outside the header DOM).
- `sideOffset={4}` (default) — 4px gap between trigger and content.
- Content has `z-50`, same as header; no stacking conflict with header root.
- Animations: `data-[state=open]:animate-in`, `data-[state=closed]:animate-out`, slide/zoom — no alignment values changed in this file.

**Recorded alignment/overflow (from code):**

- **Alignment:** Both dropdowns use `align="start"`; in the header’s RTL context, both align to the logical start (right in RTL).
- **Overflow:** No `position: fixed` or explicit viewport clamping in the component; behavior at 320px and 375px depends on Radix collision detection. No code evidence of clipping inside the header; potential overflow is at the viewport edge.

---

## 6. Summary table (header at a glance)

| Dimension        | Evidence (measurement / code) |
|------------------|---------------------------------|
| Presence         | Shown for all routes except pathname.endsWith('/login' \| '/register' \| '/forgot-password'); same for ar/en and all viewports. |
| position / top / z-index | position: sticky; top: 0px; z-index: 50. |
| height           | 56px (h-14). |
| background-color (light, backdrop supported) | rgba(255, 255, 255, 0.6). |
| background-color (dark, backdrop supported)  | rgba(10, 10, 10, 0.6). |
| backdrop-filter  | blur(8px) (Tailwind default for `backdrop-blur`). |
| box-shadow / border | none on header root. |
| Sticky           | Header in flow; 56px reserved; when sticky, overlaps scrolling content at top; no extra layout offset. |
| Theme/session shift | Possible brief background/opacity change on theme load; no structural layout shift. Session change does not toggle header on same route. |
| LanguageSwitcher | align="start", w-32; RTL start = right; overflow at small viewports depends on Radix. |
| Account dropdown | align="start", w-48; same alignment and overflow note. |

---

**Document generated from codebase only. For exact computed values in a given environment (browser, theme, viewport), copy from DevTools → Elements → header → Computed.**
