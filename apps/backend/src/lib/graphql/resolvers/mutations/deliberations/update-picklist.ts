import { GraphQLFieldResolver } from 'graphql';
import { JudgingCategory } from '@lems/database';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { underscoresToHyphens } from '@lems/shared/utils';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';
import { authorizeDeliberationAccess, assertDeliberationEditable } from './utils';

interface UpdateDeliberationPicklistArgs {
  divisionId: string;
  category: JudgingCategory;
  picklist: string[];
}

/**
 * Resolver for Mutation.updateDeliberationPicklist
 * Updates the ordered picklist (array of team IDs) for a deliberation
 */
export const updateDeliberationPicklistResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  UpdateDeliberationPicklistArgs,
  Promise<{
    deliberationId: string;
    picklist: string[];
  }>
> = async (_root, { divisionId, category, picklist }, context) => {
  const hyphenatedCategory = underscoresToHyphens(category) as JudgingCategory;
  const deliberation = await authorizeDeliberationAccess(context, divisionId, hyphenatedCategory);

  // Check if deliberation is editable (not completed)
  assertDeliberationEditable(deliberation.status);

  // Fetch all teams in the division to validate team IDs
  const division = await db.divisions.byId(divisionId).get();
  if (!division) {
    throw new MutationError(MutationErrorCode.NOT_FOUND, `Division ${divisionId} not found`);
  }

  const allTeams = await db.teams.byDivisionId(divisionId).getAll();
  const validTeamIds = new Set(allTeams.map(t => t.id));

  // Validate all picklist IDs are valid teams in the division
  for (const teamId of picklist) {
    if (!validTeamIds.has(teamId)) {
      throw new MutationError(
        MutationErrorCode.INVALID_INPUT,
        `Team ID ${teamId} is not in division ${divisionId}`
      );
    }
  }

  // Update the deliberation picklist
  const updated = await db.judgingDeliberations.get(deliberation.id).update({
    picklist
  });

  if (!updated) {
    throw new MutationError(
      MutationErrorCode.INTERNAL_ERROR,
      `Failed to update deliberation picklist for ${deliberation.id}`
    );
  }

  // Publish the update event to Redis
  const pubSub = getRedisPubSub();
  await pubSub.publish(divisionId, RedisEventTypes.DELIBERATION_UPDATED, {
    deliberationId: updated.id,
    picklist: updated.picklist
  });

  return {
    deliberationId: updated.id,
    picklist: updated.picklist
  };
};
