import { RedisEventTypes } from '@lems/types/api/lems/redis';
import {
  createSubscriptionIterator,
  SubscriptionResult,
  BaseSubscriptionArgs
} from './base-subscription';

interface TeamEvent {
  teamId: string;
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

  return createSubscriptionIterator(divisionId, RedisEventTypes.TEAM_ARRIVED);
};

/**
 * Transforms raw Redis events into minimal TeamEvent objects
 */
const processTeamArrivalEvent = async (
  event: Record<string, unknown>
): Promise<SubscriptionResult<TeamEvent>> => {
  const teamId = ((event.data as Record<string, unknown>).teamId as string) || '';

  if (!teamId) {
    return null;
  }

  const result: TeamEvent = {
    teamId
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
