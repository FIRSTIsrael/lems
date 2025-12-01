import { GraphQLFieldResolver } from 'graphql';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { RubricStatus } from '@lems/database';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';
import { authorizeRubricAccess } from './utils';

const VALID_STATUSES: Set<RubricStatus> = new Set([
  'empty',
  'draft',
  'completed',
  'locked',
  'approved'
]);

interface UpdateRubricStatusArgs {
  divisionId: string;
  rubricId: string;
  status: RubricStatus;
}

interface RubricStatusUpdatedEvent {
  rubricId: string;
  status: RubricStatus;
  version: number;
}

/**
 * Resolver for Mutation.updateRubricStatus
 * Updates the status of a rubric
 */
export const updateRubricStatusResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  UpdateRubricStatusArgs,
  Promise<RubricStatusUpdatedEvent>
> = async (_root, { divisionId, rubricId, status }, context) => {
  try {
    const { rubricObjectId } = await authorizeRubricAccess(context, divisionId, rubricId);

    // Validate status transitions
    if (!VALID_STATUSES.has(status)) {
      throw new MutationError(MutationErrorCode.UNAUTHORIZED, `Invalid status: ${status}`);
    }

    // Update the rubric status
    const result = await db.raw.mongo
      .collection('rubrics')
      .findOneAndUpdate({ _id: rubricObjectId }, { $set: { status } }, { returnDocument: 'after' });

    if (!result) {
      throw new MutationError(
        MutationErrorCode.UNAUTHORIZED,
        `Failed to update rubric ${rubricId}`
      );
    }

    // Publish RUBRIC_UPDATED and RUBRIC_STATUS_CHANGED events
    const pubSub = getRedisPubSub();
    const eventPayload = {
      rubricId,
      status,
      version: -1
    };
    await pubSub.publish(divisionId, RedisEventTypes.RUBRIC_STATUS_CHANGED, eventPayload);
    await pubSub.publish(divisionId, RedisEventTypes.RUBRIC_UPDATED, eventPayload);

    return eventPayload;
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
};
