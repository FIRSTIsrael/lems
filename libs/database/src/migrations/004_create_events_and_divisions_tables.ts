/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Create the events table
  await db.schema
    .createTable('events')
    .addColumn('pk', 'serial', col => col.primaryKey())
    .addColumn('id', 'uuid', col =>
      col
        .notNull()
        .unique()
        .defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('name', 'text', col => col.notNull())
    .addColumn('slug', 'text', col => col.notNull().unique())
    .addColumn('start_date', 'timestamptz', col => col.notNull())
    .addColumn('end_date', 'timestamptz', col => col.notNull())
    .addColumn('location', 'text', col => col.notNull())
    .addColumn('coordinates', sql`point`) // PostGIS point type for lat/long
    .addColumn('season_id', 'uuid', col => col.notNull())
    .execute();

  // Create foreign key constraint for season_id
  await db.schema
    .alterTable('events')
    .addForeignKeyConstraint('fk_events_season_id', ['season_id'], 'seasons', ['id'])
    .onDelete('cascade')
    .execute();

  // Create the divisions table
  await db.schema
    .createTable('divisions')
    .addColumn('pk', 'serial', col => col.primaryKey())
    .addColumn('id', 'uuid', col =>
      col
        .notNull()
        .unique()
        .defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('name', 'text', col => col.notNull())
    .addColumn('event_id', 'uuid', col => col.notNull())
    .addColumn('color', 'text', col => col.notNull())
    .addColumn('pit_map_url', 'text')
    .addColumn('initialized', 'boolean', col => col.notNull().defaultTo(false))
    .addColumn('stagger_matches', 'boolean', col => col.notNull().defaultTo(false))
    .addColumn('allow_advancement', 'boolean', col => col.notNull().defaultTo(false))
    .addColumn('completed', 'boolean', col => col.notNull().defaultTo(false))
    .addColumn('published', 'boolean', col => col.notNull().defaultTo(false))
    .execute();

  // Create foreign key constraint for event_id
  await db.schema
    .alterTable('divisions')
    .addForeignKeyConstraint('fk_divisions_event_id', ['event_id'], 'events', ['id'])
    .onDelete('cascade')
    .execute();

  // Create indexes for events table
  await db.schema.createIndex('idx_events_id').on('events').column('id').execute();
  await db.schema.createIndex('idx_events_slug').on('events').column('slug').execute();
  await db.schema.createIndex('idx_events_season_id').on('events').column('season_id').execute();
  await db.schema
    .createIndex('idx_events_dates')
    .on('events')
    .columns(['start_date', 'end_date'])
    .execute();

  // Create indexes for divisions table
  await db.schema.createIndex('idx_divisions_id').on('divisions').column('id').execute();
  await db.schema
    .createIndex('idx_divisions_event_id')
    .on('divisions')
    .column('event_id')
    .execute();
  await db.schema
    .createIndex('idx_divisions_event_name')
    .on('divisions')
    .columns(['event_id', 'name'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop indexes for divisions table
  await db.schema.dropIndex('idx_divisions_id').ifExists().execute();
  await db.schema.dropIndex('idx_divisions_event_id').ifExists().execute();
  await db.schema.dropIndex('idx_divisions_event_name').ifExists().execute();

  // Drop indexes for events table
  await db.schema.dropIndex('idx_events_id').ifExists().execute();
  await db.schema.dropIndex('idx_events_slug').ifExists().execute();
  await db.schema.dropIndex('idx_events_season_id').ifExists().execute();
  await db.schema.dropIndex('idx_events_dates').ifExists().execute();

  // Drop the divisions table first (due to foreign key constraint)
  await db.schema.dropTable('divisions').execute();

  // Drop the events table
  await db.schema.dropTable('events').execute();
}
