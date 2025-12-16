import { RedisEventTypes } from '@lems/types/api/lems/redis';
import {
  createSubscriptionIterator,
  SubscriptionResult,
  BaseSubscriptionArgs,
  isGapMarker
} from '../base-subscription';

interface MatchEndgameTriggeredEvent {
  matchId: string;
  version: number;
}

const processMatchEndgameTriggeredEvent = async (
  event: Record<string, unknown>
): Promise<SubscriptionResult<MatchEndgameTriggeredEvent>> => {
  // Check for gap marker (recovery buffer exceeded)
  if (isGapMarker(event.data)) {
    console.warn('[MatchEndgameTriggered] Recovery gap detected - client should refetch');
    return event.data;
  }

  const eventData = event.data as Record<string, unknown>;
  const matchId = (eventData.matchId as string) || '';

  if (!matchId) {
    return null;
  }

  const result: MatchEndgameTriggeredEvent = {
    matchId,
    version: (event.version as number) ?? 0
  };

  return result;
};

const matchEndgameTriggeredSubscribe = (
  _root: unknown,
  args: BaseSubscriptionArgs & Record<string, unknown>
) => {
  const divisionId = args.divisionId as string;

  if (!divisionId) {
    const errorMsg = 'divisionId is required for matchEndgameTriggered subscription';
    throw new Error(errorMsg);
  }

  const lastSeenVersion = (args.lastSeenVersion as number) || 0;
  return createSubscriptionIterator(
    divisionId,
    RedisEventTypes.MATCH_ENDGAME_TRIGGERED,
    lastSeenVersion
  );
};

/**
 * Subscription resolver object for matchEndgameTriggered
 * GraphQL subscriptions require a subscribe function
 * Fires when a match reaches 80% of its duration (endgame starts)
 */
export const matchEndgameTriggeredResolver = {
  subscribe: matchEndgameTriggeredSubscribe,
  resolve: async (
    event: Record<string, unknown>
  ): Promise<SubscriptionResult<MatchEndgameTriggeredEvent>> => {
    return processMatchEndgameTriggeredEvent(event);
  }
};
