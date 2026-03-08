# System-Wide Dependency Analysis: اختبار العطور (Step 1 & Step 2)

**نطاق الفحص:** الخطوة الأولى (عطور تعجبني) والخطوة الثانية (عطور لا تعجبني) — البحث عن العطور، إضافتها، وإدارة الحالة.

تم التتبع الفعلي من الصفحات إلى الـ imports وصولاً إلى الملفات الأساسية دون تخمين.

---

## 1. ملفات المنطق والحالة (Logic & State)

| المسار | الوصف |
|--------|--------|
| `src/contexts/QuizContext.tsx` | إدارة حالة الاختبار: `step1_liked`, `step2_disliked`، `setStep`، تخزين واسترجاع من sessionStorage (`quizData`, `quiz-step1`, `quiz_step2`, `quiz-step2-data`) |
| `src/lib/logger.ts` | مستخدم في QuizContext وصفحتي step1/step2 وـ API البحث لتسجيل الأخطاء |
| `src/hooks/useVoiceSearch.ts` | **Step1 فقط:** البحث الصوتي — يغذي حقل البحث بنص المُخرَج ويستخدم `/api/perfumes` أو `@/lib/data/perfumes` للـ fuzzy match |
| `src/lib/feature-flags.ts` | **Step1 فقط:** `voiceSearchEnabled` (NEXT_PUBLIC_VOICE_SEARCH_ENABLED) لتفعيل/إخفاء زر المايك |

**ملاحظة:** حالة العطور المختارة (Liked/Disliked) تُدار داخل الصفحات بـ `useState<LocalPerfume[]>` مع مزامنة إلى `QuizContext.setStep` وـ sessionStorage؛ لا يوجد Zustand/Redux منفصل لهذا المسار.

---

## 2. ملفات الواجهة (UI Components)

### نقطة الدخول (Routes/Pages)

| المسار | الوصف |
|--------|--------|
| `src/app/[locale]/quiz/step1-favorites/page.tsx` | صفحة "عطور تعجبني" — شريط بحث، قائمة نتائج، بطاقات مختارة، زر التالي، Progress dots |
| `src/app/[locale]/quiz/step2-disliked/page.tsx` | صفحة "عطور لا تعجبني" — نفس واجهة البحث + قائمة "غير المفضلة"، زر السابق/التالي، زر "تخطي هذه الخطوة" |
| `src/app/[locale]/quiz/step1-favorites/layout.tsx` | Layout Step1 — Metadata فقط، لا wrapper بصري |
| `src/app/[locale]/quiz/step2-disliked/layout.tsx` | Layout Step2 — Metadata فقط، لا wrapper بصري |

### مكونات مشتركة (تُستدعى من الصفحتين)

| المسار | الوصف |
|--------|--------|
| `src/components/ui/input.tsx` | حقل البحث (Input) — placeholder، قيمة، onChange |
| `src/components/ui/button.tsx` | زر التالي، وأزرار داخل VoiceMicButton؛ يستخدم Framer Motion وـ cva |
| `src/components/ui/BackButton.tsx` | Step1: "العودة للاختبار" (رابط). Step2: زر "السابق" مع onClick للعودة إلى step1 |
| `src/components/ErrorBoundary.tsx` | غلاف خطأ للصفحتين؛ يعتمد على `next-intl` وـ `@/i18n/routing` |

### مكونات خاصة بـ Step1 فقط

| المسار | الوصف |
|--------|--------|
| `src/components/ui/VoiceMicButton.tsx` | زر المايك بجانب حقل البحث؛ يعتمد على `@/types/voice-search` وـ `Button` |

### مكونات مضمّنة في الصفحات (بدون ملف منفصل)

- **قائمة نتائج البحث:** مقطع JSX داخل الصفحة (قائمة أزرار بنص العطر والماركة).
- **بطاقة عطر مختار (SelectedPerfumeCard):** دالة مكوّن محلية في نهاية كل من `step1-favorites/page.tsx` و `step2-disliked/page.tsx` (صورة، اسم، ماركة، زر حذف X).
- **Progress bar (النقاط):** ثلاثة دوائر (أيقونات) داخل JSX في كلا الصفحتين.

### التنسيقات التي تظهر خلف الصفحات (Layouts / Backgrounds)

| المسار | الوصف |
|--------|--------|
| `src/app/layout.tsx` | Root layout — خطوط، ThemeProvider، QuizProvider، Toaster، ConditionalLayout، globals.css |
| `src/app/[locale]/layout.tsx` | NextIntlClientProvider فقط؛ لا خلفية إضافية |
| `src/components/ConditionalLayout.tsx` | يلف المحتوى بـ Header + main + Footer (صفحات الاختبار لا تُستثنى) |
| `src/components/ui/header.tsx` | الهيدر المشترك |
| `src/components/Footer.tsx` | الفوتر المشترك |

---

## 3. ملفات التنسيق والأنواع (Styles & Types)

### الأنماط البصرية

| المسار | الوصف |
|--------|--------|
| `src/app/globals.css` | Tailwind، @theme، ألوان semantic (surface, text-primary, primary, cream-bg, danger-red، إلخ)، .dark |
| `tailwind.config.ts` | محتوى المسح (src/app, components, pages)، ألوان، ظلال (elevation-1, elevation-2)، primary، cream-bg، إلخ |

**Framer Motion:** مستخدم داخل `src/components/ui/button.tsx` فقط (motion من framer-motion)؛ لا توجد variants منفصلة لصفحات الاختبار.

### الأنواع (Types / Interfaces)

| المسار | الوصف |
|--------|--------|
| **تعريف محلي في الصفحات:** `type LocalPerfume = { id: string; name: string; brand: string; image: string }` | مستخدم في step1 و step2 للعطور المعروضة والمختارة |
| `src/lib/data/perfumes.ts` | واجهة `Perfume` وبيانات `perfumes`؛ يستورد `TimelineStage` من `@/components/ui/PerfumeTimeline` |
| `src/types/unified-perfume.ts` | `UnifiedPerfume`, `PerfumeNote`, `PerfumeSource`, `UnifiedSearchOptions`؛ مستخدمة في perfume-bridge وـ API البحث |
| `src/contexts/QuizContext.tsx` | `QuizData`, `QuizContextType` (step1_liked, step2_disliked, step3_allergy) |
| `src/types/voice-search.ts` | **Step1 فقط:** `VoiceState`, `VoiceStatus` — لـ useVoiceSearch و VoiceMicButton |

---

## 4. الثوابت والبيانات وواجهات API

### API البحث (مستخدم من الصفحتين)

| المسار | الوصف |
|--------|--------|
| `src/app/api/perfumes/search/route.ts` | GET/POST `/api/perfumes/search?q=...` — يستدعي `searchUnified` من perfume-bridge |
| `src/lib/services/perfume-bridge.service.ts` | `searchUnified()` — بحث موحّد (محلي + Fragella)؛ يستورد perfume.service و unified-perfume و logger |
| `src/lib/services/perfume.service.ts` | `searchPerfumesWithCache`, `getPerfume` — بحث Fragella وكاش Prisma |
| `src/lib/data/perfumes.ts` | مصدر البيانات المحلية وقائمة `perfumes`؛ نوع `Perfume` |

### نصوص الواجهة (الثوابت/الترجمة)

| المسار | الوصف |
|--------|--------|
| `messages/ar.json` | تحت `quiz.step1` و `quiz.step2` — العناوين، الوصف، placeholder، رسائل الخطأ، أزرار، empty state، ARIA |
| `messages/en.json` | نفس المفاتيح لـ `quiz.step1` و `quiz.step2` |

### التوجيه والـ i18n

| المسار | الوصف |
|--------|--------|
| `src/i18n/routing.ts` | `routing`, `useRouter`, `Link`, `usePathname`, `redirect`, `getPathname` — للتنقل بين step1 ↔ step2 و quiz |

### أصول (Assets)

| المسار | الوصف |
|--------|--------|
| `public/placeholder-perfume.svg` | صورة احتياطية للعطر عند فشل تحميل الصورة في SelectedPerfumeCard |

### Step1 فقط (مرتبط بالبحث الصوتي)

| المسار | الوصف |
|--------|--------|
| `src/lib/voice-search-mapping.ts` | تحويل العربية → إنجليزي لأسماء العطور/العلامات لتحسين نتائج البحث الصوتي |

---

## 5. ملخص الملفات المشتركة بين الخطوتين

أي تعديل في الملفات التالية يؤثر على **الخطوتين معاً**:

- `src/contexts/QuizContext.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/BackButton.tsx`
- `src/components/ErrorBoundary.tsx`
- `src/app/api/perfumes/search/route.ts`
- `src/lib/services/perfume-bridge.service.ts`
- `src/lib/services/perfume.service.ts`
- `src/lib/data/perfumes.ts`
- `src/types/unified-perfume.ts`
- `messages/ar.json` (quiz.step1 + quiz.step2)
- `messages/en.json` (quiz.step1 + quiz.step2)
- `src/app/globals.css`
- `tailwind.config.ts`
- `src/app/layout.tsx`
- `src/components/ConditionalLayout.tsx`
- `src/components/ui/header.tsx`
- `src/components/Footer.tsx`
- `src/i18n/routing.ts`
- `src/lib/logger.ts`
- `public/placeholder-perfume.svg`

---

## 6. قائمة مسارات الملفات فقط (للمراجعة السريعة)

### منطق وحالة
- `src/contexts/QuizContext.tsx`
- `src/lib/logger.ts`
- `src/hooks/useVoiceSearch.ts`
- `src/lib/feature-flags.ts`

### واجهة (صفحات + مكونات + تخطيط)
- `src/app/[locale]/quiz/step1-favorites/page.tsx`
- `src/app/[locale]/quiz/step2-disliked/page.tsx`
- `src/app/[locale]/quiz/step1-favorites/layout.tsx`
- `src/app/[locale]/quiz/step2-disliked/layout.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/BackButton.tsx`
- `src/components/ErrorBoundary.tsx`
- `src/components/ui/VoiceMicButton.tsx`
- `src/app/layout.tsx`
- `src/app/[locale]/layout.tsx`
- `src/components/ConditionalLayout.tsx`
- `src/components/ui/header.tsx`
- `src/components/Footer.tsx`

### أنماط وأنواع
- `src/app/globals.css`
- `tailwind.config.ts`
- `src/lib/data/perfumes.ts` (أنواع + بيانات)
- `src/types/unified-perfume.ts`
- `src/types/voice-search.ts`
- `src/contexts/QuizContext.tsx` (أنواع QuizData)

### ثوابت وبيانات وAPI
- `src/app/api/perfumes/search/route.ts`
- `src/lib/services/perfume-bridge.service.ts`
- `src/lib/services/perfume.service.ts`
- `src/lib/data/perfumes.ts`
- `messages/ar.json`
- `messages/en.json`
- `src/i18n/routing.ts`
- `src/lib/voice-search-mapping.ts`
- `public/placeholder-perfume.svg`

---

*تم إعداد هذا التقرير بناءً على تتبع الـ imports والاستدعاءات الفعلية في المشروع دون افتراض مسارات غير مستخدمة في مسار "اختبار العطور" (Step1 و Step2).*
