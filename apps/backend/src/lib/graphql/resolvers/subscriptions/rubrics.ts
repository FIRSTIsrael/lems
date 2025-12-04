import { RedisEventTypes } from '@lems/types/api/lems/redis';
import {
  createSubscriptionIterator,
  SubscriptionResult,
  BaseSubscriptionArgs,
  isGapMarker
} from './base-subscription';

type RubricValueUpdatedEvent = {
  rubricId: string;
  fieldId: string;
  value: { value: number; notes?: string };
  version: number;
};

type RubricFeedbackUpdatedEvent = {
  rubricId: string;
  feedback: { greatJob: string; thinkAbout: string };
  version: number;
};

type RubricStatusUpdatedEvent = {
  rubricId: string;
  status: string;
  version: number;
};

type RubricAwardsUpdatedEvent = {
  rubricId: string;
  awards: Record<string, boolean>;
  version: number;
};

type RubricUpdatedEventType =
  | RubricValueUpdatedEvent
  | RubricFeedbackUpdatedEvent
  | RubricStatusUpdatedEvent
  | RubricAwardsUpdatedEvent;

function extractEventBase(event: Record<string, unknown>) {
  const eventData = event.data as Record<string, unknown>;
  const rubricId = (eventData.rubricId as string) || '';
  const version = (event.version as number) ?? 0;
  return { eventData, rubricId, version };
}

async function processRubricUpdatedEvent(
  event: Record<string, unknown>
): Promise<SubscriptionResult<RubricUpdatedEventType>> {
  if (isGapMarker(event.data)) {
    return event.data;
  }

  const { eventData, rubricId, version } = extractEventBase(event);

  if (!rubricId) {
    return null;
  }

  // Handle RubricValueUpdated events
  if ('fieldId' in eventData && 'value' in eventData) {
    const fieldId = (eventData.fieldId as string) || '';
    const value = eventData.value as Record<string, unknown>;

    return fieldId && value
      ? ({
          rubricId,
          fieldId,
          value: { value: (value.value as number) ?? 0, notes: value.notes as string },
          version
        } as RubricValueUpdatedEvent)
      : null;
  }

  // Handle RubricFeedbackUpdated events
  if ('feedback' in eventData) {
    const feedback = eventData.feedback as Record<string, unknown>;

    return feedback
      ? ({
          rubricId,
          feedback: {
            greatJob: (feedback.greatJob as string) || '',
            thinkAbout: (feedback.thinkAbout as string) || ''
          },
          version
        } as RubricFeedbackUpdatedEvent)
      : null;
  }

  // Handle RubricStatusUpdated events
  if ('status' in eventData) {
    const status = (eventData.status as string) || '';
    return status ? ({ rubricId, status, version } as RubricStatusUpdatedEvent) : null;
  }

  // Handle RubricAwardsUpdated events
  if ('awards' in eventData) {
    const awards = eventData.awards as Record<string, boolean>;

    return awards
      ? ({
          rubricId,
          awards,
          version
        } as RubricAwardsUpdatedEvent)
      : null;
  }

  return null;
}

/**
 * Processes rubric status change events (status updates only)
 */
async function processRubricStatusChangedEvent(
  event: Record<string, unknown>
): Promise<SubscriptionResult<RubricStatusUpdatedEvent>> {
  if (isGapMarker(event.data)) {
    return event.data;
  }

  const { eventData, rubricId, version } = extractEventBase(event);
  const status = (eventData.status as string) || '';

  return rubricId && status ? { rubricId, status, version } : null;
}

/**
 * Subscription resolver for rubricUpdated
 * Fires on all rubric changes: field values, feedback, and status
 */
export const rubricUpdatedResolver = {
  subscribe: (_root: unknown, args: BaseSubscriptionArgs & Record<string, unknown>) => {
    const divisionId = args.divisionId as string;
    if (!divisionId) throw new Error('divisionId is required');
    return createSubscriptionIterator(
      divisionId,
      RedisEventTypes.RUBRIC_UPDATED,
      (args.lastSeenVersion as number) || 0
    );
  },
  resolve: processRubricUpdatedEvent
};

/**
 * Subscription resolver for rubricStatusChanged
 * Fires only on status changes (lightweight alternative)
 */
export const rubricStatusChangedResolver = {
  subscribe: (_root: unknown, args: BaseSubscriptionArgs & Record<string, unknown>) => {
    const divisionId = args.divisionId as string;
    if (!divisionId) throw new Error('divisionId is required');
    return createSubscriptionIterator(
      divisionId,
      RedisEventTypes.RUBRIC_STATUS_CHANGED,
      (args.lastSeenVersion as number) || 0
    );
  },
  resolve: processRubricStatusChangedEvent
};
