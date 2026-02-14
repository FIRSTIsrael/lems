import { Kysely } from 'kysely';
import { KyselyDatabaseSchema } from '../schema/kysely';
import {
  PitMap,
  InsertablePitMap,
  UpdateablePitMap,
  PitMapArea,
  InsertablePitMapArea,
  UpdateablePitMapArea,
  PitMapAssignment,
  InsertablePitMapAssignment,
  TeamWithPitAssignment
} from '../schema';

export class PitMapsRepository {
  constructor(private db: Kysely<KyselyDatabaseSchema>) {}

  // Pit Maps
  async createPitMap(data: InsertablePitMap): Promise<PitMap> {
    return await this.db
      .insertInto('pit_maps')
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async getPitMapByDivisionId(divisionId: string): Promise<PitMap | undefined> {
    return await this.db
      .selectFrom('pit_maps')
      .selectAll()
      .where('division_id', '=', divisionId)
      .orderBy('created_at', 'desc')
      .executeTakeFirst();
  }

  async updatePitMap(id: string, data: UpdateablePitMap): Promise<PitMap> {
    return await this.db
      .updateTable('pit_maps')
      .set({ ...data, updated_at: new Date() })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async deletePitMap(id: string): Promise<void> {
    await this.db.deleteFrom('pit_maps').where('id', '=', id).execute();
  }

  // Pit Map Areas
  async createPitMapArea(data: InsertablePitMapArea): Promise<PitMapArea> {
    return await this.db
      .insertInto('pit_map_areas')
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async getPitMapAreasByPitMapId(pitMapId: string): Promise<PitMapArea[]> {
    return await this.db
      .selectFrom('pit_map_areas')
      .selectAll()
      .where('pit_map_id', '=', pitMapId)
      .orderBy('name', 'asc')
      .execute();
  }

  async updatePitMapArea(id: string, data: UpdateablePitMapArea): Promise<PitMapArea> {
    return await this.db
      .updateTable('pit_map_areas')
      .set(data)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async deletePitMapArea(id: string): Promise<void> {
    await this.db.deleteFrom('pit_map_areas').where('id', '=', id).execute();
  }

  async deletePitMapAreasByPitMapId(pitMapId: string): Promise<void> {
    await this.db.deleteFrom('pit_map_areas').where('pit_map_id', '=', pitMapId).execute();
  }

  // Pit Map Assignments
  async createPitMapAssignment(data: InsertablePitMapAssignment): Promise<PitMapAssignment> {
    const result = await this.db
      .insertInto('pit_map_assignments')
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
    return result as PitMapAssignment;
  }

  async createPitMapAssignments(data: InsertablePitMapAssignment[]): Promise<PitMapAssignment[]> {
    if (data.length === 0) return [];
    const results = await this.db
      .insertInto('pit_map_assignments')
      .values(data)
      .returningAll()
      .execute();
    return results as PitMapAssignment[];
  }

  async getPitMapAssignmentsByAreaId(areaId: string): Promise<PitMapAssignment[]> {
    return await this.db
      .selectFrom('pit_map_assignments')
      .selectAll()
      .where('pit_map_area_id', '=', areaId)
      .orderBy('spot_number', 'asc')
      .execute();
  }

  async getTeamsWithPitAssignmentsByDivisionId(
    divisionId: string
  ): Promise<TeamWithPitAssignment[]> {
    return await this.db
      .selectFrom('pit_map_assignments as pma')
      .innerJoin('pit_map_areas as area', 'area.id', 'pma.pit_map_area_id')
      .innerJoin('pit_maps as pm', 'pm.id', 'area.pit_map_id')
      .innerJoin('teams as t', 't.id', 'pma.team_id')
      .select([
        't.id as team_id',
        't.number as team_number',
        't.name as team_name',
        't.affiliation as team_affiliation',
        'area.id as area_id',
        'area.name as area_name',
        'pma.position_x',
        'pma.position_y',
        'pma.spot_number'
      ])
      .where('pm.division_id', '=', divisionId)
      .orderBy('area.name', 'asc')
      .orderBy('pma.spot_number', 'asc')
      .execute();
  }

  async deletePitMapAssignmentsByAreaId(areaId: string): Promise<void> {
    await this.db.deleteFrom('pit_map_assignments').where('pit_map_area_id', '=', areaId).execute();
  }

  async deletePitMapAssignmentsByPitMapId(pitMapId: string): Promise<void> {
    const areas = await this.getPitMapAreasByPitMapId(pitMapId);
    const areaIds = areas.map(area => area.id);

    if (areaIds.length > 0) {
      await this.db
        .deleteFrom('pit_map_assignments')
        .where('pit_map_area_id', 'in', areaIds)
        .execute();
    }
  }

  async getPitMapAssignmentByTeamId(teamId: string): Promise<PitMapAssignment | undefined> {
    return await this.db
      .selectFrom('pit_map_assignments')
      .selectAll()
      .where('team_id', '=', teamId)
      .executeTakeFirst();
  }
}
