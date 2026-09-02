import { GraphQLFieldResolver } from 'graphql';
import type { GraphQLContext } from '../../apollo-server';
import db from '../../../database';

interface PracticeTableAssignmentsArgs {
  divisionId: string;
}

export const practiceTableAssignmentsResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  PracticeTableAssignmentsArgs
> = async (_parent, { divisionId }) => {
  const assignments = await db.raw.sql
    .selectFrom('practice_tables_schedule')
    .where('division_id', '=', divisionId)
    .selectAll()
    .orderBy('start_time', 'asc')
    .execute();

  return assignments.map(assignment => ({
    id: assignment.id,
    divisionId: assignment.division_id,
    teamId: assignment.team_id,
    tableNumber: assignment.table_number,
    startTime: assignment.start_time.toISOString(),
    endTime: assignment.end_time.toISOString(),
    createdAt: assignment.created_at.toISOString()
  }));
};

interface TeamPracticeTableAssignmentsArgs {
  teamId: string;
}

export const teamPracticeTableAssignmentsResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  TeamPracticeTableAssignmentsArgs
> = async (_parent, { teamId }) => {
  const assignments = await db.raw.sql
    .selectFrom('practice_tables_schedule')
    .where('team_id', '=', teamId)
    .selectAll()
    .orderBy('start_time', 'asc')
    .execute();

  return assignments.map(assignment => ({
    id: assignment.id,
    divisionId: assignment.division_id,
    teamId: assignment.team_id,
    tableNumber: assignment.table_number,
    startTime: assignment.start_time.toISOString(),
    endTime: assignment.end_time.toISOString(),
    createdAt: assignment.created_at.toISOString()
  }));
};
