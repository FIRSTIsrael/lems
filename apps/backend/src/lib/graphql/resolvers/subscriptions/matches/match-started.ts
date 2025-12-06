import { RedisEventTypes } from '@lems/types/api/lems/redis';
import {
  createSubscriptionIterator,
  SubscriptionResult,
  BaseSubscriptionArgs,
  isGapMarker
} from '../base-subscription';

interface MatchStartedEvent {
  matchId: string;
  version: number;
  startTime: string;
  startDelta: number;
}

const processMatchStartedEvent = async (
  event: Record<string, unknown>
): Promise<SubscriptionResult<MatchStartedEvent>> => {
  // Check for gap marker (recovery buffer exceeded)
  if (isGapMarker(event.data)) {
    console.warn('[MatchStarted] Recovery gap detected - client should refetch');
    return event.data;
  }

  const eventData = event.data as Record<string, unknown>;
  const matchId = (eventData.matchId as string) || '';
  const startTime = (eventData.startTime as string) || '';
  const startDelta = (eventData.startDelta as number) ?? 0;

  if (!matchId || !startTime) {
    return null;
  }

  const result: MatchStartedEvent = {
    matchId,
    startTime,
    startDelta,
    version: (event.version as number) ?? 0
  };

  return result;
};

const matchStartedSubscribe = (
  _root: unknown,
  args: BaseSubscriptionArgs & Record<string, unknown>
) => {
  const divisionId = args.divisionId as string;

  if (!divisionId) {
    const errorMsg = 'divisionId is required for matchStarted subscription';
    throw new Error(errorMsg);
  }

  const lastSeenVersion = (args.lastSeenVersion as number) || 0;
  return createSubscriptionIterator(divisionId, RedisEventTypes.MATCH_STARTED, lastSeenVersion);
};

/**
 * Subscription resolver object for matchStarted
 * GraphQL subscriptions require a subscribe function
 */
export const matchStartedResolver = {
  subscribe: matchStartedSubscribe,
  resolve: async (
    event: Record<string, unknown>
  ): Promise<SubscriptionResult<MatchStartedEvent>> => {
    return processMatchStartedEvent(event);
  }
};
