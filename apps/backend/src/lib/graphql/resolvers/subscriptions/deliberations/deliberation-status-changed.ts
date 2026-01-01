import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';

interface DeliberationStatusChangedSubscribeArgs {
  divisionId: string;
}

interface DeliberationStatusChangedEvent {
  deliberationId: string;
  status: string;
}

const processDeliberationStatusChangedEvent = async (
  event: Record<string, unknown>
): Promise<DeliberationStatusChangedEvent | null> => {
  const eventData = event.data as Record<string, unknown>;
  const deliberationId = (eventData.deliberationId as string) || '';
  const status = (eventData.status as string) || '';

  return deliberationId && status ? { deliberationId, status } : null;
};

const deliberationStatusChangedSubscribe = (
  _root: unknown,
  { divisionId }: DeliberationStatusChangedSubscribeArgs
) => {
  if (!divisionId) throw new Error('divisionId is required');
  const pubSub = getRedisPubSub();
  return pubSub.asyncIterator(divisionId, RedisEventTypes.DELIBERATION_STATUS_CHANGED);
};

export const deliberationStatusChangedResolver = {
  subscribe: deliberationStatusChangedSubscribe,
  resolve: processDeliberationStatusChangedEvent
};
