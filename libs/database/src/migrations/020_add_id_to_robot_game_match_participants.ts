/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely';

/**
 * Migration to add UUID id column to robot_game_match_participants table.
 *
 * This migration:
 * 1. Adds an id column with UUID type and unique constraint
 * 2. Backfills existing records with random UUIDs
 * 3. Creates an index on the id column for query performance
 *
 * The id column becomes the primary external identifier for participants,
 * while pk remains as the internal database primary key.
 */
export async function up(db: Kysely<any>): Promise<void> {
  // Add id column with default gen_random_uuid() for new records
  await db.schema
    .alterTable('robot_game_match_participants')
    .addColumn('id', 'uuid', col => col.unique())
    .execute();

  // Backfill existing records with random UUIDs
  await sql`
    UPDATE robot_game_match_participants 
    SET id = gen_random_uuid() 
    WHERE id IS NULL
  `.execute(db);

  // Make id column NOT NULL after backfill
  await db.schema
    .alterTable('robot_game_match_participants')
    .alterColumn('id', col => col.setNotNull())
    .execute();

  // Create index on id column for query performance
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
