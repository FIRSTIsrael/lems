/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Create the permission_type enum
  await db.schema
    .createType('permission_type')
    .asEnum([
      'MANAGE_USERS',
      'MANAGE_EVENTS',
      'MANAGE_EVENT_DETAILS',
      'MANAGE_TEAMS',
      'VIEW_INSIGHTS'
    ])
    .execute();

  // Create the user_permissions table
  await db.schema
    .createTable('user_permissions')
    .addColumn('pk', 'serial', col => col.primaryKey())
    .addColumn('user_id', 'uuid', col => col.notNull())
    .addColumn('permission', sql`permission_type`, col => col.notNull())
    .addColumn('granted_at', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
    .execute();

  // Add foreign key constraints
  await db.schema
    .alterTable('user_permissions')
    .addForeignKeyConstraint('fk_user_permissions_user_id', ['user_id'], 'users', ['id'])
    .onDelete('cascade')
    .execute();

  // Add unique constraint to prevent duplicate permissions per user
  await db.schema
    .alterTable('user_permissions')
    .addUniqueConstraint('uk_user_permissions_user_permission', ['user_id', 'permission'])
    .execute();

  // Create indexes for faster lookups
  await db.schema
    .createIndex('idx_user_permissions_user_id')
    .on('user_permissions')
    .column('user_id')
    .execute();

  await db.schema
    .createIndex('idx_user_permissions_permission')
    .on('user_permissions')
    .column('permission')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop the indexes if they exist
  await db.schema.dropIndex('idx_user_permissions_user_id').ifExists().execute();
  await db.schema.dropIndex('idx_user_permissions_permission').ifExists().execute();

  // Drop the table
  await db.schema.dropTable('user_permissions').execute();

  // Drop the enum type
  await sql`DROP TYPE IF EXISTS permission_type`.execute(db);
}
