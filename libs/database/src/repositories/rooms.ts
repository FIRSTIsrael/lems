import { Kysely } from 'kysely';
import { KyselyDatabaseSchema } from '../schema/kysely';
import { InsertableJudgingRoom, JudgingRoom, UpdateableJudgingRoom } from '../schema/tables/judging-rooms';

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

export class RoomsRepository {
  constructor(private db: Kysely<KyselyDatabaseSchema>) {}

  byId(id: string): RoomSelector {
    return new RoomSelector(this.db, id);
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
