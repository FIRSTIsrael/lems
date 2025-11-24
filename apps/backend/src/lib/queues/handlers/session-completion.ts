import { Job } from 'bullmq';
import { JudgingSessionState } from '@lems/database';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisPubSub } from '../../redis/redis-pubsub';
import db from '../../database';
import type { ScheduledEvent } from '../worker-manager';

/**
 * Handler for session completion events
 * Processes judging session completions and updates state + broadcasts events
 */
export async function handleSessionCompletion(job: Job<ScheduledEvent>): Promise<void> {
  const { eventId: sessionId, divisionId, metadata } = job.data;

  const startTime = new Date(metadata.startTime as string);
  const scheduledDurationSeconds = metadata.scheduledDurationSeconds as number;
  const sessionType = metadata.sessionType as string;

  try {
    console.log(
      `[SessionCompletionHandler] Processing ${sessionType} session ${sessionId} ` +
        `for division ${divisionId}`
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

    if (sessionState.status === 'completed') {
      console.info(
        `[SessionCompletionHandler] Session ${sessionId} already completed, skipping idempotent reprocessing`
      );
      return;
    }

    if (sessionState.status !== 'in-progress') {
      console.warn(
        `[SessionCompletionHandler] Session ${sessionId} is not in-progress (status: ${sessionState.status}), cannot complete`
      );
      return;
    }

    // Update session state to completed
    const endTime = new Date();
    const actualDurationSeconds = Math.round(
      (endTime.getTime() - new Date(startTime).getTime()) / 1000
    );

    const result = await db.raw.mongo
      .collection<JudgingSessionState>('judging_session_states')
      .findOneAndUpdate(
        { sessionId },
        {
          $set: {
            status: 'completed',
            endTime,
            actualDurationSeconds
          }
        },
        { returnDocument: 'after' }
      );

    if (!result) {
      throw new Error(`Failed to update judging session state for ${sessionId}`);
    }

    console.log(
      `[SessionCompletionHandler] Updated session ${sessionId} status to completed ` +
        `(scheduled: ${scheduledDurationSeconds}s, actual: ${actualDurationSeconds}s)`
    );

    // Publish session completion event to all subscribers
    const pubSub = getRedisPubSub();
    await pubSub.publish(divisionId, RedisEventTypes.JUDGING_SESSION_COMPLETED, {
      sessionId,
      endTime,
      actualDurationSeconds,
      scheduledDurationSeconds
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
