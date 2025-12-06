import { RedisEventTypes } from '@lems/types/api/lems/redis';
import {
  createSubscriptionIterator,
  SubscriptionResult,
  BaseSubscriptionArgs,
  isGapMarker
} from '../base-subscription';

interface MatchAbortedEvent {
  matchId: string;
  version: number;
}

const processMatchAbortedEvent = async (
  event: Record<string, unknown>
): Promise<SubscriptionResult<MatchAbortedEvent>> => {
  // Check for gap marker (recovery buffer exceeded)
  if (isGapMarker(event.data)) {
    console.warn('[MatchAborted] Recovery gap detected - client should refetch');
    return event.data;
  }

  const eventData = event.data as Record<string, unknown>;
  const matchId = (eventData.matchId as string) || '';

  if (!matchId) {
    return null;
  }

  const result: MatchAbortedEvent = {
    matchId,
    version: (event.version as number) ?? 0
  };

  return result;
};

const matchAbortedSubscribe = (
  _root: unknown,
  args: BaseSubscriptionArgs & Record<string, unknown>
) => {
  const divisionId = args.divisionId as string;

  if (!divisionId) {
    const errorMsg = 'divisionId is required for matchAborted subscription';
    throw new Error(errorMsg);
  }

  const lastSeenVersion = (args.lastSeenVersion as number) || 0;
  return createSubscriptionIterator(divisionId, RedisEventTypes.MATCH_ABORTED, lastSeenVersion);
};

/**
 * Subscription resolver object for matchAborted
 * GraphQL subscriptions require a subscribe function
 */
export const matchAbortedResolver = {
  subscribe: matchAbortedSubscribe,
  resolve: async (
    event: Record<string, unknown>
  ): Promise<SubscriptionResult<MatchAbortedEvent>> => {
    return processMatchAbortedEvent(event);
  }
};
