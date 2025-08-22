import { Kysely } from 'kysely';
import { KyselyDatabaseSchema } from '../schema/kysely';
import { InsertableEvent, Event } from '../schema/tables/events';
import { TeamWithDivision, Team } from '../schema';

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

  async getRegisteredTeams(): Promise<TeamWithDivision[]> {
    const event = await this.get();

    if (!event) {
      throw new Error('Event not found');
    }

    const teamsWithDivisions = await this.db
      .selectFrom('teams')
      .innerJoin('team_divisions', 'team_divisions.team_id', 'teams.id')
      .innerJoin('divisions', 'divisions.id', 'team_divisions.division_id')
      .where('divisions.event_id', '=', event.id)
      .select([
        'teams.id',
        'teams.number',
        'teams.name',
        'teams.logo_url',
        'teams.affiliation',
        'teams.city',
        'teams.coordinates',
        'divisions.id as division_id',
        'divisions.name as division_name',
        'divisions.color as division_color',
        'divisions.event_id as division_event_id'
      ])
      .orderBy('divisions.name', 'asc')
      .orderBy('teams.number', 'asc')
      .execute();

    return teamsWithDivisions;
  }

  async getAvailableTeams(): Promise<Team[]> {
    const event = await this.get();

    if (!event) {
      throw new Error('Event not found');
    }

    const availableTeams = await this.db
      .selectFrom('teams')
      .leftJoin('team_divisions', 'team_divisions.team_id', 'teams.id')
      .leftJoin('divisions', join =>
        join
          .onRef('divisions.id', '=', 'team_divisions.division_id')
          .on('divisions.event_id', '=', event.id)
      )
      .where('divisions.id', 'is', null)
      .select([
        'teams.id',
        'teams.pk',
        'teams.number',
        'teams.name',
        'teams.logo_url',
        'teams.affiliation',
        'teams.city',
        'teams.coordinates'
      ])
      .orderBy('teams.number', 'asc')
      .execute();

    return availableTeams;
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
