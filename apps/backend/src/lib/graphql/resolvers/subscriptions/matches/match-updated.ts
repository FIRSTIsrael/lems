import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';

interface MatchUpdatedSubscribeArgs {
  divisionId: string;
}

interface MatchUpdatedEvent {
  id: string;
  called: boolean;
}

const processMatchUpdatedEvent = async (
  event: Record<string, unknown>
): Promise<MatchUpdatedEvent | null> => {
  const eventData = event.data as Record<string, unknown>;
  const id = (eventData.id as string) || '';
  const called = (eventData.called as boolean) || false;

  if (!id) {
    return null;
  }

  const result: MatchUpdatedEvent = {
    id,
    called
  };

  return result;
};

const matchUpdatedSubscribe = (_root: unknown, { divisionId }: MatchUpdatedSubscribeArgs) => {
  if (!divisionId) throw new Error('divisionId is required');
  const pubSub = getRedisPubSub();
  return pubSub.asyncIterator(divisionId, RedisEventTypes.MATCH_UPDATED);
};

/**
 * Subscription resolver object for matchUpdated
 * GraphQL subscriptions require a subscribe function
 */
export const matchUpdatedResolver = {
  subscribe: matchUpdatedSubscribe,
  resolve: processMatchUpdatedEvent
};
