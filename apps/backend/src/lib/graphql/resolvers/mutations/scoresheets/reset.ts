import { GraphQLFieldResolver } from 'graphql';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';
import { authorizeScoresheetAccess } from './utils';

type ScoresheetResetEvent = {
  __typename: 'ScoresheetResetEvent';
  scoresheetId: string;
  status: string;
};

interface ResetScoresheetArgs {
  divisionId: string;
  scoresheetId: string;
}

/**
 * Resolver for Mutation.resetScoresheet
 * Resets the scoresheet to empty status and clears escalation
 * Only available to head-referee role
 */
export const resetScoresheetResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  ResetScoresheetArgs,
  Promise<ScoresheetResetEvent>
> = async (_root, { divisionId, scoresheetId }, context) => {
  // Authorization check
  if (!context.user) {
    throw new MutationError(MutationErrorCode.UNAUTHORIZED, 'Authentication required');
  }

  // Only head-referee can reset
  if (context.user.role !== 'head-referee') {
    throw new MutationError(MutationErrorCode.FORBIDDEN, 'Only head-referee can reset scoresheets');
  }

  const { scoresheetObjectId } = await authorizeScoresheetAccess(context, divisionId, scoresheetId);

  // Reset the scoresheet - unset data and set status to empty
  const result = await db.raw.mongo.collection('scoresheets').findOneAndUpdate(
    { _id: scoresheetObjectId },
    {
      $unset: { data: '' },
      $set: {
        status: 'empty'
      }
    },
    { returnDocument: 'after' }
  );

  if (!result) {
    throw new MutationError(
      MutationErrorCode.UNAUTHORIZED,
      `Failed to reset scoresheet ${scoresheetId}`
    );
  }

  // Publish the update event
  const pubSub = getRedisPubSub();

  const eventPayload: ScoresheetResetEvent = {
    __typename: 'ScoresheetResetEvent',
    scoresheetId,
    status: 'empty'
  };

  pubSub.publish(divisionId, RedisEventTypes.SCORESHEET_UPDATED, eventPayload);

  return eventPayload;
};
