# Future Edition Support — Overview

Source: "Future Edition Plan" (provided by FIRST Israel), split into independent, incrementally
mergeable tasks. Each task has its own `plan.md` under this directory. Work through them roughly
in order, since later tasks depend on the `futureEdition` flag and config-selection pattern
established in task 01.

## Key existing state (verified in repo, 2026-08-31)

The `futureEdition` boolean **already exists end-to-end at the data layer**, but is not wired into
any feature logic yet:

- DB column: `divisions.future_edition` (migration
  [033_add_future_edition_to_division.ts](../../libs/database/src/migrations/033_add_future_edition_to_division.ts),
  schema in [libs/database/src/schema/tables/divisions.ts](../../libs/database/src/schema/tables/divisions.ts#L44))
- Zod type: [libs/types/src/lib/api/admin/divisions.ts](../../libs/types/src/lib/api/admin/divisions.ts)
- GraphQL: `futureEdition: Boolean!` on `Division` in
  [libs/types/src/lib/api/lems/graphql/division.graphql](../../libs/types/src/lib/api/lems/graphql/division.graphql)
- Read/create only (no update) in
  [apps/backend/src/routers/admin/events/divisions/index.ts](../../apps/backend/src/routers/admin/events/divisions/index.ts)

Nothing else in the codebase reads this flag today — no admin UI control, no badge, no
scoresheet/rubric/awards/scheduler branching. That is the gap all the tasks below close.

## Task list

| # | Folder | Area | Depends on |
|---|--------|------|------------|
| 01 | `01-infrastructure` | DB contract + admin control + season config plumbing | — |
| 02 | `02-scoresheet` | Robot game scoresheet schema, no-show GP, 3-penalty rule | 01 |
| 03 | `03-score-display` | Average vs. max score display/ranking | 02 |
| 04 | `04-judging-session-flow` | Judging session stage timing per edition | 01 |
| 05 | `05-rubrics` | Rubric schema selection per edition | 01 |
| 06 | `06-awards` | Award pool changes + renames | 01 |
| 07 | `07-scheduling` | Two teams per table ("1v1") | 01 |
| 08 | `08-user-facing-badges` | Future Edition badge everywhere events/divisions are listed | 01 |

Each `plan.md` is self-contained with goals, current-state notes, concrete steps, and file
references so it can be implemented independently on the `future-edition` branch.
