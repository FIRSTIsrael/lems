import { Kysely } from 'kysely';
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

export class RobotGameMatchSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private id: string
  ) {}

  private getMatchQuery() {
    return this.db.selectFrom('robot_game_matches').selectAll().where('id', '=', this.id);
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

/**
 * Builds the lookup key used to identify a team's no-show status for a specific
 * ranking round (team ID + round number).
 */
export function buildNoShowKey(teamId: string, round: number): string {
  return `${teamId}:${round}`;
}

class RobotGameMatchesSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
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

  /**
   * Returns a set of `${teamId}:${round}` keys identifying every team that is a
   * no-show for a completed RANKING match in this division, i.e. the team's
   * `robot_game_match_participants` row has `present IS NULL` once the match
   * reaches `status = 'completed'`.
   *
   * This is computed with a single batched query so it can be reused across an
   * entire division (e.g. deliberations) without a query per team/scoresheet.
   */
  async getRankingNoShows(): Promise<Set<string>> {
    const rows = await this.db
      .selectFrom('robot_game_match_participants')
      .innerJoin(
        'robot_game_matches',
        'robot_game_matches.id',
        'robot_game_match_participants.match_id'
      )
      .select(['robot_game_match_participants.team_id as teamId', 'robot_game_matches.round'])
      .where('robot_game_matches.division_id', '=', this.divisionId)
      .where('robot_game_matches.stage', '=', 'RANKING')
      .where('robot_game_matches.status', '=', 'completed')
      .where('robot_game_match_participants.present', 'is', null)
      .where('robot_game_match_participants.team_id', 'is not', null)
      .execute();

    return new Set(
      rows
        .filter((row): row is typeof row & { teamId: string } => row.teamId !== null)
        .map(row => buildNoShowKey(row.teamId, row.round))
    );
  }
}

export class RobotGameMatchesRepository {
  constructor(private db: Kysely<KyselyDatabaseSchema>) {}

  byId(id: string): RobotGameMatchSelector {
    return new RobotGameMatchSelector(this.db, id);
  }

  byDivision(divisionId: string): RobotGameMatchesSelector {
    return new RobotGameMatchesSelector(this.db, divisionId);
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
        .where('match_id', 'in', eb =>
          eb.selectFrom('robot_game_matches').select('id').where('division_id', '=', divisionId)
        )
        .execute();

      const team2Participants = await trx
        .selectFrom('robot_game_match_participants')
        .selectAll()
        .where('team_id', '=', teamId2)
        .where('match_id', 'in', eb =>
          eb.selectFrom('robot_game_matches').select('id').where('division_id', '=', divisionId)
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
