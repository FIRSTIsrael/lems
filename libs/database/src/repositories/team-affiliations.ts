import { Kysely } from 'kysely';
import { KyselyDatabaseSchema } from '../schema/kysely';
import { InsertableTeamAffiliation, TeamAffiliation } from '../schema/tables/team-affiliations';

export class TeamAffiliationsRepository {
  constructor(private db: Kysely<KyselyDatabaseSchema>) {}

  async create(affiliation: InsertableTeamAffiliation): Promise<TeamAffiliation> {
    const [createdAffiliation] = await this.db
      .insertInto('team_affiliations')
      .values(affiliation)
      .returningAll()
      .execute();
    return createdAffiliation;
  }

  async getAll(): Promise<TeamAffiliation[]> {
    const affiliations = await this.db.selectFrom('team_affiliations').selectAll().execute();
    return affiliations;
  }

  async getById(id: string): Promise<TeamAffiliation | null> {
    const affiliation = await this.db
      .selectFrom('team_affiliations')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
    return affiliation || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.deleteFrom('team_affiliations').where('id', '=', id).execute();
    return result.length > 0;
  }
}
