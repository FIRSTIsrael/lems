/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Add practice_tables_settings JSON column to divisions table
  await db.schema
    .alterTable('divisions')
    .addColumn('practice_tables_settings', 'jsonb', col => col.defaultTo(null))
    .execute();

  // Create the practice_tables_schedule table to store slots (team_id nullable for unassigned slots)
  await db.schema
    .createTable('practice_tables_schedule')
    .addColumn('pk', 'serial', col => col.primaryKey())
    .addColumn('id', 'uuid', col => col.notNull().unique().defaultTo(db.fn('gen_random_uuid')))
    .addColumn('division_id', 'uuid', col => col.notNull())
    .addColumn('team_id', 'uuid') // Nullable - slot can be unassigned
    .addColumn('table_number', 'integer', col => col.notNull())
    .addColumn('start_time', 'timestamp', col => col.notNull())
    .addColumn('end_time', 'timestamp', col => col.notNull())
    .addColumn('created_at', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .execute();

  // Create foreign key constraints
  await db.schema
    .alterTable('practice_tables_schedule')
    .addForeignKeyConstraint(
      'fk_practice_tables_schedule_division_id',
      ['division_id'],
      'divisions',
      ['id']
    )
    .onDelete('cascade')
    .execute();

  await db.schema
    .alterTable('practice_tables_schedule')
    .addForeignKeyConstraint('fk_practice_tables_schedule_team_id', ['team_id'], 'teams', ['id'])
    .onDelete('cascade')
    .execute();

  // Create indexes for practice_tables_schedule
  await db.schema
    .createIndex('idx_practice_tables_schedule_division_id')
    .on('practice_tables_schedule')
    .column('division_id')
    .execute();

  await db.schema
    .createIndex('idx_practice_tables_schedule_team_id')
    .on('practice_tables_schedule')
    .column('team_id')
    .execute();

  await db.schema
    .createIndex('idx_practice_tables_schedule_time_range')
    .on('practice_tables_schedule')
    .columns(['division_id', 'start_time', 'end_time'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop indexes for practice_tables_schedule
  await db.schema.dropIndex('idx_practice_tables_schedule_time_range').ifExists().execute();
  await db.schema.dropIndex('idx_practice_tables_schedule_team_id').ifExists().execute();
  await db.schema.dropIndex('idx_practice_tables_schedule_division_id').ifExists().execute();

  // Drop practice_tables_schedule table
  await db.schema.dropTable('practice_tables_schedule').ifExists().execute();

  // Drop practice_tables_settings column from divisions
  await db.schema.alterTable('divisions').dropColumn('practice_tables_settings').execute();
}
