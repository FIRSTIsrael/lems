import { Job } from 'bullmq';
import dayjs from 'dayjs';
import { RobotGameMatchState } from '@lems/database';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisPubSub } from '../../redis/redis-pubsub';
import db from '../../database';
import { ScheduledEvent } from '../types';

const AUTO_LOAD_THRESHOLD_MINUTES = 15;

/**
 * Handler for match completed events
 * Processes robot game match completions, updates state, and auto-loads the next match if eligible
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
    const matchState = await db.raw.mongo
      .collection<RobotGameMatchState>('robot_game_match_states')
      .findOne({ matchId });

    if (!matchState) {
      console.warn(
        `[MatchCompletionHandler] Match state not found for ${matchId}, marking as completed`
      );
      return; // Job already processed or match was deleted
    }

    if (matchState.status !== 'in-progress') {
      console.warn(
        `[MatchCompletionHandler] Match ${matchId} is not in-progress (status: ${matchState.status}), cannot complete`
      );
      return;
    }

    const newStatus = match.stage === 'TEST' ? 'not-started' : 'completed';
    const result = await db.raw.mongo
      .collection<RobotGameMatchState>('robot_game_match_states')
      .findOneAndUpdate(
        { matchId },
        {
          $set: { status: newStatus }
        },
        { returnDocument: 'after' }
      );

    if (!result) {
      throw new Error(`Failed to update match state for ${matchId}`);
    }

    console.log(`[MatchCompletionHandler] Updated match ${matchId} status to completed`);

    // Get division state to determine current stage
    const divisionState = await db.raw.mongo.collection('division_states').findOne({ divisionId });

    if (!divisionState) {
      throw new Error(`Division state not found for ${divisionId}`);
    }

    const currentStage = divisionState.field.currentStage || 'PRACTICE';
    let autoLoadedMatchId: string | null = null;

    // Find and auto-load the next unstarted match in the current stage
    if (match.stage !== 'TEST') {
      autoLoadedMatchId = await getAutoLoadMatch(divisionId, currentStage);
      if (autoLoadedMatchId) {
        console.log(
          `[MatchCompletionHandler] Auto-loaded match ${autoLoadedMatchId} for division ${divisionId}`
        );
      }
    }

    // Update division state: clear active match and set loaded match if auto-loaded
    await db.raw.mongo.collection('division_states').findOneAndUpdate(
      { divisionId },
      {
        $set: {
          'field.activeMatch': null,
          ...(autoLoadedMatchId && { 'field.loadedMatch': autoLoadedMatchId })
        }
      },
      { returnDocument: 'after' }
    );

    const pubSub = getRedisPubSub();
    await pubSub.publish(divisionId, RedisEventTypes.MATCH_COMPLETED, {
      matchId,
      autoLoadedMatchId
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

/**
 * Finds the next unstarted match in the current stage that should be auto-loaded
 * A match is eligible if it starts within AUTO_LOAD_THRESHOLD_MINUTES
 *
 * @param divisionId - The division ID
 * @param currentStage - The current match stage
 * @returns The ID of the match to auto-load, or null if none is eligible
 */
async function getAutoLoadMatch(divisionId: string, currentStage: string): Promise<string | null> {
  const allMatches = await db.robotGameMatches.byDivision(divisionId).getAll();
  const divisionMatches = allMatches
    .filter(match => match.stage === currentStage)
    .sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime());

  for (const candidateMatch of divisionMatches) {
    const candidateState = await db.raw.mongo
      .collection<RobotGameMatchState>('robot_game_match_states')
      .findOne({ matchId: candidateMatch.id });

    if (candidateState?.status === 'not-started') {
      const scheduledTime = dayjs(candidateMatch.scheduled_time);
      const minutesUntilStart = scheduledTime.diff(dayjs(), 'minute', true);

      if (minutesUntilStart <= AUTO_LOAD_THRESHOLD_MINUTES) {
        return candidateMatch.id;
      }
    }
  }

  return null;
}
