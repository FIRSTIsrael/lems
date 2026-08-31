# Task 03 — Robot Game: Score Display (Average vs. Max)

## Goal
Future Edition ranks/displays teams by **average** score across submitted matches instead of
**max** score. Founders Edition behavior (max score) must be unchanged.

Depends on: Task 02 (scoresheet schema selection pattern) — can be built in parallel once Task 01's
`futureEdition` flag/helper lands, since this task doesn't need the new schema itself, just the
flag.

## Current state
- Ranking calculation: `calculateRobotGameRankings()` in
  [apps/backend/src/routers/portal/utils/ranking-calculator.ts](../../../apps/backend/src/routers/portal/utils/ranking-calculator.ts#L23-L93)
  computes `maxScore` per team and uses `compareScoreArrays` for tiebreaking.
- Tiebreak comparator: `compareScoreArrays(scoresA, scoresB, reverse)` in
  [libs/shared/src/lib/utils/arrays.ts](../../../libs/shared/src/lib/utils/arrays.ts#L29-L48) —
  sorts both arrays descending and compares term by term.
- Frontend scoreboard `maxScore`:
  - [apps/frontend/.../reports/scoreboard/graphql/query.ts](../../../apps/frontend/src/app/%5Blocale%5D/lems/(volunteer)/(dashboard)/reports/scoreboard/graphql/query.ts#L61)
    computes `Math.max(...validScores)`.
  - [apps/frontend/.../audience-display/components/scoreboard/hooks/use-team-scores.ts](../../../apps/frontend/src/app/%5Blocale%5D/lems/(volunteer)/audience-display/components/scoreboard/hooks/use-team-scores.ts#L13-L63)
    tracks `maxScore` per team.
  - Display components:
    [scoreboard-table.tsx](../../../apps/frontend/src/app/%5Blocale%5D/lems/(volunteer)/(dashboard)/reports/scoreboard/components/scoreboard-table.tsx#L36-L40),
    [mobile-scoreboard.tsx](../../../apps/frontend/src/app/%5Blocale%5D/lems/(volunteer)/(dashboard)/reports/scoreboard/components/mobile-scoreboard.tsx#L141-L180).
  - Portal has its own scoreboard tab under
    [apps/portal/src/app/[locale]/event/[slug]/components/tabs/scoreboard/](../../../apps/portal/src/app/%5Blocale%5D/event/%5Bslug%5D/components/tabs/scoreboard/).
- Localization: score column label is presumably "Max Score" somewhere in
  `apps/frontend/locale/en.json` / `apps/portal/locale/en.json` — grep for the exact key before
  editing (e.g. `"maxScore"` or a display string like "Max Score").

## Steps

### 1. Shared scoring aggregation utility
- Add `getDisplayScore(scores: number[], isFutureEdition: boolean): number` (or similar) to
  `libs/shared/src/lib/utils/arrays.ts` (or a new `scoresheet`-adjacent utils file) that returns
  `average(scores)` for Future Edition and `max(scores)` for Founders. Round average sensibly
  (confirm desired precision — likely round to nearest integer or 1 decimal; check with product
  owner / FLL scoring convention) — do not invent precision silently, flag it as a TODO/decision
  point in the PR description if unresolved.
- Update `compareScoreArrays` usage/call sites so the tiebreak logic still operates on some
  meaningful ordering for Future Edition. Confirm whether raw score-array tiebreaking (as used for
  Founders ranking) still makes sense for an averages-based ranking, or whether ties should be
  broken by something else (e.g. highest single match) — this needs a product decision; document
  the chosen approach in code comments once decided.

### 2. Backend ranking calculator
- Update `calculateRobotGameRankings()` in `ranking-calculator.ts` to accept/derive
  `division.future_edition` and use the new aggregation utility instead of unconditionally taking
  `Math.max`.

### 3. Frontend/portal display
- Update `query.ts` max-score computation and the two scoreboard components (frontend) plus the
  portal scoreboard tab to use the shared aggregation utility, branching on the division's
  `futureEdition` flag (already available via GraphQL `Division.futureEdition`).
- Rename UI labels dynamically: "Max Score" for Founders, "Average Score" for Future Edition.
  Add both keys to localization files (`en.json`, `he.json`, `pl.json`) in
  `apps/frontend/locale/`, `apps/admin/locale/` (if it also shows scores), and
  `apps/portal/locale/`, and select the correct key at render time based on `futureEdition`.

## Suggested acceptance checks
- Founders division scoreboard/ranking unchanged (still shows/ranks by max score).
- Future Edition division scoreboard shows "Average Score" label and average value; ranking order
  reflects averages.
- Portal scoreboard tab matches frontend behavior for both edition types.
