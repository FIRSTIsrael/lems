import { Kysely } from 'kysely';
import { KyselyDatabaseSchema } from '../schema/kysely';
import {
  JudgingDeliberation,
  NewJudgingDeliberation,
  JudgingDeliberationUpdate
} from '../schema/tables/judging-deliberation';

export class JudgingDeliberationSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private id: string
  ) {}

  private getDeliberationQuery() {
    return this.db.selectFrom('judging_deliberations').selectAll().where('id', '=', this.id);
  }

  async get(): Promise<JudgingDeliberation | null> {
    const deliberation = await this.getDeliberationQuery().executeTakeFirst();
    return deliberation || null;
  }

  async update(updates: JudgingDeliberationUpdate): Promise<JudgingDeliberation | undefined> {
    return this.db
      .updateTable('judging_deliberations')
      .set(updates)
      .where('id', '=', this.id)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(): Promise<void> {
    await this.db.deleteFrom('judging_deliberations').where('id', '=', this.id).execute();
  }
}

class JudgingDeliberationsSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private divisionId: string
  ) {}

  async getAll(): Promise<JudgingDeliberation[]> {
    return await this.db
      .selectFrom('judging_deliberations')
      .selectAll()
      .where('division_id', '=', this.divisionId)
      .execute();
  }

  async getByCategory(category: string): Promise<JudgingDeliberation | null> {
    const deliberation = await this.db
      .selectFrom('judging_deliberations')
      .selectAll()
      .where('division_id', '=', this.divisionId)
      .where('category', '=', category)
      .executeTakeFirst();

    return deliberation || null;
  }

  async deleteAll(): Promise<void> {
    await this.db
      .deleteFrom('judging_deliberations')
      .where('division_id', '=', this.divisionId)
      .execute();
  }
}

export class JudgingDeliberationsRepository {
  constructor(private db: Kysely<KyselyDatabaseSchema>) {}

  get(id: string) {
    return new JudgingDeliberationSelector(this.db, id);
  }

  byDivision(divisionId: string) {
    return new JudgingDeliberationsSelector(this.db, divisionId);
  }

  async create(
    deliberation: Omit<NewJudgingDeliberation, 'status' | 'picklist'>
  ): Promise<JudgingDeliberation> {
    const created = await this.db
      .insertInto('judging_deliberations')
      .values({
        status: 'not-started',
        picklist: [],
        ...deliberation
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return created;
  }

  async upsert(
    divisionId: string,
    category: string,
    updates: Partial<Omit<NewJudgingDeliberation, 'division_id' | 'category'>>
  ): Promise<JudgingDeliberation> {
    const result = await this.db
      .insertInto('judging_deliberations')
      .values({
        division_id: divisionId,
        category,
        status: 'not-started',
        picklist: [],
        ...updates
      })
      .onConflict(oc => oc.columns(['division_id', 'category']).doUpdateSet(updates))
      .returningAll()
      .executeTakeFirstOrThrow();

    return result;
  }
}
