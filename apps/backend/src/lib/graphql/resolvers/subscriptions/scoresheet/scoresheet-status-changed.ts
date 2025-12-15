import { RedisEventTypes } from '@lems/types/api/lems/redis';
import {
  createSubscriptionIterator,
  SubscriptionResult,
  BaseSubscriptionArgs,
  isGapMarker
} from '../base-subscription';
import { extractEventBase } from './utils';

type ScoresheetStatusUpdatedEvent = {
  scoresheetId: string;
  status: string;
  version: number;
};

async function processScoresheetStatusChangedEvent(
  event: Record<string, unknown>
): Promise<SubscriptionResult<ScoresheetStatusUpdatedEvent>> {
  if (isGapMarker(event.data)) {
    return event.data;
  }

  const { eventData, scoresheetId, version } = extractEventBase(event);
  const status = (eventData.status as string) || '';

  return scoresheetId && status ? { scoresheetId, status, version } : null;
}

export const scoresheetStatusChangedResolver = {
  subscribe: (_root: unknown, args: BaseSubscriptionArgs & Record<string, unknown>) => {
    const divisionId = args.divisionId as string;
    if (!divisionId) throw new Error('divisionId is required');
    return createSubscriptionIterator(
      divisionId,
      RedisEventTypes.SCORESHEET_STATUS_CHANGED,
      (args.lastSeenVersion as number) || 0
    );
  },
  resolve: processScoresheetStatusChangedEvent
};
