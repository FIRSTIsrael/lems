import { gql, type TypedDocumentNode } from '@apollo/client';
import type { QueryData, QueryVars } from './types';

export const GET_FIELD_TIMER_DATA: TypedDocumentNode<QueryData, QueryVars> = gql`
  query GetFieldTimerData($divisionId: String!) {
    division(id: $divisionId) {
      id
      field {
        divisionId
        activeMatch
        matchLength
        matches {
          id
          slug
          stage
          round
          number
          scheduledTime
          status
          startTime
          startDelta
        }
      }
    }
  }
`;

export function parseFieldTimerData(data: QueryData) {
  if (!data.division?.field) {
    return null;
  }

  const { field } = data.division;

  return {
    matches: field.matches,
    activeMatch: field.activeMatch,
    matchLength: field.matchLength
  };
}
