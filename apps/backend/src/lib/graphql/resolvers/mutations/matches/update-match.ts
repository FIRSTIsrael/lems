import { GraphQLFieldResolver } from 'graphql';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';

interface UpdateMatchArgs {
  divisionId: string;
  matchId: string;
  called?: boolean | null;
}

interface MatchUpdatedEvent {
  id: string;
  called: boolean;
}

/**
 * Resolver for Mutation.updateMatch
 * Updates match called status.
 * Called by field head queuer, head referee, or referee to call teams to the match.
 *
 * Validation checks:
 * 1. User is authenticated
 * 2. User has field-head-queuer, head-referee, or referee role
 * 3. User is assigned to the division
 * 4. Match exists and is in the division
 */
export const updateMatchResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  UpdateMatchArgs,
  Promise<MatchUpdatedEvent>
> = async (_root, { divisionId, matchId, called }, context) => {
  try {
    // Check 1: User must be authenticated
    if (!context.user) {
      throw new MutationError(MutationErrorCode.UNAUTHORIZED, 'Authentication required');
    }

    // Check 2: User must have field-head-queuer, head-referee, or referee role
    if (
      context.user.role !== 'field-head-queuer' &&
      context.user.role !== 'head-referee' &&
      context.user.role !== 'referee'
    ) {
      throw new MutationError(
        MutationErrorCode.FORBIDDEN,
        'User must have field-head-queuer, head-referee, or referee role'
      );
    }

    // Check 3: User must be assigned to the division
    if (!context.user.divisions.includes(divisionId)) {
      throw new MutationError(MutationErrorCode.FORBIDDEN, 'User is not assigned to the division');
    }

    // Check 3: Match must exist in the division
    const match = await db.raw.sql
      .selectFrom('robot_game_matches')
      .selectAll()
      .where('id', '=', matchId)
      .where('division_id', '=', divisionId)
      .executeTakeFirst();

    if (!match) {
      throw new MutationError(
        MutationErrorCode.NOT_FOUND,
        `Match ${matchId} not found in division ${divisionId}`
      );
    }

    // Prepare update object - set to current time if true, null if false
    if (called === undefined || called === null) {
      throw new MutationError(MutationErrorCode.INVALID_INPUT, 'called field must be provided');
    }

    const now = new Date();
    const updateData = {
      called: called ? now : null
    };

    // Update match state in MongoDB
    const result = await db.raw.mongo
      .collection('robot_game_match_states')
      .findOneAndUpdate({ matchId }, { $set: updateData }, { returnDocument: 'after' });

    if (!result) {
      throw new MutationError(
        MutationErrorCode.INTERNAL_ERROR,
        `Failed to update match ${matchId}`
      );
    }

    // Publish event to notify subscribers
    const pubSub = getRedisPubSub();
    await pubSub.publish(divisionId, RedisEventTypes.MATCH_UPDATED, {
      id: matchId,
      called: result.called !== null
    });

    return {
      id: matchId,
      called: result.called !== null
    };
  } catch (error) {
    console.error('Error updating match:', matchId, 'in division:', divisionId, error);
    throw error;
  }
};
