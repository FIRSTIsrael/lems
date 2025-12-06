import { RedisEventTypes } from '@lems/types/api/lems/redis';
import {
  createSubscriptionIterator,
  SubscriptionResult,
  BaseSubscriptionArgs,
  isGapMarker
} from '../base-subscription';
import { extractEventBase } from './utils';

type RubricStatusUpdatedEvent = {
  rubricId: string;
  status: string;
  version: number;
};

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
