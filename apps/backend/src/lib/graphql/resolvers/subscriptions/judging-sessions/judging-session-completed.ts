import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';

interface JudgingSessionCompletedSubscribeArgs {
  divisionId: string;
}

interface JudgingSessionEvent {
  sessionId: string;
}

const judgingSessionCompletedSubscribe = (
  _root: unknown,
  { divisionId }: JudgingSessionCompletedSubscribeArgs
) => {
  if (!divisionId) throw new Error('divisionId is required');
  const pubSub = getRedisPubSub();
  return pubSub.asyncIterator(divisionId, RedisEventTypes.JUDGING_SESSION_COMPLETED);
};

const processJudgingSessionEvent = async (
  event: Record<string, unknown>
): Promise<JudgingSessionEvent | null> => {
  const sessionId = ((event.data as Record<string, unknown>).sessionId as string) || '';

  if (!sessionId) {
    return null;
  }

  const result: JudgingSessionEvent = {
    sessionId
  };

  return result;
};

export const judgingSessionCompletedResolver = {
  subscribe: judgingSessionCompletedSubscribe,
  resolve: processJudgingSessionEvent
};
