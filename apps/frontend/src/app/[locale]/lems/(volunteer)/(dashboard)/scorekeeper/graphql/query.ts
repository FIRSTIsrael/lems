import { gql, TypedDocumentNode } from '@apollo/client';
import type { ScorekeeperData, ScorekeeperVars } from './types';

export const GET_SCOREKEEPER_DATA: TypedDocumentNode<ScorekeeperData, ScorekeeperVars> = gql`
  query GetScorekeeperData($divisionId: String!) {
    division(id: $divisionId) {
      id
      field {
        divisionId
        matches {
          id
          slug
          stage
          round
          number
          scheduledTime
          startTime
          status
          participants {
            id
            team {
              id
              name
              number
              affiliation
              city
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
        audienceDisplay {
          activeDisplay
          settings
        }
        currentStage
        loadedMatch
        activeMatch
        matchLength
        judging {
          awards {
            id
            name
            index
            place
            type
            isOptional
            winner {
              ... on TeamWinner {
                id
                name
                number
                affiliation {
                  id
                  name
                  city
                }
              }
              ... on PersonalWinner {
                id
                name
                team {
                  id
                  number
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;

export function parseScorekeeperData(data: ScorekeeperData) {
  return data.division.field;
}
