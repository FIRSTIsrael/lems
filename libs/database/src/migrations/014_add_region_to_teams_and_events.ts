/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Add region field to teams table
  await db.schema
    .alterTable('teams')
    .addColumn('region', 'varchar(2)', col => col.notNull().defaultTo('IL'))
    .execute();

  // Drop the unique index on teams.number since it will no longer be unique
  await db.schema.dropIndex('idx_teams_number').ifExists().execute();

  // Create a new non-unique index on teams.number
  await db.schema.createIndex('idx_teams_number').on('teams').column('number').execute();

  // Add number + region unique constraint
  await db.schema
    .createIndex('idx_teams_number_region_unique')
    .on('teams')
    .columns(['number', 'region'])
    .unique()
    .execute();

  // Add region index to teams
  await db.schema.createIndex('idx_teams_region').on('teams').column('region').execute();

  // Add region field to events table
  await db.schema
    .alterTable('events')
    .addColumn('region', 'varchar(2)', col => col.notNull().defaultTo('IL'))
    .execute();

  // Add region index to events
  await db.schema.createIndex('idx_events_region').on('events').column('region').execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Remove indexes from events
  await db.schema.dropIndex('idx_events_region').ifExists().execute();

  // Remove region field from events
  await db.schema.alterTable('events').dropColumn('region').execute();

  // Remove indexes from teams
  await db.schema.dropIndex('idx_teams_region').ifExists().execute();
  await db.schema.dropIndex('idx_teams_number_region_unique').ifExists().execute();
  await db.schema.dropIndex('idx_teams_number').ifExists().execute();

  // Recreate the unique index on teams.number
  await db.schema.createIndex('idx_teams_number').on('teams').column('number').unique().execute();

  // Remove region field from teams
  await db.schema.alterTable('teams').dropColumn('region').execute();
}
