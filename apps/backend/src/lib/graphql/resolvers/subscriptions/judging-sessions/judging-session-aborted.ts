import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';

interface JudgingSessionAbortedSubscribeArgs {
  divisionId: string;
}

interface JudgingSessionEvent {
  sessionId: string;
}

const processJudgingSessionEvent = async (
  event: Record<string, unknown>
): Promise<JudgingSessionEvent | null> => {
  const eventData = event.data as Record<string, unknown>;
  const sessionId = (eventData.sessionId as string) || '';

  if (!sessionId) {
    return null;
  }

  const result: JudgingSessionEvent = {
    sessionId
  };

  return result;
};

const judgingSessionAbortedSubscribe = (
  _root: unknown,
  { divisionId }: JudgingSessionAbortedSubscribeArgs
) => {
  if (!divisionId) throw new Error('divisionId is required');
  const pubSub = getRedisPubSub();
  return pubSub.asyncIterator(divisionId, RedisEventTypes.JUDGING_SESSION_ABORTED);
};

/**
 * Subscription resolver object for judgingSessionAborted
 * GraphQL subscriptions require a subscribe function
 */
export const judgingSessionAbortedResolver = {
  subscribe: judgingSessionAbortedSubscribe,
  resolve: processJudgingSessionEvent
};
