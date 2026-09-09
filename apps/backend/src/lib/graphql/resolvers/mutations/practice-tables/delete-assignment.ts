import { GraphQLFieldResolver } from 'graphql';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import db from '../../../../database';
import type { GraphQLContext } from '../../../apollo-server';
import { getRedisPubSub } from '../../../../redis/redis-pubsub.js';
import { practiceTableAssignmentsResolver } from '../../divisions/practice-table-assignments.js';

interface DeletePracticeTableAssignmentArgs {
  slotId: string;
}

export const deletePracticeTableAssignmentResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  DeletePracticeTableAssignmentArgs
> = async (_parent, { slotId }, context) => {
  // Clear the team assignment (set team_id to null) and return the updated slot
  const result = await db.raw.sql
    .updateTable('practice_tables_schedule')
    .set({ team_id: null })
    .where('id', '=', slotId)
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

  const slot = {
    id: result.id,
    divisionId: result.division_id,
    teamId: result.team_id, // Will be null
    tableNumber: result.table_number,
    startTime: result.start_time.toISOString(),
    endTime: result.end_time.toISOString(),
    createdAt: result.created_at.toISOString()
  };

  // Publish update to subscribers
  const allAssignments = await practiceTableAssignmentsResolver(
    { id: result.division_id },
    { divisionId: result.division_id },
    context,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    {} as any
  );

  const pubSub = getRedisPubSub();
  await pubSub.publish(
    result.division_id,
    RedisEventTypes.PRACTICE_TABLE_ASSIGNMENTS_UPDATED,
    allAssignments as Record<string, unknown>
  );

  return slot;
};
