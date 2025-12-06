import { GraphQLFieldResolver } from 'graphql';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { JudgingSession, JudgingSessionState } from '@lems/database';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';
import { dequeueScheduledEvent } from '../../../../queues/scheduled-events-queue';
import { authorizeSessionAccess } from './utils';

interface AbortJudgingSessionArgs {
  divisionId: string;
  sessionId: string;
}

interface JudgingEvent {
  sessionId: string;
  version: number;
}

/**
 * Resolver for Mutation.abortJudgingSession
 * Starts a judging session with validation checks:
 * 1. User must be a judge role
 * 2. User must be assigned to the division
 * 3. Session's room must match the user's assigned room
 * 4. Session must be in in-progress status
 * 5. Session must have a teamId and team must have arrived
 */
export const abortJudgingSessionResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  AbortJudgingSessionArgs,
  Promise<JudgingEvent>
> = async (_root, { divisionId, sessionId }, context) => {
  try {
    const { session } = await authorizeSessionAccess(context, divisionId, sessionId);
    await checkSessionCanBeAborted(divisionId, session);

    try {
      await dequeueScheduledEvent('session-completed', divisionId, { sessionId });
    } catch (error) {
      console.error(
        `Failed to dequeue session completion for ${sessionId}, but continuing with abort:`,
        error
      );
      // Don't fail the mutation - we'll still abort the session
      // The dequeue failure should be monitored separately
    }

    const result = await db.raw.mongo
      .collection<JudgingSessionState>('judging_session_states')
      .findOneAndUpdate(
        { sessionId },
        {
          $set: {
            status: 'not-started',
            startTime: null,
            startDelta: null
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
    await pubSub.publish(divisionId, RedisEventTypes.JUDGING_SESSION_ABORTED, {
      sessionId
    });

    return { sessionId, version: -1 };
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
};

/**
 * Checks whether a judging session can be aborted.
 * Performs the following checks:
 *
 * 1. Session must be in in-progress status
 * 2. Session must have a teamId
 * 3. Team must have arrived
 *
 * @throws {MutationError} if any check fails.
 */
const checkSessionCanBeAborted = async (
  divisionId: string,
  session: JudgingSession
): Promise<void> => {
  // Check 1: Session must be in not-started status
  const sessionState = await db.raw.mongo
    .collection<JudgingSessionState>('judging_session_states')
    .findOne({ sessionId: session.id });
  if (!sessionState || sessionState.status !== 'in-progress') {
    throw new MutationError(MutationErrorCode.CONFLICT, `Session is not in in-progress status`);
  }

  // Check 2: Session must have a teamId
  if (!session.team_id) {
    throw new MutationError(
      MutationErrorCode.CONFLICT,
      'Cannot start session without a team assigned'
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
};
