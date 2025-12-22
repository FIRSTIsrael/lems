import { RedisEventTypes } from '@lems/types/api/lems/redis';
import {
  createSubscriptionIterator,
  SubscriptionResult,
  BaseSubscriptionArgs
} from '../base-subscription';

interface MatchStartedEvent {
  matchId: string;
  startTime: string;
  startDelta: number;
}

const processMatchStartedEvent = async (
  event: Record<string, unknown>
): Promise<SubscriptionResult<MatchStartedEvent>> => {
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
    startDelta
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

  return createSubscriptionIterator(divisionId, RedisEventTypes.MATCH_STARTED);
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
