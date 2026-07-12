/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Create the event_integrations table
  await db.schema
    .createTable('event_integrations')
    .addColumn('pk', 'serial', col => col.primaryKey())
    .addColumn('event_id', 'uuid', col => col.notNull())
    .addColumn('integration_type', 'varchar', col => col.notNull())
    .addColumn('enabled', 'boolean', col => col.notNull().defaultTo(true))
    .addColumn('settings', 'jsonb', col => col.notNull().defaultTo(sql`'{}'::jsonb`))
    .addColumn('created_at', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
    .execute();

  // Create foreign key constraint for event_id
  await db.schema
    .alterTable('event_integrations')
    .addForeignKeyConstraint('fk_event_integrations_event_id', ['event_id'], 'events', ['id'])
    .onDelete('cascade')
    .execute();

  // Create unique constraint on event_id + integration_type to prevent duplicates
  await db.schema
    .alterTable('event_integrations')
    .addUniqueConstraint('uq_event_integrations_event_type', ['event_id', 'integration_type'])
    .execute();

  // Create indexes
  await db.schema
    .createIndex('idx_event_integrations_event_id')
    .on('event_integrations')
    .column('event_id')
    .execute();

  await db.schema
    .createIndex('idx_event_integrations_type')
    .on('event_integrations')
    .column('integration_type')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop indexes
  await db.schema.dropIndex('idx_event_integrations_type').ifExists().execute();
  await db.schema.dropIndex('idx_event_integrations_event_id').ifExists().execute();

  // Drop the event_integrations table
  await db.schema.dropTable('event_integrations').execute();
}
