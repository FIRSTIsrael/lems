import { tool } from 'langchain';
import { z } from 'zod';
import { OpenAIEmbeddings } from '@langchain/openai';
import database from '../../../../database';

const docTypeSchema = z.enum([
  'mission',
  'rule',
  'update',
  'glossary',
  'challenge-kit',
  'field-setup',
  'gracious-professionalism',
  'table-instructions'
]);

const NAMESPACE = 'game-rules';

// Lazily constructed - avoids requiring OPENAI_API_KEY for tools that never call this one.
let embeddings: OpenAIEmbeddings | undefined;
function getEmbeddings(): OpenAIEmbeddings {
  if (!embeddings) embeddings = new OpenAIEmbeddings({ model: 'text-embedding-3-small' });
  return embeddings;
}

export const semanticSearch = tool(
  async ({ query, types, topK }) => {
    const queryEmbedding = await getEmbeddings().embedQuery(query);
    const hits = await database.embeddings.search(NAMESPACE, queryEmbedding, topK ?? 5, types);
    return hits.map(hit => ({
      type: hit.docType,
      id: hit.docId,
      title: hit.title,
      snippet: hit.content.slice(0, 300),
      score: hit.score
    }));
  },
  {
    name: 'semantic_search',
    description:
      'Semantic search across missions, rules, updates, and reference docs (glossary, challenge kit, field setup, gracious professionalism, table instructions) when the user does not give a specific id (e.g. "that mission where you free seeds"). Returns ranked hits only - follow up with the matching read_*/get_* tool on the chosen id(s), never invent an id absent from the results.',
    schema: z.object({
      query: z.string().min(1),
      types: z.array(docTypeSchema).optional(),
      topK: z.number().int().min(1).max(10).optional()
    })
  }
);
