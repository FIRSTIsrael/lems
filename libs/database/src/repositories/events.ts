import { Kysely } from 'kysely';
import { KyselyDatabaseSchema } from '../schema/kysely';
import { InsertableEvent, Event } from '../schema/tables/events';
import { TeamWithDivision, Team, Division } from '../schema';

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

    const availableTeams = await this.db
      .selectFrom('teams')
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
      .where('teams.id', 'not in', Array.from(registeredTeamIds))
      .orderBy('teams.number', 'asc')
      .execute();

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
