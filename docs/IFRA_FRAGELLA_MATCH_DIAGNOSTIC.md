# 🔍 تشخيص شامل: حالة ربط IFRA/Fragella في /api/match

**تاريخ:** 2026-02-10  
**النطاق:** رسم خريطة كاملة للوضع الحالي (بدون تعديلات)

---

## 1. فحص `src/app/api/match/route.ts` كاملاً

### Grep: rawPerfumes | searchUnified | enrichWithIFRA | Fragella | ifra

```
  3: import { perfumes as rawPerfumes } from '@/lib/data/perfumes'
 75: const allPerfumes: PerfumeForMatching[] = rawPerfumes.map(toPerfumeForMatching)
```

**النتيجة:** لا يوجد أي ذكر لـ `searchUnified` أو `enrichWithIFRA` أو `Fragella` أو `ifra` في route. المصدر الوحيد للعطور هو `rawPerfumes` من `@/lib/data/perfumes`.

### السطور 1–124 (ملف كامل)

| الأسطر | المحتوى |
|--------|---------|
| 1–7 | `NextResponse`, `auth`, **rawPerfumes** من `@/lib/data/perfumes`, أنواع `PerfumeForMatching` و `ScoredPerfume` من `@/lib/matching`, `calculateMatchScores`, `getResultsLimit`, `getBlurredCount`, `getUserTierInfo`, `SubscriptionTier` |
| 11–21 | `MatchRequestBody`: `preferences.likedPerfumeIds`, `dislikedPerfumeIds`, `allergyProfile.symptoms | families | ingredients` |
| 23–54 | `toPerfumeForMatching(p)`: ينتج `PerfumeForMatching` من حقول `id`, `name`, `brand`, `image`, `description`, `price`, **families**, **ingredients**, **symptomTriggers**, `isSafe`, `status`, `variant`, `scentPyramid: null` |
| 56–66 | POST: التحقق من `preferences`، إرجاع 400 عند الغياب |
| 68–86 | بناء `allergyProfile`، **`allPerfumes = rawPerfumes.map(toPerfumeForMatching)`**، استخراج `likedPerfumesFamilies`، بناء `userPreference` |
| 88 | **`scored = calculateMatchScores(allPerfumes, userPreference)`** |
| 90–108 | تحديد الـ tier، تطبيق `limit` و `blurredCount`، تقسيم `visible` و `blurred` |
| 110–115 | Response: `{ success: true, perfumes: visible, blurredItems: blurred, tier }` |
| 116–123 | catch: 500 مع رسالة عربية |

### الـ interfaces المستخدمة (من `@/lib/matching`)

- **PerfumeForMatching** (مستورد، غير معرّف في route):  
  `id`, `name`, `brand`, `image`, `description`, `price`, `families`, `ingredients`, `symptomTriggers`, `isSafe`, `status`, `variant`, `scentPyramid`.

- **ScoredPerfume** (مستورد):  
  يمتد `PerfumeForMatching` ويضيف:  
  `finalScore`, `tasteScore`, `safetyScore`, `isExcluded`, `exclusionReason`.  
  **لا يوجد `ifraScore` في الـ type.**

---

## 2. تدفق البيانات: ResultsContent → /api/match

### الملف: `src/components/results/ResultsContent.tsx`

- **الاستدعاء:**  
  `safeFetch<MatchResponse>('/api/match', { method: 'POST', body: JSON.stringify(payload) })`  
  (السطر 53).

### Payload shape

```ts
{
  preferences: {
    likedPerfumeIds: quizData?.step1_liked ?? [],
    dislikedPerfumeIds: quizData?.step2_disliked ?? [],
    allergyProfile: quizData?.step3_allergy ?? {}   // { symptoms?, families?, ingredients? }
  }
}
```

### Response parsing

- النوع: `MatchResponse` (معرّف محلياً في السطور 23–28):
  - `success: boolean`
  - `perfumes: ScoredPerfume[]`
  - `blurredItems?: BlurredItem[]`
  - `tier: 'GUEST' | 'FREE' | 'PREMIUM'`
- عند `data.success`:  
  `setScoredPerfumes(data.perfumes)`, `setBlurredItems(data.blurredItems || [])`, `setTier(data.tier)` (56–58).
- لا يوجد تحقق من حقول إضافية مثل `ifraScore` أو `ifraWarnings`.

### عرض البطاقة

- السطور 139–146:  
  `<PerfumeCard {...perfume} showCompare={...} isComparing={...} onCompare={...} priority={...} />`  
  أي أن كل عناصر `ScoredPerfume` (بما فيها `safetyScore`) تُمرَّر إلى PerfumeCard، لكن **لا يُمرَّر ولا يُستخدم `ifraScore`** لأن الـ API لا يعيده.

---

## 3. قاعدة العطور الفعلية: `src/lib/data/perfumes.ts`

- **عدد الأسطر:** 434 سطراً.
- **عدد عناصر المصفوفة:** ~20 عطراً (حسب عدد `id:` في الملف).

### عينة (أول ~20 سطراً من المصفوفة)

```ts
export const perfumes: Perfume[] = [
  {
    id: '1',
    name: 'Bleu de Chanel',
    brand: 'Chanel',
    image: '...',
    score: 92,
    matchPercentage: 92,
    status: 'safe',
    price: 450,
    isSafe: true,
    description: '...',
    families: ['citrus', 'woody'],
    ingredients: ['bergamot', 'sandalwood', 'lavender'],
    symptomTriggers: []
  },
  // ...
]
```

### الحقول الموجودة فعلياً

- **families[]:** ✅ موجود (مثل `['citrus', 'woody']`).
- **ingredients[]:** ✅ موجود (مثل `['bergamot', 'sandalwood', 'lavender']`).
- **symptomTriggers[]:** ✅ موجود (غالباً `[]` في العينة).

الـ route يقرأ هذه الحقول عبر `toPerfumeForMatching` ويحوّلها إلى `PerfumeForMatching` دون أي مصدر آخر (لا Fragella ولا IFRA).

---

## 4. حالة Fragella/IFRA الفعلية

### أين يُستخدم `searchUnified` و `enrichWithIFRA`؟

| الملف | الاستخدام |
|-------|-----------|
| `src/lib/services/perfume-bridge.service.ts` | تعريف `searchUnified` (سطر 44)، تعريف `enrichWithIFRA` (سطر 371)، و `enrichBatchWithIFRA` تستدعي `enrichWithIFRA` (سطر 426) |
| `src/app/api/perfumes/search/route.ts` | استيراد `searchUnified`، استدعاء `searchUnified(q.trim(), { limit })` و `searchUnified(query, { limit })` (سطور 2، 19، 59) |

**لا يوجد استدعاء لـ `searchUnified` أو `enrichWithIFRA` في:**
- `src/app/api/match/route.ts`
- أي route آخر تحت `api/match` أو `api/results`.

### متغير البيئة

- **FRAGELLA_API_KEY:** موجود في `.env.local` (مُعرّف في السطر 2).  
  (يُستخدم عبر `perfume.service` → Fragella عند استدعاء `searchUnified` من `/api/perfumes/search` فقط.)

### الخلاصة

- **/api/match:** يعتمد فقط على `rawPerfumes` من `perfumes.ts`. لا Fragella، لا IFRA، لا `searchUnified`، لا `enrichWithIFRA`.
- **Fragella/IFRA:** مستخدمان فقط في مسار البحث `/api/perfumes/search` عبر `searchUnified` و (إن وُجد استدعاء لاحق) `enrichWithIFRA`.

---

## 5. فحص SafetyWarnings

### أين يُستخدم SafetyWarnings؟

- **`src/components/SafetyWarnings.tsx`:** تعريف المكوّن فقط (واجهة `SafetyWarningsProps`: `perfume: UnifiedPerfume`, `ifraScore?`, `warnings?`, `className?`).
- **لا يوجد استيراد أو استخدام لـ `SafetyWarnings` في:**
  - `ResultsContent.tsx`
  - `PerfumeCard.tsx`
  - أي مكوّن آخر تحت `src/components/` (بحث بـ `SafetyWarnings` في `*.tsx` لا يعيد سوى الملف نفسه).

**النتيجة:** PerfumeCard و ResultsContent **لا يستوردان** SafetyWarnings. عرض السلامة الحالي في البطاقة يعتمد فقط على `isSafe` و `finalScore` (وشارة "آمن تماماً" عندما `isSafe && displayScore >= 70`)، وليس على IFRA أو SafetyWarnings.

---

## 6. حساب السلامة الحالي في `lib/matching.ts`

### الدالة `calculateSafetyScore`

```ts
// السطور 105–113 (تقريباً)
export function calculateSafetyScore(
  perfumeIngredients: string[],
  perfumeSymptomTriggers: string[],
  userAllergies: {
    symptoms: string[]
    families: string[]
    ingredients: string[]
  }
): { score: number; reason: string | null }
```

- **المدخلات المستخدمة فعلياً:**
  - `perfume.ingredients` (من `perfumes.ts`).
  - `perfume.symptomTriggers` (من `perfumes.ts`).
  - `userAllergies`: `symptoms`, `families`, `ingredients` من الـ quiz.

- **المنطق (ملخص):**
  - إذا وُجد تطابق بين `userAllergies.symptoms` و `perfumeSymptomTriggers` → إرجاع `{ score: 0, reason: 'يسبب ...' }`.
  - إذا وُجد تطابق بين `userAllergies.ingredients` و `perfumeIngredients` → إرجاع `{ score: 0, reason: 'يحتوي على ...' }`.
  - غير ذلك → إرجاع `{ score: 100, reason: null }`.

**لا يُستخدم:** بيانات IFRA، ولا Fragella، ولا مسببات الحساسية من IFRA. السلامة محسوبة فقط من القوائم الثابتة في `perfumes.ts` ومقارنتها بملف المستخدم.

### استخدام `safetyScore` في الخوارزمية

- داخل `calculateMatchScores` (حوالي 210–237):
  - استدعاء `calculateSafetyScore(perfume.ingredients, perfume.symptomTriggers, userPreference.allergyProfile)`.
  - إن كان `safetyScore === 0`: العطر يظهر مع تحذير (exclusionReason) ولا يُستبعد.
  - `finalScore = (tasteScore * 0.7) + (safetyScore * 0.3)` عبر `calculateFinalMatchScore`.

---

## 7. الخريطة النهائية لتدفق البيانات

```
┌─ Quiz Steps ──────────────────┐     ┌─ /api/perfumes/search ─────────────┐
│ liked (step1) / disliked (step2)│     │ searchUnified(query)              │
│ allergies (step3)               │     │   → local perfumes.ts             │
└───────────────┬─────────────────┘     │   → Fragella API (searchPerfumes) │
                │                       │ + يمكن إثراء بـ enrichWithIFRA     │
                │                       └──────────────┬────────────────────┘
                │                                      │
                │  لا يوجد اتصال بين مسار المطابقة ومسار البحث
                │
                ▼
┌───────────────────────────────────────────────────────────────────────────┐
│ /api/match (محدود بالكامل لمصدر واحد)                                      │
│   rawPerfumes فقط ← من @/lib/data/perfumes (ثابت، ~20 عطر)                 │
│   لا استدعاء لـ searchUnified، لا enrichWithIFRA، لا Fragella             │
│   calculateMatchScores( allPerfumes, userPreference )                       │
│   → ScoredPerfume[]: finalScore, tasteScore, safetyScore (بدون ifraScore)  │
└───────────────────────────────────────────────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────────────────────────────┐
│ ResultsContent                                                             │
│   safeFetch('/api/match', { preferences: { likedPerfumeIds, ... } })     │
│   → data.perfumes (ScoredPerfume[]), data.blurredItems, data.tier          │
│   لا استخدام لـ SafetyWarnings؛ لا ifraScore في الـ response               │
└───────────────────────────────────────────────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────────────────────────────┐
│ PerfumeCard (لكل عنصر من data.perfumes)                                    │
│   يعرض: finalScore، isSafe، شارة "آمن تماماً" عند isSafe && score >= 70    │
│   لا يعرض: ifraScore، IFRA warnings، ولا يستخدم SafetyWarnings            │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 8. قياس التأثير الفعلي

| البند | القيمة / الحالة |
|-------|------------------|
| عدد العطور المتاحة للمطابقة | ~20 عطر (من `perfumes.ts` فقط) |
| وجود `ifraScore` في استجابة /api/match | **لا.** نوع `ScoredPerfume` من `matching.ts` يحتوي فقط على: `finalScore`, `tasteScore`, `safetyScore`, `isExcluded`, `exclusionReason` بالإضافة لحقول `PerfumeForMatching`. لا يوجد حقل `ifraScore` في الـ type ولا في الـ response. |
| وجود `symptomTriggers` في الاستجابة | **نعم** كجزء من `PerfumeForMatching` (يُورث في `ScoredPerfume`)، لأن `toPerfumeForMatching` يمرر `symptomTriggers` من `perfumes.ts`. |

### نموذج استجابة متوقعة من POST /api/match

```json
{
  "success": true,
  "perfumes": [
    {
      "id": "1",
      "name": "Bleu de Chanel",
      "brand": "Chanel",
      "image": "...",
      "description": "...",
      "price": 450,
      "families": ["citrus", "woody"],
      "ingredients": ["bergamot", "sandalwood", "lavender"],
      "symptomTriggers": [],
      "isSafe": true,
      "status": "safe",
      "variant": null,
      "scentPyramid": null,
      "finalScore": 88,
      "tasteScore": 85,
      "safetyScore": 100,
      "isExcluded": false,
      "exclusionReason": null
    }
  ],
  "blurredItems": [],
  "tier": "GUEST"
}
```

لا يوجد `ifraScore` ولا `ifraWarnings` في الـ response.

---

## 9. قائمة الفجوات الدقيقة

1. **/api/match لا يستخدم Fragella ولا IFRA:** المصدر الوحيد للعطور هو `perfumes.ts` (~20 عطر).
2. **لا ifraScore في مسار المطابقة:** نوع `ScoredPerfume` والـ API لا يتضمنان `ifraScore` أو `ifraWarnings`.
3. **SafetyWarnings غير مستخدم في النتائج:** المكوّن موجود ويقبل `ifraScore` لكن لا يُستورد في ResultsContent ولا PerfumeCard.
4. **حساب السلامة في المطابقة لا يعتمد على IFRA:** يعتمد فقط على `ingredients` و `symptomTriggers` الثابتة في `perfumes.ts` ومقارنتها بملف المستخدم.
5. **انفصال مسار البحث عن مسار المطابقة:** البحث (`/api/perfumes/search`) يستخدم Fragella ويمكن أن يستخدم إثراء IFRA، بينما المطابقة (`/api/match`) لا تستفيد من أي منهما.

---

## 10. التوصية: الخطوة الأولى للربط

**الخطوة الأولى للربط بين IFRA/Fragella ومسار المطابقة:**

1. **في `/api/match`:**  
   بعد الحصول على `allPerfumes` (من `rawPerfumes` أو من مصدر موسّع لاحقاً)، استدعاء **`enrichBatchWithIFRA(allPerfumes, userSymptoms)`** (أو ما يعادلها لـ `PerfumeForMatching`) ثم استخدام النتائج في `calculateMatchScores`.  
   يتطلب ذلك إما:
   - تحويل/توصيل واجهة `PerfumeForMatching` مع واجهة الـ bridge (UnifiedPerfume) التي تدعمها `enrichWithIFRA`، أو  
   - إضافة حقول اختيارية مثل `ifraScore` و `ifraWarnings` إلى نوع المطابقة وملؤها داخل الـ route بعد الإثراء.

2. **في الاستجابة والواجهة:**  
   إضافة `ifraScore` (وإن أمكن `ifraWarnings`) إلى الـ object المُعاد من `/api/match` وإلى نوع `ScoredPerfume` المستخدم في الواجهة، ثم في ResultsContent/PerfumeCard إما عرضها مباشرة أو تمريرها إلى **SafetyWarnings** وعرض المكوّن في بطاقة النتائج.

بهذا يكون التشخيص مكتملاً مع أرقام الأسطر والتدفق والفجوات والتوصية الأولى للربط.
