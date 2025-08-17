import { Kysely } from 'kysely';
import { KyselyDatabaseSchema } from '../schema/kysely';
import { ObjectStorage } from '../object-storage';
import { Event, EventSummary, InsertableSeason, Season } from '../schema';

class SeasonSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private space: ObjectStorage,
    private selector: { type: 'id' | 'slug'; value: string }
  ) {}

  private getSeasonQuery() {
    const query = this.db.selectFrom('seasons').selectAll();
    return query.where(this.selector.type, '=', this.selector.value);
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

  async getEvents(): Promise<Event[]> {
    const season = await this.get();
    if (!season) throw new Error('Season not found');

    const events = await this.db
      .selectFrom('events')
      .selectAll()
      .where('season_id', '=', season.id)
      .execute();

    return events;
  }

  async getSummarizedEvents(): Promise<EventSummary[]> {
    const season = await this.get();

    if (!season) {
      throw new Error('Season not found');
    }

    const result = await this.db
      .selectFrom('events')
      .innerJoin('divisions', 'divisions.event_id', 'events.id')
      .leftJoin('team_divisions', 'team_divisions.division_id', 'divisions.id')
      .select([
        'events.id',
        'events.name',
        'events.slug',
        'events.start_date',
        'events.location',
        'events.season_id',
        'divisions.id as division_id',
        'divisions.name as division_name',
        'divisions.color as division_color'
      ])
      .select(eb => [eb.fn.count('team_divisions.team_id').as('team_count')])
      .where('season_id', '=', season.id)
      .groupBy([
        'events.id',
        'events.name',
        'events.slug',
        'events.start_date',
        'events.location',
        'events.season_id',
        'divisions.id',
        'divisions.name',
        'divisions.color'
      ])
      .execute();

    const eventsMap = new Map();

    for (const row of result) {
      const eventId = row.id;

      if (!eventsMap.has(eventId)) {
        eventsMap.set(eventId, {
          id: row.id,
          name: row.name,
          slug: row.slug,
          date: row.start_date.toISOString(),
          location: row.location,
          team_count: 0,
          divisions: [],
          is_fully_set_up: false
        });
      }

      const event = eventsMap.get(eventId);
      event.team_count += Number(row.team_count);
      event.divisions.push({
        id: row.division_id,
        name: row.division_name,
        color: row.division_color
      });
    }

    return Array.from(eventsMap.values());
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
