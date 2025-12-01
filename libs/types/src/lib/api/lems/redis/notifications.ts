/**
 * Notification types for LEMS Redis Pub/Sub system
 * Every notification must be added here to be considered valid
 */
export enum RedisEventTypes {
  TEAM_ARRIVED = 'teamArrived',
  JUDGING_SESSION_STARTED = 'judgingSessionStarted',
  JUDGING_SESSION_ABORTED = 'judgingSessionAborted',
  JUDGING_SESSION_COMPLETED = 'judgingSessionCompleted',
  RUBRIC_UPDATED = 'rubricUpdated',
  RUBRIC_STATUS_CHANGED = 'rubricStatusChanged'
}
