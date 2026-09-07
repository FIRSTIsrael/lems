import { GraphQLFieldResolver } from 'graphql';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import db from '../../../../database';
import type { GraphQLContext } from '../../../apollo-server';
import { getRedisPubSub } from '../../../../redis/redis-pubsub.js';
import { practiceTableAssignmentsResolver } from '../../divisions/practice-table-assignments.js';

interface DeletePracticeTableAssignmentArgs {
  assignmentId: string;
}

export const deletePracticeTableAssignmentResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  DeletePracticeTableAssignmentArgs
> = async (_parent, { assignmentId }, context) => {
  // Get division ID before deleting
  const assignment = await db.raw.sql
    .selectFrom('practice_tables_schedule')
    .select('division_id')
    .where('id', '=', assignmentId)
    .executeTakeFirst();

  await db.raw.sql.deleteFrom('practice_tables_schedule').where('id', '=', assignmentId).execute();

  // Publish update to subscribers
  if (assignment) {
    const allAssignments = await practiceTableAssignmentsResolver(
      { id: assignment.division_id },
      { divisionId: assignment.division_id },
      context,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {} as any
    );

    const pubSub = getRedisPubSub();
    await pubSub.publish(
      assignment.division_id,
      RedisEventTypes.PRACTICE_TABLE_ASSIGNMENTS_UPDATED,
      allAssignments as Record<string, unknown>
    );
  }

  return true;
};
