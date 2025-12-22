import { RedisEventTypes } from '@lems/types/api/lems/redis';
import {
  createSubscriptionIterator,
  SubscriptionResult,
  BaseSubscriptionArgs,
  isGapMarker
} from '../base-subscription';
import { extractEventBase } from './utils';

type DeliberationStatusChangedEvent = {
  deliberationId: string;
  status: string;
  version: number;
};

async function processDeliberationStatusChangedEvent(
  event: Record<string, unknown>
): Promise<SubscriptionResult<DeliberationStatusChangedEvent>> {
  if (isGapMarker(event.data)) {
    return event.data;
  }

  const { eventData, deliberationId, version } = extractEventBase(event);
  const status = (eventData.status as string) || '';

  return deliberationId && status ? { deliberationId, status, version } : null;
}

export const deliberationStatusChangedResolver = {
  subscribe: (_root: unknown, args: BaseSubscriptionArgs & Record<string, unknown>) => {
    const divisionId = args.divisionId as string;
    if (!divisionId) throw new Error('divisionId is required');
    return createSubscriptionIterator(
      divisionId,
      RedisEventTypes.DELIBERATION_STATUS_CHANGED,
      (args.lastSeenVersion as number) || 0
    );
  },
  resolve: processDeliberationStatusChangedEvent
};
