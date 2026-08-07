import { Kysely, sql } from 'kysely';
import { KyselyDatabaseSchema } from '../schema/kysely';

export interface EmbeddingDoc {
  docType: string;
  docId: string;
  title: string;
  content: string;
  embedding: number[];
}

export interface EmbeddingMatch {
  docType: string;
  docId: string;
  title: string;
  content: string;
  score: number;
}

// pgvector has no native driver type; ship vectors as its textual literal format instead.
function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(',')}]`;
}

/**
 * Generic pgvector-backed embeddings store, shared by any AI feature that needs semantic search.
 * `namespace` scopes documents per feature (e.g. 'game-rules') so doc ids don't need to be globally unique.
 */
export class EmbeddingsRepository {
  constructor(private db: Kysely<KyselyDatabaseSchema>) {}

  async upsertMany(namespace: string, docs: EmbeddingDoc[]): Promise<void> {
    for (const doc of docs) {
      await sql`
        INSERT INTO embeddings (namespace, doc_type, doc_id, title, content, embedding, updated_at)
        VALUES (${namespace}, ${doc.docType}, ${doc.docId}, ${doc.title}, ${doc.content}, ${toVectorLiteral(doc.embedding)}::vector, now())
        ON CONFLICT (namespace, doc_type, doc_id)
        DO UPDATE SET title = excluded.title, content = excluded.content, embedding = excluded.embedding, updated_at = now()
      `.execute(this.db);
    }
  }

  async search(
    namespace: string,
    embedding: number[],
    topK: number,
    docTypes?: string[]
  ): Promise<EmbeddingMatch[]> {
    const vector = toVectorLiteral(embedding);
    const typeFilter = docTypes?.length ? sql`AND doc_type = ANY(${docTypes})` : sql``;

    const result = await sql<{
      doc_type: string;
      doc_id: string;
      title: string;
      content: string;
      score: number;
    }>`
      SELECT doc_type, doc_id, title, content, 1 - (embedding <=> ${vector}::vector) as score
      FROM embeddings
      WHERE namespace = ${namespace}
      ${typeFilter}
      ORDER BY embedding <=> ${vector}::vector
      LIMIT ${topK}
    `.execute(this.db);

    return result.rows.map(row => ({
      docType: row.doc_type,
      docId: row.doc_id,
      title: row.title,
      content: row.content,
      score: row.score
    }));
  }
}
