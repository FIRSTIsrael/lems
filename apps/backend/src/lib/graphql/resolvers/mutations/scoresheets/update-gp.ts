import { GraphQLFieldResolver } from 'graphql';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';
import { authorizeScoresheetAccess } from './utils';

type ScoresheetGPUpdatedEvent = {
  scoresheetId: string;
  gpValue: number | null;
  notes?: string;
  version: number;
};

interface UpdateScoresheetGPArgs {
  divisionId: string;
  scoresheetId: string;
  value: number | null;
  notes?: string;
}

/**
 * Resolver for Mutation.updateScoresheetGP
 * Updates the Gracious Professionalism rating of a scoresheet
 */
export const updateScoresheetGPResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  UpdateScoresheetGPArgs,
  Promise<ScoresheetGPUpdatedEvent>
> = async (_root, { divisionId, scoresheetId, value, notes }, context) => {
  const { scoresheetObjectId } = await authorizeScoresheetAccess(context, divisionId, scoresheetId);

  if (value !== null && ![2, 3, 4].includes(value)) {
    throw new MutationError(
      MutationErrorCode.INVALID_INPUT,
      `Invalid GP value: ${value}. Must be 2, 3, 4, or null`
    );
  }

  const gpUpdate: Record<string, unknown> = { value };
  if (notes !== undefined) {
    gpUpdate['notes'] = notes;
  }

  const result = await db.raw.mongo.collection('scoresheets').findOneAndUpdate(
    { _id: scoresheetObjectId },
    {
      $set: {
        'data.gp': gpUpdate
      }
    },
    { returnDocument: 'after' }
  );

  if (!result) {
    throw new MutationError(
      MutationErrorCode.INTERNAL_ERROR,
      `Failed to update scoresheet ${scoresheetId}`
    );
  }

  // Publish the update event
  const pubSub = getRedisPubSub();

  const eventPayload: ScoresheetGPUpdatedEvent = {
    scoresheetId,
    gpValue: value,
    notes,
    version: -1
  };

  pubSub.publish(divisionId, RedisEventTypes.SCORESHEET_UPDATED, eventPayload);

  return eventPayload;
};
