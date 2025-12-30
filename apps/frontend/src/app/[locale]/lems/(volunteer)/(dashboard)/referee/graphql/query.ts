import { gql, TypedDocumentNode } from '@apollo/client';
import type { RefereeData, RefereeVars } from './types';

export const GET_REFEREE_DATA: TypedDocumentNode<RefereeData, RefereeVars> = gql`
  query GetRefereeData($divisionId: String!, $tableId: String!) {
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
          participants(tableIds: [$tableId]) {
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
        currentStage
        loadedMatch
        activeMatch
        matchLength
      }
    }
  }
`;

export function parseRefereeData(data: RefereeData) {
  return data.division.field;
}
