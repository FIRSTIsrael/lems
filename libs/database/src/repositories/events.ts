import { Kysely } from 'kysely';
import { KyselyDatabaseSchema } from '../schema/kysely';
import { InsertableEvent, Event, UpdateableEvent, EventSummary } from '../schema/tables/events';
import { TeamWithDivision, Team, Division, Admin } from '../schema';

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

  async update(updateData: UpdateableEvent): Promise<Event | null> {
    const updatedEvent = await this.db
      .updateTable('events')
      .set(updateData)
      .where(this.selector.type, '=', this.selector.value)
      .returningAll()
      .executeTakeFirst();

    return updatedEvent || null;
  }

  async getAdmins(): Promise<Admin[]> {
    const event = await this.get();

    if (!event) {
      throw new Error('Event not found');
    }

    const users = await this.db
      .selectFrom('admin_events')
      .innerJoin('admins', 'admins.id', 'admin_events.admin_id')
      .where('admin_events.event_id', '=', event.id)
      .selectAll()
      .execute();

    return users;
  }

  async addAdmin(adminId: string): Promise<void> {
    const event = await this.get();

    if (!event) {
      throw new Error('Event not found');
    }

    await this.db
      .insertInto('admin_events')
      .values({
        event_id: event.id,
        admin_id: adminId
      })
      .execute();
  }

  async getDivisions(): Promise<Division[]> {
    const event = await this.get();

    if (!event) {
      throw new Error('Event not found');
    }

    const divisions = await this.db
      .selectFrom('divisions')
      .where('event_id', '=', event.id)
      .selectAll()
      .execute();

    return divisions;
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

    const registeredTeams = await this.db
      .selectFrom('team_divisions')
      .innerJoin('divisions', 'divisions.id', 'team_divisions.division_id')
      .where('divisions.event_id', '=', event.id)
      .select('team_divisions.team_id')
      .execute();

    const registeredTeamIds = new Set(registeredTeams.map(row => row.team_id));

    let query = this.db.selectFrom('teams').selectAll().orderBy('teams.number', 'asc');

    if (registeredTeamIds.size > 0) {
      query = query.where('teams.id', 'not in', Array.from(registeredTeamIds));
    }

    const availableTeams = await query.execute();
    return availableTeams;
  }

  /**
   * Registers teams for a specific event.
   * @param registration An object mapping division IDs to arrays of team IDs.
   * @returns
   */
  async registerTeams(registration: Record<string, string[]>): Promise<void> {
    return this.db.transaction().execute(async trx => {
      const divisions = await this.getDivisions();
      if (!divisions || divisions.length === 0) {
        throw new Error('Event divisions not found');
      }
      const divisionIds = divisions.map(division => division.id);
      const teamIds = [...new Set(Object.values(registration).flat())];

      const teamsInEvent = new Set(
        await trx
          .selectFrom('team_divisions')
          .select('team_id')
          .where('division_id', 'in', divisionIds)
          .where('team_id', 'in', teamIds)
          .execute()
          .then(rows => rows.map(row => row.team_id))
      );

      const rows = Object.entries(registration).flatMap(([divisionId, _teamIds]) => {
        return _teamIds
          .filter(id => !teamsInEvent.has(id))
          .map(teamId => ({
            team_id: teamId,
            division_id: divisionId
          }));
      });

      await Promise.all(
        rows.map(({ team_id, division_id }) =>
          trx.insertInto('team_divisions').values({ team_id, division_id }).execute()
        )
      );
    });
  }
}

class EventsSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private selector: { type: 'after' | 'bySeason'; value: number | string }
  ) {}

  private getEventsQuery() {
    let query = this.db.selectFrom('events').selectAll();

    if (this.selector.type === 'after') {
      query = query.where('start_date', '>=', new Date(this.selector.value as number));
    } else if (this.selector.type === 'bySeason') {
      query = query.where('season_id', '=', this.selector.value as string);
    }

    return query.orderBy('start_date', 'asc');
  }

  async getAll(): Promise<Event[]> {
    return await this.getEventsQuery().execute();
  }

  async getAllSummaries(): Promise<EventSummary[]> {
    let query = this.db
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
      .select(eb => [eb.fn.count('team_divisions.team_id').as('team_count')]);

    if (this.selector.type === 'after') {
      query = query.where('events.start_date', '>=', new Date(this.selector.value as number));
    } else if (this.selector.type === 'bySeason') {
      query = query.where('events.season_id', '=', this.selector.value as string);
    }

    query = query.groupBy([
      'events.id',
      'events.name',
      'events.slug',
      'events.start_date',
      'events.location',
      'events.season_id',
      'divisions.id',
      'divisions.name',
      'divisions.color'
    ]);

    const result = await query.execute();

    let adminQuery = this.db
      .selectFrom('admin_events')
      .innerJoin('events', 'events.id', 'admin_events.event_id')
      .select(['admin_events.event_id', 'admin_events.admin_id']);

    if (this.selector.type === 'after') {
      adminQuery = adminQuery.where(
        'events.start_date',
        '>=',
        new Date(this.selector.value as number)
      );
    } else if (this.selector.type === 'bySeason') {
      adminQuery = adminQuery.where('events.season_id', '=', this.selector.value as string);
    }

    const adminAssignments = await adminQuery.execute();

    const adminsByEvent = new Map<string, string[]>();
    for (const assignment of adminAssignments) {
      if (!adminsByEvent.has(assignment.event_id)) {
        adminsByEvent.set(assignment.event_id, []);
      }
      adminsByEvent.get(assignment.event_id)!.push(assignment.admin_id);
    }

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
          is_fully_set_up: false,
          assigned_admin_ids: adminsByEvent.get(eventId) || []
        });
      }

      const event = eventsMap.get(eventId);
      event.team_count += Number(row.team_count);

      const divisionExists = event.divisions.some(
        (div: { id: string; name: string; color: string }) => div.id === row.division_id
      );
      if (!divisionExists) {
        event.divisions.push({
          id: row.division_id,
          name: row.division_name,
          color: row.division_color
        });
      }
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

  after(timestamp: number): EventsSelector {
    return new EventsSelector(this.db, { type: 'after', value: timestamp });
  }

  bySeason(seasonId: string): EventsSelector {
    return new EventsSelector(this.db, { type: 'bySeason', value: seasonId });
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
