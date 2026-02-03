import { gql } from '@apollo/client';

export const UPDATE_JUDGING_SESSION_MUTATION = gql`
  mutation UpdateJudgingSession(
    $divisionId: String!
    $sessionId: String!
    $called: Boolean
    $queued: Boolean
  ) {
    updateJudgingSession(
      divisionId: $divisionId
      sessionId: $sessionId
      called: $called
      queued: $queued
    ) {
      id
      called
      queued
    }
  }
`;
