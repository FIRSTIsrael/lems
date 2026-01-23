import { GraphQLFieldResolver } from 'graphql';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';
import { authorizeScoresheetAccess } from './utils';

type ScoresheetSignatureUpdatedEvent = {
  scoresheetId: string;
  signature: string | null;
  status: string;
};

interface UpdateScoresheetSignatureArgs {
  divisionId: string;
  scoresheetId: string;
  signature: string;
}

/**
 * Resolver for Mutation.updateScoresheetSignature
 * Updates the signature and status of a scoresheet to 'submitted'
 * This mutation combines signature storage with status transition
 */
export const updateScoresheetSignatureResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  UpdateScoresheetSignatureArgs,
  Promise<ScoresheetSignatureUpdatedEvent>
> = async (_root, { divisionId, scoresheetId, signature }, context) => {
  const { scoresheet: dbScoresheet, scoresheetObjectId } = await authorizeScoresheetAccess(
    context,
    divisionId,
    scoresheetId
  );

  // Validate signature input
  if (!signature || typeof signature !== 'string') {
    throw new MutationError(
      MutationErrorCode.INVALID_INPUT,
      'Signature must be a valid string (encoded PNG data)'
    );
  }

  // Validate scoresheet status can be submitted
  // Allow transition from 'completed' or 'gp' (head ref reviewed) to 'gp'
  const allowedStatuses = ['completed', 'gp'];
  if (!allowedStatuses.includes(dbScoresheet.status)) {
    throw new MutationError(
      MutationErrorCode.INVALID_INPUT,
      `Cannot submit scoresheet with status '${dbScoresheet.status}'. Must be in 'completed' or 'gp' status.`
    );
  }

  // Update both signature and status in database
  const result = await db.raw.mongo.collection('scoresheets').findOneAndUpdate(
    { _id: scoresheetObjectId },
    {
      $set: {
        'data.signature': signature,
        status: 'gp'
      }
    },
    { returnDocument: 'after' }
  );

  if (!result) {
    throw new MutationError(
      MutationErrorCode.INTERNAL_ERROR,
      `Failed to submit scoresheet ${scoresheetId}`
    );
  }

  // Publish a generic scoresheet update event
  const pubSub = getRedisPubSub();

  const eventPayload: ScoresheetSignatureUpdatedEvent = {
    scoresheetId,
    signature,
    status: 'gp'
  };

  pubSub.publish(divisionId, RedisEventTypes.SCORESHEET_UPDATED, eventPayload);

  return eventPayload;
};
