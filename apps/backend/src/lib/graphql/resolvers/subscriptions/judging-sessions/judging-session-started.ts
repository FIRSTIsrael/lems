import { RedisEventTypes } from '@lems/types/api/lems/redis';
import {
  createSubscriptionIterator,
  SubscriptionResult,
  BaseSubscriptionArgs,
  isGapMarker
} from '../base-subscription';

interface JudgingStartedEvent {
  sessionId: string;
  version: number;
  startTime: string;
  startDelta: number;
}

const processJudgingSessionStartedEvent = async (
  event: Record<string, unknown>
): Promise<SubscriptionResult<JudgingStartedEvent>> => {
  // Check for gap marker (recovery buffer exceeded)
  if (isGapMarker(event.data)) {
    console.warn('[JudgingSessionStarted] Recovery gap detected - client should refetch');
    return event.data;
  }

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
    startDelta,
    version: (event.version as number) ?? 0
  };

  return result;
};

const judgingSessionStartedSubscribe = (
  _root: unknown,
  args: BaseSubscriptionArgs & Record<string, unknown>
) => {
  const divisionId = args.divisionId as string;

  if (!divisionId) {
    const errorMsg = 'divisionId is required for judgingSessionStarted subscription';
    throw new Error(errorMsg);
  }

  const lastSeenVersion = (args.lastSeenVersion as number) || 0;
  return createSubscriptionIterator(
    divisionId,
    RedisEventTypes.JUDGING_SESSION_STARTED,
    lastSeenVersion
  );
};

/**
 * Subscription resolver object for judgingSessionStarted
 * GraphQL subscriptions require a subscribe function
 */
export const judgingSessionStartedResolver = {
  subscribe: judgingSessionStartedSubscribe,
  resolve: async (
    event: Record<string, unknown>
  ): Promise<SubscriptionResult<JudgingStartedEvent>> => {
    return processJudgingSessionStartedEvent(event);
  }
};
