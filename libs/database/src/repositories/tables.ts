import { randomUUID } from 'node:crypto';
import { Kysely } from 'kysely';
import { KyselyDatabaseSchema } from '../schema/kysely';
import {
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

class PairSelector {
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

  /** Deletes both tables of the pair and returns their ids. */
  async delete(): Promise<string[]> {
    const deleted = await this.db
      .deleteFrom('robot_game_tables')
      .where('pair_key', '=', this.pairKey)
      .returning('id')
      .execute();

    return deleted.map(row => row.id);
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

  byPairKey(pairKey: string): PairSelector {
    return new PairSelector(this.db, pairKey);
  }

  async createPair(
    divisionId: string,
    names: [string, string]
  ): Promise<[RobotGameTable, RobotGameTable]> {
    const pairKey = randomUUID();
    const created = await this.db
      .insertInto('robot_game_tables')
      .values([
        { division_id: divisionId, name: names[0], pair_key: pairKey, side: 'A' },
        { division_id: divisionId, name: names[1], pair_key: pairKey, side: 'B' }
      ])
      .returningAll()
      .execute();

    const a = created.find(table => table.side === 'A');
    const b = created.find(table => table.side === 'B');
    if (!a || !b) {
      throw new Error('Failed to create table pair');
    }

    return [a, b];
  }

  /**
   * Exchanges the pair slots (pair_key, side) of two tables. Run inside a transaction:
   * the full-pair trigger is deferred, so intermediate states are only checked on commit.
   */
  async swap(tableId: string, otherTableId: string): Promise<void> {
    if (tableId === otherTableId) return;

    // Lock both rows so a concurrent swap can't work from a stale snapshot.
    const rows = await this.db
      .selectFrom('robot_game_tables')
      .selectAll()
      .where('id', 'in', [tableId, otherTableId])
      .orderBy('id')
      .forUpdate()
      .execute();
    const x = rows.find(row => row.id === tableId);
    const y = rows.find(row => row.id === otherTableId);
    if (!x || !y) {
      throw new Error('Table not found');
    }

    const setSlot = (id: string, pairKey: string, side: 'A' | 'B') =>
      this.db
        .updateTable('robot_game_tables')
        .set({ pair_key: pairKey, side })
        .where('id', '=', id)
        .execute();

    // Park X in a fresh pair so uk_robot_game_tables_pair_side holds at every step.
    await setSlot(x.id, randomUUID(), x.side);
    await setSlot(y.id, x.pair_key, x.side);
    await setSlot(x.id, y.pair_key, y.side);
  }
}
