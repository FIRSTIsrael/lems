# Task 07 — Scheduling: Two Teams Per Table

## Goal
Future Edition matches place **two teams per table** playing simultaneously ("1v1"), instead of
one team per table. The scheduler (Python service) and the LEMS data model for match participants
need to support this.

Depends on: Task 01 (`futureEdition`/edition flag propagated to the scheduler's division/event
payload).

## Current state
- Match participants: schema created in
  [libs/database/src/migrations/010_create_robot_game_tables_matches_and_participants.ts](../../../libs/database/src/migrations/010_create_robot_game_tables_matches_and_participants.ts),
  extended by
  [020_add_id_to_robot_game_match_participants.ts](../../../libs/database/src/migrations/020_add_id_to_robot_game_match_participants.ts) /
  [021_fix_robot_game_match_participants_id_default.ts](../../../libs/database/src/migrations/021_fix_robot_game_match_participants_id_default.ts) —
  confirm current cardinality: read the migration + current
  `libs/database/src/schema/tables/` participant table definition to check whether a
  `(match_id, table_id)` pair is already unique-constrained to one team (if so, that constraint
  must be relaxed to allow exactly 2 team rows per match+table for Future Edition).
- Scheduler slot math: `ValidatorService`
  ([apps/scheduler/src/services/validator_service.py](../../../apps/scheduler/src/services/validator_service.py#L40-L80))
  computes `slots = ceil(len(tables) / 2 if stagger_matches else len(tables))` and
  `matches_per_round = ceil(team_count / slots)` — this currently models **one team per table**
  (or splits tables in half when staggering, which is an unrelated feature from "2 teams per
  table").
- Team assignment: `SchedulerService`
  ([apps/scheduler/src/services/scheduler_service.py](../../../apps/scheduler/src/services/scheduler_service.py#L113-L270))
  iterates matches and assigns exactly one team per table slot via `_assign_team()`, respecting
  `_meets_minimum_gap()` between a team's events.

## Steps

### 1. Data model
- Confirm (don't assume) whether the existing `robot_game_match_participants` table can already
  hold 2 rows per `(match_id, table_id)` — if there's a uniqueness constraint on `table_id` alone
  per match, add a migration to change it to a composite constraint allowing 2 teams per table
  (e.g. unique on `(match_id, table_id, team_id)` if not already, plus perhaps a `table_side`
  column ('A'/'B' or 1/2) if presentation needs to distinguish which "half" of the table each team
  occupies — check the frontend match-card/scoreboard rendering for whether it needs this before
  adding a column speculatively).
- Update GraphQL/REST types that assume one team per table match participant if any (search for
  `matchParticipants` or `tableId` in resolvers and REST admin schedule routers).

### 2. Scheduler slot/assignment logic
- Add an edition-aware branch (using the flag propagated in Task 01) in
  `validator_service.py`: for Future Edition, `slots = len(tables) * 2` conceptually (2 teams per
  table) rather than `len(tables)` — re-derive the exact formula carefully, since it must not
  break the existing `stagger_matches` behavior, which is a separate, independent feature. Write
  out the truth table (Founders+stagger, Founders+no-stagger, Future+stagger, Future+no-stagger)
  as a code comment before implementing, since combining "two features that both affect
  slots-per-table" is error-prone.
- Update `_assign_team()` / the match-generation loop in `scheduler_service.py` to place 2 teams
  per table per match slot for Future Edition, still respecting `_meets_minimum_gap()` per team.
- Add/extend Python unit tests for the validator and scheduler services covering the new
  2-teams-per-table case (check `apps/scheduler` for an existing test folder/pattern first).

### 3. Frontend / admin rendering
- Any UI that renders "which team is on which table" for a match (schedule views, scorekeeper
  dashboard, audience display match-preview) needs to show 2 teams per table for Future Edition
  divisions. Search for `tableId`/`table.name` rendering in
  `apps/frontend/src/app/[locale]/lems/(volunteer)/(dashboard)/scorekeeper/` and
  `.../audience-display/components` and adjust the layout to show a team pair per table when
  `division.futureEdition` is true.

## Suggested acceptance checks
- Generating a schedule for a Future Edition division produces matches with 2 teams per table;
  Founders division schedules unaffected (still 1 team per table).
- Scorekeeper/audience display correctly show both teams per table for Future Edition matches.
- Minimum-gap-between-events constraint still respected per team in both modes.
