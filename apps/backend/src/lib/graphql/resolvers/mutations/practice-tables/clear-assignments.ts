import { GraphQLFieldResolver } from 'graphql';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import db from '../../../../database';
import type { GraphQLContext } from '../../../apollo-server';
import { getRedisPubSub } from '../../../../redis/redis-pubsub.js';

interface ClearPracticeTableAssignmentsArgs {
  divisionId: string;
}

export const clearPracticeTableAssignmentsResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  ClearPracticeTableAssignmentsArgs
> = async (_parent, { divisionId }) => {
  await db.raw.sql
    .deleteFrom('practice_tables_schedule')
    .where('division_id', '=', divisionId)
    .execute();

  // Publish empty assignments to subscribers
  const pubSub = getRedisPubSub();
  await pubSub.publish(
    divisionId,
    RedisEventTypes.PRACTICE_TABLE_ASSIGNMENTS_UPDATED,
    [] as unknown as Record<string, unknown>
  );

  return true;
};
