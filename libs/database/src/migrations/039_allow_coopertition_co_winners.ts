/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('awards')
    .dropConstraint('uk_awards_division_name_place')
    .execute();

  // Coopertition places are shared by two co-winning teams (two rows per place).
  await sql`
    CREATE UNIQUE INDEX uk_awards_division_name_place_single
    ON awards (division_id, name, place)
    WHERE name <> 'coopertition'
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP INDEX uk_awards_division_name_place_single`.execute(db);

  // Fails if coopertition co-winner rows exist; delete them manually first.
  await db.schema
    .alterTable('awards')
    .addUniqueConstraint('uk_awards_division_name_place', ['division_id', 'name', 'place'])
    .execute();
}
