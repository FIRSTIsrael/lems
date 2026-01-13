import { GraphQLFieldResolver } from 'graphql';
import { FinalDeliberationStage } from '@lems/database';
import { OPTIONAL_AWARDS } from '@lems/shared/awards';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';
import { handleChampionsStageCompletion, validateChampionsStage } from './handlers/champions';
import { handleCoreAwardsStageCompletion, validateCoreAwardsStage } from './handlers/core-awards';
import {
  handleOptionalAwardsStageCompletion,
  validateOptionalAwardsStage
} from './handlers/optional-awards';
import { handleReviewStageCompletion, validateReviewStage } from './handlers/review';

interface AdvanceFinalDeliberationStageArgs {
  divisionId: string;
}

const STAGE_PROGRESSION: Record<FinalDeliberationStage, FinalDeliberationStage | null> = {
  champions: 'core-awards',
  'core-awards': 'optional-awards',
  'optional-awards': 'review',
  review: null
};

/**
 * Resolver for Mutation.advanceFinalDeliberationStage
 * Advances to the next stage in the final deliberation process.
 * When leaving champions stage, calculates and creates advancement awards.
 */
export const advanceFinalDeliberationStageResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  AdvanceFinalDeliberationStageArgs,
  Promise<{
    stage: string;
    status: string;
  }>
> = async (_root, { divisionId }, context) => {
  if (!context.user) {
    throw new MutationError(MutationErrorCode.UNAUTHORIZED, 'Authentication required');
  }

  // Check user role
  if (context.user.role !== 'judge-advisor') {
    throw new MutationError(
      MutationErrorCode.FORBIDDEN,
      'User must have judge-advisor role to advance final deliberation stage'
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

  // Check if deliberation is in progress
  if (deliberation.status !== 'in-progress') {
    throw new MutationError(
      MutationErrorCode.FORBIDDEN,
      `Cannot advance stage when deliberation status is "${deliberation.status}". Must be "in-progress"`
    );
  }

  // Get next stage
  let nextStage = STAGE_PROGRESSION[deliberation.stage];
  if (!nextStage) {
    throw new MutationError(
      MutationErrorCode.FORBIDDEN,
      'Cannot advance beyond review stage. Use completeFinalDeliberation instead.'
    );
  }

  // Get awards for validation
  const awards = await db.awards.byDivisionId(divisionId).getAll();
  const hasOptionalAwards = awards.some(award =>
    (OPTIONAL_AWARDS as readonly string[])
      .filter(name => name !== 'excellence-in-engineering')
      .includes(award.name)
  );
  if (nextStage === 'optional-awards' && !hasOptionalAwards) {
    // Skip optional-awards stage if no optional awards exist
    nextStage = STAGE_PROGRESSION[nextStage];
  }

  // Handle stage specific advancement logic
  switch (deliberation.stage) {
    case 'champions':
      validateChampionsStage(deliberation);
      await handleChampionsStageCompletion(divisionId, deliberation.awards.champions);
      break;
    case 'core-awards':
      validateCoreAwardsStage(deliberation);
      await handleCoreAwardsStageCompletion(divisionId, deliberation.awards);
      break;
    case 'optional-awards':
      validateOptionalAwardsStage(deliberation.awards.optionalAwards, awards);
      await handleOptionalAwardsStageCompletion(divisionId, deliberation.awards.optionalAwards);
      break;
    case 'review':
      validateReviewStage();
      await handleReviewStageCompletion(divisionId);
      break;
  }

  // Update to next stage and clear stage-specific data
  const updated = await db.finalDeliberations.byDivision(divisionId).update({
    stage: nextStage,
    status: 'not-started',
    stageData: {
      ...deliberation.stageData,
      [nextStage]: {}
    }
  });

  if (!updated) {
    throw new MutationError(
      MutationErrorCode.INTERNAL_ERROR,
      `Failed to advance final deliberation stage for division ${divisionId}`
    );
  }

  // Publish events
  const pubSub = getRedisPubSub();
  await Promise.all([
    pubSub.publish(divisionId, RedisEventTypes.FINAL_DELIBERATION_UPDATED, {
      divisionId,
      stage: updated.stage,
      stageData: updated.stageData
    }),
    pubSub.publish(divisionId, RedisEventTypes.FINAL_DELIBERATION_UPDATED, {
      divisionId,
      stage: updated.stage,
      status: updated.status
    })
  ]);

  return {
    stage: updated.stage,
    status: updated.status
  };
};
