import { GraphQLFieldResolver } from 'graphql';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { RobotGameMatchState, DivisionState } from '@lems/database';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';
import { authorizeMatchAccess } from './utils';

interface LoadMatchArgs {
  divisionId: string;
  matchId: string;
}

interface MatchEvent {
  matchId: string;
  version: number;
}

/**
 * Resolver for Mutation.loadMatch
 * Loads a match for a division, making it the currently loaded match.
 *
 * Validation checks:
 * 1. Match must be in not-started status
 */
export const loadMatchResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  LoadMatchArgs,
  Promise<MatchEvent>
> = async (_root, { divisionId, matchId }, context) => {
  try {
    await authorizeMatchAccess(context, divisionId, matchId);

    // Check 1: Match must be in not-started status
    const matchState = await db.raw.mongo
      .collection<RobotGameMatchState>('robot_game_match_states')
      .findOne({ matchId });

    if (!matchState || matchState.status !== 'not-started') {
      throw new MutationError(MutationErrorCode.CONFLICT, 'Match is not in not-started status');
    }

    // Update the division's loaded match in MongoDB
    const result = await db.raw.mongo.collection<DivisionState>('division_states').findOneAndUpdate(
      { divisionId },
      {
        $set: {
          'field.loadedMatch': matchId
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new MutationError(
        MutationErrorCode.INTERNAL_ERROR,
        `Failed to update division state for ${divisionId}`
      );
    }

    // Publish event to notify subscribers
    const pubSub = getRedisPubSub();
    await pubSub.publish(divisionId, RedisEventTypes.MATCH_LOADED, {
      matchId
    });

    return { matchId, version: -1 };
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
};
