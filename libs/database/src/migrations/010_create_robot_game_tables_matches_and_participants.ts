/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Create the robot_game_match_stage enum
  await db.schema
    .createType('robot_game_match_stage')
    .asEnum(['PRACTICE', 'RANKING', 'TEST'])
    .execute();

  // Create the robot_game_tables table first
  await db.schema
    .createTable('robot_game_tables')
    .addColumn('pk', 'serial', col => col.primaryKey())
    .addColumn('id', 'uuid', col =>
      col
        .notNull()
        .unique()
        .defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('name', 'text', col => col.notNull())
    .addColumn('division_id', 'uuid', col => col.notNull())
    .execute();

  // Create foreign key constraint for division_id
  await db.schema
    .alterTable('robot_game_tables')
    .addForeignKeyConstraint('fk_robot_game_tables_division_id', ['division_id'], 'divisions', [
      'id'
    ])
    .onDelete('cascade')
    .execute();

  // Create the robot_game_matches table
  await db.schema
    .createTable('robot_game_matches')
    .addColumn('pk', 'serial', col => col.primaryKey())
    .addColumn('id', 'uuid', col =>
      col
        .notNull()
        .unique()
        .defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('round', 'integer', col => col.notNull())
    .addColumn('number', 'integer', col => col.notNull())
    .addColumn('stage', sql`robot_game_match_stage`, col => col.notNull())
    .addColumn('scheduled_time', 'timestamptz', col => col.notNull())
    .addColumn('division_id', 'uuid', col => col.notNull())
    .execute();

  // Create foreign key constraint for division_id
  await db.schema
    .alterTable('robot_game_matches')
    .addForeignKeyConstraint('fk_robot_game_matches_division_id', ['division_id'], 'divisions', [
      'id'
    ])
    .onDelete('cascade')
    .execute();

  // Add unique constraint for match number per division (global numbering within division)
  await db.schema
    .alterTable('robot_game_matches')
    .addUniqueConstraint('uk_robot_game_matches_division_number', ['division_id', 'number'])
    .execute();

  // Create the robot_game_match_participants table
  await db.schema
    .createTable('robot_game_match_participants')
    .addColumn('pk', 'serial', col => col.primaryKey())
    .addColumn('team_id', 'uuid', col => col.notNull())
    .addColumn('table_id', 'uuid', col => col.notNull())
    .addColumn('match_id', 'uuid', col => col.notNull())
    .execute();

  // Create foreign key constraint for team_id
  await db.schema
    .alterTable('robot_game_match_participants')
    .addForeignKeyConstraint('fk_robot_game_match_participants_team_id', ['team_id'], 'teams', [
      'id'
    ])
    .onDelete('cascade')
    .execute();

  // Create foreign key constraint for table_id
  await db.schema
    .alterTable('robot_game_match_participants')
    .addForeignKeyConstraint(
      'fk_robot_game_match_participants_table_id',
      ['table_id'],
      'robot_game_tables',
      ['id']
    )
    .onDelete('cascade')
    .execute();

  // Create foreign key constraint for match_id
  await db.schema
    .alterTable('robot_game_match_participants')
    .addForeignKeyConstraint(
      'fk_robot_game_match_participants_match_id',
      ['match_id'],
      'robot_game_matches',
      ['id']
    )
    .onDelete('cascade')
    .execute();

  // Add unique constraint to prevent duplicate team-match assignments
  await db.schema
    .alterTable('robot_game_match_participants')
    .addUniqueConstraint('uk_robot_game_match_participants_team_match', ['team_id', 'match_id'])
    .execute();

  // Add unique constraint to prevent multiple teams on same table for same match
  await db.schema
    .alterTable('robot_game_match_participants')
    .addUniqueConstraint('uk_robot_game_match_participants_table_match', ['table_id', 'match_id'])
    .execute();

  // Add check constraint to ensure team is competing in the match's division
  await db.schema
    .alterTable('robot_game_match_participants')
    .addCheckConstraint(
      'ck_robot_game_match_participants_team_in_division',
      sql`EXISTS (
        SELECT 1 FROM team_divisions td 
        JOIN robot_game_matches rgm ON rgm.id = robot_game_match_participants.match_id 
        WHERE td.team_id = robot_game_match_participants.team_id 
        AND td.division_id = rgm.division_id
      )`
    )
    .execute();

  // Add check constraint to ensure table belongs to the same division as the match
  await db.schema
    .alterTable('robot_game_match_participants')
    .addCheckConstraint(
      'ck_robot_game_match_participants_table_division_match',
      sql`(
        SELECT rgt.division_id FROM robot_game_tables rgt WHERE rgt.id = table_id
      ) = (
        SELECT rgm.division_id FROM robot_game_matches rgm WHERE rgm.id = match_id
      )`
    )
    .execute();

  // Create indexes for robot_game_tables table
  await db.schema
    .createIndex('idx_robot_game_tables_id')
    .on('robot_game_tables')
    .column('id')
    .execute();
  await db.schema
    .createIndex('idx_robot_game_tables_division_id')
    .on('robot_game_tables')
    .column('division_id')
    .execute();
  await db.schema
    .createIndex('idx_robot_game_tables_division_name')
    .on('robot_game_tables')
    .columns(['division_id', 'name'])
    .execute();

  // Create indexes for robot_game_matches table
  await db.schema
    .createIndex('idx_robot_game_matches_id')
    .on('robot_game_matches')
    .column('id')
    .execute();
  await db.schema
    .createIndex('idx_robot_game_matches_division_id')
    .on('robot_game_matches')
    .column('division_id')
    .execute();
  await db.schema
    .createIndex('idx_robot_game_matches_number')
    .on('robot_game_matches')
    .column('number')
    .execute();
  await db.schema
    .createIndex('idx_robot_game_matches_round')
    .on('robot_game_matches')
    .column('round')
    .execute();
  await db.schema
    .createIndex('idx_robot_game_matches_stage')
    .on('robot_game_matches')
    .column('stage')
    .execute();
  await db.schema
    .createIndex('idx_robot_game_matches_scheduled_time')
    .on('robot_game_matches')
    .column('scheduled_time')
    .execute();
  await db.schema
    .createIndex('idx_robot_game_matches_division_round')
    .on('robot_game_matches')
    .columns(['division_id', 'round'])
    .execute();
  await db.schema
    .createIndex('idx_robot_game_matches_division_stage')
    .on('robot_game_matches')
    .columns(['division_id', 'stage'])
    .execute();

  // Create indexes for robot_game_match_participants table
  await db.schema
    .createIndex('idx_robot_game_match_participants_team_id')
    .on('robot_game_match_participants')
    .column('team_id')
    .execute();
  await db.schema
    .createIndex('idx_robot_game_match_participants_table_id')
    .on('robot_game_match_participants')
    .column('table_id')
    .execute();
  await db.schema
    .createIndex('idx_robot_game_match_participants_match_id')
    .on('robot_game_match_participants')
    .column('match_id')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop indexes for robot_game_match_participants table
  await db.schema.dropIndex('idx_robot_game_match_participants_team_id').ifExists().execute();
  await db.schema.dropIndex('idx_robot_game_match_participants_table_id').ifExists().execute();
  await db.schema.dropIndex('idx_robot_game_match_participants_match_id').ifExists().execute();

  // Drop indexes for robot_game_matches table
  await db.schema.dropIndex('idx_robot_game_matches_id').ifExists().execute();
  await db.schema.dropIndex('idx_robot_game_matches_division_id').ifExists().execute();
  await db.schema.dropIndex('idx_robot_game_matches_number').ifExists().execute();
  await db.schema.dropIndex('idx_robot_game_matches_round').ifExists().execute();
  await db.schema.dropIndex('idx_robot_game_matches_stage').ifExists().execute();
  await db.schema.dropIndex('idx_robot_game_matches_scheduled_time').ifExists().execute();
  await db.schema.dropIndex('idx_robot_game_matches_division_round').ifExists().execute();
  await db.schema.dropIndex('idx_robot_game_matches_division_stage').ifExists().execute();

  // Drop indexes for robot_game_tables table
  await db.schema.dropIndex('idx_robot_game_tables_id').ifExists().execute();
  await db.schema.dropIndex('idx_robot_game_tables_division_id').ifExists().execute();
  await db.schema.dropIndex('idx_robot_game_tables_division_name').ifExists().execute();

  // Drop the robot_game_match_participants table first (due to foreign key constraints)
  await db.schema.dropTable('robot_game_match_participants').execute();

  // Drop the robot_game_matches table
  await db.schema.dropTable('robot_game_matches').execute();

  // Drop the robot_game_tables table
  await db.schema.dropTable('robot_game_tables').execute();

  // Drop the enum type
  await sql`DROP TYPE IF EXISTS robot_game_match_stage`.execute(db);
}
