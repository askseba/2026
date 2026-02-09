# Evidence Pack v2 — Ask Seba

## 0) بيئة التحقق

- **الفرع/الكوميت:** `master` / `2c31eab`
- **رابط الإنتاج (Base URL):** https://y-five-ochre.vercel.app
- **طريقة التشغيل المحلي (إن استُخدمت):** لم يُشغّل المشروع محلياً؛ الاعتماد على فحص الكود فقط.
- **اللغة/اللغات:** ar و en
- **حالة الدخول:** logged out (وإن احتجت logged in اذكر ذلك صراحة)

---

## 1) فهرس الأدلة (جدول)

| # | الادعاء | الوسم | المسار/Route | File path | Component/Symbol | Lines | Proof snippet |
|---|---------|-------|--------------|-----------|------------------|-------|---------------|
| 1 | /ar/dashboard: هل الصفحة تظهر فقط "جاري التحميل..."؟ هل هذا stuck loading؟ أم SSR fallback ثم يتبدل؟ أم redirect؟ | دليل-من-الكود | /ar/dashboard | src/app/[locale]/dashboard/page.tsx | DashboardPage | 39–40 | `if (status === 'loading') return <...><LoadingSpinner size="lg" /></div>` ثم إما redirect أو المحتوى |
| 2 | /ar/results: نفس الفكرة (loading فقط؟ السبب؟) | دليل-من-الكود | /ar/results | src/app/[locale]/results/page.tsx، src/components/results/ResultsContent.tsx | ResultsPage، ResultsContent | 17–21، 36، 75 | Server يعيد `<ResultsContent />`؛ العميل يعرض LoadingSpinner أثناء fetch ثم المحتوى |
| 3 | نص "Loading theme": مصدره، هل مرئي؟ لحظي فقط؟ (SSR فقط vs مرئي للمستخدم) | دليل-من-الكود | أي صفحة تحتوي DarkModeToggle | src/components/DarkModeToggle.tsx | DarkModeToggle | 16–26 | `<span className="sr-only">Loading theme</span>` داخل زر معطل عند !mounted |
| 4 | /en: ظهور "minutes 3" — مفتاح i18n + ملف ترجمة + سطر + نص exact | دليل-من-الكود | /en | messages/en.json، src/components/landing/StatsSection.tsx | —، StatsSection | 104–108، 34–35، 51–52 | `home.stats`، العنصر الثالث: `"number": "minutes 3"` يُعرض كـ `stat.number` |
| 5 | زر تسجيل الدخول عبر Google في /ar/login: هل لديه aria-label؟ النص المرئي كافٍ؟ | دليل-من-الكود | /ar/login | src/app/[locale]/login/page.tsx | LoginContent (Button) | 102–117 | زر بدون aria-label؛ النص المرئي فقط: "المتابعة بـ Google" |
| 6 | الصور الأساسية (لوجو/زجاجة): هل alt موجود وقيمته؟ | دليل-من-الكود | /ar، /en (لاندينغ) | src/components/landing/HeroSection.tsx | HeroSection | 87–94، 119–127 | Logo: `alt="Ask Seba"`؛ الزجاجة: `alt="Perfume Bottle"` |
| 7 | Footer: active state للروابط؟ روابط بدون underline بسبب CSS؟ | دليل-من-الكود | كل الصفحات التي تعرض Footer | src/components/Footer.tsx | Footer، linkClassName | 7–8، 26–44 | `linkClassName` بدون underline ولا active؛ لا استخدام usePathname لتمييز الرابط النشط |

---

## 2) النتائج (Finding لكل ادعاء)

### Finding #1: /ar/dashboard — هل الصفحة تظهر فقط "جاري التحميل..."؟ هل هذا stuck loading؟ أم SSR fallback ثم يتبدل؟ أم redirect؟

- **الوسم:** [دليل-من-الكود]
- **المسار/Route:** `/ar/dashboard`
- **الدليل من الكود:**
  - **File:** `src/app/[locale]/dashboard/page.tsx`
  - **Component/Symbol:** `DashboardPage`
  - **Lines:** 39–40
- **مقتطف الدليل (1–10 أسطر):**
```tsx
  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center bg-cream-bg dark:!bg-surface"><LoadingSpinner size="lg" /></div>
  if (status === 'unauthenticated') { router.push('/login'); return null; }
```
- **ملاحظة قصيرة:** الصفحة تعرض "جاري التحميل..." فقط أثناء `status === 'loading'` (تحميل useSession). ليست stuck by design: بعد انتهاء التحميل إما إعادة توجيه إلى `/login` (غير مسجل) أو عرض المحتوى. لا يوجد `loading.tsx` في المسار الفعلي؛ لا SSR fallback من Next.js لهذا المسار.

---

### Finding #2: /ar/results — نفس الفكرة (loading فقط؟ السبب؟)

- **الوسم:** [دليل-من-الكود]
- **المسار/Route:** `/ar/results`
- **الدليل من الكود:**
  - **File:** `src/app/[locale]/results/page.tsx` و `src/components/results/ResultsContent.tsx`
  - **Component/Symbol:** `ResultsPage`، `ResultsContent`
  - **Lines:** page 17–21؛ ResultsContent 36، 66، 75
- **مقتطف الدليل (1–10 أسطر):**
```tsx
// page.tsx
export default async function ResultsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return <ResultsContent />
}
```
```tsx
// ResultsContent.tsx
const [isLoading, setIsLoading] = useState(true)
// ...
useEffect(() => { fetchResults() }, [fetchResults])
if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-cream-bg dark:!bg-surface"><LoadingSpinner size="lg" /></div>
```
- **ملاحظة قصيرة:** الصفحة تعرض "جاري التحميل..." أثناء `isLoading === true` (أثناء استدعاء `/api/match`). بعد انتهاء fetch تُعرض النتائج أو رسالة خطأ. السبب واضح من الكود: حالة تحميل طبيعية وليست stuck افتراضياً.

---

### Finding #3: نص "Loading theme" — ما مصدره؟ هل هو مرئي فعلاً؟ هل يظهر لحظيًا فقط؟ (SSR فقط vs مرئي للمستخدم)

- **الوسم:** [دليل-من-الكود] + [ملاحظة-SSR فقط] من حيث الرؤية البصرية
- **المسار/Route:** أي صفحة تحتوي الهيدر الذي يعرض `DarkModeToggle` (مثل `/ar`, `/en`, `/ar/login`).
- **الدليل من الكود:**
  - **File:** `src/components/DarkModeToggle.tsx`
  - **Component/Symbol:** `DarkModeToggle`
  - **Lines:** 16–26
- **مقتطف الدليل (1–10 أسطر):**
```tsx
  if (!mounted) {
    return (
      <button
        className="theme-toggle group"
        disabled
        aria-hidden
        style={{ cursor: 'default' }}
      >
        <div className="icon-container">
          <span className="sr-only">Loading theme</span>
        </div>
      </button>
    );
  }
```
- **ملاحظة قصيرة:** المصدر هو `DarkModeToggle.tsx` داخل `<span className="sr-only">`. صنف `sr-only` في Tailwind يخفّي العنصر بصرياً ويبقيه لقراء الشاشة فقط. النص موجود في HTML السيرفر وحتى بعد hydration حتى `mounted === true`، ثم يُستبدل بالزر الفعلي. لذلك: **غير مرئي للمستخدم المبصر**؛ يظهر فقط لقراء الشاشة لحظياً حتى اكتمال hydration.

---

### Finding #4: /en — ظهور "minutes 3" — استخراج المفتاح (i18n key) + ملف الترجمة + السطر + النص exact

- **الوسم:** [دليل-من-الكود]
- **المسار/Route:** `/en`
- **الدليل من الكود:**
  - **File:** `messages/en.json`؛ `src/components/landing/StatsSection.tsx`
  - **Component/Symbol:** مفتاح الترجمة `home.stats`؛ المكوّن `StatsSection`
  - **Lines:** en.json 104–108؛ StatsSection 34–35، 51–52
- **مقتطف الدليل (1–10 أسطر):**
```json
    "stats": [
      { "number": "80,000+", "label": "Global fragrance" },
      { "number": "98%", "label": "User satisfaction" },
      { "number": "minutes 3", "label": "Test duration" },
      { "number": "10,000+", "label": "User" }
    ],
```
```tsx
  const t = useTranslations('home');
  const stats = t.raw('stats') as Stat[];
  // ...
  <p className="...">{stat.number}</p>
```
- **ملاحظة قصيرة:** المفتاح الفعلي للمصفوفة هو `home.stats`؛ العنصر الذي يعطي "minutes 3" هو العنصر الثالث، والقيمة المعروضة exact هي النص `"minutes 3"` من الحقل `number` في `messages/en.json` سطر 107.

---

### Finding #5: زر تسجيل الدخول عبر Google في /ar/login — هل لديه aria-label؟ وإذا لا، هل النص المرئي كافٍ؟

- **الوسم:** [دليل-من-الكود]
- **المسار/Route:** `/ar/login`
- **الدليل من الكود:**
  - **File:** `src/app/[locale]/login/page.tsx`
  - **Component/Symbol:** `LoginContent` — الزر (Button) الخاص بـ Google
  - **Lines:** 102–117
- **مقتطف الدليل (1–10 أسطر):**
```tsx
          <Button
            variant="outline"
            type="button"
            className="w-full py-4 rounded-2xl ..."
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <svg className="w-5 h-5 ms-2 shrink-0" ... aria-hidden>
              ...
            </svg>
            المتابعة بـ Google
          </Button>
```
- **ملاحظة قصيرة:** الزر **لا يملك** `aria-label`. النص المرئي الوحيد هو "المتابعة بـ Google" داخل محتوى الزر. كفاية النص للمستخدمين تعتمد على سياسة الوصولية؛ من الكود يُثبت فقط غياب aria-label ووجود نص مرئي واضح.

---

### Finding #6: الصور الأساسية (لوجو / صورة الزجاجة) — هل alt موجود؟ وما قيمته؟

- **الوسم:** [دليل-من-الكود]
- **المسار/Route:** `/ar`, `/en` (الصفحة الرئيسية التي تعرض HeroSection)
- **الدليل من الكود:**
  - **File:** `src/components/landing/HeroSection.tsx`
  - **Component/Symbol:** `HeroSection`
  - **Lines:** 87–94 (لوجو)، 119–127 (زجاجة)
- **مقتطف الدليل (1–10 أسطر):**
```tsx
            <Image
              src="/ask_logo.png"
              alt="Ask Seba"
              width={280}
              height={72}
              ...
            />
```
```tsx
            <Image
              src="/perfume_transparent.webp"
              alt="Perfume Bottle"
              width={280}
              height={400}
              ...
            />
```
- **ملاحظة قصيرة:** كلتا الصورتين تحتويان على `alt`: اللوجو `alt="Ask Seba"`، صورة الزجاجة `alt="Perfume Bottle"`. القيم ثابتة في الكود وليست فارغة.

---

### Finding #7: Footer — هل يوجد active state للروابط؟ وهل الروابط بدون underline بسبب CSS؟

- **الوسم:** [دليل-من-الكود]
- **المسار/Route:** كل الصفحات التي تعرض الـ Footer (عبر ConditionalLayout)
- **الدليل من الكود:**
  - **File:** `src/components/Footer.tsx`
  - **Component/Symbol:** `Footer`، `linkClassName`
  - **Lines:** 7–8؛ 26–44
- **مقتطف الدليل (1–10 أسطر):**
```tsx
const linkClassName =
  '!inline-flex !items-center !justify-center !min-h-[44px] !min-w-[44px] !transition-colors !text-[rgb(var(--color-accent-primary))] hover:!text-[rgb(var(--color-accent-primary))] touch-manipulation'
```
```tsx
            <Link href="/about" className={linkClassName}>
              {chunks}
            </Link>
            // نفس النمط لـ faq, privacy, feedback
```
- **ملاحظة قصيرة:** (1) **لا يوجد active state:** لا استخدام لـ `usePathname` ولا أي class شرطي للصفحة الحالية؛ روابط الـ Footer لا تتميز بصرياً عند كون المستخدم على نفس الصفحة. (2) **بدون underline:** الـ `linkClassName` لا يتضمن `underline` ولا `hover:underline`؛ الروابط تظهر بدون خط تحته بسبب هذا الـ class.

---

توقف — تم تغطية كل الادعاءات المذكورة فقط، بدون إضافات.
