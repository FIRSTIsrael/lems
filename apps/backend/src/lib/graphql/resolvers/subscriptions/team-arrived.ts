import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisPubSub } from '../../../redis/redis-pubsub';

interface TeamArrivalEvent {
  teamId: string;
  arrived: boolean;
}

interface TeamArrivalUpdatedSubscribeArgs {
  divisionId: string;
}

/**
 * Resolver function for the teamArrivalUpdated subscription field
 */
const teamArrivalUpdatedSubscribe = (
  _root: unknown,
  { divisionId }: TeamArrivalUpdatedSubscribeArgs
) => {
  if (!divisionId) throw new Error('divisionId is required');
  const pubSub = getRedisPubSub();
  return pubSub.asyncIterator(divisionId, RedisEventTypes.TEAM_ARRIVED);
};

/**
 * Transforms raw Redis events into TeamArrivalEvent objects
 */
const processTeamArrivalEvent = async (
  event: Record<string, unknown>
): Promise<TeamArrivalEvent | null> => {
  const data = event.data as Record<string, unknown>;
  const teamId = (data.teamId as string) || '';

  if (!teamId) {
    return null;
  }

  const result: TeamArrivalEvent = {
    teamId,
    arrived: data.arrived !== false
  };

  return result;
};

/**
 * Subscription resolver object for teamArrivalUpdated
 * GraphQL subscriptions require a subscribe function
 */
export const teamArrivalUpdatedResolver = {
  subscribe: teamArrivalUpdatedSubscribe,
  resolve: processTeamArrivalEvent
};
