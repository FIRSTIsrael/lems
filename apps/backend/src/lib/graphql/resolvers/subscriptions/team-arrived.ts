import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisPubSub } from '../../../redis/redis-pubsub';
import type { GraphQLContext } from '../../apollo-server';
import { requireAuthAndDivisionAccess } from '../../utils/auth-helpers';

interface TeamEvent {
  teamId: string;
}

interface TeamArrivalUpdatedSubscribeArgs {
  divisionId: string;
}

/**
 * Resolver function for the teamArrivalUpdated subscription field
 */
const teamArrivalUpdatedSubscribe = (
  _root: unknown,
  { divisionId }: TeamArrivalUpdatedSubscribeArgs,
  context: GraphQLContext
) => {
  if (!divisionId) throw new Error('divisionId is required');
  // Require authentication and division access (any role)
  requireAuthAndDivisionAccess(context.user, divisionId);
  const pubSub = getRedisPubSub();
  return pubSub.asyncIterator(divisionId, RedisEventTypes.TEAM_ARRIVED);
};

/**
 * Transforms raw Redis events into minimal TeamEvent objects
 */
const processTeamArrivalEvent = async (
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
 * Subscription resolver object for teamArrivalUpdated
 * GraphQL subscriptions require a subscribe function
 */
export const teamArrivalUpdatedResolver = {
  subscribe: teamArrivalUpdatedSubscribe,
  resolve: processTeamArrivalEvent
};
