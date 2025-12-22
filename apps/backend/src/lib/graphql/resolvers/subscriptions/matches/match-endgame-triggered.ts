import { RedisEventTypes } from '@lems/types/api/lems/redis';
import {
  createSubscriptionIterator,
  SubscriptionResult,
  BaseSubscriptionArgs
} from '../base-subscription';

interface MatchEndgameTriggeredEvent {
  matchId: string;
}

const processMatchEndgameTriggeredEvent = async (
  event: Record<string, unknown>
): Promise<SubscriptionResult<MatchEndgameTriggeredEvent>> => {
  const eventData = event.data as Record<string, unknown>;
  const matchId = (eventData.matchId as string) || '';

  if (!matchId) {
    return null;
  }

  const result: MatchEndgameTriggeredEvent = {
    matchId
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

  return createSubscriptionIterator(divisionId, RedisEventTypes.MATCH_ENDGAME_TRIGGERED);
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
