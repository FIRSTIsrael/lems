import { RedisEventTypes } from '@lems/types/api/lems/redis';
import {
  createSubscriptionIterator,
  SubscriptionResult,
  BaseSubscriptionArgs
} from '../base-subscription';

interface MatchAbortedEvent {
  matchId: string;
}

const processMatchAbortedEvent = async (
  event: Record<string, unknown>
): Promise<SubscriptionResult<MatchAbortedEvent>> => {
  const eventData = event.data as Record<string, unknown>;
  const matchId = (eventData.matchId as string) || '';

  if (!matchId) {
    return null;
  }

  const result: MatchAbortedEvent = {
    matchId
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

  return createSubscriptionIterator(divisionId, RedisEventTypes.MATCH_ABORTED);
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
