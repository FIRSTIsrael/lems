import { GraphQLFieldResolver } from 'graphql';
import type { GraphQLContext } from '../../apollo-server';
import db from '../../../database';

interface PracticeTables {
  divisionId: string;
}

export const practiceTablesScheduleResolver: GraphQLFieldResolver<
  PracticeTables,
  GraphQLContext
> = async parent => {
  const assignments = await db.raw.sql
    .selectFrom('practice_tables_schedule')
    .where('division_id', '=', parent.divisionId)
    .where('team_id', 'is not', null) // Only return assigned slots
    .selectAll()
    .orderBy('start_time', 'asc')
    .execute();

  return assignments.map(assignment => ({
    id: assignment.id,
    divisionId: assignment.division_id,
    teamId: assignment.team_id!,
    tableIndex: assignment.table_number,
    startTime: assignment.start_time.toISOString(),
    endTime: assignment.end_time.toISOString(),
    createdAt: assignment.created_at.toISOString()
  }));
};
