# P6 Results Snapshot - فهرس الملفات

هذا الملف يربط نسخ الأرشيف بالمسارات الأصلية في المشروع.

| ComponentName | OriginalPath | SnapshotFile | Notes |
|---------------|--------------|--------------|-------|
| PerfumeCard | `src/components/ui/PerfumeCard.tsx` | `01-PerfumeCard-src_components_ui_PerfumeCard.tsx` | بطاقة العطر في صفحة النتائج؛ تحتوي أزرار المكونات والتوافق والأسعار |
| IngredientsSheet | `src/components/results/IngredientsSheet.tsx` | `02-IngredientsSheet-src_components_results_IngredientsSheet.tsx` | حاوية المكونات (Bottom Sheet) تُفتح عند الضغط على زر المكونات |
| MatchSheet | `src/components/results/MatchSheet.tsx` | `03-MatchSheet-src_components_results_MatchSheet.tsx` | حاوية التوافق/التطابق؛ تعرض RadarGauge وتفصيل الذوق والأمان |
| CompareBottomSheet | `src/components/results/CompareBottomSheet.tsx` | `04-CompareBottomSheet-src_components_results_CompareBottomSheet.tsx` | حاوية PriceHub ومقارنة العطور؛ تدعم وضعي compare و price-hub |
| ResultsContent | `src/components/results/ResultsContent.tsx` | `05-ResultsContent-src_components_results_ResultsContent.tsx` | المكوّن الرئيسي لتجميع النتائج؛ يستدعي ResultsGrid ويدير الحاويات الثلاث |
| ResultsGrid | `src/components/results/ResultsGrid.tsx` | `06-ResultsGrid-src_components_results_ResultsGrid.tsx` | شبكة عرض بطاقات العطور؛ يستخدم PerfumeCard ويربط أزرار المكونات/التوافق/الأسعار |
| ResultsGrid (alt) | `src/components/ResultsGrid.tsx` | `07-ResultsGrid-src_components_ResultsGrid.tsx` | نسخة بديلة كصفحة نتائج كاملة مع PerfumeCard و CompareBottomSheet و IngredientsSheet و MatchSheet |
| i18n (ar) | `messages/ar.json` | `08-messages-ar.json` | ملف الترجمات العربي؛ يحتوي نتائج results.card و results.ingredients و results.match و results.compare (priceHub) |
| i18n (en) | `messages/en.json` | `09-messages-en.json` | ملف الترجمات الإنجليزي؛ نفس المفاتيح المذكورة أعلاه |

## ملاحظات إضافية

- **results.card**: يحتوي على `ingredientsBtn`, `matchBtn`, `pricesBtn`, `topMatch` وغيرها.
- **results.ingredients**: يحتوي على `pyramid`, `ingredientsTitle`, `familiesTitle`, `safetyTitle` وغيرها.
- **results.match**: يحتوي على `tasteLabel`, `safetyLabel`, `overallLabel`, `statusDesc` وغيرها.
- **results.compare**: يحتوي على `priceHubTitle`, `priceHubSearchTitle`, `subscribeToPrices` وغيرها (حاوية PriceHub).

## تاريخ الأرشيف

تم إنشاء هذا الأرشيف في: 2025-02-15
