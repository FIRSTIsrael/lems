import { teamArrivalUpdatedResolver } from './team-arrived';
import {
  judgingSessionAbortedResolver,
  judgingSessionStartedResolver,
  judgingSessionCompletedResolver
} from './judging-sessions';
import {
  matchLoadedResolver,
  matchStartedResolver,
  matchStageAdvancedResolver,
  matchCompletedResolver,
  matchAbortedResolver
} from './matches';
import { rubricUpdatedResolver, rubricStatusChangedResolver } from './rubrics';
import { scoresheetUpdatedResolver } from './scoresheet/scoresheet-updated';
import { scoresheetStatusChangedResolver } from './scoresheet/scoresheet-status-changed';

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
  matchCompleted: matchCompletedResolver,
  matchAborted: matchAbortedResolver,
  rubricUpdated: rubricUpdatedResolver,
  rubricStatusChanged: rubricStatusChangedResolver,
  scoresheetUpdated: scoresheetUpdatedResolver,
  scoresheetStatusChanged: scoresheetStatusChangedResolver
};
