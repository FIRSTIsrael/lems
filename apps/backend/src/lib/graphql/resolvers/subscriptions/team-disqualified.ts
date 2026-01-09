import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisPubSub } from '../../../redis/redis-pubsub';

interface TeamEvent {
  teamId: string;
}

interface TeamDisqualifiedSubscribeArgs {
  divisionId: string;
}

/**
 * Resolver function for the teamDisqualified subscription field
 */
const teamDisqualifiedSubscribe = (
  _root: unknown,
  { divisionId }: TeamDisqualifiedSubscribeArgs
) => {
  if (!divisionId) throw new Error('divisionId is required');
  const pubSub = getRedisPubSub();
  return pubSub.asyncIterator(divisionId, RedisEventTypes.TEAM_DISQUALIFIED);
};

/**
 * Transforms raw Redis events into minimal TeamEvent objects
 */
const processTeamDisqualifiedEvent = async (
  event: Record<string, unknown>
): Promise<TeamEvent | null> => {
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
 * Subscription resolver object for teamDisqualified
 * GraphQL subscriptions require a subscribe function
 */
export const teamDisqualifiedResolver = {
  subscribe: teamDisqualifiedSubscribe,
  resolve: processTeamDisqualifiedEvent
};
