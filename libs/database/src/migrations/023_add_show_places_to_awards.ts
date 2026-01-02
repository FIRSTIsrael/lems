/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('awards')
    .addColumn('show_places', 'boolean', col => col.notNull().defaultTo(true))
    .execute();

  // Awards to hide places for
  const shouldHide = [
    'lead-mentor',
    'volunteer-of-the-year',
    'breakthrough',
    'rising-all-star',
    'motivate',
    'judges-award',
    'impact',
    'excellence-in-engineering'
  ];

  // Automatically hide places for existing optional or personal awards
  await db
    .updateTable('awards')
    .set({ show_places: false })
    .where('name', 'in', shouldHide)
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('awards').dropColumn('show_places').execute();
}
