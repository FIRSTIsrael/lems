import { Kysely, sql, RawBuilder } from 'kysely';
import { KyselyDatabaseSchema } from '../schema/kysely';
import {
  EventIntegration,
  InsertableEventIntegration,
  UpdateableEventIntegration
} from '../schema/tables/event-integrations';

function json<T>(value: T): RawBuilder<T> {
  return sql`CAST(${JSON.stringify(value)} AS JSONB)`;
}

class EventIntegrationSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private selector: { type: 'id' | 'type'; value: string; eventId?: string }
  ) {}

  async get(): Promise<EventIntegration | null> {
    let query = this.db.selectFrom('event_integrations').selectAll();

    if (this.selector.type === 'id') {
      query = query.where('pk', '=', parseInt(this.selector.value));
    } else if (this.selector.type === 'type' && this.selector.eventId) {
      query = query
        .where('event_id', '=', this.selector.eventId)
        .where('integration_type', '=', this.selector.value);
    }

    const result = await query.executeTakeFirst();
    return result || null;
  }

  async update(data: UpdateableEventIntegration): Promise<EventIntegration> {
    const result = await this.db
      .updateTable('event_integrations')
      .set({
        ...data,
        updated_at: new Date()
      })
      .where('pk', '=', parseInt(this.selector.value))
      .returningAll()
      .executeTakeFirstOrThrow();

    return result;
  }

  async delete(): Promise<void> {
    if (this.selector.type === 'id') {
      await this.db
        .deleteFrom('event_integrations')
        .where('pk', '=', parseInt(this.selector.value))
        .execute();
    }
  }
}

class EventIntegrationsSettingsSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private settings: Record<string, string>
  ) {}

  async get(): Promise<EventIntegration | null> {
    const result = await this.db
      .selectFrom('event_integrations')
      .selectAll()
      .where('settings', '@>', json(this.settings))
      .executeTakeFirst();
    return result || null;
  }

  async getAll(): Promise<EventIntegration[]> {
    return this.db
      .selectFrom('event_integrations')
      .selectAll()
      .where('settings', '@>', json(this.settings))
      .execute();
  }
}

class EventIntegrationsSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private eventId: string
  ) {}

  async getAll(): Promise<EventIntegration[]> {
    return this.db
      .selectFrom('event_integrations')
      .selectAll()
      .where('event_id', '=', this.eventId)
      .orderBy('created_at', 'asc')
      .execute();
  }

  async getByType(type: string): Promise<EventIntegration | null> {
    const result = await this.db
      .selectFrom('event_integrations')
      .selectAll()
      .where('event_id', '=', this.eventId)
      .where('integration_type', '=', type)
      .executeTakeFirst();
    return result || null;
  }
}

export class EventIntegrationsRepository {
  constructor(private db: Kysely<KyselyDatabaseSchema>) {}

  byId(id: string) {
    return new EventIntegrationSelector(this.db, { type: 'id', value: id });
  }

  byType(eventId: string, type: string) {
    return new EventIntegrationSelector(this.db, { type: 'type', value: type, eventId });
  }

  byEventId(eventId: string) {
    return new EventIntegrationsSelector(this.db, eventId);
  }

  bySettings(settings: Record<string, string>) {
    return new EventIntegrationsSettingsSelector(this.db, settings);
  }

  async create(data: InsertableEventIntegration): Promise<EventIntegration> {
    const result = await this.db
      .insertInto('event_integrations')
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();

    return result;
  }
}
