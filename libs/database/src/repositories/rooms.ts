import { Kysely } from 'kysely';
import { KyselyDatabaseSchema } from '../schema/kysely';
import {
  InsertableJudgingRoom,
  JudgingRoom,
  UpdateableJudgingRoom
} from '../schema/tables/judging-rooms';

class RoomSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private id: string
  ) {}

  private getRoomQuery() {
    return this.db.selectFrom('judging_rooms').selectAll().where('id', '=', this.id);
  }

  async get(): Promise<JudgingRoom | null> {
    const room = await this.getRoomQuery().executeTakeFirst();
    return room || null;
  }

  async update(updates: UpdateableJudgingRoom): Promise<JudgingRoom> {
    const [updatedRoom] = await this.db
      .updateTable('judging_rooms')
      .set(updates)
      .where('id', '=', this.id)
      .returningAll()
      .execute();

    if (!updatedRoom) {
      throw new Error(`Room with id ${this.id} not found`);
    }

    return updatedRoom;
  }
}

class RoomsSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private divisionId: string
  ) {}

  async getAll(): Promise<JudgingRoom[]> {
    return await this.db
      .selectFrom('judging_rooms')
      .selectAll()
      .where('division_id', '=', this.divisionId)
      .orderBy('name', 'asc')
      .execute();
  }

  async deleteAll(): Promise<number> {
    const result = await this.db
      .deleteFrom('judging_rooms')
      .where('division_id', '=', this.divisionId)
      .execute();

    return result.length;
  }
}

export class RoomsRepository {
  constructor(private db: Kysely<KyselyDatabaseSchema>) {}

  byId(id: string): RoomSelector {
    return new RoomSelector(this.db, id);
  }

  byDivisionId(divisionId: string): RoomsSelector {
    return new RoomsSelector(this.db, divisionId);
  }

  async create(newRoom: InsertableJudgingRoom): Promise<boolean> {
    const result = await this.db
      .insertInto('judging_rooms')
      .values(newRoom)
      .returningAll()
      .execute();
    return result.length > 0;
  }
}
