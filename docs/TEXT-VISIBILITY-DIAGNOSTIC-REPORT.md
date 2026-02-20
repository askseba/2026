# TEXT VISIBILITY DIAGNOSTIC REPORT

**Date:** 2025-02-07  
**Scope:** About, FAQ, Privacy, Feedback pages  
**User Report:** Text invisible/hidden in light/dark modes after recent changes

---

## TASK 1: EXACT COLOR ANALYSIS

### About Page (`src/app/[locale]/about/page.tsx`)

| Line | Element | Light Mode Class | Dark Mode Class | Problem? |
|------|---------|------------------|-----------------|----------|
| 31 | Root div | `bg-cream-bg text-brand-brown` | NONE | **YES** – Page has no `dark:bg-*` or `dark:text-*`; in dark mode inherits body dark bg, brown text on dark = invisible |
| 97 | Back link | `text-brand-brown` | NONE | **YES** – Same as root |
| 108 | Hero section | `bg-gradient-to-br from-gradient-start to-brand-gold text-white` | NONE | NO – text-white on gradient; gradient has no dark variant but white on gold/brown = visible |
| 110 | Hero h1 | `text-white` | NONE | NO – visible on gradient |
| 113 | Hero subtitle | `text-white/90` | NONE | NO – visible on gradient |
| 136 | Section h2 | `text-brand-brown` | `dark:text-text-primary` | NO – card has dark:text-text-primary |
| 140 | Section body p | `text-brand-brown` | `dark:text-text-primary` | NO |
| 145 | Section bullets ul | `text-brand-brown` | `dark:text-text-primary` | NO |
| 167 | Stat number | `text-brand-gold` | NONE | **YES** – No dark variant; gold on white/90 in dark could be low contrast |
| 170 | Stat label | `text-brand-brown` | NONE | **YES** – No dark variant; in dark mode if card bg stays white/90, brown may show but page might inherit dark |
| 188 | Testimonial card | `border-brand-brown/20` + hover | `dark:border-[var(--color-text-primary)]/20` | NO |
| 191 | Testimonial quote | `text-brand-brown` | `dark:text-text-primary` | NO |
| 192 | Testimonial author | `text-brand-brown` | `dark:text-text-primary` | NO |
| 211 | Value h3 | `text-brand-brown` | `dark:text-text-primary` | NO |
| 212 | Value description | `text-brand-brown/80` | `dark:text-text-muted` | NO |
| 223 | Final CTA section | `bg-white/90` | NONE | Card has no dark bg |
| 225 | CTA h2 | (none) | (none) | **YES** – Inherits `text-brand-brown` from root; no explicit color |
| 226 | CTA p | (none) | (none) | **YES** – Same inheritance; in dark mode brown on white/90 may show but risky |

---

### FAQ Page (`src/app/[locale]/faq/page.tsx`)

| Line | Element | Light Mode Class | Dark Mode Class | Problem? |
|------|---------|------------------|-----------------|----------|
| 32 | Root div | `bg-cream-bg text-brand-brown` | NONE | **YES** – No dark mode |
| 37 | Back link | `text-brand-brown` | NONE | **YES** |
| 50 | Hero h1 | `text-brand-brown` | NONE | **YES** – In dark mode, brown on dark bg = invisible |
| 53 | Hero subtitle | `text-brand-brown/80` | NONE | **YES** |
| 66 | Search icon | `text-brand-brown/40` | NONE | **YES** – Very low contrast in dark |
| 75 | Search input | `text-brand-brown` | NONE | **YES** |
| 89 | Category h2 | `text-brand-brown` | NONE | **YES** |
| 102 | Accordion.Trigger | `text-brand-brown` | NONE | **YES** |
| 108 | Accordion.Content | `text-brand-brown/80` | NONE | **YES** |
| 112 | Answer p | `whitespace-pre-line lg:text-justify` | NONE | **YES** – **NO color class**; inherits from parent Accordion.Content (text-brand-brown/80), but Content has no dark variant |

---

### Privacy Page (`src/app/[locale]/privacy/page.tsx`)

| Line | Element | Light Mode Class | Dark Mode Class | Problem? |
|------|---------|------------------|-----------------|----------|
| 55 | Root div | `bg-cream-bg text-brand-brown` | NONE | **YES** |
| 61 | Back button | `text-brand-brown` | NONE | **YES** |
| 73 | Hero h1 | `text-brand-brown` | NONE | **YES** |
| 76 | Hero subtitle | `text-brand-brown/80` | NONE | **YES** |
| 79 | Hero lastUpdated | `text-brand-brown/60` | NONE | **YES** |
| 92 | TOC h3 | `text-brand-brown` | NONE | **YES** |
| 102-103 | TOC buttons | `text-brand-brown/70` / `text-brand-brown` | NONE | **YES** |
| 120 | Summary title | `text-brand-brown` | NONE | **YES** |
| 124 | Summary bullet p | `text-base lg:text-justify` | NONE | **YES** – No color; inherits text-brand-brown |
| 150 | Accordion.Trigger | `text-brand-brown` | NONE | **YES** |
| 158 | Accordion.Content | `text-brand-brown/80` | NONE | **YES** |
| 164 | Content p | `whitespace-pre-line lg:text-justify` | NONE | **YES** – No color class |
| 179, 184, 188, 209 | Contact/compliance | `text-[var(--color-primary)]` / `text-[var(--color-text-primary)]/60` | NONE | **PARTIAL** – Uses CSS vars; `--color-text-primary` changes in dark, so might work |

---

### Feedback Page (`src/app/[locale]/feedback/page.tsx`)

| Line | Element | Light Mode Class | Dark Mode Class | Problem? |
|------|---------|------------------|-----------------|----------|
| 140 | Loading container | `bg-cream-bg dark:bg-surface` | YES | Root has dark mode |
| 144 | Loading text | `text-brand-brown` | `dark:text-text-primary` | NO – Has dark variant |
| 148 | Main container | `bg-background/95 dark:bg-surface` | YES | Has dark mode |
| 153 | Main h1 | `text-brand-brown` | `dark:text-text-primary` | NO – Has dark variant |
| 165 | Stats message span | `text-green-700 dark:text-green-300` | YES | NO – Has dark variant |
| 210 | Empty state div | `text-brand-brown/60` | `dark:text-text-muted` | NO – Has dark variant |

**Feedback page is correctly configured with dark mode variants.**

---

## TASK 2: CSS VARIABLE CHECK

From `src/app/globals.css`:

```css
/* @theme inline (light) */
--color-surface: 255 255 255;
--color-background: 255 255 255;
--color-text-primary: 17 24 39;   /* dark gray - for light mode text */
--color-text-muted: 148 163 184;

/* .dark overrides */
--color-surface: 15 23 42;
--color-background: 5 5 5;
--color-text-primary: 241 245 249;  /* light gray - for dark mode text */
--color-text-muted: 107 114 128;
```

**Note:** `--color-brand-brown` is NOT defined in globals.css. `text-brand-brown` and `bg-brand-brown` come from tailwind.config.ts or project conventions (brand-brown ≈ dark-brown #5B4233).

---

## TASK 3: BACKGROUND vs TEXT COLOR MATRIX

| Page | Element | Background | Text (Light) | Text (Dark) | Contrast Issue? |
|------|---------|------------|--------------|-------------|-----------------|
| About | Root | cream-bg | text-brand-brown | (inherited brown) | **YES** – In dark mode, page may inherit body dark bg; brown on dark = invisible |
| About | Stats label L170 | white/90 | text-brand-brown | (none) | **YES** – No dark variant; if parent goes dark, invisible |
| About | CTA h2/p L225-226 | white/90 | (inherited) | (inherited) | **YES** – Same risk |
| FAQ | Hero h1 L50 | cream-bg | text-brand-brown | (none) | **YES** – In dark mode, brown on dark = invisible |
| FAQ | Accordion content L108 | (card bg) | text-brand-brown/80 | (none) | **YES** |
| FAQ | Answer p L112 | (inherited) | (inherited brown/80) | (none) | **YES** – Inherits; no own color |
| Privacy | Hero h1 L73 | cream-bg | text-brand-brown | (none) | **YES** |
| Privacy | Summary bullets L124 | brand-gold/10 | (inherited) | (none) | **YES** |
| Privacy | Accordion content L158 | white/90 | text-brand-brown/80 | (none) | **YES** |

---

## TASK 4: IDENTIFY EXACT PROBLEM

### About Page
**Element:** Root div (line 31), Stats label (line 170), CTA h2/p (lines 225-226)  
**Problem:** Invisible in dark mode (when page/body uses dark background)

**Current classes (root):**
```
className="min-h-screen bg-cream-bg text-brand-brown"
```
**Background:** cream-bg (#FAF8F5) – but in dark mode, if layout/body forces dark, the explicit cream may not win.  
**Why invisible:** No `dark:bg-surface` or `dark:text-text-primary`; brown text on dark background = invisible.

---

### FAQ Page
**Element:** Hero h1 (L50), subtitle (L53), category h2 (L89), Accordion.Trigger (L102), Accordion.Content (L108), answer p (L112)  
**Problem:** Invisible in dark mode

**Current classes (hero h1):**
```
className="text-3xl md:text-4xl font-bold mb-4 text-brand-brown"
```
**Background:** cream-bg  
**Why invisible:** Entire FAQ page has zero `dark:text-*` variants. In dark mode, text-brand-brown (dark brown) on dark background = invisible.

---

### Privacy Page
**Element:** Hero h1 (L73), subtitle (L76), TOC h3 (L92), TOC buttons (L102-103), Summary title (L120), Summary bullets p (L124), Accordion.Trigger (L150), Accordion.Content (L158), content p (L164)  
**Problem:** Invisible in dark mode

**Current classes (hero h1):**
```
className="text-3xl md:text-4xl font-bold mb-4 text-brand-brown"
```
**Why invisible:** Same as FAQ – no dark mode text variants anywhere.

---

### Feedback Page
**Status:** Correctly implemented with `dark:text-text-primary` and `dark:text-text-muted` where needed.

---

## TASK 5: RECENT CHANGES IMPACT (git diff HEAD~3)

**Did we accidentally:**
- [x] Remove dark mode colors when adding `lg:text-justify`? **NO** – Git diff shows only ADDITION of `lg:text-justify`; no color classes were removed.
- [ ] Change text-X to something that conflicts? **NO**
- [ ] Break color inheritance? **NO**

**Specific diff findings:**
- About: Added `lg:text-justify` to h2, p, ul, value h3/p – **colors unchanged**
- FAQ: Changed `text-right` → `text-start` on Trigger; added `lg:text-justify` to Content and answer p – **colors unchanged**
- Privacy: Added `cn()`, `lg:text-justify`, direction-based classes – **colors unchanged**

**Conclusion:** The `lg:text-justify` changes did NOT remove any dark mode colors. The visibility issues stem from **pre-existing absence of dark mode variants** on FAQ and Privacy, and partial gaps on About.

---

## DELIVERABLE: VISIBILITY ISSUE REPORT

### About Page

**Issue 1**
- Element: Root div (line 31)
- Visible in light: YES
- Visible in dark: NO (when page inherits dark background)
- Root cause: No `dark:bg-surface` or `dark:text-text-primary` on root
- Current className: `min-h-screen bg-cream-bg text-brand-brown`
- Fix needed: Add `dark:bg-surface dark:text-text-primary`

**Issue 2**
- Element: Back link (line 97)
- Visible in light: YES
- Visible in dark: NO
- Root cause: No dark variant
- Current className: `flex items-center gap-2 text-brand-brown mb-6 hover:text-brand-gold transition-colors`
- Fix needed: Add `dark:text-text-primary dark:hover:text-accent-primary`

**Issue 3**
- Element: Stats label (line 170)
- Visible in light: YES
- Visible in dark: NO
- Root cause: No dark variant
- Current className: `text-base text-brand-brown font-medium`
- Fix needed: Add `dark:text-text-primary`

**Issue 4**
- Element: Stats number (line 167)
- Visible in light: YES
- Visible in dark: WEAK
- Root cause: text-brand-gold on potential dark background
- Current className: `about-stats font-bold text-brand-gold mb-3`
- Fix needed: Add `dark:text-accent-primary`

**Issue 5**
- Element: Final CTA h2 (line 225)
- Visible in light: YES
- Visible in dark: NO
- Root cause: Inherits text-brand-brown; no explicit dark variant
- Current className: `about-h2 font-bold mb-4`
- Fix needed: Add `text-brand-brown dark:text-text-primary`

**Issue 6**
- Element: Final CTA p (line 226)
- Visible in light: YES
- Visible in dark: NO
- Root cause: Same inheritance
- Current className: `text-base mb-6`
- Fix needed: Add `text-brand-brown dark:text-text-primary`

**Total issues:** 6

---

### FAQ Page

**Issue 1**
- Element: Root div (line 32)
- Current className: `min-h-screen bg-cream-bg text-brand-brown`
- Fix needed: Add `dark:bg-surface dark:text-text-primary`

**Issue 2**
- Element: Back link (line 37)
- Fix needed: Add `dark:text-text-primary dark:hover:text-accent-primary`

**Issue 3**
- Element: Hero h1 (line 50)
- Current className: `text-3xl md:text-4xl font-bold mb-4 text-brand-brown`
- Fix needed: Add `dark:text-text-primary`

**Issue 4**
- Element: Hero subtitle (line 53)
- Current className: `text-xl font-bold text-brand-brown/80`
- Fix needed: Add `dark:text-text-secondary`

**Issue 5**
- Element: Search icon (line 66)
- Current className: `... text-brand-brown/40`
- Fix needed: Add `dark:text-text-muted`

**Issue 6**
- Element: Search input (line 75)
- Current className: `... text-brand-brown ...`
- Fix needed: Add `dark:text-text-primary dark:border-border-subtle`

**Issue 7**
- Element: Category h2 (line 89)
- Current className: `text-2xl md:text-3xl font-bold mb-4 text-brand-brown`
- Fix needed: Add `dark:text-text-primary`

**Issue 8**
- Element: Accordion.Trigger (line 102)
- Current className: `... text-brand-brown ...`
- Fix needed: Add `dark:text-text-primary`

**Issue 9**
- Element: Accordion.Content (line 108)
- Current className: `px-6 pb-4 text-base text-brand-brown/80 overflow-hidden lg:text-justify`
- Fix needed: Add `dark:text-text-secondary`

**Issue 10**
- Element: No results message (line 127)
- Current className: `text-base text-brand-brown/60`
- Fix needed: Add `dark:text-text-muted`

**Total issues:** 10

---

### Privacy Page

**Issue 1**
- Element: Root div (line 55)
- Fix needed: Add `dark:bg-surface dark:text-text-primary`

**Issue 2**
- Element: Back button (line 61)
- Fix needed: Add `dark:text-text-primary dark:hover:text-accent-primary`

**Issue 3**
- Element: Hero h1 (line 73)
- Fix needed: Add `dark:text-text-primary`

**Issue 4**
- Element: Hero subtitle (line 76)
- Fix needed: Add `dark:text-text-secondary`

**Issue 5**
- Element: Hero lastUpdated (line 79)
- Fix needed: Add `dark:text-text-muted`

**Issue 6**
- Element: TOC h3 (line 92)
- Fix needed: Add `dark:text-text-primary`

**Issue 7**
- Element: TOC buttons (line 102-103)
- Fix needed: Add dark variants for active/inactive states

**Issue 8**
- Element: Summary title (line 120)
- Fix needed: Add `dark:text-text-primary`

**Issue 9**
- Element: Summary bullet p (line 124)
- Fix needed: Add `text-brand-brown dark:text-text-secondary` (currently inherits only)

**Issue 10**
- Element: Accordion.Trigger (line 150)
- Fix needed: Add `dark:text-text-primary`

**Issue 11**
- Element: Accordion.Content (line 158)
- Fix needed: Add `dark:text-text-secondary`

**Issue 12**
- Element: Content p (line 164)
- Fix needed: Add `text-brand-brown/80 dark:text-text-secondary` (currently no color)

**Issue 13**
- Element: TOC sidebar, summary box, accordion cards
- Fix needed: Add `dark:bg-surface-muted` or `dark:border-border-subtle` where cards use `bg-white/90`

**Total issues:** 13

---

### Feedback Page

**Status:** No visibility issues. Already has `dark:text-text-primary` and `dark:text-text-muted` where needed.

---

## ROOT CAUSE ANALYSIS

**Primary cause:** About, FAQ, and Privacy were designed for light mode only. They use `bg-cream-bg` and `text-brand-brown` with **no dark mode variants**. When the app is in dark mode, the layout/body uses a dark background, and these pages either inherit it or their cream background does not cover the full viewport. Dark brown text on dark background = invisible.

**Evidence:**
1. FAQ and Privacy have zero `dark:text-*` classes in the entire file.
2. About has `dark:text-text-primary` on card content but NOT on root, back link, stats, or final CTA.
3. Git diff confirms no color classes were removed when adding `lg:text-justify`.

---

## RECOMMENDED FIXES

### About Page

**Line 31 (root):**
```
FROM: className="min-h-screen bg-cream-bg text-brand-brown"
TO:   className="min-h-screen bg-cream-bg dark:bg-surface text-brand-brown dark:text-text-primary"
WHY:  Enable dark mode for page background and default text
```

**Line 97 (back link):**
```
FROM: className="flex items-center gap-2 text-brand-brown mb-6 hover:text-brand-gold transition-colors"
TO:   className="flex items-center gap-2 text-brand-brown dark:text-text-primary mb-6 hover:text-brand-gold dark:hover:text-accent-primary transition-colors"
WHY:  Missing dark mode color
```

**Line 167 (stat number):**
```
FROM: className="about-stats font-bold text-brand-gold mb-3"
TO:   className="about-stats font-bold text-brand-gold dark:text-accent-primary mb-3"
WHY:  Missing dark mode color
```

**Line 170 (stat label):**
```
FROM: className="text-base text-brand-brown font-medium"
TO:   className="text-base text-brand-brown dark:text-text-primary font-medium"
WHY:  Missing dark mode color
```

**Line 225 (CTA h2):**
```
FROM: className="about-h2 font-bold mb-4"
TO:   className="about-h2 font-bold mb-4 text-brand-brown dark:text-text-primary"
WHY:  No explicit color; inherits; needs dark variant
```

**Line 226 (CTA p):**
```
FROM: className="text-base mb-6"
TO:   className="text-base text-brand-brown dark:text-text-primary mb-6"
WHY:  Same as above
```

**Lines 131, 164, 209, 223 (cards with bg-white/90):** Consider adding `dark:bg-surface-muted dark:border-border-subtle` for card containers.

---

### FAQ Page

**Line 32 (root):**
```
FROM: className="min-h-screen bg-cream-bg text-brand-brown"
TO:   className="min-h-screen bg-cream-bg dark:bg-surface text-brand-brown dark:text-text-primary"
WHY:  Missing dark mode
```

**Line 37 (back link):**
```
FROM: className="... text-brand-brown ... hover:text-brand-gold ..."
TO:   Add dark:text-text-primary dark:hover:text-accent-primary
WHY:  Missing dark mode
```

**Line 50 (hero h1):**
```
FROM: className="text-3xl md:text-4xl font-bold mb-4 text-brand-brown"
TO:   className="text-3xl md:text-4xl font-bold mb-4 text-brand-brown dark:text-text-primary"
WHY:  Missing dark mode
```

**Line 53 (hero subtitle):**
```
FROM: className="text-xl font-bold text-brand-brown/80"
TO:   className="text-xl font-bold text-brand-brown/80 dark:text-text-secondary"
WHY:  Missing dark mode
```

**Line 66 (search icon):**
```
FROM: ... text-brand-brown/40
TO:   Add dark:text-text-muted
WHY:  Missing dark mode
```

**Line 75 (search input):**
```
FROM: ... text-brand-brown ... border-brand-brown/20 ...
TO:   Add dark:text-text-primary dark:border-border-subtle
WHY:  Missing dark mode
```

**Line 89 (category h2):**
```
FROM: className="text-2xl md:text-3xl font-bold mb-4 text-brand-brown"
TO:   className="text-2xl md:text-3xl font-bold mb-4 text-brand-brown dark:text-text-primary"
WHY:  Missing dark mode
```

**Line 102 (Accordion.Trigger):**
```
FROM: ... text-brand-brown ...
TO:   Add dark:text-text-primary
WHY:  Missing dark mode
```

**Line 108 (Accordion.Content):**
```
FROM: className="px-6 pb-4 text-base text-brand-brown/80 overflow-hidden lg:text-justify"
TO:   className="px-6 pb-4 text-base text-brand-brown/80 dark:text-text-secondary overflow-hidden lg:text-justify"
WHY:  Missing dark mode
```

**Line 127 (no results):**
```
FROM: className="text-base text-brand-brown/60"
TO:   className="text-base text-brand-brown/60 dark:text-text-muted"
WHY:  Missing dark mode
```

**Line 98 (Accordion.Item):** Add `dark:bg-surface-muted dark:border-border-subtle` if card background needs dark variant.

---

### Privacy Page

Apply same pattern as FAQ for all text elements. Key additions:

- Root (55): `dark:bg-surface dark:text-text-primary`
- Back (61): `dark:text-text-primary dark:hover:text-accent-primary`
- Hero h1 (73): `dark:text-text-primary`
- Hero subtitle (76): `dark:text-text-secondary`
- Hero lastUpdated (79): `dark:text-text-muted`
- TOC h3 (92): `dark:text-text-primary`
- TOC buttons (102-103): Add dark variants for active/inactive
- Summary title (120): `dark:text-text-primary`
- Summary bullets (124): `text-brand-brown dark:text-text-secondary`
- Accordion.Trigger (150): `dark:text-text-primary`
- Accordion.Content (158): `dark:text-text-secondary`
- Content p (164): `text-brand-brown/80 dark:text-text-secondary`
- Cards (90, 118, 146, 176): Add `dark:bg-surface-muted dark:border-border-subtle` where appropriate

---

**END OF REPORT**
