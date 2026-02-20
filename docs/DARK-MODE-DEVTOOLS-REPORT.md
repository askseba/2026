# DARK MODE FAILURE — DEVTOOLS DEEP DIVE

**Problem:** Dark mode toggle → light text on light background (poor contrast).  
**Role:** CSS debug — use **actual** computed values and console output (no assumptions).

---

## REQUIRED BROWSER STEPS (EXECUTE THESE)

### 1. LIGHT MODE BASELINE
- **URL:** http://localhost:3000/ar/about  
- **Toggle:** LIGHT mode (header toggle)  
- **DevTools → Elements** → Select the **root container** `div` (the one with `min-h-screen bg-cream-bg...`).  
- **Right-click → Inspect** → **Computed** tab.

**Screenshot 1:** LIGHT MODE computed values  

Copy EXACT computed:
- `background-color`: _______________
- `color`: _______________

---

### 2. DARK MODE BROKEN STATE
- **Toggle:** DARK mode (header sun/moon button).  
- **Same** root `div` → **Computed** tab.

**Screenshot 2:** DARK MODE computed values (problem state)  

Copy EXACT:
- `background-color`: _______________ ← EXPECTED: dark (e.g. #0f172a)
- `color`: _______________ ← EXPECTED: light (e.g. #f1f5f9)

---

### 3. HTML CLASS VERIFICATION
**Console (paste and run):**
```javascript
console.log('HTML .dark:', document.documentElement.classList.contains('dark'));
console.log('HTML class:', document.documentElement.getAttribute('class'));
```

**Screenshot 3:** Console output

---

### 4. CSS VARIABLES RUNTIME (DARK MODE)
With theme set to **DARK**, run in console:
```javascript
console.log('--color-background:', getComputedStyle(document.documentElement).getPropertyValue('--color-background'));
console.log('--color-surface:', getComputedStyle(document.documentElement).getPropertyValue('--color-surface'));
console.log('--color-text-primary:', getComputedStyle(document.documentElement).getPropertyValue('--color-text-primary'));
```

**Screenshot 4:** CSS variable values in DARK mode

---

### 5. TAILWIND RULES DEBUG
- Root div classes: `min-h-screen bg-cream-bg dark:bg-surface text-brand-brown dark:text-text-primary`
- **DevTools → Styles** tab → Inspect which rules win:
  - Is `bg-cream-bg` winning?
  - Is `dark:bg-surface` **crossed out**?

**Screenshot 5:** Styles panel showing whether `dark:bg-surface` is applied or crossed out

---

## ONE-SHOT CONSOLE SCRIPT (OPTIONAL)

Paste this in the console on `/ar/about` with DARK mode on to get all values at once:

```javascript
(function() {
  var root = document.querySelector('[class*="min-h-screen"][class*="bg-cream-bg"][class*="dark:bg-surface"]');
  if (!root) root = document.querySelector('.min-h-screen');
  var html = document.documentElement;
  var c = root ? getComputedStyle(root) : null;
  var hv = getComputedStyle(html);
  var out = {
    'HTML .dark': html.classList.contains('dark'),
    'HTML class': html.getAttribute('class'),
    '--color-background': hv.getPropertyValue('--color-background').trim(),
    '--color-surface': hv.getPropertyValue('--color-surface').trim(),
    '--color-text-primary': hv.getPropertyValue('--color-text-primary').trim(),
    'Root background-color': c ? c.backgroundColor : 'N/A',
    'Root color': c ? c.color : 'N/A'
  };
  console.table(out);
  return out;
})();
```

---

## OUTPUT FORMAT (FILL AFTER RUNNING STEPS)

### DARK MODE FAILURE ROOT CAUSE

**LIGHT MODE (baseline)**  
Root div computed:
- **background:** [RGB/hex] ← #FAF8F5 expected  
- **text color:** [RGB/hex] ← dark expected  

**DARK MODE (broken)**  
Root div computed:
- **background:** [RGB/hex] ← should be dark (e.g. #0f172a); if still #FAF8F5 = WRONG  
- **text color:** [RGB/hex] ← light is CORRECT for dark mode  

**HTML class state**
- `.dark` on `<html>`: [YES / NO]  
- **Full class:** "[exact string]"

**CSS variables (DARK mode)**
- `--color-background`: [value]  
- `--color-surface`: [value]  
- `--color-text-primary`: [value]  

**Tailwind rule winner**
- `dark:bg-surface`: [APPLIED / CROSSED OUT]  
- **Winning rule:** [exact selector]

---

## DIAGNOSIS

[Your conclusion based on screenshots + values]

---

## ROOT CAUSE (CHECK ONE)

- [ ] **.dark class missing** — HTML has no `dark` class, so `dark:bg-surface` never applies.  
- [ ] **CSS var wrong value** — Variables are still light-mode values.  
- [ ] **Tailwind specificity** — Another rule overrides `dark:bg-surface`.  
- [ ] **Hydration overwrite** — React re-render overwrites `html` class and removes `dark` (see below).

---

## LIKELY FIX: HYDRATION VS next-themes

**Hypothesis:** The root layout sets `<html className="...">` on the server. When the client hydrates, React reconciles the DOM and may set `html`’s `class` back to that server value, **without** `dark`. next-themes adds `dark` with `classList.add`, but if React later updates the same element, it can overwrite the attribute and remove `dark`.

**Fix to try:** Stop setting `className` on `<html>` from the server. Apply font/utility classes on `<body>` instead, so React does not overwrite the `class` on `html`. Then next-themes can own `html`’s class (e.g. `light` / `dark`) and it won’t be reverted by hydration.

**Attach:** 5 screenshots + console outputs after running the steps above.
