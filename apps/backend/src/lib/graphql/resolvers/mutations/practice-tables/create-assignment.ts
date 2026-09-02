import { GraphQLFieldResolver } from 'graphql';
import db from '../../../../database';
import type { GraphQLContext } from '../../../apollo-server';

interface CreatePracticeTableAssignmentInput {
  divisionId: string;
  teamId: string;
  tableNumber: number;
  startTime: string;
  endTime: string;
}

interface CreatePracticeTableAssignmentArgs {
  input: CreatePracticeTableAssignmentInput;
}

export const createPracticeTableAssignmentResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  CreatePracticeTableAssignmentArgs
> = async (_parent, { input }) => {
  const { divisionId, teamId, tableNumber, startTime, endTime } = input;

  // Check for conflicts - same team at the same time
  const existingAssignment = await db.raw.sql
    .selectFrom('practice_tables_schedule')
    .where('division_id', '=', divisionId)
    .where('team_id', '=', teamId)
    .where(eb =>
      eb.or([
        eb.and([
          eb('start_time', '<=', new Date(startTime)),
          eb('end_time', '>', new Date(startTime))
        ]),
        eb.and([eb('start_time', '<', new Date(endTime)), eb('end_time', '>=', new Date(endTime))]),
        eb.and([
          eb('start_time', '>=', new Date(startTime)),
          eb('end_time', '<=', new Date(endTime))
        ])
      ])
    )
    .selectAll()
    .executeTakeFirst();

  if (existingAssignment) {
    throw new Error('Team already has a practice table assignment during this time slot');
  }

  // Insert the assignment
  const result = await db.raw.sql
    .insertInto('practice_tables_schedule')
    .values({
      division_id: divisionId,
      team_id: teamId,
      table_number: tableNumber,
      start_time: new Date(startTime),
      end_time: new Date(endTime)
    })
    .returning([
      'id',
      'division_id',
      'team_id',
      'table_number',
      'start_time',
      'end_time',
      'created_at'
    ])
    .executeTakeFirstOrThrow();

  return {
    id: result.id,
    divisionId: result.division_id,
    teamId: result.team_id,
    tableNumber: result.table_number,
    startTime: result.start_time.toISOString(),
    endTime: result.end_time.toISOString(),
    createdAt: result.created_at.toISOString()
  };
};
