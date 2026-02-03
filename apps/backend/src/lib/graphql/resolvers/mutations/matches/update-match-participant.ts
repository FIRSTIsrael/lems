import { GraphQLFieldResolver } from 'graphql';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { RobotGameMatchState } from '@lems/database';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';

interface UpdateMatchParticipantArgs {
  divisionId: string;
  matchId: string;
  teamId: string;
  queued?: boolean | null;
}

interface MatchParticipantEvent {
  matchId: string;
  teamId: string;
  queued: Date | null;
}

/**
 * Resolver for Mutation.updateMatchParticipant
 * Updates participant queued status in a match.
 * Called by field head queuer to mark teams as arrived to match (queued).
 *
 * Validation checks:
 * 1. User is authenticated
 * 2. User has referee, head-referee, or field-head-queuer role
 * 3. User is assigned to the division
 * 4. Match exists and is in the division
 * 5. Team exists in the match participants
 * 6. Match is not-started
 */
export const updateMatchParticipantResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  UpdateMatchParticipantArgs,
  Promise<MatchParticipantEvent>
> = async (_root, { divisionId, matchId, teamId, queued }, context) => {
  try {
    // Check 1: User must be authenticated
    if (!context.user) {
      throw new MutationError(MutationErrorCode.UNAUTHORIZED, 'Authentication required');
    }

    // Check 2: User must have referee, head-referee, or field-head-queuer role
    const allowedRoles = ['referee', 'head-referee', 'field-head-queuer'];
    if (!allowedRoles.includes(context.user.role)) {
      throw new MutationError(
        MutationErrorCode.FORBIDDEN,
        'User must have referee, head-referee, or field-head-queuer role'
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

    // Check 4: Team must exist in the match participants
    const participant = await db.raw.sql
      .selectFrom('robot_game_match_participants')
      .selectAll()
      .where('team_id', '=', teamId)
      .where('match_id', '=', matchId)
      .executeTakeFirst();

    if (!participant) {
      throw new MutationError(
        MutationErrorCode.NOT_FOUND,
        `Team ${teamId} not found in match ${matchId}`
      );
    }

    // Check 5: Get current match state and validate match is not-started
    const matchState = await db.raw.mongo
      .collection<RobotGameMatchState>('robot_game_match_states')
      .findOne({ matchId });

    if (!matchState) {
      throw new MutationError(
        MutationErrorCode.INTERNAL_ERROR,
        `Match state not found for ${matchId}`
      );
    }

    if (matchState.status !== 'not-started') {
      throw new MutationError(
        MutationErrorCode.CONFLICT,
        'Cannot update participant queued status for match that is not in not-started status'
      );
    }

    // Prepare update object - set to current time if true, null if false
    // Tech debt: Participants in mongo are keyed by table ID
    const now = new Date();
    const updateData: Partial<Record<string, Date | null>> = {};

    if (queued !== undefined && queued !== null) {
      updateData[`participants.${participant.table_id}.queued`] = queued ? now : null;
    }

    if (Object.keys(updateData).length === 0) {
      throw new MutationError(MutationErrorCode.INVALID_INPUT, 'queued field must be provided');
    }

    const result = await db.raw.mongo
      .collection<RobotGameMatchState>('robot_game_match_states')
      .findOneAndUpdate(
        { matchId },
        {
          $set: updateData
        },
        { returnDocument: 'after' }
      );

    if (!result) {
      throw new MutationError(
        MutationErrorCode.INTERNAL_ERROR,
        `Failed to update participant queued status for match ${matchId}`
      );
    }

    // Publish event to notify subscribers
    const participantState = result.participants?.[participant.table_id] || {
      queued: null
    };

    const pubSub = getRedisPubSub();
    await pubSub.publish(divisionId, RedisEventTypes.MATCH_PARTICIPANT_UPDATED, {
      matchId,
      teamId,
      queued: participantState.queued
    });

    return {
      matchId,
      teamId,
      queued: participantState.queued || null
    };
  } catch (error) {
    console.error(
      'Error updating match participant for team:',
      teamId,
      'in match:',
      matchId,
      'in division:',
      divisionId,
      error
    );
    throw error;
  }
};
