import { Kysely } from 'kysely';
import { Db as MongoDb, Filter } from 'mongodb';
import { KyselyDatabaseSchema } from '../schema/kysely';
import { Rubric, JudgingCategory } from '../schema/documents/rubric';

class RubricSelector {
  constructor(
    private mongo: MongoDb,
    private filter: Filter<Rubric>
  ) {}

  async get(): Promise<Rubric | null> {
    return await this.mongo.collection<Rubric>('rubrics').findOne(this.filter);
  }

  async upsert(
    rubric: Partial<Omit<Rubric, 'divisionId' | 'teamId' | 'category'>>
  ): Promise<Rubric> {
    const updatedRubric = { ...rubric };

    await this.mongo
      .collection<Rubric>('rubrics')
      .updateOne(this.filter, { $set: updatedRubric }, { upsert: true });

    const result = await this.get();
    if (!result) {
      throw new Error('Failed to upsert rubric');
    }
    return result;
  }

  async delete(): Promise<boolean> {
    const result = await this.mongo.collection<Rubric>('rubrics').deleteOne(this.filter);
    return result.deletedCount > 0;
  }
}

type RubricsSelectorType =
  | { type: 'division'; divisionId: string }
  | { type: 'room'; roomId: string };

class RubricsSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private mongo: MongoDb,
    private selector: RubricsSelectorType,
    private additionalFilters: Filter<Rubric> = {}
  ) {}

  private async buildFilter(): Promise<Filter<Rubric>> {
    let baseFilter: Filter<Rubric> = {};

    if (this.selector.type === 'division') {
      baseFilter.divisionId = this.selector.divisionId;
    } else if (this.selector.type === 'room') {
      // Get the room to find its division
      const room = await this.db
        .selectFrom('judging_rooms')
        .select(['division_id'])
        .where('id', '=', this.selector.roomId)
        .executeTakeFirst();

      if (!room) {
        return { divisionId: 'nonexistent' }; // Return filter that matches nothing
      }

      // Get all sessions in this room
      const sessions = await this.db
        .selectFrom('judging_sessions')
        .select(['team_id'])
        .where('room_id', '=', this.selector.roomId)
        .execute();

      // Filter out null team IDs (unoccupied sessions)
      const teamIds = sessions.map(s => s.team_id).filter((id): id is string => id !== null);

      if (teamIds.length === 0) {
        return { divisionId: 'nonexistent' }; // Return filter that matches nothing
      }

      baseFilter = {
        divisionId: room.division_id,
        teamId: { $in: teamIds }
      };
    }

    return { ...baseFilter, ...this.additionalFilters };
  }

  async getAll(): Promise<Rubric[]> {
    const filter = await this.buildFilter();
    return await this.mongo.collection<Rubric>('rubrics').find(filter).toArray();
  }

  byTeamId(teamId: string): RubricsSelector {
    return new RubricsSelector(this.db, this.mongo, this.selector, {
      ...this.additionalFilters,
      teamId
    });
  }

  byCategory(category: JudgingCategory): RubricsSelector {
    return new RubricsSelector(this.db, this.mongo, this.selector, {
      ...this.additionalFilters,
      category
    });
  }

  async get(): Promise<Rubric | null> {
    const filter = await this.buildFilter();
    return new RubricSelector(this.mongo, filter).get();
  }

  async upsert(
    rubric: Partial<Omit<Rubric, 'divisionId' | 'teamId' | 'category'>>
  ): Promise<Rubric> {
    const filter = await this.buildFilter();
    return new RubricSelector(this.mongo, filter).upsert(rubric);
  }

  async delete(): Promise<boolean> {
    const filter = await this.buildFilter();
    return new RubricSelector(this.mongo, filter).delete();
  }

  async deleteAll(): Promise<number> {
    const filter = await this.buildFilter();
    const result = await this.mongo.collection<Rubric>('rubrics').deleteMany(filter);
    return result.deletedCount;
  }
}

export class RubricsRepository {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private mongo: MongoDb
  ) {}

  byDivision(divisionId: string): RubricsSelector {
    return new RubricsSelector(this.db, this.mongo, { type: 'division', divisionId });
  }

  byRoom(roomId: string): RubricsSelector {
    return new RubricsSelector(this.db, this.mongo, { type: 'room', roomId });
  }

  async create(rubric: Rubric): Promise<Rubric> {
    await this.mongo.collection<Rubric>('rubrics').insertOne(rubric);
    return rubric;
  }

  async createMany(rubrics: Rubric[]): Promise<Rubric[]> {
    if (rubrics.length === 0) {
      return [];
    }
    await this.mongo.collection<Rubric>('rubrics').insertMany(rubrics);
    return rubrics;
  }
}
