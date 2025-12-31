import { gql } from '@apollo/client';

/**
 * Subscribe to match lifecycle events
 */
export const MATCH_LOADED_SUBSCRIPTION = gql`
  subscription MatchLoaded($divisionId: String!) {
    matchLoaded(divisionId: $divisionId) {
      matchId
    }
  }
`;

export const MATCH_STARTED_SUBSCRIPTION = gql`
  subscription MatchStarted($divisionId: String!) {
    matchStarted(divisionId: $divisionId) {
      matchId
      startTime
      startDelta
    }
  }
`;

export const MATCH_COMPLETED_SUBSCRIPTION = gql`
  subscription MatchCompleted($divisionId: String!) {
    matchCompleted(divisionId: $divisionId) {
      matchId
      autoLoadedMatchId
    }
  }
`;

export const MATCH_ABORTED_SUBSCRIPTION = gql`
  subscription MatchAborted($divisionId: String!) {
    matchAborted(divisionId: $divisionId) {
      matchId
    }
  }
`;

export const PARTICIPANT_STATUS_UPDATED_SUBSCRIPTION = gql`
  subscription ParticipantStatusUpdated($divisionId: String!) {
    participantStatusUpdated(divisionId: $divisionId) {
      participantId
      present
      ready
    }
  }
`;

/**
 * Subscribe to judging session events
 */
export const JUDGING_STARTED_SUBSCRIPTION = gql`
  subscription JudgingStarted($divisionId: String!) {
    judgingStarted(divisionId: $divisionId) {
      sessionId
      startTime
      startDelta
    }
  }
`;

export const JUDGING_COMPLETED_SUBSCRIPTION = gql`
  subscription JudgingCompleted($divisionId: String!) {
    judgingCompleted(divisionId: $divisionId) {
      sessionId
    }
  }
`;

export const JUDGING_ABORTED_SUBSCRIPTION = gql`
  subscription JudgingAborted($divisionId: String!) {
    judgingAborted(divisionId: $divisionId) {
      sessionId
    }
  }
`;
