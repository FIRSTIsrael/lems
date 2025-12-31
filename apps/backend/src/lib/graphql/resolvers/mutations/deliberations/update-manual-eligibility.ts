import { GraphQLFieldResolver } from 'graphql';
import { FinalDeliberationStage } from '@lems/database';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';

interface UpdateManualEligibilityArgs {
  divisionId: string;
  stage: FinalDeliberationStage;
  teamIds: string[];
}

/**
 * Resolver for Mutation.updateManualEligibility
 * Updates the manually added teams for a specific stage
 */
export const updateManualEligibilityResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  UpdateManualEligibilityArgs,
  Promise<{
    stage: string;
    manualEligibility: string[];
  }>
> = async (_root, { divisionId, stage, teamIds }, context) => {
  if (!context.user) {
    throw new MutationError(MutationErrorCode.UNAUTHORIZED, 'Authentication required');
  }

  // Check user role
  if (context.user.role !== 'judge-advisor') {
    throw new MutationError(
      MutationErrorCode.FORBIDDEN,
      'User must have judge-advisor role to update manual eligibility'
    );
  }

  // Check user is assigned to the division
  if (!context.user.divisions.includes(divisionId)) {
    throw new MutationError(MutationErrorCode.FORBIDDEN, 'User is not assigned to the division');
  }

  // Validate stage supports manual eligibility
  if (stage !== 'core-awards' && stage !== 'optional-awards') {
    throw new MutationError(
      MutationErrorCode.FORBIDDEN,
      `Stage "${stage}" does not support manual eligibility`
    );
  }

  // Get the final deliberation
  const deliberation = await db.finalDeliberations.byDivision(divisionId).get();
  if (!deliberation) {
    throw new MutationError(
      MutationErrorCode.FORBIDDEN,
      `Final deliberation not found for division ${divisionId}`
    );
  }

  // Check if deliberation is in progress
  if (deliberation.status !== 'in-progress') {
    throw new MutationError(
      MutationErrorCode.FORBIDDEN,
      `Cannot update manual eligibility when deliberation status is "${deliberation.status}". Must be "in-progress"`
    );
  }

  // Update stage data
  const updatedStageData = {
    ...deliberation.stageData,
    [stage]: {
      ...deliberation.stageData[stage],
      manualEligibility: teamIds
    }
  };

  // Update the deliberation
  const updated = await db.finalDeliberations.byDivision(divisionId).update({
    stageData: updatedStageData
  });

  if (!updated) {
    throw new MutationError(
      MutationErrorCode.INTERNAL_ERROR,
      `Failed to update manual eligibility for division ${divisionId}`
    );
  }

  // Publish event
  const pubSub = getRedisPubSub();
  await pubSub.publish(divisionId, RedisEventTypes.FINAL_DELIBERATION_UPDATED, {
    divisionId,
    stageData: updated.stageData
  });

  return {
    stage,
    manualEligibility: teamIds
  };
};
