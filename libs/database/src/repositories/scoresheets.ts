import { Kysely } from 'kysely';
import { Db as MongoDb, Filter } from 'mongodb';
import { KyselyDatabaseSchema } from '../schema/kysely';
import { Scoresheet } from '../schema/documents/scoresheet';

class ScoresheetSelector {
  constructor(
    private mongo: MongoDb,
    private filter: Filter<Scoresheet>
  ) {}

  async get(): Promise<Scoresheet | null> {
    return await this.mongo.collection<Scoresheet>('scoresheets').findOne(this.filter);
  }

  async upsert(
    scoresheet: Partial<Omit<Scoresheet, 'divisionId' | 'teamId' | 'stage' | 'round'>>
  ): Promise<Scoresheet> {
    const updatedScoresheet = { ...scoresheet };

    await this.mongo
      .collection<Scoresheet>('scoresheets')
      .updateOne(this.filter, { $set: updatedScoresheet }, { upsert: true });

    const result = await this.get();
    if (!result) {
      throw new Error('Failed to upsert scoresheet');
    }
    return result;
  }

  async delete(): Promise<boolean> {
    const result = await this.mongo.collection<Scoresheet>('scoresheets').deleteOne(this.filter);
    return result.deletedCount > 0;
  }
}

type ScoresheetsSelectorType =
  | { type: 'division'; divisionId: string }
  | { type: 'table'; tableId: string };

class ScoresheetsSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private mongo: MongoDb,
    private selector: ScoresheetsSelectorType,
    private additionalFilters: Filter<Scoresheet> = {}
  ) {}

  private async buildFilter(): Promise<Filter<Scoresheet>> {
    let baseFilter: Filter<Scoresheet> = {};

    if (this.selector.type === 'division') {
      baseFilter.divisionId = this.selector.divisionId;
    } else if (this.selector.type === 'table') {
      // Get the table to find its division
      const table = await this.db
        .selectFrom('robot_game_tables')
        .select(['division_id'])
        .where('id', '=', this.selector.tableId)
        .executeTakeFirst();

      if (!table) {
        return { divisionId: 'nonexistent' }; // Return filter that matches nothing
      }

      // Get all matches for this table
      const matches = await this.db
        .selectFrom('robot_game_match_participants')
        .innerJoin(
          'robot_game_matches',
          'robot_game_matches.id',
          'robot_game_match_participants.match_id'
        )
        .select([
          'robot_game_match_participants.team_id',
          'robot_game_matches.stage',
          'robot_game_matches.round'
        ])
        .where('robot_game_match_participants.table_id', '=', this.selector.tableId)
        .execute();

      // Filter out null team IDs (unoccupied matches)
      const teamMatches = matches.filter(
        (m): m is typeof m & { team_id: string } => m.team_id !== null
      );

      if (teamMatches.length === 0) {
        return { divisionId: 'nonexistent' }; // Return filter that matches nothing
      }

      // Build $or filter for all team-stage-round combinations
      const orFilters: Filter<Scoresheet>[] = teamMatches
        .filter((m): m is typeof m & { stage: 'PRACTICE' | 'RANKING' } => m.stage !== 'TEST')
        .map(m => ({
          teamId: m.team_id,
          stage: m.stage,
          round: m.round
        }));

      baseFilter = {
        divisionId: table.division_id,
        $or: orFilters
      };
    }

    return { ...baseFilter, ...this.additionalFilters };
  }

  async getAll(): Promise<Scoresheet[]> {
    const filter = await this.buildFilter();
    return await this.mongo.collection<Scoresheet>('scoresheets').find(filter).toArray();
  }

  byTeamId(teamId: string): ScoresheetsSelector {
    return new ScoresheetsSelector(this.db, this.mongo, this.selector, {
      ...this.additionalFilters,
      teamId
    });
  }

  byStage(stage: 'PRACTICE' | 'RANKING'): ScoresheetsSelector {
    return new ScoresheetsSelector(this.db, this.mongo, this.selector, {
      ...this.additionalFilters,
      stage
    });
  }

  byRound(round: number): ScoresheetsSelector {
    return new ScoresheetsSelector(this.db, this.mongo, this.selector, {
      ...this.additionalFilters,
      round
    });
  }

  async get(): Promise<Scoresheet | null> {
    const filter = await this.buildFilter();
    return new ScoresheetSelector(this.mongo, filter).get();
  }

  async upsert(
    scoresheet: Partial<Omit<Scoresheet, 'divisionId' | 'teamId' | 'stage' | 'round'>>
  ): Promise<Scoresheet> {
    const filter = await this.buildFilter();
    return new ScoresheetSelector(this.mongo, filter).upsert(scoresheet);
  }

  async delete(): Promise<boolean> {
    const filter = await this.buildFilter();
    return new ScoresheetSelector(this.mongo, filter).delete();
  }

  async deleteAll(): Promise<number> {
    const filter = await this.buildFilter();
    const result = await this.mongo.collection<Scoresheet>('scoresheets').deleteMany(filter);
    return result.deletedCount;
  }
}

export class ScoresheetsRepository {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private mongo: MongoDb
  ) {}

  byDivision(divisionId: string): ScoresheetsSelector {
    return new ScoresheetsSelector(this.db, this.mongo, { type: 'division', divisionId });
  }

  byTable(tableId: string): ScoresheetsSelector {
    return new ScoresheetsSelector(this.db, this.mongo, { type: 'table', tableId });
  }

  async create(scoresheet: Scoresheet): Promise<Scoresheet> {
    await this.mongo.collection<Scoresheet>('scoresheets').insertOne(scoresheet);
    return scoresheet;
  }

  async createMany(scoresheets: Scoresheet[]): Promise<Scoresheet[]> {
    if (scoresheets.length === 0) {
      return [];
    }
    await this.mongo.collection<Scoresheet>('scoresheets').insertMany(scoresheets);
    return scoresheets;
  }
}
