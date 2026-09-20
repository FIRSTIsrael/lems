import { GraphQLFieldResolver } from 'graphql';
import { createPracticeTablesRepository } from '@lems/database';
import type { GraphQLContext } from '../../apollo-server';
import db from '../../../database';

interface PracticeTables {
  divisionId: string;
}

const practiceTablesRepo = createPracticeTablesRepository(db.raw.sql);

export const practiceTablesScheduleResolver: GraphQLFieldResolver<
  PracticeTables,
  GraphQLContext
> = async parent => {
  const assignments = await practiceTablesRepo.getAssignments(parent.divisionId);

  return assignments.map(assignment => ({
    id: assignment.id,
    divisionId: assignment.divisionId,
    teamId: assignment.teamId,
    tableIndex: assignment.tableNumber,
    startTime: assignment.startTime.toISOString(),
    endTime: assignment.endTime.toISOString(),
    createdAt: assignment.createdAt.toISOString()
  }));
};
