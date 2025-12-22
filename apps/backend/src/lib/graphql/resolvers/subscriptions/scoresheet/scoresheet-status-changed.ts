import { RedisEventTypes } from '@lems/types/api/lems/redis';
import {
  createSubscriptionIterator,
  SubscriptionResult,
  BaseSubscriptionArgs
} from '../base-subscription';
import { extractEventBase } from './utils';

type ScoresheetStatusUpdatedEvent = {
  scoresheetId: string;
  status: string;
};

async function processScoresheetStatusChangedEvent(
  event: Record<string, unknown>
): Promise<SubscriptionResult<ScoresheetStatusUpdatedEvent>> {
  const { eventData, scoresheetId } = extractEventBase(event);
  const status = (eventData.status as string) || '';

  return scoresheetId && status ? { scoresheetId, status } : null;
}

export const scoresheetStatusChangedResolver = {
  subscribe: (_root: unknown, args: BaseSubscriptionArgs & Record<string, unknown>) => {
    const divisionId = args.divisionId as string;
    if (!divisionId) throw new Error('divisionId is required');
    return createSubscriptionIterator(divisionId, RedisEventTypes.SCORESHEET_STATUS_CHANGED);
  },
  resolve: processScoresheetStatusChangedEvent
};
