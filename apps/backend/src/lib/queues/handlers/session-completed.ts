import { Job } from 'bullmq';
import { JudgingSessionState } from '@lems/database';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisPubSub } from '../../redis/redis-pubsub';
import db from '../../database';
import { ScheduledEvent } from '../types';

/**
 * Handler for session completed events
 * Processes judging session completions and updates state + broadcasts events
 */
export async function handleSessionCompleted(job: Job<ScheduledEvent>): Promise<void> {
  const { divisionId, metadata } = job.data;
  const sessionId = metadata.sessionId as string;

  try {
    console.log(
      `[SessionCompletionHandler] Processing session ${sessionId} for division ${divisionId}`
    );

    // Idempotency check: verify session is still in-progress
    const sessionState = await db.raw.mongo
      .collection<JudgingSessionState>('judging_session_states')
      .findOne({ sessionId });

    if (!sessionState) {
      console.warn(
        `[SessionCompletionHandler] Session state not found for ${sessionId}, marking as completed`
      );
      return; // Job already processed or session was deleted
    }

    if (sessionState.status !== 'in-progress') {
      console.warn(
        `[SessionCompletionHandler] Session ${sessionId} is not in-progress (status: ${sessionState.status}), cannot complete`
      );
      return;
    }

    const result = await db.raw.mongo
      .collection<JudgingSessionState>('judging_session_states')
      .findOneAndUpdate(
        { sessionId },
        {
          $set: { status: 'completed' }
        },
        { returnDocument: 'after' }
      );

    if (!result) {
      throw new Error(`Failed to update judging session state for ${sessionId}`);
    }

    console.log(`[SessionCompletionHandler] Updated session ${sessionId} status to completed`);

    const pubSub = getRedisPubSub();
    await pubSub.publish(divisionId, RedisEventTypes.JUDGING_SESSION_COMPLETED, {
      sessionId
    });

    console.log(
      `[SessionCompletionHandler] Published sessionCompleted event for ${sessionId} to ${divisionId}`
    );
  } catch (error) {
    console.error(
      `[SessionCompletionHandler] Error processing session completion for ${sessionId}:`,
      error
    );
    throw error; // Re-throw to trigger retry with exponential backoff
  }
}
