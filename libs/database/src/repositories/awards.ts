import { Kysely } from 'kysely';
import { KyselyDatabaseSchema } from '../schema/kysely';
import { InsertableAward, Award, UpdatableAward } from '../schema/tables/awards';

class AwardsSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private divisionId: string
  ) {}

  private getAwardsQuery() {
    return this.db.selectFrom('awards').selectAll().where('division_id', '=', this.divisionId);
  }

  async getAll(): Promise<Award[]> {
    return await this.getAwardsQuery()
      .orderBy('awards.index', 'asc')
      .orderBy('awards.place', 'asc')
      .execute();
  }

  async getByTeam(teamId: string): Promise<Award[]> {
    return await this.getAwardsQuery()
      .where('winner_id', '=', teamId)
      .orderBy('awards.place', 'asc')
      .execute();
  }

  async get(name: string): Promise<Award[]> {
    return await this.getAwardsQuery()
      .where('name', '=', name)
      .orderBy('awards.place', 'asc')
      .execute();
  }

  async deleteAll(): Promise<boolean> {
    const result = await this.db
      .deleteFrom('awards')
      .where('division_id', '=', this.divisionId)
      .execute();
    return result.length > 0;
  }

  async delete(name: string): Promise<boolean> {
    const result = await this.db
      .deleteFrom('awards')
      .where('division_id', '=', this.divisionId)
      .where('name', '=', name)
      .execute();
    return result.length > 0;
  }
}

export class AwardsRepository {
  constructor(private db: Kysely<KyselyDatabaseSchema>) {}

  byDivisionId(divisionId: string): AwardsSelector {
    return new AwardsSelector(this.db, divisionId);
  }

  async create(award: InsertableAward): Promise<Award> {
    const [createdAward] = await this.db
      .insertInto('awards')
      .values(award)
      .returningAll()
      .execute();
    return createdAward;
  }

  async createMany(awards: InsertableAward[]): Promise<Award[]> {
    if (awards.length === 0) {
      return [];
    }

    return await this.db.insertInto('awards').values(awards).returningAll().execute();
  }

  async assign(id: string, winner: string): Promise<Award | null> {
    const award = await this.db
      .selectFrom('awards')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!award) {
      throw new Error('Award not found');
    }

    const isPersonalAward = award.type === 'PERSONAL';

    let updateFields: Partial<UpdatableAward>;

    if (isPersonalAward) {
      updateFields = {
        winner_name: winner,
        winner_id: null
      };
    } else {
      updateFields = {
        winner_id: winner,
        winner_name: null
      };
    }

    const updatedAward = await this.db
      .updateTable('awards')
      .set(updateFields)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return updatedAward || null;
  }
}
