/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Create the admin_events table (junction table)
  await db.schema
    .createTable('admin_events')
    .addColumn('pk', 'serial', col => col.primaryKey())
    .addColumn('admin_id', 'uuid', col => col.notNull())
    .addColumn('event_id', 'uuid', col => col.notNull())
    .addColumn('assigned_at', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
    .execute();

  // Create foreign key constraint for admin_id
  await db.schema
    .alterTable('admin_events')
    .addForeignKeyConstraint('fk_admin_events_admin_id', ['admin_id'], 'admins', ['id'])
    .onDelete('cascade')
    .execute();

  // Create foreign key constraint for event_id
  await db.schema
    .alterTable('admin_events')
    .addForeignKeyConstraint('fk_admin_events_event_id', ['event_id'], 'events', ['id'])
    .onDelete('cascade')
    .execute();

  // Add unique constraint to prevent duplicate admin-event assignments
  await db.schema
    .alterTable('admin_events')
    .addUniqueConstraint('uk_admin_events_admin_event', ['admin_id', 'event_id'])
    .execute();

  // Create indexes for performance
  await db.schema
    .createIndex('idx_admin_events_admin_id')
    .on('admin_events')
    .column('admin_id')
    .execute();
  await db.schema
    .createIndex('idx_admin_events_event_id')
    .on('admin_events')
    .column('event_id')
    .execute();
  await db.schema
    .createIndex('idx_admin_events_assigned_at')
    .on('admin_events')
    .column('assigned_at')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop indexes
  await db.schema.dropIndex('idx_admin_events_admin_id').ifExists().execute();
  await db.schema.dropIndex('idx_admin_events_event_id').ifExists().execute();
  await db.schema.dropIndex('idx_admin_events_assigned_at').ifExists().execute();

  // Drop the table
  await db.schema.dropTable('admin_events').execute();
}
