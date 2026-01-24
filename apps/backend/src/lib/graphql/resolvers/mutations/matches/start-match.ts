import dayjs from 'dayjs';
import { GraphQLFieldResolver } from 'graphql';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { DivisionState, RobotGameMatchState } from '@lems/database';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';
import { enqueueScheduledEvent } from '../../../../queues/scheduled-events-queue';
import { authorizeMatchAccess } from './utils';
import { getAutoLoadMatch } from './match-utils';

interface StartMatchArgs {
  divisionId: string;
  matchId: string;
}

interface MatchEvent {
  matchId: string;
}

/**
 * Resolver for Mutation.startMatch
 * Starts a robot game match for a division.
 *
 * If the match is RANKING stage and division is in PRACTICE stage, advances to RANKING.
 * Enqueues a match-completed event after the match duration expires.
 */
export const startMatchResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  StartMatchArgs,
  Promise<MatchEvent>
> = async (_root, { divisionId, matchId }, context) => {
  try {
    const match = await authorizeMatchAccess(context, divisionId, matchId);
    await checkMatchCanBeStarted(matchId);

    const division = await db.divisions.byId(divisionId).get();

    if (!division?.schedule_settings) {
      throw new MutationError(
        MutationErrorCode.INTERNAL_ERROR,
        `Schedule settings not found for division ${divisionId}`
      );
    }

    const divisionState = await db.raw.mongo
      .collection<DivisionState>('division_states')
      .findOne({ divisionId });

    // Advance stage if this is the first ranking match being started
    const shouldAdvanceStage =
      match.stage === 'RANKING' && divisionState?.field?.currentStage === 'PRACTICE';

    const startTime = dayjs();
    const scheduledTime = dayjs(match.scheduled_time);
    const startDelta = startTime.diff(scheduledTime, 'seconds');

    // Update match state
    const result = await db.raw.mongo
      .collection<RobotGameMatchState>('robot_game_match_states')
      .findOneAndUpdate(
        { matchId },
        {
          $set: {
            status: 'in-progress',
            startTime: startTime.toDate(),
            startDelta
          }
        },
        { returnDocument: 'after' }
      );

    if (!result) {
      throw new MutationError(
        MutationErrorCode.INTERNAL_ERROR,
        `Failed to update match state for ${matchId}`
      );
    }

    // Update division state with active match
    const divisionUpdateResult = await db.raw.mongo
      .collection<DivisionState>('division_states')
      .findOneAndUpdate(
        { divisionId },
        {
          $set: {
            'field.activeMatch': matchId,
            ...(shouldAdvanceStage && { 'field.currentStage': 'RANKING' })
          }
        },
        { returnDocument: 'after' }
      );

    if (!divisionUpdateResult) {
      throw new MutationError(
        MutationErrorCode.INTERNAL_ERROR,
        `Failed to update division state for ${divisionId}`
      );
    }

    const pubSub = getRedisPubSub();

    // Publish match started event
    await pubSub.publish(divisionId, RedisEventTypes.MATCH_STARTED, {
      matchId,
      startTime,
      startDelta
    });

    // Auto-load the next match if this is not a TEST match
    if (match.stage !== 'TEST') {
      const currentStage = divisionUpdateResult.field?.currentStage || 'PRACTICE';
      try {
        const autoLoadedMatchId = await getAutoLoadMatch(divisionId, currentStage, matchId);
        if (autoLoadedMatchId) {
          await db.raw.mongo
            .collection<DivisionState>('division_states')
            .findOneAndUpdate(
              { divisionId },
              { $set: { 'field.loadedMatch': autoLoadedMatchId } },
              { returnDocument: 'after' }
            );
          console.log(
            `[StartMatch] Auto-loaded match ${autoLoadedMatchId} for division ${divisionId}`
          );

          // Publish match loaded event for the auto-loaded match
          await pubSub.publish(divisionId, RedisEventTypes.MATCH_LOADED, {
            matchId: autoLoadedMatchId
          });
        }
      } catch (error) {
        console.error(`[StartMatch] Failed to auto-load next match for ${matchId}:`, error);
        // Don't fail the mutation - the match is already started
      }
    }

    // Publish stage advanced event if applicable
    if (shouldAdvanceStage) {
      await pubSub.publish(divisionId, RedisEventTypes.MATCH_STAGE_ADVANCED, {});
    }

    // Enqueue match completion event
    try {
      await enqueueScheduledEvent(
        {
          eventType: 'match-completed',
          divisionId,
          metadata: {
            matchId
          }
        },
        division.schedule_settings.match_length * 1000
      );
    } catch (error) {
      console.error(
        `Failed to enqueue match completion for ${matchId}, but match was started:`,
        error
      );
      // Don't fail the mutation - the match is already started
      // The queue failure should be monitored separately
    }

    // Enqueue match endgame triggered event (at 80% of match duration)
    try {
      await enqueueScheduledEvent(
        {
          eventType: 'match-endgame-triggered',
          divisionId,
          metadata: {
            matchId
          }
        },
        division.schedule_settings.match_length * 0.8 * 1000
      );
    } catch (error) {
      console.error(
        `Failed to enqueue match endgame trigger for ${matchId}, but match was started:`,
        error
      );
      // Don't fail the mutation - the match is already started
      // The queue failure should be monitored separately
    }

    return { matchId, startTime, startDelta };
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
};

/**
 * Checks whether a robot game match can be started.
 * Performs the following checks:
 *
 * 1. Match must be in not-started status
 * 2. Match must start 5 minutes or less from now
 *
 * @throws {MutationError} If any check fails
 */
const checkMatchCanBeStarted = async (matchId: string): Promise<void> => {
  // Check 1: Match must be in not-started status
  const matchState = await db.raw.mongo
    .collection<RobotGameMatchState>('robot_game_match_states')
    .findOne({ matchId });

  if (!matchState || matchState.status !== 'not-started') {
    throw new MutationError(MutationErrorCode.CONFLICT, 'Match is not in not-started status');
  }

  // Check 2: Match must start 5 minutes or less from now
  const match = await db.robotGameMatches.byId(matchId).get();
  if (!match) {
    throw new MutationError(MutationErrorCode.NOT_FOUND, 'Match not found');
  }

  const scheduledTime = dayjs(match.scheduled_time);
  const now = dayjs();
  const minutesUntilStart = scheduledTime.diff(now, 'minutes', true);

  if (minutesUntilStart > 5) {
    throw new MutationError(
      MutationErrorCode.CONFLICT,
      `Match is scheduled to start in ${Math.ceil(minutesUntilStart)} minutes. Matches can only be started 5 minutes or less before their scheduled time.`
    );
  }
};
