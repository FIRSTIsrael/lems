import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisPubSub } from '../../../redis/redis-pubsub';

interface TeamEvent {
  teamId: string;
}

interface TeamNotArrivedSubscribeArgs {
  divisionId: string;
}

/**
 * Resolver function for the teamNotArrived subscription field
 */
const teamNotArrivedSubscribe = (_root: unknown, { divisionId }: TeamNotArrivedSubscribeArgs) => {
  if (!divisionId) throw new Error('divisionId is required');
  const pubSub = getRedisPubSub();
  return pubSub.asyncIterator(divisionId, RedisEventTypes.TEAM_NOT_ARRIVED);
};

/**
 * Transforms raw Redis events into minimal TeamEvent objects
 */
const processTeamNotArrivedEvent = async (
  event: Record<string, unknown>
): Promise<TeamEvent | null> => {
  const teamId = ((event.data as Record<string, unknown>).teamId as string) || '';

  if (!teamId) {
    return null;
  }

  return { teamId };
};

/**
 * Subscription resolver object for teamNotArrived
 * GraphQL subscriptions require a subscribe function
 */
export const teamNotArrivedResolver = {
  subscribe: teamNotArrivedSubscribe,
  resolve: processTeamNotArrivedEvent
};
