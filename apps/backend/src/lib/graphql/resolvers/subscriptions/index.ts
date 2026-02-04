import { teamArrivalUpdatedResolver } from './team-arrived';
import { teamDisqualifiedResolver } from './team-disqualified';
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
  matchAbortedResolver,
  matchUpdatedResolver,
  participantStatusUpdatedResolver
} from './matches';
import { rubricUpdatedResolver, rubricStatusChangedResolver } from './rubrics';
import { scoresheetUpdatedResolver } from './scoresheet/scoresheet-updated';
import { scoresheetStatusChangedResolver } from './scoresheet/scoresheet-status-changed';
import {
  audienceDisplaySettingUpdatedResolver,
  audienceDisplaySwitchedResolver,
  presentationUpdatedResolver
} from './audience-display';
import {
  deliberationUpdatedResolver,
  deliberationStatusChangedResolver,
  finalDeliberationUpdatedResolver,
  finalDeliberationStatusChangedResolver
} from './deliberations';

/**
 * GraphQL Subscription resolvers
 * Each resolver must return an AsyncGenerator
 */
export const subscriptionResolvers = {
  teamArrivalUpdated: teamArrivalUpdatedResolver,
  teamDisqualified: teamDisqualifiedResolver,
  judgingSessionStarted: judgingSessionStartedResolver,
  judgingSessionAborted: judgingSessionAbortedResolver,
  judgingSessionCompleted: judgingSessionCompletedResolver,
  matchLoaded: matchLoadedResolver,
  matchStarted: matchStartedResolver,
  matchStageAdvanced: matchStageAdvancedResolver,
  matchEndgameTriggered: matchEndgameTriggeredResolver,
  matchCompleted: matchCompletedResolver,
  matchAborted: matchAbortedResolver,
  matchUpdated: matchUpdatedResolver,
  participantStatusUpdated: participantStatusUpdatedResolver,
  audienceDisplaySwitched: audienceDisplaySwitchedResolver,
  audienceDisplaySettingUpdated: audienceDisplaySettingUpdatedResolver,
  presentationUpdated: presentationUpdatedResolver,
  rubricUpdated: rubricUpdatedResolver,
  rubricStatusChanged: rubricStatusChangedResolver,
  scoresheetUpdated: scoresheetUpdatedResolver,
  scoresheetStatusChanged: scoresheetStatusChangedResolver,
  deliberationUpdated: deliberationUpdatedResolver,
  deliberationStatusChanged: deliberationStatusChangedResolver,
  finalDeliberationUpdated: finalDeliberationUpdatedResolver,
  finalDeliberationStatusChanged: finalDeliberationStatusChangedResolver
};
