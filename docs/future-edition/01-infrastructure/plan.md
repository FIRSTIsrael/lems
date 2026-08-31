# Task 01 — Infrastructure: DB Contract & Config Plumbing

## Goal
Finish wiring the `futureEdition` division flag so every other task can branch on it, and give
admins a way to set it. This task has no visible game-logic behavior of its own — it's the
foundation.

## Current state (already done)
- `divisions.future_edition boolean default false` column exists
  ([migration 033](../../../libs/database/src/migrations/033_add_future_edition_to_division.ts)).
- `Division` / `InsertableDivision` types include `future_edition`
  ([libs/database/src/schema/tables/divisions.ts](../../../libs/database/src/schema/tables/divisions.ts)).
- Admin REST `POST /admin/events/:eventId/divisions` accepts `futureEdition` on create
  ([apps/backend/src/routers/admin/events/divisions/index.ts](../../../apps/backend/src/routers/admin/events/divisions/index.ts#L25)).
- GraphQL `Division.futureEdition: Boolean!` is exposed for read
  ([libs/types/src/lib/api/lems/graphql/division.graphql](../../../libs/types/src/lib/api/lems/graphql/division.graphql)).

## Gaps to close

### 1. Allow updating `futureEdition` after creation
- `PUT /admin/events/:eventId/divisions/:divisionId` in
  [apps/backend/src/routers/admin/events/divisions/index.ts](../../../apps/backend/src/routers/admin/events/divisions/index.ts#L58-L67)
  currently only accepts `{ name, color }`. Add `futureEdition` (optional, defaults to existing
  value) to the payload and the `db.divisions.byId().update()` call.
- Decide and document a rule: once a division `has_schedule` or has matches/sessions created,
  should `futureEdition` still be editable? Recommend blocking the change if
  `has_schedule` is true, since scoresheet/rubric schema and scheduling logic depend on it being
  stable — return 400 with a clear error otherwise.

### 2. Admin UI control
- Add a toggle/switch (e.g. MUI `Switch` or `FormControlLabel`) for "Future Edition" to:
  - Create dialog:
    [apps/admin/src/app/[locale]/(dashboard)/events/[slug]/divisions/components/create-division-dialog.tsx](../../../apps/admin/src/app/%5Blocale%5D/(dashboard)/events/%5Bslug%5D/divisions/components/create-division-dialog.tsx)
  - Edit dialog/flow for existing divisions (find the sibling edit component in the same
    `divisions/components` folder; same fields as create, minus the "locked after schedule" case
    from step 1 — disable the toggle and show a tooltip explaining why).
- Add `futureEdition` localization strings to
  [apps/admin/locale/en.json](../../../apps/admin/locale/en.json) (and `he.json`, `pl.json`) near
  the existing division fields.

### 3. Season/edition config selection helper
Several later tasks (02, 04, 05, 06, 07) need a single, consistent way to pick
edition-specific config (scoresheet schema, rubric schema, award pool, judging stage timings)
based on `division.future_edition`. To avoid every task re-inventing this:
- Add a small shared utility, e.g. `libs/shared/src/lib/edition/get-edition-config.ts`, exporting
  a generic `selectByEdition<T>(isFuture: boolean, founders: T, future: T): T` helper (or a more
  specific config-object pattern if that reads better once task 02/05 schemas exist).
- Export it from `@lems/shared` alongside the existing `scoresheet`/`rubrics` barrel exports so
  backend resolvers, scheduler-facing REST endpoints, and frontend components can all import the
  same helper.
- This task only needs to add the helper + a unit test; actual call sites are added by tasks
  02/04/05/06/07 as they land.

### 4. Propagate the flag to places that need it but don't have it yet
- Confirm `event-divisions.ts` resolver
  ([apps/backend/src/lib/graphql/resolvers/events/event-divisions.ts](../../../apps/backend/src/lib/graphql/resolvers/events/event-divisions.ts))
  and the divisions resolver
  ([apps/backend/src/lib/graphql/resolvers/divisions/resolver.ts](../../../apps/backend/src/lib/graphql/resolvers/divisions/resolver.ts))
  already surface `future_edition` — they do; just confirm no field-name mismatch after any
  refactor here.
- Scheduler service (Python) calls back into the LEMS REST API for division/schedule settings.
  Check [apps/scheduler/src/repository/lems_repository.py](../../../apps/scheduler/src/repository/lems_repository.py)
  and add `future_edition` (or `is_future`) to whatever division/event payload it already fetches,
  so task 07 doesn't need its own plumbing.

## Out of scope (handled by later tasks)
- Actually changing scoresheet, rubric, award, or scheduling behavior based on the flag.
- The visible "Future Edition" badge on event/division listings (task 08).

## Suggested acceptance checks
- Can create a division with Future Edition on/off via admin UI.
- Can toggle Future Edition on an existing division (until schedule exists), verified via API and
  UI.
- `selectByEdition` helper exists, is exported, and has a passing unit test.
- Scheduler repository payload includes the edition flag.
