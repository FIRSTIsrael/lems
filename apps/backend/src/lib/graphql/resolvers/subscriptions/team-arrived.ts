import { RedisEventTypes } from '@lems/types/api/lems/redis';
import {
  createSubscriptionIterator,
  SubscriptionResult,
  BaseSubscriptionArgs,
  isGapMarker
} from './base-subscription';

interface TeamEvent {
  teamId: string;
  version: number;
}

/**
 * Resolver function for the teamArrivalUpdated subscription field
 */
const teamArrivalUpdatedSubscribe = (
  _root: unknown,
  args: BaseSubscriptionArgs & Record<string, unknown>
) => {
  const divisionId = args.divisionId as string;

  if (!divisionId) {
    const errorMsg = 'divisionId is required for teamArrivalUpdated subscription';
    throw new Error(errorMsg);
  }

  const lastSeenVersion = (args.lastSeenVersion as number) || 0;
  return createSubscriptionIterator(divisionId, RedisEventTypes.TEAM_ARRIVED, lastSeenVersion);
};

/**
 * Transforms raw Redis events into minimal TeamEvent objects
 */
const processTeamArrivalEvent = async (
  event: Record<string, unknown>
): Promise<SubscriptionResult<TeamEvent>> => {
  // Check for gap marker (recovery buffer exceeded)
  if (isGapMarker(event.data)) {
    console.warn('[TeamArrival] Recovery gap detected - client should refetch');
    return event.data;
  }

  const teamId = ((event.data as Record<string, unknown>).teamId as string) || '';

  if (!teamId) {
    return null;
  }

  const result: TeamEvent = {
    teamId,
    version: (event.version as number) ?? 0
  };

  return result;
};

/**
 * Subscription resolver object for teamArrivalUpdated
 * GraphQL subscriptions require a subscribe function
 */
export const teamArrivalUpdatedResolver = {
  subscribe: teamArrivalUpdatedSubscribe,
  resolve: async (event: Record<string, unknown>): Promise<SubscriptionResult<TeamEvent>> => {
    return processTeamArrivalEvent(event);
  }
};
