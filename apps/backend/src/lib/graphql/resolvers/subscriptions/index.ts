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
  matchEndgameTriggeredResolver,
  matchCompletedResolver,
  matchAbortedResolver
} from './matches';
import { rubricUpdatedResolver, rubricStatusChangedResolver } from './rubrics';
import { scoresheetUpdatedResolver } from './scoresheet/scoresheet-updated';
import { scoresheetStatusChangedResolver } from './scoresheet/scoresheet-status-changed';
import {
  audienceDisplaySettingUpdatedResolver,
  audienceDisplaySwitchedResolver
} from './audience-display';

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
  matchEndgameTriggered: matchEndgameTriggeredResolver,
  matchCompleted: matchCompletedResolver,
  matchAborted: matchAbortedResolver,
  audienceDisplaySwitched: audienceDisplaySwitchedResolver,
  audienceDisplaySettingUpdated: audienceDisplaySettingUpdatedResolver,
  rubricUpdated: rubricUpdatedResolver,
  rubricStatusChanged: rubricStatusChangedResolver,
  scoresheetUpdated: scoresheetUpdatedResolver,
  scoresheetStatusChanged: scoresheetStatusChangedResolver
};
