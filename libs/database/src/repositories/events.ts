import { Kysely } from 'kysely';
import { KyselyDatabaseSchema } from '../schema/kysely';
import { InsertableEvent, Event } from '../schema/tables/events';

class EventSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private selector: { type: 'id' | 'slug'; value: string }
  ) {}

  private getEventQuery() {
    const query = this.db.selectFrom('events').selectAll();
    return query.where(this.selector.type, '=', this.selector.value);
  }

  async get(): Promise<Event | null> {
    const event = await this.getEventQuery().executeTakeFirst();
    return event || null;
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
