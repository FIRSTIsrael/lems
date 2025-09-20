import { Kysely } from 'kysely';
import { Db as MongoDb } from 'mongodb';
import { KyselyDatabaseSchema } from '../schema/kysely';
import {
  InsertableJudgingSession,
  JudgingSession,
  UpdateableJudgingSession
} from '../schema/tables/judging-sessions';
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

  async state() {
    return new JudgingSessionStateSelector(this.mongo, this.id);
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

  private getEmptyState(id: string): JudgingSessionState {
    return {
      sessionId: id,
      status: 'not-started',
      called: false,
      queued: false,
      startTime: null,
      startDelta: null
    };
  }

  async getAll() {
    return await this.db.selectFrom('judging_sessions').selectAll().execute();
  }

  async create(session: InsertableJudgingSession): Promise<JudgingSession> {
    const dbSession = await this.db
      .insertInto('judging_sessions')
      .values(session)
      .returningAll()
      .executeTakeFirst();
    if (!dbSession) {
      throw new Error('Failed to create judging session');
    }

    await this.mongo
      .collection<JudgingSessionState>('judging_session_states')
      .insertOne(this.getEmptyState(dbSession.id));

    return dbSession;
  }

  async createMany(sessions: InsertableJudgingSession[]): Promise<JudgingSession[]> {
    const dbSessions = await this.db
      .insertInto('judging_sessions')
      .values(sessions)
      .returningAll()
      .execute();

    const states = dbSessions.map(session => this.getEmptyState(session.id));

    if (states.length > 0) {
      await this.mongo.collection<JudgingSessionState>('judging_session_states').insertMany(states);
    }

    return dbSessions;
  }

  async deleteByDivision(divisionId: string): Promise<void> {
    const sessions = await this.db
      .selectFrom('judging_sessions')
      .select('id')
      .where('division_id', '=', divisionId)
      .execute();

    const sessionIds = sessions.map(session => session.id);

    if (sessionIds.length > 0) {
      await this.mongo
        .collection<JudgingSessionState>('judging_session_states')
        .deleteMany({ sessionId: { $in: sessionIds } });

      await this.db.deleteFrom('judging_sessions').where('division_id', '=', divisionId).execute();
    }
  }
}
