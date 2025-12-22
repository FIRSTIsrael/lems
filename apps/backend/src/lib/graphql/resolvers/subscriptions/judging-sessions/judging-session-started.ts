import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';

interface JudgingSessionStartedSubscribeArgs {
  divisionId: string;
}

interface JudgingStartedEvent {
  sessionId: string;
  startTime: string;
  startDelta: number;
}

const processJudgingSessionStartedEvent = async (
  event: Record<string, unknown>
): Promise<JudgingStartedEvent | null> => {
  const eventData = event.data as Record<string, unknown>;
  const sessionId = (eventData.sessionId as string) || '';
  const startTime = (eventData.startTime as string) || '';
  const startDelta = (eventData.startDelta as number) ?? 0;

  if (!sessionId || !startTime) {
    return null;
  }

  const result: JudgingStartedEvent = {
    sessionId,
    startTime,
    startDelta
  };

  return result;
};

const judgingSessionStartedSubscribe = (
  _root: unknown,
  { divisionId }: JudgingSessionStartedSubscribeArgs
) => {
  if (!divisionId) throw new Error('divisionId is required');
  const pubSub = getRedisPubSub();
  return pubSub.asyncIterator(divisionId, RedisEventTypes.JUDGING_SESSION_STARTED);
};

/**
 * Subscription resolver object for judgingSessionStarted
 * GraphQL subscriptions require a subscribe function
 */
export const judgingSessionStartedResolver = {
  subscribe: judgingSessionStartedSubscribe,
  resolve: processJudgingSessionStartedEvent
};
