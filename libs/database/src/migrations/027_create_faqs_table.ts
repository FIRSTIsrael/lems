/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Create the faqs table
  await db.schema
    .createTable('faqs')
    .addColumn('pk', 'serial', col => col.primaryKey())
    .addColumn('id', 'uuid', col => col.notNull().defaultTo(sql`gen_random_uuid()`).unique())
    .addColumn('season_id', 'uuid', col => col.notNull())
    .addColumn('question', 'text', col => col.notNull())
    .addColumn('answer', 'text', col => col.notNull())
    .addColumn('display_order', 'integer', col => col.notNull().defaultTo(0))
    .addColumn('created_at', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
    .execute();

  // Add foreign key constraint to seasons table
  await db.schema
    .alterTable('faqs')
    .addForeignKeyConstraint('fk_faqs_season_id', ['season_id'], 'seasons', ['id'])
    .onDelete('cascade')
    .execute();

  // Create indexes for faster lookups
  await db.schema
    .createIndex('idx_faqs_season_id')
    .on('faqs')
    .column('season_id')
    .execute();

  await db.schema
    .createIndex('idx_faqs_display_order')
    .on('faqs')
    .columns(['season_id', 'display_order'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop the indexes
  await db.schema.dropIndex('idx_faqs_season_id').ifExists().execute();
  await db.schema.dropIndex('idx_faqs_display_order').ifExists().execute();

  // Drop the table
  await db.schema.dropTable('faqs').ifExists().execute();
}
