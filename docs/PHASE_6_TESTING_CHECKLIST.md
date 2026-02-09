# PHASE 6: TESTING CHECKLIST — Back Button

**تاريخ:** 2026-02-09  
**النطاق:** زر الرجوع (BackButton) — وظائف، RTL/LTR، إمكانية الوصول، المظهر.

---

## 6.1 Functionality Tests

| # | Test | Expected | Result | Notes |
|---|------|----------|--------|--------|
| 1 | Click back on each page → correct destination | Each page goes to intended previous page | ✅ **Verified (code)** | See destinations below |
| 2 | Quiz flow: Step3 → Step2 → Step1 → Quiz landing → Home | Sequential back through quiz then home | ✅ **Verified (code)** | Step3 `onBack`→step2, Step2 `onClick`→step1, Step1 `href="/quiz"`, Quiz landing `router.back()` |
| 3 | Auth: Login → Home, Register → Home | Back goes to home | ✅ **Verified (code)** | Both use `BackButton href="/"` |
| 4 | Browser back button still works | History back unchanged | ✅ **Expected** | BackButton uses `router.back()` when no `href`/`onClick`; no `history.replace` on back |

### Back destinations (from code)

| Page | Back target | Implementation |
|------|-------------|----------------|
| Login | Home `/` | `BackButton href="/"` |
| Register | Home `/` | `BackButton href="/"` |
| Quiz Step 3 | Step 2 | `onBack` → `router.push('/quiz/step2-disliked')` |
| Quiz Step 2 | Step 1 | `onClick` → `router.push(\`/${locale}/quiz/step1-favorites\`)` |
| Quiz Step 1 | Quiz landing | `BackButton href="/quiz"` |
| Quiz landing | Previous (e.g. Home) | `BackButton` no href → `router.back()` |
| Dashboard, Feedback, FAQ, About, Privacy, Profile | Previous or Home | `BackButton` (no href) or Profile `href="/"` |

**Manual check:** في المتصفح: من كل صفحة اضغط "رجوع" وتأكد أن الوصول للصفحة الصحيحة.

---

## 6.2 RTL/LTR Tests

| # | Test | Expected | Result | Notes |
|---|------|----------|--------|--------|
| 1 | Arabic pages: icon direction | Icon points **RIGHT** (→) | ✅ **Verified (code)** | `BackButton.tsx`: `isRTL && 'rotate-180'` on ChevronLeft |
| 2 | English pages: icon direction | Icon points **LEFT** (←) | ✅ **Verified (code)** | Default ChevronLeft, no rotate when `locale !== 'ar'` |
| 3 | Icon position | Before text in both locales | ✅ **Verified (code)** | Markup: `{icon}<span>{defaultLabel}</span>`; RTL layout flips visual order |
| 4 | Spacing | Consistent gap icon–text | ✅ **Verified (code)** | `me-2` on icon (margin-inline-end) |

**Manual check:**  
- `/ar/login` أو أي صفحة عربية: السهم يشير لليمين.  
- `/en/login`: السهم يشير لليسار.

---

## 6.3 Accessibility Tests

| # | Test | Expected | Result | Notes |
|---|------|----------|--------|--------|
| 1 | Keyboard: Tab to back button, Enter activates | Focusable and activatable | ✅ **Verified (code)** | `<button>` or `<Link>`; both focusable. Link navigates on Enter |
| 2 | Screen reader: aria-label (ar/en) | Correct announcement per locale | ✅ **Verified (code)** + **Fixed** | `BackButton`: `aria-label={defaultAriaLabel}` from `t('backAriaLabel')`. Step3 was hardcoded AR → now `t('backToPreviousStep')` |
| 3 | Focus visible | Ring on focus | ✅ **Verified (code)** | `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-accent-primary` |
| 4 | Color contrast | WCAG AA | ⏳ **Manual** | تحقق يدوياً أو بأداة (e.g. axe). الألوان: `text-primary` / `dark:text-accent-primary` |

**Fix applied:** في `Step3Allergy.tsx` تم استبدال `ariaLabel="العودة للخطوة السابقة"` بـ `ariaLabel={t('backToPreviousStep')}` حتى يُعلَن بالعربية أو الإنجليزية حسب اللغة.

---

## 6.4 Visual Consistency Tests

| # | Test | Expected | Result | Notes |
|---|------|----------|--------|--------|
| 1 | Same position on all pages | Top-left of content | ✅ **Verified (code)** | Pages use `BackButton` at start of main content + `className="mb-6"` (or similar) |
| 2 | Same styling within variant groups | link / button / ghost consistent | ✅ **Verified (code)** | `variantStyles` in `BackButton.tsx`: link, button, ghost |
| 3 | Hover states work | Visible hover | ✅ **Verified (code)** | link: `hover:underline`, button/ghost: `hover:bg-*` |
| 4 | Mobile responsive (no overlap) | No overlap, min touch target | ✅ **Verified (code)** | `min-w-touch`, `min-h-touch` on variants; Step2/Step3 use `min-h-[44px]` |

**Manual check:** تصغير النافذة والتأكد من عدم تداخل زر الرجوع مع المحتوى أو الهيدر.

---

## Summary

| Section | Status | Action |
|---------|--------|--------|
| 6.1 Functionality | ✅ Code verified | Optional: manual click-through |
| 6.2 RTL/LTR | ✅ Code verified | Optional: manual ar/en check |
| 6.3 Accessibility | ✅ Code + 1 fix | Manual: contrast check |
| 6.4 Visual | ✅ Code verified | Optional: manual responsive check |

**إصلاح تم في هذه الجلسة:**  
- `Step3Allergy.tsx`: استخدام `useTranslations('common')` و `ariaLabel={t('backToPreviousStep')}` بدلاً من النص العربي الثابت.

---

## Quick manual test script

1. **الوظائف:** Home → Login → Back → يجب العودة للرئيسية. نفس الشيء من Register. ثم Home → Quiz → Step1 → Step2 → Step3، والضغط "رجوع" في كل خطوة (Step3→Step2→Step1→Quiz→Home).
2. **RTL:** افتح `/ar/login` وتحقق أن سهم الرجوع يشير لليمين؛ ثم `/en/login` وأن السهم يشير لليسار.
3. **لوحة المفاتيح:** Tab حتى زر الرجوع ثم Enter — يجب تنفيذ الرجوع.
4. **التركيز:** Tab للزر وتحقق من ظهور حلقة التركيز (focus ring).
