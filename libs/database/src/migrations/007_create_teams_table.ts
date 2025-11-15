/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Create the teams table
  await db.schema
    .createTable('teams')
    .addColumn('pk', 'serial', col => col.primaryKey())
    .addColumn('id', 'uuid', col =>
      col
        .notNull()
        .unique()
        .defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('name', 'varchar(64)', col => col.notNull())
    .addColumn('number', 'integer', col => col.notNull().unique())
    .addColumn('affiliation', 'text', col => col.notNull())
    .addColumn('city', 'text', col => col.notNull())
    .addColumn('coordinates', sql`point`) // PostGIS point type for lat/long
    .addColumn('logo_url', 'text')
    .execute();

  // Create indexes for teams table
  await db.schema.createIndex('idx_teams_id').on('teams').column('id').execute();
  await db.schema.createIndex('idx_teams_number').on('teams').column('number').execute(); // Unique index for fast lookups
  await db.schema.createIndex('idx_teams_name').on('teams').column('name').execute();
  await db.schema.createIndex('idx_teams_affiliation').on('teams').column('affiliation').execute();
  await db.schema.createIndex('idx_teams_city').on('teams').column('city').execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop indexes for teams table
  await db.schema.dropIndex('idx_teams_id').ifExists().execute();
  await db.schema.dropIndex('idx_teams_number').ifExists().execute();
  await db.schema.dropIndex('idx_teams_name').ifExists().execute();

  // Drop the teams table first (due to foreign key constraint)
  await db.schema.dropTable('teams').execute();
}
