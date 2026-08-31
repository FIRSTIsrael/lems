# Task 02 — Robot Game: Scoresheet

## Goal
Support a Future Edition scoresheet schema alongside the existing Founders Edition one, selected
per-division, and fix two related scoring rules (no-show GP handling, three-penalty rule).

Depends on: Task 01 (`futureEdition` flag + `selectByEdition` helper).

## Current state
- Scoresheet schema + calculation logic lives in
  [libs/shared/src/lib/scoresheet/scoresheet.ts](../../../libs/shared/src/lib/scoresheet/scoresheet.ts)
  (current season, `_version: '2026-08-04'`), typed via
  [libs/shared/src/lib/scoresheet/types.ts](../../../libs/shared/src/lib/scoresheet/types.ts).
- Past seasons are archived under
  [libs/shared/src/lib/scoresheet/past-seasons/](../../../libs/shared/src/lib/scoresheet/past-seasons/)
  and are not selected dynamically — this establishes the precedent that "multiple schemas can
  coexist in the codebase", just not yet picked at runtime per-division.
- All scoresheet mutations hardcode `import { scoresheet } from '@lems/shared/scoresheet'`, e.g.
  [apps/backend/src/lib/graphql/resolvers/mutations/scoresheets/update-mission-clause.ts](../../../apps/backend/src/lib/graphql/resolvers/mutations/scoresheets/update-mission-clause.ts).
- GP handling: `status: 'gp'`, `data.gp: { value: 2|3|4|null }` in
  [libs/database/src/schema/documents/scoresheet.ts](../../../libs/database/src/schema/documents/scoresheet.ts),
  updated via
  [apps/backend/src/lib/graphql/resolvers/mutations/scoresheets/update-gp.ts](../../../apps/backend/src/lib/graphql/resolvers/mutations/scoresheets/update-gp.ts).
- No-show currently is not modeled as its own scoresheet status distinct from GP; verify exact
  current behavior in the GP/status resolvers before changing anything (read
  `update-gp.ts` and any status-transition validation in
  `apps/backend/src/lib/graphql/resolvers/mutations/scoresheets/` fully before coding).
- Penalty missions are independent `MissionSchema` entries; each mission's `calculation` only
  returns its own point contribution — there is currently no cross-mission rule like "3 penalties
  zero the whole match".

## Steps

### 1. Future Edition scoresheet schema (config only)
- Create `libs/shared/src/lib/scoresheet/future-edition.ts` (name/structure mirrors
  `scoresheet.ts`) implementing the Future Edition missions once the official rules doc/mission
  list is available. Until the real missions are supplied, stub it with the same shape as the
  Founders schema so plumbing can be built and tested (`_version` clearly marked
  e.g. `'future-edition-<date>'`).
- Add a schema-selection helper, e.g. `getScoresheetSchema(isFutureEdition: boolean)` in
  `libs/shared/src/lib/scoresheet/index.ts` (or alongside using the `selectByEdition` helper from
  task 01), returning the Founders or Future Edition schema.
- Replace every hardcoded `import { scoresheet } ...` call site with a call to the new selector,
  passing `division.future_edition` (or `division.futureEdition` in GraphQL contexts). Search for
  all call sites with `grep -r "@lems/shared/scoresheet"` before starting — expect resolvers under
  `apps/backend/src/lib/graphql/resolvers/mutations/scoresheets/` and any scoresheet-rendering
  component under `apps/frontend/src/app/[locale]/lems/(volunteer)/.../scoresheet`.

### 2. No-show → 0 GP points (or setting-gated)
- Confirm current no-show behavior (search for `no-show`/`noShow`/`disqualified` scoresheet
  handling) and how GP score currently defaults when a team doesn't show.
- Per the plan doc, a no-show should score 0 GP points **by rule**, but the team may want this
  configurable (a setting). Reuse the existing per-division `schedule_settings`/event settings
  pattern (see
  [libs/database/src/schema/tables/divisions.ts](../../../libs/database/src/schema/tables/divisions.ts)
  `DivisionScheduleSettings`, and the event settings table from migration
  [012_create_event_settings_table.ts](../../../libs/database/src/migrations/012_create_event_settings_table.ts))
  to add a boolean setting (e.g. `zero_gp_on_no_show`) rather than hardcoding, so Founders events
  can opt in/out too if desired — confirm with product owner whether this should be Future Edition
  only or global before implementing.
- Update `calculateGPScore` in
  [apps/backend/src/lib/graphql/resolvers/mutations/deliberations/handlers/utils.ts](../../../apps/backend/src/lib/graphql/resolvers/mutations/deliberations/handlers/utils.ts)
  to apply the rule.

### 3. Three-penalty-zeroes-match rule
- Since each mission's `calculation` only affects its own score, add a post-calculation pass in
  the score-totaling code (find where mission calculations are summed into a scoresheet total —
  likely near `update-mission-clause.ts` or a shared `calculateScore`/`getScoresheetScore` utility
  in `libs/shared/src/lib/scoresheet/`) that:
  1. Counts clauses flagged as penalties (add a `penalty?: boolean` flag to `MissionClauseSchema`
     in `types.ts` so this is schema-driven, not hardcoded mission IDs).
  2. If the penalty count reaches the schema-defined threshold (make it a schema field, e.g.
     `ScoresheetSchema.maxPenaltiesBeforeZero?: number`, so Founders/Future editions can each set
     their own threshold or opt out), zero the total score.
- Add unit tests covering: 0/1/2 penalties (score unaffected), 3+ penalties (score zeroed), and
  confirm existing Founders schema is unaffected (leave `maxPenaltiesBeforeZero` unset for
  Founders unless the rule applies there too — reread the plan doc, which says "we need a good
  mechanism... simple but important fix" without specifying edition scope; confirm with product
  owner whether this is Future Edition-only or a general bug fix).

## Suggested acceptance checks
- Division with `futureEdition = true` renders/records against the Future Edition scoresheet
  schema; Founders division unaffected.
- No-show scenario produces 0 GP points (or respects the new setting).
- A scoresheet with 3+ penalty clauses checked totals to 0; existing Founders scoresheets with
  &lt;3 penalties score normally.
