import { Kysely } from 'kysely';
import { Db as MongoDb } from 'mongodb';
import { KyselyDatabaseSchema } from '../schema/kysely';
import { JudgingSession, UpdateableJudgingSession } from '../schema/tables/judging-sessions';
import { JudgingSessionState } from '../schema/documents/judging-session-state';

export class JudgingSessionStateSelector {
  constructor(
    private db: MongoDb,
    private id: string
  ) {}

  async get() {
    return this.db
      .collection<JudgingSessionState>('judging_session_states')
      .findOne({ sessionId: this.id });
  }
}

export class JudgingSessionSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private mongo: MongoDb,
    private id: string
  ) {}

  private getSessionQuery() {
    return this.db.selectFrom('judging_sessions').selectAll().where('id', '=', this.id);
  }

  async get() {
    const session = await this.getSessionQuery().executeTakeFirst();
    return session || null;
  }

  update(updates: UpdateableJudgingSession) {
    return this.db
      .updateTable('judging_sessions')
      .set(updates)
      .where('id', '=', this.id)
      .returningAll()
      .executeTakeFirst();
  }
}

export class JudgingSessionsRepository {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private mongo: MongoDb
  ) {}

  async getAll() {
    return await this.db.selectFrom('judging_sessions').selectAll().execute();
  }

  async create(session: Omit<JudgingSession, 'id'>) {
    const dbSession = await this.db
      .insertInto('judging_sessions')
      .values(session)
      .returningAll()
      .executeTakeFirst();
    if (!dbSession) {
      throw new Error('Failed to create judging session');
    }

    await this.mongo.collection<JudgingSessionState>('judging_session_states').insertOne({
      sessionId: dbSession.id,
      status: 'not-started',
      called: false,
      queued: false,
      startTime: null,
      startDelta: null
    });

    return dbSession;
  }
}
