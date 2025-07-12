/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Create the judging_rooms table first (since judging_sessions reference it)
  await db.schema
    .createTable('judging_rooms')
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
    .alterTable('judging_rooms')
    .addForeignKeyConstraint('fk_judging_rooms_division_id', ['division_id'], 'divisions', ['id'])
    .onDelete('cascade')
    .execute();

  // Create the judging_sessions table
  await db.schema
    .createTable('judging_sessions')
    .addColumn('pk', 'serial', col => col.primaryKey())
    .addColumn('id', 'uuid', col =>
      col
        .notNull()
        .unique()
        .defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('number', 'integer', col => col.notNull())
    .addColumn('team_id', 'uuid', col => col.notNull())
    .addColumn('room_id', 'uuid', col => col.notNull())
    .addColumn('division_id', 'uuid', col => col.notNull())
    .addColumn('scheduled_time', 'timestamptz', col => col.notNull())
    .execute();

  // Create foreign key constraint for team_id
  await db.schema
    .alterTable('judging_sessions')
    .addForeignKeyConstraint('fk_judging_sessions_team_id', ['team_id'], 'teams', ['id'])
    .onDelete('cascade')
    .execute();

  // Create foreign key constraint for room_id
  await db.schema
    .alterTable('judging_sessions')
    .addForeignKeyConstraint('fk_judging_sessions_room_id', ['room_id'], 'judging_rooms', ['id'])
    .onDelete('cascade')
    .execute();

  // Create foreign key constraint for division_id
  await db.schema
    .alterTable('judging_sessions')
    .addForeignKeyConstraint('fk_judging_sessions_division_id', ['division_id'], 'divisions', [
      'id'
    ])
    .onDelete('cascade')
    .execute();

  // Create trigger function to validate judging session data integrity
  await sql`
    CREATE OR REPLACE FUNCTION validate_judging_session()
    RETURNS TRIGGER AS $$
    BEGIN
      -- Check that division_id matches the room's division
      IF NEW.division_id != (SELECT division_id FROM judging_rooms WHERE id = NEW.room_id) THEN
        RAISE EXCEPTION 'Division ID must match the room''s division';
      END IF;
      
      -- Check that team is competing in the division
      IF NOT EXISTS (SELECT 1 FROM team_divisions WHERE team_id = NEW.team_id AND division_id = NEW.division_id) THEN
        RAISE EXCEPTION 'Team must be competing in the specified division';
      END IF;
      
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db);

  // Create trigger for judging_sessions table
  await sql`
    CREATE TRIGGER tr_validate_judging_session
    BEFORE INSERT OR UPDATE ON judging_sessions
    FOR EACH ROW EXECUTE FUNCTION validate_judging_session();
  `.execute(db);

  // Add unique constraint to prevent duplicate session numbers per room
  await db.schema
    .alterTable('judging_sessions')
    .addUniqueConstraint('uk_judging_sessions_room_number', ['room_id', 'number'])
    .execute();

  // Create indexes for judging_rooms table
  await db.schema.createIndex('idx_judging_rooms_id').on('judging_rooms').column('id').execute();
  await db.schema
    .createIndex('idx_judging_rooms_division_id')
    .on('judging_rooms')
    .column('division_id')
    .execute();
  await db.schema
    .createIndex('idx_judging_rooms_division_name')
    .on('judging_rooms')
    .columns(['division_id', 'name'])
    .execute();

  // Create indexes for judging_sessions table
  await db.schema
    .createIndex('idx_judging_sessions_id')
    .on('judging_sessions')
    .column('id')
    .execute();
  await db.schema
    .createIndex('idx_judging_sessions_team_id')
    .on('judging_sessions')
    .column('team_id')
    .execute();
  await db.schema
    .createIndex('idx_judging_sessions_room_id')
    .on('judging_sessions')
    .column('room_id')
    .execute();
  await db.schema
    .createIndex('idx_judging_sessions_division_id')
    .on('judging_sessions')
    .column('division_id')
    .execute();
  await db.schema
    .createIndex('idx_judging_sessions_scheduled_time')
    .on('judging_sessions')
    .column('scheduled_time')
    .execute();
  await db.schema
    .createIndex('idx_judging_sessions_room_time')
    .on('judging_sessions')
    .columns(['room_id', 'scheduled_time'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop indexes for judging_sessions table
  await db.schema.dropIndex('idx_judging_sessions_id').ifExists().execute();
  await db.schema.dropIndex('idx_judging_sessions_team_id').ifExists().execute();
  await db.schema.dropIndex('idx_judging_sessions_room_id').ifExists().execute();
  await db.schema.dropIndex('idx_judging_sessions_division_id').ifExists().execute();
  await db.schema.dropIndex('idx_judging_sessions_scheduled_time').ifExists().execute();
  await db.schema.dropIndex('idx_judging_sessions_room_time').ifExists().execute();

  // Drop indexes for judging_rooms table
  await db.schema.dropIndex('idx_judging_rooms_id').ifExists().execute();
  await db.schema.dropIndex('idx_judging_rooms_division_id').ifExists().execute();
  await db.schema.dropIndex('idx_judging_rooms_division_name').ifExists().execute();

  // Drop trigger and function
  await sql`DROP TRIGGER IF EXISTS tr_validate_judging_session ON judging_sessions`.execute(db);
  await sql`DROP FUNCTION IF EXISTS validate_judging_session()`.execute(db);

  // Drop the judging_sessions table first (due to foreign key constraint)
  await db.schema.dropTable('judging_sessions').execute();

  // Drop the judging_rooms table
  await db.schema.dropTable('judging_rooms').execute();
}
