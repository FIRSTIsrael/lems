/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely } from 'kysely';

/**
 * Migration: Add automatic_assignment column to awards table.
 *
 * This field indicates whether an award is available for assignment
 * during the final deliberation optional awards stage. Awards with
 * automatic_assignment=true will be queried from the database and
 * made available in the UI, making the system flexible for different
 * award configurations.
 */
export async function up(db: Kysely<any>): Promise<void> {
  // Add automatic_assignment column with default false
  await db.schema
    .alterTable('awards')
    .addColumn('automatic_assignment', 'boolean', col => col.notNull().defaultTo(false))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop the column
  await db.schema.alterTable('awards').dropColumn('automatic_assignment').execute();
}
