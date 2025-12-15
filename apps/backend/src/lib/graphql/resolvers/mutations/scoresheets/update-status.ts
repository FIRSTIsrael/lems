import { GraphQLFieldResolver } from 'graphql';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';
import { authorizeScoresheetAccess } from './utils';

type ScoresheetStatusUpdatedEvent = {
  scoresheetId: string;
  status: string;
  version: number;
};

interface UpdateScoresheetStatusArgs {
  divisionId: string;
  scoresheetId: string;
  status: string;
}

/**
 * Resolver for Mutation.updateScoresheetStatus
 * Updates the status of a scoresheet
 */
export const updateScoresheetStatusResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  UpdateScoresheetStatusArgs,
  Promise<ScoresheetStatusUpdatedEvent>
> = async (_root, { divisionId, scoresheetId, status }, context) => {
  const { scoresheet: dbScoresheet, scoresheetObjectId } = await authorizeScoresheetAccess(
    context,
    divisionId,
    scoresheetId
  );

  const validStatuses = ['empty', 'draft', 'completed', 'gp', 'submitted'];
  if (!validStatuses.includes(status)) {
    throw new MutationError(MutationErrorCode.UNAUTHORIZED, `Invalid status: ${status}`);
  }

  if (dbScoresheet.status === status) {
    return { scoresheetId, status, version: -1 };
  }

  const result = await db.raw.mongo.collection('scoresheets').findOneAndUpdate(
    { _id: scoresheetObjectId },
    {
      $set: {
        status
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

  const pubSub = getRedisPubSub();

  const eventPayload: ScoresheetStatusUpdatedEvent = {
    scoresheetId,
    status,
    version: -1
  };

  pubSub.publish(divisionId, RedisEventTypes.SCORESHEET_UPDATED, eventPayload);

  return eventPayload;
};
