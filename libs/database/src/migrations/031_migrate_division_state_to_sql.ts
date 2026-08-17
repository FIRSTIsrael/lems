/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://root:root@localhost:27017';
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'lems-local';

const MONGO_COLLECTION = 'division_states';

/**
 * Shape of documents that used to live in the `division_states` MongoDB collection.
 */
interface LegacyDivisionState {
  divisionId: string;
  field?: {
    loadedMatch: string | null;
    activeMatch: string | null;
    currentStage: 'PRACTICE' | 'RANKING';
  };
  audienceDisplay?: {
    activeDisplay: string;
    awardsPresentation?: { slideIndex: number; stepIndex: number };
    settings?: Record<string, Record<string, unknown>>;
  };
}

export async function up(db: Kysely<any>): Promise<void> {
  // Add new column to divisions to hold what used to live in MongoDB.
  // Defaults to an empty object rather than a fully-populated default state - the
  // application layer (DivisionsRepository) is responsible for initializing the
  // default state shape on division creation, so this default never needs to change
  // in lockstep with future changes to the default state shape.
  await db.schema
    .alterTable('divisions')
    .addColumn('state', 'jsonb', col => col.notNull().defaultTo(sql`'{}'::jsonb`))
    .execute();

  // Migrate existing data from MongoDB's division_states collection, if any is present
  const mongoClient = new MongoClient(MONGODB_URI, { tlsAllowInvalidCertificates: true });

  try {
    await mongoClient.connect();
    const mongoDb = mongoClient.db(MONGO_DB_NAME);
    const collections = await mongoDb.listCollections({ name: MONGO_COLLECTION }).toArray();

    if (collections.length > 0) {
      const states = await mongoDb
        .collection<LegacyDivisionState>(MONGO_COLLECTION)
        .find({})
        .toArray();

      for (const state of states) {
        const { divisionId, ...rest } = state;
        await db
          .updateTable('divisions')
          .set({ state: JSON.stringify(rest) })
          .where('id', '=', divisionId)
          .execute();
      }

      // The MongoDB collection is no longer needed now that its data lives in SQL
      await mongoDb.collection(MONGO_COLLECTION).drop();
    }
  } finally {
    await mongoClient.close();
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  // Note: this only reverts the schema change. The MongoDB collection dropped in `up`
  // cannot be restored by this migration.
  await db.schema.alterTable('divisions').dropColumn('state').execute();
}
