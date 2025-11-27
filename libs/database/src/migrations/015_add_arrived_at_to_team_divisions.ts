/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Add arrivedAt field to team_divisions table
  await db.schema
    .alterTable('team_divisions')
    .addColumn('arrived_at', 'timestamptz')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop the arrivedAt field
  await db.schema
    .alterTable('team_divisions')
    .dropColumn('arrived_at')
    .execute();
}
