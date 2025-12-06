import { teamArrivalUpdatedResolver } from './team-arrived';
import {
  judgingSessionAbortedResolver,
  judgingSessionStartedResolver,
  judgingSessionCompletedResolver
} from './judging-sessions';
import { matchLoadedResolver, matchStartedResolver, matchStageAdvancedResolver } from './matches';
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
  matchLoaded: matchLoadedResolver,
  matchStarted: matchStartedResolver,
  matchStageAdvanced: matchStageAdvancedResolver,
  rubricUpdated: rubricUpdatedResolver,
  rubricStatusChanged: rubricStatusChangedResolver
};
