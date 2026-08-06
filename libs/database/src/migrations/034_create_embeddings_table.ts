/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Requires superuser-installed pgvector on the server; extension creation itself needs no extra privilege beyond CREATE.
  await sql`CREATE EXTENSION IF NOT EXISTS vector`.execute(db);

  await db.schema
    .createTable('embeddings')
    .addColumn('pk', 'serial', col => col.primaryKey())
    // Namespace scopes docs by feature (e.g. 'game-rules') so multiple AI features can share this table.
    .addColumn('namespace', 'varchar', col => col.notNull())
    .addColumn('doc_type', 'varchar', col => col.notNull())
    .addColumn('doc_id', 'varchar', col => col.notNull())
    .addColumn('title', 'varchar', col => col.notNull())
    .addColumn('content', 'text', col => col.notNull())
    .addColumn('embedding', sql`vector(1536)`, col => col.notNull())
    .addColumn('updated_at', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .alterTable('embeddings')
    .addUniqueConstraint('uq_embeddings_doc', ['namespace', 'doc_type', 'doc_id'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('embeddings').ifExists().execute();
}
