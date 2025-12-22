import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';

interface RubricStatusChangedSubscribeArgs {
  divisionId: string;
}

type RubricStatusUpdatedEvent = {
  rubricId: string;
  status: string;
};

async function processRubricStatusChangedEvent(
  event: Record<string, unknown>
): Promise<RubricStatusUpdatedEvent | null> {
  const eventData = event.data as Record<string, unknown>;
  const rubricId = (eventData.rubricId as string) || '';
  const status = (eventData.status as string) || '';

  return rubricId && status ? { rubricId, status } : null;
}

export const rubricStatusChangedResolver = {
  subscribe: (_root: unknown, { divisionId }: RubricStatusChangedSubscribeArgs) => {
    if (!divisionId) throw new Error('divisionId is required');
    const pubSub = getRedisPubSub();
    return pubSub.asyncIterator(divisionId, RedisEventTypes.RUBRIC_STATUS_CHANGED);
  },
  resolve: processRubricStatusChangedEvent
};
