/**
 * Notification types for LEMS Redis Pub/Sub system
 * Every notification must be added here to be considered valid
 */
export enum RedisEventTypes {
  TEAM_ARRIVED = 'teamArrived',
  JUDGING_SESSION_STARTED = 'judgingSessionStarted',
  JUDGING_SESSION_ABORTED = 'judgingSessionAborted',
  JUDGING_SESSION_COMPLETED = 'judgingSessionCompleted',
  MATCH_LOADED = 'matchLoaded',
  MATCH_STARTED = 'matchStarted',
  MATCH_STAGE_ADVANCED = 'matchStageAdvanced',
  MATCH_COMPLETED = 'matchCompleted',
  RUBRIC_UPDATED = 'rubricUpdated',
  RUBRIC_STATUS_CHANGED = 'rubricStatusChanged'
}
