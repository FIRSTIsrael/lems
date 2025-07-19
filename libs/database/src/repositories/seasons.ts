import { Kysely } from 'kysely';
import { KyselyDatabaseSchema } from '../schema/kysely';
import { ObjectStorage } from '../object-storage';
import { InsertableSeason, Season } from '../schema/tables/seasons';

class SeasonSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private space: ObjectStorage,
    private selector: { type: 'id' | 'slug'; value: string }
  ) {}

  private getSeasonQuery() {
    const query = this.db.selectFrom('seasons').selectAll();

    if (this.selector.type === 'id') {
      return query.where('id', '=', this.selector.value);
    } else {
      return query.where('slug', '=', this.selector.value);
    }
  }

  async get(): Promise<Season | null> {
    const season = await this.getSeasonQuery().executeTakeFirst();
    return season || null;
  }

  async updateLogo(logo: Buffer): Promise<Season | null> {
    const season = await this.get();
    if (!season) return null;

    const logoUrl = await this.space
      .putObject(`seasons/${season.id}/logo.svg`, logo, 'image/svg+xml')
      .catch(error => {
        console.error('Error uploading logo:', error);
        throw new Error('Failed to upload logo');
      });

    const updatedSeason = await this.db
      .updateTable('seasons')
      .set({ logo_url: logoUrl })
      .where('id', '=', season.id)
      .returningAll()
      .executeTakeFirst();

    return updatedSeason || null;
  }
}

export class SeasonsRepository {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private space: ObjectStorage
  ) {}

  byId(id: string): SeasonSelector {
    return new SeasonSelector(this.db, this.space, { type: 'id', value: id });
  }

  bySlug(slug: string): SeasonSelector {
    return new SeasonSelector(this.db, this.space, {
      type: 'slug',
      value: slug
    });
  }

  async getCurrent(): Promise<Season | null> {
    const currentDate = new Date();
    const season = await this.db
      .selectFrom('seasons')
      .selectAll()
      .where('start_date', '<=', currentDate)
      .where('end_date', '>=', currentDate)
      .executeTakeFirst();
    return season || null;
  }

  async getAll(): Promise<Season[]> {
    const seasons = await this.db
      .selectFrom('seasons')
      .selectAll()
      .orderBy('start_date', 'desc')
      .execute();
    return seasons;
  }

  async create(season: InsertableSeason): Promise<Season> {
    const [createdSeason] = await this.db
      .insertInto('seasons')
      .values(season)
      .returningAll()
      .execute();
    return createdSeason;
  }
}
