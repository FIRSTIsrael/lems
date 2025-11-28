import { Kysely } from 'kysely';
import { KyselyDatabaseSchema } from '../schema/kysely';
import {
  InsertableAgendaEvent,
  AgendaEvent,
  UpdateableAgendaEvent
} from '../schema/tables/agenda-events';

export class AgendaEventSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private id: string
  ) {}

  private getEventQuery() {
    return this.db.selectFrom('agenda_events').selectAll().where('id', '=', this.id);
  }

  async get(): Promise<AgendaEvent | null> {
    const event = await this.getEventQuery().executeTakeFirst();
    return event || null;
  }

  async update(updates: UpdateableAgendaEvent): Promise<AgendaEvent> {
    const [updatedEvent] = await this.db
      .updateTable('agenda_events')
      .set(updates)
      .where('id', '=', this.id)
      .returningAll()
      .execute();

    if (!updatedEvent) {
      throw new Error(`Agenda event with id ${this.id} not found`);
    }

    return updatedEvent;
  }

  async delete(): Promise<void> {
    await this.db.deleteFrom('agenda_events').where('id', '=', this.id).execute();
  }
}

class AgendaEventsSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private divisionId: string
  ) {}

  async getAll(): Promise<AgendaEvent[]> {
    return await this.db
      .selectFrom('agenda_events')
      .selectAll()
      .where('division_id', '=', this.divisionId)
      .orderBy('start_time', 'asc')
      .execute();
  }

  async getByVisibility(visibility: string): Promise<AgendaEvent[]> {
    return await this.db
      .selectFrom('agenda_events')
      .selectAll()
      .where('division_id', '=', this.divisionId)
      .where('visibility', '=', visibility)
      .orderBy('start_time', 'asc')
      .execute();
  }

  async deleteAll(): Promise<number> {
    const result = await this.db
      .deleteFrom('agenda_events')
      .where('division_id', '=', this.divisionId)
      .execute();

    return result.length;
  }
}

export class AgendaEventsRepository {
  constructor(private db: Kysely<KyselyDatabaseSchema>) {}

  byId(id: string): AgendaEventSelector {
    return new AgendaEventSelector(this.db, id);
  }

  byDivisionId(divisionId: string): AgendaEventsSelector {
    return new AgendaEventsSelector(this.db, divisionId);
  }

  async getAll(): Promise<AgendaEvent[]> {
    return await this.db.selectFrom('agenda_events').selectAll().execute();
  }

  async create(event: InsertableAgendaEvent): Promise<AgendaEvent> {
    const dbEvent = await this.db
      .insertInto('agenda_events')
      .values(event)
      .returningAll()
      .executeTakeFirst();

    if (!dbEvent) {
      throw new Error('Failed to create agenda event');
    }

    return dbEvent;
  }

  async createMany(events: InsertableAgendaEvent[]): Promise<AgendaEvent[]> {
    if (events.length === 0) {
      return [];
    }

    return await this.db
      .insertInto('agenda_events')
      .values(events)
      .returningAll()
      .execute();
  }
}
