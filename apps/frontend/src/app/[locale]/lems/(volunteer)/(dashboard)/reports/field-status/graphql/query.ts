import { gql, TypedDocumentNode } from '@apollo/client';
import type { FieldStatusData, FieldStatusVars } from './types';

export const GET_FIELD_STATUS_DATA: TypedDocumentNode<FieldStatusData, FieldStatusVars> = gql`
  query GetFieldStatusData($divisionId: String!) {
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
              arrived
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
    }
  }
`;

export function parseFieldStatusData(data: FieldStatusData) {
  const { field, ...division } = data.division;
  return {
    division,
    field,
    tables: division.tables
  };
}
