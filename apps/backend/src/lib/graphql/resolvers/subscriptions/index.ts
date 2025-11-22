import { teamArrivalUpdatedResolver } from './teams';
import { judgingSessionAbortedResolver, judgingSessionStartedResolver } from './judging';

/**
 * GraphQL Subscription resolvers
 * Each resolver must return an AsyncGenerator
 */
export const subscriptionResolvers = {
  teamArrivalUpdated: teamArrivalUpdatedResolver,
  judgingSessionStarted: judgingSessionStartedResolver,
  judgingSessionAborted: judgingSessionAbortedResolver
};
