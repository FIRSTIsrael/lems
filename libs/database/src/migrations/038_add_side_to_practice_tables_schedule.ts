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

  // Future divisions seat two teams per slot (sides A and B). Existing slots become side A
  // (keeping their team) and get an empty side B partner. Founders rows keep side = NULL.
  await sql`
    UPDATE practice_tables_schedule p
    SET side = 'A'
    FROM divisions d
    WHERE d.id = p.division_id AND d.future_edition
  `.execute(db);

  await sql`
    INSERT INTO practice_tables_schedule (division_id, team_id, table_number, start_time, end_time, side)
    SELECT p.division_id, NULL, p.table_number, p.start_time, p.end_time, 'B'
    FROM practice_tables_schedule p
    JOIN divisions d ON d.id = p.division_id
    WHERE d.future_edition AND p.side = 'A'
  `.execute(db);

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
  // The side-B rows created by `up` would become duplicate slots once the column is gone.
  // Assignments on side B are lost; side A rows (and their teams) are kept.
  await sql`DELETE FROM practice_tables_schedule WHERE side = 'B'`.execute(db);

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
