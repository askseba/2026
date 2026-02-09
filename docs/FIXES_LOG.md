# Evidence Pack V2 — سجل التعديلات (Fixes Log)

مرجع: `docs/EVIDENCE_PACK_V2.md`

---

## Fix #4: "minutes 3" → "3 minutes"

| | القيمة |
|---|--------|
| **الملف** | `messages/en.json` |
| **السطر** | 107 (`home.stats[2].number`) |
| **قبل** | `"number": "minutes 3"` |
| **بعد** | `"number": "3 minutes"` |
| **النتيجة المتوقعة** | في الصفحة الإنجليزية `/en`، قسم الإحصائيات يعرض "3 minutes" بدلاً من "minutes 3". |
| **Commit** | `fix: correct english translation minutes 3 to 3 minutes` |

---

## Fix #7: Footer — active state + underline

| | القيمة |
|---|--------|
| **الملف** | `src/components/Footer.tsx` |
| **قبل** | لا `usePathname`؛ `linkClassName` بدون underline ولا تمييز للصفحة الحالية. |
| **بعد** | `import { usePathname } from 'next/navigation'`، `import { cn } from '@/lib/utils'`؛ إضافة `hover:underline` إلى `linkClassName`؛ لكل رابط (about, faq, privacy, feedback): `className={cn(linkClassName, pathname.endsWith('/about') && 'font-bold underline bg-accent-primary/10')}` ونظائرها. |
| **النتيجة المتوقعة** | روابط الـ Footer تظهر بخط تحتها عند الـ hover؛ الرابط النشط (نفس الصفحة) يظهر بخط عريض وتسطير وخلفية خفيفة. |
| **Commit** | `feat: footer active state + underline links` |

---

## Fix #5: Google button aria-label

| | القيمة |
|---|--------|
| **الملف** | `src/app/[locale]/login/page.tsx` |
| **السطر** | ~102 (زر Google) |
| **قبل** | الزر بدون `aria-label`. |
| **بعد** | `aria-label="تسجيل الدخول عبر حساب Google"` على الـ Button. |
| **النتيجة المتوقعة** | قارئات الشاشة تعلن "تسجيل الدخول عبر حساب Google" عند التركيز على الزر؛ تحسين الوصولية. |
| **Commit** | `a11y: add aria-label to google login button` |

---

## اختبار مقترح

- `npm run dev`
- `/ar/dashboard` — التأكد من عدم أخطاء.
- `/en` — التأكد من ظهور "3 minutes" في الإحصائيات.
- `/ar/login` — التأكد من وجود الزر ووصف الوصولية.
- أي صفحة تحتوي Footer (مثل `/ar`, `/en`, `/ar/about`) — التأكد من الـ hover underline وتمييز الرابط النشط على الصفحة الحالية.
