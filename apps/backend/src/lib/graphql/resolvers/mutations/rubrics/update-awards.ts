import { GraphQLFieldResolver } from 'graphql';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';
import { authorizeRubricAccess, assertRubricEditable } from './utils';

type RubricAwardsUpdatedEvent = {
  rubricId: string;
  awards: Record<string, boolean>;
  version: number;
};

interface UpdateRubricAwardsArgs {
  divisionId: string;
  rubricId: string;
  awards: Record<string, boolean>;
}

/**
 * Resolver for Mutation.updateRubricAwards
 * Updates the award nominations for a rubric
 */
export const updateRubricAwardsResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  UpdateRubricAwardsArgs,
  Promise<RubricAwardsUpdatedEvent>
> = async (_root, { divisionId, rubricId, awards }, context) => {
  const { rubric, rubricObjectId } = await authorizeRubricAccess(context, divisionId, rubricId);

  const status = (rubric.status as string) || 'empty';
  const wasEmpty = status === 'empty';
  assertRubricEditable(status, context.user?.role);

  const result = await db.raw.mongo.collection('rubrics').findOneAndUpdate(
    { _id: rubricObjectId },
    {
      $set: {
        'data.awards': awards,
        // Update status to draft if it's empty
        ...(wasEmpty && { status: 'draft' })
      }
    },
    { returnDocument: 'after' }
  );

  if (!result) {
    throw new MutationError(MutationErrorCode.UNAUTHORIZED, `Failed to update rubric ${rubricId}`);
  }

  // Publish the update event
  const pubSub = getRedisPubSub();
  const eventPayload = {
    rubricId,
    awards,
    version: -1
  };
  await Promise.all([
    pubSub.publish(divisionId, RedisEventTypes.RUBRIC_UPDATED, eventPayload),
    wasEmpty &&
      pubSub.publish(divisionId, RedisEventTypes.RUBRIC_STATUS_CHANGED, {
        rubricId,
        status: 'draft'
      })
  ]);

  return eventPayload;
};
