import { Job } from 'bullmq';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisPubSub } from '../../redis/redis-pubsub';
import db from '../../database';
import { ScheduledEvent } from '../types';

/**
 * Handler for match completed events
 * Processes robot game match completions and updates state
 */
export async function handleMatchCompleted(job: Job<ScheduledEvent>): Promise<void> {
  const { divisionId, metadata } = job.data;
  const matchId = metadata.matchId as string;

  try {
    console.log(`[MatchCompletionHandler] Processing match ${matchId} for division ${divisionId}`);

    const match = await db.robotGameMatches.byId(matchId).get();
    if (!match) {
      console.warn(
        `[MatchCompletionHandler] Match ${matchId} not found in database, marking as completed`
      );
      return; // Job already processed or match was deleted
    }

    // Idempotency check: verify match is still in-progress
    if (match.status !== 'in-progress') {
      console.warn(
        `[MatchCompletionHandler] Match ${matchId} is not in-progress (status: ${match.status}), cannot complete`
      );
      return;
    }

    const newStatus = match.stage === 'TEST' ? 'not-started' : 'completed';
    const result = await db.robotGameMatches.byId(matchId).update({ status: newStatus });

    if (!result) {
      throw new Error(`Failed to update match state for ${matchId}`);
    }

    console.log(`[MatchCompletionHandler] Updated match ${matchId} status to completed`);

    // Update division state: clear active match
    await db.divisions.byId(divisionId).updateState({
      field: { activeMatch: null }
    });

    const pubSub = getRedisPubSub();
    await pubSub.publish(divisionId, RedisEventTypes.MATCH_COMPLETED, {
      matchId
    });

    console.log(
      `[MatchCompletionHandler] Published matchCompleted event for ${matchId} to ${divisionId}`
    );
  } catch (error) {
    console.error(
      `[MatchCompletionHandler] Error processing match completion for ${matchId}:`,
      error
    );
    throw error; // Re-throw to trigger retry with exponential backoff
  }
}
