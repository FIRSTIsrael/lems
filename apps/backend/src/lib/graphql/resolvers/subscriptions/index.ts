import { teamArrivalUpdatedResolver } from './team-arrived';
import {
  judgingSessionAbortedResolver,
  judgingSessionStartedResolver,
  judgingSessionCompletedResolver
} from './judging-sessions';
import { rubricUpdatedResolver, rubricStatusChangedResolver } from './rubrics';

/**
 * GraphQL Subscription resolvers
 * Each resolver must return an AsyncGenerator
 */
export const subscriptionResolvers = {
  teamArrivalUpdated: teamArrivalUpdatedResolver,
  judgingSessionStarted: judgingSessionStartedResolver,
  judgingSessionAborted: judgingSessionAbortedResolver,
  judgingSessionCompleted: judgingSessionCompletedResolver,
  rubricUpdated: rubricUpdatedResolver,
  rubricStatusChanged: rubricStatusChangedResolver
};
