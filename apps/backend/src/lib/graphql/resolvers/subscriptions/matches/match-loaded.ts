import { RedisEventTypes } from '@lems/types/api/lems/redis';
import {
  createSubscriptionIterator,
  SubscriptionResult,
  BaseSubscriptionArgs,
  isGapMarker
} from '../base-subscription';

interface MatchLoadedEvent {
  matchId: string;
  version: number;
}

const processMatchLoadedEvent = async (
  event: Record<string, unknown>
): Promise<SubscriptionResult<MatchLoadedEvent>> => {
  // Check for gap marker (recovery buffer exceeded)
  if (isGapMarker(event.data)) {
    console.warn('[MatchLoaded] Recovery gap detected - client should refetch');
    return event.data;
  }

  const eventData = event.data as Record<string, unknown>;
  const matchId = (eventData.matchId as string) || '';

  if (!matchId) {
    return null;
  }

  const result: MatchLoadedEvent = {
    matchId,
    version: (event.version as number) ?? 0
  };

  return result;
};

const matchLoadedSubscribe = (
  _root: unknown,
  args: BaseSubscriptionArgs & Record<string, unknown>
) => {
  const divisionId = args.divisionId as string;

  if (!divisionId) {
    const errorMsg = 'divisionId is required for matchLoaded subscription';
    throw new Error(errorMsg);
  }

  const lastSeenVersion = (args.lastSeenVersion as number) || 0;
  return createSubscriptionIterator(divisionId, RedisEventTypes.MATCH_LOADED, lastSeenVersion);
};

/**
 * Subscription resolver object for matchLoaded
 * GraphQL subscriptions require a subscribe function
 */
export const matchLoadedResolver = {
  subscribe: matchLoadedSubscribe,
  resolve: async (
    event: Record<string, unknown>
  ): Promise<SubscriptionResult<MatchLoadedEvent>> => {
    return processMatchLoadedEvent(event);
  }
};
