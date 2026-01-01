import { GraphQLFieldResolver } from 'graphql';
import dayjs from 'dayjs';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { JudgingSession, JudgingSessionState } from '@lems/database';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';
import { enqueueScheduledEvent } from '../../../../queues/scheduled-events-queue';
import { authorizeSessionAccess } from './utils';

interface StartJudgingSessionArgs {
  divisionId: string;
  sessionId: string;
}

interface JudgingEvent {
  sessionId: string;
}

/**
 * Resolver for Mutation.startJudgingSession
 */
export const startJudgingSessionResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  StartJudgingSessionArgs,
  Promise<JudgingEvent>
> = async (_root, { divisionId, sessionId }, context) => {
  try {
    const { session } = await authorizeSessionAccess(context, divisionId, sessionId);
    await checkSessionCanBeStarted(divisionId, session);

    const division = await db.divisions.byId(divisionId).get();

    const scheduledTime = dayjs(session.scheduled_time);
    const startTime = new Date();
    const startDelta = Math.round((startTime.getTime() - scheduledTime.toDate().getTime()) / 1000);

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

    const pubSub = getRedisPubSub();
    await pubSub.publish(divisionId, RedisEventTypes.JUDGING_SESSION_STARTED, {
      sessionId,
      startTime,
      startDelta
    });

    try {
      await enqueueScheduledEvent(
        {
          eventType: 'session-completed',
          divisionId,
          metadata: {
            sessionId
          }
        },
        division.schedule_settings.judging_session_length * 1000
      );
    } catch (error) {
      console.error(
        `Failed to enqueue session completion for ${sessionId}, but session was started:`,
        error
      );
      // Don't fail the mutation - the session is already started
      // The queue failure should be monitored separately
    }

    return { sessionId, startTime, startDelta };
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
};

/**
 * Checks whether a judging session can be started.
 * Performs the following checks:
 *
 * 1. Session must be in not-started status
 * 2. Session must have a teamId
 * 3. Team must have arrived
 * 4. Must have 5 minutes or less until scheduled start time
 *
 * @throws {MutationError} If any check fails
 */
const checkSessionCanBeStarted = async (
  divisionId: string,
  session: JudgingSession
): Promise<void> => {
  // Check 1: Session must be in not-started status
  const sessionState = await db.raw.mongo
    .collection<JudgingSessionState>('judging_session_states')
    .findOne({ sessionId: session.id });

  if (!sessionState || sessionState.status !== 'not-started') {
    throw new MutationError(MutationErrorCode.CONFLICT, `Session is not in not-started status`);
  }

  // Check 2: Session must have a teamId
  if (!session.team_id) {
    throw new MutationError(
      MutationErrorCode.CONFLICT,
      'Cannot modify session without a team assigned'
    );
  }

  // Check 3: Team must have arrived
  const teamArrived = await db.raw.sql
    .selectFrom('team_divisions')
    .select(['arrived'])
    .where('team_id', '=', session.team_id)
    .where('division_id', '=', divisionId)
    .executeTakeFirst();

  if (!teamArrived || !teamArrived.arrived) {
    throw new MutationError(MutationErrorCode.CONFLICT, 'Team has not arrived at the division');
  }

  // Check 4: Must have 5 minutes or less until scheduled start time
  const scheduledTime = dayjs(session.scheduled_time);
  const now = dayjs();
  const minutesUntilStart = scheduledTime.diff(now, 'minutes', true);

  if (minutesUntilStart > 5) {
    throw new MutationError(
      MutationErrorCode.CONFLICT,
      `Session is scheduled to start in ${Math.ceil(minutesUntilStart)} minutes. Sessions can only be started 5 minutes or less before their scheduled time.`
    );
  }
};
