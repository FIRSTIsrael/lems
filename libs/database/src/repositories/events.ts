import { Kysely } from 'kysely';
import { KyselyDatabaseSchema } from '../schema/kysely';
import { InsertableEvent, Event, EventSummary } from '../schema/tables/events';

class EventSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private selector: { type: 'id' | 'slug' | 'season_id'; value: string }
  ) {}

  private getEventQuery() {
    const query = this.db.selectFrom('events').selectAll();
    return query.where(this.selector.type, '=', this.selector.value);
  }

  async get(): Promise<Event | null> {
    const event = await this.getEventQuery().executeTakeFirst();
    return event || null;
  }

  async getAll(): Promise<Event[]> {
    const events = await this.getEventQuery().execute();
    return events;
  }

  async summarizeAll(): Promise<EventSummary[]> {
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
      .where(this.selector.type, '=', this.selector.value)
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

export class EventsRepository {
  constructor(private db: Kysely<KyselyDatabaseSchema>) {}

  byId(id: string): EventSelector {
    return new EventSelector(this.db, { type: 'id', value: id });
  }

  bySlug(slug: string): EventSelector {
    return new EventSelector(this.db, { type: 'slug', value: slug });
  }

  bySeason(seasonId: string): EventSelector {
    return new EventSelector(this.db, { type: 'season_id', value: seasonId });
  }

  async getAll() {
    const events = await this.db.selectFrom('events').selectAll().execute();
    return events;
  }

  async create(event: InsertableEvent): Promise<Event> {
    const [createdEvent] = await this.db
      .insertInto('events')
      .values(event)
      .returningAll()
      .execute();
    return createdEvent;
  }
}
