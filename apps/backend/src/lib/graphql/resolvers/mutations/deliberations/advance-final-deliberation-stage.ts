import { GraphQLFieldResolver } from 'graphql';
import { FinalDeliberationStage, FinalDeliberationAwards } from '@lems/database';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';

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
  const hasOptionalAwards = awards.some(award => award.is_optional);
  if (nextStage === 'optional-awards' && !hasOptionalAwards) {
    // Skip optional-awards stage if no optional awards exist
    nextStage = STAGE_PROGRESSION[nextStage];
  }

  // Validate current stage before advancing
  await validateStageCompletion(divisionId, deliberation);

  // If leaving champions stage, handle advancement
  if (deliberation.stage === 'champions') {
    await handleChampionsStageCompletion(divisionId);
  }

  // Update to next stage and clear stage-specific data
  const updated = await db.finalDeliberations.byDivision(divisionId).update({
    stage: nextStage,
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

/**
 * Validates that the current stage has all required data before advancing
 */
async function validateStageCompletion(
  divisionId: string,
  deliberation: { stage: FinalDeliberationStage; awards: FinalDeliberationAwards }
): Promise<void> {
  switch (deliberation.stage) {
    case 'champions': {
      // Validate champions placement (at least 1st place must be assigned)
      const champions = deliberation.awards.champions || {};
      if (!champions['1']) {
        throw new MutationError(
          MutationErrorCode.FORBIDDEN,
          'Cannot advance from champions stage without assigning 1st place'
        );
      }
      break;
    }
    case 'core-awards': {
      // Validate that required core awards are assigned
      const awards = deliberation.awards;
      if (!awards['innovation-project'] || awards['innovation-project'].length === 0) {
        throw new MutationError(
          MutationErrorCode.FORBIDDEN,
          'Innovation Project award must be assigned before advancing'
        );
      }
      if (!awards['robot-design'] || awards['robot-design'].length === 0) {
        throw new MutationError(
          MutationErrorCode.FORBIDDEN,
          'Robot Design award must be assigned before advancing'
        );
      }
      if (!awards['core-values'] || awards['core-values'].length === 0) {
        throw new MutationError(
          MutationErrorCode.FORBIDDEN,
          'Core Values award must be assigned before advancing'
        );
      }
      break;
    }
    // optional-awards and review don't require validation
  }
}

/**
 * Handles advancement award creation when leaving champions stage
 */
async function handleChampionsStageCompletion(divisionId: string): Promise<void> {
  // Get division to check if advancement is enabled
  const division = await db.divisions.byId(divisionId).get();
  if (!division) return;

  // Check if advancement is enabled
  const event = await db.raw.sql
    .selectFrom('events')
    .innerJoin('event_settings', 'event_settings.event_id', 'events.id')
    .select('event_settings.advancement_percent')
    .where('events.id', '=', division.event_id)
    .executeTakeFirst();

  if (!event || event.advancement_percent === 0) {
    // Advancement not enabled
    return;
  }

  // TODO: Calculate advancing teams based on advancement percentage
  // This will require:
  // 1. Get all teams in division
  // 2. Calculate total ranks for each team
  // 3. Sort by total rank with tiebreakers (CV rank, then team number)
  // 4. Take top N% based on advancement_percent
  // 5. Store in deliberation.awards or separate advancement tracking

  // For now, this is a placeholder for the advancement logic
  // Implementation will be added in a follow-up
}
