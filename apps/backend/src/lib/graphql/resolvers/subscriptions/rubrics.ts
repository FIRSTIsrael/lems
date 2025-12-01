import { RedisEventTypes } from '@lems/types/api/lems/redis';
import {
  createSubscriptionIterator,
  SubscriptionResult,
  BaseSubscriptionArgs,
  isGapMarker
} from './base-subscription';

interface RubricValueUpdatedEvent {
  rubricId: string;
  fieldId: string;
  value: {
    value: number;
    notes?: string;
  };
  version: number;
}

interface RubricFeedbackUpdatedEvent {
  rubricId: string;
  feedback: {
    greatJob: string;
    thinkAbout: string;
  };
  version: number;
}

interface RubricStatusUpdatedEvent {
  rubricId: string;
  status: string;
  version: number;
}

type RubricUpdatedEventType =
  | RubricValueUpdatedEvent
  | RubricFeedbackUpdatedEvent
  | RubricStatusUpdatedEvent;

/**
 * Resolver function for the rubricUpdated subscription field
 * Fires whenever any field value, feedback, or status is updated in a rubric within the division
 */
const rubricUpdatedSubscribe = (
  _root: unknown,
  args: BaseSubscriptionArgs & Record<string, unknown>
) => {
  const divisionId = args.divisionId as string;

  if (!divisionId) {
    const errorMsg = 'divisionId is required for rubricUpdated subscription';
    throw new Error(errorMsg);
  }

  const lastSeenVersion = (args.lastSeenVersion as number) || 0;
  return createSubscriptionIterator(divisionId, RedisEventTypes.RUBRIC_UPDATED, lastSeenVersion);
};

/**
 * Transforms raw Redis events into RubricValueUpdatedEvent, RubricFeedbackUpdatedEvent,
 * or RubricStatusUpdatedEvent objects based on event type
 */
const processRubricUpdatedEvent = async (
  event: Record<string, unknown>
): Promise<SubscriptionResult<RubricUpdatedEventType>> => {
  // Check for gap marker (recovery buffer exceeded)
  if (isGapMarker(event.data)) {
    console.warn('[RubricUpdated] Recovery gap detected - client should refetch');
    return event.data;
  }

  const eventData = event.data as Record<string, unknown>;
  const rubricId = (eventData.rubricId as string) || '';
  const version = (event.version as number) ?? 0;

  if (!rubricId) {
    return null;
  }

  // Handle RubricValueUpdated events
  if ('fieldId' in eventData && 'value' in eventData) {
    const fieldId = (eventData.fieldId as string) || '';
    const value = eventData.value as Record<string, unknown>;

    if (!fieldId || !value) {
      return null;
    }

    const result: RubricValueUpdatedEvent = {
      rubricId,
      fieldId,
      value: {
        value: (value.value as number) ?? 0,
        notes: (value.notes as string) || undefined
      },
      version
    };

    return result;
  }

  // Handle RubricFeedbackUpdated events
  if ('feedback' in eventData) {
    const feedback = eventData.feedback as Record<string, unknown>;

    if (!feedback) {
      return null;
    }

    const result: RubricFeedbackUpdatedEvent = {
      rubricId,
      feedback: {
        greatJob: (feedback.greatJob as string) || '',
        thinkAbout: (feedback.thinkAbout as string) || ''
      },
      version
    };

    return result;
  }

  // Handle RubricStatusUpdated events
  if ('status' in eventData) {
    const status = (eventData.status as string) || '';

    if (!status) {
      return null;
    }

    const result: RubricStatusUpdatedEvent = {
      rubricId,
      status,
      version
    };

    return result;
  }

  return null;
};

/**
 * Resolver function for the rubricStatusChanged subscription field
 * Fires only when a rubric's overall status changes (lighter weight than rubricUpdated)
 */
const rubricStatusChangedSubscribe = (
  _root: unknown,
  args: BaseSubscriptionArgs & Record<string, unknown>
) => {
  const divisionId = args.divisionId as string;

  if (!divisionId) {
    const errorMsg = 'divisionId is required for rubricStatusChanged subscription';
    throw new Error(errorMsg);
  }

  const lastSeenVersion = (args.lastSeenVersion as number) || 0;
  return createSubscriptionIterator(
    divisionId,
    RedisEventTypes.RUBRIC_STATUS_CHANGED,
    lastSeenVersion
  );
};

/**
 * Transforms raw Redis events into RubricStatusUpdatedEvent objects
 */
const processRubricStatusChangedEvent = async (
  event: Record<string, unknown>
): Promise<SubscriptionResult<RubricStatusUpdatedEvent>> => {
  // Check for gap marker (recovery buffer exceeded)
  if (isGapMarker(event.data)) {
    console.warn('[RubricStatusChanged] Recovery gap detected - client should refetch');
    return event.data;
  }

  const eventData = event.data as Record<string, unknown>;
  const rubricId = (eventData.rubricId as string) || '';
  const status = (eventData.status as string) || '';

  if (!rubricId || !status) {
    return null;
  }

  const result: RubricStatusUpdatedEvent = {
    rubricId,
    status,
    version: (event.version as number) ?? 0
  };

  return result;
};

/**
 * Subscription resolver object for rubricUpdated
 * Handles all rubric update events: value, feedback, and status updates
 * GraphQL subscriptions require a subscribe function
 */
export const rubricUpdatedResolver = {
  subscribe: rubricUpdatedSubscribe,
  resolve: async (
    event: Record<string, unknown>
  ): Promise<SubscriptionResult<RubricUpdatedEventType>> => {
    return processRubricUpdatedEvent(event);
  }
};

/**
 * Subscription resolver object for rubricStatusChanged
 * Handles only status change events (lightweight alternative to rubricUpdated)
 * GraphQL subscriptions require a subscribe function
 */
export const rubricStatusChangedResolver = {
  subscribe: rubricStatusChangedSubscribe,
  resolve: async (
    event: Record<string, unknown>
  ): Promise<SubscriptionResult<RubricStatusUpdatedEvent>> => {
    return processRubricStatusChangedEvent(event);
  }
};
