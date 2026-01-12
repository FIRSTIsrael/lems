import { Kysely } from 'kysely';
import { Db as MongoDb } from 'mongodb';
import { KyselyDatabaseSchema } from '../schema/kysely';
import { ObjectStorage } from '../object-storage';
import { DivisionState } from '../schema/documents/division-state';
import {
  InsertableDivision,
  Division,
  UpdateableDivision,
  DivisionSummary
} from '../schema/tables/divisions';
import {
  AgendaEvent,
  InsertableAgendaEvent,
  UpdateableAgendaEvent
} from '../schema/tables/agenda-events';

class DivisionAgendaSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private divisionId: string
  ) {}

  async delete(): Promise<number> {
    const result = await this.db
      .deleteFrom('agenda_events')
      .where('division_id', '=', this.divisionId)
      .execute();
    return result.length;
  }

  async getAll(visibility?: string): Promise<AgendaEvent[]> {
    let query = this.db
      .selectFrom('agenda_events')
      .selectAll()
      .where('division_id', '=', this.divisionId)
      .orderBy('start_time', 'asc');

    if (visibility) {
      query = query.where('visibility', '=', visibility);
    }

    return await query.execute();
  }

  async create(agendaEvent: InsertableAgendaEvent): Promise<AgendaEvent> {
    const [createdEvent] = await this.db
      .insertInto('agenda_events')
      .values({ ...agendaEvent, division_id: this.divisionId })
      .returningAll()
      .execute();
    return createdEvent;
  }

  async createMany(agendaEvents: InsertableAgendaEvent[]): Promise<AgendaEvent[]> {
    if (agendaEvents.length === 0) {
      return [];
    }

    const eventsWithDivision = agendaEvents.map(event => ({
      ...event,
      division_id: this.divisionId
    }));

    return await this.db
      .insertInto('agenda_events')
      .values(eventsWithDivision)
      .returningAll()
      .execute();
  }

  async update(agendaEventId: string, updatedEvent: UpdateableAgendaEvent): Promise<boolean> {
    const result = await this.db
      .updateTable('agenda_events')
      .set(updatedEvent)
      .where('id', '=', agendaEventId)
      .where('division_id', '=', this.divisionId)
      .execute();
    return result.length > 0;
  }

  async get(id: string): Promise<AgendaEvent | null> {
    const event = await this.db
      .selectFrom('agenda_events')
      .selectAll()
      .where('id', '=', id)
      .where('division_id', '=', this.divisionId)
      .executeTakeFirst();
    return event || null;
  }
}

class DivisionSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private space: ObjectStorage,
    private mongo: MongoDb,
    private selector: { type: 'id'; value: string }
  ) {}

  async get(): Promise<Division | null> {
    const division = await this.db
      .selectFrom('divisions')
      .selectAll()
      .where(this.selector.type, '=', this.selector.value)
      .executeTakeFirst();
    return division || null;
  }

  async update(newDivision: UpdateableDivision): Promise<boolean> {
    const result = await this.db
      .updateTable('divisions')
      .set(newDivision)
      .where(this.selector.type, '=', this.selector.value)
      .execute();
    return result.length > 0;
  }

  async delete(): Promise<boolean | null> {
    // Delete division state from MongoDB
    await this.mongo
      .collection<DivisionState>('division_states')
      .deleteOne({ divisionId: this.selector.value });

    const result = await this.db
      .deleteFrom('divisions')
      .where(this.selector.type, '=', this.selector.value)
      .execute();
    return result.length > 0;
  }

  async updatePitMap(pitMap: Buffer): Promise<Division | null> {
    const division = await this.get();
    if (!division) return null;

    const pitMapUrl = await this.space
      .putObject(`divisions/${division.id}/pit_map.jpg`, pitMap, 'image/jpeg')
      .catch(error => {
        console.error('Error uploading pit map:', error);
        throw new Error('Failed to upload pit map');
      });

    const updatedDivision = await this.db
      .updateTable('divisions')
      .set({ pit_map_url: pitMapUrl })
      .where(this.selector.type, '=', division.id)
      .returningAll()
      .executeTakeFirst();

    return updatedDivision || null;
  }

  agenda(): DivisionAgendaSelector {
    return new DivisionAgendaSelector(this.db, this.selector.value);
  }
}

class DivisionsSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private space: ObjectStorage,
    private eventId: string
  ) {}

  async getAll(): Promise<Division[]> {
    return await this.db
      .selectFrom('divisions')
      .selectAll()
      .where('event_id', '=', this.eventId)
      .orderBy('name', 'asc')
      .execute();
  }

  async getAllSummaries(): Promise<DivisionSummary[]> {
    const divisions = await this.db
      .selectFrom('divisions')
      .selectAll()
      .where('event_id', '=', this.eventId)
      .orderBy('name', 'asc')
      .execute();

    for (const division of divisions as DivisionSummary[]) {
      const [{ team_count }] = await this.db
        .selectFrom('team_divisions')
        .where('division_id', '=', division.id)
        .select(db => db.fn.count<number>('team_id').as('team_count'))
        .execute();
      division.team_count = team_count;
    }
    return divisions as DivisionSummary[];
  }

  async deleteAll(): Promise<number> {
    const result = await this.db
      .deleteFrom('divisions')
      .where('event_id', '=', this.eventId)
      .execute();

    return result.length;
  }
}

export class DivisionsRepository {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private space: ObjectStorage,
    private mongo: MongoDb
  ) {}

  byId(id: string): DivisionSelector {
    return new DivisionSelector(this.db, this.space, this.mongo, { type: 'id', value: id });
  }

  byEventId(eventId: string): DivisionsSelector {
    return new DivisionsSelector(this.db, this.space, eventId);
  }

  async create(division: InsertableDivision): Promise<Division> {
    const [createdDivision] = await this.db
      .insertInto('divisions')
      .values(division)
      .returningAll()
      .execute();

    // Create division state in MongoDB with default audience display
    await this.mongo
      .collection<DivisionState>('division_states')
      .insertOne({
        divisionId: createdDivision.id,
        audienceDisplay: {
          activeDisplay: 'logo'
        }
      });

    return createdDivision;
  }

  async createMany(divisions: InsertableDivision[]): Promise<Division[]> {
    if (divisions.length === 0) {
      return [];
    }

    const createdDivisions = await this.db
      .insertInto('divisions')
      .values(divisions)
      .returningAll()
      .execute();

    // Create division states in MongoDB for each division with default audience display
    const divisionStates: DivisionState[] = createdDivisions.map(division => ({
      divisionId: division.id,
      audienceDisplay: {
        activeDisplay: 'logo'
      }
    }));

    if (divisionStates.length > 0) {
      await this.mongo.collection<DivisionState>('division_states').insertMany(divisionStates);
    }

    return createdDivisions;
  }
}
