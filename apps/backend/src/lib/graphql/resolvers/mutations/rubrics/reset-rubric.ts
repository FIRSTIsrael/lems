import { GraphQLFieldResolver } from 'graphql';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';
import { authorizeRubricAccess, assertRubricEditable } from './utils';

type RubricResetEvent = {
  rubricId: string;
  reset: boolean;
};

interface ResetRubricArgs {
  divisionId: string;
  rubricId: string;
}

/**
 * Resolver for Mutation.resetRubric
 * Resets the rubric to the provided data
 */
export const resetRubricResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  ResetRubricArgs,
  Promise<RubricResetEvent>
> = async (_root, { divisionId, rubricId }, context) => {
  const { rubric, rubricObjectId } = await authorizeRubricAccess(context, divisionId, rubricId);

  assertRubricEditable(rubric.status as string, context.user?.role);

  const result = await db.raw.mongo.collection('rubrics').findOneAndUpdate(
    { _id: rubricObjectId },
    {
      $unset: { data: '' },
      $set: {
        status: 'empty'
      }
    },
    { returnDocument: 'after' }
  );

  if (!result) {
    throw new MutationError(MutationErrorCode.UNAUTHORIZED, `Failed to reset rubric ${rubricId}`);
  }

  // Publish the update event
  const pubSub = getRedisPubSub();
  const eventPayload = {
    rubricId,
    reset: true
  };
  await Promise.all([
    pubSub.publish(divisionId, RedisEventTypes.RUBRIC_UPDATED, eventPayload),
    pubSub.publish(divisionId, RedisEventTypes.RUBRIC_STATUS_CHANGED, {
      rubricId,
      status: 'empty'
    })
  ]);

  return eventPayload;
};
