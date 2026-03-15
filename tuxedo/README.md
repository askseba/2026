# Tuxedo — Mirror Snapshot

## Purpose

The **tuxedo** folder is a synchronized mirror of selected files from the main project.

It exists to:
- Provide a single place to inspect canonical versions of key feature files
- Support snapshotting and diffing against the live codebase
- Preserve mirrored files either as flat copies or as path-preserved copies when needed to avoid filename collisions

Only files listed in the mapping table below are part of this mirror.

Do **not** add logic, refactors, or source-of-truth edits inside `tuxedo/`. This folder should be treated as **read-only** except when syncing from the main project.

## Mirror rules

- The **main project files** remain the source of truth.
- Changes must be made in the **original project paths**, not in `tuxedo/`.
- Files inside `tuxedo/` must match their mapped project files exactly.
- Mirror updates must not modify files outside `tuxedo/`.
- When filename collisions are possible, the mirror may preserve the original subpath inside `tuxedo/`.
- Files not listed in the mapping table are not part of this mirror.

## File mapping

| Tuxedo file | Original project path |
|-------------|------------------------|
| `PerfumeCard.tsx` | `src/components/ui/PerfumeCard.tsx` |
| `QuizContext.tsx` | `src/contexts/QuizContext.tsx` |
| `ResultsContent.tsx` | `src/components/results/ResultsContent.tsx` |
| `SafetyWarnings.tsx` | `src/components/SafetyWarnings.tsx` |
| `matching.ts` | `src/lib/matching.ts` |
| `matching-types.ts` | *(tuxedo-only; no main counterpart)* |
| `perfumes.ts` | `src/lib/data/perfumes.ts` |
| `schema.prisma` | `prisma/schema.prisma` |
| `page.tsx` | `src/app/[locale]/page.tsx` |
| `route.ts` | `src/app/api/match/route.ts` |
| `unified-perfume.ts` | `src/types/unified-perfume.ts` |
| `scent-analysis.ts` | `src/lib/scent-analysis.ts` |
| `symptom.service.ts` | `src/lib/services/symptom.service.ts` |
| `perfume.service.ts` | `src/lib/services/perfume.service.ts` |
| `perfume-bridge.service.ts` | `src/lib/services/perfume-bridge.service.ts` |
| `perfume-bridge.service.test.ts` | `src/lib/services/perfume-bridge.service.test.ts` |
| `ifra.service.ts` | `src/lib/services/ifra.service.ts` |
| `src/app/[locale]/quiz/step1-favorites/page.tsx` | `src/app/[locale]/quiz/step1-favorites/page.tsx` |
| `src/app/pricing/page.tsx` | `src/app/pricing/page.tsx` |
| `Step3Allergy.tsx` | `src/components/quiz/Step3Allergy.tsx` |
| `header.tsx` | `src/components/ui/header.tsx` |
| `middleware.ts` | `src/middleware.ts` |

## Sync procedure

1. Edit the file in its **original project path**.
2. Locate the corresponding row in the mapping table.
3. Copy the full current contents from the original project file into the exact mirrored file path shown in the **Tuxedo file** column.
4. Do not change unrelated files while syncing.
5. If a new file becomes part of this feature snapshot, add it to `tuxedo/` and update this README mapping table in the same change.

## Notes

- `matching-types.ts` exists only inside `tuxedo/` and is not synced from the main project.
- Some mirrored files live at the root of `tuxedo/`, while others preserve part of the original directory structure to keep filenames exact and avoid collisions.
- If a mapped project file is deleted, the mirror entry should be reviewed explicitly rather than silently repointed.

## Scope

This mirror is intended to capture the current snapshot of the relevant feature files only.

It is not a secondary implementation, not a backup of the whole repository, and not a place for independent edits.
