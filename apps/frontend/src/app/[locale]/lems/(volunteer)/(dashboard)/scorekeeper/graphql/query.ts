import { gql, TypedDocumentNode } from '@apollo/client';
import type { ScorekeeperData, ScorekeeperVars } from './types';

export const GET_SCOREKEEPER_DATA: TypedDocumentNode<ScorekeeperData, ScorekeeperVars> = gql`
  query GetScorekeeperData($divisionId: String!) {
    division(id: $divisionId) {
      id
      awardsAssigned
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
          awardsPresentation {
            slideIndex
            stepIndex
          }
          settings
        }
        currentStage
        loadedMatch
        activeMatch
        matchLength
      }
      judging {
        divisionId
        awards {
          id
          name
          index
          place
          type
          isOptional
          winner {
            ... on TeamWinner {
              team {
                id
                name
                number
                city
                affiliation
              }
            }
            ... on PersonalWinner {
              name
            }
          }
        }
      }
    }
  }
`;

export function parseScorekeeperData(data: ScorekeeperData) {
  return data.division;
}
