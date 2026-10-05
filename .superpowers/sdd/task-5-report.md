# Task 5 Report: Future scoresheet logic (`future.ts`)

## Status: Complete

## Commit

`f1aad41b` — `feat: Future Edition robot game scoresheet`

## Summary

- Added `libs/shared/src/lib/scoresheet/future.ts` exporting `futureScoresheet` with missions `m01`–`m05`, `luc`, `pt` (no `eib`), per decisions: canopy chamber enum `'0'|'1'` (10 each), cave waterfall enum 0-10 (5 each), invasives enum 0-5 (20 each), microbiome bonus requiring young-forest ≥3 or `ScoresheetError`.
- `pt` calc: 0/-10/-30/0; `finalizeScore` returns 0 when `pt[0]==='3+'`, else `ctx.total`.
- Wired `getScoresheet('future')` → `futureScoresheet` in `scoresheet.ts` (TODO removed); founders path untouched. Exported from `index.ts`.
- TDD: wrote `future.spec.ts` first (failing, no `future.ts`), then implemented until green.

## Verification

- `npx nx test shared` → 2 files, 8 tests passed (incl. 2 penalties keep sum, 3+ → total 0, `getScoresheet` founders/future).
- `npx nx lint shared` → 0 errors (pre-existing unrelated warnings only).
- `npx nx build frontend` → pass.

## Concerns

- `m02`/`m05`/`luc` secondary clauses (base resources, haven count, containment) weren't explicitly resolved in decisions; chosen conservatively from the reference doc — flag for review before localization (Task 6).

## Follow-up: m02 canopy chamber (review fix)

- **Issue:** Canopy clause was `enum '0'|'1'` (max 10 pts); official BioGlow sheet treats "(max 15)" as a **count** cap (same as m01 "(max 3)"), i.e. 0–15 resources × 10 pts (max 150).
- **Fix:** Clause 2 → `number min0 max15`; calculation unchanged (`Number(clause2) * 10`). Test: count 2 → 20 points.
- **Verification:** `npx nx test shared` pass.
- **Commit:** `fix(shared): Future m02 canopy count max 15`
