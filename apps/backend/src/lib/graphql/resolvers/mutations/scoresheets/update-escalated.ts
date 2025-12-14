import { GraphQLFieldResolver } from 'graphql';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';
import { authorizeScoresheetAccess } from './utils';

type ScoresheetEscalatedUpdatedEvent = {
  scoresheetId: string;
  escalated: boolean;
  version: number;
};

interface UpdateScoresheetEscalatedArgs {
  divisionId: string;
  scoresheetId: string;
  escalated: boolean;
}

/**
 * Resolver for Mutation.updateScoresheetEscalated
 * Updates the escalated flag of a scoresheet
 */
export const updateScoresheetEscalatedResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  UpdateScoresheetEscalatedArgs,
  Promise<ScoresheetEscalatedUpdatedEvent>
> = async (_root, { divisionId, scoresheetId, escalated }, context) => {
  const { scoresheetObjectId } = await authorizeScoresheetAccess(context, divisionId, scoresheetId);

  const result = await db.raw.mongo.collection('scoresheets').findOneAndUpdate(
    { _id: scoresheetObjectId },
    {
      $set: {
        escalated
      }
    },
    { returnDocument: 'after' }
  );

  if (!result) {
    throw new MutationError(
      MutationErrorCode.UNAUTHORIZED,
      `Failed to update scoresheet ${scoresheetId}`
    );
  }

  // Publish the update event
  const pubSub = getRedisPubSub();

  const eventPayload: ScoresheetEscalatedUpdatedEvent = {
    scoresheetId,
    escalated,
    version: -1
  };

  pubSub.publish(divisionId, RedisEventTypes.SCORESHEET_UPDATED, eventPayload);

  return eventPayload;
};
