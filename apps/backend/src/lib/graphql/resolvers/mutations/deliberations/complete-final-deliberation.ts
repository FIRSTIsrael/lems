import { GraphQLFieldResolver } from 'graphql';
import { FinalDeliberationAwards } from '@lems/database';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';

interface CompleteFinalDeliberationArgs {
  divisionId: string;
}

/**
 * Resolver for Mutation.completeFinalDeliberation
 * Locks the final deliberation by setting status to COMPLETED
 */
export const completeFinalDeliberationResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  CompleteFinalDeliberationArgs,
  Promise<{
    status: string;
    completionTime: string;
  }>
> = async (_root, { divisionId }, context) => {
  if (!context.user) {
    throw new MutationError(MutationErrorCode.UNAUTHORIZED, 'Authentication required');
  }

  // Check user role
  if (context.user.role !== 'judge-advisor') {
    throw new MutationError(
      MutationErrorCode.FORBIDDEN,
      'User must have judge-advisor role to complete final deliberation'
    );
  }

  // Check user is assigned to the division
  if (!context.user.divisions.includes(divisionId)) {
    throw new MutationError(MutationErrorCode.FORBIDDEN, 'User is not assigned to the division');
  }

  // Get the final deliberation
  const deliberation = await db.finalDeliberations.byDivision(divisionId).get();
  if (!deliberation) {
    throw new MutationError(
      MutationErrorCode.FORBIDDEN,
      `Final deliberation not found for division ${divisionId}`
    );
  }

  // Check if deliberation is in progress and at review stage
  if (deliberation.status !== 'in-progress') {
    throw new MutationError(
      MutationErrorCode.FORBIDDEN,
      `Cannot complete deliberation with status "${deliberation.status}". Must be "in-progress"`
    );
  }

  if (deliberation.stage !== 'review') {
    throw new MutationError(
      MutationErrorCode.FORBIDDEN,
      `Cannot complete deliberation at stage "${deliberation.stage}". Must be at "review" stage`
    );
  }

  // Validate all required awards are assigned
  validateFinalAwards(deliberation);

  // Update to completed status
  const now = new Date();
  const updated = await db.finalDeliberations.byDivision(divisionId).update({
    status: 'completed',
    completionTime: now
  });

  if (!updated) {
    throw new MutationError(
      MutationErrorCode.INTERNAL_ERROR,
      `Failed to complete final deliberation for division ${divisionId}`
    );
  }

  // Publish events
  const pubSub = getRedisPubSub();
  await Promise.all([
    pubSub.publish(divisionId, RedisEventTypes.FINAL_DELIBERATION_UPDATED, {
      divisionId,
      status: updated.status,
      completionTime: updated.completionTime
    }),
    pubSub.publish(divisionId, RedisEventTypes.FINAL_DELIBERATION_STATUS_CHANGED, {
      divisionId,
      status: updated.status,
      stage: updated.stage
    })
  ]);

  return {
    status: updated.status,
    completionTime: updated.completionTime?.toISOString() || now.toISOString()
  };
};

/**
 * Validates that all required awards have been assigned
 */
function validateFinalAwards(deliberation: { awards: FinalDeliberationAwards }): void {
  const awards = deliberation.awards;

  // Validate champions (at least 1st place)
  if (!awards.champions || !awards.champions['1']) {
    throw new MutationError(MutationErrorCode.FORBIDDEN, 'Champions 1st place must be assigned');
  }

  // Validate core awards
  const requiredCoreAwards = ['innovation-project', 'robot-design', 'core-values'];
  for (const awardName of requiredCoreAwards) {
    if (!awards[awardName] || awards[awardName].length === 0) {
      throw new MutationError(MutationErrorCode.FORBIDDEN, `${awardName} award must be assigned`);
    }
  }

  // Robot performance should be auto-assigned, but validate it exists
  if (!awards['robot-performance'] || awards['robot-performance'].length === 0) {
    throw new MutationError(
      MutationErrorCode.FORBIDDEN,
      'Robot Performance award must be assigned'
    );
  }
}
