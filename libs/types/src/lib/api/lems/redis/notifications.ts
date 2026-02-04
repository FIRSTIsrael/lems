/**
 * Notification types for LEMS Redis Pub/Sub system
 * Every notification must be added here to be considered valid
 */
export enum RedisEventTypes {
  TEAM_ARRIVED = 'teamArrived',
  TEAM_DISQUALIFIED = 'teamDisqualified',
  JUDGING_SESSION_STARTED = 'judgingSessionStarted',
  JUDGING_SESSION_ABORTED = 'judgingSessionAborted',
  JUDGING_SESSION_COMPLETED = 'judgingSessionCompleted',
  MATCH_LOADED = 'matchLoaded',
  MATCH_STARTED = 'matchStarted',
  MATCH_STAGE_ADVANCED = 'matchStageAdvanced',
  MATCH_ENDGAME_TRIGGERED = 'matchEndgameTriggered',
  MATCH_COMPLETED = 'matchCompleted',
  MATCH_ABORTED = 'matchAborted',
  AUDIENCE_DISPLAY_SWITCHED = 'audienceDisplaySwitched',
  AUDIENCE_DISPLAY_SETTING_UPDATED = 'audienceDisplaySettingUpdated',
  AWARDS_PRESENTATION_UPDATED = 'awardsPresentationUpdated',
  PARTICIPANT_STATUS_UPDATED = 'participantStatusUpdated',
  MATCH_UPDATED = 'matchUpdated',
  RUBRIC_UPDATED = 'rubricUpdated',
  RUBRIC_STATUS_CHANGED = 'rubricStatusChanged',
  SCORESHEET_UPDATED = 'scoresheetUpdated',
  SCORESHEET_STATUS_CHANGED = 'scoresheetStatusChanged',
  DELIBERATION_UPDATED = 'deliberationUpdated',
  DELIBERATION_STATUS_CHANGED = 'deliberationStatusChanged',
  FINAL_DELIBERATION_UPDATED = 'finalDeliberationUpdated',
  FINAL_DELIBERATION_STATUS_CHANGED = 'finalDeliberationStatusChanged'
}
