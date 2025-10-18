/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('admins')
    .dropColumn('password_salt')
    .execute();
  await db
    .updateTable('admins')
    .set({ password_hash: '' })
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('admins')
    .addColumn('password_salt', 'varchar(255)', col => col.notNull().defaultTo(''))
    .execute();
}
