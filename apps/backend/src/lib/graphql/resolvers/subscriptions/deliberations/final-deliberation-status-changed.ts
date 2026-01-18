import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';

interface FinalDeliberationStatusChangedArgs {
  divisionId: string;
}

interface FinalDeliberationStatusChangedEvent {
  divisionId: string;
  status: string;
  stage: string;
}

const processFinalDeliberationStatusChangedEvent = async (
  event: Record<string, unknown>
): Promise<FinalDeliberationStatusChangedEvent | null> => {
  const eventData = event.data;
  return eventData as FinalDeliberationStatusChangedEvent;
};

const finalDeliberationStatusChangedSubscribe = (
  _root: unknown,
  { divisionId }: FinalDeliberationStatusChangedArgs
) => {
  if (!divisionId) throw new Error('divisionId is required');
  const pubSub = getRedisPubSub();
  return pubSub.asyncIterator(divisionId, RedisEventTypes.FINAL_DELIBERATION_STATUS_CHANGED);
};

export const finalDeliberationStatusChangedResolver = {
  subscribe: finalDeliberationStatusChangedSubscribe,
  resolve: processFinalDeliberationStatusChangedEvent
};

/**
 * Event resolver for FinalDeliberationStatusChangedEvent type
 * Transforms the Redis event payload into the GraphQL response shape
 */
export const FinalDeliberationStatusChangedEventResolver = {
  divisionId: (event: FinalDeliberationStatusChangedEvent) => event.divisionId,
  status: (event: FinalDeliberationStatusChangedEvent) => event.status,
  stage: (event: FinalDeliberationStatusChangedEvent) => event.stage
};
