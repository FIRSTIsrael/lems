import { RedisEventTypes } from '@lems/types/api/lems/redis';
import {
  createSubscriptionIterator,
  SubscriptionResult,
  BaseSubscriptionArgs,
  isGapMarker
} from '../base-subscription';
import { extractEventBase } from './utils';

type DeliberationPicklistUpdatedEvent = {
  deliberationId: string;
  picklist: string[];
  version: number;
};

type DeliberationStartedEvent = {
  deliberationId: string;
  startTime: string;
  version: number;
};

type DeliberationUpdatedEventType = DeliberationPicklistUpdatedEvent | DeliberationStartedEvent;

async function processDeliberationUpdatedEvent(
  event: Record<string, unknown>
): Promise<SubscriptionResult<DeliberationUpdatedEventType>> {
  if (isGapMarker(event.data)) {
    return event.data;
  }

  const { eventData, deliberationId, version } = extractEventBase(event);

  if (!deliberationId) {
    return null;
  }

  // Handle DeliberationPicklistUpdated events
  if ('picklist' in eventData) {
    const picklist = (eventData.picklist as string[]) || [];
    return picklist.length > 0
      ? ({
          deliberationId,
          picklist,
          version
        } as DeliberationPicklistUpdatedEvent)
      : null;
  }

  // Handle DeliberationStarted events
  if ('startTime' in eventData) {
    const startTime = (eventData.startTime as string) || '';
    return startTime
      ? ({
          deliberationId,
          startTime,
          version
        } as DeliberationStartedEvent)
      : null;
  }

  return null;
}

export const deliberationUpdatedResolver = {
  subscribe: (_root: unknown, args: BaseSubscriptionArgs & Record<string, unknown>) => {
    const divisionId = args.divisionId as string;
    if (!divisionId) throw new Error('divisionId is required');
    return createSubscriptionIterator(
      divisionId,
      RedisEventTypes.DELIBERATION_UPDATED,
      (args.lastSeenVersion as number) || 0
    );
  },
  resolve: processDeliberationUpdatedEvent
};

/**
 * Type resolver for DeliberationUpdatedEvent union type
 */
export const DeliberationUpdatedEventResolver = {
  __resolveType: (event: DeliberationUpdatedEventType) => {
    if ('picklist' in event) {
      return 'DeliberationPicklistUpdated';
    }
    if ('startTime' in event) {
      return 'DeliberationStarted';
    }
    return null;
  }
};
