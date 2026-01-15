import { GraphQLFieldResolver } from 'graphql';
import { JudgingCategory } from '@lems/database';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { underscoresToHyphens } from '@lems/shared/utils';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';
import { assertDeliberationEditable, authorizeDeliberationAccess } from './utils';

interface CompleteDeliberationArgs {
  divisionId: string;
  category: JudgingCategory;
}

/**
 * Resolver for Mutation.completeDeliberation
 * Changes the deliberation status from IN_PROGRESS to COMPLETED
 */
export const completeDeliberationResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  CompleteDeliberationArgs,
  Promise<{
    deliberationId: string;
    completed: boolean;
  }>
> = async (_root, { divisionId, category }, context) => {
  const hyphenatedCategory = underscoresToHyphens(category) as JudgingCategory;
  const deliberation = await authorizeDeliberationAccess(context, divisionId, hyphenatedCategory);

  // Check if deliberation is editable
  assertDeliberationEditable(deliberation.status);

  // Check if deliberation is in IN_PROGRESS status
  if (deliberation.status !== 'in-progress') {
    throw new MutationError(
      MutationErrorCode.FORBIDDEN,
      `Cannot complete deliberation with status "${deliberation.status}". Must be "in-progress"`
    );
  }

  // Update the deliberation status
  const updated = await db.judgingDeliberations.get(deliberation.id).update({
    status: 'completed'
  });

  if (!updated) {
    throw new MutationError(
      MutationErrorCode.INTERNAL_ERROR,
      `Failed to complete deliberation ${deliberation.id}`
    );
  }

  const pubSub = getRedisPubSub();
  await Promise.all([
    pubSub.publish(divisionId, RedisEventTypes.DELIBERATION_UPDATED, {
      deliberationId: updated.id,
      completed: true
    }),
    pubSub.publish(divisionId, RedisEventTypes.DELIBERATION_STATUS_CHANGED, {
      deliberationId: updated.id,
      status: updated.status
    })
  ]);

  return {
    deliberationId: updated.id,
    completed: true
  };
};
