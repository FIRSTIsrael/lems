import { RedisEventTypes } from '@lems/types/api/lems/redis';
import {
  createSubscriptionIterator,
  SubscriptionResult,
  BaseSubscriptionArgs,
  isGapMarker
} from '../base-subscription';

interface MatchCompletedEvent {
  matchId: string;
  autoLoadedMatchId: string | null;
  version: number;
}

const processMatchCompletedEvent = async (
  event: Record<string, unknown>
): Promise<SubscriptionResult<MatchCompletedEvent>> => {
  // Check for gap marker (recovery buffer exceeded)
  if (isGapMarker(event.data)) {
    console.warn('[MatchCompleted] Recovery gap detected - client should refetch');
    return event.data;
  }

  const eventData = event.data as Record<string, unknown>;
  const matchId = (eventData.matchId as string) || '';

  if (!matchId) {
    return null;
  }

  const result: MatchCompletedEvent = {
    matchId,
    autoLoadedMatchId: (eventData.autoLoadedMatchId as string | null) || null,
    version: (event.version as number) ?? 0
  };

  return result;
};

const matchCompletedSubscribe = (
  _root: unknown,
  args: BaseSubscriptionArgs & Record<string, unknown>
) => {
  const divisionId = args.divisionId as string;

  if (!divisionId) {
    const errorMsg = 'divisionId is required for matchCompleted subscription';
    throw new Error(errorMsg);
  }

  const lastSeenVersion = (args.lastSeenVersion as number) || 0;
  return createSubscriptionIterator(divisionId, RedisEventTypes.MATCH_COMPLETED, lastSeenVersion);
};

/**
 * Subscription resolver object for matchCompleted
 * GraphQL subscriptions require a subscribe function
 */
export const matchCompletedResolver = {
  subscribe: matchCompletedSubscribe,
  resolve: async (
    event: Record<string, unknown>
  ): Promise<SubscriptionResult<MatchCompletedEvent>> => {
    return processMatchCompletedEvent(event);
  }
};
