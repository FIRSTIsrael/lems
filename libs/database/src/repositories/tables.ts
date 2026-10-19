import { randomUUID } from 'node:crypto';
import { Kysely, sql } from 'kysely';
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

  async delete(): Promise<void> {
    await this.db.deleteFrom('robot_game_tables').where('id', '=', this.id).execute();
  }
}

// Mirrors PAIR_NAME_SEPARATOR in @lems/shared (which depends on this lib).
const PAIR_NAME_SEPARATOR = ' – ';

class TablePairSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private pairKey: string
  ) {}

  async getAll(): Promise<RobotGameTable[]> {
    return await this.db
      .selectFrom('robot_game_tables')
      .selectAll()
      .where('pair_key', '=', this.pairKey)
      .orderBy('side', 'asc')
      .execute();
  }

  async rename(baseName: string): Promise<void> {
    await this.db
      .updateTable('robot_game_tables')
      .set({ name: sql<string>`${baseName} || ${PAIR_NAME_SEPARATOR} || side` })
      .where('pair_key', '=', this.pairKey)
      .execute();
  }

  async delete(): Promise<string[]> {
    const deleted = await this.db
      .deleteFrom('robot_game_tables')
      .where('pair_key', '=', this.pairKey)
      .returning('id')
      .execute();

    return deleted.map(row => row.id);
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

  byPairKey(pairKey: string): TablePairSelector {
    return new TablePairSelector(this.db, pairKey);
  }

  async createPair(
    divisionId: string,
    baseName: string
  ): Promise<[RobotGameTable, RobotGameTable]> {
    const pairKey = randomUUID();
    const created = await this.db
      .insertInto('robot_game_tables')
      .values(
        (['A', 'B'] as const).map(side => ({
          division_id: divisionId,
          name: `${baseName}${PAIR_NAME_SEPARATOR}${side}`,
          pair_key: pairKey,
          side
        }))
      )
      .returningAll()
      .execute();

    const a = created.find(t => t.side === 'A');
    const b = created.find(t => t.side === 'B');
    if (!a || !b) {
      throw new Error('Failed to create table pair');
    }

    return [a, b];
  }

  async create(newTable: InsertableRobotGameTable): Promise<RobotGameTable> {
    const [createdTable] = await this.db
      .insertInto('robot_game_tables')
      .values(newTable)
      .returningAll()
      .execute();

    if (!createdTable) {
      throw new Error('Failed to create table');
    }

    return createdTable;
  }
}
