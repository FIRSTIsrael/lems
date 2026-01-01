/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Create the judging_deliberations table
  await db.schema
    .createTable('judging_deliberations')
    .addColumn('pk', 'serial', col => col.primaryKey())
    .addColumn('id', 'uuid', col =>
      col
        .notNull()
        .unique()
        .defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('division_id', 'uuid', col => col.notNull())
    .addColumn('category', 'text', col => col.notNull())
    .addColumn('status', 'text', col => col.notNull().defaultTo('not-started'))
    .addColumn('start_time', 'timestamptz')
    .addColumn('picklist', sql`text[]`, col => col.notNull().defaultTo(sql`'{}'`))
    .execute();

  // Create foreign key constraint for division_id
  await db.schema
    .alterTable('judging_deliberations')
    .addForeignKeyConstraint('fk_judging_deliberations_division_id', ['division_id'], 'divisions', [
      'id'
    ])
    .onDelete('cascade')
    .execute();

  // Create unique constraint for division_id + category
  await db.schema
    .alterTable('judging_deliberations')
    .addUniqueConstraint('uq_judging_deliberations_division_category', ['division_id', 'category'])
    .execute();

  // Create indexes
  await db.schema
    .createIndex('idx_judging_deliberations_id')
    .on('judging_deliberations')
    .column('id')
    .execute();
  await db.schema
    .createIndex('idx_judging_deliberations_division_id')
    .on('judging_deliberations')
    .column('division_id')
    .execute();

  // Add disqualified column to team_divisions table
  await db.schema
    .alterTable('team_divisions')
    .addColumn('disqualified', 'boolean', col => col.notNull().defaultTo(false))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop disqualified column from team_divisions
  await db.schema.alterTable('team_divisions').dropColumn('disqualified').execute();

  // Drop indexes
  await db.schema.dropIndex('idx_judging_deliberations_division_id').ifExists().execute();
  await db.schema.dropIndex('idx_judging_deliberations_id').ifExists().execute();

  // Drop table
  await db.schema.dropTable('judging_deliberations').ifExists().execute();
}
