import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('divisions')
    .addColumn('awards_assigned', 'boolean', col => col.notNull().defaultTo(false))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('divisions').dropColumn('awards_assigned').execute();
}
