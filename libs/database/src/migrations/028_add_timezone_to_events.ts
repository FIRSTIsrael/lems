/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Add timezone column to events table (initially nullable)
  await db.schema.alterTable('events').addColumn('timezone', 'varchar').execute();

  // Set timezone values based on region
  await db
    .updateTable('events')
    .set({
      timezone: sql`CASE 
        WHEN region = 'IL' THEN 'Asia/Jerusalem'
        WHEN region = 'PL' THEN 'Europe/Warsaw'
        ELSE 'UTC'
      END`
    })
    .execute();

  // Make timezone column NOT NULL
  await db.schema
    .alterTable('events')
    .alterColumn('timezone', col => col.setNotNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Remove timezone column
  await db.schema.alterTable('events').dropColumn('timezone').execute();
}
