# Task 04 — Judging: Session Flow Timing

## Goal
Judging session stage lengths (feedback, final thoughts, etc.) should differ by division edition.
Scheduler should generate schedules using the correct default session length for the division's
edition, and the frontend judge timer should use the matching stage breakdown.

Depends on: Task 01 (`futureEdition` flag propagated to scheduler + `selectByEdition` helper).

## Current state
- Judging session stages (setup, innovation-presentation, innovation-questions,
  robot-presentation, robot-questions, final-thoughts) are named/localized via
  [libs/localization/src/lib/hooks/use-judging-session-stage-translations.tsx](../../../libs/localization/src/lib/hooks/use-judging-session-stage-translations.tsx)
  and `en.json`/etc. under `libs/localization/src/lib/locale/`.
- Per-division timing config: `DivisionScheduleSettings` in
  [libs/database/src/schema/tables/divisions.ts](../../../libs/database/src/schema/tables/divisions.ts)
  has `judging_session_length` and `judging_session_cycle_time` as single numbers — no per-stage
  breakdown is persisted; stage durations are computed/hardcoded in the frontend judge timer
  components under
  [apps/frontend/src/app/[locale]/lems/(volunteer)/(dashboard)/judge/components/timer/](../../../apps/frontend/src/app/%5Blocale%5D/lems/(volunteer)/(dashboard)/judge/components/timer/).
- Scheduler (`apps/scheduler`) receives `judging_session_length_seconds` /
  `judging_cycle_time_seconds` from the request model
  ([apps/scheduler/src/models/requests.py](../../../apps/scheduler/src/models/requests.py#L26-L28))
  — it treats session length as an opaque total, not stage-aware.

## Steps

### 1. Locate/confirm the actual stage-length source of truth
Before changing anything, grep the judge timer components for the literal stage-duration values
(e.g. seconds per stage) to confirm whether they're:
(a) hardcoded constants in the timer components, or
(b) derived proportionally from `judging_session_length`.
Record the finding in this plan (edit this file) once confirmed — this materially changes the
implementation approach below.

### 2a. If stage durations are hardcoded constants
- Extract them into a config object per edition, e.g.
  `libs/shared/src/lib/judging/session-stages.ts` exporting
  `FOUNDERS_STAGE_DURATIONS` and `FUTURE_EDITION_STAGE_DURATIONS` (shape: stage id → seconds),
  plus a `getStageDurations(isFutureEdition: boolean)` selector (reuse Task 01's
  `selectByEdition`).
- Update the judge timer components to call the selector using the current division's
  `futureEdition` flag instead of importing constants directly.

### 2b. If stage durations are derived proportionally from total session length
- Add an edition-specific proportion table instead of duration table, same selector pattern.

### 3. Default session length in the scheduler flow
- Add per-edition default `judging_session_length_seconds` / `judging_cycle_time_seconds` (find
  where the admin schedule-generation UI currently pre-fills these defaults — likely an admin
  schedule settings form calling the scheduler REST integration under
  `apps/backend/src/routers/admin/events/divisions/schedule/` and/or
  `apps/scheduler/src/routers/`) and pre-select the Future Edition defaults when
  `division.future_edition` is true. Confirm the actual new default values with the product
  owner/rules doc — do not guess numbers.
- Ensure the scheduler Python request model / repository (see Task 01 step 4) has access to the
  `future_edition` flag if any Python-side logic needs it (unlikely for this task if only defaults
  change on the LEMS/admin side before calling the scheduler, but confirm).

## Suggested acceptance checks
- Creating a schedule for a Future Edition division pre-fills the new default judging session
  length; Founders divisions unaffected.
- Judge timer for a Future Edition session shows the correct stage breakdown/timings; Founders
  timer unchanged.
