/* eslint-disable @typescript-eslint/no-explicit-any */

import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Existing events keep the previous GP behavior (no-shows stay at the default GP).
  // New events pick up DEFAULT true.
  await db.schema
    .alterTable('event_settings')
    .addColumn('zero_gp_for_no_shows', 'boolean', col => col.notNull().defaultTo(false))
    .execute();

  await sql`ALTER TABLE event_settings ALTER COLUMN zero_gp_for_no_shows SET DEFAULT true`.execute(
    db
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop zero_gp_for_no_shows column
  await db.schema.alterTable('event_settings').dropColumn('zero_gp_for_no_shows').execute();
}
