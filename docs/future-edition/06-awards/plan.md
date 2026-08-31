# Task 06 — Judging: Awards

## Goal
1. Add Future Edition's additional optional awards to the general award pool.
2. Rename "Robot Performance" → "Game Performance" and "Robot Design" → "Engineering Design" for
   Future Edition divisions (localization-only change, award ids stay the same).

Depends on: Task 01 (`futureEdition` flag + `selectByEdition` helper).

## Current state
- Award constants: [libs/shared/src/lib/awards/awards.ts](../../../libs/shared/src/lib/awards/awards.ts)
  defines `MANDATORY_AWARDS`, `OPTIONAL_AWARDS`, `CORE_VALUES_AWARDS`, `PERSONAL_AWARDS`,
  `AUTOMATIC_ASSIGNMENT_AWARDS`, `AWARD_LIMITS`, and the combined `AWARDS` list used as the `Award`
  union type.
- Award rows are persisted per-division in the `awards` table
  ([libs/database/src/migrations/011_create_awards_table.ts](../../../libs/database/src/migrations/011_create_awards_table.ts),
  extended by
  [019_add_automatic_assignment_to_awards.ts](../../../libs/database/src/migrations/019_add_automatic_assignment_to_awards.ts),
  [023_add_show_places_to_awards.ts](../../../libs/database/src/migrations/023_add_show_places_to_awards.ts)) —
  the admin app presumably lets an admin pick which optional awards to actually give out per
  division (find this UI under
  `apps/admin/src/app/[locale]/(dashboard)/events/[slug]/divisions/.../awards` before starting).
- Localization keys for award names: `libs/localization/src/lib/locale/en.json` (lines ~47-65),
  e.g. `"robot-design": "Robot Design"`, `"robot-performance": "Robot Performance"`. Also check
  `apps/frontend/locale/en.json` and `apps/admin/locale/en.json` for duplicated/award-adjacent
  strings.

## Steps

### 1. Add new Future Edition optional awards to the pool
- Get the exact list of new optional awards from the official Future Edition rules (not
  specified in the source plan doc beyond "different optional awards" — do not invent award
  names; confirm with product owner/rules doc before implementing).
- Add new award id(s) to `OPTIONAL_AWARDS` (or a new `FUTURE_EDITION_OPTIONAL_AWARDS` array merged
  in) and `AWARD_LIMITS` in `awards.ts`. Keep them available in the general pool per the plan
  ("added to the general pool") — i.e. don't gate them behind the `futureEdition` flag at the type
  level, just ensure the admin awards-configuration UI lists them so any division (Founders or
  Future Edition) could technically enable them, matching "general pool" wording. Confirm this
  interpretation against the source doc line: *"Future Edition offers different optional awards,
  which will be added to the general pool"* — if instead they should be Future-Edition-exclusive,
  filter the admin UI's award picker by `division.futureEdition`.
- Add localization entries for the new award id(s) across `en.json`/`he.json`/`pl.json` in
  `libs/localization/src/lib/locale/`.

### 2. Rename Robot Performance → Game Performance, Robot Design → Engineering Design (Future Edition only)
- Do **not** rename the underlying award/rubric-category ids (`robot-performance`,
  `robot-design`) — too invasive across DB rows, GraphQL, rubric schema (Task 05), and award
  logic. Only change the **displayed label** for Future Edition divisions.
- Add new localization keys, e.g. `"robot-performance-future": "Game Performance"` and
  `"robot-design-future": "Engineering Design"` (naming convention: confirm existing precedent for
  edition-conditional localization keys elsewhere in the repo before finalizing key names — if
  none exists, this is a new pattern worth a short code comment).
- Add a small utility, e.g. `getAwardLabelKey(awardId: Award, isFutureEdition: boolean): string` in
  `libs/shared/src/lib/awards/awards.ts` (or a localization-adjacent util), returning the
  future-suffixed key for `robot-performance`/`robot-design` when `isFutureEdition` is true, else
  the normal key.
- Update every place that renders an award name from its id (search for
  `t(\`awards.${award}\`)`-style lookups or similar across
  `apps/frontend`, `apps/admin`, `apps/portal`) to go through `getAwardLabelKey` with the current
  division's `futureEdition` flag instead of using the raw award id as the translation key
  directly.

## Suggested acceptance checks
- Admin awards configuration screen shows the new Future Edition optional award(s) in the pool.
- Future Edition division's award ceremony/admin screens show "Game Performance" / "Engineering
  Design"; Founders division still shows "Robot Performance" / "Robot Design".
- No award id, DB row, or rubric category id was renamed — only display labels changed.
