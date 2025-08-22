import { Kysely } from 'kysely';
import { KyselyDatabaseSchema } from '../schema/kysely';
import { InsertableDivision, Division, UpdateableDivision } from '../schema/tables/divisions';
import {
  InsertableJudgingRoom,
  InsertableRobotGameTable,
  JudgingRoom,
  RobotGameTable
} from '../schema';

class DivisionSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private selector: { type: 'id' | 'event_id'; value: string }
  ) {}

  private getDivisionQuery() {
    const query = this.db.selectFrom('divisions').selectAll();
    return query.where(this.selector.type, '=', this.selector.value);
  }

  async get(): Promise<Division | null> {
    const division = await this.getDivisionQuery().executeTakeFirst();
    return division || null;
  }

  async getAll(): Promise<Division[]> {
    return await this.getDivisionQuery().orderBy('name', 'asc').execute();
  }

  async update(newDivision: UpdateableDivision): Promise<boolean> {
    const result = await this.db
      .updateTable('divisions')
      .set(newDivision)
      .where(this.selector.type, '=', this.selector.value)
      .execute();
    return result.length > 0;
  }

  async delete(): Promise<boolean | null> {
    const result = await this.db
      .deleteFrom('divisions')
      .where(this.selector.type, '=', this.selector.value)
      .execute();
    return result.length > 0;
  }

  async getTables(): Promise<RobotGameTable[]> {
    const division = await this.get();

    if (!division) {
      throw new Error('Division not found');
    }

    return await this.db
      .selectFrom('robot_game_tables')
      .selectAll()
      .where('division_id', '=', division.id)
      .execute();
  }

  async createTable(newTable: InsertableRobotGameTable): Promise<boolean> {
    const result = await this.db
      .insertInto('robot_game_tables')
      .values(newTable)
      .returningAll()
      .execute();
    return result.length > 0;
  }

  async getRooms(): Promise<JudgingRoom[]> {
    const division = await this.get();

    if (!division) {
      throw new Error('Division not found');
    }

    return await this.db
      .selectFrom('judging_rooms')
      .selectAll()
      .where('division_id', '=', division.id)
      .execute();
  }

  async createRoom(newRoom: InsertableJudgingRoom): Promise<boolean> {
    const result = await this.db
      .insertInto('judging_rooms')
      .values(newRoom)
      .returningAll()
      .execute();
    return result.length > 0;
  }
}

export class DivisionsRepository {
  constructor(private db: Kysely<KyselyDatabaseSchema>) {}

  byId(id: string): DivisionSelector {
    return new DivisionSelector(this.db, { type: 'id', value: id });
  }

  byEventId(eventId: string): DivisionSelector {
    return new DivisionSelector(this.db, { type: 'event_id', value: eventId });
  }

  async create(division: InsertableDivision): Promise<Division> {
    const [createdDivision] = await this.db
      .insertInto('divisions')
      .values(division)
      .returningAll()
      .execute();
    return createdDivision;
  }

  async createMany(divisions: InsertableDivision[]): Promise<Division[]> {
    if (divisions.length === 0) {
      return [];
    }

    return await this.db.insertInto('divisions').values(divisions).returningAll().execute();
  }
}
