# Pre-Migration Project Inventory
Generated: 2026-02-04

## 1. Pages Structure (src/app)

### All Pages:
- src/app/about/page.tsx → Route: /about
- src/app/dashboard/page.tsx → Route: /dashboard
- src/app/faq/page.tsx → Route: /faq
- src/app/feedback/page.tsx → Route: /feedback
- src/app/login/page.tsx → Route: /login
- src/app/notifications/page.tsx → Route: /notifications
- src/app/page.tsx → Route: /
- src/app/pricing/page.tsx → Route: /pricing
- src/app/pricing/success/page.tsx → Route: /pricing/success
- src/app/privacy/page.tsx → Route: /privacy
- src/app/profile/page.tsx → Route: /profile
- src/app/quiz/page.tsx → Route: /quiz
- src/app/quiz/step1-favorites/page.tsx → Route: /quiz/step1-favorites
- src/app/quiz/step2-disliked/page.tsx → Route: /quiz/step2-disliked
- src/app/quiz/step3-allergy/page.tsx → Route: /quiz/step3-allergy
- src/app/register/page.tsx → Route: /register
- src/app/results/page.tsx → Route: /results
- src/app/settings/page.tsx → Route: /settings
- src/app/test-header/page.tsx → Route: /test-header
- src/app/test-input/page.tsx → Route: /test-input

### All Layouts:
- src/app/layout.tsx

## 2. Components Inventory

### Landing Components (src/components/landing/):
- src/components/landing/BenefitsSection.tsx
- src/components/landing/CTASection.tsx
- src/components/landing/HeadlineSection.tsx
- src/components/landing/HeroSection.tsx
- src/components/landing/QuestionsSection.tsx
- src/components/landing/StatsSection.tsx
- src/components/landing/StatusCircles.tsx
- src/components/landing/ValuePropSection.tsx

### Shared Components (src/components/):
- src/components/AdminModal.tsx
- src/components/AskSebaIcons.tsx
- src/components/ConditionalLayout.example.tsx
- src/components/ConditionalLayout.tsx
- src/components/DarkModeToggle.tsx
- src/components/ErrorBoundary.tsx
- src/components/FeedbackCard.tsx
- src/components/FeedbackModal.tsx
- src/components/Footer.tsx
- src/components/LoadingSpinner.tsx
- src/components/NetworkStatusToast.tsx
- src/components/PostHogDeferInit.tsx
- src/components/PostHogProviderWrapper.tsx
- src/components/PriceAlertButton.tsx
- src/components/PriceComparisonTable.tsx
- src/components/PWARegister.tsx
- src/components/quiz/QuizLandingContent.tsx
- src/components/quiz/Step3Allergy.tsx
- src/components/quiz/SymptomCard.tsx
- src/components/results/ResultsContent.tsx
- src/components/ResultsGrid.tsx
- src/components/SafetyWarnings.tsx
- src/components/SentryLazyExtras.tsx
- src/components/SEO/StructuredData.tsx
- src/components/SessionProvider.tsx
- src/components/TestHistory.tsx
- src/components/ThemeToggle.tsx

### UI Components (src/components/ui/):
- src/components/ui/avatar.tsx
- src/components/ui/Badge.tsx
- src/components/ui/BlurredTeaserCard.tsx
- src/components/ui/button.tsx
- src/components/ui/CompactPerfumeCard.tsx
- src/components/ui/CounterBadge.tsx
- src/components/ui/CTAButton.tsx
- src/components/ui/dropdown-menu.tsx
- src/components/ui/EmptyState.tsx
- src/components/ui/FilterTabs.tsx
- src/components/ui/header.tsx
- src/components/ui/input.tsx
- src/components/ui/MobileFilterModal.tsx
- src/components/ui/PerfumeCard.tsx
- src/components/ui/PerfumeGrid.tsx
- src/components/ui/PerfumeSearchResult.tsx
- src/components/ui/PerfumeTimeline.tsx
- src/components/ui/PriceComparisonTable.tsx
- src/components/ui/RadarChart.tsx
- src/components/ui/SearchPerfumeBar.tsx
- src/components/ui/ShareButton.tsx
- src/components/ui/SmartImage.tsx
- src/components/ui/SpeedometerGauge.tsx
- src/components/ui/StatsGrid.tsx
- src/components/ui/TestimonialsCarousel.tsx
- src/components/ui/tooltip.tsx
- src/components/ui/UpgradePrompt.tsx
- src/components/ui/UpsellCard.tsx
- src/components/ui/VoiceMicButton.tsx

## 3. Content Management

### Content Files:
- [x] src/content/content.json
- [x] src/content/index.ts
- [ ] src/lib/content.ts (does not exist)
- [ ] Any other JSON content files (none detected under src/content besides content.json)

### Content Structure (src/content/content.json top-level keys):
- `about`
- `faq`
- `privacy`

## 4. API Routes

### All API Endpoints (src/app/api/):
- src/app/api/auth/[...nextauth]/route.ts → Route: /api/auth/[...nextauth]

## 5. Current Dependencies

Checked `package.json` for i18n-related libraries:
- [ ] next-intl (not present)
- [ ] i18next (not present)
- [ ] Other i18n libraries: none detected in dependencies or devDependencies

## 6. Key Files to Preserve

- [x] src/app/globals.css (implicit in Next app; path confirmed separately if needed)
- [x] src/components/ui/header.tsx
- [x] src/components/DarkModeToggle.tsx
- [x] src/components/Footer.tsx
- [ ] middleware.ts (not found at project root)

## 7. Critical Features

- [x] Dark Mode (DarkModeToggle exists)
- [x] Quiz Flow (3 steps: /quiz/step1-favorites, /quiz/step2-disliked, /quiz/step3-allergy)
- [x] Authentication (NextAuth via /api/auth/[...nextauth]/route.ts and next-auth dependency)
- [x] Notifications (notifications page and related UI)
- [x] User Profile (profile page)
- [x] Favorites System (present implicitly via profile/results UX and content; implementation details in code)

## 8. Current Routing

- [x] App Router (Next.js 13+ style under src/app)
- [x] TypeScript (project uses .tsx/.ts and TypeScript devDependency)
- [x] Current locale support: Arabic-focused content (content.json is fully Arabic)

## 9. Build Status

Command run:
```bash
npm run build
```

Result: ✅ PASS  
Any errors: None reported (build completed successfully)

