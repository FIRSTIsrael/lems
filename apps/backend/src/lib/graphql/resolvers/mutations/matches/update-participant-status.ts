import { GraphQLFieldResolver } from 'graphql';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { RobotGameMatchState } from '@lems/database';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';

interface UpdateParticipantStatusArgs {
  divisionId: string;
  matchId: string;
  participantId: string;
  present?: boolean | null;
  ready?: boolean | null;
}

interface ParticipantStatusEvent {
  participantId: string;
  present: Date | null;
  ready: Date | null;
}

/**
 * Resolver for Mutation.updateParticipantStatus
 * Updates participant status (present/ready) in a match.
 * Called by referees to mark teams as present or ready.
 *
 * Validation checks:
 * 1. User is authenticated and has 'referee' role
 * 2. User is assigned to the division
 * 3. Match exists and is in the division
 * 4. Participant exists in the match
 * 5. Match is not-started
 */
export const updateParticipantStatusResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  UpdateParticipantStatusArgs,
  Promise<ParticipantStatusEvent>
> = async (_root, { divisionId, matchId, participantId, present, ready }, context) => {
  try {
    // Check 1: User must be authenticated
    if (!context.user) {
      throw new MutationError(MutationErrorCode.UNAUTHORIZED, 'Authentication required');
    }

    // Check 2: User must have referee role
    if (context.user.role !== 'referee') {
      throw new MutationError(MutationErrorCode.FORBIDDEN, 'User must have referee role');
    }

    // Check 3: User must be assigned to the division
    if (!context.user.divisions.includes(divisionId)) {
      throw new MutationError(MutationErrorCode.FORBIDDEN, 'User is not assigned to the division');
    }

    // Check 4: Match must exist in the division
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

    // Check 5: Participant must exist in the match
    const participant = await db.raw.sql
      .selectFrom('robot_game_match_participants')
      .selectAll()
      .where('id', '=', participantId)
      .where('match_id', '=', matchId)
      .executeTakeFirst();

    if (!participant) {
      throw new MutationError(
        MutationErrorCode.NOT_FOUND,
        `Participant ${participantId} not found in match ${matchId}`
      );
    }

    // Check 6: Get current match state and validate match is not-started
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
        'Cannot update participant status for match that is not in not-started status'
      );
    }

    // Prepare update object - set to current time if true, null if false
    // Tech debt: Participants in mongo are keyed by table ID
    const now = new Date();
    const updateData: Partial<Record<string, Date | null>> = {};

    if (present !== undefined && present !== null) {
      updateData[`participants.${participant.table_id}.present`] = present ? now : null;
    }

    if (ready !== undefined && ready !== null) {
      updateData[`participants.${participant.table_id}.ready`] = ready ? now : null;
    }

    if (Object.keys(updateData).length === 0) {
      throw new MutationError(
        MutationErrorCode.INVALID_INPUT,
        'Either present or ready must be provided'
      );
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
        `Failed to update participant status for match ${matchId}`
      );
    }

    // Publish event to notify subscribers
    const participantState = result.participants?.[participant.table_id] || {
      present: null,
      ready: null
    };

    const pubSub = getRedisPubSub();
    await pubSub.publish(divisionId, RedisEventTypes.MATCH_PARTICIPANT_UPDATED, {
      matchId,
      teamId: participant.team_id,
      participantId,
      present: participantState.present,
      ready: participantState.ready,
      queued: null
    });

    return {
      participantId,
      present: participantState.present || null,
      ready: participantState.ready || null
    };
  } catch (error) {
    console.error(
      'Error updating participant status for participant:',
      participantId,
      'in match:',
      matchId,
      'in division:',
      divisionId,
      error
    );
    throw error;
  }
};
