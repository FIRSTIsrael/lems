import { gql } from '@apollo/client';

/**
 * Main query for field status report
 * Fetches all necessary data for the field status page
 */
export const FIELD_STATUS_QUERY = gql`
  query FieldStatus($divisionId: String!) {
    division(id: $divisionId) {
      id
      name
      color
      tables {
        id
        name
      }
      field {
        divisionId
        matchLength
        loadedMatch
        activeMatch
        currentStage
        matches {
          id
          slug
          stage
          round
          number
          scheduledTime
          status
          called
          startTime
          startDelta
          participants {
            id
            team {
              id
              number
              name
            }
            table {
              id
              name
            }
            queued
            present
            ready
            matchId
          }
        }
      }
      judging {
        divisionId
        sessionLength
        sessions {
          id
          number
          scheduledTime
          status
          called
          team {
            id
            number
            name
          }
          room {
            id
            name
          }
          startTime
          startDelta
        }
      }
    }
  }
`;

/**
 * Lightweight query for upcoming matches
 */
export const UPCOMING_MATCHES_QUERY = gql`
  query UpcomingMatches($divisionId: String!) {
    division(id: $divisionId) {
      id
      field {
        matches {
          id
          number
          slug
          scheduledTime
          status
          participants {
            team {
              id
              number
              name
            }
            table {
              id
              name
            }
          }
        }
      }
    }
  }
`;
