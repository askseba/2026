# Subscription Journey Report (A→Z)

**App:** Next.js (Ask Seba)  
**Payment provider:** Moyasar (not Stripe)  
**Report type:** Diagnostic only — no code changes.

---

## A) Entry points (UI)

| Location | Label / behavior | Target / action |
|----------|------------------|-----------------|
| **`src/app/pricing/page.tsx`** | Button "اشترك الآن" (Subscribe now) on Premium Monthly card | `onClick={() => handleSubscribe(billingCycle)}` → calls `handleSubscribe('monthly' \| 'yearly')` (lines 301–302, 308). |
| **`src/app/pricing/page.tsx`** | Free plan: "ابدأ مجاناً" | If not `session`: `signIn()`. If session: disabled, "خطتك الحالية" (lines 204–214). |
| **`src/components/ui/UpsellCard.tsx`** | Link "اشترك الآن" | `href="/pricing"` (line 114). |
| **`src/components/ResultsGrid.tsx`** | Upgrade CTAs | `router.push('/pricing')` (lines 241, 350, 364); text "اشترك للحصول على اختبارات غير محدودة" (245, 277). |
| **`src/components/ui/BlurredTeaserCard.tsx`** | "اشترك للوصول لجميع النتائج" / "اشترك بـ 15 ريال/شهر" | `onUpgrade?.() \|\| router.push('/pricing')` (lines 48, 52, 58, 124). |

**Screens / conditions:**

- **Logged out:** Pricing page allows choosing plan; on "اشترك الآن", `handleSubscribe` calls `logConversionEvent('pricing_signup_clicked', ...)` then `signIn()` (no redirect to checkout).
- **Logged in:** `handleSubscribe` calls `logConversionEvent('pricing_subscribe_clicked', session.user.id, ...)` then `POST /api/payment/create-checkout` with `{ plan }`; on success, redirects to `data.checkoutUrl` (Moyasar).

There is no separate "Subscribe / الاشتراك" nav item in the header; subscription is reached via pricing CTAs and `/pricing`.

---

## B) Navigation flow

1. User clicks any "اشترك" / upgrade CTA → **`/pricing`** (root path; pricing is under `src/app/pricing/`, not under `[locale]`).
2. **Middleware** (`src/middleware.ts`): next-intl only; matcher excludes `/api`, so `/pricing` is locale-handled by next-intl. Pricing page itself is not under `[locale]`, so it is served at **`/pricing`** (no `/ar`/`/en` prefix in current structure).
3. On "اشترك الآن" (logged in): client calls `POST /api/payment/create-checkout` → then **redirect to Moyasar** `data.checkoutUrl`.
4. Moyasar **return_url**: `{NEXT_PUBLIC_APP_URL}/pricing/success?paymentId={id}` → **`/pricing/success`**.
5. **Cancel**: `cancel_url` → `{NEXT_PUBLIC_APP_URL}/pricing?status=cancelled` → back to **`/pricing`**.

No middleware-driven auth redirect for `/pricing`; page uses `useSession()` and prompts sign-in when needed.

---

## C) Backend initiation

- **Expected API route:** `POST /api/payment/create-checkout`
- **Status:** **Route file does not exist** in the repo. Under `src/app/api/` there are only: `auth`, `feedback`, `match`, `perfumes`, `user` (with `favorites` only). There is no `payment/` or `payment/create-checkout/route.ts`.

**Intended behavior (from frontend and Moyasar service):**

- **Input:** `{ plan: 'monthly' | 'yearly' }` (from `src/app/pricing/page.tsx` lines 76–81).
- **Validation:** Would need session (e.g. `getServerSession`) to get `userId` and `userEmail`; plan validated server-side.
- **Service:** `src/lib/payment/moyasar.service.ts` — `MoyasarService.createCheckout({ userId, plan, amount, userEmail, userName })` (lines 92–145). Amount from `getPlans()`: monthly 15 SAR, yearly 150 SAR.
- **Output:** `{ success: true, checkoutUrl: string }` (frontend expects `data.checkoutUrl` at line 90).

**Conclusion:** Creation of checkout session is **CANNOT VERIFY** — the handler that would call `getMoyasarService().createCheckout(...)` and optionally create a `CheckoutSession` record is missing. **Next file to add/inspect:** `src/app/api/payment/create-checkout/route.ts`.

---

## D) Payment provider workflow

- **Provider:** **Moyasar** (not Stripe). Evidence: `src/lib/payment/moyasar.service.ts`, Prisma enum `PaymentProvider` includes `MOYASAR` (`prisma/schema.prisma` line 36).

**API usage (from `moyasar.service.ts`):**

| Step | Method / endpoint | Purpose |
|------|-------------------|--------|
| Create checkout | `POST https://api.moyasar.com/v1/payments` | Body: amount (halalas), currency SAR, description, `callback_url`, `return_url`, `cancel_url`, `metadata: { userId, plan, tier: 'PREMIUM' }`. Returns `url` (checkout URL) and `id` (payment id). |
| Verify payment | `GET https://api.moyasar.com/v1/payments/:paymentId` | Used to verify status (e.g. `paid`). |
| Recurring | `POST .../payments` with `source: { type: 'token', token: sourceId }` | `chargeRecurring()`; callback_url for recurring: `/api/webhooks/moyasar/recurring`. |
| Refund | `POST .../payments/:id/refund` | Optional amount in halalas. |

**URLs:**

- **Success:** `return_url: ${appUrl}/pricing/success?paymentId={id}` (line 115).
- **Cancel:** `cancel_url: ${appUrl}/pricing?status=cancelled` (line 116).
- **Callback (webhook):** `callback_url: ${appUrl}/api/webhooks/moyasar/callback` (line 114).

`appUrl` comes from `process.env.NEXT_PUBLIC_APP_URL` (required in service, line 102–105).

---

## E) Webhook handling (if applicable)

- **Expected webhook route:** **`/api/webhooks/moyasar/callback`** (POST).  
- **Status:** **Route does not exist.** There is no `src/app/api/webhooks/` directory.

**Intended verification (present in lib only):**

- **`src/lib/payment/moyasar.service.ts`:** `verifyWebhookSignature(payload, signature)` (lines 286–334): uses `MOYASAR_WEBHOOK_SECRET` or `MOYASAR_WEBHOOK_SECRETS` (CSV), HMAC-SHA256, constant-time compare.
- **`src/lib/moyasar.ts`:** `verifyWebhookSignature(payload, signature, secret)` — same idea, single secret.

**Expected webhook handler responsibilities (inferred from schema and email service):**

1. Verify signature (using one of the above).
2. On payment success (e.g. status `paid`): create or update **`Subscription`** (and possibly set `User.subscriptionTier = 'PREMIUM'`), create **`CheckoutSession`** or update to `completed`, call **`sendPaymentSuccessEmail`** (defined in `src/lib/email/email.service.ts` lines 13–118; not called from any existing route — **CANNOT VERIFY** where it is invoked).
3. Idempotency: Prisma `Subscription.externalId` and `moyasarPaymentId` are unique; handler should use payment id to avoid duplicate subscriptions.

**Recurring webhook:** `callback_url` for recurring charges points to `/api/webhooks/moyasar/recurring`. That route also **does not exist**.

**Conclusion:** Webhook handling is **CANNOT VERIFY**. **Next files to add/inspect:** `src/app/api/webhooks/moyasar/callback/route.ts` and, for recurring, `src/app/api/webhooks/moyasar/recurring/route.ts`.

---

## F) Data model

**Tables involved (from `prisma/schema.prisma`):**

| Model | Key fields | Role in journey |
|-------|------------|------------------|
| **User** | `id`, `email`, `subscriptionTier` (enum: GUEST, FREE, PREMIUM), `monthlyTestCount`, `lastTestReset` | Identity for checkout; tier updated when subscription is active (e.g. in `getUserTierInfo` or webhook). |
| **Subscription** | `id`, `userId`, `tier`, `status` (ACTIVE, CANCELED, EXPIRED, TRIAL, FAILED, PENDING), `plan`, `startDate`, `endDate`, `provider` (MOYASAR), `externalId`, `moyasarPaymentId`, `moyasarCustomerId`, `moyasarSourceId`, `lastPaymentDate`, `nextBillingDate`, `currentPeriodEnd`, `amount`, `currency`, etc. | One row per subscription; status and end date drive entitlement. |
| **CheckoutSession** | `id`, `userId`, `email`, `status` (initiated, abandoned, recovered, completed), `plan`, `sessionId`, `amount`, `recoveryEmailSentAt`, `recoveryEmailCount` | Checkout recovery (e.g. abandoned cart emails); referenced from pricing page recovery flow. |
| **ConversionEvent** | `eventType`, `userId`, `fromTier`, `toTier`, `page`, `metadata` | Analytics; written by `logConversionEvent()` from pricing page. |

**How subscription status is derived:**

- **`src/lib/gating.ts`:** `getUserTierInfo(userId)` loads user with `subscriptions: { where: { status: 'ACTIVE', endDate: { gt: new Date() } }, take: 1 }`. If any such subscription exists, `hasActiveSubscription === true` and user tier is set/updated to PREMIUM (lines 58–96). So subscription status is stored on **Subscription** and reflected on **User.subscriptionTier** when tier is computed/updated.

**Where Subscription / CheckoutSession are written:** No `prisma.subscription.create` or `prisma.checkoutSession.create` (or similar) appears anywhere in `src/`. So DB writes for subscription and checkout session are **only** in the missing API routes (create-checkout and webhook). **CANNOT VERIFY** exact field mapping and idempotency without those handlers.

---

## G) Profile entitlements

- **Profile page** (`src/app/[locale]/profile/page.tsx`): Shows user name, email, avatar, sensitivity toggles, logout, delete account. **Does not** show subscription tier, plan, or end date. No call to `getUserTierInfo` or subscription API.
- **Dashboard** (`src/app/[locale]/dashboard/page.tsx`): Shows a **hardcoded** badge "عضو بريميوم" (line 59). It does **not** read from `getUserTierInfo` or session subscription; all users see the same badge.
- **Results / gating:** `src/app/api/match/route.ts`: Tier is **hardcoded** as `'GUEST'` (line 88). It does **not** use `getServerSession` or `getUserTierInfo`. So results limit and blurred count are not driven by real subscription status.
- **Gating lib:** `getUserTierInfo`, `checkTestLimit`, `checkPriceAlertLimit` in `src/lib/gating.ts` are the source of truth for tier and limits; they are **not** used by the match API or by profile/dashboard UI in the current code.

**Conclusion:** Profile and dashboard do **not** reflect real subscription status. Entitlement logic exists in `gating.ts` but is not wired to the match API or to profile/settings UI. Caching/session update strategy for subscription status is **CANNOT VERIFY** (no code path that updates session with tier after payment).

---

## H) Files inventory (complete)

**Frontend – pages**

- `src/app/pricing/page.tsx` — Pricing plans, "اشترك الآن", handleSubscribe, recovery pre-fill.
- `src/app/pricing/success/page.tsx` — Success screen; fetches `/api/user/subscription/${externalId}`, redirects if not ACTIVE.

**Frontend – components**

- `src/components/ui/UpsellCard.tsx` — Link to `/pricing`, "اشترك الآن".
- `src/components/ui/BlurredTeaserCard.tsx` — Upgrade CTA → `/pricing`.
- `src/components/ResultsGrid.tsx` — Upgrade buttons and `router.push('/pricing')`.
- `src/app/[locale]/profile/page.tsx` — Profile (no subscription UI).
- `src/app/[locale]/dashboard/page.tsx` — Dashboard (hardcoded "عضو بريميوم").

**API routes (existing)**

- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/api/user/favorites/route.ts`
- `src/app/api/feedback/suggestions/route.ts`, `.../ [id]/vote/route.ts`
- `src/app/api/match/route.ts`
- `src/app/api/perfumes/route.ts`, `api/perfumes/search/route.ts`

**API routes (referenced in code but NOT present)**

- `src/app/api/payment/create-checkout/route.ts` — Called by pricing page.
- `src/app/api/checkout-session/[id]/route.ts` — GET/PATCH for recovery (pricing page).
- `src/app/api/webhooks/moyasar/callback/route.ts` — Moyasar callback_url.
- `src/app/api/webhooks/moyasar/recurring/route.ts` — Recurring callback.
- `src/app/api/user/subscription/[externalId]/route.ts` — Success page fetches subscription by payment id.

**Lib**

- `src/lib/payment/moyasar.service.ts` — Moyasar API (createCheckout, verifyPayment, verifyWebhookSignature, getPlans).
- `src/lib/moyasar.ts` — Webhook signature verification helper.
- `src/lib/gating.ts` — getUserTierInfo, checkTestLimit, checkPriceAlertLimit, getResultsLimit, getBlurredCount, logConversionEvent, getUpgradeMessage, etc.
- `src/lib/email/email.service.ts` — sendPaymentSuccessEmail, sendPaymentFailedEmail, sendCheckoutRecoveryEmail, sendSubscriptionRenewalReminder (none invoked from existing routes).
- `src/lib/auth.ts` — authOptions, NextAuth config (no subscription in JWT/session).
- `src/lib/prisma.ts` — Prisma client.

**Config / env**

- `src/middleware.ts` — next-intl only; excludes api.
- `src/i18n/routing.ts` — Locales ar/en, defaultLocale ar.
- `docs/core/ENV_SETUP.md` — Documents NEXTAUTH_*, GOOGLE_*, FRAGELLA_API_KEY; does **not** document MOYASAR or payment env vars.

**Prisma**

- `prisma/schema.prisma` — User, Subscription, CheckoutSession, ConversionEvent, SubscriptionTier, SubscriptionStatus, PaymentProvider (MOYASAR), etc.
- Migrations under `prisma/migrations/` (including `20260124022200_add_recovery_tracking` for checkout recovery).

**Env vars (from code only; do not put secrets in report)**

- **Moyasar:** `MOYASAR_API_KEY` (moyasar.service.ts constructor), `NEXT_PUBLIC_APP_URL` (checkout URLs), `MOYASAR_WEBHOOK_SECRET` or `MOYASAR_WEBHOOK_SECRETS` (webhook verification).
- **Auth:** `NEXTAUTH_SECRET` or `AUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (see auth.ts, ENV_SETUP.md).
- **DB:** `DATABASE_URL` (Prisma; not in ENV_SETUP.md for this project; schema uses SQLite `file:./dev.db`).

---

## I) Gaps / Cannot verify

1. **Create-checkout API**  
   - **Missing:** `src/app/api/payment/create-checkout/route.ts`.  
   - **Needed to verify:** Session validation, call to `getMoyasarService().createCheckout()`, optional `CheckoutSession` creation (initiated/abandoned), response `{ checkoutUrl }`.

2. **Moyasar callback webhook**  
   - **Missing:** `src/app/api/webhooks/moyasar/callback/route.ts`.  
   - **Needed to verify:** Signature verification, event handling (e.g. payment paid), creation/update of `Subscription` and `User.subscriptionTier`, idempotency by payment id, optional `sendPaymentSuccessEmail` and CheckoutSession status update.

3. **Subscription-by-id API**  
   - **Missing:** `src/app/api/user/subscription/[externalId]/route.ts`.  
   - **Needed to verify:** How subscription is fetched (by `externalId` or `moyasarPaymentId`), response shape expected by success page (`status`, `plan`, `amount`, `currency`, `currentPeriodEnd`).

4. **Checkout recovery API**  
   - **Missing:** `src/app/api/checkout-session/[id]/route.ts` (GET + PATCH).  
   - **Needed to verify:** Pre-fill and "recovered" status update used by pricing page recovery flow.

5. **Recurring webhook**  
   - **Missing:** `src/app/api/webhooks/moyasar/recurring/route.ts`.  
   - **Needed to verify:** How recurring charges are recorded and how subscription period is extended.

6. **Match API tier**  
   - **Current:** Tier is hardcoded `'GUEST'` in `src/app/api/match/route.ts` (line 88).  
   - **Gap:** No use of `getServerSession` or `getUserTierInfo`; results are not gated by real subscription.

7. **Profile/dashboard subscription display**  
   - **Gap:** Profile does not show tier/plan; dashboard shows a fixed "عضو بريميوم" for everyone. No code path that loads subscription status for the current user and displays it or updates session.

8. **Where payment success email is sent**  
   - **Gap:** `sendPaymentSuccessEmail` is defined in `email.service.ts` but not called from any existing file; assumed to be called from the missing webhook handler.

---

## Summary

- **Entry and flow (A–B):** Clear: CTAs and links go to `/pricing`; logged-in subscribe triggers POST to create-checkout and redirect to Moyasar; return/cancel URLs point to `/pricing/success` and `/pricing`.
- **Provider (D):** Moyasar; create checkout, return/cancel/callback URLs and verification helper are defined in lib; no Stripe.
- **Backend (C), webhooks (E), and subscription persistence (F):** **Cannot be verified** because the API routes that create checkout, handle Moyasar callback/recurring, and return subscription by id are **absent** from the codebase. Schema and gating lib are in place; DB writes and webhook logic are not visible.
- **Profile entitlements (G):** **Not wired:** match API uses a hardcoded tier; profile and dashboard do not show or use real subscription status.

**Single critical question for you:**  
Do you have the implementations of `src/app/api/payment/create-checkout/route.ts`, `src/app/api/webhooks/moyasar/callback/route.ts`, and `src/app/api/user/subscription/[externalId]/route.ts` in another branch or repo? If yes, sharing or pointing to those files would allow verifying the full subscription journey end-to-end (creation → payment → webhook → DB → success page and entitlements).
