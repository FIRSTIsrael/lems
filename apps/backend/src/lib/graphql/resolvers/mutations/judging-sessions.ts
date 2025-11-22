import { GraphQLFieldResolver } from 'graphql';
import dayjs from 'dayjs';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { JudgingSessionState } from '@lems/database';
import type { GraphQLContext } from '../../apollo-server';
import db from '../../../database';
import { getRedisPubSub } from '../../../redis/redis-pubsub';

interface StartJudgingSessionArgs {
  divisionId: string;
  sessionId: string;
}

interface JudgingEvent {
  sessionId: string;
  version: number;
}

/**
 * Resolver for Mutation.startJudgingSession
 * Starts a judging session with validation checks:
 * 1. User must be a judge role
 * 2. User must be assigned to the division
 * 3. Session's room must match the user's assigned room
 * 4. Session must be in not-started status
 * 5. Session must have a teamId and team must have arrived
 * 6. Session must have 5 minutes or less until scheduled start time
 */
export const startJudgingSessionResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  StartJudgingSessionArgs,
  Promise<JudgingEvent>
> = async (_root, { divisionId, sessionId }, context) => {
  try {
    if (!context.user) {
      throw new MutationError(MutationErrorCode.UNAUTHORIZED, 'Authentication required');
    }

    if (context.user.role !== 'judge') {
      throw new MutationError(MutationErrorCode.FORBIDDEN, 'User must have judge role');
    }

    if (!context.user.divisions.includes(divisionId)) {
      throw new MutationError(MutationErrorCode.FORBIDDEN, 'User is not assigned to the division');
    }

    const userRoomId = context.user.roleInfo?.roomId;
    if (!userRoomId) {
      throw new MutationError(MutationErrorCode.FORBIDDEN, 'User does not have an assigned room');
    }

    // Check 1: Session exists in the division
    const session = await db.raw.sql
      .selectFrom('judging_sessions')
      .selectAll('judging_sessions')
      .where('judging_sessions.id', '=', sessionId)
      .where('judging_sessions.division_id', '=', divisionId)
      .executeTakeFirst();

    if (!session) {
      throw new MutationError(
        MutationErrorCode.NOT_FOUND,
        `Session ${sessionId} not found in division ${divisionId}`
      );
    }

    // Check 2: Session's room must match user's assigned room
    if (session.room_id !== userRoomId) {
      throw new MutationError(
        MutationErrorCode.FORBIDDEN,
        'Session room does not match user assigned room'
      );
    }

    // Check 3: Session must be in not-started status
    const sessionState = await db.raw.mongo
      .collection<JudgingSessionState>('judging_session_states')
      .findOne({ sessionId });

    if (!sessionState || sessionState.status !== 'not-started') {
      throw new MutationError(MutationErrorCode.CONFLICT, `Session is not in not-started status`);
    }

    // Check 4: Session must have a teamId
    if (!session.team_id) {
      throw new MutationError(
        MutationErrorCode.CONFLICT,
        'Cannot start session without a team assigned'
      );
    }

    // Check 5: Team must have arrived
    const teamArrived = await db.raw.sql
      .selectFrom('team_divisions')
      .select(['arrived'])
      .where('team_id', '=', session.team_id)
      .where('division_id', '=', divisionId)
      .executeTakeFirst();

    if (!teamArrived || !teamArrived.arrived) {
      throw new MutationError(MutationErrorCode.CONFLICT, 'Team has not arrived at the division');
    }

    // Check 6: Must have 5 minutes or less until scheduled start time
    const scheduledTime = dayjs(session.scheduled_time);
    const now = dayjs();
    const minutesUntilStart = scheduledTime.diff(now, 'minutes', true);

    if (minutesUntilStart > 5) {
      throw new MutationError(
        MutationErrorCode.CONFLICT,
        `Session is scheduled to start in ${Math.ceil(minutesUntilStart)} minutes. Sessions can only be started 5 minutes or less before their scheduled time.`
      );
    }

    // All checks passed - update the session state in MongoDB
    const startTime = new Date();
    const startDelta = Math.round((startTime.getTime() - scheduledTime.toDate().getTime()) / 1000);

    // Update the judging session state in MongoDB
    const result = await db.raw.mongo
      .collection<JudgingSessionState>('judging_session_states')
      .findOneAndUpdate(
        { sessionId },
        {
          $set: {
            status: 'in-progress',
            startTime,
            startDelta
          }
        },
        { returnDocument: 'after' }
      );

    if (!result) {
      throw new MutationError(
        MutationErrorCode.INTERNAL_ERROR,
        `Failed to update judging session state for ${sessionId}`
      );
    }

    // Publish event to subscribers
    const pubSub = getRedisPubSub();
    await pubSub.publish(divisionId, RedisEventTypes.JUDGING_SESSION_STARTED, {
      sessionId,
      startTime,
      startDelta
    });

    return { sessionId, version: -1, startTime, startDelta };
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
};
