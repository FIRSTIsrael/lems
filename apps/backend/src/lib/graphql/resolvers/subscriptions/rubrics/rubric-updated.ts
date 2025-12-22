import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';

interface RubricUpdatedSubscribeArgs {
  divisionId: string;
}

type RubricValueUpdatedEvent = {
  rubricId: string;
  fieldId: string;
  value: { value: number; notes?: string };
};

type RubricFeedbackUpdatedEvent = {
  rubricId: string;
  feedback: { greatJob: string; thinkAbout: string };
};

type RubricStatusUpdatedEvent = {
  rubricId: string;
  status: string;
};

type RubricAwardsUpdatedEvent = {
  rubricId: string;
  awards: Record<string, boolean>;
};

type RubricResetEvent = {
  rubricId: string;
  reset: boolean;
};

type RubricUpdatedEventType =
  | RubricValueUpdatedEvent
  | RubricFeedbackUpdatedEvent
  | RubricStatusUpdatedEvent
  | RubricAwardsUpdatedEvent
  | RubricResetEvent;

async function processRubricUpdatedEvent(
  event: Record<string, unknown>
): Promise<RubricUpdatedEventType | null> {
  const eventData = event.data as Record<string, unknown>;
  const rubricId = (eventData.rubricId as string) || '';

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
          value: { value: (value.value as number) ?? 0, notes: value.notes as string }
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
          }
        } as RubricFeedbackUpdatedEvent)
      : null;
  }

  // Handle RubricStatusUpdated events
  if ('status' in eventData) {
    const status = (eventData.status as string) || '';
    return status ? ({ rubricId, status } as RubricStatusUpdatedEvent) : null;
  }

  // Handle RubricAwardsUpdated events
  if ('awards' in eventData) {
    const awards = eventData.awards as Record<string, boolean>;

    return awards
      ? ({
          rubricId,
          awards
        } as RubricAwardsUpdatedEvent)
      : null;
  }

  // Handle RubricReset events
  if ('reset' in eventData) {
    const reset = eventData.reset as boolean;
    return reset
      ? ({
          rubricId,
          reset
        } as RubricResetEvent)
      : null;
  }

  return null;
}

export const rubricUpdatedResolver = {
  subscribe: (_root: unknown, { divisionId }: RubricUpdatedSubscribeArgs) => {
    if (!divisionId) throw new Error('divisionId is required');
    const pubSub = getRedisPubSub();
    return pubSub.asyncIterator(divisionId, RedisEventTypes.RUBRIC_UPDATED);
  },
  resolve: processRubricUpdatedEvent
};

/**
 * Type resolver for RubricUpdatedEvent union type
 */
export const RubricUpdatedEventResolver = {
  __resolveType(obj: Record<string, unknown>) {
    if ('fieldId' in obj) return 'RubricValueUpdated';
    if ('feedback' in obj) return 'RubricFeedbackUpdated';
    if ('status' in obj) return 'RubricStatusUpdated';
    if ('awards' in obj) return 'RubricAwardsUpdated';
    if ('reset' in obj) return 'RubricReset';
    return null;
  }
};
