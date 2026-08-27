/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely';

/**
 * Rename audience display mode `logo` → `welcome` in stored division state JSON.
 */
export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    UPDATE divisions
    SET state = jsonb_set(
      state,
      '{audienceDisplay,activeDisplay}',
      '"welcome"'::jsonb,
      true
    )
    WHERE state #>> '{audienceDisplay,activeDisplay}' = 'logo'
  `.execute(db);

  await sql`
    UPDATE divisions
    SET state = jsonb_set(
      state #- '{audienceDisplay,settings,logo}',
      '{audienceDisplay,settings,welcome}',
      COALESCE(state #> '{audienceDisplay,settings,logo}', '{}'::jsonb),
      true
    )
    WHERE state #> '{audienceDisplay,settings,logo}' IS NOT NULL
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`
    UPDATE divisions
    SET state = jsonb_set(
      state,
      '{audienceDisplay,activeDisplay}',
      '"logo"'::jsonb,
      true
    )
    WHERE state #>> '{audienceDisplay,activeDisplay}' = 'welcome'
  `.execute(db);

  await sql`
    UPDATE divisions
    SET state = jsonb_set(
      state #- '{audienceDisplay,settings,welcome}',
      '{audienceDisplay,settings,logo}',
      COALESCE(state #> '{audienceDisplay,settings,welcome}', '{}'::jsonb),
      true
    )
    WHERE state #> '{audienceDisplay,settings,welcome}' IS NOT NULL
  `.execute(db);
}
