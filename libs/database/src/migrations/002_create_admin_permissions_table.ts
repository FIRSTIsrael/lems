/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Create the permission_type enum
  await db.schema
    .createType('permission_type')
    .asEnum([
      'MANAGE_SEASONS',
      'MANAGE_USERS',
      'MANAGE_EVENTS',
      'MANAGE_EVENT_DETAILS',
      'MANAGE_TEAMS',
      'VIEW_INSIGHTS'
    ])
    .execute();

  // Create the admin_permissions table
  await db.schema
    .createTable('admin_permissions')
    .addColumn('pk', 'serial', col => col.primaryKey())
    .addColumn('admin_id', 'uuid', col => col.notNull())
    .addColumn('permission', sql`permission_type`, col => col.notNull())
    .addColumn('granted_at', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
    .execute();

  // Add foreign key constraints
  await db.schema
    .alterTable('admin_permissions')
    .addForeignKeyConstraint('fk_admin_permissions_admin_id', ['admin_id'], 'admins', ['id'])
    .onDelete('cascade')
    .execute();

  // Add unique constraint to prevent duplicate permissions per admin
  await db.schema
    .alterTable('admin_permissions')
    .addUniqueConstraint('uk_admin_permissions_admin_permission', ['admin_id', 'permission'])
    .execute();

  // Create indexes for faster lookups
  await db.schema
    .createIndex('idx_admin_permissions_admin_id')
    .on('admin_permissions')
    .column('admin_id')
    .execute();

  await db.schema
    .createIndex('idx_admin_permissions_permission')
    .on('admin_permissions')
    .column('permission')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop the indexes if they exist
  await db.schema.dropIndex('idx_admin_permissions_admin_id').ifExists().execute();
  await db.schema.dropIndex('idx_admin_permissions_permission').ifExists().execute();

  // Drop the table
  await db.schema.dropTable('admin_permissions').execute();

  // Drop the enum type
  await sql`DROP TYPE IF EXISTS permission_type`.execute(db);
}
