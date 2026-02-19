# Card white/90 dark mode override – fix report

## Problem
Cards used `bg-white/90 backdrop-blur-sm`, which stays light in dark mode and breaks the dark theme.

## Solution applied
Replaced with dark-aware card backgrounds:
- **Base:** `bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm`
- **Hover (where applicable):** `dark:hover:bg-slate-700/80`
- **Borders:** `dark:border-slate-600/40` or existing `dark:border-*` kept

---

## Files changed

### 1. `src/app/[locale]/about/page.tsx`
| Location | Before | After |
|----------|--------|--------|
| Section cards (3) | `bg-white/90 backdrop-blur-sm ... hover:bg-accent-primary/10 dark:hover:bg-accent-primary/20` | `bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm ... hover:bg-accent-primary/10 dark:hover:bg-slate-700/80` |
| Stats cards (3) | `bg-white/90 backdrop-blur-sm ... hover:shadow-xl transition-shadow` | `bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm ... hover:shadow-xl dark:hover:bg-slate-700/80 transition-all` |
| Testimonial cards (3) | `bg-white/90 ... dark:hover:bg-accent-primary/20` | `bg-white/80 dark:bg-slate-800/80 ... dark:hover:bg-slate-700/80` |
| Values cards (5) | same as section cards | same as section cards |
| Final CTA section | `bg-white/90 backdrop-blur-sm ... text-center` | `bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm ... text-center` |

### 2. `src/app/[locale]/faq/page.tsx`
| Location | Before | After |
|----------|--------|--------|
| Accordion item (each FAQ) | `bg-white/90 backdrop-blur-sm shadow-lg rounded-3xl border ... mb-2 overflow-hidden` | `bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm ...` |

### 3. `src/app/[locale]/privacy/page.tsx`
| Location | Before | After |
|----------|--------|--------|
| Sticky TOC aside | `bg-white/90 dark:bg-surface-elevated backdrop-blur-sm ...` | `bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm ...` |
| Accordion item (each section) | `bg-white/90 backdrop-blur-sm ... mb-2 overflow-hidden` | `bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm ...` |
| Contact card (bottom) | `bg-white/90 backdrop-blur-sm ... p-6 border ... mb-8` | `bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm ...` |

### 4. `src/components/ErrorBoundary.tsx`
| Location | Before | After |
|----------|--------|--------|
| Error card container | `bg-white/90 backdrop-blur-sm rounded-3xl ... border border-brown-text/10` | `bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm ... dark:border-slate-600/40` |

### 5. `src/components/ui/TestimonialsCarousel.tsx`
| Location | Before | After |
|----------|--------|--------|
| Testimonial slide card | `bg-white/90 backdrop-blur-sm ... border border-brown-text/20` | `bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm ... dark:border-slate-600/40` |

### 6. `src/components/ui/UpsellCard.tsx`
| Location | Before | After |
|----------|--------|--------|
| Feature boxes (4×) | `bg-white/60 backdrop-blur-sm rounded-xl p-4` | `bg-white/60 dark:bg-slate-800/80 backdrop-blur-sm ...` |
| Pricing card | `bg-white/70 backdrop-blur-sm rounded-2xl p-6` | `bg-white/70 dark:bg-slate-800/80 backdrop-blur-sm ...` |

### 7. `src/components/TestHistory.tsx`
| Location | Before | After |
|----------|--------|--------|
| History item card | `bg-white/70 backdrop-blur-sm ... hover:shadow-lg` | `bg-white/70 dark:bg-slate-800/80 ... dark:border-slate-600/40 hover:shadow-lg dark:hover:bg-slate-700/80` |

### 8. `src/components/PriceAlertButton.tsx`
| Location | Before | After |
|----------|--------|--------|
| Alert card | `bg-white/70 backdrop-blur-sm ... border border-brown-text/10` | `bg-white/70 dark:bg-slate-800/80 ... dark:border-slate-600/40` |

### 9. `src/components/landing/QuestionsSection.tsx`
| Location | Before | After |
|----------|--------|--------|
| Question card | `bg-white/70 ... backdrop-blur-md ... hover:shadow-xl` | `bg-white/70 dark:bg-slate-800/80 ... backdrop-blur-md ...` |

---

## Before/after classNames (summary)

| Pattern | Before | After |
|---------|--------|--------|
| Card base | `bg-white/90 backdrop-blur-sm` | `bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm` |
| Card with hover | `... hover:bg-accent-primary/10 dark:hover:bg-accent-primary/20` | `... hover:bg-accent-primary/10 dark:hover:bg-slate-700/80` |
| Softer cards (60/70) | `bg-white/60` or `bg-white/70` | `bg-white/60 dark:bg-slate-800/80` or `bg-white/70 dark:bg-slate-800/80` |
| Borders | (unchanged or) `border-brown-text/10` | `... dark:border-slate-600/40` where needed |

---

## Verification

1. Run the app: `npm run dev`
2. Open `/en/about` (or your locale).
3. Use the **theme toggle** in the header (moon/sun icon) to switch to **dark mode**.
4. Confirm:
   - About section cards, stats, testimonials, values, and CTA use a **dark frosted glass** look (`dark:bg-slate-800/80`).
   - FAQ and Privacy accordion items look dark.
   - No cards stay bright white in dark mode.

**Screenshot:** After switching to dark mode via the header toggle, the About cards should appear as dark frosted glass. Capture a screenshot of the About page in dark mode to confirm.

---

## Notes

- **Archived / audit copies** (`_archived/`, `manus-audit-ready/`) were **not** updated; only active `src/` was changed.
- FAQ search input already had `dark:bg-surface-elevated`; only the accordion **items** were updated.
- Hover states use `dark:hover:bg-slate-700/80` for a subtle dark-mode hover on cards.
