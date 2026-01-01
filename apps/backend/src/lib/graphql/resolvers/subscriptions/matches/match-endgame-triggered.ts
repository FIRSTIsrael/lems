import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';

interface MatchEndgameTriggeredSubscribeArgs {
  divisionId: string;
}

interface MatchEndgameTriggeredEvent {
  matchId: string;
}

const processMatchEndgameTriggeredEvent = async (
  event: Record<string, unknown>
): Promise<MatchEndgameTriggeredEvent | null> => {
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
  { divisionId }: MatchEndgameTriggeredSubscribeArgs
) => {
  if (!divisionId) throw new Error('divisionId is required');
  const pubSub = getRedisPubSub();
  return pubSub.asyncIterator(divisionId, RedisEventTypes.MATCH_ENDGAME_TRIGGERED);
};

/**
 * Subscription resolver object for matchEndgameTriggered
 * GraphQL subscriptions require a subscribe function
 * Fires when a match reaches 80% of its duration (endgame starts)
 */
export const matchEndgameTriggeredResolver = {
  subscribe: matchEndgameTriggeredSubscribe,
  resolve: processMatchEndgameTriggeredEvent
};
