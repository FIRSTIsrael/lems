/* eslint-disable @typescript-eslint/no-explicit-any */

import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Add zero_gp_for_no_shows column to event_settings table
  await db.schema
    .alterTable('event_settings')
    .addColumn('zero_gp_for_no_shows', 'boolean', col => col.notNull().defaultTo(true))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop zero_gp_for_no_shows column
  await db.schema.alterTable('event_settings').dropColumn('zero_gp_for_no_shows').execute();
}
