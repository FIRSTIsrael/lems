# Task 10 Report: Migrate ranking call sites + round padding + labels

Added `padRankingScores`/`formatHeadlineScore` to `robot-game-ranking.ts`, and
`RobotGameMatchesSelector.getRankingRoundCount()` (`MAX(round)` for `stage='RANKING'`,
0 if none) to `@lems/database`.

Migrated all call sites from `compareScoreArrays`/raw `maxScore` to edition-aware
`compareRobotGameScores`/`getRobotGameHeadlineScore` with `getRankingStrategy(getEdition(...))`:
backend `ranking-calculator.ts`, shared `rank-calculation.ts` (new `rankingStrategy`
param, default `'max'`), frontend final-deliberation (`computeRank` + context, padded via
scoresheet rounds), audience-display `use-team-scores.ts` (round-indexed, `undefined`
preserved for "—" display), reports/scoreboard query+table+mobile, and portal
scoreboard/team-performance components. Kept the `maxScore`/`highestScore` field names
for API back-compat; they now hold the strategy's headline value.

Added `robot-game.headline-score.max`/`.average` to frontend and portal locales
(en/he/pl), wired into audience-display, reports, and portal scoreboard/team-page
labels via `useEdition()`. Display values use `formatHeadlineScore` (round to 2
decimals); all comparisons use the unrounded padded arrays.

Verified: `shared` tests (32/32 pass, incl. 16 ranking specs), lint clean for
backend/frontend/portal/database, and production builds pass for backend/frontend/portal.

Commit: `154ded6f` — "feat: average robot game ranking for Future Edition"

## Follow-up: Critical + Important review fixes

**Critical (backend deliberations):** `calculateAllTeamScores` now pads each team's
`robotGameScores` with `padRankingScores` using
`db.robotGameMatches.byDivision(divisionId).getRankingRoundCount()` instead of a raw
`.map()` over submitted scoresheets. `rankTeams` now resolves the division's edition
via `getDivisionEdition` and passes `getRankingStrategy(edition)` into
`calculateTeamRanks`, so deliberation robot-game ranks respect average-strategy editions.

**Important (frontend round count):** Added `Field.rankingRoundCount: Int!` to the
GraphQL schema (`field.graphql`), backed by a new `rankingRoundCountResolver` (reuses
`getRankingRoundCount()`), registered in the resolver map. `reports/scoreboard`
(`query.ts`) and audience-display `use-team-scores.ts`/`scores-table.tsx` now consume
this field instead of inferring the round count as `Math.max` of submitted/relevant
scoresheet rounds, so missing/no-show rounds still pad correctly.

**formatHeadlineScore:** Changed signature to `(score, strategy) => string` � returns
`toFixed(2)` for `'average'`, raw integer string for `'max'`. Updated all 8 call sites
(reports scoreboard table/mobile, audience-display scores-table-row, portal
desktop/mobile scoreboard, portal performance) to pass `rankingStrategy`.

Verified: lint clean (0 errors) for `shared`, `backend`, `frontend`, `portal`; production
builds pass for `backend`, `frontend`, `portal`.
