/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Create the team_affiliations table first (since teams reference it)
  await db.schema
    .createTable('team_affiliations')
    .addColumn('pk', 'serial', col => col.primaryKey())
    .addColumn('id', 'uuid', col =>
      col
        .notNull()
        .unique()
        .defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('name', 'text', col => col.notNull())
    .addColumn('city', 'text', col => col.notNull())
    .addColumn('coordinates', sql`point`) // PostGIS point type for lat/long
    .execute();

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
    .addColumn('affiliation_id', 'uuid', col => col.notNull())
    .execute();

  // Create foreign key constraint for affiliation_id
  await db.schema
    .alterTable('teams')
    .addForeignKeyConstraint('fk_teams_affiliation_id', ['affiliation_id'], 'team_affiliations', [
      'id'
    ])
    .onDelete('restrict') // Don't allow deleting affiliations with teams
    .execute();

  // Create indexes for team_affiliations table
  await db.schema
    .createIndex('idx_team_affiliations_id')
    .on('team_affiliations')
    .column('id')
    .execute();
  await db.schema
    .createIndex('idx_team_affiliations_name')
    .on('team_affiliations')
    .column('name')
    .execute();
  await db.schema
    .createIndex('idx_team_affiliations_city')
    .on('team_affiliations')
    .column('city')
    .execute();

  // Create indexes for teams table
  await db.schema.createIndex('idx_teams_id').on('teams').column('id').execute();
  await db.schema.createIndex('idx_teams_number').on('teams').column('number').execute(); // Unique index for fast lookups
  await db.schema
    .createIndex('idx_teams_affiliation_id')
    .on('teams')
    .column('affiliation_id')
    .execute();
  await db.schema.createIndex('idx_teams_name').on('teams').column('name').execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop indexes for teams table
  await db.schema.dropIndex('idx_teams_id').ifExists().execute();
  await db.schema.dropIndex('idx_teams_number').ifExists().execute();
  await db.schema.dropIndex('idx_teams_affiliation_id').ifExists().execute();
  await db.schema.dropIndex('idx_teams_name').ifExists().execute();

  // Drop indexes for team_affiliations table
  await db.schema.dropIndex('idx_team_affiliations_id').ifExists().execute();
  await db.schema.dropIndex('idx_team_affiliations_name').ifExists().execute();
  await db.schema.dropIndex('idx_team_affiliations_city').ifExists().execute();

  // Drop the teams table first (due to foreign key constraint)
  await db.schema.dropTable('teams').execute();

  // Drop the team_affiliations table
  await db.schema.dropTable('team_affiliations').execute();
}
