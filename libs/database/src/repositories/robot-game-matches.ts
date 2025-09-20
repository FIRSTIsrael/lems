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
  RobotGameMatchParticipant,
  UpdateableRobotGameMatchParticipant
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

  async get() {
    const match = await this.getMatchQuery().executeTakeFirst();
    return match || null;
  }

  async state() {
    return new RobotGameMatchStateSelector(this.mongo, this.id);
  }

  async getWithParticipants() {
    const match = await this.get();
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

  async getAll() {
    return await this.db.selectFrom('robot_game_matches').selectAll().execute();
  }

  async getAllWithParticipants() {
    const matches = await this.getAll();
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

  async create(match: InsertableRobotGameMatch): Promise<RobotGameMatch> {
    const dbMatch = await this.db
      .insertInto('robot_game_matches')
      .values(match)
      .returningAll()
      .executeTakeFirst();
    if (!dbMatch) {
      throw new Error('Failed to create robot game match');
    }

    await this.mongo
      .collection<RobotGameMatchState>('robot_game_match_states')
      .insertOne(this.getEmptyState(dbMatch.id));

    return dbMatch;
  }

  async createMany(matches: InsertableRobotGameMatch[]): Promise<RobotGameMatch[]> {
    const dbMatches = await this.db
      .insertInto('robot_game_matches')
      .values(matches)
      .returningAll()
      .execute();

    const states = dbMatches.map(match => this.getEmptyState(match.id));

    if (states.length > 0) {
      await this.mongo
        .collection<RobotGameMatchState>('robot_game_match_states')
        .insertMany(states);
    }

    return dbMatches;
  }

  async createWithParticipants(
    match: InsertableRobotGameMatch,
    participants: InsertableRobotGameMatchParticipant[]
  ): Promise<{ match: RobotGameMatch; participants: RobotGameMatchParticipant[] }> {
    // Create the match first (without state)
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

    // Create the state with participant information
    await this.mongo
      .collection<RobotGameMatchState>('robot_game_match_states')
      .insertOne(this.getEmptyState(dbMatch.id, dbParticipants));

    return { match: dbMatch, participants: dbParticipants };
  }

  async createManyWithParticipants(
    matchesWithParticipants: Array<{
      match: InsertableRobotGameMatch;
      participants: InsertableRobotGameMatchParticipant[];
    }>
  ): Promise<Array<{ match: RobotGameMatch; participants: RobotGameMatchParticipant[] }>> {
    const result = [];

    for (const { match, participants } of matchesWithParticipants) {
      const created = await this.createWithParticipants(match, participants);
      result.push(created);
    }

    return result;
  }

  async getMatchParticipants(matchId: string): Promise<RobotGameMatchParticipant[]> {
    return await this.db
      .selectFrom('robot_game_match_participants')
      .selectAll()
      .where('match_id', '=', matchId)
      .execute();
  }

  async addParticipant(
    participant: InsertableRobotGameMatchParticipant
  ): Promise<RobotGameMatchParticipant> {
    const dbParticipant = await this.db
      .insertInto('robot_game_match_participants')
      .values(participant)
      .returningAll()
      .executeTakeFirst();
    if (!dbParticipant) {
      throw new Error('Failed to create robot game match participant');
    }
    return dbParticipant;
  }

  async addParticipants(
    participants: InsertableRobotGameMatchParticipant[]
  ): Promise<RobotGameMatchParticipant[]> {
    return await this.db
      .insertInto('robot_game_match_participants')
      .values(participants)
      .returningAll()
      .execute();
  }

  async updateParticipant(
    participantPk: number,
    updates: UpdateableRobotGameMatchParticipant
  ): Promise<RobotGameMatchParticipant | undefined> {
    return await this.db
      .updateTable('robot_game_match_participants')
      .set(updates)
      .where('pk', '=', participantPk)
      .returningAll()
      .executeTakeFirst();
  }

  async deleteParticipant(participantPk: number): Promise<void> {
    await this.db
      .deleteFrom('robot_game_match_participants')
      .where('pk', '=', participantPk)
      .execute();
  }

  async deleteMatchParticipants(matchId: string): Promise<void> {
    await this.db
      .deleteFrom('robot_game_match_participants')
      .where('match_id', '=', matchId)
      .execute();
  }

  async updateTeamAssignment(
    matchId: string,
    tableId: string,
    teamId: string | null
  ): Promise<RobotGameMatchParticipant | undefined> {
    return await this.db
      .updateTable('robot_game_match_participants')
      .set({ team_id: teamId })
      .where('match_id', '=', matchId)
      .where('table_id', '=', tableId)
      .returningAll()
      .executeTakeFirst();
  }

  async deleteByDivision(divisionId: string): Promise<void> {
    const matches = await this.db
      .selectFrom('robot_game_matches')
      .select('id')
      .where('division_id', '=', divisionId)
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
        .where('division_id', '=', divisionId)
        .execute();
    }
  }
}
