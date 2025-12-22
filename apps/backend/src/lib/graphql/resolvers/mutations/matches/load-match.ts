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
}

/**
 * Resolver for Mutation.loadMatch
 * Loads a match for a division, making it the currently loaded match.
 *
 * Validation checks:
 * 1. Match must be in not-started status
 * 2. Match must start 15 minutes or less from now
 */
export const loadMatchResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  LoadMatchArgs,
  Promise<MatchEvent>
> = async (_root, { divisionId, matchId }, context) => {
  try {
    const match = await authorizeMatchAccess(context, divisionId, matchId);

    // Check 1: Match must be in not-started status
    const matchState = await db.raw.mongo
      .collection<RobotGameMatchState>('robot_game_match_states')
      .findOne({ matchId });

    if (!matchState || matchState.status !== 'not-started') {
      throw new MutationError(MutationErrorCode.CONFLICT, 'Match is not in not-started status');
    }

    // Check 2: Match must start 15 minutes or less from now
    const now = new Date();
    const matchStartTime = new Date(match.scheduled_time);
    const timeDifferenceMinutes = (matchStartTime.getTime() - now.getTime()) / (1000 * 60);
    if (timeDifferenceMinutes > 15) {
      throw new MutationError(
        MutationErrorCode.CONFLICT,
        'Match is scheduled to start more than 15 minutes from now'
      );
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

    return { matchId };
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
};
