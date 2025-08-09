/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Create the team_divisions table (junction table)
  await db.schema
    .createTable('team_divisions')
    .addColumn('pk', 'serial', col => col.primaryKey())
    .addColumn('team_id', 'uuid', col => col.notNull())
    .addColumn('division_id', 'uuid', col => col.notNull())
    .addColumn('arrived', 'boolean', col => col.notNull().defaultTo(false))
    .addColumn('profile_document_url', 'text') // Nullable field for object storage URL
    .execute();

  // Create foreign key constraint for team_id
  await db.schema
    .alterTable('team_divisions')
    .addForeignKeyConstraint('fk_team_divisions_team_id', ['team_id'], 'teams', ['id'])
    .onDelete('cascade')
    .execute();

  // Create foreign key constraint for division_id
  await db.schema
    .alterTable('team_divisions')
    .addForeignKeyConstraint('fk_team_divisions_division_id', ['division_id'], 'divisions', ['id'])
    .onDelete('cascade')
    .execute();

  // Add unique constraint to prevent duplicate team-division assignments
  await db.schema
    .alterTable('team_divisions')
    .addUniqueConstraint('uk_team_divisions_team_division', ['team_id', 'division_id'])
    .execute();

  // Create the team_division_notifications table
  await db.schema
    .createTable('team_division_notifications')
    .addColumn('pk', 'serial', col => col.primaryKey())
    .addColumn('team_at_division_id', 'integer', col => col.notNull())
    .addColumn('phone_number', 'varchar(32)', col => col.notNull())
    .addColumn('active', 'boolean', col => col.notNull().defaultTo(true))
    .execute();

  // Create foreign key constraint for team_at_division_id
  await db.schema
    .alterTable('team_division_notifications')
    .addForeignKeyConstraint(
      'fk_team_division_notifications_team_at_division_id',
      ['team_at_division_id'],
      'team_divisions',
      ['pk']
    )
    .onDelete('cascade')
    .execute();

  // Create indexes for team_divisions table
  await db.schema
    .createIndex('idx_team_divisions_team_id')
    .on('team_divisions')
    .column('team_id')
    .execute();
  await db.schema
    .createIndex('idx_team_divisions_division_id')
    .on('team_divisions')
    .column('division_id')
    .execute();
  await db.schema
    .createIndex('idx_team_divisions_arrived')
    .on('team_divisions')
    .column('arrived')
    .execute();

  // Create indexes for team_division_notifications table
  await db.schema
    .createIndex('idx_team_division_notifications_team_at_division_id')
    .on('team_division_notifications')
    .column('team_at_division_id')
    .execute();
  await db.schema
    .createIndex('idx_team_division_notifications_phone_number')
    .on('team_division_notifications')
    .column('phone_number')
    .execute();
  await db.schema
    .createIndex('idx_team_division_notifications_active')
    .on('team_division_notifications')
    .column('active')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop indexes for team_division_notifications table
  await db.schema
    .dropIndex('idx_team_division_notifications_team_at_division_id')
    .ifExists()
    .execute();
  await db.schema.dropIndex('idx_team_division_notifications_phone_number').ifExists().execute();
  await db.schema.dropIndex('idx_team_division_notifications_active').ifExists().execute();

  // Drop indexes for team_divisions table
  await db.schema.dropIndex('idx_team_divisions_team_id').ifExists().execute();
  await db.schema.dropIndex('idx_team_divisions_division_id').ifExists().execute();
  await db.schema.dropIndex('idx_team_divisions_arrived').ifExists().execute();

  // Drop the team_division_notifications table first (due to foreign key constraint)
  await db.schema.dropTable('team_division_notifications').execute();

  // Drop the team_divisions table
  await db.schema.dropTable('team_divisions').execute();
}
