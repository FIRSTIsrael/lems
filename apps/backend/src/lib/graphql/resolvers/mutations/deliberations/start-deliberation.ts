import { GraphQLFieldResolver } from 'graphql';
import { JudgingCategory } from '@lems/database';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { underscoresToHyphens } from '@lems/shared/utils';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';
import { authorizeDeliberationAccess, assertDeliberationEditable } from './utils';

interface StartDeliberationArgs {
  divisionId: string;
  category: JudgingCategory;
}

/**
 * Resolver for Mutation.startDeliberation
 * Changes the deliberation status from NOT_STARTED to IN_PROGRESS and sets the start time
 */
export const startDeliberationResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  StartDeliberationArgs,
  Promise<{
    deliberationId: string;
    status: string;
    startTime: string;
  }>
> = async (_root, { divisionId, category }, context) => {
  const hyphenatedCategory = underscoresToHyphens(category) as JudgingCategory;
  const deliberation = await authorizeDeliberationAccess(context, divisionId, hyphenatedCategory);

  // Check if deliberation is editable
  assertDeliberationEditable(deliberation.status);

  // Check if deliberation is in NOT_STARTED status
  if (deliberation.status !== 'not-started') {
    throw new MutationError(
      MutationErrorCode.FORBIDDEN,
      `Cannot start deliberation with status "${deliberation.status}". Must be "not-started"`
    );
  }

  // Update the deliberation status and set start time
  const now = new Date();
  const updated = await db.judgingDeliberations.get(deliberation.id).update({
    status: 'in-progress',
    start_time: now
  });

  if (!updated) {
    throw new MutationError(
      MutationErrorCode.INTERNAL_ERROR,
      `Failed to start deliberation ${deliberation.id}`
    );
  }

  const pubSub = getRedisPubSub();
  await Promise.all([
    pubSub.publish(divisionId, RedisEventTypes.DELIBERATION_UPDATED, {
      deliberationId: updated.id,
      startTime: updated.start_time.toISOString()
    }),
    pubSub.publish(divisionId, RedisEventTypes.DELIBERATION_STATUS_CHANGED, {
      deliberationId: updated.id,
      status: updated.status
    })
  ]);

  return {
    deliberationId: updated.id,
    status: updated.status,
    startTime: updated.start_time.toISOString()
  };
};
