import { Kysely } from 'kysely';
import { KyselyDatabaseSchema } from '../schema/kysely';
import {
  InsertableJudgingSession,
  JudgingSession,
  UpdateableJudgingSession
} from '../schema/tables/judging-sessions';

export class JudgingSessionSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
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

class JudgingSessionsSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
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
      await this.db
        .deleteFrom('judging_sessions')
        .where('division_id', '=', this.divisionId)
        .execute();
    }

    return sessionIds.length;
  }
}

export class JudgingSessionsRepository {
  constructor(private db: Kysely<KyselyDatabaseSchema>) {}

  byId(id: string): JudgingSessionSelector {
    return new JudgingSessionSelector(this.db, id);
  }

  byDivision(divisionId: string): JudgingSessionsSelector {
    return new JudgingSessionsSelector(this.db, divisionId);
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

    return dbSession;
  }

  async createMany(sessions: InsertableJudgingSession[]): Promise<JudgingSession[]> {
    return await this.db.insertInto('judging_sessions').values(sessions).returningAll().execute();
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
