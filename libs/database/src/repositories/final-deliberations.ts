import { Kysely } from 'kysely';
import { KyselyDatabaseSchema } from '../schema/kysely';
import { FinalDeliberation, FinalDeliberationUpdate } from '../schema/tables/final-deliberation';

export class FinalDeliberationSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private divisionId: string
  ) {}

  private getDeliberationQuery() {
    return this.db
      .selectFrom('final_deliberations')
      .selectAll()
      .where('division_id', '=', this.divisionId);
  }

  async get(): Promise<FinalDeliberation | null> {
    const deliberation = await this.getDeliberationQuery().executeTakeFirst();
    return deliberation || null;
  }

  async update(updates: FinalDeliberationUpdate): Promise<FinalDeliberation | undefined> {
    return this.db
      .updateTable('final_deliberations')
      .set(updates)
      .where('division_id', '=', this.divisionId)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(): Promise<void> {
    await this.db
      .deleteFrom('final_deliberations')
      .where('division_id', '=', this.divisionId)
      .execute();
  }
}

export class FinalDeliberationsRepository {
  constructor(private db: Kysely<KyselyDatabaseSchema>) {}

  byDivision(divisionId: string): FinalDeliberationSelector {
    return new FinalDeliberationSelector(this.db, divisionId);
  }

  async create(divisionId: string): Promise<FinalDeliberation> {
    return this.db
      .insertInto('final_deliberations')
      .values({
        division_id: divisionId,
        stage: 'champions',
        status: 'not-started',
        awards: {},
        stage_data: {}
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }
}
