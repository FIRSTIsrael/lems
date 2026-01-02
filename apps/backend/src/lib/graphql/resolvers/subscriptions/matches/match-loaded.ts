import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';

interface MatchLoadedSubscribeArgs {
  divisionId: string;
}

interface MatchLoadedEvent {
  matchId: string;
}

const processMatchLoadedEvent = async (
  event: Record<string, unknown>
): Promise<MatchLoadedEvent | null> => {
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

const matchLoadedSubscribe = (_root: unknown, { divisionId }: MatchLoadedSubscribeArgs) => {
  if (!divisionId) throw new Error('divisionId is required');
  const pubSub = getRedisPubSub();
  return pubSub.asyncIterator(divisionId, RedisEventTypes.MATCH_LOADED);
};

/**
 * Subscription resolver object for matchLoaded
 * GraphQL subscriptions require a subscribe function
 */
export const matchLoadedResolver = {
  subscribe: matchLoadedSubscribe,
  resolve: processMatchLoadedEvent
};
