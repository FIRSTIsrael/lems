import { GraphQLFieldResolver } from 'graphql';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { Award, OPTIONAL_AWARDS } from '@lems/shared/awards';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';

interface UpdateFinalDeliberationAwardsArgs {
  divisionId: string;
  awards: string; // JSON string of FinalDeliberationAwards
}

/**
 * Resolver for Mutation.updateFinalDeliberationAwards
 * Updates the award assignments in the final deliberation
 */
export const updateFinalDeliberationAwardsResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  UpdateFinalDeliberationAwardsArgs,
  Promise<{
    awards: string;
  }>
> = async (_root, { divisionId, awards: awardsJson }, context) => {
  if (!context.user) {
    throw new MutationError(MutationErrorCode.UNAUTHORIZED, 'Authentication required');
  }

  // Check user role
  if (context.user.role !== 'judge-advisor') {
    throw new MutationError(
      MutationErrorCode.FORBIDDEN,
      'User must have judge-advisor role to update final deliberation awards'
    );
  }

  // Check user is assigned to the division
  if (!context.user.divisions.includes(divisionId)) {
    throw new MutationError(MutationErrorCode.FORBIDDEN, 'User is not assigned to the division');
  }

  // Parse awards
  let awards: Partial<Record<Award, string[]>>;
  try {
    awards = JSON.parse(awardsJson);
  } catch {
    throw new MutationError(MutationErrorCode.FORBIDDEN, 'Invalid awards JSON format');
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
      `Cannot update awards when deliberation status is "${deliberation.status}". Must be "in-progress"`
    );
  }

  const optionalAwards: Partial<Record<Award, string[]>> = {};
  const mandatoryAwards: Partial<Record<Award, string[]>> = {};
  const championsAward: { '1'?: string; '2'?: string; '3'?: string; '4'?: string } = {};

  Object.entries(awards).forEach(([awardName, awardData]) => {
    if ((OPTIONAL_AWARDS as readonly string[]).includes(awardName)) {
      if (awardName === 'champions') {
        Object.assign(championsAward, awardData);
      } else {
        optionalAwards[awardName as Award] = awardData as string[];
      }
    } else {
      mandatoryAwards[awardName as Award] = awardData as string[];
    }
  });

  // Merge with existing awards - preserve both optional and mandatory awards and apply updates
  const updatedAwards = {
    ...deliberation.awards,
    optionalAwards: {
      ...deliberation.awards.optionalAwards, // Preserve existing optional awards
      ...optionalAwards // Apply incoming updates
    },
    ...mandatoryAwards, // Mandatory awards already handle all fields in this update
    ...(Object.keys(championsAward).length > 0 && { champions: championsAward })
  };

  // Update the deliberation
  const updated = await db.finalDeliberations.byDivision(divisionId).update({
    awards: updatedAwards
  });

  if (!updated) {
    throw new MutationError(
      MutationErrorCode.INTERNAL_ERROR,
      `Failed to update final deliberation awards for division ${divisionId}`
    );
  }

  // Publish event
  const pubSub = getRedisPubSub();
  await pubSub.publish(divisionId, RedisEventTypes.FINAL_DELIBERATION_UPDATED, {
    divisionId,
    awards: updated.awards
  });

  return {
    awards: JSON.stringify(updated.awards)
  };
};
