import { GraphQLFieldResolver } from 'graphql';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { DivisionState, AwardsPresentation } from '@lems/database';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';
import { authorizeAudienceDisplayAccess } from './utils';

interface UpdatePresentationArgs {
  divisionId: string;
  slideId?: string;
  slideIndex: number;
  stepIndex: number;
}

interface UpdatePresentationResult {
  awardsPresentation: AwardsPresentation;
}

/**
 * Resolver for Mutation.updatePresentation
 * Updates the awards presentation for a division.
 */
export const updatePresentationResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  UpdatePresentationArgs,
  Promise<UpdatePresentationResult>
> = async (_root, { divisionId, slideId, slideIndex, stepIndex }, context) => {
  try {
    await authorizeAudienceDisplayAccess(context, divisionId);

    // Safety check: prevent updating presentation before awards have been assigned
    if (slideIndex) {
      const division = await db.divisions.byId(divisionId).get();
      if (!division?.awards_assigned) {
        throw new MutationError(
          MutationErrorCode.CONFLICT,
          'Cannot update awards presentation before awards have been assigned'
        );
      }
    }

    // Update the division's active display in MongoDB
    const result = await db.raw.mongo.collection<DivisionState>('division_states').findOneAndUpdate(
      { divisionId },
      {
        $set: {
          'audienceDisplay.awardsPresentation': {
            slideId,
            slideIndex,
            stepIndex
          }
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
    await pubSub.publish(divisionId, RedisEventTypes.AWARDS_PRESENTATION_UPDATED, {
      awardsPresentation: result.audienceDisplay.awardsPresentation
    });

    return { awardsPresentation: result.audienceDisplay.awardsPresentation };
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
};
