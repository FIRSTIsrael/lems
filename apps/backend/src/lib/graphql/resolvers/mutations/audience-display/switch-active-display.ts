import { GraphQLFieldResolver } from 'graphql';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { DivisionState, AudienceDisplayScreen } from '@lems/database';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';
import { authorizeAudienceDisplayAccess } from './utils';

interface SwitchActiveDisplayArgs {
  divisionId: string;
  newDisplay: AudienceDisplayScreen;
}

interface SwitchAudienceDisplayEvent {
  activeDisplay: AudienceDisplayScreen;
}

/**
 * Resolver for Mutation.switchActiveDisplay
 * Switches the active display for a division.
 */
export const switchActiveDisplayResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  SwitchActiveDisplayArgs,
  Promise<SwitchAudienceDisplayEvent>
> = async (_root, { divisionId, newDisplay }, context) => {
  try {
    await authorizeAudienceDisplayAccess(context, divisionId);

    // Safety check: prevent switching to awards mode before awards have been assigned
    if (newDisplay === 'awards') {
      const division = await db.divisions.byId(divisionId).get();
      if (!division?.awards_assigned) {
        throw new MutationError(
          MutationErrorCode.CONFLICT,
          'Cannot switch to awards display mode before awards have been assigned'
        );
      }
    }

    // Update the division's active display in MongoDB
    const result = await db.raw.mongo.collection<DivisionState>('division_states').findOneAndUpdate(
      { divisionId },
      {
        $set: {
          'audienceDisplay.activeDisplay': newDisplay
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new MutationError(
        MutationErrorCode.INTERNAL_ERROR,
        `Failed to update audience display for ${divisionId}`
      );
    }

    // Publish event to notify subscribers
    const pubSub = getRedisPubSub();
    await pubSub.publish(divisionId, RedisEventTypes.AUDIENCE_DISPLAY_SWITCHED, {
      activeDisplay: newDisplay
    });

    return { activeDisplay: newDisplay };
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
};
