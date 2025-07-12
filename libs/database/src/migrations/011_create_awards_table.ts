/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Create the award_type enum
  await db.schema.createType('award_type').asEnum(['PERSONAL', 'TEAM']).execute();

  // Create the awards table
  await db.schema
    .createTable('awards')
    .addColumn('pk', 'serial', col => col.primaryKey())
    .addColumn('id', 'uuid', col =>
      col
        .notNull()
        .unique()
        .defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('division_id', 'uuid', col => col.notNull())
    .addColumn('name', 'text', col => col.notNull())
    .addColumn('type', sql`award_type`, col => col.notNull())
    .addColumn('is_optional', 'boolean', col => col.notNull().defaultTo(false))
    .addColumn('allow_nominations', 'boolean', col => col.notNull().defaultTo(false))
    .addColumn('place', 'integer', col => col.notNull())
    .addColumn('winner_id', 'uuid') // Nullable - only for TEAM awards
    .addColumn('winner_name', 'varchar(64)') // Nullable - only for PERSONAL awards
    .execute();

  // Create foreign key constraint for division_id
  await db.schema
    .alterTable('awards')
    .addForeignKeyConstraint('fk_awards_division_id', ['division_id'], 'divisions', ['id'])
    .onDelete('cascade')
    .execute();

  // Create foreign key constraint for winner_id (when not null)
  await db.schema
    .alterTable('awards')
    .addForeignKeyConstraint('fk_awards_winner_id', ['winner_id'], 'teams', ['id'])
    .onDelete('set null') // Allow setting to null if team is deleted
    .execute();

  // Add check constraint: PERSONAL awards cannot have winner_id
  await db.schema
    .alterTable('awards')
    .addCheckConstraint(
      'ck_awards_personal_no_winner_id',
      sql`(type = 'PERSONAL' AND winner_id IS NULL) OR type = 'TEAM'`
    )
    .execute();

  // Add check constraint: TEAM awards cannot have winner_name
  await db.schema
    .alterTable('awards')
    .addCheckConstraint(
      'ck_awards_team_no_winner_name',
      sql`(type = 'TEAM' AND winner_name IS NULL) OR type = 'PERSONAL'`
    )
    .execute();

  // Add check constraint: Awards must have exactly one winner type
  await db.schema
    .alterTable('awards')
    .addCheckConstraint(
      'ck_awards_exactly_one_winner',
      sql`(winner_id IS NULL) <> (winner_name IS NULL)`
    )
    .execute();

  // Add check constraint: Place must be positive
  await db.schema
    .alterTable('awards')
    .addCheckConstraint('ck_awards_positive_place', sql`place > 0`)
    .execute();

  // Create trigger function to validate team awards are in the correct division
  await sql`
    CREATE OR REPLACE FUNCTION validate_award_team_division()
    RETURNS TRIGGER AS $$
    BEGIN
      -- Check that team awards have winner in the same division
      IF NEW.type = 'TEAM' AND NEW.winner_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM team_divisions WHERE team_id = NEW.winner_id AND division_id = NEW.division_id) THEN
          RAISE EXCEPTION 'Team award winner must be competing in the same division';
        END IF;
      END IF;
      
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db);

  // Create trigger for awards table
  await sql`
    CREATE TRIGGER tr_validate_award_team_division
    BEFORE INSERT OR UPDATE ON awards
    FOR EACH ROW EXECUTE FUNCTION validate_award_team_division();
  `.execute(db);

  // Add unique constraint to prevent duplicate awards for same division/name/place
  await db.schema
    .alterTable('awards')
    .addUniqueConstraint('uk_awards_division_name_place', ['division_id', 'name', 'place'])
    .execute();

  // Create indexes for awards table
  await db.schema.createIndex('idx_awards_id').on('awards').column('id').execute();
  await db.schema
    .createIndex('idx_awards_division_id')
    .on('awards')
    .column('division_id')
    .execute();
  await db.schema.createIndex('idx_awards_type').on('awards').column('type').execute();
  await db.schema.createIndex('idx_awards_winner_id').on('awards').column('winner_id').execute();
  await db.schema.createIndex('idx_awards_place').on('awards').column('place').execute();
  await db.schema
    .createIndex('idx_awards_division_type')
    .on('awards')
    .columns(['division_id', 'type'])
    .execute();
  await db.schema
    .createIndex('idx_awards_division_place')
    .on('awards')
    .columns(['division_id', 'place'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop indexes
  await db.schema.dropIndex('idx_awards_id').ifExists().execute();
  await db.schema.dropIndex('idx_awards_division_id').ifExists().execute();
  await db.schema.dropIndex('idx_awards_type').ifExists().execute();
  await db.schema.dropIndex('idx_awards_winner_id').ifExists().execute();
  await db.schema.dropIndex('idx_awards_place').ifExists().execute();
  await db.schema.dropIndex('idx_awards_division_type').ifExists().execute();
  await db.schema.dropIndex('idx_awards_division_place').ifExists().execute();

  // Drop trigger and function
  await sql`DROP TRIGGER IF EXISTS tr_validate_award_team_division ON awards`.execute(db);
  await sql`DROP FUNCTION IF EXISTS validate_award_team_division()`.execute(db);

  // Drop the table
  await db.schema.dropTable('awards').execute();

  // Drop the enum type
  await sql`DROP TYPE IF EXISTS award_type`.execute(db);
}
