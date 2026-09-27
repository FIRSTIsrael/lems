import { Kysely } from 'kysely';
import { KyselyDatabaseSchema } from '../schema/kysely';
import {
  InsertablePracticeTablesSchedule,
  PracticeTablesSchedule,
  UpdateablePracticeTablesSchedule
} from '../schema/tables/practice-tables-schedule';
import { PracticeTablesSettings } from '../schema/tables/divisions';

export interface PracticeTableAssignmentWithTeam {
  id: string;
  division_id: string;
  table_number: number;
  start_time: Date;
  end_time: Date;
  created_at: Date;
  team_id: string;
  number: number;
  name: string;
  affiliation: string;
  region: string;
}

export class PracticeTablesRepository {
  constructor(private db: Kysely<KyselyDatabaseSchema>) {}

  /**
   * Get practice tables configuration for a division
   * Returns the raw practice_tables_settings JSON from the divisions table
   */
  async getConfig(divisionId: string): Promise<PracticeTablesSettings | null> {
    const division = await this.db
      .selectFrom('divisions')
      .where('id', '=', divisionId)
      .select('practice_tables_settings')
      .executeTakeFirst();

    return division?.practice_tables_settings ?? null;
  }

  /**
   * Get all practice table assignments for a division with team data (only assigned slots)
   * Returns raw database columns without transformation
   */
  async getAssignments(divisionId: string): Promise<PracticeTableAssignmentWithTeam[]> {
    const assignments = await this.db
      .selectFrom('practice_tables_schedule as pts')
      .innerJoin('teams as t', 't.id', 'pts.team_id')
      .where('pts.division_id', '=', divisionId)
      .where('pts.team_id', 'is not', null)
      .select([
        'pts.id',
        'pts.division_id',
        'pts.table_number',
        'pts.start_time',
        'pts.end_time',
        'pts.created_at',
        't.id as team_id',
        't.number',
        't.name',
        't.affiliation',
        't.region'
      ])
      .execute();

    return assignments as PracticeTableAssignmentWithTeam[];
  }

  /**
   * Get a specific practice table assignment
   */
  async getAssignment(
    divisionId: string,
    tableIndex: number,
    startTime: Date
  ): Promise<PracticeTablesSchedule | undefined> {
    const result = await this.db
      .selectFrom('practice_tables_schedule')
      .where('division_id', '=', divisionId)
      .where('table_number', '=', tableIndex)
      .where('start_time', '=', startTime)
      .selectAll()
      .executeTakeFirst();

    return result as PracticeTablesSchedule | undefined;
  }

  /**
   * Get all assignments for a specific team
   */
  async getTeamAssignments(teamId: string): Promise<PracticeTablesSchedule[]> {
    const results = await this.db
      .selectFrom('practice_tables_schedule')
      .where('team_id', '=', teamId)
      .selectAll()
      .orderBy('start_time', 'asc')
      .execute();

    return results as PracticeTablesSchedule[];
  }

  /**
   * Create a new practice table assignment
   */
  async createAssignment(
    assignment: InsertablePracticeTablesSchedule
  ): Promise<PracticeTablesSchedule> {
    const result = await this.db
      .insertInto('practice_tables_schedule')
      .values(assignment)
      .returningAll()
      .executeTakeFirstOrThrow();

    return result as PracticeTablesSchedule;
  }

  /**
   * Update an existing practice table assignment
   */
  async updateAssignment(
    divisionId: string,
    tableIndex: number,
    startTime: Date,
    updates: UpdateablePracticeTablesSchedule
  ): Promise<PracticeTablesSchedule | undefined> {
    const result = await this.db
      .updateTable('practice_tables_schedule')
      .set(updates)
      .where('division_id', '=', divisionId)
      .where('table_number', '=', tableIndex)
      .where('start_time', '=', startTime)
      .returningAll()
      .executeTakeFirst();

    return result as PracticeTablesSchedule | undefined;
  }

  /**
   * Delete a practice table assignment
   */
  async deleteAssignment(
    divisionId: string,
    tableIndex: number,
    startTime: Date
  ): Promise<boolean> {
    const result = await this.db
      .deleteFrom('practice_tables_schedule')
      .where('division_id', '=', divisionId)
      .where('table_number', '=', tableIndex)
      .where('start_time', '=', startTime)
      .execute();

    return result.length > 0;
  }

  /**
   * Delete all assignments for a division
   */
  async deleteAllAssignments(divisionId: string): Promise<number> {
    const result = await this.db
      .deleteFrom('practice_tables_schedule')
      .where('division_id', '=', divisionId)
      .execute();

    return Number(result[0]?.numDeletedRows || 0);
  }
}

export function createPracticeTablesRepository(db: Kysely<KyselyDatabaseSchema>) {
  return new PracticeTablesRepository(db);
}
