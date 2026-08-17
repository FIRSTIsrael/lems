import { GraphQLFieldResolver } from 'graphql';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
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
    if (match.status !== 'not-started') {
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

    // Update the division's loaded match
    const result = await db.divisions.byId(divisionId).updateState({
      field: {
        loadedMatch: matchId
      }
    });

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
