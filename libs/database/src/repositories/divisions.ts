import { Kysely } from 'kysely';
import { KyselyDatabaseSchema } from '../schema/kysely';
import { InsertableDivision, Division } from '../schema/tables/divisions';

class DivisionSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private selector: { type: 'id' | 'event_id'; value: string }
  ) {}

  private getDivisionQuery() {
    const query = this.db.selectFrom('divisions').selectAll();
    return query.where(this.selector.type, '=', this.selector.value);
  }

  async get(): Promise<Division | null> {
    const division = await this.getDivisionQuery().executeTakeFirst();
    return division || null;
  }

  async getAll(): Promise<Division[]> {
    return await this.getDivisionQuery().execute();
  }

  async delete(): Promise<boolean | null> {
    const result = await this.db
      .deleteFrom('divisions')
      .where(this.selector.type, '=', this.selector.value)
      .execute();
    return result.length > 0;
  }

  /**
   * Registers teams for a specific event.
   * @param registration An object mapping division IDs to arrays of team IDs.
   * @returns
   */
  async registerTeams(registration: Record<string, string[]>): Promise<void> {
    return this.db.transaction().execute(async trx => {
      if (this.selector.type !== 'event_id') {
        throw new Error('Teams can only be registered by event ID');
      }

      const divisions = await this.getAll();
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

export class DivisionsRepository {
  constructor(private db: Kysely<KyselyDatabaseSchema>) {}

  byId(id: string): DivisionSelector {
    return new DivisionSelector(this.db, { type: 'id', value: id });
  }

  byEventId(eventId: string): DivisionSelector {
    return new DivisionSelector(this.db, { type: 'event_id', value: eventId });
  }

  async create(division: InsertableDivision): Promise<Division> {
    const [createdDivision] = await this.db
      .insertInto('divisions')
      .values(division)
      .returningAll()
      .execute();
    return createdDivision;
  }

  async createMany(divisions: InsertableDivision[]): Promise<Division[]> {
    if (divisions.length === 0) {
      return [];
    }

    return await this.db.insertInto('divisions').values(divisions).returningAll().execute();
  }
}
