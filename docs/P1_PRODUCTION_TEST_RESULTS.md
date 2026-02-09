# P1 Production test results

**Production URL:** https://y-five-ochre.vercel.app/

---

## Test checklist (run in your browser)

| Test | URL | Expected | Your result |
|------|-----|----------|-------------|
| 1. Pricing → اشتراك → Moyasar | https://y-five-ochre.vercel.app/pricing | Login → اشترك الآن → redirect to Moyasar | ⏳ test |
| 2. Profile auth + tier | https://y-five-ochre.vercel.app/ar/profile | Auth guard + tier (مجاني/مميز) | ⏳ test |
| 3. Webhook (GET) | https://y-five-ochre.vercel.app/api/webhooks/moyasar/callback | **405** Method Not Allowed (POST only) | ⏳ test |

---

## Fill + share

```
Production URL: https://y-five-ochre.vercel.app/
Deploy commit: 2c31eab ✓
/pricing → اشتراك → Moyasar: ⏳ test
Profile tier: ⏳ test
Webhook (GET → 405): ⏳ test
```

**Results → P1 stash pop + production refine.**

---

## Notes

- **Webhook:** Only **POST** is handled. GET (e.g. browser open) should return **405** — that’s expected.
- **Env on Vercel:** Set `NEXT_PUBLIC_APP_URL=https://y-five-ochre.vercel.app` and `NEXTAUTH_URL=https://y-five-ochre.vercel.app` so checkout and auth use the correct origin.
- **Moyasar callback URL:** Use `https://y-five-ochre.vercel.app/api/webhooks/moyasar/callback` in the Moyasar dashboard.

---

## Mic search (mobile / Vercel) — diagnosis

**مشكلة:** الميكروفون في خانة البحث لا يظهر على الموبايل بعد النشر على Vercel.

### نتائج التشخيص

| السؤال | الجواب |
|--------|--------|
| **A) Mic visible on localhost mobile?** | **Yes** — إذا كان `NEXT_PUBLIC_VOICE_SEARCH_ENABLED=true` في `.env.local`. |
| **B) Vercel build logs errors?** | لا حاجة — المشكلة **ليست من البناء** بل من **متغير البيئة**. |
| **C) CSS hiding mic on mobile?** | **No** — لا يوجد `hidden` أو `sm:flex` أو `display:none` على زر الميكروفون. |
| **D) Quick fix** | إضافة متغير البيئة على Vercel ثم إعادة النشر. |

### السبب

- ظهور الميكروفون يعتمد على: `voiceSearchEnabled && isSupported`.
- `voiceSearchEnabled = process.env.NEXT_PUBLIC_VOICE_SEARCH_ENABLED === 'true'`.
- في **Vercel** إذا لم يُضف هذا المتغير في Environment Variables يكون `voiceSearchEnabled` = **false** فلا يُعرض الزر أبداً (سطح المكتب والموبايل).
- محلياً يكون الظهور طبيعياً لأن `.env.local` يحتوي `NEXT_PUBLIC_VOICE_SEARCH_ENABLED=true`.

### الإصلاح السريع

1. Vercel Dashboard → مشروعك → **Settings** → **Environment Variables**.
2. أضف:
   - **Name:** `NEXT_PUBLIC_VOICE_SEARCH_ENABLED`
   - **Value:** `true`
   - **Environment:** Production (و Preview إن رغبت).
3. إعادة النشر:
   ```bash
   vercel --prod --force
   ```
   أو من الواجهة: Deployments → ... → Redeploy.

### ملاحظة

- `isSupported` يأتي من دعم المتصفح لـ Speech Recognition (مثلاً iOS 14.5+). إن كان المتصفح لا يدعمه فلن يظهر الزر حتى بعد تفعيل المتغير.
