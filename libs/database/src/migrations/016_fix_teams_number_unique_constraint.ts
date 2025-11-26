/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Drop the unique constraint on teams.number
  await db.executeQuery(sql`ALTER TABLE teams DROP CONSTRAINT teams_number_key`.compile(db));

  // Ensure the composite unique constraint exists on (number, region)
  await db.schema
    .createIndex('idx_teams_number_region_unique')
    .on('teams')
    .columns(['number', 'region'])
    .unique()
    .ifNotExists()
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Remove the composite unique constraint
  await db.schema.dropIndex('idx_teams_number_region_unique').ifExists().execute();

  // Recreate the unique constraint on number
  await db.executeQuery(
    sql`ALTER TABLE teams ADD CONSTRAINT teams_number_key UNIQUE (number)`.compile(db)
  );
}
