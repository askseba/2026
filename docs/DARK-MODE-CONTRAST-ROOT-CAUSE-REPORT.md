# DARK MODE CONTRAST – ROOT CAUSE REPORT

**Issue:** Text appears white/light on light background in dark mode → poor contrast, hard to read.  
**Previous fix:** Added `dark:text-*` variants; text still reported unreadable in dark mode.

---

## TASK 1: ACTUAL CSS VARIABLES (`src/app/globals.css`)

### Light mode (from `@theme inline` – lines 25–40)

```css
@theme inline {
  --color-surface: 255 255 255;
  --color-surface-elevated: 255 255 255;
  --color-surface-muted: 248 250 252;
  --color-background: 255 255 255;
  --color-border-subtle: 228 228 231;
  --color-text-primary: 17 24 39;
  --color-text-secondary: 107 114 128;
  --color-text-muted: 148 163 184;
  --color-accent-primary: 218 168 79;
  /* ... */
}
```

**Reported as:**

| Variable | Light mode value |
|----------|------------------|
| `--color-background` | `255 255 255` |
| `--color-surface` | `255 255 255` |
| `--color-surface-elevated` | `255 255 255` |
| `--color-text-primary` | `17 24 39` (dark gray) |
| `--color-text-secondary` | `107 114 128` |
| `--color-text-muted` | `148 163 184` |

### Dark mode (`.dark` block – lines 43–53)

```css
.dark {
  --color-surface: 15 23 42;
  --color-surface-elevated: 10 10 10;
  --color-surface-muted: 30 41 59;
  --color-background: 5 5 5;
  --color-border-subtle: 51 65 85;
  --color-text-primary: 241 245 249;
  --color-text-secondary: 148 163 184;
  --color-text-muted: 107 114 128;
  --color-accent-primary: 251 191 36;
}
```

**Reported as:**

| Variable | Dark mode value | RGB (approx) | Intended? |
|----------|------------------|--------------|-----------|
| `--color-background` | `5 5 5` | #050505 | ✅ Dark |
| `--color-surface` | `15 23 42` | #0f172a | ✅ Dark |
| `--color-surface-elevated` | `10 10 10` | #0a0a0a | ✅ Dark |
| `--color-text-primary` | `241 245 249` | #f1f5f9 | ✅ Light |
| `--color-text-secondary` | `148 163 184` | #94a3b8 | ✅ Lighter gray |
| `--color-text-muted` | `107 114 128` | #6b7280 | ✅ Muted |

**Analysis:**  
Dark mode values are present and correct: dark backgrounds, light primary text. No missing or inverted values in this file.

---

### `@media (prefers-color-scheme: dark)` (lines 55–60)

```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
```

**Note:** These are **different** variables (`--background`, `--foreground`), not the semantic `--color-*` tokens. They are used in `html`/`body` only if something references them. The semantic tokens used by Tailwind utilities come from `@theme inline` (light) and `.dark` (dark). So this media query does **not** override `--color-surface` or `--color-text-primary`. Dark mode for the app relies on the **class** `.dark`, not this media query.

---

## TASK 2: TAILWIND CONFIG (`tailwind.config.ts`)

**Relevant config:**

```typescript
darkMode: 'class',
theme: {
  extend: {
    colors: {
      surface: 'rgb(var(--color-surface) / <alpha-value>)',
      'surface-elevated': 'rgb(var(--color-surface-elevated) / <alpha-value>)',
      'surface-muted': 'rgb(var(--color-surface-muted) / <alpha-value>)',
      background: 'rgb(var(--color-background) / <alpha-value>)',
      'text-primary': 'rgb(var(--color-text-primary) / <alpha-value>)',
      'text-secondary': 'rgb(var(--color-text-secondary) / <alpha-value>)',
      'text-muted': 'rgb(var(--color-text-muted) / <alpha-value>)',
      'accent-primary': 'rgb(var(--color-accent-primary) / <alpha-value>)',
      'cream-bg': '#FAF8F5',
      // ...
    },
  },
},
```

**Analysis:**  
- `darkMode: 'class'` is set → Tailwind’s `dark:` variant depends on a `.dark` ancestor.  
- Semantic colors correctly use `var(--color-*)`.  
- When `.dark` is on the root, `.dark` overrides those variables in `globals.css`, so Tailwind utilities will use dark values.  
Config is consistent with the CSS variables.

---

## TASK 3: RUNTIME INSPECTION (TO BE DONE IN BROWSER)

**Manual steps:**

1. Run `npm run dev`, open `http://localhost:3000/ar/about`.
2. Toggle dark mode (header theme toggle).
3. Inspect:
   - Root page container:  
     `div` with `className="min-h-screen bg-cream-bg dark:bg-surface text-brand-brown dark:text-text-primary"`.
   - A paragraph with `dark:text-text-primary`.

**Report template:**

```
Element: <div> root container
Computed in DARK mode:
- background-color: [from DevTools]
- Expected: rgb(15, 23, 42) or similar dark
- If still #FAF8F5 → dark:bg-surface not applying (e.g. .dark not on html)

Element: <p> with dark:text-text-primary
Computed in DARK mode:
- color: [from DevTools]
- Expected: rgb(241, 245, 249) or similar light
- If light text on light bg → background not switching to dark (root cause)
```

**If you see light background in dark mode:** the most likely cause is that **`.dark` is not on `<html>`**, so `dark:bg-surface` and `dark:text-text-primary` never apply.

---

## TASK 4: CHECK IF DARK CLASS IS APPLIED

**In browser console (with app in “dark” mode):**

```javascript
document.documentElement.classList.contains('dark')
// Expected: true in dark mode

document.documentElement.getAttribute('class')
// Expected: "dark" or "… dark" when dark
```

**Report template:**

```
Dark mode detection:
- HTML has .dark class: [YES / NO]
- If NO → dark mode not activating (theme provider or script not applying class to html)
- If YES → problem is elsewhere (specificity, or variables not applied)
```

---

## TASK 5: THEME PROVIDER

**Found:** YES  

**Location:** `src/app/layout.tsx` (lines 14, 188, 216)

**Configuration:**

```tsx
import { ThemeProvider } from "next-themes";
// ...
<ThemeProvider attribute="class" defaultTheme="system" storageKey="theme" enableSystem>
  {/* ... children */}
</ThemeProvider>
```

**Details:**  
- `attribute="class"` → next-themes sets `class="dark"` or `class="light"` on the **document root** (`<html>`), not on the provider’s wrapper.  
- `defaultTheme="system"` and `enableSystem` → first load follows OS preference; user can override via toggle.  
- ThemeProvider wraps the app inside `<body>`; the library still targets `document.documentElement` for the class.

**Conclusion:** Theme setup is correct. If the class is not on `<html>` in dark mode, the next check is: **suppressHydrationWarning** and **when** the script runs (e.g. after hydration), so that the class might be missing on first paint or in some navigations.

---

## TASK 6: COMPARE WITH FEEDBACK PAGE

**Feedback page (working in dark mode):**

- Loading state root:  
  `className="min-h-screen bg-cream-bg dark:bg-surface flex items-center justify-center"`  
  with child:  
  `className="text-brand-brown dark:text-text-primary text-xl"`
- Main content root:  
  `className="min-h-screen bg-background/95 dark:bg-surface p-6"`  
  with heading:  
  `className="... text-brand-brown dark:text-text-primary ..."`

**About page (reported broken in dark mode):**

- Root:  
  `className="min-h-screen bg-cream-bg dark:bg-surface text-brand-brown dark:text-text-primary"`

**Difference:**  
- Feedback uses **`bg-background/95`** in light mode (semantic token).  
- About uses **`bg-cream-bg`** in light mode (fixed `#FAF8F5`).

In **dark mode** both rely on **`dark:bg-surface`** and **`dark:text-text-primary`**. So the **pattern is the same**; there is no structural difference that would make Feedback work and About fail. If Feedback truly looks correct in dark mode, then the same classes on About should work **provided** `.dark` is on `<html>`. If About still shows light background, the most likely cause is **when** or **where** the dark class is applied (e.g. only after interaction, or on a different route/layout).

---

## TASK 7: ACTUAL COLOR VALUES – SENSIBILITY CHECK

From `globals.css`:

| Token | In `.dark` | Dark? (bg) / Light? (text) |
|--------|------------|----------------------------|
| `--color-background` | `5 5 5` | ✅ Dark (#050505) |
| `--color-surface` | `15 23 42` | ✅ Dark (#0f172a) |
| `--color-text-primary` | `241 245 249` | ✅ Light (#f1f5f9) |
| `--color-text-secondary` | `148 163 184` | ✅ Light enough |
| `--color-text-muted` | `107 114 128` | ✅ Muted but readable on dark |

**Conclusion:**  
- Dark mode **background** variables are actually dark.  
- Dark mode **text** variables are actually light.  
So the root cause is **not** “wrong values” in this file.

---

## TASK 8: POSSIBLE ROOT CAUSES – CHECKLIST

| # | Check | Result |
|---|--------|--------|
| 1 | CSS variables for dark mode defined? | ✅ YES – `.dark` block in `globals.css` (2 occurrences of `.dark` in file). |
| 2 | Dark class on `<html>` in dark mode? | ⚠️ **VERIFY IN BROWSER** – run Task 4 console checks. If **NO**, theme script or hydration order is the problem. |
| 3 | Dark variables actually dark/light? | ✅ YES – backgrounds dark, text light (Task 7). |
| 4 | Tailwind reading variables? | ✅ YES – `tailwind.config.ts` uses `var(--color-*)` and `darkMode: 'class'`. |

---

## DELIVERABLE: ROOT CAUSE SUMMARY

### What’s already correct

- **Dark mode CSS variables** in `.dark` are defined and sensible (dark bg, light text).  
- **Tailwind** is set to `darkMode: 'class'` and semantic colors use CSS variables.  
- **ThemeProvider** is present and configured with `attribute="class"`.  
- **About page** uses the same pattern as Feedback (`dark:bg-surface`, `dark:text-text-primary`).

### Most likely cause of “light text on light background in dark mode”

**The `.dark` class is not present on `<html>` when the user expects dark mode.**

Then:

- `dark:bg-surface` never applies → the About root keeps **`bg-cream-bg`** (#FAF8F5).
- `dark:text-text-primary` never applies → some text may still be light (e.g. from body or other rules), so you get **light text on light background**.

### What to do next (in order)

1. **Confirm in browser**
   - Toggle to dark mode.
   - Run:  
     `document.documentElement.classList.contains('dark')`  
     and  
     `document.documentElement.getAttribute('class')`.
   - If **false** / no `"dark"` in class → fix **theme application** (see below).

2. **If `.dark` is missing from `<html>`**
   - Ensure the layout that contains `ThemeProvider` is the one rendering for `/ar/about` (no layout that strips or overrides the provider).
   - Check for any script or style that removes or overrides `html`’s `class`.
   - Consider forcing the class for testing, e.g. in `layout.tsx`:  
     `<html lang="…” class={resolvedTheme} suppressHydrationWarning>` and pass the theme from a client wrapper that uses `useTheme()` and sets the class on `document.documentElement` if next-themes doesn’t do it in your setup.

3. **If `.dark` is present but background is still light**
   - In DevTools, check computed `background-color` on the About root `div`:  
     - If it’s `rgb(15, 23, 42)` (or similar) but the page still looks light, something else is painting over it (e.g. another full-screen layer).  
     - If it’s still `#FAF8F5`, then `dark:bg-surface` is not winning (e.g. specificity or order); in that case, inspect which rule is winning and adjust (e.g. ensure `globals.css` and Tailwind output order, or avoid overriding `dark:` with a stronger rule).

4. **Optional: make dark mode independent of JS**
   - Duplicate the semantic token overrides inside `@media (prefers-color-scheme: dark)` so that when the **system** is dark, at least the variables are dark even before the theme script runs. That would not fix “toggle says dark but class not on html,” but would improve the case where the user’s system is dark and the script is slow or missing.

---

**Report generated from codebase analysis.**  
**Run Tasks 3 and 4 in the browser and fill the templates above to confirm the root cause.**
