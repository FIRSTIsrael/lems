/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('awards')
    .addColumn('show_places', 'boolean', col => col.notNull().defaultTo(true))
    .execute();

  // Automatically hide places for existing optional or personal awards
  await db
    .updateTable('awards')
    .set({ show_places: false })
    .where('is_optional', '=', true)
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('awards').dropColumn('show_places').execute();
}
