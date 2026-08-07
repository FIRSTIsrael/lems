// Standalone job: embeds the game-rules corpus into Postgres (pgvector). Run via the
// `backend:build-embed-game-rules` target, then `node dist/apps/backend-embed-game-rules/main.js`.
import { OpenAIEmbeddings } from '@langchain/openai';
import database from '../../../database';
import {
  getChallengeKit,
  getFieldSetup,
  getGlossaryTerm,
  getGraciousProfessionalism,
  getMission,
  getRule,
  getTableInstructions,
  getUpdate,
  listGlossaryTerms,
  listMissions,
  listRules,
  listUpdates
} from './corpus';

interface CorpusDoc {
  docType: string;
  docId: string;
  title: string;
  content: string;
}

/** Recursively collects string leaves from a JSON value, for embedding free-form reference docs. */
function flattenText(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(flattenText);
  if (value && typeof value === 'object') {
    return Object.entries(value)
      .filter(([key]) => !key.startsWith('_'))
      .flatMap(([, v]) => flattenText(v));
  }
  return [];
}

function buildCorpusDocs(): CorpusDoc[] {
  const missions = listMissions().map(({ id }) => {
    const mission = getMission(id);
    if (!mission) throw new Error(`Missing mission: ${id}`);
    return {
      docType: 'mission',
      docId: mission.id,
      title: `${mission.nameEn} (${mission.nameHe})`,
      content: [
        mission.description,
        mission.scoringText,
        ...mission.clauses.map(clause => clause.description),
        ...mission.remarks,
        ...(mission.unofficialNotes ?? [])
      ].join('\n')
    };
  });

  const rules = listRules().map(({ id }) => {
    const rule = getRule(id);
    if (!rule) throw new Error(`Missing rule: ${id}`);
    return {
      docType: 'rule',
      docId: rule.id,
      title: `Rule ${rule.ruleNumber}`,
      content: rule.text
    };
  });

  const updates = listUpdates().map(({ id }) => {
    const update = getUpdate(id);
    if (!update) throw new Error(`Missing update: ${id}`);
    return { docType: 'update', docId: update.id, title: update.name, content: update.contents };
  });

  const glossaryTerms = listGlossaryTerms().map(({ id }) => {
    const term = getGlossaryTerm(id);
    if (!term) throw new Error(`Missing glossary term: ${id}`);
    return { docType: 'glossary', docId: term.id, title: term.termHe, content: term.definition };
  });

  const jsonReferenceDocs: CorpusDoc[] = (
    [
      {
        docType: 'challenge-kit',
        docId: 'challenge-kit',
        title: 'Challenge Kit',
        doc: getChallengeKit()
      },
      {
        docType: 'gracious-professionalism',
        docId: 'gracious-professionalism',
        title: 'Gracious Professionalism',
        doc: getGraciousProfessionalism()
      },
      {
        docType: 'table-instructions',
        docId: 'table-instructions',
        title: 'Table Instructions',
        doc: getTableInstructions()
      }
    ] satisfies Array<{ docType: string; docId: string; title: string; doc: unknown }>
  ).map(({ docType, docId, title, doc }) => ({
    docType,
    docId,
    title,
    content: flattenText(doc).join('\n')
  }));

  const fieldSetup: CorpusDoc = {
    docType: 'field-setup',
    docId: 'field-setup',
    title: 'Field Setup',
    content: getFieldSetup()
  };

  return [...missions, ...rules, ...updates, ...glossaryTerms, ...jsonReferenceDocs, fieldSetup];
}

async function main() {
  const docs = buildCorpusDocs();
  const embeddings = new OpenAIEmbeddings({ model: 'text-embedding-3-small' });

  console.log(`Embedding ${docs.length} game-rules documents...`);
  const vectors = await embeddings.embedDocuments(docs.map(doc => doc.content));

  await database.embeddings.upsertMany(
    'game-rules',
    docs.map((doc, index) => ({ ...doc, embedding: vectors[index] }))
  );

  console.log(`✅ Embedded ${docs.length} game-rules documents`);
}

main()
  .catch(error => {
    console.error('❌ Failed to embed game-rules corpus:', error);
    process.exitCode = 1;
  })
  .finally(() => database.disconnect());
