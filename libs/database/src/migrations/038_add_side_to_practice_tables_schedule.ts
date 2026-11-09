/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Remove duplicate slots so the new unique constraint can be applied.
  // Keeps an assigned row over an empty one, otherwise the oldest (lowest pk).
  await sql`
    DELETE FROM practice_tables_schedule p
    USING practice_tables_schedule q
    WHERE p.division_id = q.division_id
      AND p.table_number = q.table_number
      AND p.start_time = q.start_time
      AND (
        (p.team_id IS NULL AND q.team_id IS NOT NULL)
        OR ((p.team_id IS NULL) = (q.team_id IS NULL) AND p.pk > q.pk)
      )
  `.execute(db);

  await db.schema
    .alterTable('practice_tables_schedule')
    .addColumn('side', sql`char(1)`)
    .execute();

  await sql`
    ALTER TABLE practice_tables_schedule
    ADD CONSTRAINT ck_practice_tables_schedule_side
    CHECK (side IS NULL OR side IN ('A', 'B'))
  `.execute(db);

  await db.schema
    .alterTable('practice_tables_schedule')
    .addUniqueConstraint(
      'uk_practice_tables_schedule_slot',
      ['division_id', 'table_number', 'start_time', 'side'],
      builder => builder.nullsNotDistinct()
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('practice_tables_schedule')
    .dropConstraint('uk_practice_tables_schedule_slot')
    .execute();

  await db.schema
    .alterTable('practice_tables_schedule')
    .dropConstraint('ck_practice_tables_schedule_side')
    .execute();

  await db.schema.alterTable('practice_tables_schedule').dropColumn('side').execute();
}
