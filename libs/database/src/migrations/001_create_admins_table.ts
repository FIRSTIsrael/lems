/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Create the admins table with the specified columns and constraints
  await db.schema
    .createTable('admins')
    .addColumn('pk', 'serial', col => col.primaryKey())
    .addColumn('id', 'uuid', col =>
      col
        .notNull()
        .unique()
        .defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('username', 'varchar(32)', col => col.notNull().unique())
    .addColumn('password_hash', 'varchar(255)', col => col.notNull())
    .addColumn('password_salt', 'varchar(255)', col => col.notNull())
    .addColumn('first_name', 'varchar(64)', col => col.notNull())
    .addColumn('last_name', 'varchar(64)', col => col.notNull())
    .addColumn('last_login', 'timestamptz')
    .addColumn('last_password_set_date', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('created_at', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('last_updated', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
    .execute();

  //Create an index on the id column for faster lookups
  await db.schema.createIndex('idx_admins_id').on('admins').column('id').execute();

  // Create an index on the username column for faster lookups
  await db.schema.createIndex('idx_admins_username').on('admins').column('username').execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('admins').execute();
  // Drop the indexes if they exist
  await db.schema.dropIndex('idx_admins_id').ifExists().execute();
  await db.schema.dropIndex('idx_admins_username').ifExists().execute();
}
