/* eslint-disable @typescript-eslint/no-explicit-any */

import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Add open_rubrics_during_session column to event_settings table
  await db.schema
    .alterTable('event_settings')
    .addColumn('open_rubrics_during_session', 'boolean', col => col.notNull().defaultTo(false))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop open_rubrics_during_session column
  await db.schema.alterTable('event_settings').dropColumn('open_rubrics_during_session').execute();
}
