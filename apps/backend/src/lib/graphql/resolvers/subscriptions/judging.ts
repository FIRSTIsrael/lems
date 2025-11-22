import { RedisEventTypes } from '@lems/types/api/lems/redis';
import {
  createSubscriptionIterator,
  SubscriptionResult,
  BaseSubscriptionArgs,
  isGapMarker
} from './base-subscription';

interface JudgingStartedEvent {
  sessionId: string;
  version: number;
  startTime: string;
  startDelta: number;
}

interface JudgingAbortedEvent {
  sessionId: string;
  version: number;
}

/**
 * Resolver function for the judgingSessionStarted subscription field
 */
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
 * Resolver function for the judgingSessionAborted subscription field
 */
const judgingSessionAbortedSubscribe = (
  _root: unknown,
  args: BaseSubscriptionArgs & Record<string, unknown>
) => {
  const divisionId = args.divisionId as string;

  if (!divisionId) {
    const errorMsg = 'divisionId is required for judgingSessionAborted subscription';
    throw new Error(errorMsg);
  }

  const lastSeenVersion = (args.lastSeenVersion as number) || 0;
  return createSubscriptionIterator(
    divisionId,
    RedisEventTypes.JUDGING_SESSION_ABORTED,
    lastSeenVersion
  );
};

/**
 * Transforms raw Redis events into JudgingStartedEvent objects
 */
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

/**
 * Transforms raw Redis events into JudgingAbortedEvent objects
 */
const processJudgingSessionAbortedEvent = async (
  event: Record<string, unknown>
): Promise<SubscriptionResult<JudgingAbortedEvent>> => {
  // Check for gap marker (recovery buffer exceeded)
  if (isGapMarker(event.data)) {
    console.warn('[JudgingSessionAborted] Recovery gap detected - client should refetch');
    return event.data;
  }

  const eventData = event.data as Record<string, unknown>;
  const sessionId = (eventData.sessionId as string) || '';

  if (!sessionId) {
    return null;
  }

  const result: JudgingAbortedEvent = {
    sessionId,
    version: (event.version as number) ?? 0
  };

  return result;
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

/**
 * Subscription resolver object for judgingSessionAborted
 * GraphQL subscriptions require a subscribe function
 */
export const judgingSessionAbortedResolver = {
  subscribe: judgingSessionAbortedSubscribe,
  resolve: async (
    event: Record<string, unknown>
  ): Promise<SubscriptionResult<JudgingAbortedEvent>> => {
    return processJudgingSessionAbortedEvent(event);
  }
};
