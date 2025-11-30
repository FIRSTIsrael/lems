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

class JudgingSessionsSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private mongo: MongoDb,
    private divisionId: string
  ) {}

  async getAll(): Promise<JudgingSession[]> {
    return await this.db
      .selectFrom('judging_sessions')
      .selectAll()
      .where('division_id', '=', this.divisionId)
      .orderBy('number', 'asc')
      .execute();
  }

  async getByTeam(teamId: string): Promise<JudgingSession | null> {
    const teamSession = await this.db
      .selectFrom('judging_sessions')
      .selectAll()
      .where('division_id', '=', this.divisionId)
      .where('team_id', '=', teamId)
      .executeTakeFirst();

    return teamSession || null;
  }

  async deleteAll(): Promise<number> {
    const sessions = await this.db
      .selectFrom('judging_sessions')
      .select('id')
      .where('division_id', '=', this.divisionId)
      .execute();

    const sessionIds = sessions.map(session => session.id);

    if (sessionIds.length > 0) {
      await this.mongo
        .collection<JudgingSessionState>('judging_session_states')
        .deleteMany({ sessionId: { $in: sessionIds } });

      await this.db
        .deleteFrom('judging_sessions')
        .where('division_id', '=', this.divisionId)
        .execute();
    }

    return sessionIds.length;
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
      called: null,
      queued: null,
      startTime: null,
      startDelta: null
    };
  }

  byId(id: string): JudgingSessionSelector {
    return new JudgingSessionSelector(this.db, this.mongo, id);
  }

  byDivision(divisionId: string): JudgingSessionsSelector {
    return new JudgingSessionsSelector(this.db, this.mongo, divisionId);
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

  async swapTeams(teamId1: string, teamId2: string, divisionId: string): Promise<void> {
    const session1 = await this.byDivision(divisionId).getByTeam(teamId1);
    const session2 = await this.byDivision(divisionId).getByTeam(teamId2);

    if (!session1 || !session2) {
      throw new Error('One or both teams do not have a judging session in this division');
    }

    await Promise.all([
      this.byId(session1.id).update({ team_id: teamId2 }),
      this.byId(session2.id).update({ team_id: teamId1 })
    ]);
  }
}
