/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Add future_edition column to divisions table with default value of false
  await db.schema
    .alterTable('divisions')
    .addColumn('future_edition', 'boolean', col => col.notNull().defaultTo(false))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop the future_edition column
  await db.schema.alterTable('divisions').dropColumn('future_edition').execute();
}
