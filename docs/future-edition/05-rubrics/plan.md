# Task 05 — Judging: Rubrics

## Goal
Support a Future Edition rubric schema alongside the existing one, selected per-division, using
the same mechanics as today ("different schema, same underlying code — config change only").

Depends on: Task 01 (`futureEdition` flag + `selectByEdition` helper).

## Current state
- Rubric schema type: `RubricsSchema` in
  [libs/shared/src/lib/rubrics/types.ts](../../../libs/shared/src/lib/rubrics/types.ts) — has
  `_version` plus `core-values` / `innovation-project` / `robot-design` categories, each a
  `RubricCategorySchema` (sections → fields, optional `awards`/`feedback`/`coreValues` flags).
- Single schema instance: `rubrics` in
  [libs/shared/src/lib/rubrics/rubrics.ts](../../../libs/shared/src/lib/rubrics/rubrics.ts)
  (`_version: '2025-11-23'`), imported directly wherever rubrics are rendered/validated (e.g.
  [apps/frontend/.../team/[teamSlug]/rubric/[category]/rubric-context.tsx](../../../apps/frontend/src/app/%5Blocale%5D/lems/(volunteer)/(dashboard)/team/%5BteamSlug%5D/rubric/%5Bcategory%5D/rubric-context.tsx)
  and `rubric-utils.ts` in the same folder).
- Rubric documents in MongoDB (`libs/database/src/repositories/rubrics.ts`) store
  `{ divisionId, teamId, category, status, data }` — the schema itself is not persisted, so
  changing which schema is "active" for a division doesn't require a data migration, only
  consistent runtime selection.
- Category naming: task 06 (Awards) renames "Robot Design" → "Engineering Design" and
  "Robot Performance" → "Game Performance" for Future Edition — confirm whether the rubric
  category id `robot-design` itself needs a matching id/schema key change, or just its display
  label. Recommend keeping the internal id stable (`robot-design`) and only changing the localized
  label (see Task 06) to avoid a wider rename across DB documents, GraphQL types, and award
  logic — flag this decision explicitly if it turns out the rubric schema needs a differently
  shaped category for Future Edition.

## Steps

### 1. Add Future Edition rubric schema
- Create `libs/shared/src/lib/rubrics/future-edition.ts` mirroring `rubrics.ts`'s shape, with
  `_version` reflecting the future edition (e.g. `'future-edition-<date>'`). Populate real
  sections/fields once the official rubric doc is available; until then, stub with the same
  category/section/field ids as Founders so the plumbing/tests can be built.
- Add a selector, e.g. `getRubricsSchema(isFutureEdition: boolean)` in
  `libs/shared/src/lib/rubrics/index.ts`, using Task 01's `selectByEdition` helper.

### 2. Update call sites
- Grep for `from '@lems/shared/rubrics'` / `import { rubrics }` across
  `apps/frontend/src/app/[locale]/lems/(volunteer)/(dashboard)/team/[teamSlug]/rubric/` and any
  admin rubric-viewing screens under `apps/admin/src/app`.
- Replace direct imports with the selector, threading the current division's `futureEdition` flag
  through existing context/providers (e.g. `rubric-context.tsx` likely already has division data
  available via its GraphQL query — extend that query to include `futureEdition` if not already
  fetched, then pass through to the selector).
- Check GraphQL/REST rubric read & write resolvers on the backend (search
  `apps/backend/src/lib/graphql/resolvers` for `rubric`) for any server-side schema validation
  that also needs the same schema-selection change (e.g. validating submitted field ids/values
  against the schema).

## Suggested acceptance checks
- Future Edition division renders/validates against the new rubric schema; Founders division
  unaffected.
- Existing rubric documents for Founders divisions continue to load/save correctly (regression
  check — no schema drift for existing data).
