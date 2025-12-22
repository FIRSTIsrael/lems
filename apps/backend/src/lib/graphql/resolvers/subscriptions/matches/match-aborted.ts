import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';

interface MatchAbortedSubscribeArgs {
  divisionId: string;
}

interface MatchAbortedEvent {
  matchId: string;
}

const processMatchAbortedEvent = async (
  event: Record<string, unknown>
): Promise<MatchAbortedEvent | null> => {
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

const matchAbortedSubscribe = (_root: unknown, { divisionId }: MatchAbortedSubscribeArgs) => {
  if (!divisionId) throw new Error('divisionId is required');
  const pubSub = getRedisPubSub();
  return pubSub.asyncIterator(divisionId, RedisEventTypes.MATCH_ABORTED);
};

/**
 * Subscription resolver object for matchAborted
 * GraphQL subscriptions require a subscribe function
 */
export const matchAbortedResolver = {
  subscribe: matchAbortedSubscribe,
  resolve: processMatchAbortedEvent
};
