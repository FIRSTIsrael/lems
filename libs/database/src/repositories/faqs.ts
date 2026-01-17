import { Kysely } from 'kysely';
import { KyselyDatabaseSchema } from '../schema/kysely';
import { InsertableFaq, Faq, UpdateableFaq } from '../schema/tables/faqs';

class FaqSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private faqId: string
  ) {}

  private getFaqQuery() {
    return this.db.selectFrom('faqs').selectAll().where('id', '=', this.faqId);
  }

  async get(): Promise<Faq | null> {
    const faq = await this.getFaqQuery().executeTakeFirst();
    return faq || null;
  }

  async update(updates: UpdateableFaq): Promise<Faq> {
    const [updatedFaq] = await this.db
      .updateTable('faqs')
      .set({ ...updates, updated_at: new Date() })
      .where('id', '=', this.faqId)
      .returningAll()
      .execute();
    return updatedFaq;
  }

  async delete(): Promise<void> {
    await this.db.deleteFrom('faqs').where('id', '=', this.faqId).execute();
  }
}

class FaqsSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private seasonId?: string
  ) {}

  private getBaseQuery() {
    let query = this.db.selectFrom('faqs').selectAll();
    if (this.seasonId) {
      query = query.where('season_id', '=', this.seasonId);
    }
    return query;
  }

  async getAll(): Promise<Faq[]> {
    return await this.getBaseQuery().orderBy('display_order', 'asc').execute();
  }

  async search(searchTerm: string): Promise<Faq[]> {
    const term = `%${searchTerm}%`;
    return await this.getBaseQuery()
      .where(eb =>
        eb.or([
          eb('question', 'ilike', term),
          eb('answer', 'ilike', term)
        ])
      )
      .orderBy('display_order', 'asc')
      .execute();
  }
}

export class FaqsRepository {
  constructor(private db: Kysely<KyselyDatabaseSchema>) {}

  byId(faqId: string): FaqSelector {
    return new FaqSelector(this.db, faqId);
  }

  bySeason(seasonId: string): FaqsSelector {
    return new FaqsSelector(this.db, seasonId);
  }

  all(): FaqsSelector {
    return new FaqsSelector(this.db);
  }

  async create(faq: InsertableFaq): Promise<Faq> {
    const [createdFaq] = await this.db
      .insertInto('faqs')
      .values(faq)
      .returningAll()
      .execute();
    return createdFaq;
  }

  async getMaxDisplayOrder(seasonId: string): Promise<number> {
    const result = await this.db
      .selectFrom('faqs')
      .select(eb => eb.fn.max('display_order').as('max_order'))
      .where('season_id', '=', seasonId)
      .executeTakeFirst();
    return (result?.max_order as number) || 0;
  }
}
