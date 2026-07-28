/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'lems-local';

const MONGO_COLLECTION = 'final_deliberations';

/**
 * Shape of documents that used to live in the `final_deliberations` MongoDB collection.
 */
interface LegacyFinalDeliberation {
  divisionId: string;
  stage: string;
  status: string;
  startTime: Date | null;
  completionTime: Date | null;
  awards: Record<string, unknown>;
  stageData: Record<string, unknown>;
}

export async function up(db: Kysely<any>): Promise<void> {
  // Create the final_deliberations table
  await db.schema
    .createTable('final_deliberations')
    .addColumn('pk', 'serial', col => col.primaryKey())
    .addColumn('id', 'uuid', col =>
      col
        .notNull()
        .unique()
        .defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('division_id', 'uuid', col => col.notNull())
    .addColumn('stage', 'text', col => col.notNull().defaultTo('champions'))
    .addColumn('status', 'text', col => col.notNull().defaultTo('not-started'))
    .addColumn('start_time', 'timestamptz')
    .addColumn('completion_time', 'timestamptz')
    .addColumn('awards', 'jsonb', col => col.notNull().defaultTo(sql`'{}'::jsonb`))
    .addColumn('stage_data', 'jsonb', col => col.notNull().defaultTo(sql`'{}'::jsonb`))
    .execute();

  // Create foreign key constraint for division_id
  await db.schema
    .alterTable('final_deliberations')
    .addForeignKeyConstraint('fk_final_deliberations_division_id', ['division_id'], 'divisions', [
      'id'
    ])
    .onDelete('cascade')
    .execute();

  // Create unique constraint for division_id (one final deliberation per division)
  await db.schema
    .alterTable('final_deliberations')
    .addUniqueConstraint('uq_final_deliberations_division_id', ['division_id'])
    .execute();

  // Create index
  await db.schema
    .createIndex('idx_final_deliberations_division_id')
    .on('final_deliberations')
    .column('division_id')
    .execute();

  // Migrate existing data from MongoDB's final_deliberations collection, if any is present
  const mongoClient = new MongoClient(MONGODB_URI, { tlsAllowInvalidCertificates: true });

  try {
    await mongoClient.connect();
    const mongoDb = mongoClient.db(DB_NAME);
    const collections = await mongoDb.listCollections({ name: MONGO_COLLECTION }).toArray();

    if (collections.length > 0) {
      const deliberations = await mongoDb
        .collection<LegacyFinalDeliberation>(MONGO_COLLECTION)
        .find({})
        .toArray();

      for (const deliberation of deliberations) {
        await db
          .insertInto('final_deliberations')
          .values({
            division_id: deliberation.divisionId,
            stage: deliberation.stage,
            status: deliberation.status,
            start_time: deliberation.startTime,
            completion_time: deliberation.completionTime,
            awards: JSON.stringify(deliberation.awards || {}),
            stage_data: JSON.stringify(deliberation.stageData || {})
          })
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
  await db.schema.dropIndex('idx_final_deliberations_division_id').ifExists().execute();
  await db.schema.dropTable('final_deliberations').ifExists().execute();
}
