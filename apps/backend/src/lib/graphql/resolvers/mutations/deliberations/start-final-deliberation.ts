import { GraphQLFieldResolver } from 'graphql';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';

interface StartFinalDeliberationArgs {
  divisionId: string;
}

/**
 * Resolver for Mutation.startFinalDeliberation
 * Changes the final deliberation status from NOT_STARTED to IN_PROGRESS and sets the start time
 */
export const startFinalDeliberationResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  StartFinalDeliberationArgs,
  Promise<{
    status: string;
    stage: string;
    startTime: string;
  }>
> = async (_root, { divisionId }, context) => {
  if (!context.user) {
    throw new MutationError(MutationErrorCode.UNAUTHORIZED, 'Authentication required');
  }

  // Check user role - only judge-advisor can manage final deliberations
  if (context.user.role !== 'judge-advisor') {
    throw new MutationError(
      MutationErrorCode.FORBIDDEN,
      'User must have judge-advisor role to start final deliberation'
    );
  }

  // Check user is assigned to the division
  if (!context.user.divisions.includes(divisionId)) {
    throw new MutationError(MutationErrorCode.FORBIDDEN, 'User is not assigned to the division');
  }

  // Verify division exists
  const division = await db.divisions.byId(divisionId).get();
  if (!division) {
    throw new MutationError(MutationErrorCode.FORBIDDEN, `Division ${divisionId} not found`);
  }

  // Get or create the final deliberation
  let deliberation = await db.finalDeliberations.byDivision(divisionId).get();

  if (!deliberation) {
    // Create new deliberation if it doesn't exist
    deliberation = await db.finalDeliberations.create(divisionId);
  }

  // Check if deliberation is in NOT_STARTED status
  if (deliberation.status !== 'not-started') {
    throw new MutationError(
      MutationErrorCode.FORBIDDEN,
      `Cannot start deliberation with status "${deliberation.status}". Must be "not-started"`
    );
  }

  // Update the deliberation status and set start time
  const now = new Date();
  const updated = await db.finalDeliberations.byDivision(divisionId).update({
    status: 'in-progress',
    startTime: now
  });

  if (!updated) {
    throw new MutationError(
      MutationErrorCode.INTERNAL_ERROR,
      `Failed to start final deliberation for division ${divisionId}`
    );
  }

  // Publish events
  const pubSub = getRedisPubSub();
  await Promise.all([
    pubSub.publish(divisionId, RedisEventTypes.FINAL_DELIBERATION_UPDATED, {
      divisionId,
      status: updated.status,
      stage: updated.stage,
      startTime: updated.startTime
    }),
    pubSub.publish(divisionId, RedisEventTypes.FINAL_DELIBERATION_STATUS_CHANGED, {
      divisionId,
      status: updated.status,
      stage: updated.stage
    })
  ]);

  return {
    status: updated.status,
    stage: updated.stage,
    startTime: updated.startTime?.toISOString() || now.toISOString()
  };
};
