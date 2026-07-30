/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely } from 'kysely';
import { MongoClient } from 'mongodb';

interface JudgingSessionStateDocument {
  sessionId: string;
  status: 'not-started' | 'in-progress' | 'completed';
  called: Date | null;
  queued: Date | null;
  startTime: Date | null;
  startDelta: number | null;
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://root:root@localhost:27017';
const DB_NAME = process.env.DB_NAME || 'lems-local';

export async function up(db: Kysely<any>): Promise<void> {
  // Add new columns to judging_sessions to hold the former MongoDB state
  await db.schema
    .alterTable('judging_sessions')
    .addColumn('status', 'varchar', col => col.notNull().defaultTo('not-started'))
    .addColumn('called', 'timestamptz')
    .addColumn('queued', 'timestamptz')
    .addColumn('start_time', 'timestamptz')
    .addColumn('start_delta', 'integer')
    .execute();

  // Migrate existing data from MongoDB's judging_session_states collection
  const mongoClient = new MongoClient(MONGODB_URI, { tlsAllowInvalidCertificates: true });

  try {
    await mongoClient.connect();
    const mongoDb = mongoClient.db(DB_NAME);
    const collections = await mongoDb.listCollections({ name: 'judging_session_states' }).toArray();

    if (collections.length > 0) {
      const states = await mongoDb
        .collection<JudgingSessionStateDocument>('judging_session_states')
        .find({})
        .toArray();

      for (const state of states) {
        await db
          .updateTable('judging_sessions')
          .set({
            status: state.status,
            called: state.called,
            queued: state.queued,
            start_time: state.startTime,
            start_delta: state.startDelta
          })
          .where('id', '=', state.sessionId)
          .execute();
      }

      await mongoDb.dropCollection('judging_session_states');
    }
  } finally {
    await mongoClient.close();
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('judging_sessions')
    .dropColumn('status')
    .dropColumn('called')
    .dropColumn('queued')
    .dropColumn('start_time')
    .dropColumn('start_delta')
    .execute();
}
