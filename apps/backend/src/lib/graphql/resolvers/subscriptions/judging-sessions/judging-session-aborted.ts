import { RedisEventTypes } from '@lems/types/api/lems/redis';
import {
  createSubscriptionIterator,
  SubscriptionResult,
  BaseSubscriptionArgs
} from '../base-subscription';

interface JudgingSessionEvent {
  sessionId: string;
}

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

const judgingSessionAbortedSubscribe = (
  _root: unknown,
  args: BaseSubscriptionArgs & Record<string, unknown>
) => {
  const divisionId = args.divisionId as string;

  if (!divisionId) {
    const errorMsg = 'divisionId is required for judgingSessionAborted subscription';
    throw new Error(errorMsg);
  }

  return createSubscriptionIterator(divisionId, RedisEventTypes.JUDGING_SESSION_ABORTED);
};

/**
 * Subscription resolver object for judgingSessionAborted
 * GraphQL subscriptions require a subscribe function
 */
export const judgingSessionAbortedResolver = {
  subscribe: judgingSessionAbortedSubscribe,
  resolve: async (
    event: Record<string, unknown>
  ): Promise<SubscriptionResult<JudgingSessionEvent>> => {
    return processJudgingSessionEvent(event);
  }
};
