import { GraphQLFieldResolver } from 'graphql';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { JudgingSessionState } from '@lems/database';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';

interface UpdateJudgingSessionArgs {
  divisionId: string;
  sessionId: string;
  called?: boolean | null;
  queued?: boolean | null;
}

interface JudgingSessionUpdatedEvent {
  sessionId: string;
  called: boolean;
  queued: boolean;
}

/**
 * Resolver for Mutation.updateJudgingSession
 * Updates judging session called and queued status.
 * Called by judging head queuer to call teams and mark them as queued.
 *
 * Validation checks:
 * 1. User is authenticated
 * 2. User has judging-head-queuer, head-judge, or judge role
 * 3. User is assigned to the division
 * 4. Session exists and is in the division
 */
export const updateJudgingSessionResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  UpdateJudgingSessionArgs,
  Promise<JudgingSessionUpdatedEvent>
> = async (_root, { divisionId, sessionId, called, queued }, context) => {
  try {
    // Check 1: User must be authenticated
    if (!context.user) {
      throw new MutationError(MutationErrorCode.UNAUTHORIZED, 'Authentication required');
    }

    // Check 2: User must have judging-head-queuer, head-judge, or judge role
    if (
      context.user.role !== 'judging-head-queuer' &&
      context.user.role !== 'head-judge' &&
      context.user.role !== 'judge'
    ) {
      throw new MutationError(
        MutationErrorCode.FORBIDDEN,
        'User must have judging-head-queuer, head-judge, or judge role'
      );
    }

    // Check 3: User must be assigned to the division
    if (!context.user.divisions.includes(divisionId)) {
      throw new MutationError(MutationErrorCode.FORBIDDEN, 'User is not assigned to the division');
    }

    // Check 3: Session exists and is in the division
    const session = await db.raw.sql
      .selectFrom('judging_sessions')
      .selectAll()
      .where('id', '=', sessionId)
      .where('division_id', '=', divisionId)
      .executeTakeFirst();

    if (!session) {
      throw new MutationError(MutationErrorCode.NOT_FOUND, 'Judging session not found');
    }

    // Prepare update object - set to current time if true, null if false
    if (called === undefined && queued === undefined) {
      throw new MutationError(
        MutationErrorCode.INVALID_INPUT,
        'At least one of called or queued must be provided'
      );
    }

    const now = new Date();
    const updateData: Partial<JudgingSessionState> = {};

    if (called !== undefined && called !== null) {
      updateData.called = called ? now : null;
    }

    if (queued !== undefined && queued !== null) {
      updateData.queued = queued ? now : null;
    }

    // Update session state in MongoDB
    const result = await db.raw.mongo
      .collection<JudgingSessionState>('judging_session_states')
      .findOneAndUpdate({ sessionId }, { $set: updateData }, { returnDocument: 'after' });

    if (!result) {
      throw new MutationError(
        MutationErrorCode.INTERNAL_ERROR,
        `Failed to update judging session ${sessionId}`
      );
    }

    // Publish update event
    const pubSub = getRedisPubSub();
    await pubSub.publish(divisionId, RedisEventTypes.JUDGING_SESSION_UPDATED, {
      sessionId,
      called: result.called !== null,
      queued: result.queued !== null
    });

    return {
      sessionId,
      called: result.called !== null,
      queued: result.queued !== null
    };
  } catch (error) {
    console.error('Error updating judging session:', sessionId, 'in division:', divisionId, error);
    throw error;
  }
};
