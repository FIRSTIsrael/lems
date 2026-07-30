import { GraphQLFieldResolver } from 'graphql';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';
import { dequeueScheduledEvent } from '../../../../queues/scheduled-events-queue';
import { authorizeMatchAccess } from './utils';

interface AbortMatchArgs {
  divisionId: string;
  matchId: string;
}

interface MatchEvent {
  matchId: string;
}

/**
 * Resolver for Mutation.abortMatch
 * Aborts a robot game match that is currently in progress.
 *
 * Performs the following checks:
 * 1. User must be a scorekeeper role
 * 2. User must be assigned to the division
 * 3. Match must be in in-progress status
 *
 * Dequeues the pending match-completed event before aborting.
 */
export const abortMatchResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  AbortMatchArgs,
  Promise<MatchEvent>
> = async (_root, { divisionId, matchId }, context) => {
  try {
    const match = await authorizeMatchAccess(context, divisionId, matchId);
    await checkMatchCanBeAborted(matchId);

    try {
      await dequeueScheduledEvent('match-completed', divisionId, { matchId });
    } catch (error) {
      console.error(
        `Failed to dequeue match completion for ${matchId}, but continuing with abort:`,
        error
      );
      // Don't fail the mutation - we'll still abort the match
      // The dequeue failure should be monitored separately
    }

    try {
      await dequeueScheduledEvent('match-endgame-triggered', divisionId, { matchId });
    } catch (error) {
      console.error(
        `Failed to dequeue match endgame trigger for ${matchId}, but continuing with abort:`,
        error
      );
      // Don't fail the mutation - we'll still abort the match
      // The dequeue failure should be monitored separately
    }

    const divisionStateResult = await db.divisions.byId(divisionId).updateState({
      field: {
        activeMatch: null,
        loadedMatch: match.stage === 'TEST' ? null : matchId
      }
    });

    if (!divisionStateResult) {
      throw new MutationError(
        MutationErrorCode.INTERNAL_ERROR,
        `Failed to update division state for ${divisionId}`
      );
    }

    const result = await db.robotGameMatches.byId(matchId).update({
      status: 'not-started',
      start_time: null,
      start_delta: null
    });

    if (!result) {
      throw new MutationError(
        MutationErrorCode.INTERNAL_ERROR,
        `Failed to update match state for ${matchId}`
      );
    }

    const pubSub = getRedisPubSub();
    await pubSub.publish(divisionId, RedisEventTypes.MATCH_ABORTED, {
      matchId
    });

    return { matchId };
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
};

/**
 * Checks whether a robot game match can be aborted.
 * Performs the following checks:
 *
 * 1. Match must be in in-progress status
 *
 * @throws {MutationError} if any check fails.
 */
const checkMatchCanBeAborted = async (matchId: string): Promise<void> => {
  const match = await db.robotGameMatches.byId(matchId).get();

  if (!match || match.status !== 'in-progress') {
    throw new MutationError(MutationErrorCode.CONFLICT, 'Match is not in in-progress status');
  }
};
