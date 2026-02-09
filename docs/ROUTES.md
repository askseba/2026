# All Site Routes

Base URL: **https://y-five-ochre.vercel.app**

---

## UI Routes (Pages)

صفحات المستخدم (page routes) من `src/app` — App Router.

1. /[locale] → https://y-five-ochre.vercel.app/[locale]
2. /[locale]/about → https://y-five-ochre.vercel.app/[locale]/about
3. /[locale]/dashboard → https://y-five-ochre.vercel.app/[locale]/dashboard
4. /[locale]/faq → https://y-five-ochre.vercel.app/[locale]/faq
5. /[locale]/favorites → https://y-five-ochre.vercel.app/[locale]/favorites
6. /[locale]/feedback → https://y-five-ochre.vercel.app/[locale]/feedback
7. /[locale]/login → https://y-five-ochre.vercel.app/[locale]/login
8. /[locale]/privacy → https://y-five-ochre.vercel.app/[locale]/privacy
9. /[locale]/profile → https://y-five-ochre.vercel.app/[locale]/profile
10. /[locale]/register → https://y-five-ochre.vercel.app/[locale]/register
11. /[locale]/results → https://y-five-ochre.vercel.app/[locale]/results
12. /[locale]/settings → https://y-five-ochre.vercel.app/[locale]/settings
13. /[locale]/quiz/step1-favorites → https://y-five-ochre.vercel.app/[locale]/quiz/step1-favorites
14. /[locale]/quiz/step2-disliked → https://y-five-ochre.vercel.app/[locale]/quiz/step2-disliked
15. /[locale]/quiz/step3-allergy → https://y-five-ochre.vercel.app/[locale]/quiz/step3-allergy
16. /notifications → https://y-five-ochre.vercel.app/notifications
17. /pricing → https://y-five-ochre.vercel.app/pricing
18. /pricing/success → https://y-five-ochre.vercel.app/pricing/success
19. /settings → https://y-five-ochre.vercel.app/settings
20. /test-header → https://y-five-ochre.vercel.app/test-header
21. /test-input → https://y-five-ochre.vercel.app/test-input

---

## API Routes

مسارات الـ API (route handlers) من `src/app/api`.

1. /api/auth/[...nextauth] → https://y-five-ochre.vercel.app/api/auth/[...nextauth]
2. /api/auth/register → https://y-five-ochre.vercel.app/api/auth/register
3. /api/feedback/suggestions → https://y-five-ochre.vercel.app/api/feedback/suggestions
4. /api/feedback/suggestions/[id]/vote → https://y-five-ochre.vercel.app/api/feedback/suggestions/[id]/vote
5. /api/match → https://y-five-ochre.vercel.app/api/match
6. /api/payment/create-checkout → https://y-five-ochre.vercel.app/api/payment/create-checkout
7. /api/perfumes → https://y-five-ochre.vercel.app/api/perfumes
8. /api/perfumes/search → https://y-five-ochre.vercel.app/api/perfumes/search
9. /api/user/favorites → https://y-five-ochre.vercel.app/api/user/favorites
10. /api/user/subscription/[externalId] → https://y-five-ochre.vercel.app/api/user/subscription/[externalId]
11. /api/user/tier → https://y-five-ochre.vercel.app/api/user/tier
12. /api/webhooks/moyasar/callback → https://y-five-ochre.vercel.app/api/webhooks/moyasar/callback

---

## ملاحظات

- **المصدر:** `src/app` (Next.js App Router). تم استبعاد `_archived` لأنه لا يُولّد routes.
- **الديناميك:** `[locale]` و `[id]` و `[externalId]` و `[...nextauth]` كما في بنية الملفات.
- **لم تُضمَن:** `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `sitemap.ts` — ليست routes نهائية للمستخدم.
