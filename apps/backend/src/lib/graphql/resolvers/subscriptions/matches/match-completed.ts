import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';

interface MatchCompletedSubscribeArgs {
  divisionId: string;
}

interface MatchCompletedEvent {
  matchId: string;
}

const processMatchCompletedEvent = async (
  event: Record<string, unknown>
): Promise<MatchCompletedEvent | null> => {
  const eventData = event.data as Record<string, unknown>;
  const matchId = (eventData.matchId as string) || '';

  if (!matchId) {
    return null;
  }

  const result: MatchCompletedEvent = {
    matchId
  };

  return result;
};

const matchCompletedSubscribe = (_root: unknown, { divisionId }: MatchCompletedSubscribeArgs) => {
  if (!divisionId) throw new Error('divisionId is required');
  const pubSub = getRedisPubSub();
  return pubSub.asyncIterator(divisionId, RedisEventTypes.MATCH_COMPLETED);
};

/**
 * Subscription resolver object for matchCompleted
 * GraphQL subscriptions require a subscribe function
 */
export const matchCompletedResolver = {
  subscribe: matchCompletedSubscribe,
  resolve: processMatchCompletedEvent
};
