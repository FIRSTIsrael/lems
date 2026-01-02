import { Job } from 'bullmq';
import { RobotGameMatchState } from '@lems/database';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisPubSub } from '../../redis/redis-pubsub';
import db from '../../database';
import { ScheduledEvent } from '../types';

/**
 * Handler for match endgame triggered events
 * Fires when a match reaches 80% of its duration (endgame starts)
 * Only publishes the event if the match is still in-progress
 */
export async function handleMatchEndgameTriggered(job: Job<ScheduledEvent>): Promise<void> {
  const { divisionId, metadata } = job.data;
  const matchId = metadata.matchId as string;

  try {
    console.log(
      `[MatchEndgameTriggeredHandler] Processing endgame trigger for match ${matchId} in division ${divisionId}`
    );

    const match = await db.robotGameMatches.byId(matchId).get();
    if (!match) {
      console.warn(
        `[MatchEndgameTriggeredHandler] Match ${matchId} not found in database, skipping event`
      );
      return;
    }

    // Check if match is still in-progress
    const matchState = await db.raw.mongo
      .collection<RobotGameMatchState>('robot_game_match_states')
      .findOne({ matchId });

    if (!matchState) {
      console.warn(
        `[MatchEndgameTriggeredHandler] Match state not found for ${matchId}, skipping event`
      );
      return;
    }

    if (matchState.status !== 'in-progress') {
      console.warn(
        `[MatchEndgameTriggeredHandler] Match ${matchId} is not in-progress (status: ${matchState.status}), skipping event`
      );
      return;
    }

    const pubSub = getRedisPubSub();
    await pubSub.publish(divisionId, RedisEventTypes.MATCH_ENDGAME_TRIGGERED, {
      matchId
    });

    console.log(
      `[MatchEndgameTriggeredHandler] Published matchEndgameTriggered event for ${matchId} to ${divisionId}`
    );
  } catch (error) {
    console.error(
      `[MatchEndgameTriggeredHandler] Error processing endgame trigger for ${matchId}:`,
      error
    );
    throw error;
  }
}
