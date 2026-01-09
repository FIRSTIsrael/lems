/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely';

/**
 * Migration to fix the id column in robot_game_match_participants table.
 *
 * The previous migration created the id column but didn't set a default value.
 * This migration:
 * 1. Drops the existing id column
 * 2. Recreates it with gen_random_uuid() as the default value
 * 3. This matches the pattern used for id columns throughout the app
 */
export async function up(db: Kysely<any>): Promise<void> {
  // Drop the existing id column (including its index)
  await db.schema.alterTable('robot_game_match_participants').dropColumn('id').execute();

  // Recreate id column with proper auto-generation default
  await db.schema
    .alterTable('robot_game_match_participants')
    .addColumn('id', 'uuid', col =>
      col
        .notNull()
        .unique()
        .defaultTo(sql`gen_random_uuid()`)
    )
    .execute();

  // Recreate index on id column for query performance
  await db.schema
    .createIndex('idx_robot_game_match_participants_id')
    .on('robot_game_match_participants')
    .column('id')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop index
  await db.schema.dropIndex('idx_robot_game_match_participants_id').execute();

  // Drop id column
  await db.schema.alterTable('robot_game_match_participants').dropColumn('id').execute();
}
