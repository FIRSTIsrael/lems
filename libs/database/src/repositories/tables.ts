import { Kysely } from 'kysely';
import { KyselyDatabaseSchema } from '../schema/kysely';
import {
  InsertableRobotGameTable,
  RobotGameTable,
  UpdateableRobotGameTable
} from '../schema/tables/robot-game-tables';

class TableSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private id: string
  ) {}

  private getTableQuery() {
    return this.db.selectFrom('robot_game_tables').selectAll().where('id', '=', this.id);
  }

  async get(): Promise<RobotGameTable | null> {
    const table = await this.getTableQuery().executeTakeFirst();
    return table || null;
  }

  async update(updates: UpdateableRobotGameTable): Promise<RobotGameTable> {
    const [updatedTable] = await this.db
      .updateTable('robot_game_tables')
      .set(updates)
      .where('id', '=', this.id)
      .returningAll()
      .execute();

    if (!updatedTable) {
      throw new Error(`Table with id ${this.id} not found`);
    }

    return updatedTable;
  }
}

class TablesSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private divisionId: string
  ) {}

  async getAll(): Promise<RobotGameTable[]> {
    return await this.db
      .selectFrom('robot_game_tables')
      .selectAll()
      .where('division_id', '=', this.divisionId)
      .orderBy('name', 'asc')
      .execute();
  }

  async deleteAll(): Promise<number> {
    const result = await this.db
      .deleteFrom('robot_game_tables')
      .where('division_id', '=', this.divisionId)
      .execute();

    return result.length;
  }
}

export class TablesRepository {
  constructor(private db: Kysely<KyselyDatabaseSchema>) {}

  byId(id: string): TableSelector {
    return new TableSelector(this.db, id);
  }

  byDivisionId(divisionId: string): TablesSelector {
    return new TablesSelector(this.db, divisionId);
  }

  async create(newTable: InsertableRobotGameTable): Promise<boolean> {
    const result = await this.db
      .insertInto('robot_game_tables')
      .values(newTable)
      .returningAll()
      .execute();
    return result.length > 0;
  }
}
