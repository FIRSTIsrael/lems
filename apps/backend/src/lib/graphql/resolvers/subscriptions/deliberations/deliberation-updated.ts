import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';

interface DeliberationUpdatedSubscribeArgs {
  divisionId: string;
}

type DeliberationUpdatedEvent =
  | {
      deliberationId: string;
      picklist: string[];
    }
  | {
      deliberationId: string;
      startTime: string;
    }
  | {
      deliberationId: string;
      completed: boolean;
    };

const processDeliberationUpdatedEvent = async (
  event: Record<string, unknown>
): Promise<DeliberationUpdatedEvent | null> => {
  const eventData = event.data as Record<string, unknown>;
  const deliberationId = (eventData.deliberationId as string) || '';

  if (!deliberationId) {
    return null;
  }

  // Handle DeliberationPicklistUpdated events
  if ('picklist' in eventData) {
    const picklist = (eventData.picklist as string[]) || [];
    return picklist.length > 0
      ? {
          deliberationId,
          picklist
        }
      : {
          deliberationId,
          picklist: []
        };
  }

  // Handle DeliberationStarted events
  if ('startTime' in eventData) {
    const startTime = eventData.startTime as string;
    return startTime
      ? {
          deliberationId,
          startTime
        }
      : null;
  }

  // Handle DeliberationCompleted events
  if ('completed' in eventData) {
    const completed = eventData.completed as boolean;
    return {
      deliberationId,
      completed
    };
  }

  return null;
};

const deliberationUpdatedSubscribe = (
  _root: unknown,
  { divisionId }: DeliberationUpdatedSubscribeArgs
) => {
  if (!divisionId) throw new Error('divisionId is required');
  const pubSub = getRedisPubSub();
  return pubSub.asyncIterator(divisionId, RedisEventTypes.DELIBERATION_UPDATED);
};

export const deliberationUpdatedResolver = {
  subscribe: deliberationUpdatedSubscribe,
  resolve: processDeliberationUpdatedEvent
};

/**
 * Type resolver for DeliberationUpdatedEvent union type
 */
export const DeliberationUpdatedEventResolver = {
  __resolveType: (event: DeliberationUpdatedEvent) => {
    if ('picklist' in event) {
      return 'DeliberationPicklistUpdated';
    }
    if ('startTime' in event) {
      return 'DeliberationStarted';
    }
    if ('completed' in event) {
      return 'DeliberationCompleted';
    }
    return null;
  }
};
