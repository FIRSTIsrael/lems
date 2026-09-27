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
  const assignments = await db.divisions.byId(parent.divisionId).practiceTables().getAssignments();

  return assignments.map(assignment => ({
    id: assignment.id,
    divisionId: assignment.division_id,
    teamId: assignment.team_id,
    tableIndex: assignment.table_number,
    startTime: assignment.start_time.toISOString(),
    endTime: assignment.end_time.toISOString(),
    createdAt: assignment.created_at.toISOString()
  }));
};
