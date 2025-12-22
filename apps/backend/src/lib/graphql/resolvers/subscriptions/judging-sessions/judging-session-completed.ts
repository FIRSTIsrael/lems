import { RedisEventTypes } from '@lems/types/api/lems/redis';
import {
  createSubscriptionIterator,
  SubscriptionResult,
  BaseSubscriptionArgs
} from '../base-subscription';

interface JudgingSessionEvent {
  sessionId: string;
}

const judgingSessionCompletedSubscribe = (
  _root: unknown,
  args: BaseSubscriptionArgs & Record<string, unknown>
) => {
  const divisionId = args.divisionId as string;

  if (!divisionId) {
    const errorMsg = 'divisionId is required for judgingSessionCompleted subscription';
    throw new Error(errorMsg);
  }

  return createSubscriptionIterator(divisionId, RedisEventTypes.JUDGING_SESSION_COMPLETED);
};

const processJudgingSessionEvent = async (
  event: Record<string, unknown>
): Promise<SubscriptionResult<JudgingSessionEvent>> => {
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

export const judgingSessionCompletedResolver = {
  subscribe: judgingSessionCompletedSubscribe,
  resolve: async (
    event: Record<string, unknown>
  ): Promise<SubscriptionResult<JudgingSessionEvent>> => {
    return processJudgingSessionEvent(event);
  }
};
