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

export class DivisionPracticeTablesSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private divisionId: string
  ) {}

  /**
   * Get practice tables configuration for this division
   * Returns the raw practice_tables_settings JSON from the divisions table
   */
  async getConfig(): Promise<PracticeTablesSettings | null> {
    const division = await this.db
      .selectFrom('divisions')
      .where('id', '=', this.divisionId)
      .select('practice_tables_settings')
      .executeTakeFirst();

    return division?.practice_tables_settings ?? null;
  }

  /**
   * Get all practice table assignments for this division with team data (only assigned slots)
   * Returns raw database columns without transformation
   */
  async getAssignments(): Promise<PracticeTableAssignmentWithTeam[]> {
    const assignments = await this.db
      .selectFrom('practice_tables_schedule as pts')
      .innerJoin('teams as t', 't.id', 'pts.team_id')
      .where('pts.division_id', '=', this.divisionId)
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
   * Get all assignments for a specific team in this division
   */
  async getTeamAssignments(teamId: string): Promise<PracticeTablesSchedule[]> {
    const results = await this.db
      .selectFrom('practice_tables_schedule')
      .where('division_id', '=', this.divisionId)
      .where('team_id', '=', teamId)
      .selectAll()
      .orderBy('start_time', 'asc')
      .execute();

    return results as PracticeTablesSchedule[];
  }

  /**
   * Get a specific practice table assignment in this division
   */
  async getAssignment(
    tableIndex: number,
    startTime: Date
  ): Promise<PracticeTablesSchedule | undefined> {
    const result = await this.db
      .selectFrom('practice_tables_schedule')
      .where('division_id', '=', this.divisionId)
      .where('table_number', '=', tableIndex)
      .where('start_time', '=', startTime)
      .selectAll()
      .executeTakeFirst();

    return result as PracticeTablesSchedule | undefined;
  }

  /**
   * Create a new practice table assignment in this division
   */
  async createAssignment(
    assignment: Omit<InsertablePracticeTablesSchedule, 'division_id'>
  ): Promise<PracticeTablesSchedule> {
    const result = await this.db
      .insertInto('practice_tables_schedule')
      .values({ ...assignment, division_id: this.divisionId })
      .returningAll()
      .executeTakeFirstOrThrow();

    return result as PracticeTablesSchedule;
  }

  /**
   * Create multiple practice table assignments in this division
   */
  async createMany(
    assignments: Array<Omit<InsertablePracticeTablesSchedule, 'division_id'>>
  ): Promise<PracticeTablesSchedule[]> {
    if (assignments.length === 0) {
      return [];
    }

    const assignmentsWithDivision = assignments.map(assignment => ({
      ...assignment,
      division_id: this.divisionId
    }));

    return (await this.db
      .insertInto('practice_tables_schedule')
      .values(assignmentsWithDivision)
      .returningAll()
      .execute()) as PracticeTablesSchedule[];
  }

  /**
   * Update an existing practice table assignment in this division
   */
  async updateAssignment(
    tableIndex: number,
    startTime: Date,
    updates: UpdateablePracticeTablesSchedule
  ): Promise<PracticeTablesSchedule | undefined> {
    const result = await this.db
      .updateTable('practice_tables_schedule')
      .set(updates)
      .where('division_id', '=', this.divisionId)
      .where('table_number', '=', tableIndex)
      .where('start_time', '=', startTime)
      .returningAll()
      .executeTakeFirst();

    return result as PracticeTablesSchedule | undefined;
  }

  /**
   * Delete a practice table assignment in this division
   */
  async deleteAssignment(tableIndex: number, startTime: Date): Promise<boolean> {
    const result = await this.db
      .deleteFrom('practice_tables_schedule')
      .where('division_id', '=', this.divisionId)
      .where('table_number', '=', tableIndex)
      .where('start_time', '=', startTime)
      .execute();

    return result.length > 0;
  }

  /**
   * Delete all assignments for this division
   */
  async deleteAllAssignments(): Promise<number> {
    const result = await this.db
      .deleteFrom('practice_tables_schedule')
      .where('division_id', '=', this.divisionId)
      .execute();

    return Number(result[0]?.numDeletedRows || 0);
  }
}

/**
 * @deprecated Use db.divisions.byId(divisionId).practiceTables() instead
 * Legacy repository for backward compatibility
 */
export class PracticeTablesRepository {
  constructor(private db: Kysely<KyselyDatabaseSchema>) {}

  getConfig(divisionId: string): Promise<PracticeTablesSettings | null> {
    return new DivisionPracticeTablesSelector(this.db, divisionId).getConfig();
  }

  getAssignments(divisionId: string): Promise<PracticeTableAssignmentWithTeam[]> {
    return new DivisionPracticeTablesSelector(this.db, divisionId).getAssignments();
  }

  getAssignment(
    divisionId: string,
    tableIndex: number,
    startTime: Date
  ): Promise<PracticeTablesSchedule | undefined> {
    return new DivisionPracticeTablesSelector(this.db, divisionId).getAssignment(
      tableIndex,
      startTime
    );
  }

  getTeamAssignments(teamId: string): Promise<PracticeTablesSchedule[]> {
    // Note: This doesn't filter by division, maintaining backward compatibility
    return this.db
      .selectFrom('practice_tables_schedule')
      .where('team_id', '=', teamId)
      .selectAll()
      .orderBy('start_time', 'asc')
      .execute() as Promise<PracticeTablesSchedule[]>;
  }

  createAssignment(assignment: InsertablePracticeTablesSchedule): Promise<PracticeTablesSchedule> {
    return new DivisionPracticeTablesSelector(this.db, assignment.division_id).createAssignment(
      assignment
    );
  }

  updateAssignment(
    divisionId: string,
    tableIndex: number,
    startTime: Date,
    updates: UpdateablePracticeTablesSchedule
  ): Promise<PracticeTablesSchedule | undefined> {
    return new DivisionPracticeTablesSelector(this.db, divisionId).updateAssignment(
      tableIndex,
      startTime,
      updates
    );
  }

  deleteAssignment(divisionId: string, tableIndex: number, startTime: Date): Promise<boolean> {
    return new DivisionPracticeTablesSelector(this.db, divisionId).deleteAssignment(
      tableIndex,
      startTime
    );
  }

  deleteAllAssignments(divisionId: string): Promise<number> {
    return new DivisionPracticeTablesSelector(this.db, divisionId).deleteAllAssignments();
  }
}

export function createPracticeTablesRepository(db: Kysely<KyselyDatabaseSchema>) {
  return new PracticeTablesRepository(db);
}
