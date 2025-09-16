import { Kysely } from 'kysely';
import { KyselyDatabaseSchema } from '../schema/kysely';
import { ObjectStorage } from '../object-storage';
import { InsertableDivision, Division, UpdateableDivision } from '../schema/tables/divisions';
import {
  Team,
  JudgingRoom,
  RobotGameTable
} from '../schema';

class DivisionSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private space: ObjectStorage,
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
    return await this.getDivisionQuery().orderBy('name', 'asc').execute();
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

  async getTables(): Promise<RobotGameTable[]> {
    const division = await this.get();

    if (!division) {
      throw new Error('Division not found');
    }

    return await this.db
      .selectFrom('robot_game_tables')
      .selectAll()
      .where('division_id', '=', division.id)
      .execute();
  }



  async getRooms(): Promise<JudgingRoom[]> {
    const division = await this.get();

    if (!division) {
      throw new Error('Division not found');
    }

    return await this.db
      .selectFrom('judging_rooms')
      .selectAll()
      .where('division_id', '=', division.id)
      .execute();
  }

  async getTeams(): Promise<Team[]> {
    const division = await this.get();
    if (!division) {
      throw new Error('Division not found');
    }

    return await this.db
      .selectFrom('team_divisions')
      .innerJoin('teams', 'teams.id', 'team_divisions.team_id')
      .select([
        'teams.pk',
        'teams.id',
        'teams.name',
        'teams.number',
        'teams.affiliation',
        'teams.city',
        'teams.coordinates',
        'teams.logo_url'
      ])
      .where('team_divisions.division_id', '=', division.id)
      .orderBy('teams.number', 'asc')
      .execute();
  }
}

export class DivisionsRepository {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private space: ObjectStorage
  ) {}

  byId(id: string): DivisionSelector {
    return new DivisionSelector(this.db, this.space, { type: 'id', value: id });
  }

  byEventId(eventId: string): DivisionSelector {
    return new DivisionSelector(this.db, this.space, { type: 'event_id', value: eventId });
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
