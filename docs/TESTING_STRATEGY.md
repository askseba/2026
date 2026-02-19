# Testing Strategy – Ask Seba

**Date:** January 29, 2026  
**Current State:** No tests (except 1 E2E spec + manual env script)  
**Target:** P0 coverage within 3 weeks

---

## 1. Current Landscape

### 1.1 Existing Setup

| Item | Status | Location / Notes |
|------|--------|------------------|
| **jest.config.*** | ❌ None | No Jest config in project root |
| **vitest.config.*** | ❌ None | No Vitest config in project root |
| **playwright.config.*** | ❌ None | Playwright in `package.json` scripts; no config file (defaults used) |
| **__tests__/** | ❌ None | No `__tests__` folders in `src/` |
| **\*.test.ts / \*.spec.tsx** | ❌ None (app code) | No unit/integration test files in `src/` |
| **cypress/** | ❌ None | Not used |
| **msw/ or mocks/** | ❌ None | No Mock Service Worker or shared mocks in `src/` |
| **.github/workflows/** | ❌ None | No CI/CD pipeline for tests |

### 1.2 Existing Tests (Project-Owned Only)

| Type | Status | Files/Config | Coverage | Notes |
|------|--------|--------------|----------|-------|
| **Unit Tests** | ❌ None | N/A | 0% | No unit tests in app code |
| **Integration (API)** | ❌ None | N/A | 0 routes | No API route tests; **no `src/app/api/` folder** in this repo (endpoints referenced in code but routes not present) |
| **E2E** | ⚠️ Partial | `tests/faq.spec.ts` | 1 flow | Single Playwright spec: FAQ accordion (expand/collapse, single-expand behavior) |
| **CI/CD** | ❌ None | No `.github/workflows/` | — | Tests not run on push/PR |

### 1.3 Other Test-Related Artifacts

- **test-auth.ts** (root): Manual env check script (`npx tsx test-auth.ts` / `npm run test:auth`). Validates `NEXTAUTH_*` and Google OAuth env vars. **Not an automated test** – no assertions, no runner.
- **package.json scripts:** `test:e2e` → `playwright test`; `test:e2e:ui`, `test:e2e:debug`. Playwright is the only test tool installed (`@playwright/test` in devDependencies).

### 1.4 Summary Table

| Type | Status | Files/Config | Coverage | Notes |
|------|--------|--------------|----------|-------|
| Unit Tests | ❌ None | N/A | 0% | No runner (Jest/Vitest) or test files |
| Integration (API) | ❌ None | N/A | 0 routes | API routes referenced in code but **no `src/app/api/`** in repo – implement or verify external API |
| E2E | ⚠️ Partial | `tests/faq.spec.ts` | 1 flow (FAQ) | Playwright; no config file |
| CI/CD | ❌ None | — | — | No GitHub Actions or other CI for tests |

---

## 2. Critical Paths Map

### Path A: Quiz Flow (Core Business Logic)

**Flow:** Start → Load Quiz → Step1 (Favorites) → Step2 (Disliked) → Step3 (Allergy) → Submit → View Results

- **Risk Level:** 🔴 Critical (core product value)
- **What to Test:**
  - **Logic:** `src/lib/matching.ts` – Jaccard similarity, taste/safety scores, final weighted score, exclusions (disliked, allergy families/ingredients). Pure functions: `jaccardSimilarity`, `calculateTasteScore`, `calculateSafetyScore`, `calculateFinalMatchScore`, `buildUserScentDNA`, `calculateMatchScores`.
  - **UI/State:** `QuizContext` – step data, `isComplete` (≥3 liked, allergy filled), sessionStorage persistence; step guards and navigation.
  - **Edge Cases:** Empty preferences, all disliked, allergy matching; browser close/reopen (sessionStorage).
- **Test Type Priority:** Unit (matching logic) → Integration (if `/api/match` exists) → E2E (full quiz journey).
- **Data Dependencies:** Unit: none (pure logic). Integration: DB or strong mocks for perfumes + user prefs. E2E: seeded data or mock API.
- **Flakiness Risk:** Low for unit; medium for E2E (timing, RTL/session).

---

### Path B: Auth Flow (Security Critical)

**Flow:** Register → (Verify Email if applicable) → Login → Access Dashboard → Logout

- **Risk Level:** 🔴 Critical (user data, access control)
- **What to Test:**
  - **API:** JWT/session handling (`auth.ts` – NextAuth with Credentials + Google), registration (`/api/auth/register` referenced in `register/page.tsx` – route not in repo).
  - **UI:** Redirects (unauthenticated → `/login?callbackUrl=...`), protected routes (`middleware.ts`: `/dashboard/*`).
  - **Security:** No dashboard access without session; logout clears session.
- **Test Type Priority:** Unit (auth helpers if any) → Integration (auth APIs when implemented) → E2E (login → dashboard, logout).
- **Data Dependencies:** Test DB or mocked Prisma for user/password; no real OAuth in tests.
- **Flakiness Risk:** Low for unit; medium for E2E (redirects, session cookies).

---

### Path C: Dashboard / Data Display

**Flow:** Login → View Dashboard → Load Charts/Stats → Filter Data

- **Risk Level:** 🟡 High (UX, data correctness)
- **What to Test:**
  - Data fetching: Loading → Success → Error states.
  - Charts/tables: No crash with empty or malformed data.
  - Responsiveness: Mobile view (optional P2).
- **Test Type Priority:** Integration (data APIs) + E2E (smoke: load dashboard).
- **Data Dependencies:** Mocked or test DB for dashboard aggregates.
- **Flakiness Risk:** Medium (async, layout).

---

### Path D: Perfumes Catalog & Search

**Flow:** Browse List / Search → Filter/Sort → Click Details → View Image/Info

- **Risk Level:** 🟡 Medium–High (SEO, conversion)
- **What to Test:**
  - Search: `/api/perfumes/search` (referenced in step1/step2 and `SearchPerfumeBar`); middleware allows `/api/perfumes` without auth.
  - Image loading: Failures handled (e.g. `SmartImage`, error states).
  - 404 for non-existent perfume IDs if detail route exists.
- **Test Type Priority:** Integration (search API when present) → E2E (search → result list).
- **Data Dependencies:** Mock Fragella/perfume data or test DB.
- **Flakiness Risk:** Low–medium (network mocks).

---

### Path E: Results (Match API)

**Flow:** Quiz complete → POST `/api/match` with preferences → Display scored perfumes + tier (GUEST/FREE/PREMIUM)

- **Risk Level:** 🔴 Critical (core output of quiz)
- **What to Test:**
  - **Logic:** Same as Path A – matching algorithm (covered by unit tests on `matching.ts`).
  - **API:** POST `/api/match` request/response contract, tier and blur rules when API exists.
- **Test Type Priority:** Unit (matching) first; Integration (route) when `src/app/api/match/` is added.
- **Data Dependencies:** Perfumes DB + user preferences; strong mocks acceptable.
- **Flakiness Risk:** Low for unit; medium for integration if DB-dependent.

---

### Path F: Admin / CRUD (If Present)

**Flow:** Admin → Add/Edit/Delete Suggestion (e.g. AdminModal) → Approve/Reject → Verify in List

- **Risk Level:** 🟠 High (data integrity)
- **What to Test:** API contracts for `/api/admin/suggestions`, approve/reject; role-based access.
- **Test Type Priority:** Integration (API) → E2E (admin flow) if critical.
- **Data Dependencies:** Test DB or mocks.
- **Flakiness Risk:** Low–medium.

---

## 3. Testing Pyramid Plan

### Unit Tests (Base – ~70% of effort)

- **P0:** Quiz scoring algorithm (`src/lib/matching.ts`), auth-related utilities (e.g. token/session helpers if any in `lib/auth.ts` or utils).
- **Tools:** Vitest (recommended – fast, ESM, Vite-style; project uses Next 16, not Vite, but Vitest works well with Next) **or** Jest (stable, large ecosystem).
- **Target:** High coverage in business logic (`lib/matching.ts`, `lib/utils`, hooks used by quiz/results). Aim **≥80%** in `utils/`, `lib/` (non-UI), and matching.

### Integration Tests (Middle – ~20% of effort)

- **P0:** When implemented: POST `/api/match`, POST `/api/auth/register`, session/auth routes; middleware behavior for `/dashboard`.
- **P1:** GET `/api/perfumes/search`, user favorites, feedback suggestions, payment webhooks (mocked).
- **Tools:** Same runner (Vitest/Jest) + MSW for fetch, or in-process route handlers + test DB (e.g. SQLite in-memory or Docker Postgres).
- **Target:** All write operations and critical read routes covered; 100% of `app/api/*` routes when they exist.

### E2E Tests (Top – ~10% of effort)

- **P0:** Complete quiz journey (steps 1–3 → results); Login → Dashboard.
- **P1:** Browse/search perfumes → details; Register → Login.
- **P2:** Mobile responsiveness; FAQ (already one spec).
- **Tools:** Playwright (already in use; better fit for Next.js 13+ and parallel execution than Cypress).
- **Target:** 3–5 critical flows only; stable, <5 min in CI.

---

## 4. Coverage Gap & Risk Matrices

### A. Unit Testing Priorities (Logic & Components)

| Priority | Target | Reason | Effort |
|----------|--------|--------|--------|
| P0 | Quiz scoring (`lib/matching.ts`) | Core business logic; pure functions | Low |
| P0 | Auth utilities (e.g. token/session handling if extracted) | Security | Low |
| P1 | Data-fetching hooks (`useFavorites`, etc.) | Stability | Medium |
| P1 | Form/validation logic (register, quiz steps) | UX | Low |
| P1 | `safeFetch` / API helpers (`lib/utils/api-helpers.ts`) | Reliability | Low |
| P2 | Button/Card and pure UI components | Visual/regression | High (low ROI) |

### B. Integration Testing Priorities (API & DB)

| Priority | Route/Endpoint | What to Test | Strategy |
|----------|----------------|--------------|----------|
| P0 | POST `/api/match` | Result calculation, tier, payload contract | Real DB or strong mocks (when route exists) |
| P0 | POST `/api/auth/register`, auth callbacks | Session handling, validation | Test DB or mocked Prisma |
| P1 | GET `/api/perfumes/search` | Pagination, filters, query | Mock data or Fragella stub |
| P1 | Dashboard data aggregation | Correctness, performance | Real or test DB |
| P1 | `/api/user/favorites`, `/api/feedback/suggestions` | CRUD, auth | Test DB + MSW for client |
| P2 | Webhooks (Moyasar), cron (recovery) | Idempotency, error handling | Mock external calls |

### C. E2E Testing Priorities (User Flows)

| Priority | Flow | Tool | Complexity |
|----------|------|------|------------|
| P0 | Complete Quiz Journey (Step1 → Step2 → Step3 → Results) | Playwright | Medium |
| P0 | Login → Dashboard (protected route) | Playwright | Low |
| P1 | Browse Perfumes / Search → Details | Playwright | Low |
| P1 | Register → Login | Playwright | Low |
| P2 | FAQ (expand/collapse – already covered) | Playwright | Low |
| P2 | Mobile responsiveness | Playwright | Medium |

---

## 5. Implementation Roadmap

### Phase 1 (Week 1): Setup & P0 Unit

- [ ] Install and configure test runner: **Vitest** (or Jest) + jsdom for components.
- [ ] Add **React Testing Library** for component tests.
- [ ] Optional: Setup test DB (e.g. SQLite in-memory or Docker) if integration tests planned in Phase 2.
- [ ] Write unit tests for:
  - `src/lib/matching.ts`: `jaccardSimilarity`, `calculateTasteScore`, `calculateSafetyScore`, `calculateFinalMatchScore`, `buildUserScentDNA`, `calculateMatchScores` (including edge cases: empty, disliked, allergy exclusions).
  - Any auth helpers in `lib/auth.ts` or token handling (if present).
- **Acceptance:** `pnpm test` (or `npm test`) runs and passes; coverage in `lib/matching.ts` and core utils **>80%**; CI (when added) passes.

### Phase 2 (Week 2): Integration

- [ ] Add **MSW** for mocking fetch in tests.
- [ ] If **API routes are added** to repo: create `src/app/api/` and implement at least `match`, `auth/register`; then add integration tests for:
  - POST `/api/match` (payload → response shape, tier).
  - POST `/api/auth/register` (validation, duplicate email).
  - Middleware: unauthenticated request to `/dashboard` → redirect to `/login`.
- [ ] If API remains external: document contract and add contract tests or mock-based integration tests for client `safeFetch` usage.
- **Acceptance:** All P0 POST endpoints (when present) covered; integration suite runs in CI.

### Phase 3 (Week 3): E2E

- [ ] Add **playwright.config.ts** (base URL, timeouts, project for chromium/firefox/webkit if desired).
- [ ] Implement E2E specs:
  - Quiz: land on quiz → complete step1 (select ≥3) → step2 → step3 (allergy) → submit → results page loads.
  - Auth: login with test user → dashboard visible; logout → redirect.
- [ ] Optional: Register → Login; Search perfumes → list.
- [ ] Add **.github/workflows/ci.yml** (or equivalent): run unit + integration on PR; run E2E on main or nightly.
- **Acceptance:** E2E runs in CI in **<5 minutes**; no flaky failures over 10 consecutive runs (or define flakiness policy).

---

## 6. Tooling Decisions

| Category | Selected Tool | Rationale |
|----------|---------------|-----------|
| **Unit Runner** | **Vitest** | Fast, ESM-native, good DX; works with Next.js. Alternative: Jest if team prefers ecosystem maturity. |
| **Component Testing** | **React Testing Library (RTL)** | User-centric queries; avoid implementation details. |
| **E2E** | **Playwright** | Already in project; better Next.js 13+ support and parallel execution than Cypress. |
| **Mocking (API)** | **MSW** | Intercepts fetch at network level; reusable in unit and integration tests. |
| **DB Test** | **SQLite in-memory** or **Docker Postgres** | SQLite for speed in CI; Postgres for parity with production if needed. |
| **Next.js Router** | **next-router-mock** or **MemoryRouter** | For components that depend on `useRouter`/`usePathname`. |
| **Coverage** | Vitest built-in (v8) or **c8/istanbul** | Target: **≥70%** in `utils/`, `hooks/`, `lib/` (business logic); **≥80%** in `lib/matching.ts`. |
| **CI** | **GitHub Actions** (recommended) | Run unit + integration on every PR; E2E on push to main or scheduled. Optional: upload coverage to Codecov. |

---

## 7. Definition of Done

- [ ] All **P0 paths** (Quiz logic, Auth behavior, Match API when present) have automated tests.
- [ ] **CI** runs unit (and integration when applicable) on every PR; E2E on main or nightly.
- [ ] **No flaky tests:** E2E suite stable for 10 consecutive runs (or agreed threshold).
- [ ] **Coverage:** ≥80% in `lib/matching.ts` and core business logic; ≥70% in `utils/`, `hooks/`, `lib/` (excluding pure UI).
- [ ] Optional: Coverage badge in README; optional Codecov (or similar) integration.

---

## 8. Notes & Caveats

- **API routes:** Client code references `/api/match`, `/api/auth/register`, `/api/perfumes/search`, `/api/user/favorites`, `/api/admin/suggestions`, etc. There is **no `src/app/api/`** directory in this repository. Integration and E2E plans assume these are either (a) added in this repo, or (b) provided by another service (then contract or mock-based tests apply). Adjust Phase 2 accordingly.
- **test-auth.ts:** Keep as a **manual** env check; it is not a substitute for automated auth tests.
- **FAQ E2E:** Existing `tests/faq.spec.ts` is a good P2 example; keep and extend E2E from there.
