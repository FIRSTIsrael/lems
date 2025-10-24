/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.createType('event_type').asEnum(['OFFSEASON', 'OFFICIAL']).execute();

  // Create the event_settings table
  await db.schema
    .createTable('event_settings')
    .addColumn('pk', 'serial', col => col.primaryKey())
    .addColumn('event_id', 'uuid', col => col.notNull().unique())
    .addColumn('visible', 'boolean', col => col.notNull().defaultTo(false))
    .addColumn('completed', 'boolean', col => col.notNull().defaultTo(false))
    .addColumn('published', 'boolean', col => col.notNull().defaultTo(false))
    .addColumn('advancement_percent', 'integer', col => col.notNull().defaultTo(0))
    .addColumn('event_type', sql`event_type`, col => col.notNull().defaultTo('OFFICIAL'))
    .execute();

  // Create foreign key constraint for event_id
  await db.schema
    .alterTable('event_settings')
    .addForeignKeyConstraint('fk_event_settings_event_id', ['event_id'], 'events', ['id'])
    .onDelete('cascade')
    .execute();

  // Add check constraint for advancement_percent to be between 0 and 100
  await db.schema
    .alterTable('event_settings')
    .addCheckConstraint(
      'chk_advancement_percent_range',
      sql`advancement_percent >= 0 AND advancement_percent <= 100`
    )
    .execute();

  // Create indexes
  await db.schema
    .createIndex('idx_event_settings_event_id')
    .on('event_settings')
    .column('event_id')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop indexes
  await db.schema.dropIndex('idx_event_settings_event_id').ifExists().execute();

  // Drop the event_settings table
  await db.schema.dropTable('event_settings').execute();

  // Drop the enum type
  await db.schema.dropType('event_type').ifExists().execute();
}
