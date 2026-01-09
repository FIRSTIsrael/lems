import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';

interface FinalDeliberationUpdatedArgs {
  divisionId: string;
}

interface FinalDeliberationUpdatedEvent {
  divisionId: string;
  status?: string;
  stage?: string;
  startTime?: string | Date;
  completionTime?: string | Date;
  awards?: Record<string, unknown>;
  stageData?: Record<string, unknown>;
}

const processFinalDeliberationUpdatedEvent = async (
  event: Record<string, unknown>
): Promise<FinalDeliberationUpdatedEvent | null> => {
  const eventData = event.data;
  return eventData as FinalDeliberationUpdatedEvent;
};

const finalDeliberationUpdatedSubscribe = (
  _root: unknown,
  { divisionId }: FinalDeliberationUpdatedArgs
) => {
  if (!divisionId) throw new Error('divisionId is required');
  const pubSub = getRedisPubSub();
  return pubSub.asyncIterator(divisionId, RedisEventTypes.FINAL_DELIBERATION_UPDATED);
};

export const finalDeliberationUpdatedResolver = {
  subscribe: finalDeliberationUpdatedSubscribe,
  resolve: processFinalDeliberationUpdatedEvent
};

/**
 * Event resolver for FinalDeliberationUpdatedEvent type
 * Transforms the Redis event payload into the GraphQL response shape
 */
export const FinalDeliberationUpdatedEventResolver = {
  divisionId: (event: FinalDeliberationUpdatedEvent) => event.divisionId,
  status: (event: FinalDeliberationUpdatedEvent) => event.status || null,
  stage: (event: FinalDeliberationUpdatedEvent) => event.stage || null,
  startTime: (event: FinalDeliberationUpdatedEvent) => event.startTime || null,
  completionTime: (event: FinalDeliberationUpdatedEvent) => event.completionTime || null,
  awards: (event: FinalDeliberationUpdatedEvent) =>
    event.awards ? JSON.stringify(event.awards) : null,
  stageData: (event: FinalDeliberationUpdatedEvent) =>
    event.stageData ? JSON.stringify(event.stageData) : null
};
