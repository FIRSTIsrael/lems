import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';
import type { GraphQLContext } from '../../../apollo-server';
import { requireAuthDivisionAndRole } from '../../../utils/auth-helpers';

// Allowed roles for accessing scoresheet data
const SCORESHEET_ALLOWED_ROLES = ['referee', 'head-referee'];

interface ScoresheetStatusChangedSubscribeArgs {
  divisionId: string;
}

type ScoresheetStatusUpdatedEvent = {
  scoresheetId: string;
  status: string;
};

async function processScoresheetStatusChangedEvent(
  event: Record<string, unknown>
): Promise<ScoresheetStatusUpdatedEvent | null> {
  const scoresheetId = ((event.data as Record<string, unknown>).scoresheetId as string) || '';
  const status = ((event.data as Record<string, unknown>).status as string) || '';

  return scoresheetId && status ? { scoresheetId, status } : null;
}

export const scoresheetStatusChangedResolver = {
  subscribe: (
    _root: unknown,
    { divisionId }: ScoresheetStatusChangedSubscribeArgs,
    context: GraphQLContext
  ) => {
    if (!divisionId) throw new Error('divisionId is required');
    // Require authentication, division access, and appropriate role for scoresheet data
    requireAuthDivisionAndRole(context.user, divisionId, SCORESHEET_ALLOWED_ROLES);
    const pubSub = getRedisPubSub();
    return pubSub.asyncIterator(divisionId, RedisEventTypes.SCORESHEET_STATUS_CHANGED);
  },
  resolve: processScoresheetStatusChangedEvent
};
