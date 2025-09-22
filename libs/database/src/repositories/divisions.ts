import { Kysely } from 'kysely';
import { KyselyDatabaseSchema } from '../schema/kysely';
import { ObjectStorage } from '../object-storage';
import { InsertableDivision, Division, UpdateableDivision } from '../schema/tables/divisions';

class DivisionSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private space: ObjectStorage,
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
    private space: ObjectStorage
  ) {}

  byId(id: string): DivisionSelector {
    return new DivisionSelector(this.db, this.space, { type: 'id', value: id });
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
    return createdDivision;
  }

  async createMany(divisions: InsertableDivision[]): Promise<Division[]> {
    if (divisions.length === 0) {
      return [];
    }

    return await this.db.insertInto('divisions').values(divisions).returningAll().execute();
  }
}
