import { RedisEventTypes } from '@lems/types/api/lems/redis';
import {
  createSubscriptionIterator,
  SubscriptionResult,
  BaseSubscriptionArgs
} from '../base-subscription';

interface MatchLoadedEvent {
  matchId: string;
}

const processMatchLoadedEvent = async (
  event: Record<string, unknown>
): Promise<SubscriptionResult<MatchLoadedEvent>> => {
  const eventData = event.data as Record<string, unknown>;
  const matchId = (eventData.matchId as string) || '';

  if (!matchId) {
    return null;
  }

  const result: MatchLoadedEvent = {
    matchId
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

  return createSubscriptionIterator(divisionId, RedisEventTypes.MATCH_LOADED);
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
