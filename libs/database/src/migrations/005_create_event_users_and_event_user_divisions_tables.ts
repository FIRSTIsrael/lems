/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Create the event_users table
  await db.schema
    .createTable('event_users')
    .addColumn('pk', 'serial', col => col.primaryKey())
    .addColumn('id', 'uuid', col =>
      col
        .notNull()
        .unique()
        .defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('event_id', 'uuid', col => col.notNull())
    .addColumn('role', 'text', col => col.notNull())
    .addColumn('role_info', 'jsonb') // JSON field for role configuration
    .addColumn('password', 'varchar(4)', col => col.notNull())
    .execute();

  // Create foreign key constraint for event_id
  await db.schema
    .alterTable('event_users')
    .addForeignKeyConstraint('fk_event_users_event_id', ['event_id'], 'events', ['id'])
    .onDelete('cascade')
    .execute();

  // Create the event_user_divisions table (junction table)
  await db.schema
    .createTable('event_user_divisions')
    .addColumn('pk', 'serial', col => col.primaryKey())
    .addColumn('user_id', 'uuid', col => col.notNull())
    .addColumn('division_id', 'uuid', col => col.notNull())
    .execute();

  // Create foreign key constraint for user_id
  await db.schema
    .alterTable('event_user_divisions')
    .addForeignKeyConstraint('fk_event_user_divisions_user_id', ['user_id'], 'event_users', ['id'])
    .onDelete('cascade')
    .execute();

  // Create foreign key constraint for division_id
  await db.schema
    .alterTable('event_user_divisions')
    .addForeignKeyConstraint('fk_event_user_divisions_division_id', ['division_id'], 'divisions', [
      'id'
    ])
    .onDelete('cascade')
    .execute();

  // Add unique constraint to prevent duplicate user-division assignments
  await db.schema
    .alterTable('event_user_divisions')
    .addUniqueConstraint('uk_event_user_divisions_user_division', ['user_id', 'division_id'])
    .execute();

  // Create indexes for event_users table
  await db.schema.createIndex('idx_event_users_id').on('event_users').column('id').execute();
  await db.schema
    .createIndex('idx_event_users_event_id')
    .on('event_users')
    .column('event_id')
    .execute();
  await db.schema
    .createIndex('idx_event_users_event_role')
    .on('event_users')
    .columns(['event_id', 'role'])
    .execute();

  // Create indexes for event_user_divisions table
  await db.schema
    .createIndex('idx_event_user_divisions_user_id')
    .on('event_user_divisions')
    .column('user_id')
    .execute();
  await db.schema
    .createIndex('idx_event_user_divisions_division_id')
    .on('event_user_divisions')
    .column('division_id')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop indexes for event_user_divisions table
  await db.schema.dropIndex('idx_event_user_divisions_user_id').ifExists().execute();
  await db.schema.dropIndex('idx_event_user_divisions_division_id').ifExists().execute();

  // Drop indexes for event_users table
  await db.schema.dropIndex('idx_event_users_id').ifExists().execute();
  await db.schema.dropIndex('idx_event_users_event_id').ifExists().execute();
  await db.schema.dropIndex('idx_event_users_event_role').ifExists().execute();

  // Drop the event_user_divisions table first (due to foreign key constraint)
  await db.schema.dropTable('event_user_divisions').execute();

  // Drop the event_users table
  await db.schema.dropTable('event_users').execute();
}
