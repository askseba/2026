# Vercel production deploy checklist

Use this to run the steps yourself and screenshot each.

---

## 1. Open Vercel Dashboard

- Go to: **https://vercel.com/dashboard**
- Click project **"y"** (or the project linked to **askseba/2026**)

**Screenshot:** Dashboard with project "y" selected.

---

## 2. Settings → Git

- Click **Settings**
- Scroll to **Git**
- **Connect Repository** → **GitHub** → select **askseba/2026**
- **Production Branch:** `master`
- Save

**Screenshot:** Git section showing connected repo and Production Branch = `master`.

---

## 3. Trigger deploy

Already done from repo: empty commit pushed (`2c31eab`).

Optional in UI:

- **Deployments** tab → find latest (e.g. `2c31eab` or `3ca6b20`) → **Redeploy**

**Screenshot:** Deployments list with latest deployment building or completed (green checkmark).

---

## 4. Production env vars (CRITICAL)

**Settings** → **Environment Variables**. Add for **Production** (and optionally Preview):

| Name | Value | Notes |
|------|--------|--------|
| `MOYASAR_API_KEY` | `your_key` | From Moyasar dashboard |
| `MOYASAR_WEBHOOK_SECRET` | `your_secret` | From Moyasar webhook config |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Your real production URL |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Same as above |
| `AUTH_SECRET` | `your_secret` | e.g. `openssl rand -base64 32` |
| `DATABASE_URL` | `your_prisma_url` | Prisma connection string |
| `NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY` | `pk_test_...` or `pk_live_...` | If frontend uses it |

Save. **Redeploy** after changing env vars so they apply.

**Screenshot:** Environment Variables list (mask values; show names only).

---

## 5. Verify

- [ ] Latest deployment shows **green checkmark** (Ready).
- [ ] **Production URL** is visible (e.g. `https://askseba-2026.vercel.app` or your custom domain).
- [ ] Open: `https://<production-url>/pricing` → click **اشترك الآن** (logged in) → redirects to **Moyasar** checkout.

**Screenshot:** Browser on `/pricing` and/or Moyasar checkout.

---

## Production URLs (Project "y" — live)

| Page / API | URL |
|------------|-----|
| Base | https://y-five-ochre.vercel.app/ |
| Pricing | https://y-five-ochre.vercel.app/pricing |
| Profile (AR) | https://y-five-ochre.vercel.app/ar/profile |
| Webhook (Moyasar) | https://y-five-ochre.vercel.app/api/webhooks/moyasar/callback |

Use for `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL`: `https://y-five-ochre.vercel.app`

---

## Status template (fill and share)

```
Production URL: https://askseba-2026.vercel.app
Deploy commit: 2c31eab (or ___________)
Git connected: Yes / No
Env vars set: Yes / No
/pricing → اشتراك → Moyasar: Yes / No
Screenshots: [attach 1–4]
P1 stash@{0} جاهز for post-deploy refine.
```
