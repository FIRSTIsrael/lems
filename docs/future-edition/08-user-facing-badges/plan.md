# Task 08 — User-Facing: Future Edition Badge & Admin Control

## Goal
Show a "Future Edition" badge everywhere an event/division is listed (admin, frontend, portal,
volunteer app), and make sure admins can control the flag on a per-division basis when
creating/managing events (the admin-control half overlaps with Task 01's admin UI work — this task
focuses on the **badge display** everywhere else; confirm Task 01 is merged first since it depends
on `futureEdition` being settable and reliably present on GraphQL/REST division payloads).

Depends on: Task 01 (flag readable via GraphQL `Division.futureEdition` and admin REST responses).

## Current state
- `futureEdition` is already returned by:
  - GraphQL `Division` type (`libs/types/src/lib/api/lems/graphql/division.graphql`).
  - Admin REST division responses via `makeAdminDivisionResponse` in
    [apps/backend/src/routers/admin/events/divisions/util.ts](../../../apps/backend/src/routers/admin/events/divisions/util.ts).
- No frontend/admin/portal component currently reads or displays it (confirmed — no UI usages
  found in the repo as of this plan).

## Steps

### 1. Shared badge component
- Add one small shared component, e.g. `FutureEditionBadge`, in `libs/shared/src/lib/components/`
  (match whatever existing badge/chip pattern is used elsewhere in the design system — check for
  an existing `Chip`-based status badge to copy styling/structure from, e.g. event status badges
  if any exist under `libs/shared/src/lib/components/`).
- Export it from the `@lems/shared` components barrel so it's usable from `frontend`, `admin`, and
  `portal` apps alike.
- Add localization key (`"futureEdition": "Future Edition"` or similar) to each app's locale files
  that will render it: `apps/frontend/locale/*.json`, `apps/admin/locale/*.json`,
  `apps/portal/locale/*.json`, plus `libs/localization` if it's meant to be shared centrally.

### 2. Find and update every event/division listing surface
Search each app for existing event/division list/card/table components and add the badge
conditionally on `futureEdition`/`future_edition`:
- **Admin:** events list/table, division list within an event
  (`apps/admin/src/app/[locale]/(dashboard)/events/...` — including the divisions
  `page.tsx`/table referenced in Task 01).
- **Frontend:** wherever the current event/division is shown in headers/menus for volunteers
  (`apps/frontend/src/app/[locale]/lems/...` — check the top-level layout/header component that
  shows event name, plus any event-switcher UI).
- **Portal:** public event listing and event detail pages
  (`apps/portal/src/app/[locale]/...` — check the events index page and the
  `event/[slug]` detail header).
- Confirm each of these already fetches `futureEdition` in its GraphQL query/REST call; if not,
  add the field to the relevant query/fragment before rendering the badge.

### 3. Verify against Task 01 admin control
- Once Task 01's create/edit dialogs are in place, do a manual pass: create a Future Edition
  division in admin, confirm the badge appears in all the surfaces found in step 2, then toggle it
  off (if allowed per Task 01's "locked after schedule" rule) and confirm the badge disappears.

## Suggested acceptance checks
- Badge renders on every screen where an event or division is listed, without needing to open
  the entity.
- Non-Future-Edition divisions show no badge (no empty/placeholder space regression).
- Badge text is localized in all supported locales (en/he/pl at minimum).
