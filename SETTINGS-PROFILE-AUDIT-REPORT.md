# SETTINGS PAGE COMPREHENSIVE AUDIT REPORT

**Role:** Senior Full-Stack Architect & UX Auditor (Diagnostic Only)  
**Date:** 2026-02-07  
**Workspace:** f9-2026-clean  
**Reference:** EMERGENCY-RECOVERY-REPORT.md (Next.js 16.1.1, localhost:3000, clean working tree)

---

## Executive Summary

| Category | Status |
|----------|--------|
| **Strengths** | Profile page exists under `[locale]` with correct RTL/LTR from locale; clear section hierarchy (Personal Info, Sensitivity, Danger Zone); uses NextAuth and shadcn UI; Danger Zone has clear visual hierarchy. |
| **Issues** | Profile page has **zero i18n** (all copy hardcoded Arabic); no form library or validation; no API for profile/settings persistence; Settings hub lives outside `[locale]` and is Arabic-only; `/en/settings` and `/ar/settings` **404**. |
| **Critical** | English users see Arabic-only profile copy; Save Changes and toggles do not persist; Delete Account is a plain button with no confirmation or API. |

---

## 1. File Structure & Architecture

### 1.1 Primary Page Files

| Route | File path | Exists | Notes |
|-------|-----------|--------|--------|
| **Profile (locale)** | `src/app/[locale]/profile/page.tsx` | ✅ | Main profile: Personal Info, Sensitivity, Danger Zone. |
| **Settings (root)** | `src/app/settings/page.tsx` | ✅ | Hub with links to profile, notifications, language, privacy. **Not under [locale].** |
| **Settings (locale)** | `src/app/[locale]/settings/page.tsx` | ❌ | **Does not exist** → `/en/settings` and `/ar/settings` return **404**. |
| **Dashboard settings** | `src/app/[locale]/dashboard/settings/page.tsx` | ❌ | Not present. |
| **Account** | `src/app/[locale]/account/page.tsx` | ❌ | Not present. |
| **Pages Router fallback** | `src/app/profile/page.tsx` | ❌ | N/A (App Router only). Archived: `_archived/pages/profile/page.tsx`. |

### 1.2 Layout Chain

```
Root Layout (src/app/layout.tsx)
  → html[lang][dir], ThemeProvider, SessionProvider, QuizProvider, NextIntlClientProvider, ConditionalLayout (Header + main + Footer)
    → [locale] Layout (src/app/[locale]/layout.tsx)
      → NextIntlClientProvider(locale, messages) only; no <html>/<body>
        → profile/ (no nested layout)
          → page.tsx
```

- **Profile:** No dedicated `src/app/[locale]/profile/layout.tsx`. Inherits `[locale]` layout only.
- **Settings hub:** Rendered under root layout (same level as `[locale]`), so it does **not** receive `[locale]` params or next-intl segment; `dir` is hardcoded `rtl` in the page.

### 1.3 Dependencies (Profile Page)

| Area | Used | Not used |
|------|------|----------|
| **i18n** | `useLocale()` (for `dir` only) | `useTranslations()` — **no t() keys**; all visible text hardcoded Arabic. |
| **Forms** | None | react-hook-form, Zod, any schema. |
| **Auth** | `useSession`, `signOut` (next-auth/react) | — |
| **UI** | shadcn `Button`, `Input`; Lucide icons | Accordion, Tabs, Card, Form (shadcn) not used. |
| **Mutations** | Local `useState` for toggles; toast (sonner) | useMutation, SWR, tRPC, server actions. |
| **Routing** | — | Profile is reached via header `router.push('/profile')` (i18n router → current locale). |

### 1.4 i18n Files

- **messages/en.json / messages/ar.json:** No `profile` or `settings` namespace. Only nav keys:
  - `nav.profile` (EN: "Profile", AR: "الملف الشخصي")
  - `nav.settings` (EN: "Settings", AR: "الإعدادات")
  - `nav.logout` (EN: "Log out", AR: "تسجيل الخروج")
- **Profile page:** Does not use any of these; all section titles, labels, and buttons are hardcoded Arabic strings in JSX.
- **Settings hub:** All copy hardcoded Arabic (الإعدادات, الملف الشخصي, etc.).

---

## 2. UI/UX Analysis

### 2.1 Visual Audit (Screenshots)

| Aspect | EN | AR | Screenshot |
|--------|----|----|------------|
| **Profile** | Same content as AR (Arabic copy) | Correct RTL, Arabic copy | `audit-en-profile-full.png`, `audit-ar-profile-full.png` |
| **Mobile (375px)** | Same; layout stacks correctly | Same | `audit-en-profile-mobile-375.png` |
| **Settings hub** | N/A (route is `/settings` only) | Arabic-only hub at `/settings` | — |
| **/en/settings, /ar/settings** | 404 | 404 | Not-found page (locale not-found used). |

- **Layout & direction:** Profile uses `dir={direction}` from `useLocale()` (RTL for `ar`, LTR for `en`). Content is Arabic in both locales. Form sections use `space-y-*`, `flex`, `rounded-[2rem]`; no Accordion/Tabs.
- **Component hierarchy (main):**  
  `main` → sections (Personal Info, Sensitivity, Danger Zone) → each section: heading + content (inputs/toggles/buttons). No semantic `<form>` wrapper; no `aria-label` on section headings; Image alt="Profile".
- **Visual polish:** Consistent spacing (`space-y-4`, `space-y-6`, `p-8`), typography (text-lg for headings, text-xs for labels), Danger Zone uses `text-danger-red` and border. Toggle thumb uses `right-7`/`right-1` (RTL-aware). Focus styles from globals (`:focus-visible` ring). No visible loading skeleton for profile; no error boundary in profile page.

### 2.2 Layout & Direction

- **html/body:** Set in root layout from `getLocale()` → `dir={direction}` and `lang={lang}`.
- **Profile:** `dir={direction}` on root div; form sections are flow layout; RTL flip for toggle position is correct (`right-7` when on).
- **Mobile:** Single column; cards and sections stack; no horizontal scroll observed.

### 2.3 Accessibility (Profile)

- **Positives:** Focus visible ring (globals.css); Button/link semantics; section structure.
- **Gaps:** No `aria-label` on "Save Changes" or section headings; no `role="region"` or `aria-labelledby`; file input has no visible label; "Delete Account" is a `<button>` with no confirmation or `aria-describedby`; toggles lack `role="switch"` and `aria-checked`.

---

## 3. Content & i18n Deep Dive

### 3.1 Translation Completeness

| Section | EN key expected | AR key expected | In code | In messages |
|--------|-----------------|-----------------|---------|-------------|
| Personal Information | e.g. profile.personalInfo | نفس المفتى | Hardcoded Arabic only | No profile.* keys |
| Full Name | profile.fullName | الاسم الكامل | Hardcoded | No |
| Email | profile.email | البريد الإلكتروني | Hardcoded | No |
| Save Changes | profile.saveChanges | حفظ التغييرات | Hardcoded | No |
| Advanced Sensitivity | profile.advancedSensitivity | إعدادات الحساسية المتقدمة | Hardcoded | No |
| Active | profile.active | نشط | Hardcoded | No |
| Strict Mode | profile.strictMode | الوضع الصارم | Hardcoded | No |
| Strict description | profile.strictModeDescription | إخفاء أي عطر... | Hardcoded | No |
| Ingredient Alerts | profile.ingredientAlerts | تنبيهات المكونات (scope had "المكينات") | Hardcoded | No |
| Danger Zone | profile.dangerZone | منطقة الخطر | Hardcoded | No |
| Logout | profile.logout / nav.logout | تسجيل الخروج | Hardcoded (nav has key) | nav.logout only |
| Delete Account | profile.deleteAccount | حذف الحساب نهائياً | Hardcoded | No |

- **Conclusion:** All visible profile/settings copy is hardcoded; **no useTranslations()** on the profile page. EN locale still shows Arabic text. Messages JSON are loaded (next-intl) but unused on this page.

### 3.2 UX Copy Quality

- **Primary action:** "حفظ التغييرات" is a full-width primary button; no loading state or success feedback beyond toast (toast is used for toggle only).
- **Danger Zone:** Red heading and border; logout is outline button; "حذف الحساب نهائياً" is text-style button — no red background, no modal/confirmation.
- **Strict Mode:** No tooltip or expandable explanation; description text is present below the label.
- **Progressive disclosure:** All sections expanded; no Accordion/collapse for "Advanced Sensitivity."

---

## 4. Code Architecture Analysis

### 4.1 Profile Page Component (Read-Only)

- **Hooks:** `useLocale()`, `useSession()`, `useState()` (allergy toggles, isUploading), `useRef()` (file input). No `useForm`, no `useTranslations`.
- **State:** Local only: `allergySettings` (strictMode, notifyOnAllergen, shareWithConsultants), `isUploading`. Session from NextAuth.
- **Form validation:** None. Inputs are uncontrolled (`defaultValue`); no client or server validation.
- **Error/Suspense:** No error boundary in profile route; no Suspense boundary; unauthenticated users are not redirected (no auth guard in component — layout/header do not protect route).

### 4.2 Mutations & API

- **Profile update:** "حفظ التغييرات" has no `onClick`/handler; no PATCH/POST to `/api/user/*` or similar. No server action.
- **Allergy toggles:** `handleToggle` updates local state and shows `toast.success('تم تحديث الإعدادات بنجاح')`; no API call; state lost on refresh.
- **Avatar:** File input present; no `onChange`/upload logic (only `fileInputRef.current?.click()`); `isUploading` never set to true by any handler.
- **Delete account:** Button has no handler; no API, no confirmation modal.
- **API/user:** Only `src/app/api/user/favorites/` exists; no `settings` or `profile` route.

### 4.3 Type Safety

- TypeScript: No errors observed in profile page (read-only audit). Props from next-auth and next-intl are typed.
- No Zod (or other) schema for form or API payloads.
- Message types: Not inferred for profile (no keys used).

---

## 5. Performance & Accessibility

### 5.1 Lighthouse

- Not run in this audit (read-only). Recommend running for Performance, Accessibility, Best Practices on `/en/profile` and `/ar/profile` for Opus review.

### 5.2 Console Warnings

- Console messages were not fully captured in session. Known project warnings (from EMERGENCY-RECOVERY-REPORT): Sentry global error handler, middleware deprecation (proxy). No specific profile-page warnings verified here.

---

## 6. Recommendations (Priority)

### CRITICAL (fix now)

1. **i18n for Profile:** Introduce a `profile` (and optionally `settings`) namespace in `en.json`/`ar.json` and replace all hardcoded strings on the profile page with `useTranslations('profile')` so EN users see English.
2. **Locale-aware Settings URL:** Either add `src/app/[locale]/settings/page.tsx` (e.g. redirect or content) so `/en/settings` and `/ar/settings` work, or consolidate with profile and link "Settings" to profile.
3. **Delete Account:** Add confirmation modal and a real delete-account API; do not leave as non-functional button.

### HIGH (fix soon)

4. **Persistence:** Implement PATCH (or server action) for profile (name, email) and for allergy settings; persist to DB or existing user API.
5. **Save Changes:** Wire the button to submit profile form (with validation) and show loading + success/error feedback.
6. **Avatar upload:** Implement file upload (e.g. to blob storage) and set `isUploading`; update session or API with new image URL.
7. **Auth guard:** Redirect unauthenticated users from `/en/profile` and `/ar/profile` to login (with callbackUrl).

### LOW (nice to have)

8. **Accessibility:** Add `aria-label`/`aria-labelledby` for sections; `role="switch"` and `aria-checked` for toggles; label for avatar file input.
9. **Settings hub:** Move `app/settings/page.tsx` under `app/[locale]/settings/page.tsx` and use i18n so both locales have a settings hub.
10. **Form library:** Introduce react-hook-form + Zod for validation and type-safe submit.

---

## 7. Appendix: File & Route Summary

| Component | Path | Dependencies | Status |
|-----------|------|--------------|--------|
| Profile page | `src/app/[locale]/profile/page.tsx` | next-intl (useLocale), next-auth, shadcn Button/Input, sonner, Lucide | No i18n; no API; no form lib |
| Settings hub | `src/app/settings/page.tsx` | next-auth, Lucide, LoadingSpinner | Outside [locale]; Arabic-only; links to /profile, /privacy |
| [locale] layout | `src/app/[locale]/layout.tsx` | next-intl (getMessages, setRequestLocale) | No profile/settings layout |
| Root layout | `src/app/layout.tsx` | getLocale, getMessages, SessionProvider, NextIntlClientProvider, ConditionalLayout | Provides dir/lang |
| Header (profile link) | `src/components/ui/header.tsx` | useRouter (i18n), useTranslations('nav') | `router.push('/profile')` → locale-prefixed profile |
| Nav keys | messages/en.json, messages/ar.json | — | nav.profile, nav.settings, nav.logout only |

---

## 8. Scope Note (Copy)

- Audit scope mentioned "تنبيهات المكينات" (Ingredient Alerts); the implemented label is "تنبيهات المكونات" (correct spelling: "المكونات" = ingredients). No change recommended for copy; only i18n extraction.

---

## Clarifying Question

**للمراجعة النهائية:** هل الهدف هو تدقيق **`/en/settings`** أم **`/en/profile`** أم **كلاهما**؟

- **الوضع الحالي:** `/en/profile` و `/ar/profile` يعملان ويظهران نفس المحتوى (بالعربية فقط). صفحة **الإعدادات** الفعلية (Hub) موجودة فقط على **`/settings`** (بدون لغة في المسار)، و **`/en/settings`** و **`/ar/settings`** يعيدان **404**. إذا كان المطلوب صفحة إعدادات واحدة ثنائية اللغة، يفضّل دمج المسار مع البروفايل أو إضافة `[locale]/settings` والربط من الهيدر.

---

*End of report. No code changes were made; diagnostic only. Ready for Opus review.*
