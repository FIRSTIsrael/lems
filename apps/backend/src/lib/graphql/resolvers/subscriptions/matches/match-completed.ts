import { RedisEventTypes } from '@lems/types/api/lems/redis';
import {
  createSubscriptionIterator,
  SubscriptionResult,
  BaseSubscriptionArgs
} from '../base-subscription';

interface MatchCompletedEvent {
  matchId: string;
  autoLoadedMatchId: string | null;
}

const processMatchCompletedEvent = async (
  event: Record<string, unknown>
): Promise<SubscriptionResult<MatchCompletedEvent>> => {
  const eventData = event.data as Record<string, unknown>;
  const matchId = (eventData.matchId as string) || '';

  if (!matchId) {
    return null;
  }

  const result: MatchCompletedEvent = {
    matchId,
    autoLoadedMatchId: (eventData.autoLoadedMatchId as string | null) || null
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

  return createSubscriptionIterator(divisionId, RedisEventTypes.MATCH_COMPLETED);
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
