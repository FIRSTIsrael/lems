import { Kysely } from 'kysely';
import { Db as MongoDb, WithId } from 'mongodb';
import { KyselyDatabaseSchema } from '../schema/kysely';
import {
  InsertableRobotGameMatch,
  RobotGameMatch,
  RobotGameMatchWithParticipants,
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

  async get(): Promise<WithId<RobotGameMatchState> | null> {
    return await this.db
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

  state() {
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

  async getByTeam(teamId: string): Promise<RobotGameMatchWithParticipants[]> {
    const matchesWithParticipants = [];

    const teamParticipants = await this.db
      .selectFrom('robot_game_match_participants')
      .selectAll()
      .where('team_id', '=', teamId)
      .execute();

    const matchIds = [...new Set(teamParticipants.map(p => p.match_id))];

    for (const matchId of matchIds) {
      const match = await this.db
        .selectFrom('robot_game_matches')
        .selectAll()
        .where('id', '=', matchId)
        .where('division_id', '=', this.divisionId)
        .executeTakeFirst();

      if (match) {
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
    }

    return matchesWithParticipants.sort((a, b) => a.number - b.number);
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
        queued: null,
        present: null,
        ready: null
      };
    });

    return {
      matchId: id,
      status: 'not-started',
      called: null,
      startTime: null,
      startDelta: null,
      participants: participantStates
    };
  }

  byId(id: string): RobotGameMatchSelector {
    return new RobotGameMatchSelector(this.db, this.mongo, id);
  }

  byDivision(divisionId: string): RobotGameMatchesSelector {
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

  async swapTeams(teamId1: string, teamId2: string, divisionId: string): Promise<void> {
    await this.db.transaction().execute(async trx => {
      // Get participants for both teams only in the specified division
      const team1Participants = await trx
        .selectFrom('robot_game_match_participants')
        .selectAll()
        .where('team_id', '=', teamId1)
        .where('match_id', 'in', (eb) =>
          eb
            .selectFrom('robot_game_matches')
            .select('id')
            .where('division_id', '=', divisionId)
        )
        .execute();

      const team2Participants = await trx
        .selectFrom('robot_game_match_participants')
        .selectAll()
        .where('team_id', '=', teamId2)
        .where('match_id', 'in', (eb) =>
          eb
            .selectFrom('robot_game_matches')
            .select('id')
            .where('division_id', '=', divisionId)
        )
        .execute();

      const team1Pks = team1Participants.map(p => p.pk);

      // Step 1: Set team1 participants to NULL to avoid constraint violation
      if (team1Pks.length > 0) {
        await trx
          .updateTable('robot_game_match_participants')
          .set({ team_id: null })
          .where('pk', 'in', team1Pks)
          .execute();
      }

      // Step 2: Set team2 participants to team1
      for (const participant of team2Participants) {
        await trx
          .updateTable('robot_game_match_participants')
          .set({ team_id: teamId1 })
          .where('pk', '=', participant.pk)
          .execute();
      }

      // Step 3: Set the NULL participants (from step 1) to team2
      if (team1Pks.length > 0) {
        await trx
          .updateTable('robot_game_match_participants')
          .set({ team_id: teamId2 })
          .where('pk', 'in', team1Pks)
          .execute();
      }
    });
  }
}
