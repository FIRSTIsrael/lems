import { gql, TypedDocumentNode } from '@apollo/client';
import type { ScorekeeperData, ScorekeeperVars } from './types';

export const GET_SCOREKEEPER_DATA: TypedDocumentNode<ScorekeeperData, ScorekeeperVars> = gql`
  query GetScorekeeperData($divisionId: String!) {
    division(id: $divisionId) {
      id
      field {
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
        currentStage
        loadedMatch
        activeMatch
        matchLength
      }
    }
  }
`;

export function parseScorekeeperData(data: ScorekeeperData) {
  return data.division.field;
}
