/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely } from 'kysely';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'lems-local';

const MONGO_COLLECTION = 'robot_game_match_states';

/**
 * Shape of documents that used to live in the `robot_game_match_states` MongoDB collection.
 *
 * Note: despite the field name `participants` implying it is keyed by participant ID,
 * in practice these documents were keyed by `table_id` (see the "Tech debt" comment that
 * used to live in the participant status resolver). The migration below relies on that
 * real-world behavior rather than the (incorrect) type documentation.
 */
interface LegacyRobotGameMatchParticipantState {
  queued: Date | null;
  present: Date | null;
  ready: Date | null;
}

interface LegacyRobotGameMatchState {
  matchId: string;
  status: 'not-started' | 'in-progress' | 'completed';
  called: Date | null;
  startTime: Date | null;
  startDelta: number | null;
  participants: Record<string, LegacyRobotGameMatchParticipantState>;
}

export async function up(db: Kysely<any>): Promise<void> {
  // Add new columns to robot_game_matches to hold what used to live in MongoDB.
  // The status enum is enforced server-side (TypeScript) rather than as a Postgres enum type,
  // consistent with other status-like columns (e.g. robot_game_match_stage is the exception,
  // not the rule).
  await db.schema
    .alterTable('robot_game_matches')
    .addColumn('status', 'text', col => col.notNull().defaultTo('not-started'))
    .addColumn('called', 'timestamptz')
    .addColumn('start_time', 'timestamptz')
    .addColumn('start_delta', 'integer')
    .execute();

  // Add new columns to robot_game_match_participants to hold per-participant status
  await db.schema
    .alterTable('robot_game_match_participants')
    .addColumn('queued', 'timestamptz')
    .addColumn('present', 'timestamptz')
    .addColumn('ready', 'timestamptz')
    .execute();

  // Migrate existing data from MongoDB, if any is present
  const mongoClient = new MongoClient(MONGODB_URI);

  try {
    await mongoClient.connect();
    const mongoDb = mongoClient.db(DB_NAME);
    const collections = await mongoDb.listCollections({ name: MONGO_COLLECTION }).toArray();

    if (collections.length > 0) {
      const states = await mongoDb
        .collection<LegacyRobotGameMatchState>(MONGO_COLLECTION)
        .find({})
        .toArray();

      for (const state of states) {
        await db
          .updateTable('robot_game_matches')
          .set({
            status: state.status,
            called: state.called,
            start_time: state.startTime,
            start_delta: state.startDelta
          })
          .where('id', '=', state.matchId)
          .execute();

        for (const [tableId, participantState] of Object.entries(state.participants || {})) {
          await db
            .updateTable('robot_game_match_participants')
            .set({
              queued: participantState.queued,
              present: participantState.present,
              ready: participantState.ready
            })
            .where('match_id', '=', state.matchId)
            .where('table_id', '=', tableId)
            .execute();
        }
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
  await db.schema.alterTable('robot_game_match_participants').dropColumn('queued').execute();
  await db.schema.alterTable('robot_game_match_participants').dropColumn('present').execute();
  await db.schema.alterTable('robot_game_match_participants').dropColumn('ready').execute();

  await db.schema.alterTable('robot_game_matches').dropColumn('status').execute();
  await db.schema.alterTable('robot_game_matches').dropColumn('called').execute();
  await db.schema.alterTable('robot_game_matches').dropColumn('start_time').execute();
  await db.schema.alterTable('robot_game_matches').dropColumn('start_delta').execute();
}
