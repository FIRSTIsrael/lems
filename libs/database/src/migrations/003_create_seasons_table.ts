/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Create the seasons table with the specified columns and constraints
  await db.schema
    .createTable('seasons')
    .addColumn('pk', 'serial', col => col.primaryKey())
    .addColumn('id', 'uuid', col =>
      col
        .notNull()
        .unique()
        .defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('slug', 'text', col => col.notNull().unique())
    .addColumn('name', 'text', col => col.notNull())
    .addColumn('start_date', 'timestamptz', col => col.notNull())
    .addColumn('end_date', 'timestamptz', col => col.notNull())
    .addColumn('logo_url', 'text')
    .execute();

  // Create an index on the id column for faster lookups
  await db.schema.createIndex('idx_seasons_id').on('seasons').column('id').execute();

  // Create an index on the slug column for faster lookups (since it's used for queries and URLs)
  await db.schema.createIndex('idx_seasons_slug').on('seasons').column('slug').execute();

  // Create an index on the date range for time-based queries
  await db.schema
    .createIndex('idx_seasons_dates')
    .on('seasons')
    .columns(['start_date', 'end_date'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop the indexes if they exist
  await db.schema.dropIndex('idx_seasons_id').ifExists().execute();
  await db.schema.dropIndex('idx_seasons_slug').ifExists().execute();
  await db.schema.dropIndex('idx_seasons_dates').ifExists().execute();

  // Drop the table
  await db.schema.dropTable('seasons').execute();
}
