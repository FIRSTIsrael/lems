import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('practice_tables_config')
    .addColumn('start_time', 'varchar(5)', col => col.notNull().defaultTo('07:00'))
    .addColumn('end_time', 'varchar(5)', col => col.notNull().defaultTo('19:00'))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('practice_tables_config')
    .dropColumn('start_time')
    .dropColumn('end_time')
    .execute();
}
