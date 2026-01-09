import { gql, TypedDocumentNode } from '@apollo/client';
import type { HeadRefereeData, HeadRefereeVars } from './types';

export const GET_HEAD_REFEREE_DATA: TypedDocumentNode<HeadRefereeData, HeadRefereeVars> = gql`
  query GetHeadRefereeData($divisionId: String!) {
    division(id: $divisionId) {
      id
      field {
        divisionId
        loadedMatch
        matches {
          id
          slug
          stage
          round
          number
          scheduledTime
          status
          participants {
            id
            team {
              id
              number
              name
              slug
              arrived
            }
            table {
              id
              name
            }
            queued
            present
            ready
          }
        }
        scoresheets {
          id
          slug
          stage
          round
          status
          escalated
          team {
            id
            number
            name
            slug
          }
          data {
            score
            gp {
              value
            }
          }
        }
      }
      tables {
        id
        name
      }
    }
  }
`;

export function parseHeadRefereeData(data: HeadRefereeData) {
  return data.division.field;
}
