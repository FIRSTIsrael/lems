/* eslint-disable @typescript-eslint/no-explicit-any */

import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Add visible column
  await db.schema
    .alterTable('event_settings')
    .addColumn('visible', 'boolean', col => col.notNull().defaultTo(false))
    .execute();

  // Add official column
  await db.schema
    .alterTable('event_settings')
    .addColumn('official', 'boolean', col => col.notNull().defaultTo(true))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop visible column
  await db.schema.alterTable('event_settings').dropColumn('visible').execute();

  // Drop official column
  await db.schema.alterTable('event_settings').dropColumn('visible').execute();
}
