import { Kysely } from 'kysely';
import { KyselyDatabaseSchema } from '../schema/kysely';
import { InsertableFaq, Faq, UpdateableFaq } from '../schema/tables/faqs';

export interface FaqWithCreator extends Faq {
  creator_first_name: string;
  creator_last_name: string;
}

const FAQ_FIELDS = [
  'faqs.pk',
  'faqs.id',
  'faqs.season_id',
  'faqs.question',
  'faqs.answer',
  'faqs.display_order',
  'faqs.created_by',
  'faqs.created_at',
  'faqs.updated_at',
  'admins.first_name as creator_first_name',
  'admins.last_name as creator_last_name'
] as const;

class FaqSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private faqId: string
  ) {}

  private getFaqQuery() {
    return this.db
      .selectFrom('faqs')
      .innerJoin('admins', 'faqs.created_by', 'admins.id')
      .select(FAQ_FIELDS)
      .where('faqs.id', '=', this.faqId);
  }

  async get(): Promise<FaqWithCreator | null> {
    const faq = await this.getFaqQuery().executeTakeFirst();
    return faq || null;
  }

  async update(updates: UpdateableFaq): Promise<FaqWithCreator> {
    await this.db
      .updateTable('faqs')
      .set({ ...updates, updated_at: new Date() })
      .where('id', '=', this.faqId)
      .execute();
    
    const updatedFaq = await this.get();
    if (!updatedFaq) {
      throw new Error('FAQ not found after update');
    }
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
    let query = this.db
      .selectFrom('faqs')
      .innerJoin('admins', 'faqs.created_by', 'admins.id')
      .select(FAQ_FIELDS);
    if (this.seasonId) {
      query = query.where('season_id', '=', this.seasonId);
    }
    return query;
  }

  async getAll(): Promise<FaqWithCreator[]> {
    return await this.getBaseQuery().orderBy('display_order', 'asc').execute();
  }

  async search(searchTerm: string): Promise<FaqWithCreator[]> {
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

  async create(faq: InsertableFaq): Promise<FaqWithCreator> {
    const [createdFaq] = await this.db
      .insertInto('faqs')
      .values(faq)
      .returning('id')
      .execute();
    
    const faqWithCreator = await this.byId(createdFaq.id).get();
    if (!faqWithCreator) {
      throw new Error('FAQ not found after creation');
    }
    return faqWithCreator;
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
