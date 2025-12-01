/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Create the agenda_events table
  await db.schema
    .createTable('agenda_events')
    .addColumn('pk', 'serial', col => col.primaryKey())
    .addColumn('id', 'uuid', col =>
      col
        .notNull()
        .unique()
        .defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('division_id', 'uuid', col => col.notNull())
    .addColumn('title', 'text', col => col.notNull())
    .addColumn('start_time', 'timestamptz', col => col.notNull())
    .addColumn('duration', 'integer', col => col.notNull())
    .addColumn('visibility', 'text', col => col.notNull())
    .execute();

  // Create foreign key constraint for division_id
  await db.schema
    .alterTable('agenda_events')
    .addForeignKeyConstraint('fk_agenda_events_division_id', ['division_id'], 'divisions', ['id'])
    .onDelete('cascade')
    .execute();

  // Create indexes for agenda_events table
  await db.schema.createIndex('idx_agenda_events_id').on('agenda_events').column('id').execute();
  await db.schema
    .createIndex('idx_agenda_events_division_id')
    .on('agenda_events')
    .column('division_id')
    .execute();
  await db.schema
    .createIndex('idx_agenda_events_start_time')
    .on('agenda_events')
    .column('start_time')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop indexes
  await db.schema.dropIndex('idx_agenda_events_start_time').ifExists().execute();
  await db.schema.dropIndex('idx_agenda_events_division_id').ifExists().execute();
  await db.schema.dropIndex('idx_agenda_events_id').ifExists().execute();

  // Drop table
  await db.schema.dropTable('agenda_events').ifExists().execute();
}
