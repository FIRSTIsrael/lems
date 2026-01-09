/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Drop the existing foreign key constraint with CASCADE delete behavior
  await db.schema
    .alterTable('team_divisions')
    .dropConstraint('fk_team_divisions_team_id')
    .execute();

  // Add the new foreign key constraint with RESTRICT delete behavior
  // This prevents deletion of a team if it's registered to any division
  await db.schema
    .alterTable('team_divisions')
    .addForeignKeyConstraint('fk_team_divisions_team_id', ['team_id'], 'teams', ['id'])
    .onDelete('restrict')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop the RESTRICT foreign key constraint
  await db.schema
    .alterTable('team_divisions')
    .dropConstraint('fk_team_divisions_team_id')
    .execute();

  // Restore the original CASCADE delete behavior
  await db.schema
    .alterTable('team_divisions')
    .addForeignKeyConstraint('fk_team_divisions_team_id', ['team_id'], 'teams', ['id'])
    .onDelete('cascade')
    .execute();
}
