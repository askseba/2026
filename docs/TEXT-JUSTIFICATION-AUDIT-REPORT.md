# TEXT JUSTIFICATION AUDIT – SAFETY REPORT (READ-ONLY)

**Scope:** `about`, `faq`, `privacy`, `feedback` pages  
**No code changes** – analysis only.

---

## TASK 1: Text alignment classes

| Page   | Line | Element / context | Current alignment | Can add justify? | Conflict risk |
|--------|------|-------------------|-------------------|------------------|---------------|
| About  | 108  | section (hero)    | text-center       | NO               | Section is centered; children inherit |
| About  | 110  | h1 (hero)         | (parent center)   | NO               | Inside text-center section |
| About  | 113  | p (hero subtitle) | (parent center)   | NO               | Inside text-center section |
| About  | 165  | stats card div    | text-center       | NO               | Card layout intent |
| About  | 167  | stat number       | (parent center)   | NO               | Centered stat |
| About  | 170  | stat label        | (parent center)   | NO               | Short label, centered |
| About  | 180  | h2 testimonials   | text-center       | NO               | Heading explicitly centered |
| About  | 223  | CTA section       | text-center       | NO               | CTA block centered |
| About  | 136  | h2 (section)      | none              | YES              | Safe (card body) |
| About  | 140  | p (section body)  | none              | YES              | Safe |
| About  | 145  | ul (bullets)      | none              | YES (list text)  | Safe |
| About  | 191  | p (testimonial)   | none              | YES              | Safe |
| About  | 212  | p (value desc)    | none              | YES              | Safe |
| About  | 225  | h2 (CTA title)    | (parent center)   | NO               | Inside text-center |
| About  | 226  | p (CTA body)      | (parent center)   | NO               | Inside text-center |
| FAQ    | 48   | hero section      | text-center       | NO               | Hero centered |
| FAQ    | 50   | h1                | (parent center)   | NO               | Inside text-center |
| FAQ    | 53   | p (subtitle)      | (parent center)   | NO               | Inside text-center |
| FAQ    | 102  | Accordion.Trigger | text-start        | CAUTION          | text-start; lg:justify can override on large screens |
| FAQ    | 108  | Accordion.Content | none              | YES              | Safe (answer body) |
| FAQ    | 110  | p (answer)        | none              | YES              | Safe |
| FAQ    | 125  | no-results div    | text-center       | NO               | Message centered |
| FAQ    | 127  | p (no results)    | (parent center)   | NO               | Inside text-center |
| Privacy | 71   | hero section      | text-center       | NO               | Hero centered |
| Privacy | 73   | h1                | (parent center)   | NO               | Inside text-center |
| Privacy | 76,79| hero p            | (parent center)   | NO               | Inside text-center |
| Privacy | 98–100 | TOC button (cn) | direction-based   | CAUTION          | text-right/left; see Task 5 |
| Privacy | 149–151 | Accordion.Trigger (cn) | direction-based | CAUTION    | text-right/left; see Task 5 |
| Privacy | 157–159 | Accordion.Content (cn) | direction-based | APPLY HERE  | Add lg:text-justify in cn(); overrides on lg |
| Privacy | 195  | compliance card   | text-center       | NO               | Card centered |
| Privacy | 124  | p (bullet)        | none              | YES              | Safe |
| Privacy | 163  | p (section para)  | none              | YES              | Safe (inside dynamic Content) |
| Privacy | 188,209 | p (contact/compliance) | none        | YES (if not in centered block) | 188: in non-centered card – YES; 209: in text-center card – NO |
| Feedback | 152 | hero wrapper      | text-center       | NO               | Hero centered |
| Feedback | 153  | h1                | (parent center)   | NO               | Inside text-center |
| Feedback | 168  | span (message)    | (parent center)   | NO               | Short, centered |
| Feedback | 210  | empty state div   | text-center       | NO               | Message centered |

---

## TASK 2: Element types by page

### About page

**Headings (h1–h6):**
- 110: `h1` hero-h1 → **NOT SUITABLE** (inside text-center hero).
- 136: `h2` about-h2 (section title) → **SUITABLE** (no alignment).
- 180: `h2` testimonials title → **NOT SUITABLE** (text-center).
- 211: `h3` value title → **SUITABLE**.
- 225: `h2` CTA title → **NOT SUITABLE** (inside text-center section).

**Paragraphs:**
- 113: hero subtitle → **NOT SUITABLE** (hero center).
- 140: section body `p` → **SUITABLE** (medium/long).
- 191: testimonial quote → **SUITABLE** (medium/long).
- 212: value description → **SUITABLE** (short–medium).
- 226: CTA body → **NOT SUITABLE** (inside text-center).

**Other:**
- 145: `ul` list → **SUITABLE** (list text).
- 165, 223: card wrappers with text-center → **SKIP** (layout).
- 167, 170: stat number/label → **SKIP** (very short, centered).
- 97, 118, 229: links/buttons → **SKIP** (not body text).

**Total suitable for justify:** headings 2 (lines 136, 211), paragraphs 3 (140, 191, 212), list 1 (145) → **6** (or count each `p` in body loop as 1 each).

---

### FAQ page

**Headings:**
- 50: `h1` → **NOT SUITABLE** (hero text-center).
- 89: `h2` category name → **SUITABLE** (no alignment).

**Paragraphs:**
- 53: hero subtitle → **NOT SUITABLE** (hero).
- 110: `p` (answer) → **SUITABLE** (long).
- 127: no-results message → **NOT SUITABLE** (short, centered).

**Accordion:**
- 102: Trigger → **SKIP** for justify (question line; has text-start).
- 108: Content wrapper → **SUITABLE** (add justify to content/paragraph).

**Total suitable for justify:** 1 heading (89), 1 paragraph type (110 in loop) → **2 element types**, many instances (all category titles + all answer paragraphs).

---

### Privacy page

**Headings:**
- 73: `h1` → **NOT SUITABLE** (hero text-center).
- 92: `h3` TOC → **SUITABLE** (sidebar).
- 120: `h3` summary → **SUITABLE**.
- 180: `h3` contact → **SUITABLE**.
- 198: `h3` compliance → **NOT SUITABLE** (inside text-center card).

**Paragraphs:**
- 76, 79: hero → **NOT SUITABLE** (hero center).
- 124: bullet `p` → **SUITABLE**.
- 163: section `p` (accordion content) → **SUITABLE** (inside `cn()` Content).
- 188: contact response_time → **SUITABLE** (short but block text).
- 209: compliance note → **NOT SUITABLE** (inside text-center card).

**Dynamic (cn):**
- 98–100: TOC button → **SKIP** for justify (short nav labels).
- 149–151: Accordion.Trigger → **SKIP** (title only).
- 157–159: Accordion.Content → **APPLY** (add lg:text-justify).

**Total suitable for justify:** headings 3 (92, 120, 180), paragraphs 3 types (124, 163, 188) + Content wrapper (157–159). Compliance block (195–209): skip.

---

### Feedback page

**Main page only (no FeedbackModal/FeedbackCard):**
- 153: `h1` → **NOT SUITABLE** (text-center).
- 168: `span` (done count message) → **SKIP** (short, centered).
- 210: empty state `motion.div` + inner text → **NOT SUITABLE** (text-center, short).

**Labels/inputs/textarea:** None in this file (form is in `FeedbackModal`).  
**Conclusion:** No body paragraphs or long text on the main feedback page; only hero and empty state. **Suitable for justify on this page: 0.**

---

## TASK 3: Dynamic classes (cn / direction / locale)

**About:** No `cn()`. Only `direction` from `locale === 'ar'` (no alignment in that line).  
**Dynamic classes: 0. Risk: N/A.**

**FAQ:** No `cn()`. `direction` used for `dir` only.  
**Dynamic classes: 0. Risk: N/A.**

**Privacy:** `cn()` used in 3 places with direction-based alignment:

```typescript
// Lines 98–104: TOC button
className={cn(
  'w-full px-4 py-2 rounded-xl text-sm transition-colors',
  direction === 'rtl' ? 'text-right' : 'text-left',
  activeSection === section.id
    ? 'bg-brand-gold/20 text-brand-gold font-bold'
    : 'text-brand-brown/70 hover:bg-brand-gold/10 hover:text-brand-brown'
)}
```
- **Risk: LOW** for adding justify. TOC items are short; adding lg:text-justify would override left/right on lg; usually **skip** (keep as-is).

```typescript
// Lines 149–152: Accordion.Trigger
className={cn(
  'w-full px-6 py-4 flex justify-between items-center text-base font-bold ...',
  direction === 'rtl' ? 'flex-row-reverse text-right' : 'text-left'
)}
```
- **Risk: MEDIUM.** Trigger = title only. Adding lg:text-justify would override; **skip** (titles stay left/right).

```typescript
// Lines 157–160: Accordion.Content
className={cn(
  'px-6 pb-4 text-base text-brand-brown/80 overflow-hidden',
  direction === 'rtl' ? 'text-right' : 'text-left'
)}
```
- **Risk: LOW.** Content = body paragraphs. **Safe to add** `lg:text-justify` (e.g. add as first or last in cn()). On lg, justify overrides left/right; RTL/LTR still from `dir`.

**Summary:**  
- Dynamic classes: **3** (all Privacy).  
- TOC: LOW risk, **skip**.  
- Trigger: MEDIUM risk, **skip**.  
- Content: LOW risk, **APPLY**.

---

## TASK 4: FAQ page – Accordion

**Accordion.Trigger (line 102):**
- Current classes: `min-h-[44px] min-w-[44px] w-full px-6 py-4 flex flex-row-reverse justify-between items-center text-base font-bold text-brand-brown hover:bg-brand-gold/50 transition-colors text-start touch-manipulation`
- Has text-start: **YES**
- Safe to add lg:text-justify: **YES** (technically), but **not recommended**: questions are one line; justify has little benefit and can look odd.
- **Recommendation:** **SKIP** Trigger; do not add justify.

**Accordion.Content (line 108):**
- Current classes: `px-6 pb-4 text-base text-brand-brown/80 overflow-hidden`
- No text alignment set.
- Safe to add lg:text-justify: **YES**
- Reason: Answer text is long; no conflicting alignment. **APPLY** to Content or inner `p` (e.g. `lg:text-justify`).

---

## TASK 5: Privacy page – direction-based alignment

**1) Lines 98–100 – TOC button**
- Current: direction-based `text-right` / `text-left`
- If we add lg:text-justify: **CONFLICT** (override on lg). TOC labels are short.
- Recommendation: **SKIP**; keep direction-based alignment.

**2) Lines 149–151 – Accordion.Trigger**
- Current: `flex-row-reverse` + direction-based `text-right` / `text-left`
- If we add lg:text-justify: **CONFLICT** (override on lg). Titles are one line.
- Recommendation: **SKIP**.

**3) Lines 157–159 – Accordion.Content**
- Current: direction-based `text-right` / `text-left`
- If we add lg:text-justify: **SAFE**. On large screens, justified body text is acceptable; RTL/LTR still from `dir`.
- Recommendation: **APPLY** – add `lg:text-justify` inside the same `cn()`.

---

## TASK 6: Feedback page – form elements

- **Labels:** None in `feedback/page.tsx` (form in FeedbackModal).
- **Input placeholders:** N/A in this file → **SKIP** (single line).
- **Helper text:** None in this file.
- **Error messages:** Via toast; not in page JSX → **SKIP**.

**Categorization:** Main page has only hero (h1 + centered div), short span, and empty-state block. No long body copy; **no elements recommended for justify** on this page.

---

## TASK 7: Text length (heuristic)

- **Very short (&lt;10 words):** stat labels, TOC items, accordion titles, hero titles, badges, empty state → **SKIP**
- **Short (10–20):** hero subtitles, value descriptions, contact line, compliance note → **TEST FIRST** or skip
- **Medium (20–50):** section body, testimonial quote, CTA body → **APPLY**
- **Long (50+):** FAQ answers, privacy accordion content → **APPLY**

**Counts (by role):**
- Very short: many (all titles, labels, TOC, triggers) → **SKIP**
- Short: ~5–8 → **TEST FIRST** or skip
- Medium: ~4–6 types (about body, testimonial, CTA; FAQ/Privacy content) → **APPLY**
- Long: FAQ answers, Privacy section content → **APPLY**

**Recommended for justify:** Paragraphs and list text in About (body, testimonial, value, list); FAQ answer `p` and Content; Privacy summary bullets, accordion content `p`, contact note; **not** Feedback main page.

---

# DELIVERABLE: SAFETY REPORT

## About Page
- **Total text elements (with alignment or meaningful text):** ~15+
- **Suitable for justify:** **6** (section h2, section body `p`, testimonial `p`, value h3, value `p`, list `ul`). Do **not** add to hero, stats cards, testimonials title, or CTA section.
- **Conflicts:** 4 explicit text-center areas (hero, stats, testimonials title, CTA); children of those should not get justify.
- **Safe to modify:**
  - Headings: lines **136** (section h2), **211** (value h3).
  - Paragraphs: lines **140** (body), **191** (testimonial), **212** (value description).
  - List: line **145** (ul).
- **Skip:** 108, 110, 113, 165, 167, 170, 180, 223, 225, 226, links/buttons.
- **Risk level:** **LOW** if only the safe elements above are targeted.

---

## FAQ Page
- **Total text elements:** ~6 types (hero, h2, trigger, content, no-results).
- **Suitable for justify:** **2** (category h2 line 89; answer content – line 108 Content or 110 `p`).
- **Conflicts:** Hero text-center (48, 50, 53); Trigger has text-start (102); no-results text-center (125, 127).
- **Safe to modify:**
  - Questions (Trigger): **SKIP** (short, text-start).
  - Answers: **YES** – Accordion.Content (108) or inner `p` (110) with `lg:text-justify`.
  - Category h2 (89): optional (short); can add if desired.
- **Risk level:** **LOW** if only answer content gets justify.

---

## Privacy Page
- **Total text elements:** many (hero, TOC, summary, accordion, contact, compliance).
- **Suitable for justify:** Summary bullets (124), Accordion.Content paragraphs (163), Contact response_time (188). **Direction-based classes:** 3 (TOC, Trigger, Content). Content is **safe** to add lg:text-justify; TOC and Trigger **skip**.
- **Conflicts:** Hero (71, 73, 76, 79); compliance card text-center (195, 198, 209). Direction-based cn() on TOC and Trigger: **skip**.
- **Safe to modify:**
  - Headings: 92, 120, 180 (not 198 – compliance is centered).
  - Paragraphs: 124, 163 (accordion), 188. And **Accordion.Content** (157–159): add `lg:text-justify` in `cn()`.
- **Risk level:** **LOW** if we only add justify to Content and non-centered body text; **MEDIUM** if we touch TOC/Trigger (not recommended).

---

## Feedback Page
- **Total text elements:** Hero block, badge message, empty state.
- **Suitable for justify:** **0** (no long body copy; form in modal).
- **Conflicts:** text-center on 152, 210.
- **Safe elements:** None for justify.
- **Risk level:** **LOW** (no changes recommended).

---

## OVERALL ASSESSMENT

- **Total safe modifications:** About **6** element types (about), **1–2** (FAQ answers + optional h2), **4** (Privacy: Content + bullets + 2 headings + contact p), **0** (Feedback) → roughly **12–14** safe modification points across 4 pages.
- **High-risk conflicts:** **0** (we avoid all text-center and keep TOC/Trigger as-is).
- **Medium-risk conflicts:** **2** (FAQ Trigger text-start; Privacy Trigger) – both **skip**.

**Recommended approach:**
1. **About:** Add `lg:text-justify` only to: section card body (h2 + p + ul), testimonial quote `p`, value card (h3 + p). Do **not** add to hero, stats, testimonials title, or CTA.
2. **FAQ:** Add `lg:text-justify` to Accordion.Content (or inner `p`). Do not add to Trigger or hero/no-results.
3. **Privacy:** Add `lg:text-justify` inside the Accordion.Content `cn()` (157–159). Optionally to summary bullets (124) and contact paragraph (188). Do not add to TOC, Trigger, hero, or compliance card.
4. **Feedback:** No changes for justification.

**Estimated time:** ~10–15 minutes for a targeted apply (only the safe elements above).

---

## NEXT STEP

**GREEN LIGHT:** Safe to apply with the **standard approach limited to the safe elements** listed above.

- Use a **simplified prompt** that:
  - Adds `lg:text-justify` only to the specific lines/elements listed as “Safe to modify” and “APPLY”.
  - Explicitly **excludes**: any node with `text-center`, any TOC/Trigger, hero and CTA sections, stats cards, compliance card, and Feedback page hero/empty state.

No code was changed in this audit; this report is analysis only.
