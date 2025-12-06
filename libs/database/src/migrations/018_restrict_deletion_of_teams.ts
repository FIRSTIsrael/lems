/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Drop old constraints
  await db.schema
    .alterTable('team_divisions')
    .dropConstraint('fk_team_divisions_team_id')
    .execute();

  await db.schema
    .alterTable('team_divisions')
    .dropConstraint('fk_team_divisions_division_id')
    .execute();

  await db.schema
    .alterTable('team_division_notifications')
    .dropConstraint('fk_team_division_notifications_team_at_division_id')
    .execute();

  // Recreate FKs with RESTRICT deletion behavior
  await db.schema
    .alterTable('team_divisions')
    .addForeignKeyConstraint('fk_team_divisions_team_id', ['team_id'], 'teams', ['id'])
    .onDelete('restrict')
    .execute();

  await db.schema
    .alterTable('team_divisions')
    .addForeignKeyConstraint('fk_team_divisions_division_id', ['division_id'], 'divisions', ['id'])
    .onDelete('restrict')
    .execute();

  await db.schema
    .alterTable('team_division_notifications')
    .addForeignKeyConstraint(
      'fk_team_division_notifications_team_at_division_id',
      ['team_at_division_id'],
      'team_divisions',
      ['pk']
    )
    .onDelete('restrict')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop the RESTRICT constraints
  await db.schema
    .alterTable('team_divisions')
    .dropConstraint('fk_team_divisions_team_id')
    .execute();

  await db.schema
    .alterTable('team_divisions')
    .dropConstraint('fk_team_divisions_division_id')
    .execute();

  await db.schema
    .alterTable('team_division_notifications')
    .dropConstraint('fk_team_division_notifications_team_at_division_id')
    .execute();

  // Recreate original CASCADE constraints
  await db.schema
    .alterTable('team_divisions')
    .addForeignKeyConstraint('fk_team_divisions_team_id', ['team_id'], 'teams', ['id'])
    .onDelete('cascade')
    .execute();

  await db.schema
    .alterTable('team_divisions')
    .addForeignKeyConstraint('fk_team_divisions_division_id', ['division_id'], 'divisions', ['id'])
    .onDelete('cascade')
    .execute();

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
}
