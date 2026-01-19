/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Add created_by column as nullable first
  await db.schema
    .alterTable('faqs')
    .addColumn('created_by', 'uuid')
    .execute();

  const firstAdmin = await db
    .selectFrom('admins')
    .select('id')
    .orderBy('created_at', 'asc')
    .executeTakeFirst();

  if (firstAdmin) {
    // Update existing FAQs with the first admin as creator
    await db
      .updateTable('faqs')
      .set({ created_by: firstAdmin.id })
      .where('created_by', 'is', null)
      .execute();
  }

  // Now make the column NOT NULL
  await db.schema
    .alterTable('faqs')
    .alterColumn('created_by', col => col.setNotNull())
    .execute();

  // Add foreign key constraint to admins table
  await db.schema
    .alterTable('faqs')
    .addForeignKeyConstraint('fk_faqs_created_by', ['created_by'], 'admins', ['id'])
    .onDelete('restrict')
    .execute();

  // Create index 
  await db.schema
    .createIndex('idx_faqs_created_by')
    .on('faqs')
    .column('created_by')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop
  await db.schema.dropIndex('idx_faqs_created_by').ifExists().execute();

  await db.schema
    .alterTable('faqs')
    .dropConstraint('fk_faqs_created_by')
    .ifExists()
    .execute();

  await db.schema
    .alterTable('faqs')
    .dropColumn('created_by')
    .execute();
}
