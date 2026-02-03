import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';

interface JudgingSessionUpdatedSubscribeArgs {
  divisionId: string;
}

interface JudgingSessionUpdatedEvent {
  id: string;
  called: boolean;
  queued: boolean;
}

const processJudgingSessionUpdatedEvent = async (
  event: Record<string, unknown>
): Promise<JudgingSessionUpdatedEvent | null> => {
  const eventData = event.data as Record<string, unknown>;
  const id = (eventData.id as string) || '';
  const called = (eventData.called as boolean) ?? false;
  const queued = (eventData.queued as boolean) ?? false;

  if (!id) {
    return null;
  }

  const result: JudgingSessionUpdatedEvent = {
    id,
    called,
    queued
  };

  return result;
};

const judgingSessionUpdatedSubscribe = (
  _root: unknown,
  { divisionId }: JudgingSessionUpdatedSubscribeArgs
) => {
  if (!divisionId) throw new Error('divisionId is required');
  const pubSub = getRedisPubSub();
  return pubSub.asyncIterator(divisionId, RedisEventTypes.JUDGING_SESSION_UPDATED);
};

/**
 * Subscription resolver object for judgingSessionUpdated
 * GraphQL subscriptions require a subscribe function
 */
export const judgingSessionUpdatedResolver = {
  subscribe: judgingSessionUpdatedSubscribe,
  resolve: processJudgingSessionUpdatedEvent
};
