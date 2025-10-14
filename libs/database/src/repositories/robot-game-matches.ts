import { Kysely } from 'kysely';
import { Db as MongoDb } from 'mongodb';
import { KyselyDatabaseSchema } from '../schema/kysely';
import {
  InsertableRobotGameMatch,
  RobotGameMatch,
  UpdateableRobotGameMatch
} from '../schema/tables/robot-game-matches';
import {
  InsertableRobotGameMatchParticipant,
  RobotGameMatchParticipant
} from '../schema/tables/robot-game-match-participants';
import {
  RobotGameMatchParticipantState,
  RobotGameMatchState
} from '../schema/documents/robot-game-match-state';

export class RobotGameMatchStateSelector {
  constructor(
    private db: MongoDb,
    private id: string
  ) {}

  async get() {
    return this.db
      .collection<RobotGameMatchState>('robot_game_match_states')
      .findOne({ matchId: this.id });
  }
}

export class RobotGameMatchSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private mongo: MongoDb,
    private id: string
  ) {}

  private getMatchQuery() {
    return this.db.selectFrom('robot_game_matches').selectAll().where('id', '=', this.id);
  }

  async state() {
    return new RobotGameMatchStateSelector(this.mongo, this.id);
  }

  async get() {
    const match = await this.getMatchQuery().executeTakeFirst();
    if (!match) return null;

    const participants = await this.db
      .selectFrom('robot_game_match_participants')
      .selectAll()
      .where('match_id', '=', this.id)
      .execute();

    return { ...match, participants };
  }

  update(updates: UpdateableRobotGameMatch) {
    return this.db
      .updateTable('robot_game_matches')
      .set(updates)
      .where('id', '=', this.id)
      .returningAll()
      .executeTakeFirst();
  }
}

class RobotGameMatchesSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private mongo: MongoDb,
    private divisionId: string
  ) {}

  private async getMatches(): Promise<RobotGameMatch[]> {
    return await this.db
      .selectFrom('robot_game_matches')
      .selectAll()
      .where('division_id', '=', this.divisionId)
      .orderBy('number', 'asc')
      .execute();
  }

  async getAll(): Promise<Array<RobotGameMatch & { participants: RobotGameMatchParticipant[] }>> {
    const matches = await this.getMatches();
    const matchesWithParticipants = [];

    for (const match of matches) {
      const participants = await this.db
        .selectFrom('robot_game_match_participants')
        .selectAll()
        .where('match_id', '=', match.id)
        .execute();

      matchesWithParticipants.push({
        ...match,
        participants
      });
    }

    return matchesWithParticipants;
  }

  async deleteAll(): Promise<number> {
    const matches = await this.db
      .selectFrom('robot_game_matches')
      .select('id')
      .where('division_id', '=', this.divisionId)
      .execute();

    const matchIds = matches.map(match => match.id);

    if (matchIds.length > 0) {
      await this.mongo
        .collection<RobotGameMatchState>('robot_game_match_states')
        .deleteMany({ matchId: { $in: matchIds } });

      await this.db
        .deleteFrom('robot_game_match_participants')
        .where('match_id', 'in', matchIds)
        .execute();

      await this.db
        .deleteFrom('robot_game_matches')
        .where('division_id', '=', this.divisionId)
        .execute();
    }

    return matchIds.length;
  }
}

export class RobotGameMatchesRepository {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private mongo: MongoDb
  ) {}

  private getEmptyState(
    id: string,
    participants: RobotGameMatchParticipant[] = []
  ): RobotGameMatchState {
    const participantStates: Record<string, RobotGameMatchParticipantState> = {};

    participants.forEach(participant => {
      participantStates[participant.table_id] = {
        queued: false,
        present: false,
        ready: false
      };
    });

    return {
      matchId: id,
      status: 'not-started',
      called: false,
      participants: participantStates
    };
  }

  byId(id: string): RobotGameMatchSelector {
    return new RobotGameMatchSelector(this.db, this.mongo, id);
  }

  byDivisionId(divisionId: string): RobotGameMatchesSelector {
    return new RobotGameMatchesSelector(this.db, this.mongo, divisionId);
  }

  async getAll() {
    const matches = await this.db.selectFrom('robot_game_matches').selectAll().execute();
    const matchesWithParticipants = [];

    for (const match of matches) {
      const participants = await this.db
        .selectFrom('robot_game_match_participants')
        .selectAll()
        .where('match_id', '=', match.id)
        .execute();

      matchesWithParticipants.push({
        ...match,
        participants
      });
    }

    return matchesWithParticipants;
  }

  async create(
    match: InsertableRobotGameMatch,
    participants: InsertableRobotGameMatchParticipant[]
  ): Promise<{ match: RobotGameMatch; participants: RobotGameMatchParticipant[] }> {
    const dbMatch = await this.db
      .insertInto('robot_game_matches')
      .values(match)
      .returningAll()
      .executeTakeFirst();
    if (!dbMatch) {
      throw new Error('Failed to create robot game match');
    }

    let dbParticipants: RobotGameMatchParticipant[] = [];

    if (participants.length > 0) {
      const participantsWithMatchId = participants.map(participant => ({
        ...participant,
        match_id: dbMatch.id
      }));

      dbParticipants = await this.db
        .insertInto('robot_game_match_participants')
        .values(participantsWithMatchId)
        .returningAll()
        .execute();
    }

    await this.mongo
      .collection<RobotGameMatchState>('robot_game_match_states')
      .insertOne(this.getEmptyState(dbMatch.id, dbParticipants));

    return { match: dbMatch, participants: dbParticipants };
  }

  async createMany(
    matchesWithParticipants: Array<{
      match: InsertableRobotGameMatch;
      participants: InsertableRobotGameMatchParticipant[];
    }>
  ): Promise<Array<{ match: RobotGameMatch; participants: RobotGameMatchParticipant[] }>> {
    const result = [];

    for (const { match, participants } of matchesWithParticipants) {
      const created = await this.create(match, participants);
      result.push(created);
    }

    return result;
  }
}
